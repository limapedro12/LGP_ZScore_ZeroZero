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
    //---------------------------------------------//


    //-TIMEOUTCLOCK VARIABLES ----------------------//
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

    $activeTeam = $redis->get($activeTeamKey) ?: null;

    //---------------------------------------------//


    function createTimeoutEvent($homeTimeoutsUsed, $awayTimeoutsUsed, $team = null) {
        global $redis, $keys, $placardId, $totalTimeoutsPerTeam;

        $eventId = $redis->incr($keys['event_counter']);
        $timeoutEventKeys = $keys['timeout_event'] . $eventId;
        
        $timeoutData = [
            'eventId' => $eventId,
            'placardId' => $placardId,
            'team' => $team,
            'teamTimeoutsUsed' => $team === 'home' ? $homeTimeoutsUsed : $awayTimeoutsUsed
        ];
        
        $redis->multi();
        $redis->set($keys['home_timeouts_used'], $homeTimeoutsUsed);
        $redis->set($keys['away_timeouts_used'], $awayTimeoutsUsed);
        $redis->hMSet($timeoutEventKeys, $timeoutData);
        $redis->zAdd($keys['game_timeouts'], $eventId, $timeoutEventKeys);
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
        global $redis, $homeTimeoutsUsedKey, $awayTimeoutsUsedKey, $totalTimeoutsPerTeam;
        
        $timeoutsUsedKey = $team === 'home' ? $homeTimeoutsUsedKey : $awayTimeoutsUsedKey;
        $currentTimeoutsUsed = intval($redis->get($timeoutsUsedKey) ?: 0);
        return ($currentTimeoutsUsed + $amount) <= $totalTimeoutsPerTeam;
    }

    function updateTeamTimeouts($team) {

        global $redis, $homeTimeoutsUsedKey, $awayTimeoutsUsedKey, $totalTimeoutsPerTeam;
        
        $timeoutsUsedKey = $team === 'home' ? $homeTimeoutsUsedKey : $awayTimeoutsUsedKey;
        $currentTimeoutsUsed = intval($redis->get($timeoutsUsedKey) ?: 0);
        $newTimeoutsUsed = $currentTimeoutsUsed + 1;
        
        $homeTimeouts = $team === 'home' ? $newTimeoutsUsed : intval($redis->get($homeTimeoutsUsedKey) ?: 0);
        $awayTimeouts = $team === 'away' ? $newTimeoutsUsed : intval($redis->get($awayTimeoutsUsedKey) ?: 0);
    
        return [
            'success' => true,
            'homeTimeouts' => $homeTimeouts,
            'awayTimeouts' => $awayTimeouts
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
    
    function removeTeamTimeoutEvents($team, $count) {
        global $redis, $keys, $homeTimeoutsUsedKey, $awayTimeoutsUsedKey, $statusKey, $remainingTimeKey, $startTimeKey, $activeTeamKey;
    
        $activeTeam = $redis->get($activeTeamKey) ?: null;
        $status = $redis->get($statusKey) ?: 'inactive';
        $timeoutRunning = ($status === 'running' || $status === 'paused') && $activeTeam === $team;
        
        $allEventKeys = $redis->zRevRange($keys['game_timeouts'], 0, -1, true);
        
        $teamEvents = [];
        foreach ($allEventKeys as $eventKey => $eventId) {
            $eventTeam = $redis->hGet($eventKey, 'team');
            if ($eventTeam === $team) {
                $teamEvents[$eventKey] = $eventId;
                if (count($teamEvents) >= $count) {
                    break;
                }
            }
        }
        
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

        if ($timeoutRunning) {
            $redis->set($statusKey, 'inactive');
            $redis->set($remainingTimeKey, 0);
            $redis->set($startTimeKey, 0);
            $redis->del($activeTeamKey);
        }

        $result = $redis->exec();
        
        if ($result) {
            return [
                "success" => true,
                "message" => "Removed $count timeout events for team $team",
            ];
        } else {
            return [
                "success" => false,
                "error" => "Failed to remove timeout events"
            ];
        }
    }


    $status = $redis->get($statusKey) ?: 'inactive';
    $startTime = (int)$redis->get($startTimeKey) ?: 0;
    $storedRemainingTime = (int)$redis->get($remainingTimeKey) ?: 0;

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
            $timerStatus = $redis->get($timerKeys['status']) ?: 'paused';
            
            if ($timerStatus === 'running') {
                $timerStartTime = (int)$redis->get($timerKeys['start_time']) ?: 0;
                $timerStoredRemaining = (int)$redis->get($timerKeys['remaining_time']);
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
                
                $result = removeTeamTimeoutEvents($team, $removeCount);
                
                if ($result["success"]) {
                    $homeTimeoutsUsed = intval($redis->get($homeTimeoutsUsedKey) ?: 0);
                    $awayTimeoutsUsed = intval($redis->get($awayTimeoutsUsedKey) ?: 0);
                    
                    $response = [
                        "message" => $result["message"],
                        "team" => $team,
                        "homeTimeoutsUsed" => $homeTimeoutsUsed,
                        "awayTimeoutsUsed" => $awayTimeoutsUsed
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