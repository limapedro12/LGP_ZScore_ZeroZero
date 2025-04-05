<?php
require_once __DIR__ . '/../../connRedis.php';

header('Content-Type: application/json');

// Helper functions
function getTimerData($redis, $placardId, $currentTime) {
    $prefix = "game:$placardId:";
    $status = $redis->get($prefix . 'status') ?: 'paused';
    $startTime = (int)$redis->get($prefix . 'start_time') ?: 0;
    $storedElapsed = (int)$redis->get($prefix . 'elapsed_time') ?: 0;
    
    $elapsedTime = ($status === 'running' && $startTime > 0) 
        ? $currentTime - $startTime + $storedElapsed 
        : $storedElapsed;
        
    return [
        'status' => $status,
        'start_time' => $startTime,
        'elapsed_time' => $elapsedTime
    ];
}

// Input validation
$placardId = $_GET['gameId'] ?? null;
$action = $_GET['action'] ?? null;

if(is_null($placardId)) {
    echo json_encode(["error" => "Missing gameId"]);
    exit;
}

if(is_null($action)) {
    echo json_encode(["error" => "Missing action"]);
    exit;
}

// Validate action is one of the allowed values
$allowedActions = ['start', 'pause', 'reset', 'status'];
if (!in_array($action, $allowedActions)) {
    echo json_encode(["error" => "Invalid action. Must be one of: " . implode(', ', $allowedActions)]);
    exit;
}

// Connect to Redis
$redis = connectRedis();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

// Define Redis keys
$startTimeKey = "game:$placardId:start_time";
$elapsedTimeKey = "game:$placardId:elapsed_time";
$timerStatusKey = "game:$placardId:status";

$currentTime = time();
$timerData = getTimerData($redis, $placardId, $currentTime);

// Process actions
switch ($action) {
    case 'start':
        if($timerData['status'] !== 'running') {
            $startTime = $currentTime - $timerData['elapsed_time'];
            $redis->set($startTimeKey, $startTime);
            $redis->set($timerStatusKey, 'running');
            
            $response = [
                "message" => "Timer started",
                "status" => "running",
                "start_time" => $startTime,
                "elapsed_time" => $timerData['elapsed_time']
            ];
        } else {
            $response = [
                "message" => "Timer already running",
                "status" => "running",
                "start_time" => $timerData['start_time'],
                "elapsed_time" => $timerData['elapsed_time']
            ];
        }
        break;
        
    case 'pause':
        if($timerData['status'] === 'running') {
            $redis->set($elapsedTimeKey, $timerData['elapsed_time']);
            $redis->set($timerStatusKey, 'paused');
            
            $response = [
                "message" => "Timer paused",
                "status" => "paused",
                "elapsed_time" => $timerData['elapsed_time']
            ];
        } else {
            $response = [
                "message" => "Timer already paused",
                "status" => "paused",
                "elapsed_time" => $timerData['elapsed_time']
            ];
        }
        break;
        
    case 'status':
        $response = [
            "message" => "Timer status",
            "status" => $timerData['status'],
            "start_time" => $timerData['start_time'],
            "elapsed_time" => $timerData['elapsed_time']
        ];
        break;
        
    case 'reset':
        $redis->set($startTimeKey, 0);
        $redis->set($elapsedTimeKey, 0);
        $redis->set($timerStatusKey, 'paused');
        
        $response = [
            "message" => "Timer reset",
            "status" => "paused",
            "start_time" => 0,
            "elapsed_time" => 0
        ];
        break;
        
    default:
        $response = ["error" => "Invalid action"];
        break;
}

// Return response
echo json_encode($response);
?>