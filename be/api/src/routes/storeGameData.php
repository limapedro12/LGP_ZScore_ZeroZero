<?php

declare(strict_types=1);

require_once __DIR__ . '/../utils/redisUtils.php';
require_once __DIR__ . '/../utils/dbUtils.php';
require_once __DIR__ . '/../utils/requestUtils.php';

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
if ($requestMethod !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method. Only POST is allowed.']);
    exit;
}

$params = RequestUtils::getRequestParams();
$placardId = $params['placardId'] ?? null;

if (!$placardId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing placardId parameter.']);
    exit;
}

try {
    $keysTimer = RequestUtils::getRedisKeys($placardId, 'timer');
    $keysPoints = RequestUtils::getRedisKeys($placardId, 'points');
    $keysTimeouts = RequestUtils::getRedisKeys($placardId, 'timeout');
    $keysCards = RequestUtils::getRedisKeys($placardId, 'cards');
    $keysSubstitutions = RequestUtils::getRedisKeys($placardId, 'substitutions');
    $keysFouls = RequestUtils::getRedisKeys($placardId, 'fouls');

    // // print keys for debugging
    // error_log("Keys: " . print_r($keysTimer, true));
    // error_log("Keys Points: " . print_r($keysPoints['game_points'], true));
    // error_log("Keys Timeouts: " . print_r($keysTimeouts['game_timeouts'], true));
    // error_log("Keys Cards: " . print_r($keysCards['game_cards'], true));
    // error_log("Keys Substitutions: " . print_r($keysSubstitutions['substitutions'], true));
    // error_log("Keys Fouls: " . print_r($keysFouls['game_fouls'], true));

    // Fetch all relevant game data from Redis
    $gameData = [
        'points' => $redis->zRange($keysPoints['game_points'], 0, -1),
        'timeouts' => $redis->zRange($keysTimeouts['game_timeouts'], 0, -1),
        'cards' => $redis->zRange($keysCards['game_cards'], 0, -1),
        'substitutions' => $redis->zRange($keysSubstitutions['substitutions'], 0, -1),
        'fouls' => $redis->zRange($keysFouls['game_fouls'], 0, -1),
    ];

    // Store game data into the database
    $db = DbUtils::connect();
    $db->autocommit(false); // Disable autocommit to start a transaction

    try {
        foreach ($gameData as $type => $events) {
            foreach ($events as $eventKey) {
                $eventData = $redis->hGetAll($eventKey);
                $time = '2025-06-30 12:00:00';
                $sport = 'futsal';
                if (!empty($eventData)) {
                    switch ($type) {
                        case 'points':
                            DbUtils::storePointEvent($db, $eventData, $time, $sport);
                            break;
                        case 'timeouts':
                            DbUtils::storeTimeoutEvent($db, $eventData, $time, $sport);
                            break;
                        case 'cards':
                            DbUtils::storeCardEvent($db, $eventData, $time, $sport);
                            break;
                        case 'substitutions':
                            DbUtils::storeSubstitutionEvent($db, $eventData, $time, $sport);
                            break;
                        case 'fouls':
                            DbUtils::storeFoulEvent($db, $eventData, $time, $sport);
                            break;
                        default:
                            throw new Exception("Unknown event type: $type");
                    }
                }
            }
        }

        $db->commit(); // Commit the transaction
        echo json_encode(['status' => 'success', 'message' => 'Game data stored successfully.']);
    } catch (Exception $e) {
        $db->rollback(); // Rollback the transaction in case of error
        error_log("Error storing game data: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to store game data. Original error: ' . $e->getMessage()]);
    } finally {
        $db->autocommit(true); // Re-enable autocommit
    }
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An unexpected error occurred.']);
}
