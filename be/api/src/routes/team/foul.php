<?php
declare(strict_types=1);
require_once __DIR__ . '/../../utils/connRedis.php';
require_once __DIR__ . '/../../config/GameConfig.php'; 

header('Content-Type: application/json');

$response = ['status' => 'error', 'message' => 'Invalid request.'];
$jsonBody = null;

try {
    $redis = connectRedis();
    if (!$redis || !$redis->ping()) {
        throw new Exception("Failed to connect to Redis or connection lost.");
    }
} catch (Exception $e) {
    error_log("Redis Connection Error: " . $e->getMessage());
    $response['message'] = 'Service unavailable (Database connection failed).';
    http_response_code(503);
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST is allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit;
}

$input = file_get_contents('php://input');
if ($input) {
    $jsonBody = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $response['message'] = 'Invalid JSON payload: ' . json_last_error_msg();
        http_response_code(400);
        echo json_encode($response);
        exit;
    }
} else {
     $response['message'] = 'Empty request body.';
     http_response_code(400);
     echo json_encode($response);
     exit;
}

$action = $jsonBody['action'] ?? null;
$allowedActions = ['create', 'update', 'delete', 'get_accumulated', 'list_games_fouls'];

if (is_null($action) || !in_array($action, $allowedActions)) {
    $response['message'] = 'Missing or invalid action parameter. Allowed actions: ' . implode(', ', $allowedActions);
    http_response_code(400);
    echo json_encode($response);
    exit;
}

// sanitize inputs
$gameId = trim($jsonBody['gameId'] ?? '');
$gameType = trim($jsonBody['gameType'] ?? '');

