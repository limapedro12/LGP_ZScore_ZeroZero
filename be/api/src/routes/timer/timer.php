<?php
require_once __DIR__ . '/../../utils/connRedis.php';
require_once __DIR__ . '/../../utils/timerData.php';
require_once __DIR__ . '/../../config/gameConfig.php';


header('Content-Type: application/json');
$jsonBody = null;

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $jsonBody = json_decode($input, true);
    }
}

$placardId = $_GET['placardId'] ?? $jsonBody['placardId'] ?? null;
$gameType = $_GET['gameType'] ?? $jsonBody['gameType'] ?? null;
$action = $_GET['action'] ?? $jsonBody['action'] ?? null;


if(is_null($placardId)) {
    echo json_encode(["error" => "Missing gameId"]);
    exit;
}

if(is_null($action)) {
    echo json_encode(["error" => "Missing action"]);
    exit;
}

if(is_null($gameType)) {
    echo json_encode(["error" => $gameType]);
    exit;
}

$allowedActions = ['start', 'pause', 'reset', 'status', 'adjust', 'set'];
if (!in_array($action, $allowedActions)) {
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

try {
    $redis = connectRedis();
    if (!$redis) {
        throw new Exception("Failed to connect to Redis");
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Redis connection error: " . $e->getMessage()]);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($gameType);
} catch (Exception $e) {
    echo json_encode(["error" => "Game configuration error: " . $e->getMessage()]);
    exit;
}

$startTimeKey = "game:$placardId:start_time";
$remainingTimeKey = "game:$placardId:remaining_time";
$timerStatusKey = "game:$placardId:status";
$periodKey = "game:$placardId:period";

$currentTime = time();

try {
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
                $seconds = isset($jsonBody['seconds']) ? intval($jsonBody['seconds']) : 0;
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
                $newTime = isset($jsonBody['time']) ? intval($jsonBody['time']) : 0;
                $newPeriod = isset($jsonBody['period']) ? intval($jsonBody['period']) : $timerData['period'];
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

echo json_encode($response);
?>