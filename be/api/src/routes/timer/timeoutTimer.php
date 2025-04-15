<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/timerUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

// Get and validate request parameters
$params = TimerUtils::getRequestParams();
$requiredParams = ['placardId', 'gameType', 'action', 'team'];
$allowedActions = ['start', 'pause', 'reset', 'status'];

$validationError = TimerUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$gameType = $params['gameType'] ?? null;
$action = $params['action'] ?? null;
$team = $params['team'] ?? null;

// Connect to Redis
$redis = RedistUtils::connect();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($gameType);
    
    $timeoutDuration = $gameConfig['timeoutDuration'] ?? 60;
    
    $keys = TimerUtils::getRedisKeys($placardId, 'timeout');
    $startTimeKey = $keys['start_time'];
    $remainingTimeKey = $keys['remaining_time'];
    $statusKey = $keys['status'];
    $teamKey = $keys['team'];
    
    $status = $redis->get($statusKey) ?: 'inactive';
    $activeTeam = $redis->get($teamKey) ?: '';
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
                    "team" => $activeTeam,
                    "remaining_time" => $remainingTime
                ];
                break;
            }
            
            $redis->set($startTimeKey, $currentTime);
            $redis->set($remainingTimeKey, $timeoutDuration);
            $redis->set($statusKey, 'running');
            $redis->set($teamKey, $team);
            
            $teamTimeoutsKey = "game:$placardId:" . $team . "_timeouts";
            $timeoutsUsed = (int)$redis->get($teamTimeoutsKey) ?: 0;
            $redis->set($teamTimeoutsKey, $timeoutsUsed + 1);
            
            $response = [
                "message" => "Timeout started for " . $team . " team",
                "status" => "running",
                "team" => $team,
                "remaining_time" => $timeoutDuration,
                "timeouts_used" => $timeoutsUsed + 1
            ];
            break;
            
        case 'pause':
            if ($status !== 'running') {
                $response = [
                    "message" => "No timeout currently running",
                    "status" => $status
                ];
                break;
            }
            
            $redis->set($remainingTimeKey, $remainingTime);
            $redis->set($statusKey, 'paused');
            
            $response = [
                "message" => "Timeout paused",
                "status" => "paused",
                "team" => $activeTeam,
                "remaining_time" => $remainingTime
            ];
            break;
            
        case 'reset':
            // End the current timeout
            $redis->set($startTimeKey, 0);
            $redis->set($remainingTimeKey, 0);
            $redis->set($statusKey, 'inactive');
            $redis->set($teamKey, '');
            
            $response = [
                "message" => "Timeout ended",
                "status" => "inactive",
                "remaining_time" => 0
            ];
            break;
            
        case 'status':
            $homeTimeoutsUsed = (int)$redis->get("game:$placardId:home_timeouts") ?: 0;
            $awayTimeoutsUsed = (int)$redis->get("game:$placardId:away_timeouts") ?: 0;
            $totalTimeoutsPerTeam = $gameConfig['timeoutsPerTeam'] ?? 0;
            
            $response = [
                "status" => $status,
                "team" => $activeTeam,
                "remaining_time" => $remainingTime,
                "home_timeouts_used" => $homeTimeoutsUsed,
                "away_timeouts_used" => $awayTimeoutsUsed,
                "total_timeouts_per_team" => $totalTimeoutsPerTeam,
            ];
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