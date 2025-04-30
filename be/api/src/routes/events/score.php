<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/PointUtils.php';

header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['get', 'create', 'delete', 'update', 'gameStatus'];

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

if (($action === 'create') && empty($team)) {
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
    $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');

    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    $gamePointsKey = $keys['game_points'];
    $eventCounterKey = $keys['event_counter'];
    $homePointsKey = $keys['home_points'];
    $awayPointsKey = $keys['away_points'];
    $actualPeriodKey = $timerKeys['period'];
    $totalGamePointsKey = $keys['total_game_points'];

    $pipeline = $redis->pipeline();
    $pipeline->get($homePointsKey);
    $pipeline->get($awayPointsKey);
    $pipeline->get($actualPeriodKey);
    $results = $pipeline->exec();

    $homePoints = $results[0] ?? 0;
    $awayPoints = $results[1] ?? 0;
    $currentPeriod = (int)($results[2] ?? 1);

    if (!$results[2] || $currentPeriod < 1) {
        $currentPeriod = 1;
        $redis->set($actualPeriodKey, $currentPeriod);
    }


    switch ($action) {
        case 'create':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for create action."];
                break;
            }

            $points = null;
            $pointValue = null;
            $playerId = $params['playerId'] ?? null;

            if(!$playerId) {
                http_response_code(400);
                $response = ["error" => "Missing playerId for create action"];
                break;
            }

            if (is_array($gameConfig['points'])) {
                $pointValue = $params['pointValue'] ?? null;
                
                if (!is_numeric($pointValue) || !in_array((int)$pointValue, $gameConfig['points'])) {
                    http_response_code(400);
                    $response = ["error" => "For $sport, pointValue must be one of: " . implode(', ', $gameConfig['points'])];
                    break;
                }
                
            } else {
                $pointValue = $gameConfig['points'];
            }

            if (is_numeric($pointValue)) {
                $points = (int)$pointValue;
            } else {
                http_response_code(400);
                $response = ["error" => "Invalid point value"];
                break;
            }


            if (!PointUtils::canModifyPoints($placardId, $sport, $team, $points)) {
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

            PointUtils::changePeriod($placardId, $sport, $team);

            $timestamp = RequestUtils::getGameTimePosition($placardId, $gameConfig);

            $currentHomePoints = ($team === 'home') ? $points : (int)$homePoints;
            $currentAwayPoints = ($team === 'away') ? $points : (int)$awayPoints;
            $totalGamePoints = (int)$currentHomePoints + (int)$currentAwayPoints;

            for ($i = 1; $i < $currentPeriod; $i++) {
                $setKey = $keys['set_points'] . $i;
                if ($redis->exists($setKey)) {
                    $periodData = $redis->hGetAll($setKey);
                    $totalGamePoints += (int)$periodData['set_total_points'];
                }
            }

            $pointData = [
                'eventId' => $eventId,
                'placardId' => $placardId,
                'team' => $team,
                'playerId' => $playerId,
                'period' => $currentPeriod,
                'pointValue' => $pointValue,
            ];

            $redis->multi();
            $redis->hMSet($pointEventKey, $pointData);
            $redis->zAdd($gamePointsKey, $totalGamePoints, $pointEventKey);
            $redis->set($totalGamePointsKey, $totalGamePoints);
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

        case 'delete':
            if ($requestMethod !== 'POST') {
               http_response_code(405); 
               $response = ["error" => "Invalid request method. Only POST is allowed for " . $action . " action."];
               break;
            }

           $eventId = $params['eventId'] ?? null;

           if (!$eventId) {
               http_response_code(400);
               $response = ["error" => "Missing eventId for " . $action . " action."];
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

           PointUtils::adjustPoints($placardId, $sport);

           if ($result && isset($result[0]) && $result[0] > 0 && isset($result[1]) && $result[1] > 0) {
                $response = [
                    "message" => "Point event deleted successfully",
                    "eventId" => $eventId
                ];
           } else {
                http_response_code(500);
                $response = ["error" => "Failed to delete point event"];
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
        
            if(isset($params['playerId'])){
                if ($params['playerId'] != $currentPointData['playerId']) {
                    $updatedData['playerId'] = $params['playerId'];
                    $isChanged = true;
                }
            }
        
            if(isset($params['team'])) {
                if ($params['team'] !== $currentPointData['team']) {
                    if (!in_array($params['team'], ['home', 'away'])) {
                        http_response_code(400);
                        $response = ["error" => "Team parameter must be 'home' or 'away'"];
                        break;
                    }
                    $updatedData['team'] = $params['team'];
                    $isChanged = true;
                }
            }
        
            if (isset($params['pointValue'])) {
                $newPointValue = $params['pointValue'];
                if (!is_numeric($newPointValue)) {
                    http_response_code(400);
                    $response = ["error" => "pointValue must be numeric"];
                    break;
                }
                if ($newPointValue != $currentPointData['pointValue']) {
                    $updatedData['pointValue'] = $newPointValue;
                    $isChanged = true;
                }
            }
        
            $providedUpdateParams = isset($params['playerId']) || isset($params['team']) || isset($params['pointValue']);
        
            if (!$providedUpdateParams || !$isChanged) {
                http_response_code(400);
                $response = ["error" => "No data to update or new values are the same as current values"];
                break;
            }
        
            $updatedData['eventId'] = $eventId;
            $updatedData['placardId'] = $placardId;
            $updatedData['playerId'] = $updatedData['playerId'] ?? $currentPointData['playerId'];
            $updatedData['team'] = $updatedData['team'] ?? $currentPointData['team'];
            $updatedData['period'] = $currentPointData['period'];
            $updatedData['pointValue'] = $updatedData['pointValue'] ?? $currentPointData['pointValue'];
        
            $redis->multi();
            $redis->hMSet($pointEventKey, $updatedData);
            $redis->exec();
        
            PointUtils::adjustPoints($placardId, $sport);
        
            $response = [
                "message" => "Point event updated successfully",
                "event" => $updatedData
            ];
            break;
        
        case 'gameStatus':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for gameStatus action."];
                break;
            }
        
            $totalPeriods = (int)($gameConfig['periods'] ?? $currentPeriod);
            
            $pipeline = $redis->pipeline();
            for ($i = 1; $i <= $totalPeriods; $i++) {
                $setKey = $keys['set_points'] . $i;
                $pipeline->hGetAll($setKey);
            }
            $periodsData = $pipeline->exec();
            
            $periods = [];
            $totalHomePoints = 0;
            $totalAwayPoints = 0;
            
            for ($i = 1; $i <= $totalPeriods; $i++) {
                $periodData = $periodsData[$i-1] ?? [];
                
                if ($i == $currentPeriod) {
                    $homePointsInPeriod = (int)$homePoints;
                    $awayPointsInPeriod = (int)$awayPoints;
                    $periodTotalPoints = $homePointsInPeriod + $awayPointsInPeriod;
                } else if (!empty($periodData)) {
                    $homePointsInPeriod = (int)($periodData['home_points'] ?? 0);
                    $awayPointsInPeriod = (int)($periodData['away_points'] ?? 0);
                    $periodTotalPoints = (int)($periodData['set_total_points'] ?? 0);
                } else {
                    $homePointsInPeriod = 0;
                    $awayPointsInPeriod = 0;
                    $periodTotalPoints = 0;
                }
                
                $periods[] = [
                    'period' => $i,
                    'homePoints' => $homePointsInPeriod,
                    'awayPoints' => $awayPointsInPeriod,
                    'totalPoints' => $periodTotalPoints
                ];
                
                $totalHomePoints += $homePointsInPeriod;
                $totalAwayPoints += $awayPointsInPeriod;
            }
        
            $response = [
                "totalPeriods" => $totalPeriods,
                "currentScore" => [
                    "homeScore" => (int)$homePoints,
                    "awayScore" => (int)$awayPoints
                ],
                "periods" => $periods
            ];
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