<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();
$requestMethod = $_SERVER['REQUEST_METHOD'];

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['start', 'pause', 'reset', 'status', 'set'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'];
$sport = $params['sport'];
$action = $params['action'];
$team = $params['team'] ?? null;

if ($action === 'start' && empty($team)) {
    http_response_code(400);
    echo json_encode(["error" => "Team parameter is required for start action"]);
    exit;
}

if (!empty($team) && !in_array($team, ['home', 'away'])) {
    http_response_code(400);
    echo json_encode(["error" => "Team parameter must be 'home' or 'away'"]);
    exit;
}

$redis = RedistUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($sport);
    
    if (!isset($gameConfig['shotClock'])) {
        http_response_code(400);
        echo json_encode(["error" => "Shot clock is not supported for $sport"]);
        exit;
    }
    
    $shotClockDuration = $gameConfig['shotClock'];
    $keys = RequestUtils::getRedisKeys($placardId, 'shotclock');
    
    $currentTime = time();
    $status = $redis->get($keys['status']) ?: 'inactive';
    $startTime = (int)$redis->get($keys['start_time']) ?: 0;
    $storedRemaining = (int)$redis->get($keys['remaining_time']) ?: $shotClockDuration;
    $activeTeam = $redis->get($keys['active_team']) ?: null;
    
    $remainingTime = $storedRemaining;
    if ($status === 'running' && $startTime > 0) {
        $elapsedTime = $currentTime - $startTime;
        $remainingTime = max(0, $storedRemaining - $elapsedTime);
        
        if ($remainingTime <= 0) {
            $redis->set($keys['status'], 'expired');
            $redis->set($keys['remaining_time'], 0);
            $status = 'expired';
            $remainingTime = 0;
        }
    }
    
    $response = [];
    
    switch ($action) {
        case 'start':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for start action."];
                break;
            }
            
            if ($status === 'running' && $activeTeam === $team) {
                $response = [
                    "message" => "Shot clock already running for $team team",
                    "status" => $status,
                    "team" => $team,
                    "remaining_time" => $remainingTime
                ];
                break;
            }
            
            if ($status === 'running' && $activeTeam !== $team) {
                $oldTeam = $activeTeam;
                
                $redis->multi();
                $redis->set($keys['start_time'], $currentTime);
                $redis->set($keys['remaining_time'], $shotClockDuration); 
                $redis->set($keys['status'], 'running');
                $redis->set($keys['active_team'], $team);
                $redis->exec();
                
                $response = [
                    "message" => "Shot clock switched from $oldTeam to $team team",
                    "status" => "running",
                    "team" => $team,
                    "remaining_time" => $shotClockDuration
                ];
                break;
            }
            
            $timeToUse = ($status === 'paused' && $activeTeam === $team) 
                ? $remainingTime
                : $shotClockDuration;
            $redis->multi();
            $redis->set($keys['start_time'], $currentTime);
            $redis->set($keys['remaining_time'], $timeToUse);
            $redis->set($keys['status'], 'running');
            $redis->set($keys['active_team'], $team);
            $redis->exec();
            
            $response = [
                "message" => ($status === 'paused' && $activeTeam === $team) 
                    ? "Shot clock resumed for $team team" 
                    : "Shot clock started for $team team",
                "status" => "running",
                "team" => $team,
                "remaining_time" => $timeToUse
            ];
            break;
            
        case 'pause':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for pause action."];
                break;
            }
            
            if ($status !== 'running') {
                $response = [
                    "message" => "Shot clock is not running",
                    "status" => $status,
                    "team" => $activeTeam,
                    "remaining_time" => $remainingTime
                ];
                break;
            }
            
            $redis->multi();
            $redis->set($keys['status'], 'paused');
            $redis->set($keys['remaining_time'], $remainingTime);
            $redis->exec();
            
            $response = [
                "message" => "Shot clock paused",
                "status" => "paused",
                "team" => $activeTeam,
                "remaining_time" => $remainingTime
            ];
            break;
            
        case 'reset':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for reset action."];
                break;
            }
            
            $teamToReset = $team ?: $activeTeam;
            
            if (empty($teamToReset)) {
                $response = [
                    "message" => "No active shot clock to reset",
                    "status" => $status
                ];
                break;
            }
            
            $shouldRun = ($status === 'running' && ($team === null || $team === $activeTeam));
            
            $redis->multi();
            if ($shouldRun) {
                $redis->set($keys['start_time'], $currentTime);
                $redis->set($keys['status'], 'running');
            } else {
                $redis->set($keys['status'], 'paused');
                $redis->set($keys['start_time'], 0);
            }
            $redis->set($keys['remaining_time'], $shotClockDuration);
            $redis->set($keys['active_team'], $teamToReset);
            $redis->exec();
            
            $newStatus = $shouldRun ? 'running' : 'paused';
            $response = [
                "message" => "Shot clock reset for $teamToReset team",
                "status" => $newStatus,
                "team" => $teamToReset,
                "remaining_time" => $shotClockDuration
            ];
            break;
        case 'set':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for set action."];
                break;
            }

            $newTime = isset($params['time']) ? intval($params['time']) : null;
            if ($newTime === null) {
                http_response_code(400);
                $response = ["error" => "Missing time parameter"];
                break;
            }
            if ($newTime < 0) {
                http_response_code(400);
                $response = ["error" => "Time must be a non-negative value"];
                break;
            }

            $newTeam = $team ?? $activeTeam;

            $wasRunning = ($status === 'running');
            if ($wasRunning) {
                $redis->set($keys['status'], 'paused');
            }

            $boundedTime = min($shotClockDuration, $newTime);
            $redis->set($keys['remaining_time'], $boundedTime);

            if ($newTeam !== $activeTeam) {
                $redis->set($keys['active_team'], $newTeam);
            }

            if ($wasRunning) {
                $redis->set($keys['start_time'], $currentTime);
                $redis->set($keys['status'], 'running');
            }

            $response = [
                "message" => "Shot clock set to $boundedTime seconds" . ($newTeam !== $activeTeam ? " for $newTeam team" : ""),
                "status" => $wasRunning ? "running" : $status,
                "team" => $newTeam,
                "remaining_time" => $boundedTime,
                "duration" => $shotClockDuration
            ];
            break;
            
        case 'status':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for status action."];
                break;
            }
            
            $response = [
                "status" => $status,
                "team" => $activeTeam,
                "remaining_time" => $remainingTime,
                "duration" => $shotClockDuration
            ];
            break;
            
        default:
            http_response_code(400);
            $response = ["error" => "Invalid action: $action"];
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>