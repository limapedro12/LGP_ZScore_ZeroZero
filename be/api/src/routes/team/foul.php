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

$requiredParams = ['gameId', 'gameType', 'action'];
$allowedActions = ['create', 'update', 'delete', 'get_accumulated', 'list_game_fouls', 'get_player_fouls'];


$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400); 
    echo json_encode($validationError); 
    exit;
}

$gameId = trim($params['gameId'] ?? '');
$gameType = trim($params['gameType'] ?? '');
$action = trim($params['action'] ?? '');

if (empty($gameId) || empty($gameType)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'gameId and gameType cannot be empty.']);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $currentGameConfig = $gameConfigManager->getConfig($gameType);
    $totalPeriods = $currentGameConfig['periods'];

    $currentPeriodKey = "game:{$gameId}:period";
    $foulCounterKey = "game:{$gameId}:foul_counter";
    $gameFoulsSetKey = "game:{$gameId}:fouls"; 


    switch ($action) {

        case 'create':
            if ($requestMethod !== 'POST') {
                http_response_code(405); 
                $response = ["status" => "error", "message" => "Invalid request method. Only POST is allowed for 'create'."];
                break;
            }

            $playerId = trim($params['playerId'] ?? '');
            $teamId = trim($params['teamId'] ?? '');
            $foulTime = trim($params['foulTime'] ?? ''); 

            $missingFields = [];
            if (empty($playerId)) $missingFields[] = 'playerId';
            if (empty($teamId)) $missingFields[] = 'teamId';
            if ($foulTime === '') $missingFields[] = 'foulTime'; 

            if (!empty($missingFields)) {
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Missing required fields for create: ' . implode(', ', $missingFields)];
                break;
            }

            $currentPeriod = $redis->get($currentPeriodKey);
            if ($currentPeriod === false || !is_numeric($currentPeriod) || (int)$currentPeriod < 1) {
                 http_response_code(409); 
                 $response = ['status' => 'error', 'message' => "Cannot record foul: Game period is not set or is invalid in Redis key '{$currentPeriodKey}'. Set the period first."];
                 break;
            }
            $currentPeriod = (int)$currentPeriod;

            if ($currentPeriod > $totalPeriods) {
                 http_response_code(409);
                 $response = ['status' => 'error', 'message' => "Cannot record foul: Current period ({$currentPeriod}) exceeds total periods ({$totalPeriods}) for game type '{$gameType}'."];
                 break;
            }


            $newFoulId = $redis->incr($foulCounterKey);
            if ($newFoulId === false) {
                 throw new Exception("Failed to generate foul ID using key '{$foulCounterKey}'.");
            }
            $newFoulIdStr = (string)$newFoulId;

            $foulDataKey = "foul:{$gameId}:{$newFoulIdStr}"; 
            $accumulatedFoulKey = "game:{$gameId}:team:{$teamId}:period:{$currentPeriod}:fouls_accumulated"; 

            $foulEvent = new FoulEvent(
                $foulTime,           
                null,           
                $playerId,      
                $teamId,        
                $currentPeriod  
            );
            $foulEvent->setId($newFoulIdStr); 

            $foulDataForRedis = [
                'foulId'     => $foulEvent->getId(),
                'gameId'     => $gameId, 
                'playerId'   => $foulEvent->getPlayerId(),
                'teamId'     => $foulEvent->getTeamId(),
                'time'       => $foulEvent->getTime(),
                'period'     => (string)$foulEvent->getPeriod(), 
                'recordedAt' => (string)time() 
            ];

            $redis->multi();
            $redis->hMSet($foulDataKey, $foulDataForRedis);    
            $redis->sAdd($gameFoulsSetKey, $foulDataKey);     
            $redis->incr($accumulatedFoulKey);                 
            $results = $redis->exec();

            if ($results === false || !isset($results[0]) || $results[0] === false || !isset($results[1]) || $results[1] === false || !isset($results[2]) || $results[2] === false) {

                 $redis->del($foulDataKey);
                 $redis->sRem($gameFoulsSetKey, $foulDataKey);
                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to atomically record foul and update accumulated count."];
                 error_log("Redis MULTI/EXEC failed for foul creation. Game: {$gameId}, FoulID Attempted: {$newFoulIdStr}, Results: " . print_r($results, true));
            } else {
                 http_response_code(201); 
                 $response = [
                     'status' => 'success',
                     'message' => 'Foul created and accumulated count updated.',
                     'foulId' => $foulEvent->getId(), 
                     'foulDataKey' => $foulDataKey,
                     'data' => $foulDataForRedis, 
                     'accumulatedFoulsThisPeriod' => (int)$results[2]
                 ];
            }
            break; 



        case 'update':
             if ($requestMethod !== 'POST') { 
                 http_response_code(405);
                 $response = ["status" => "error", "message" => "Invalid request method. Only POST is allowed for 'update'."];
                 break;
             }

             $foulId = trim($params['foulId'] ?? '');
             if (empty($foulId)) {
                 http_response_code(400);
                 $response = ['status' => 'error', 'message' => 'Missing required field for update: foulId.'];
                 break;
             }

             $foulDataKey = "foul:{$gameId}:{$foulId}";

             $redis->watch($foulDataKey); 
             $originalFoulData = $redis->hGetAll($foulDataKey);

             if (empty($originalFoulData)) {
                 $redis->unwatch();
                 http_response_code(404);
                 $response = ["status" => "error", "message" => "Foul with ID {$foulId} not found for game {$gameId}."];
                 break;
             }

             $updateData = [];
             $isChanged = false;
             $teamChanged = false;
             $originalTeamId = $originalFoulData['teamId'] ?? null;
             $originalPeriod = $originalFoulData['period'] ?? null; 
             $newTeamId = $originalTeamId; 

             if (isset($params['playerId']) && trim($params['playerId']) !== $originalFoulData['playerId']) {
                 $updateData['playerId'] = trim($params['playerId']);
                 $isChanged = true;
             }
             if (isset($params['teamId']) && trim($params['teamId']) !== $originalTeamId) {
                 $newTeamId = trim($params['teamId']); 
                 if(!empty($newTeamId)) { 
                     $updateData['teamId'] = $newTeamId;
                     $teamChanged = true;
                     $isChanged = true;
                 } else {
                    $redis->unwatch();
                    http_response_code(400);
                    $response = ['status' => 'error', 'message' => 'New teamId cannot be empty.'];
                    break; 
                 }
             }
             if (isset($params['foulTime']) && trim($params['foulTime']) !== $originalFoulData['time']) {
                 $updateData['time'] = trim($params['foulTime']);
                 $isChanged = true;
             }

             if (!$isChanged) {
                 $redis->unwatch();
                 http_response_code(400);
                 $response = ['status' => 'error', 'message' => 'No changes detected or no update fields provided.'];
                 break;
             }

             $updateData['updatedAt'] = (string)time();

             $redis->multi();
             $redis->hMSet($foulDataKey, $updateData);

             if ($teamChanged && $originalTeamId && $originalPeriod) {
                 $oldAccumulatedKey = "game:{$gameId}:team:{$originalTeamId}:period:{$originalPeriod}:fouls_accumulated";
                 $newAccumulatedKey = "game:{$gameId}:team:{$newTeamId}:period:{$originalPeriod}:fouls_accumulated"; 
                 $redis->decr($oldAccumulatedKey); 
                 $redis->incr($newAccumulatedKey); 
             }

             $results = $redis->exec();

             if ($results === false) {
                 http_response_code(409); 
                 $response = ["status" => "error", "message" => "Update failed due to a conflict. Please retry."];
                 error_log("Redis WATCH/MULTI/EXEC failed for foul update. Game: {$gameId}, FoulID: {$foulId}. Key might have changed.");
             } elseif(is_array($results) && isset($results[0]) && $results[0] === false) {

                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to update foul data in Redis."];
                 error_log("Redis HMSET failed within MULTI/EXEC for foul update. Game: {$gameId}, FoulID: {$foulId}. Results: " . print_r($results, true));
             } else {

                 $finalFoulData = $redis->hGetAll($foulDataKey); 
                 $response = [
                     'status' => 'success',
                     'message' => 'Foul updated successfully.' . ($teamChanged ? ' Accumulated counts adjusted.' : ''),
                     'foulId' => $foulId,
                     'foulDataKey' => $foulDataKey,
                     'data' => $finalFoulData 
                 ];
                 if ($teamChanged) {

                     if(isset($results[1])) $response['oldTeamNewCount'] = (int)$results[1];
                     if(isset($results[2])) $response['newTeamNewCount'] = (int)$results[2];
                 }
                 http_response_code(200); // OK
             }
             break; 


        case 'delete':
            if ($requestMethod !== 'POST') { 
                 http_response_code(405);
                 $response = ["status" => "error", "message" => "Invalid request method. Only POST is allowed for 'delete'."];
                 break;
             }

            $foulId = trim($params['foulId'] ?? '');
            if (empty($foulId)) {
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Missing required field for delete: foulId.'];
                break;
            }

            $foulDataKey = "foul:{$gameId}:{$foulId}";


            $redis->watch($foulDataKey);
            $originalFoulData = $redis->hGetAll($foulDataKey);

            if (empty($originalFoulData)) {
                $redis->unwatch();
                http_response_code(404);
                $response = ["status" => "error", "message" => "Foul with ID {$foulId} not found for game {$gameId}."];
                break;
            }

            $originalTeamId = $originalFoulData['teamId'] ?? null;
            $originalPeriod = $originalFoulData['period'] ?? null;

            if (!$originalTeamId || !$originalPeriod) {
                 $redis->unwatch();

                 error_log("Inconsistent foul data found for deletion: Game {$gameId}, Foul {$foulId}. Missing teamId or period.");
                 http_response_code(500);
                 $response = ['status' => 'error', 'message' => 'Cannot delete foul due to inconsistent data.'];
                 break;
            }

            $accumulatedFoulKey = "game:{$gameId}:team:{$originalTeamId}:period:{$originalPeriod}:fouls_accumulated";


            $redis->multi();
            $redis->del($foulDataKey);                
            $redis->sRem($gameFoulsSetKey, $foulDataKey); 
            $redis->decr($accumulatedFoulKey);          
            $results = $redis->exec();


            if ($results === false) {
                 http_response_code(409); 
                 $response = ["status" => "error", "message" => "Delete failed due to a conflict or error. Please retry."];
                 error_log("Redis WATCH/MULTI/EXEC failed for foul delete. Game: {$gameId}, FoulID: {$foulId}.");
            } elseif (is_array($results) && (!isset($results[0]) || $results[0] < 1)) {
 
                 http_response_code(500); 
                 $response = ["status" => "error", "message" => "Failed to delete foul data key, it might have been removed already or delete failed."];
                 error_log("Redis DEL failed within MULTI/EXEC for foul delete. Game: {$gameId}, FoulID: {$foulId}. Results: " . print_r($results, true));
            } else {
                 http_response_code(200); // OK
                 $response = [
                     'status' => 'success',
                     'message' => 'Foul deleted and accumulated count updated.',
                     'foulId' => $foulId,
                     'newAccumulatedCount' => isset($results[2]) ? (int)$results[2] : 'N/A' 
                 ];
            }
            break; 


        case 'get_accumulated':
            $teamIds = $params['teamIds'] ?? null;
            if (is_null($teamIds) || !is_array($teamIds)) {
                $teamIds = ['home', 'away']; 
            }

            $accumulated = [];
            $pipe = $redis->pipeline();
            $keysToFetch = [];

            for ($p = 1; $p <= $totalPeriods; $p++) {
                $accumulated["period_{$p}"] = []; 
                foreach ($teamIds as $tId) {
                    $key = "game:{$gameId}:team:{$tId}:period:{$p}:fouls_accumulated";
                    $keysToFetch[] = ['period' => $p, 'teamId' => $tId, 'key' => $key];
                    $pipe->get($key); 
                }
            }

            $results = $pipe->exec();

            if ($results === false) {
                 throw new Exception("Redis pipeline execution failed for get_accumulated.");
            }

            foreach ($results as $index => $count) {
                $info = $keysToFetch[$index];
                $period = $info['period'];
                $teamId = $info['teamId'];
             
                $accumulated["period_{$period}"][$teamId] = ($count === false) ? 0 : (int)$count;
            }

            http_response_code(200);
            $response = [
                'status' => 'success',
                'message' => 'Accumulated fouls retrieved.',
                'gameId' => $gameId,
                'gameType' => $gameType,
                'accumulatedFouls' => $accumulated
            ];
            break; 


        case 'list_game_fouls':


            $foulKeys = $redis->sMembers($gameFoulsSetKey);

            if (empty($foulKeys)) {
                $response = ['status' => 'success', 'message' => 'No fouls recorded for this game.', 'data' => []];
                http_response_code(200);
                break;
            }

            $pipe = $redis->pipeline();
            foreach ($foulKeys as $key) {
                $pipe->hGetAll($key);
            }
            $foulHashes = $pipe->exec();

            $fouls = [];
            foreach ($foulHashes as $hash) {

                if ($hash && is_array($hash)) {

                    if (isset($hash['foulId'])) $hash['foulId'] = (string)$hash['foulId'];
                    if (isset($hash['period'])) $hash['period'] = (int)$hash['period'];
                    if (isset($hash['recordedAt'])) $hash['recordedAt'] = (int)$hash['recordedAt'];
                    if (isset($hash['updatedAt'])) $hash['updatedAt'] = (int)$hash['updatedAt'];
                    $fouls[] = $hash;
                } else {

                     error_log("Expected hash data for a foul key in game {$gameId} but got: " . print_r($hash, true));
                }
            }


             usort($fouls, function ($a, $b) {
                 $periodCompare = ($a['period'] ?? 0) <=> ($b['period'] ?? 0);
                 if ($periodCompare !== 0) {
                     return $periodCompare;
                 }

                 return ($a['recordedAt'] ?? 0) <=> ($b['recordedAt'] ?? 0);
             });


            http_response_code(200);
            $response = [
                'status' => 'success',
                'message' => 'Retrieved all fouls for the game.',
                'gameId' => $gameId,
                'data' => $fouls
            ];
            break; 

        case 'get_player_fouls':
                $playerId = trim($params['playerId'] ?? '');
                if (empty($playerId)) {
                    http_response_code(400);
                    $response = ['status' => 'error', 'message' => 'Missing required field for get_player_fouls: playerId.'];
                    break;
                }
    
                $foulKeys = $redis->sMembers($gameFoulsSetKey); 
    
                if (empty($foulKeys)) {
                    http_response_code(200); 
                    $response = [
                        'status' => 'success',
                        'message' => "No fouls found for player '{$playerId}' in game '{$gameId}' (no fouls recorded for the game).",
                        'gameId' => $gameId,
                        'playerId' => $playerId,
                        'foulCount' => 0,
                        'data' => []
                    ];
                    break;
                }
    
                $pipe = $redis->pipeline();
                foreach ($foulKeys as $key) {
                    $pipe->hGetAll($key);
                }
                $foulHashes = $pipe->exec();
    
                $playerFouls = [];
                $foulCount = 0;
                foreach ($foulHashes as $index => $hash) {

                    if ($hash && is_array($hash) && isset($hash['playerId']) && $hash['playerId'] === $playerId) {

                        if (isset($hash['foulId'])) $hash['foulId'] = (string)$hash['foulId'];
                        if (isset($hash['period'])) $hash['period'] = (int)$hash['period'];
                        if (isset($hash['recordedAt'])) $hash['recordedAt'] = (int)$hash['recordedAt'];
                        if (isset($hash['updatedAt'])) $hash['updatedAt'] = (int)$hash['updatedAt'];
    
                        $playerFouls[] = $hash;
                        $foulCount++;
                    } elseif ($hash === false) {
                        error_log("Failed to retrieve HGETALL for key '{$foulKeys[$index]}' in game '{$gameId}' during get_player_fouls.");
                    }
                }
    
                 usort($playerFouls, function ($a, $b) {
                     $periodCompare = ($a['period'] ?? 0) <=> ($b['period'] ?? 0);
                     if ($periodCompare !== 0) {
                         return $periodCompare;
                     }
                     return ($a['recordedAt'] ?? 0) <=> ($b['recordedAt'] ?? 0);
                 });
    
                http_response_code(200);
                $response = [
                    'status' => 'success',
                    'message' => "Retrieved {$foulCount} foul(s) for player '{$playerId}' in game '{$gameId}'.",
                    'gameId' => $gameId,
                    'playerId' => $playerId,
                    'foulCount' => $foulCount,
                    'data' => $playerFouls
                ];
                break; 
        default:
            http_response_code(400);
            $response = ['status' => 'error', "message" => "Invalid action specified: '{$action}'"];
            break;
    }

} catch (Exception $e) {

    error_log("Error processing action '{$action}' for game '{$gameId}': " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());

    if (http_response_code() < 400) {
       http_response_code(500); 
    }
    $errorMessage = "An internal error occurred. Please check logs.";
    // if (DEBUG_MODE_ENABLED) { $errorMessage .= " Details: " . $e->getMessage(); }
    $response = ["status" => "error", "message" => $errorMessage];
}

echo json_encode($response);
exit;
?>