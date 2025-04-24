<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/PointValidationUtils.php';

header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['get', 'add', 'remove', 'update'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$action = $params['action'] ?? null;
$sport = $params['sport'] ?? null;
$team = $params['team'] ?? null;

if (($action === 'add') && empty($team)) {
    http_response_code(400);
    echo json_encode(["error" => "Team parameter is required for " . $action . " action"]);
    exit;
}

if (!empty($team) && !in_array($team, ['home', 'away'])) {
    http_response_code(400);
    echo json_encode(["error" => "Team parameter must be 'home' or 'away'"]);
    exit;
} else if (!empty($team)) {
    $team = strtolower($team);
}

$redis = RedistUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {
    $keys = RequestUtils::getRedisKeys($placardId, 'points');

    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    $gamePointsKey = $keys['game_points'];
    $eventCounterKey = $keys['event_counter'];
    $homePointsKey = $keys['home_points'];
    $awayPointsKey = $keys['away_points'];

    $pipeline = $redis->pipeline();
    $pipeline->get($homePointsKey);
    $pipeline->get($awayPointsKey);
    $results = $pipeline->exec();

    $homePoints = $results[0] ?? 0;
    $awayPoints = $results[1] ?? 0;

    switch ($action) {
        case 'add':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for add action."];
                break;
            }

            $points = $gameConfig['points'];
            $playerId = $params['playerId'] ?? null;

            if(!$playerId) {
                http_response_code(400);
                $response = ["error" => "Missing playerId for add action"];
                break;
            }

            if($sport === 'basketball'){
                $triple = $params['triple'] ?? null;
                if ($triple) {
                    $points = $points[1];
                } else {
                    $points = $points[0];
                }
            }

            if (!PointValidationUtils::canModifyPoints()) {
                http_response_code(400);
                $response = ["error" => "Cannot add points at this time."];
                break;
            }

            $eventId = $redis->incr($eventCounterKey);
            $pointEventKey = $keys['point_event'] . $eventId;

            if ($team === 'home') {
                $points = $homePoints + $points;
                $redis->set($homePointsKey, $points);
            } else if ($team === 'away') {
                $points = $awayPoints + $points;
                $redis->set($awayPointsKey, $points);
            } else {
                http_response_code(400);
                $response = ["error" => "Invalid team specified"];
                break;
            }

            $timestamp = RequestUtils::getGameTimePosition($placardId);

            $currentHomePoints = ($team === 'home') ? $points : (int)$homePoints;
            $currentAwayPoints = ($team === 'away') ? $points : (int)$awayPoints;
            $totalPoints = $currentHomePoints + $currentAwayPoints;

            $pointData = [
                'eventId' => $eventId,
                'placardId' => $placardId,
                'team' => $team,
                'playerId' => $playerId,
                'teamPoints' => $points,
                'totalPoints' => $totalPoints,
                'timestamp' => $timestamp,
            ];

            $redis->multi();
            $redis->hMSet($pointEventKey, $pointData);
            $redis->zAdd($gamePointsKey, $totalPoints, $pointEventKey);
            $result = $redis->exec();

            if ($result) {
                http_response_code(201); 
                $response = [
                    "message" => "Point event added successfully",
                    "event" => $pointData
                ];
            } else {
                http_response_code(500);
                $response = ["error" => "Failed to add point event"];
            }
            break;

        case 'remove':
            if ($requestMethod !== 'POST') {
               http_response_code(405); 
               $response = ["error" => "Invalid request method. Only POST is allowed for remove action."];
               break;
            }

           $eventId = $params['eventId'] ?? null;

           if (!$eventId) {
               http_response_code(400);
               $response = ["error" => "Missing eventId for remove action"];
               break;
           }

           $pointEventKey = $keys['point_event'] . $eventId;

           if (!$redis->exists($pointEventKey)) {
               http_response_code(404); 
               $response = ["error" => "Point event not found"];
               break;
           }

           $redis->multi();
           $redis->del($pointEventKey);
           $redis->zRem($gamePointsKey, $pointEventKey);
           $result = $redis->exec();

           if ($result && isset($result[0]) && $result[0] > 0 && isset($result[1]) && $result[1] > 0) {
                $response = [
                   "message" => "Point event removed successfully",
                   "eventId" => $eventId
               ];
           } else {
                http_response_code(500);
                $response = ["error" => "Failed to remove point event"];
           }
           break;

        case 'get':
            if ($requestMethod !== 'GET') {
                http_response_code(405); 
                $response = ["error" => "Invalid request method. Only GET is allowed for get action."];
                break;
            }
            $pointEventKey = $redis->zRevRange($gamePointsKey, 0, -1);

            if (empty($pointEventKey)) {
                $response = ["points" => []];
                break;
            }

            $pipe = $redis->pipeline();
            foreach ($pointEventKey as $key) {
                $pipe->hGetAll($key);
            }
            $pointHashes = $pipe->exec();

            $points = [];
            foreach ($pointHashes as $hash) {
                if ($hash) {
                    if (isset($hash['timestamp'])) $hash['timestamp'] = (int)$hash['timestamp'];
                    if (isset($hash['eventId'])) $hash['eventId'] = (int)$hash['eventId'];
                    $points[] = $hash;
                }
            }

            $response = ["points" => $points];
            break;
        
        case 'update':
            if ($requestMethod !== 'POST') {
                http_response_code(405); 
                $response = ["error" => "Invalid request method. Only POST is allowed for update action."];
                break;
            }
            $eventId = $params['eventId'] ?? null;
            if (!$eventId) {
                http_response_code(400);
                $response = ["error" => "Missing eventId for update action"];
                break;
            }

            $pointEventKey = $keys['point_event'] . $eventId;

            if (!$redis->exists($pointEventKey)) {
                http_response_code(404); 
                $response = ["error" => "Point event not found"];
                break;
            }

            $currentPointData = $redis->hGetAll($pointEventKey);

            $updatedData = [];
            $isChanged = false;

            if(isset($params['new_playerId'])){
                //need to check if playerId exists, only possible when there is players data
                if ($params['new_playerId'] != $currentPointData['playerId']) {
                    $updatedData['playerId'] = $params['new_playerId'];
                    $isChanged = true;
                }
            }

            if(isset($params['new_timestamp'])){
                if ((string)$params['new_timestamp'] !== (string)$currentPointData['timestamp']) {
                    $updatedData['timestamp'] = $params['new_timestamp'];
                    $isChanged = true;
                }
            }

            if(isset($params['new_team'])) {
                if ($params['new_team'] !== $currentPointData['team']) {
                    if (!in_array($params['new_team'], ['home', 'away'])) {
                        http_response_code(400);
                        $response = ["error" => "Team parameter must be 'home' or 'away'"];
                        break;
                    }
                    $updatedData['team'] = $params['new_team'];
                    $isChanged = true;
                }
            }

            $providedUpdateParams = isset($params['new_playerId']) || isset($params['new_timestamp']) || isset($params['new_team']);

            if (!$providedUpdateParams || !$isChanged) {
                http_response_code(400);
                $response = ["error" => "No data to update or new values are the same as current values"];
                break;
            }

            // Preserve existing data that isn't being updated
            $updatedData['eventId'] = $eventId;
            $updatedData['placardId'] = $placardId;
            $updatedData['playerId'] = $updatedData['playerId'] ?? $currentPointData['playerId'];
            $updatedData['team'] = $updatedData['team'] ?? $currentPointData['team'];
            $updatedData['timestamp'] = $updatedData['timestamp'] ?? $currentPointData['timestamp'];
            $updatedData['teamPoints'] = $currentPointData['teamPoints'];
            $updatedData['totalPoints'] = $currentPointData['totalPoints'];

            $totalPointsForZadd = $updatedData['totalPoints'];

            $redis->multi();
            $redis->hMSet($pointEventKey, $updatedData);
            $redis->zAdd($gamePointsKey, $totalPointsForZadd, $pointEventKey);
            $result = $redis->exec();

            if ($result) {
                $response = [
                    "message" => "Point event updated successfully",
                    "event" => $updatedData
                ];
            } else {
                http_response_code(500);
                $response = ["error" => "Failed to update point event"];
            }
            break;

        default:
            http_response_code(400);
            $response = ["error" => "Invalid action specified"];
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>