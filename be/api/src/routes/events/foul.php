<?php
declare(strict_types=1);

require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../classes/AbstractEvent.php';
require_once __DIR__ . '/../../classes/FoulEvent.php';

header('Content-Type: application/json');

try {
    $redis = RedistUtils::connect();
    if (!$redis || !$redis->ping()) {
        throw new Exception("Failed to connect to Redis or connection lost.");
    }
} catch (Exception $e) {
    error_log("Redis Connection Error: " . $e->getMessage());
    http_response_code(503);
    echo json_encode(['status' => 'error', 'message' => 'Service unavailable (Database connection failed).']);
    exit;
}

$requestMethod = $_SERVER['REQUEST_METHOD'];
$params = RequestUtils::getRequestParams();
$response = ['status' => 'error', 'message' => 'Invalid request.'];

$allowedActions = ['create', 'update', 'delete', 'gameStatus'];

$actionParam = $params['action'] ?? null;
if ($actionParam === null || trim((string)$actionParam) === '') {
     http_response_code(400);
     echo json_encode(["status" => "error", "message" => "Missing required parameter: action"]);
     exit;
}
$action = trim((string)$actionParam);
if (!in_array($action, $allowedActions)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid action specified: '{$action}'"]);
    exit;
}


$placardIdParam = $params['placardId'] ?? null;
$sportParam = $params['sport'] ?? null;

$missingBaseParams = [];
if ($placardIdParam === null || trim((string)$placardIdParam) === '') {
    $missingBaseParams[] = 'placardId';
}
if ($sportParam === null || trim((string)$sportParam) === '') {
    $missingBaseParams[] = 'sport';
}

if (!empty($missingBaseParams)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing or empty required parameters: ' . implode(', ', $missingBaseParams)]);
    exit;
}

$placardId = trim((string)$placardIdParam);
$sport = trim((string)$sportParam);


if ($action === 'get_player_fouls' && $requestMethod === 'GET') {
    $playerIdGetParam = $params['playerId'] ?? null;
    if ($playerIdGetParam === null || trim((string)$playerIdGetParam) === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing or empty required parameter: playerId for action 'get_player_fouls'"]);
        exit;
    }
    $params['playerId'] = trim((string)$playerIdGetParam);
} elseif ($action === 'update' || $action === 'delete') {
    $eventIdParam = $params['eventId'] ?? null;
    if ($eventIdParam === null) {
         http_response_code(400);
         echo json_encode(["status" => "error", "message" => "Missing required parameter: eventId for action '{$action}'"]);
         exit;
    }

    if (!is_numeric($eventIdParam) || ($convertedEventId = (int)$eventIdParam) <= 0 || (string)$convertedEventId !== preg_replace('/\.0+$/', '', (string)$eventIdParam)) {
         http_response_code(400);
         echo json_encode(["status" => "error", "message" => "Invalid eventId: Must be a positive integer for action '{$action}'."]);
         exit;
    }
    $params['eventId'] = $convertedEventId;
}

if ($action === 'update') {
    if (isset($params['period'])) {
        $periodUpdateParam = $params['period'];
        if (!is_numeric($periodUpdateParam) || ($convertedPeriodUpdate = (int)$periodUpdateParam) < 1 || (string)$convertedPeriodUpdate !== preg_replace('/\.0+$/', '', (string)$periodUpdateParam)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Invalid period for update: Must be a positive integer."]);
            exit;
        }
        $params['period'] = $convertedPeriodUpdate;
    }
}