try {
    $gameConfigManager = new GameConfig();
    $currentPeriodKey = "game:{$gameId}:period";

    switch ($action) {
        case 'create':
            $playerId = trim($jsonBody['playerId'] ?? '');
            $teamId = trim($jsonBody['teamId'] ?? '');
            $foulTime = trim($jsonBody['foulTime'] ?? '');

            $missingFields = [];
            if (empty($gameId)) $missingFields[] = 'gameId';
            if (empty($gameType)) $missingFields[] = 'gameType'; 
            if (empty($playerId)) $missingFields[] = 'playerId';
            if (empty($teamId)) $missingFields[] = 'teamId';
            if ($foulTime === '') $missingFields[] = 'foulTime';

            if (!empty($missingFields)) {
                $response['message'] = 'Missing required fields for create: ' . implode(', ', $missingFields);
                http_response_code(400);
                break;
            }

            $currentGameConfig = $gameConfigManager->getConfig($gameType);
            $totalPeriods = $currentGameConfig['periods'];

            $currentPeriod = $redis->get($currentPeriodKey);
            if ($currentPeriod === false || !is_numeric($currentPeriod) || $currentPeriod < 1) {
                throw new Exception("Cannot record foul: Game period is not set or invalid.");
            }
            $currentPeriod = (int)$currentPeriod;

            if ($currentPeriod > $totalPeriods) {
                throw new Exception("Cannot record foul: Current period ({$currentPeriod}) exceeds total periods ({$totalPeriods}) for game type '{$gameType}'.");
            }

            $foulCounterKey = "game:{$gameId}:foul_counter";
            $newFoulId = $redis->incr($foulCounterKey);
            if ($newFoulId === false) throw new Exception("Failed to generate foul ID.");

            $foulDataKey = "foul:{$gameId}:{$newFoulId}";
            $gameFoulsSetKey = "game:{$gameId}:fouls";
            $accumulatedFoulKey = "game:{$gameId}:team:{$teamId}:period:{$currentPeriod}:fouls_accumulated";

            $foulData = [
                'foulId'   => (string)$newFoulId,
                'gameId'   => $gameId,
                'playerId' => $playerId,
                'teamId'   => $teamId,
                'time'     => $foulTime,
                'period'   => (string)$currentPeriod,
                'recordedAt' => time()
            ];

            $redis->multi();
            $redis->hMSet($foulDataKey, $foulData);
            $redis->sAdd($gameFoulsSetKey, $foulDataKey);
            $redis->incr($accumulatedFoulKey);
            $results = $redis->exec();

            if ($results === false || in_array(false, $results, true)) {
                throw new Exception("Failed to record foul and update accumulated count atomically.");
            }

            $response = [
                'status' => 'success',
                'message' => 'Foul created and accumulated count updated.',
                'foulId' => $newFoulId,
                'foulDataKey' => $foulDataKey,
                'data' => $foulData,
                'accumulatedFouls' => $results[2]
            ];
            http_response_code(201);
            break;

        case 'update':
            $foulId = trim($jsonBody['foulId'] ?? '');
            if (empty($gameId) || empty($foulId)) {
                $response['message'] = 'Missing required fields for update: gameId, foulId.';
                http_response_code(400);
                break;
            }

            $foulDataKey = "foul:{$gameId}:{$foulId}";
            if (!$redis->exists($foulDataKey)) {
                $response['message'] = "Foul with ID {$foulId} not found for game {$gameId}.";
                http_response_code(404);
                break;
            }

            $updateData = [];
            if (isset($jsonBody['playerId'])) $updateData['playerId'] = trim($jsonBody['playerId']);
            if (isset($jsonBody['teamId'])) $updateData['teamId'] = trim($jsonBody['teamId']);
            if (isset($jsonBody['foulTime'])) $updateData['time'] = trim($jsonBody['foulTime']);

            if (empty($updateData)) {
                $response['message'] = 'No fields provided to update.';
                http_response_code(400);
                break;
            }

            $updateData['updatedAt'] = time();
            $redis->hMSet($foulDataKey, $updateData);

            $updatedFoulData = $redis->hGetAll($foulDataKey);
            $response = [
                'status' => 'success',
                'message' => 'Foul log updated successfully.',
                'foulId' => $foulId,
                'foulDataKey' => $foulDataKey,
                'data' => $updatedFoulData
            ];
            http_response_code(200);
            break;

        case 'delete':
            $foulId = trim($jsonBody['foulId'] ?? '');
            if (empty($gameId) || empty($foulId)) {
                $response['message'] = 'Missing required fields for delete: gameId, foulId.';
                http_response_code(400);
                break;
            }

            $foulDataKey = "foul:{$gameId}:{$foulId}";
            $originalFoulData = $redis->hGetAll($foulDataKey);
            if (empty($originalFoulData)) {
                $response['message'] = "Foul with ID {$foulId} not found.";
                http_response_code(404);
                break;
            }

            $originalTeamId = $originalFoulData['teamId'] ?? '';
            $originalPeriod = $originalFoulData['period'] ?? '';
            if (empty($originalTeamId) || empty($originalPeriod)) {
                throw new Exception("Cannot delete foul: Inconsistent foul data.");
            }

            $accumulatedFoulKey = "game:{$gameId}:team:{$originalTeamId}:period:{$originalPeriod}:fouls_accumulated";
            $gameFoulsSetKey = "game:{$gameId}:fouls";

            $redis->multi();
            $redis->del($foulDataKey);
            $redis->sRem($gameFoulsSetKey, $foulDataKey);
            $redis->decr($accumulatedFoulKey);
            $results = $redis->exec();

            $response = [
                'status' => 'success',
                'message' => 'Foul deleted.',
                'foulId' => $foulId,
                'newAccumulatedCount' => $results[2] ?? 0
            ];
            http_response_code(200);
            break;

        case 'get_accumulated':
            if (empty($gameId) || empty($gameType)) {
                $response['message'] = 'Missing gameId or gameType.';
                http_response_code(400);
                break;
            }

            $teamIds = $jsonBody['teamIds'] ?? ['home', 'away'];
            $config = $gameConfigManager->getConfig($gameType);
            $numPeriods = $config['periods'];

            $accumulated = [];
            for ($p = 1; $p <= $numPeriods; $p++) {
                foreach ($teamIds as $tId) {
                    $key = "game:{$gameId}:team:{$tId}:period:{$p}:fouls_accumulated";
                    $accumulated["period_{$p}"][$tId] = (int)$redis->get($key);
                }
            }

            $response = [
                'status' => 'success',
                'message' => 'Accumulated fouls retrieved.',
                'gameId' => $gameId,
                'accumulatedFouls' => $accumulated
            ];
            http_response_code(200);
            break;

        case 'list_games_fouls':
            $keys = $redis->keys('game:*:fouls');
            $games = [];

            foreach ($keys as $foulSetKey) {
                preg_match('/game:(.*?):fouls/', $foulSetKey, $matches);
                $gameId = $matches[1] ?? null;
                if (!$gameId) continue;

                $foulKeys = $redis->sMembers($foulSetKey);
                $fouls = [];

                foreach ($foulKeys as $foulKey) {
                    $foulData = $redis->hGetAll($foulKey);
                    if (!empty($foulData)) $fouls[] = $foulData;
                }

                $games[$gameId] = $fouls;
            }

            $response = [
                'status' => 'success',
                'message' => 'All games and their fouls retrieved.',
                'data' => $games
            ];
            http_response_code(200);
            break;

        default:
            $response['message'] = 'Invalid action.';
            http_response_code(400);
            break;
    }

} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    $response['message'] = "An error occurred: " . $e->getMessage();
    if (http_response_code() < 400) http_response_code(500);
}

echo json_encode($response);
exit;
