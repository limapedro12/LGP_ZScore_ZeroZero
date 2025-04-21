<?php
declare(strict_types=1);
require_once __DIR__ . '/../../utils/connRedis.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/scoreData.php';

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
$placardId = trim($jsonBody['placardId'] ?? '');
$gameType = trim($jsonBody['gameType'] ?? '');
$abstractTeamId = trim($jsonBody['abstractTeamId'] ?? '');

$allowedActions = ['add', 'remove', 'get_score', 'create'];

if (is_null($action) || !in_array($action, $allowedActions)) {
    $response['message'] = 'Missing or invalid action parameter. Allowed actions: ' . implode(', ', $allowedActions);
    http_response_code(400);
    echo json_encode($response);
    exit;
}

try {
    switch ($action) {
        case 'create':
            // Criar dados de teste no Redis
            if (empty($placardId) || empty($gameType)) {
                $response['message'] = 'Missing required fields: placardId, gameType.';
                http_response_code(400);
                echo json_encode($response);
                exit;
            }

            $key = "game:$placardId:$gameType";
            if ($redis->exists($key)) {
                $response['message'] = 'Game data already exists.';
                http_response_code(400);
                echo json_encode($response);
                exit;
            }

            if ($gameType === 'futsal') {
                initializeFutsalData($redis, $placardId);
            } elseif ($gameType === 'volleyball') {
                initializeVolleyballData($redis, $placardId);
            } else {
                $response['message'] = 'Invalid gameType.';
                http_response_code(400);
                echo json_encode($response);
                exit;
            }

            $response = [
                'status' => 'success',
                'message' => 'Test game data created successfully.',
                'gameKey' => $key
            ];
            http_response_code(201);
            break;

        case 'add':
        case 'remove':
            $delta = $action === 'add' ? 1 : -1;

            $result = updateScoreData($redis, $placardId, (int)$abstractTeamId, $gameType, $delta);

            if (!$result['success']) {
                throw new Exception($result['message']);
            }

            $response = [
                'status' => 'success',
                'message' => 'Score updated successfully.',
                'data' => $result
            ];
            http_response_code(200);
            break;

        case 'get_score':
            $scoreData = getScoreData($redis, $placardId, $gameType);

            if (!$scoreData['success']) {
                throw new Exception($scoreData['message']);
            }

            $response = [
                'status' => 'success',
                'message' => 'Score retrieved successfully.',
                'data' => $scoreData['data']
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
