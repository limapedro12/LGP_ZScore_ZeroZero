<?php
require_once __DIR__ . '/../../connRedis.php';

header('Content-Type: application/json');


$gameConfigs = [
    'futsal' => [
        'periods' => 2,
        'periodDuration' => 60*20
    ],
    'basketball' => [
        'periods' => 4,
        'periodDuration' => 10 * 60
    ],
];

// Helper functions
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

// Input validation
$placardId = $_GET['gameId'] ?? null;
$gameType = $_GET['gameType'] ?? 'futsal';
$action = $_GET['action'] ?? null;

if(is_null($placardId)) {
    echo json_encode(["error" => "Missing gameId"]);
    exit;
}

if(is_null($action)) {
    echo json_encode(["error" => "Missing action"]);
    exit;
}

if(is_null($gameType) || !array_key_exists($gameType, $gameConfigs)) {
    echo json_encode(["error" => "Invalid gameType. Must be one of: " . implode(', ', array_keys($gameConfigs))]);
    exit;
}

// Validate action is one of the allowed values
$allowedActions = ['start', 'pause', 'reset', 'status', 'adjust', 'set'];
if (!in_array($action, $allowedActions)) {
    echo json_encode(["error" => "Invalid action. Must be one of: " . implode(', ', $allowedActions)]);
    exit;
}

// Connect to Redis
try {
    $redis = connectRedis();
    if (!$redis) {
        throw new Exception("Failed to connect to Redis");
    }
} catch (Exception $e) {
    echo json_encode(["error" => "Redis connection error: " . $e->getMessage()]);
    exit;
}

// Define Redis keys
$startTimeKey = "game:$placardId:start_time";
$remainingTimeKey = "game:$placardId:remaining_time";
$timerStatusKey = "game:$placardId:status";
$periodKey = "game:$placardId:period";

$currentTime = time();
$gameConfig = $gameConfigs[$gameType];

try {
    $timerData = getTimerData($redis, $placardId, $currentTime, $gameConfig);

    // Process actions
    switch ($action) {
        case 'start':
            if($timerData['status'] !== 'running') {
                // Only set the period duration if it's a new game or reset
                
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
                $seconds = isset($_GET['seconds']) ? intval($_GET['seconds']) : 0;
                $wasRunning = ($timerData['status'] === 'running');
                
                // Pause the timer if it's running
                if ($wasRunning) {
                    $redis->set($remainingTimeKey, $timerData['remaining_time']);
                    $redis->set($timerStatusKey, 'paused');
                }
                
                // Make the adjustment
                $currentRemaining = $timerData['remaining_time'];
                $newRemaining = min($gameConfig['periodDuration'], max(0, $currentRemaining + $seconds));
                $redis->set($remainingTimeKey, $newRemaining);
                
                // Restart if it was running
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
                $newTime = isset($_GET['time']) ? intval($_GET['time']) : 0;
                $newPeriod = isset($_GET['period']) ? intval($_GET['period']) : $timerData['period'];
                $wasRunning = ($timerData['status'] === 'running');
                
                // Pause the timer if it's running
                if ($wasRunning) {
                    $redis->set($timerStatusKey, 'paused');
                }
                
                // Validate period
                if ($newPeriod < 1 || $newPeriod > $gameConfig['periods']) {
                    $response = ["error" => "Invalid period value"];
                    break;
                }
                
                // Apply bounds to the time value
                $boundedTime = min($gameConfig['periodDuration'], max(0, $newTime));
                $redis->set($remainingTimeKey, $boundedTime);
                $redis->set($periodKey, $newPeriod);
                
                // Restart if it was running
                if ($wasRunning) {
                    $redis->set($startTimeKey, $currentTime);
                    $redis->set($timerStatusKey, 'running');
                }
                
                // Get updated timer data
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

// Return response
echo json_encode($response);
?>