try {
    $gameConfigManager = new GameConfig();
    $sportSpecificConfig = $gameConfigManager->getConfig($sport);
    $totalPeriods = $sportSpecificConfig['periods'] ?? null;
    if (is_null($totalPeriods)) {
        throw new Exception("Configuration error: Sport '{$sport}' is missing the 'periods' definition.");
    }
    $foulsPenaltyThreshold = $sportSpecificConfig['foulsPenaltyThreshold'] ?? null;
    $penaltyTypeConfig = $sportSpecificConfig['penaltyType'] ?? null;

    $foulKeysConfig = RequestUtils::getRedisKeys($placardId, 'fouls');
    if (is_null($foulKeysConfig) || !isset($foulKeysConfig['event_counter']) || !isset($foulKeysConfig['game_fouls']) || !isset($foulKeysConfig['foul_event']) || !isset($foulKeysConfig['accumulated_foul'])) {
        throw new Exception("Configuration error: Could not retrieve all required Redis foul key configurations.");
    }
    $gameFoulsKey = $foulKeysConfig['game_fouls'];
    $eventCounterKey = $foulKeysConfig['event_counter'];
    $foulEventBaseKey = $foulKeysConfig['foul_event'];
    $accumulatedFoulBaseKey = $foulKeysConfig['accumulated_foul'];


    switch ($action) {
        case 'create':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method. Only POST is allowed for 'create'."];
                break;
            }

            $playerIdParam = $params['playerId'] ?? null;
            $teamParam = $params['team'] ?? null;
            $periodParam = $params['period'] ?? null;

            $missingFields = [];
 
            $playerIdStr = trim((string)$playerIdParam);
            if ($playerIdParam === null || $playerIdStr === '') $missingFields[] = 'playerId';

            $teamStr = trim((string)$teamParam);
            if ($teamParam === null || $teamStr === '') $missingFields[] = 'team';
            
            

            if (!empty($missingFields)) {
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Missing or empty required fields for create: ' . implode(', ', $missingFields)];
                break;
            }

            $timestamp = RequestUtils::getGameTimePosition($placardId, $sportSpecificConfig);
            $currentPeriod = RequestUtils::getGamePeriod($placardId, $sportSpecificConfig);
            if ($currentPeriod > $totalPeriods) {
                 http_response_code(400);
                 $response = ['status' => 'error', 'message' => "Cannot record foul: Provided period ({$currentPeriod}) exceeds total periods ({$totalPeriods}) for sport '{$sport}'."];
                 break;
            }

            $eventIdRedis = $redis->incr($eventCounterKey);
            if ($eventIdRedis === false) {
                 throw new Exception("Failed to increment foul event counter key '{$eventCounterKey}'.");
            }
            $eventIdStringForRedis = (string)$eventIdRedis;
            $foulEventKey = $foulEventBaseKey . $eventIdStringForRedis;
            $accumulatedFoulKey = $accumulatedFoulBaseKey . "{$teamStr}:period:{$currentPeriod}:fouls_accumulated";

            $foulEvent = new FoulEvent((string)$timestamp, $sport, null, $playerIdStr, $teamStr, $currentPeriod);
            $foulEvent->setId($eventIdStringForRedis);

            $foulDataForRedis = [
                'eventId' => $eventIdStringForRedis,
                'placardId' => $placardId,
                'sport' => $sport,
                'playerId' => $playerIdStr, 
                'team' => $teamStr,        
                'timestamp' => (string)$timestamp,
                'period' => (string)$currentPeriod
            ];
            
            $redis->multi();
            $redis->hMSet($foulEventKey, $foulDataForRedis);
            $redis->zAdd($gameFoulsKey, $timestamp, $foulEventKey);
            $redis->incr($accumulatedFoulKey);
            $results = $redis->exec();

            if ($results === false || !isset($results[0], $results[1], $results[2]) || $results[0] === false || $results[1] === false || $results[2] === false) {
                 $redis->del($foulEventKey);
                 $redis->zRem($gameFoulsKey, $foulEventKey);
                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to atomically record foul."];
                 error_log("Redis MULTI/EXEC failed for foul creation. Placard: {$placardId}, eventId Attempted: {$eventIdStringForRedis}, Results: " . print_r($results, true));
            } else {
                 http_response_code(201);
                 $accumulatedFoulsThisPeriod = (int)$results[2];
               
                 $responseData = [
                    'eventId' => $eventIdStringForRedis,
                    'placardId' => $placardId,
                    'sport' => $sport,
                    'playerId' => $playerIdStr,
                    'team' => $teamStr, 
                    'timestamp' => $timestamp,
                    'period' => $currentPeriod,     
                    'accumulatedFoulsThisPeriod' => $accumulatedFoulsThisPeriod,
                    'penalty' => false,
                 ];
                 
                 $responseMessage = 'Foul created.';

                 if ($foulsPenaltyThreshold !== null && $accumulatedFoulsThisPeriod > 0 && ($accumulatedFoulsThisPeriod > $foulsPenaltyThreshold  )) {
                     $responseData['penalty'] = true;
                     $responseData['penaltyFouls'] = $accumulatedFoulsThisPeriod;
                     $responseData['penaltyThreshold'] = $foulsPenaltyThreshold;
                     $responseData['penaltyTypeConfigured'] = $penaltyTypeConfig;
                     $responseMessage .= " Team '{$teamStr}' reached penalty threshold.";
                 }
                 
                 $response = [
                     'status' => 'success',
                     'message' => $responseMessage,
                     'foul' => $responseData
                 ];
            }
            break;

        case 'update':
            if ($requestMethod !== 'POST' && $requestMethod !== 'PUT') {
                http_response_code(405);
                $response = [
                    'status' => 'error',
                    'message' => "Invalid request method. Only POST or PUT is allowed for 'update'."
                ];
                break;
            }

            $eventIdToUpdate = $params['eventId'];

            $foulEventKey = $foulEventBaseKey . (string)$eventIdToUpdate;
            $redis->watch($foulEventKey);
            $originalFoulData = $redis->hGetAll($foulEventKey);

            if (empty($originalFoulData)) {
                $redis->unwatch();
                http_response_code(404);
                $response = [
                    'status' => 'error',
                    'message' => 'Update failed: foul event not found.'
                ];
                break;
            }

       
            $originalPlayerId = (string)($originalFoulData['playerId'] ?? '');
            $originalTeam = (string)($originalFoulData['team'] ?? '');
            $originalPeriod = isset($originalFoulData['period']) ? (int)$originalFoulData['period'] : null;

            $updateData = []; $isChanged = false; $teamChanged = false; $periodChanged = false;
            $newPeriodForUpdate = $originalPeriod;


            if (array_key_exists('playerId', $params)) { 
                $playerIdUpdateStr = trim((string)($params['playerId'] ?? ''));
                if ($playerIdUpdateStr === '') { 
                    $redis->unwatch(); http_response_code(400);
                    $response = ['status' => 'error', 'message' => 'Update failed: playerId cannot be empty if provided.'];
                    break;
                }
                if ($playerIdUpdateStr !== $originalPlayerId) {
                    $updateData['playerId'] = $playerIdUpdateStr; $isChanged = true;
                }
            }

            if (array_key_exists('team', $params)) {
                $teamUpdateStr = trim((string)($params['team'] ?? ''));
                if ($teamUpdateStr === '') { 
                    $redis->unwatch(); http_response_code(400);
                    $response = ['status' => 'error', 'message' => 'Update failed: team cannot be empty if provided.'];
                    break;
                }
                if ($teamUpdateStr !== $originalTeam) {
                    $updateData['team'] = $teamUpdateStr; $teamChanged = true; $isChanged = true;
                }
            }
            
 
            if (isset($params['period'])) {
                $periodUpdateInt = $params['period']; 
                if ($periodUpdateInt !== $originalPeriod) {
                    if ($periodUpdateInt > $totalPeriods) {  break ; }
                    $updateData['period'] = (string)$periodUpdateInt;
                    $newPeriodForUpdate = $periodUpdateInt;
                    $periodChanged = true; $isChanged = true;
                }
            }

            if (!$isChanged) {
                $redis->unwatch();
                http_response_code(200);
                $response = [
                    'status' => 'success',
                    'message' => 'No changes detected. Foul event not updated.',
                    'foul' => [
                        'eventId' => (string)$originalFoulData['eventId'],
                        'placardId' => (string)$originalFoulData['placardId'],
                        'sport' => (string)$originalFoulData['sport'],
                        'playerId' => (string)$originalFoulData['playerId'],
                        'team' => (string)$originalFoulData['team'],
                        'timestamp' => (float)$originalFoulData['timestamp'],
                        'period' => (int)$originalFoulData['period'],
                    ]
                ];
                break;
            }

            $redis->multi();
            $redis->hMSet($foulEventKey, $updateData);
            $idxOffset = 1;

            if (($teamChanged || $periodChanged) && $originalTeam !== null && $originalPeriod !== null) {
                $oldAccumulatedKey = $accumulatedFoulBaseKey . "{$originalTeam}:period:{$originalPeriod}:fouls_accumulated";
                $redis->decr($oldAccumulatedKey);

                $currentTeamForNewCount = $updateData['team'] ?? $originalTeam;
                $currentPeriodForNewCount = $newPeriodForUpdate; 
                
                $newAccumulatedKey = $accumulatedFoulBaseKey . "{$currentTeamForNewCount}:period:{$currentPeriodForNewCount}:fouls_accumulated";
                $redis->incr($newAccumulatedKey);
                $idxOffset += 2;
            }
            
            $results = $redis->exec();

            if ($results === false) {
                $redis->unwatch();
                http_response_code(500);
                $response = [
                    'status' => 'error',
                    'message' => 'Update failed: Redis transaction error.'
                ];
            }
            elseif (is_array($results) && isset($results[0]) && $results[0] === false) {
                $redis->unwatch();
                http_response_code(500);
                $response = [
                    'status' => 'error',
                    'message' => 'Update failed: Redis did not update the foul event (possibly modified by another process).'
                ];
            }
            else {
                $finalFoulDataFromRedis = $redis->hGetAll($foulEventKey);
                $updatedFoulResponseData = [
                    'eventId' => (string)$finalFoulDataFromRedis['eventId'],
                    'placardId' => (string)$finalFoulDataFromRedis['placardId'],
                    'sport' => (string)$finalFoulDataFromRedis['sport'],
                    'playerId' => (string)$finalFoulDataFromRedis['playerId'],
                    'team' => (string)$finalFoulDataFromRedis['team'],
                    'timestamp' => (float)$finalFoulDataFromRedis['timestamp'],
                    'period' => (int)$finalFoulDataFromRedis['period'],
                ];
                
                $responseMessage = 'Foul updated.'; 

                if (($teamChanged || $periodChanged) && $originalTeam !== null && $originalPeriod !== null && isset($results[$idxOffset-1])) {
                    $newTeamFoulCountForAlert = (int)$results[$idxOffset-1];
                    $updatedFoulResponseData['accumulatedFoulsThisPeriod'] = $newTeamFoulCountForAlert;

                    if ($foulsPenaltyThreshold !== null && $accumulatedFoulsThisPeriod > 0 && ($accumulatedFoulsThisPeriod > $foulsPenaltyThreshold  )) {
                        $updatedFoulResponseData['penalty'] = true;
      
                        $responseMessage .= " Team '{$updatedFoulResponseData['team']}' reached penalty threshold.";
                    }
                }
                
                $response = [
                    'status' => 'success',
                    'message' => $responseMessage,
                    'foul' => $updatedFoulResponseData
                ];
                http_response_code(200);
            }
            break;

        case 'delete':
            if ($requestMethod !== 'POST' && $requestMethod !== 'DELETE') { /* ... */ }

            $eventIdToDelete = $params['eventId']; 

            $foulEventKey = $foulEventBaseKey . (string)$eventIdToDelete;
            $redis->watch($foulEventKey);
            $originalFoulData = $redis->hGetAll($foulEventKey);

            if (empty($originalFoulData)) { 
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Delete failed: foul event not found or already deleted.'];
                break; }
            $originalTeam = (string)($originalFoulData['team'] ?? ''); 
            $originalPeriod = isset($originalFoulData['period']) ? (int)$originalFoulData['period'] : null;

            if (empty($originalTeam) || $originalPeriod === null) { 
                http_response_code(422);
                $response = ['status' => 'error', 'message' => 'Delete failed: missing team or period information for the foul event.'];
                break; }
            
            $accumulatedFoulKey = $accumulatedFoulBaseKey . "{$originalTeam}:period:{$originalPeriod}:fouls_accumulated";
            
            $redis->multi(); 
            $redis->del($foulEventKey);
            $redis->zRem($gameFoulsKey, $foulEventKey);
            $redis->decr($accumulatedFoulKey);
            $results = $redis->exec();


            if ($results === false) {
                http_response_code(500);
                $response = [
                    'status' => 'error',
                    'message' => 'Delete failed: Redis transaction error.'
                ];
            }
            elseif (is_array($results) && (!isset($results[0]) || $results[0] < 1)) {
                http_response_code(404);
                $response = [
                    'status' => 'error',
                    'message' => 'Delete failed: foul event not found or already deleted (nothing removed).'
                ];
            }
            else {
                http_response_code(200);
                $newAccumulatedCount = (isset($results[2]) && $results[2] !== false) ? (int)$results[2] : null;
                $response = [
                    'status' => 'success',
                    'message' => 'Foul deleted.',
                    'eventId' => (string)$eventIdToDelete,
                ];
                if ($newAccumulatedCount !== null) {
                    $response['newAccumulatedCountForTeam'] = $newAccumulatedCount;
                }
            }
            break;

        case 'gameStatus':
            if ($requestMethod !== 'POST' && $requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method."];
                break;
            }

   
            $currentPeriod = RequestUtils::getGamePeriod($placardId, $sportSpecificConfig);
            

            $homeFoulsCurrentPeriodKey = $accumulatedFoulBaseKey . "home:period:{$currentPeriod}:fouls_accumulated";
            $awayFoulsCurrentPeriodKey = $accumulatedFoulBaseKey . "away:period:{$currentPeriod}:fouls_accumulated";

            $pipeline = $redis->pipeline();
            $pipeline->get($homeFoulsCurrentPeriodKey);
            $pipeline->get($awayFoulsCurrentPeriodKey);
            $foulCounts = $pipeline->exec();

            $homeFoulsThisPeriod = 0;
            $awayFoulsThisPeriod = 0;

            if ($foulCounts === false) {
                error_log("Redis pipeline failed in gameStatus (fouls) for placardId: {$placardId}");
            } else {
                $homeFoulsThisPeriod = (int)($foulCounts[0] ?? 0);
                $awayFoulsThisPeriod = (int)($foulCounts[1] ?? 0);
            }

            http_response_code(200);
            $response = [
                'status' => 'success',
                'message' => "Game foul status for period {$currentPeriod} retrieved.",
                'data' => [
                    'placardId' => $placardId,
                    'sport' => $sport,
                    'currentGamePeriod' => (int)$currentPeriod,
                    'currentPeriodFouls' => [
                        'home' => $homeFoulsThisPeriod,
                        'away' => $awayFoulsThisPeriod,
                    ],
                    'foulsPenaltyThreshold' => $foulsPenaltyThreshold,
                ]
            ];
            break;
        default:
            http_response_code(400);
            $response = ['status' => 'error', "message" => "Action '{$action}' is not supported or invalid."];
            break;
    }

}  catch (Exception $e) {
    $httpStatusCode = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500;
    if (!headers_sent()) {
        if (http_response_code() < 400 || http_response_code() === 200) {
            http_response_code($httpStatusCode);
        }
    }
    error_log("Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine()); // Simplificado
    $response = ["status" => "error", "message" => "An internal server error occurred."]; // Mensagem genérica para o cliente
}

if (!headers_sent() && isset($response)) {
    header('Content-Type: application/json');
    echo json_encode($response);
} elseif (!headers_sent() && !isset($response)) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server failed to produce a response.']);
}
exit;