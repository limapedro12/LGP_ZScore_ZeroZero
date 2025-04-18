<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['get', 'reset', 'adjust', 'start', 'pause', 'status'];

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
            'homeTimeoutsUsed' => $homeTimeoutsUsed,
            'awayTimeoutsUsed' => $awayTimeoutsUsed,
            'totalTimeoutsPerTeam' => $totalTimeoutsPerTeam
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

    function updateTeamTimeouts($team, $amount = 1) {
        global $redis, $homeTimeoutsUsedKey, $awayTimeoutsUsedKey, $totalTimeoutsPerTeam;
        
        $timeoutsUsedKey = $team === 'home' ? $homeTimeoutsUsedKey : $awayTimeoutsUsedKey;
        $currentTimeoutsUsed = intval($redis->get($timeoutsUsedKey) ?: 0);
        $newTimeoutsUsed = $currentTimeoutsUsed + $amount;
    
        
        $homeTimeouts = $team === 'home' ? $newTimeoutsUsed : intval($redis->get($homeTimeoutsUsedKey) ?: 0);
        $awayTimeouts = $team === 'away' ? $newTimeoutsUsed : intval($redis->get($awayTimeoutsUsedKey) ?: 0);

        return [
            'homeTimeouts' => $homeTimeouts,
            'awayTimeouts' => $awayTimeouts,
            'maxReached' => $newTimeoutsUsed > $totalTimeoutsPerTeam,
            "minReached" => $newTimeoutsUsed < 0
        ];
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
            $timeoutUpdate = updateTeamTimeouts($team);
            
            if ($timeoutUpdate['maxReached']) {
                $response = [
                    "error" => "Maximum timeouts reached for " . $team . " team"
                ];
                break;
            } else if ($timeoutUpdate['minReached']) {
                $response = [
                    "error" => "Timeouts cannot be negative for " . $team . " team"
                ];
                break;
            }

            if ($status === 'running') {
                $response = [
                    "message" => "Timeout already in progress for " . $team . " team",
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
            
            $result = createTimeoutEvent($timeoutUpdate['homeTimeouts'], $timeoutUpdate['awayTimeouts'], $team);
            
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
        
            $timeoutUpdate = updateTeamTimeouts($team, $amount);

            if ($timeoutUpdate['maxReached']) {
                $response = [
                    "error" => "Maximum timeouts reached for " . $team . " team"
                ];
                break;
            } else if ($timeoutUpdate['minReached']) {
                $response = [
                    "error" => "Timeouts cannot be negative for " . $team . " team"
                ];
                break;
            }
            
            $result = createTimeoutEvent($timeoutUpdate['homeTimeouts'], $timeoutUpdate['awayTimeouts'], $team);
            
            if ($result["success"]) {
                $response = [
                    "message" => $result["message"],
                    "event" => $result["event"]
                ];
            } else {
                $response = ["error" => $result["error"]];
            }
            break;
            
        case 'get':
            $timeoutEvents = [];
            $pattern = $keys['timeout_event'] . "*";
            $timeoutEventKeys = $redis->keys($pattern);
            
            foreach ($timeoutEventKeys as $eventKey) {
                $eventData = $redis->hGetAll($eventKey);
                if (!empty($eventData)) {
                    $timeoutEvents[] = $eventData;
                }
            }
            
            usort($timeoutEvents, function($a, $b) {
                return intval($b['eventId']) - intval($a['eventId']);
            });

            if($timeoutEvents === []) {
                $response = [
                    "events" => $timeoutEvents,
                    "homeTimeoutsUsed" => 0,
                    "awayTimeoutsUsed" => 0,
                    "totalTimeoutsPerTeam" => $totalTimeoutsPerTeam
                ];
                break;
            }
            
            $response = [
                "events" => $timeoutEvents
            ];
            break;
            
        case 'reset':

            if ($status === 'running') {
                $response = [
                    "message" => "Timeout currently running for " . $activeTeam . " team",
                    "status" => $status,
                ];
                break;
            }

            $result = createTimeoutEvent(0, 0, null);
            
            if ($result["success"]) {
                $response = [
                    "message" => "All timeouts reset to zero",
                    "event" => $result["event"]
                ];
            } else {
                $response = ["error" => $result["error"]];
            }
            break;
            
        default:
            $response = ["error" => "Invalid action"];
            break;
    }
    
} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>