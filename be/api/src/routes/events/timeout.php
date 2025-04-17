<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['get', 'reset', 'adjust'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$sport = $params['sport'] ?? null;
$action = $params['action'] ?? null;
$team = $params['team'] ?? null;

if (($action === 'adjust') && empty($team)) {
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

    $gameTimeoutsKey = $keys['game_timeouts'];
    $eventCounterKey = $keys['event_counter'];
    $homeTimeoutsUsedKey = $keys['home_timeouts_used'];
    $awayTimeoutsUsedKey = $keys['away_timeouts_used'];

    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($sport);
    $totalTimeoutsPerTeam = $gameConfig['timeoutsPerTeam'];
    
    switch ($action) {
        case 'adjust':
            $amount = $params['amount'] ?? null;
        
            if (!isset($amount)) {
                $response = ["error" => "Missing amount"];
                break;
            }
            $amount = intval($amount);
        
            $timeoutsUsedKey = $team === 'home' ? $homeTimeoutsUsedKey : $awayTimeoutsUsedKey;
            $currentTimeoutsUsed = intval($redis->get($timeoutsUsedKey) ?: 0);
            $newTimeoutsUsed = $currentTimeoutsUsed + $amount;
        
            if ($newTimeoutsUsed < 0) {
                $newTimeoutsUsed = 0;
            } elseif ($newTimeoutsUsed > $totalTimeoutsPerTeam) {
                $newTimeoutsUsed = $totalTimeoutsPerTeam;
            }
            
            $actualAmount = $newTimeoutsUsed - $currentTimeoutsUsed;
        
            $eventId = $redis->incr($eventCounterKey);
            $timeoutEventKeys = $keys['timeout_event'] . $eventId;
        
            $timeoutData = [
                'eventId' => $eventId,
                'placardId' => $placardId,
                'team' => $team,
                'homeTimeoutsUsed' => (strtolower($team) === 'home' ? $newTimeoutsUsed : intval($redis->get($homeTimeoutsUsedKey) ?: 0)),
                'awayTimeoutsUsed' => (strtolower($team) === 'away' ? $newTimeoutsUsed : intval($redis->get($awayTimeoutsUsedKey) ?: 0)),
                'totalTimeoutsPerTeam' => $totalTimeoutsPerTeam
            ];
        
            $redis->multi();
            $redis->set($timeoutsUsedKey, $newTimeoutsUsed);
            $redis->hMSet($timeoutEventKeys, $timeoutData);
            $redis->zAdd($gameTimeoutsKey, $eventId, $timeoutEventKeys);
            $result = $redis->exec();
        
            if ($result) {
                $response = [
                    "message" => "Timeout event added successfully",
                    "event" => $timeoutData
                ];
            } else {
                $response = ["error" => "Failed to add timeout event"];
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
            
            $response = [
                "events" => $timeoutEvents
            ];
            break;
            
        case 'reset':

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