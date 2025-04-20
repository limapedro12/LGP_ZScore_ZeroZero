<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['get', 'reset', 'adjust', 'start', 'pause', 'status', 'gameStatus'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$sport = $params['sport'] ?? null;
$action = $params['action'] ?? null;
$team = $params['team'] ?? null;

if ((($action === 'adjust') || ($action === 'start')) && empty($team)) {
    echo json_encode(["error" => "Team parameter is required for adjust action"]);
    exit;
}

if (!empty($team) && !in_array($team, ['home', 'away'])) {
    echo json_encode(["error" => "Team parameter must be 'home' or 'away'"]);
    exit;
} else if (!empty($team)) {
    $team = strtolower($team);
}

$redis = RedistUtils::connect();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {

    $keys = RequestUtils::getRedisKeys($placardId, 'timeout');

    //-TIMEOUT EVENTS VARIABLES --------------------------//
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($sport);
    $totalTimeoutsPerTeam = $gameConfig['timeoutsPerTeam'];
    $gameTimeoutsKey = $keys['game_timeouts'];
    $eventCounterKey = $keys['event_counter'];
    $homeTimeoutsUsedKey = $keys['home_timeouts_used'];
    $awayTimeoutsUsedKey = $keys['away_timeouts_used'];

    $timeoutDuration = $gameConfig['timeoutDuration']?? null;

    if (empty($timeoutDuration)) {
        $response = ["error" => "Timeout duration not set in game configuration"];
        echo json_encode($response);
        exit;
    }

    $startTimeKey = $keys['start_time'];
    $remainingTimeKey = $keys['remaining_time'];
    $statusKey = $keys['status'];
    $activeTeamKey = $keys['team'];

    $pipeline = $redis->pipeline();
    $pipeline->get($statusKey);
    $pipeline->get($startTimeKey);
    $pipeline->get($remainingTimeKey);
    $pipeline->get($activeTeamKey);
    $pipeline->get($homeTimeoutsUsedKey);
    $pipeline->get($awayTimeoutsUsedKey);
    $results = $pipeline->exec();
    
    $status = $results[0] ?: 'inactive';
    $startTime = (int)($results[1] ?: 0);
    $storedRemainingTime = (int)($results[2] ?: 0);
    $activeTeam = $results[3] ?: null;
    $homeTimeoutsUsed = intval($results[4] ?: 0);
    $awayTimeoutsUsed = intval($results[5] ?: 0);

    //---------------------------------------------//


    function createTimeoutEvent($homeTimeoutsUsed, $awayTimeoutsUsed, $team = null) {
        global $redis, $keys, $placardId, $totalTimeoutsPerTeam;

        $eventId = $redis->incr($keys['event_counter']);
        $timeoutEventKeys = $keys['timeout_event'] . $eventId;
        $gameTimePosition = RequestUtils::getGameTimePosition($placardId);

        
        $timeoutData = [
            'eventId' => $eventId,
            'placardId' => $placardId,
            'team' => $team,
            'teamTimeoutsUsed' => $team === 'home' ? $homeTimeoutsUsed : $awayTimeoutsUsed,
            'timeSpan' => $gameTimePosition
        ];
        
        $redis->multi();
        $redis->set($keys['home_timeouts_used'], $homeTimeoutsUsed);
        $redis->set($keys['away_timeouts_used'], $awayTimeoutsUsed);
        $redis->hMSet($timeoutEventKeys, $timeoutData);
        $redis->zAdd($keys['game_timeouts'], $gameTimePosition, $timeoutEventKeys);
        $result = $redis->exec();
        
        if ($result) {
            return [
                "success" => true,
                "message" => "Timeout event added successfully",
                "event" => $timeoutData
            ];
        } else {
            return [
                "success" => false,
                "error" => "Failed to add timeout event"
            ];
        }
    }

    function checkTimeoutsLimit($team, $amount = 1) {
        global $redis, $homeTimeoutsUsed, $awayTimeoutsUsed, $totalTimeoutsPerTeam;
        
        $timeoutsUsed = $team === 'home' ? $homeTimeoutsUsed : $awayTimeoutsUsed;
        return ($timeoutsUsed + $amount) <= $totalTimeoutsPerTeam;
    }

    function updateTeamTimeouts($team) {
        global $redis, $homeTimeoutsUsed, $awayTimeoutsUsed, $totalTimeoutsPerTeam;
        
        if ($team === 'home') {
            $homeTimeoutsUsed++;
        } else {
            $awayTimeoutsUsed++;
        }
        
        return [
            'success' => true,
            'homeTimeouts' => $homeTimeoutsUsed,
            'awayTimeouts' => $awayTimeoutsUsed
        ];
    }

    function countTeamTimeoutEvents($team) {
        global $redis, $keys;
        
        $count = 0;
        $allEventKeys = $redis->zRange($keys['game_timeouts'], 0, -1);
        
        foreach ($allEventKeys as $eventKey) {
            $eventTeam = $redis->hGet($eventKey, 'team');
            if ($eventTeam === $team) {
                $count++;
            }
        }
        
        return $count;
    }
    
    function getTeamTimeoutEvents($team, $count) {
        global $redis, $keys;
        
        $allEventKeys = $redis->zRevRange($keys['game_timeouts'], 0, -1, true);
        $teamEvents = [];
        
        foreach ($allEventKeys as $eventKey => $eventId) {
            $eventTeam = $redis->hGet($eventKey, 'team');
            if ($eventTeam === $team) {
                $teamEvents[$eventKey] = $eventId;
                if (count($teamEvents) >= $count) break;
            }
        }
        
        return $teamEvents;
    }
    
    function resetTimeoutIfRunning($team, $activeTeam, $status) {
        global $redis, $statusKey, $remainingTimeKey, $startTimeKey, $activeTeamKey;
        
        if (($status === 'running' || $status === 'paused') && $activeTeam === $team) {
            $redis->set($statusKey, 'inactive');
            $redis->set($remainingTimeKey, 0);
            $redis->set($startTimeKey, 0);
            $redis->del($activeTeamKey);
            return true;
        }
        return false;
    }
    
    function removeTeamTimeoutEvents($team, $count, $activeTeam, $status) {
        global $redis, $keys, $homeTimeoutsUsedKey, $awayTimeoutsUsedKey;
        
        $teamEvents = getTeamTimeoutEvents($team, $count);
        
        if (count($teamEvents) < $count) {
            return [
                "success" => false,
                "error" => "Not enough timeout events found for team $team"
            ];
        }
        
        $timeoutsUsedKey = ($team === 'home') ? $homeTimeoutsUsedKey : $awayTimeoutsUsedKey;
        $currentTimeoutsUsed = intval($redis->get($timeoutsUsedKey) ?: 0);
        $newTimeoutsUsed = max(0, $currentTimeoutsUsed - $count);
        
        $redis->multi();
        
        foreach ($teamEvents as $eventKey => $eventId) {
            $redis->del($eventKey);
            $redis->zRem($keys['game_timeouts'], $eventKey);
        }
        
        $redis->set($timeoutsUsedKey, $newTimeoutsUsed);
        
        resetTimeoutIfRunning($team, $activeTeam, $status);
        
        $result = $redis->exec();
        
        if ($result) {
            return [
                "success" => true,
                "message" => "Removed $count timeout events for team $team",
                "homeTimeoutsUsed" => $team === 'home' ? $newTimeoutsUsed : intval($redis->get($homeTimeoutsUsedKey) ?: 0),
                "awayTimeoutsUsed" => $team === 'away' ? $newTimeoutsUsed : intval($redis->get($awayTimeoutsUsedKey) ?: 0)
            ];
        } else {
            return ["success" => false, "error" => "Failed to remove timeout events"];
        }
    }

    $currentTime = time();
    $remainingTime = $storedRemainingTime;
    if ($status === 'running' && $startTime > 0) {
        $elapsedTime = $currentTime - $startTime;
        $remainingTime = max(0, $storedRemainingTime - $elapsedTime);
        
        if ($remainingTime <= 0) {
            $redis->set($statusKey, 'inactive');
            $redis->set($remainingTimeKey, 0);
            $status = 'inactive';
            $remainingTime = 0;
        }
    }
    
    switch ($action) {
        case 'start':

            if ($status === 'running') {
                $response = [
                    "message" => "Timeout already in progress for " . $activeTeam . " team",
                    "status" => $status,
                    "team" => $team,
                    "remaining_time" => $remainingTime
                ];
                break;
            } else if ($status === 'paused') {
                $redis->set($statusKey, 'running');
                $redis->set($startTimeKey, $currentTime);
                $response = [
                    "message" => "Timeout resumed",
                    "status" => "running",
                    "team" => $activeTeam,
                    "remaining_time" => $remainingTime
                ];
                break;
            }

            if(!checkTimeoutsLimit($team)) {
                $response = [
                    "error" => "Maximum timeouts reached for " . $team . " team from " . $totalTimeoutsPerTeam . " allowed",
                    "status" => $status,
                    "team" => $team,
                    "remaining_time" => $remainingTime
                ];
                break;
            }

            $timeoutUpdate = updateTeamTimeouts($team);

            $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');
            $pipeline = $redis->pipeline();
            $pipeline->get($timerKeys['status']);
            $pipeline->get($timerKeys['start_time']);
            $pipeline->get($timerKeys['remaining_time']);
            $timerResults = $pipeline->exec();
            
            $timerStatus = $timerResults[0] ?: 'paused';
            $timerStartTime = (int)($timerResults[1] ?: 0);
            $timerStoredRemaining = (int)($timerResults[2] ?: 0);
            
            if ($timerStatus === 'running') {
                $timerRemainingTime = max(0, $timerStoredRemaining - ($currentTime - $timerStartTime));
                
                $redis->set($timerKeys['remaining_time'], $timerRemainingTime);
                $redis->set($timerKeys['status'], 'paused');
            }

            $redis->set($startTimeKey, $currentTime);
            $redis->set($remainingTimeKey, $timeoutDuration);
            $redis->set($statusKey, 'running');
            $redis->set($activeTeamKey, $team);
            
            $result = createTimeoutEvent($timeoutUpdate['homeTimeouts'], $timeoutUpdate['awayTimeouts'], $team, 1);
            
            if ($result["success"]) {
                $response = [
                    "message" => $result["message"],
                    "timer" => [
                        "status" => "running",
                        "team" => $team,
                        "remaining_time" => $timeoutDuration
                    ],
                    "event" => $result["event"]
                ];
            } else {
                $response = ["error" => $result["error"]];
            }
            
            break;

        case 'pause':
            if ($status !== 'running') {
                $response = [
                    "message" => "No timeout currently running",
                    "status" => $status
                ];
                break;
            }
            
            $redis->set($statusKey, 'paused');
            $redis->set($remainingTimeKey, $remainingTime);
            $response = [
                "message" => "Timeout paused",
                "status" => "paused",
                "team" => $team,
                "remaining_time" => $remainingTime
            ];
            break;
        case 'status':
            $response = [
                "status" => $status,
                "team" => $activeTeam,
                "remaining_time" => $remainingTime,
            ];
            break;
        case 'adjust':
            $amount = $params['amount'] ?? null;
        
            if (!isset($amount)) {
                $response = ["error" => "Missing amount"];
                break;
            }
            $amount = intval($amount);

            if($amount > 0) {
                if(!checkTimeoutsLimit($team, $amount)) {
                    $response = [
                        "error" => "Additional timeouts exceed maximum limit for " . $team . " team from " . $totalTimeoutsPerTeam . " allowed",
                        "team" => $team,
                    ];
                    break;
                }
    
                for ($i = 0; $i < $amount; $i++) {
                    $timeoutUpdate= updateTeamTimeouts($team);
                    $result = createTimeoutEvent($timeoutUpdate['homeTimeouts'], $timeoutUpdate['awayTimeouts'], $team);
                    
                    if (!$result["success"]) {
                        $response = ["error" => $result["error"]];
                        break;
                    }
                }
                $response = [
                    "message" => "Timeouts added successfully => " . $amount,
                    "team" => $team,
                    "homeTimeoutsUsed" => $timeoutUpdate['homeTimeouts'],
                    "awayTimeoutsUsed" => $timeoutUpdate['awayTimeouts']
                ];

                break;
            } else if ($amount < 0) {
                $removeCount = abs($amount);
                $teamTimeoutCount = countTeamTimeoutEvents($team);
                
                if ($teamTimeoutCount < $removeCount) {
                    $response = [
                        "error" => "Cannot remove $removeCount timeouts. Only $teamTimeoutCount timeouts exist for " . $team . " team",
                        "team" => $team,
                    ];
                    break;
                }
                
                $result = removeTeamTimeoutEvents($team, $removeCount, $activeTeam, $status);

                if ($result["success"]) {
                    $response = [
                        "message" => $result["message"],
                        "team" => $team,
                        "homeTimeoutsUsed" => $result["homeTimeoutsUsed"],
                        "awayTimeoutsUsed" => $result["awayTimeoutsUsed"]
                    ];
                } else {
                    $response = ["error" => $result["error"]];
                }

            } else {
                $response = [
                    "error" => "Invalid amount. Must be non-zero",
                    "team" => $team,
                ];
            }
        
            break;
            
        case 'get':
            $timeoutEvents = [];
            $timeoutEventKeys = $redis->zRevRange($keys['game_timeouts'], 0, -1);
    
            foreach ($timeoutEventKeys as $eventKey) {
                $eventData = $redis->hGetAll($eventKey);
                if (!empty($eventData)) {
                    $eventData['eventId'] = intval($eventData['eventId']);
                    $eventData['teamTimeoutsUsed'] = intval($eventData['teamTimeoutsUsed']);
                    $timeoutEvents[] = $eventData;
                }
            }
            $response = [
                "events" => $timeoutEvents,
            ];
            break;
            
        case 'reset':
            $timeoutEventKeys = $redis->zRange($keys['game_timeouts'], 0, -1);
            $eventsCount = count($timeoutEventKeys);

            $redis->multi();
            foreach ($timeoutEventKeys as $eventKey) {
                $redis->del($eventKey);
                $redis->zRem($keys['game_timeouts'], $eventKey);
            }
            $redis->set($homeTimeoutsUsedKey, 0);
            $redis->set($awayTimeoutsUsedKey, 0);
            $redis->set($statusKey, 'inactive');
            $redis->set($remainingTimeKey, 0);
            $redis->set($startTimeKey, 0);
            $redis->del($activeTeamKey);

            $result = $redis->exec();
            if ($result) {
                 $response =  [
                    "success" => true,
                    "message" => "All timeout events and counters have been reset",
                    "eventsRemoved" => $eventsCount
                ];
            } else {
                $response = [
                    "success" => false,
                    "error" => "Failed to reset timeout events"
                ];
            }
            break;
        case 'gameStatus':
            $response = [
                "homeTimeoutsUsed" => intval($redis->get($homeTimeoutsUsedKey) ?: 0),
                "awayTimeoutsUsed" => intval($redis->get($awayTimeoutsUsedKey) ?: 0),
                "totalTimeoutsPerTeam" => $totalTimeoutsPerTeam,
            ];
            break;
        default:
            $response = ["error" => "Invalid action " . $action];
            break;
    }
    
} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>