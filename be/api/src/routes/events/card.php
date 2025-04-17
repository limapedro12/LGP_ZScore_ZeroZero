<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../classes/AbstractEvent.php'; 
require_once __DIR__ . '/../../classes/CardEvent.php';

header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'action'];
$allowedActions = ['add', 'remove', 'get'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$action = $params['action'] ?? null;

$redis = RedistUtils::connect();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {
    $keys = RequestUtils::getRedisKeys($placardId, 'cards');

    $gameCardsKey = $keys['game_cards']; 
    $eventCounterKey = $keys['event_counter'];

    switch ($action) {
        case 'add':
            $playerId = $params['playerId'] ?? null;
            $cardColor = $params['cardColor'] ?? null;
            $timestamp = $params['timestamp'] ?? null;

            if (!$playerId || !$cardColor || !$timestamp) {
                $response = ["error" => "Missing playerId, cardColor or timestamp for add action"];
                break;
            }

            $eventId = $redis->incr($eventCounterKey);
            $cardEventKey = $keys['card_event'] . $eventId; 

            $cardData = [
                'eventId' => $eventId,
                'placardId' => $placardId,
                'playerId' => $playerId,
                'cardColor' => $cardColor,
                'timestamp' => $timestamp
            ];

            $redis->multi();
            $redis->hMSet($cardEventKey, $cardData);
            $redis->zAdd($gameCardsKey, $timestamp, $cardEventKey);
            $result = $redis->exec();

            if ($result) {
                $response = [
                    "message" => "Card event added successfully",
                    "event" => $cardData
                ];
            } else {
                $response = ["error" => "Failed to add card event"];
            }
            break;

        case 'remove':
            $eventId = $params['eventId'] ?? null;

            if (!$eventId) {
                $response = ["error" => "Missing eventId for remove action"];
                break;
            }

            $cardEventKey = $keys['card_event'] . $eventId;

            $redis->multi();
            $redis->del($cardEventKey);
            $redis->zRem($gameCardsKey, $cardEventKey);
            $result = $redis->exec();

            if ($result && $result[0] >= 0 && $result[1] >= 0) {
                 $response = [
                    "message" => "Card event removed successfully",
                    "eventId" => $eventId
                ];
            } else {
                 $response = ["error" => "Failed to remove card event or event not found"];
            }
            break;

        case 'get':
            $cardEventKeys = $redis->zRange($gameCardsKey, 0, -1);

            if (empty($cardEventKeys)) {
                $response = ["cards" => []];
                break;
            }

            $pipe = $redis->pipeline();
            foreach ($cardEventKeys as $key) {
                $pipe->hGetAll($key);
            }
            $cardHashes = $pipe->exec();

            $cards = [];
            foreach ($cardHashes as $hash) {
                if ($hash) { 
                    if (isset($hash['timestamp'])) $hash['timestamp'] = (int)$hash['timestamp'];
                    if (isset($hash['eventId'])) $hash['eventId'] = (int)$hash['eventId'];
                    $cards[] = $hash;
                }
            }

            $response = ["cards" => $cards];
            break;

        default:
            $response = ["error" => "Invalid action specified"];
            break;
    }

} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
    http_response_code(500); 
}

echo json_encode($response);
?>