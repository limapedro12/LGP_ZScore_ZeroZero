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

$requiredParamsBase = ['placardId', 'sport', 'action'];
$allowedActions = ['create', 'update', 'delete', 'get_accumulated', 'list_game_fouls', 'get_player_fouls'];

$action = trim($params['action'] ?? '');
if (empty($action)) {
     http_response_code(400);
     echo json_encode(["error" => "Missing required parameter: action"]);
     exit;
}
if (!in_array($action, $allowedActions)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid action specified: '{$action}'"]);
    exit;
}

$requiredParams = $requiredParamsBase;
if ($action === 'get_player_fouls' && $requestMethod === 'GET') {
    $requiredParams[] = 'playerId';
} elseif ($action === 'update' || $action === 'delete') {
     if(!isset($params['eventId'])){
         http_response_code(400);
         echo json_encode(["error" => "Missing required parameter: eventId"]);
         exit;
     }
}

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$placardId = trim($params['placardId']);
$sport = trim($params['sport']);

if (empty($placardId) || empty($sport)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'placardId and sport cannot be empty.']);
    exit;
}

try {
    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);
    $totalPeriods = $gameConfig['periods'] ?? null;
    if (is_null($totalPeriods)) {
        throw new Exception("Configuration error: Sport '{$sport}' is missing the 'periods' definition.");
    }

    $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');
    $foulKeys = RequestUtils::getRedisKeys($placardId, 'fouls');

    if (is_null($timerKeys) || !isset($timerKeys['period'])) {
        throw new Exception("Configuration error: Could not retrieve Redis period key configuration.");
    }
     if (is_null($foulKeys) || !isset($foulKeys['event_counter']) || !isset($foulKeys['game_fouls']) || !isset($foulKeys['foul_event']) || !isset($foulKeys['accumulated_foul'])) {
        throw new Exception("Configuration error: Could not retrieve all required Redis foul key configurations.");
    }

    $currentPeriodKey = $timerKeys['period'];
    $gameFoulsKey = $foulKeys['game_fouls'];
    $eventCounterKey = $foulKeys['event_counter'];

    switch ($action) {

        case 'create':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method. Only POST is allowed for 'create'."];
                break;
            }
            $playerId = trim($params['playerId'] ?? '');
            $teamId = trim($params['teamId'] ?? '');
            $missingFields = [];
            if (empty($playerId)) $missingFields[] = 'playerId';
            if (empty($teamId)) $missingFields[] = 'teamId';
            if (!empty($missingFields)) {
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Missing required fields for create: ' . implode(', ', $missingFields)];
                break;
            }

            $timestamp = RequestUtils::getGameTimePosition($placardId);

            $currentPeriod = $redis->get($currentPeriodKey);
            if ($currentPeriod === false || !is_numeric($currentPeriod) || (int)$currentPeriod < 1) {
                 http_response_code(409);
                 $response = ['status' => 'error', 'message' => "Cannot record foul: Game period is not set or is invalid in Redis key '{$currentPeriodKey}'. Set the period first."];
                 break;
            }
            $currentPeriod = (int)$currentPeriod;
            if ($currentPeriod > $totalPeriods) {
                 http_response_code(409);
                 $response = ['status' => 'error', 'message' => "Cannot record foul: Current period ({$currentPeriod}) exceeds total periods ({$totalPeriods}) for sport '{$sport}'."];
                 break;
            }
            $eventId = $redis->incr($eventCounterKey);
            if ($eventId === false) {
                 throw new Exception("Failed to increment foul counter key '{$foulKeys['foul_counter_key']}'.");
            }
            $eventIdStr = (string)$eventId;
            $foulEventKey = $foulKeys['foul_event'] . $eventIdStr;
            $accumulatedFoulKey = $foulKeys['accumulated_foul'] . "{$teamId}:period:{$currentPeriod}:fouls_accumulated";
            $foulEvent = new FoulEvent((string)$timestamp, $sport, null, $playerId, $teamId, $currentPeriod);
            $foulEvent->setId($eventIdStr);
            $foulDataForRedis = [
                'eventId' => $foulEvent->getId(), 'placardId' => $placardId, 'sport' => $sport,
                'playerId' => $playerId, 'teamId' => $teamId, 'timestamp' => $timestamp,
                'period' => (string)$currentPeriod, 'recordedAt' => (string)time()
            ];
            $redis->multi();
            $redis->hMSet($foulEventKey, $foulDataForRedis);
            $redis->zAdd($gameFoulsKey, $timestamp, $foulEventKey);
            $redis->incr($accumulatedFoulKey);
            $results = $redis->exec();
            if ($results === false || !isset($results[0]) || $results[0] === false || !isset($results[1]) || $results[1] === false || !isset($results[2]) || $results[2] === false) {
                 $redis->del($foulEventKey);
                 $redis->zRem($gameFoulsKey, $foulEventKey);
                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to atomically record foul and update accumulated count."];
                 error_log("Redis MULTI/EXEC failed for foul creation. Placard: {$placardId}, eventId Attempted: {$eventIdStr}, Results: " . print_r($results, true));
            } else {
                 http_response_code(201);
                 $response = [
                     'status' => 'success', 'message' => 'Foul created and accumulated count updated.',
                     'eventId' => $foulEvent->getId(), 'foulEventKey' => $foulEventKey,
                     'data' => $foulDataForRedis, 'accumulatedFoulsThisPeriod' => (int)$results[2]
                 ];
            }
            break;

        case 'update':
             if ($requestMethod !== 'POST' && $requestMethod !== 'PUT') {
                 http_response_code(405);
                 $response = ["status" => "error", "message" => "Invalid request method. Only POST/PUT allowed for 'update'."];
                 break;
             }
             $eventId = trim($params['eventId'] ?? '');
             if (empty($eventId)) {
                 http_response_code(400);
                 $response = ['status' => 'error', 'message' => 'Missing required field for update: eventId.'];
                 break;
             }
             $foulEventKey = $foulKeys['foul_event'] . $eventId;
             $redis->watch($foulEventKey);
             $originalFoulData = $redis->hGetAll($foulEventKey);
             if (empty($originalFoulData)) {
                 $redis->unwatch();
                 http_response_code(404);
                 $response = ["status" => "error", "message" => "Foul with ID {$eventId} not found for placard {$placardId}."];
                 break;
             }
             $updateData = []; $isChanged = false; $teamChanged = false;
             $originalTeamId = $originalFoulData['teamId'] ?? null;
             $originalPeriod = $originalFoulData['period'] ?? null;
             $newTeamId = $originalTeamId;
             if (isset($params['playerId']) && trim($params['playerId']) !== ($originalFoulData['playerId'] ?? null)) {
                 $updateData['playerId'] = trim($params['playerId']); $isChanged = true;
             }
             if (isset($params['teamId']) && trim($params['teamId']) !== $originalTeamId) {
                 $tempNewTeamId = trim($params['teamId']);
                 if(!empty($tempNewTeamId)) {
                     $updateData['teamId'] = $tempNewTeamId; $newTeamId = $tempNewTeamId;
                     $teamChanged = true; $isChanged = true;
                 } else {
                    $redis->unwatch(); http_response_code(400);
                    $response = ['status' => 'error', 'message' => 'Update failed: New teamId cannot be empty.'];
                    break;
                 }
             }
             if (isset($params['timestamp']) && trim($params['timestamp']) !== ($originalFoulData['time'] ?? null)) {
                 $updateData['time'] = trim($params['timestamp']); $isChanged = true;
             }
             if (!$isChanged) {
                 $redis->unwatch(); http_response_code(400);
                 $response = ['status' => 'error', 'message' => 'No update fields provided or new values are the same as current values.'];
                 break;
             }
             $updateData['updatedAt'] = (string)time();
             $redis->multi();
             $redis->hMSet($foulEventKey, $updateData);
             if ($teamChanged && $originalTeamId && $originalPeriod) {
                 $oldAccumulatedKey = $foulKeys['accumulated_foul'] . "{$originalTeamId}:period:{$originalPeriod}:fouls_accumulated";
                 $newAccumulatedKey = $foulKeys['accumulated_foul'] . "{$newTeamId}:period:{$originalPeriod}:fouls_accumulated";
                 $redis->decr($oldAccumulatedKey); $redis->incr($newAccumulatedKey);
             }
             $results = $redis->exec();
             if ($results === false) {
                 http_response_code(409);
                 $response = ["status" => "error", "message" => "Update failed due to a conflict or Redis error. Please retry."];
                 error_log("Redis WATCH/MULTI/EXEC failed for foul update. Placard: {$placardId}, eventId: {$eventId}. Key might have changed.");
             } elseif(is_array($results) && isset($results[0]) && $results[0] === false) {
                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to apply updates to foul data in Redis."];
                 error_log("Redis HMSET failed within MULTI/EXEC for foul update. Placard: {$placardId}, eventId: {$eventId}. Results: " . print_r($results, true));
             } else {
                 $finalFoulData = $redis->hGetAll($foulEventKey);
                 $response = [
                     'status' => 'success', 'message' => 'Foul updated successfully.' . ($teamChanged ? ' Accumulated counts adjusted.' : ''),
                     'eventId' => $eventId, 'foulEventKey' => $foulEventKey, 'data' => $finalFoulData
                 ];
                 if ($teamChanged && isset($results[1]) && isset($results[2])) {
                     $response['oldTeamNewCount'] = (int)$results[1]; $response['newTeamNewCount'] = (int)$results[2];
                 }
                 http_response_code(200);
             }
             break;

        case 'delete':
             if ($requestMethod !== 'POST' && $requestMethod !== 'DELETE') {
                 http_response_code(405);
                 $response = ["status" => "error", "message" => "Invalid request method. Only POST/DELETE allowed for 'delete'."];
                 break;
             }
             $eventId = trim($params['eventId'] ?? '');
             if (empty($eventId)) {
                 http_response_code(400);
                 $response = ['status' => 'error', 'message' => 'Missing required field for delete: eventId.'];
                 break;
             }
             $foulEventKey = $foulKeys['foul_event'] . $eventId;
             $redis->watch($foulEventKey);
             $originalFoulData = $redis->hGetAll($foulEventKey);
             if (empty($originalFoulData)) {
                 $redis->unwatch(); http_response_code(404);
                 $response = ["status" => "error", "message" => "Foul with ID {$eventId} not found for placard {$placardId}."];
                 break;
             }
             $originalTeamId = $originalFoulData['teamId'] ?? null;
             $originalPeriod = $originalFoulData['period'] ?? null;
             if (!$originalTeamId || !$originalPeriod) {
                 $redis->unwatch(); error_log("Inconsistent foul data found for deletion: Placard {$placardId}, Foul {$eventId}. Missing teamId or period.");
                 http_response_code(500);
                 $response = ['status' => 'error', 'message' => 'Cannot delete foul due to inconsistent stored data. Check logs.'];
                 break;
             }
             $accumulatedFoulKey = $foulKeys['accumulated_foul'] . "{$originalTeamId}:period:{$originalPeriod}:fouls_accumulated";
             $redis->multi();
             $redis->del($foulEventKey);
             $redis->zRem($gameFoulsKey, $foulEventKey);
             $redis->decr($accumulatedFoulKey);
             $results = $redis->exec();
             if ($results === false) {
                 http_response_code(409);
                 $response = ["status" => "error", "message" => "Delete failed due to a conflict or Redis error. Please retry."];
                 error_log("Redis WATCH/MULTI/EXEC failed for foul delete. Placard: {$placardId}, eventId: {$eventId}.");
             } elseif (is_array($results) && (!isset($results[0]) || $results[0] < 1)) {
                 http_response_code(500);
                 $response = ["status" => "error", "message" => "Failed to delete foul data key, it might have been removed concurrently or delete failed."];
                 error_log("Redis DEL failed within MULTI/EXEC for foul delete. Placard: {$placardId}, eventId: {$eventId}. Results: " . print_r($results, true));
             } else {
                 http_response_code(200);
                 $response = [
                     'status' => 'success', 'message' => 'Foul deleted and accumulated count updated.',
                     'eventId' => $eventId, 'newAccumulatedCount' => isset($results[2]) ? (int)$results[2] : 'N/A'
                 ];
             }
             break;

        case 'get_accumulated':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method. Only GET is allowed for 'get_accumulated'."];
                break;
            }
            $teamIds = $params['teamIds'] ?? ['home', 'away'];
             if (is_string($teamIds)) {
                 $teamIds = explode(',', $teamIds);
                 $teamIds = array_filter(array_map('trim', $teamIds));
            }
            if (!is_array($teamIds) || empty($teamIds)) { $teamIds = ['home', 'away']; }

            $accumulated = []; $pipe = $redis->pipeline(); $keysToFetch = [];
            for ($p = 1; $p <= $totalPeriods; $p++) {
                $accumulated["period_{$p}"] = [];
                foreach ($teamIds as $tId) {
                    if (empty($tId)) continue;
                    $key = $foulKeys['accumulated_foul'] . "{$tId}:period:{$p}:fouls_accumulated";
                    $keysToFetch[] = ['period' => $p, 'teamId' => $tId, 'key' => $key];
                    $pipe->get($key);
                }
            }
            $results = $pipe->exec();
            if ($results === false) { throw new Exception("Redis pipeline execution failed for get_accumulated."); }
            foreach ($results as $index => $count) {
                $info = $keysToFetch[$index]; $period = $info['period']; $teamId = $info['teamId'];
                $accumulated["period_{$period}"][$teamId] = ($count === false) ? 0 : (int)$count;
            }
            http_response_code(200);
            $response = [
                'status' => 'success', 'message' => 'Accumulated fouls retrieved.',
                'placardId' => $placardId, 'sport' => $sport,
                'accumulatedFouls' => $accumulated
            ];
            break;

        case 'list_game_fouls':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method. Only GET is allowed for 'list_game_fouls'."];
                break;
            }
            $foulKeysResult = $redis->zRange($gameFoulsKey, 0, -1);
            if (empty($foulKeysResult)) {
                http_response_code(200);
                $response = ['status' => 'success', 'message' => "No fouls recorded for placard '{$placardId}'.", 'data' => []];
                break;
            }
            $pipe = $redis->pipeline();
            foreach ($foulKeysResult as $key) { $pipe->hGetAll($key); }
            $foulHashes = $pipe->exec(); $fouls = [];
            foreach ($foulHashes as $index => $hash) {
                if ($hash && is_array($hash)) {
                    if (isset($hash['eventId'])) $hash['eventId'] = (string)$hash['eventId'];
                    if (isset($hash['period'])) $hash['period'] = (int)$hash['period'];
                    if (isset($hash['recordedAt'])) $hash['recordedAt'] = (int)$hash['recordedAt'];
                    if (isset($hash['updatedAt'])) $hash['updatedAt'] = (int)$hash['updatedAt'];
                    if (!isset($hash['placardId'])) $hash['placardId'] = $placardId;
                    if (!isset($hash['sport'])) $hash['sport'] = $sport;
                    $fouls[] = $hash;
                } else { error_log("Failed HGETALL key '{$foulKeysResult[$index]}' placard '{$placardId}' list_game_fouls."); }
            }
            usort($fouls, function ($a, $b) {
                 $p = ($a['period'] ?? 0) <=> ($b['period'] ?? 0);
                 return ($p !== 0) ? $p : (($a['recordedAt'] ?? 0) <=> ($b['recordedAt'] ?? 0));
            });
            http_response_code(200);
            $response = [ 'status' => 'success', 'message' => 'Retrieved all fouls for the game.', 'placardId' => $placardId, 'data' => $fouls ];
            break;

        case 'get_player_fouls':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["status" => "error", "message" => "Invalid request method. Only GET is allowed for 'get_player_fouls'."];
                break;
            }
            $playerId = trim($params['playerId'] ?? '');
            if (empty($playerId)) {
                http_response_code(400);
                $response = ['status' => 'error', 'message' => 'Missing required field for get_player_fouls: playerId.'];
                break;
            }
            $foulKeysResult = $redis->zRange($gameFoulsKey, 0, -1);
            if (empty($foulKeysResult)) {
                http_response_code(200);
                $response = [
                    'status' => 'success', 'message' => "No fouls found for player '{$playerId}' in placard '{$placardId}' (no fouls recorded for the game).",
                    'placardId' => $placardId, 'playerId' => $playerId, 'foulCount' => 0, 'data' => []
                ];
                break;
            }
            $pipe = $redis->pipeline();
            foreach ($foulKeysResult as $key) { $pipe->hGetAll($key); }
            $foulHashes = $pipe->exec(); $playerFouls = []; $foulCount = 0;
            foreach ($foulHashes as $index => $hash) {
                if ($hash && is_array($hash) && isset($hash['playerId']) && $hash['playerId'] === $playerId) {
                    if (isset($hash['eventId'])) $hash['eventId'] = (string)$hash['eventId'];
                    if (isset($hash['period'])) $hash['period'] = (int)$hash['period'];
                    if (isset($hash['recordedAt'])) $hash['recordedAt'] = (int)$hash['recordedAt'];
                    if (isset($hash['updatedAt'])) $hash['updatedAt'] = (int)$hash['updatedAt'];
                    if (!isset($hash['placardId'])) $hash['placardId'] = $placardId;
                    if (!isset($hash['sport'])) $hash['sport'] = $sport;
                    $playerFouls[] = $hash; $foulCount++;
                } elseif ($hash === false) { error_log("Failed HGETALL key '{$foulKeysResult[$index]}' placard '{$placardId}' get_player_fouls."); }
            }
            usort($playerFouls, function ($a, $b) {
                 $p = ($a['period'] ?? 0) <=> ($b['period'] ?? 0);
                 return ($p !== 0) ? $p : (($a['recordedAt'] ?? 0) <=> ($b['recordedAt'] ?? 0));
            });
            http_response_code(200);
            $response = [
                'status' => 'success', 'message' => "Retrieved {$foulCount} foul(s) for player '{$playerId}' in placard '{$placardId}'.",
                'placardId' => $placardId, 'playerId' => $playerId, 'foulCount' => $foulCount, 'data' => $playerFouls
            ];
            break;

        default:
            http_response_code(400);
            $response = ['status' => 'error', "message" => "Invalid action specified: '{$action}' is not allowed."];
            break;
    }

} catch (Exception $e) {
    $httpStatusCode = 500;
    error_log("Error processing action '{$action}' for placard '{$placardId}' (Sport: '{$sport}'): " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    if (http_response_code() < 400) { http_response_code($httpStatusCode); }
    $response = ["status" => "error", "message" => "An internal error occurred. Please check logs or contact support."];
}

echo json_encode($response);
exit;
?>