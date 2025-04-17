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

try{
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($sport);
    
    // Get Redis keys
    $keys = RequestUtils::getRedisKeys($placardId, 'timer');

    $startTimeKey = $keys['start_time'];
    $remainingTimeKey = $keys['remaining_time'];
    $timerStatusKey = $keys['status'];
    $periodKey = $keys['period'];
    
    // Get current timestamp
    $currentTime = time();
    
    $timerData = getTimerData($redis, $placardId, $currentTime, $gameConfig);

    switch ($action) {
        case 'start':
            if($timerData['status'] !== 'running') {                
                try{
                    if ($redis->get($remainingTimeKey) === false) {
                        $redis->set($remainingTimeKey, $gameConfig['periodDuration']);
                        $redis->set($periodKey, 1);
                    }
                    
                    $redis->set($startTimeKey, $currentTime);
                    $redis->set($timerStatusKey, 'running');
                    
                    $timerData = getTimerData($redis, $placardId, $currentTime, $gameConfig);
                    $response = [
                        "message" => "Timer started",
                        "status" => "running",
                        "remaining_time" => $timerData['remaining_time'],
                        "period" => $timerData['period'],
                        "total_periods" => $timerData['total_periods']
                    ];
                } catch (Exception $e) {
                    $response = ["error" => "Failed to start timer: " . $e->getMessage()];
                }

            } else {
                $response = [
                    "message" => "Timer already running",
                    "status" => "running",
                    "remaining_time" => $timerData['remaining_time'],
                    "period" => $timerData['period'],
                    "total_periods" => $timerData['total_periods']
                ];
            }
            break;
            
        case 'pause':
            if($timerData['status'] === 'running') {

                try{
                    $redis->set($remainingTimeKey, $timerData['remaining_time']);
                    $redis->set($timerStatusKey, 'paused');
                    
                    $response = [
                        "message" => "Timer paused",
                        "status" => "paused",
                        "remaining_time" => $timerData['remaining_time'],
                        "period" => $timerData['period'],
                        "total_periods" => $timerData['total_periods']
                    ];
                } catch (Exception $e) {
                    $response = ["error" => "Failed to pause timer: " . $e->getMessage()];
                }
            } else {
                $response = [
                    "message" => "Timer already paused",
                    "status" => "paused",
                    "remaining_time" => $timerData['remaining_time'],
                    "period" => $timerData['period'],
                    "total_periods" => $timerData['total_periods']
                ];
            }
            break;
            
        case 'status':
            $response = [
                "message" => "Timer status",
                "status" => $timerData['status'],
                "remaining_time" => $timerData['remaining_time'],
                "period" => $timerData['period'],
                "total_periods" => $timerData['total_periods']
            ];
            break;
            
        case 'reset':

            try{
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
            } catch (Exception $e) {
                $response = ["error" => "Failed to reset timer: " . $e->getMessage()];
            }
            break;

        case 'adjust':

            try{
                $seconds = isset($params['seconds']) ? intval($params['seconds']) : null;
                if($seconds === null) {
                    $response = ["error" => "Missing seconds parameter"];
                    break;
                }
                $wasRunning = ($timerData['status'] === 'running');
                
                if ($wasRunning) {
                    $redis->set($remainingTimeKey, $timerData['remaining_time']);
                    $redis->set($timerStatusKey, 'paused');
                }
                
                $currentRemaining = $timerData['remaining_time'];
                $newRemaining = min($gameConfig['periodDuration'], max(0, $currentRemaining + $seconds));
                $redis->set($remainingTimeKey, $newRemaining);
                
                if ($wasRunning) {
                    $redis->set($startTimeKey, $currentTime);
                    $redis->set($timerStatusKey, 'running');
                }
                
                $timerData = getTimerData($redis, $placardId, $currentTime, $gameConfig);
                
                $response = [
                    "message" => "Timer adjusted",
                    "status" => $timerData['status'],
                    "remaining_time" => $timerData['remaining_time'],
                    "period" => $timerData['period'],
                    "total_periods" => $timerData['total_periods']
                ];
            } catch (Exception $e) {
                $response = ["error" => "Failed to adjust timer: " . $e->getMessage()];
            }
            break;

        case 'set':

            try{
                $newTime = isset($params['time']) ? intval($params['time']) : null;
                $newPeriod = isset($params['period']) ? intval($params['period']) : $timerData['period'];

                if($newTime === null) {
                    $response = ["error" => "Missing time parameter"];
                    break;
                }

                $wasRunning = ($timerData['status'] === 'running');
                
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
                
                $timerData = getTimerData($redis, $placardId, $currentTime, $gameConfig);
                
                $response = [
                    "message" => "Timer manually set",
                    "status" => $timerData['status'],
                    "remaining_time" => $timerData['remaining_time'],
                    "period" => $newPeriod,
                    "total_periods" => $timerData['total_periods']
                ];
            } catch (Exception $e) {
                $response = ["error" => "Failed to set timer: " . $e->getMessage()];
            }
            break;
            
        default:
            $response = ["error" => "Invalid action"];
            break;
    }
} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}



/**
 * Retrieves and calculates timer data for a specific game
 *
 *
 * @param Redis $redis Redis connection
 * @param string $placardId Game identifier
 * @param int $currentTime Current Unix timestamp
 * @param array $gameConfig Game configuration parameters
 * @return array Timer data including status, remaining time, and period information
 */
function getTimerData($redis, $placardId, $currentTime, $gameConfig) {
    try{
        $prefix = "game:$placardId:";
        $status = $redis->get($prefix . 'status') ?: 'paused';
        $startTime = (int)$redis->get($prefix . 'start_time') ?: 0;
        $storedRemaining = (int)$redis->get($prefix . 'remaining_time');
        $period = (int)$redis->get($prefix . 'period') ?: 1;
        
        // Initialize remaining time if not set yet
        if ($storedRemaining === 0 && $redis->get($prefix . 'remaining_time') === false) {
            $storedRemaining = $gameConfig['periodDuration'];
        }
        
        // Calculate remaining time if timer is running
        $remainingTime = ($status === 'running' && $startTime > 0) 
            ? $storedRemaining - ($currentTime - $startTime)
            : $storedRemaining;
        
        // Auto-pause if timer reaches 0
        if ($remainingTime <= 0 && $status === 'running') {
            $remainingTime = 0;
            $redis->set($prefix . 'status', 'paused');
            $redis->set($prefix . 'remaining_time', 0);
            $status = 'paused';
            
            // If not the last period, prepare for next period
            if ($period < $gameConfig['periods']) {
                $redis->set($prefix . 'period', $period + 1);
                $redis->set($prefix . 'remaining_time', $gameConfig['periodDuration']);
            }
        }
            
        return [
            'status' => $status,
            'start_time' => $startTime,
            'remaining_time' => max(0, $remainingTime),
            'period' => $period,
            'total_periods' => $gameConfig['periods']
        ];
    } catch (Exception $e) {
        return [
            'error' => "Failed to get timer data: " . $e->getMessage()
        ];
    }
}

echo json_encode($response);
?>