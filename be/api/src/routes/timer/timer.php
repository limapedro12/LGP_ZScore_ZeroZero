<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/requestUtils.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();
$requestMethod = $_SERVER['REQUEST_METHOD'];

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['start', 'pause', 'reset', 'status', 'adjust', 'set'];

$response = null;

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    $response = $validationError;
} else {
    $placardId = $params['placardId'] ?? null;
    $sport = $params['sport'] ?? null;
    $action = $params['action'] ?? null;

    $redis = RedistUtils::connect();
    if (!$redis) {
        http_response_code(500);
        $response = ["error" => "Failed to connect to Redis"];
    } else {
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
            
            if ($storedRemaining === 0) {
                if(isset($gameConfig['periodDuration'])) {
                    $storedRemaining = $gameConfig['periodDuration'];
                } else {
                    $storedRemaining = 0;
                }
            }
            
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
                    if ($requestMethod !== 'POST') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
                        break;
                    }

                    if ($status !== 'running') {
                        if ($redis->get($remainingTimeKey) === false) {
                            $redis->set($remainingTimeKey, $gameConfig['periodDuration']);
                            $redis->set($periodKey, 1);
                        }
                        
                        $redis->set($startTimeKey, $currentTime);
                        $redis->set($timerStatusKey, 'running');
                        $status = 'running';
                        
                        $response = [
                            "message" => "Timer started"
                        ];
                    } else {
                        $response = [
                            "message" => "Timer already " . $status,
                        ];
                    }
                    break;
                    
                case 'pause':
                    if ($requestMethod !== 'POST') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
                        break;
                    }

                    if ($status === 'running') {
                        $redis->set($remainingTimeKey, $remainingTime);
                        $redis->set($timerStatusKey, 'paused');
                        $status = 'paused';
                        
                        $response = [
                            "message" => "Timer " . $status
                        ];
                    } else {
                        $response = [
                            "message" => "Timer already " . $status,
                        ];
                    }
                    break;
                    
                case 'status':
                    if ($requestMethod !== 'GET') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only GET is allowed for " . $action . " action."];
                        break;
                    }
                    $response = [
                        "message" => "Timer status",
                        "status" => $status,
                        "remaining_time" => $remainingTime,
                        "period" => $period,
                        "total_periods" => $gameConfig['periods']
                    ];
                    break;
                    
                case 'reset':
                    if ($requestMethod !== 'POST') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
                        break;
                    }
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
                    if ($requestMethod !== 'POST') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
                        break;
                    }

                    $seconds = isset($params['seconds']) ? intval($params['seconds']) : null;
                    if ($seconds === null) {
                        http_response_code(400);
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
                        "message" => "Timer adjusted by $seconds seconds",
                        "status" => $wasRunning ? "running" : "paused"
                    ];
                    break;

                case 'set':
                    if ($requestMethod !== 'POST') {
                        http_response_code(405);
                        $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
                        break;
                    }

                    $newTime = isset($params['time']) ? intval($params['time']) : null;
                    $newPeriod = isset($params['period']) ? intval($params['period']) : $period;
                
                    if ($newTime === null) {
                        http_response_code(400);
                        $response = ["error" => "Missing time parameter"];
                        break;
                    }
                    
                    if ($newTime <= 0) {
                        http_response_code(400);
                        $response = ["error" => "Time must be a positive value"];
                        break;
                    }
                
                    $wasRunning = ($status === 'running');
                    
                    if ($wasRunning) {
                        $redis->set($timerStatusKey, 'paused');
                    }
                    
                    if ($newPeriod < 1 || $newPeriod > $gameConfig['periods']) {
                        http_response_code(400);
                        $response = ["error" => "Invalid period value"];
                        break;
                    }
                    
                    $boundedTime = min($gameConfig['periodDuration'], $newTime);
                    $redis->set($remainingTimeKey, $boundedTime);
                    $redis->set($periodKey, $newPeriod);
                    
                    if ($wasRunning) {
                        $redis->set($startTimeKey, $currentTime);
                        $redis->set($timerStatusKey, 'running');
                    }

                    $minutes = floor($boundedTime / 60);
                    $seconds = $boundedTime % 60;

                    $response = [
                        "message" => "Timer manually changed to $minutes:$seconds and period $newPeriod",
                        "status" => $wasRunning ? "running" : "paused",
                        "period" => $newPeriod,
                        "total_periods" => $gameConfig['periods']
                    ];
                    break;
                    
                default:
                    http_response_code(400);
                    $response = ["error" => "Invalid action"];
                    break;
            }
        } catch (Exception $e) {
            http_response_code(500);
            $response = ["error" => "An error occurred: " . $e->getMessage()];
        }
    }
}

echo json_encode($response);
?>