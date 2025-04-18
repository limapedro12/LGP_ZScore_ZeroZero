<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/requestUtils.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();
$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['start', 'pause', 'reset', 'status', 'adjust', 'set'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$sport = $params['sport'] ?? null;
$action = $params['action'] ?? null;

$redis = RedistUtils::connect();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($sport);
    $keys = RequestUtils::getRedisKeys($placardId, 'timer');

    $startTimeKey = $keys['start_time'];
    $remainingTimeKey = $keys['remaining_time'];
    $timerStatusKey = $keys['status'];
    $periodKey = $keys['period'];
    
    $currentTime = time();
    $status = $redis->get($timerStatusKey) ?: 'paused';
    $startTime = (int)$redis->get($startTimeKey) ?: 0;
    $storedRemaining = (int)$redis->get($remainingTimeKey);
    $period = (int)$redis->get($periodKey) ?: 1;
    
    if ($storedRemaining === 0 && $redis->get($remainingTimeKey) === false) {
        $storedRemaining = $gameConfig['periodDuration'];
    }
    
    // Calculate remaining time
    $remainingTime = $storedRemaining;
    if ($status === 'running' && $startTime > 0) {
        $remainingTime = max(0, $storedRemaining - ($currentTime - $startTime));
        
        if ($remainingTime <= 0) {
            $redis->set($timerStatusKey, 'paused');
            $redis->set($remainingTimeKey, 0);
            $status = 'paused';
            $remainingTime = 0;
            
            if ($period < $gameConfig['periods']) {
                $redis->set($periodKey, $period + 1);
                $redis->set($remainingTimeKey, $gameConfig['periodDuration']);
            }
        }
    }

    switch ($action) {
        case 'start':
            if ($status !== 'running') {
                if ($redis->get($remainingTimeKey) === false) {
                    $redis->set($remainingTimeKey, $gameConfig['periodDuration']);
                    $redis->set($periodKey, 1);
                }
                
                $redis->set($startTimeKey, $currentTime);
                $redis->set($timerStatusKey, 'running');
                $status = 'running';
                
                $response = [
                    "message" => "Timer started",
                    "status" => "running",
                    "remaining_time" => $remainingTime,
                    "period" => $period,
                    "total_periods" => $gameConfig['periods']
                ];
            } else {
                $response = [
                    "message" => "Timer already running",
                    "status" => "running",
                    "remaining_time" => $remainingTime,
                    "period" => $period,
                    "total_periods" => $gameConfig['periods']
                ];
            }
            break;
            
        case 'pause':
            if ($status === 'running') {
                $redis->set($remainingTimeKey, $remainingTime);
                $redis->set($timerStatusKey, 'paused');
                $status = 'paused';
                
                $response = [
                    "message" => "Timer paused",
                    "status" => "paused",
                    "remaining_time" => $remainingTime,
                    "period" => $period,
                    "total_periods" => $gameConfig['periods']
                ];
            } else {
                $response = [
                    "message" => "Timer already paused",
                    "status" => "paused",
                    "remaining_time" => $remainingTime,
                    "period" => $period,
                    "total_periods" => $gameConfig['periods']
                ];
            }
            break;
            
        case 'status':
            $response = [
                "message" => "Timer status",
                "status" => $status,
                "remaining_time" => $remainingTime,
                "period" => $period,
                "total_periods" => $gameConfig['periods']
            ];
            break;
            
        case 'reset':
            $redis->set($startTimeKey, 0);
            $redis->set($remainingTimeKey, $gameConfig['periodDuration']);
            $redis->set($timerStatusKey, 'paused');
            $redis->set($periodKey, 1);
            
            $response = [
                "message" => "Timer reset",
                "status" => "paused",
                "remaining_time" => $gameConfig['periodDuration'],
                "period" => 1,
                "total_periods" => $gameConfig['periods']
            ];
            break;

        case 'adjust':
            $seconds = isset($params['seconds']) ? intval($params['seconds']) : null;
            if ($seconds === null) {
                $response = ["error" => "Missing seconds parameter"];
                break;
            }
            
            $wasRunning = ($status === 'running');
            
            if ($wasRunning) {
                $redis->set($remainingTimeKey, $remainingTime);
                $redis->set($timerStatusKey, 'paused');
            }
            
            $newRemaining = min($gameConfig['periodDuration'], max(0, $remainingTime + $seconds));
            $redis->set($remainingTimeKey, $newRemaining);
            
            if ($wasRunning) {
                $redis->set($startTimeKey, $currentTime);
                $redis->set($timerStatusKey, 'running');
            }
            
            $response = [
                "message" => "Timer adjusted",
                "status" => $wasRunning ? "running" : "paused",
                "remaining_time" => $newRemaining,
                "period" => $period,
                "total_periods" => $gameConfig['periods']
            ];
            break;

        case 'set':
            $newTime = isset($params['time']) ? intval($params['time']) : null;
            $newPeriod = isset($params['period']) ? intval($params['period']) : $period;

            if ($newTime === null) {
                $response = ["error" => "Missing time parameter"];
                break;
            }

            $wasRunning = ($status === 'running');
            
            if ($wasRunning) {
                $redis->set($timerStatusKey, 'paused');
            }
            
            if ($newPeriod < 1 || $newPeriod > $gameConfig['periods']) {
                $response = ["error" => "Invalid period value"];
                break;
            }
            
            $boundedTime = min($gameConfig['periodDuration'], max(0, $newTime));
            $redis->set($remainingTimeKey, $boundedTime);
            $redis->set($periodKey, $newPeriod);
            
            if ($wasRunning) {
                $redis->set($startTimeKey, $currentTime);
                $redis->set($timerStatusKey, 'running');
            }
            
            $response = [
                "message" => "Timer manually set",
                "status" => $wasRunning ? "running" : "paused",
                "remaining_time" => $boundedTime,
                "period" => $newPeriod,
                "total_periods" => $gameConfig['periods']
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