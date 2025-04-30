<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../classes/AbstractEvent.php';
require_once __DIR__ . '/../../classes/CardEvent.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/cardValidationUtils.php';

header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['add', 'update', 'remove', 'get'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400); // Bad Request
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$action = $params['action'] ?? null;
$sport = $params['sport'] ?? null;

$redis = RedistUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {
    $keys = RequestUtils::getRedisKeys($placardId, 'cards');

    $gameCardsKey = $keys['game_cards'];
    $eventCounterKey = $keys['event_counter'];

    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    switch ($action) {
        case 'add':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for add action."];
                break;
            }
            $playerId = $params['playerId'] ?? null;
            $cardType = $params['cardType'] ?? null;

            //check if the cardType is valid according to the sport
            if(!$cardType || !in_array($cardType, $gameConfig['cards'])) {
                http_response_code(400);
                $response = ["error" => "Invalid card type"];
                break;
            }
            $timestamp = RequestUtils::getGameTimePosition($placardId, $gameConfig);

            if (!$playerId || !$cardType || ($timestamp === null)) {
                http_response_code(400);
                $response = ["error" => "Missing playerId, cardType or timestamp for add action"];
                break;
            }

            if(!CardValidationUtils::canAssignCard($redis, null, $placardId, $sport, (int)$playerId, $cardType)) {
                http_response_code(400);
                $response = ["error" => "Cannot assign card to player according to game rules!"];
                break;
            }

            $eventId = $redis->incr($eventCounterKey);
            $cardEventKey = $keys['card_event'] . $eventId;

            $cardData = [
                'eventId' => $eventId,
                'placardId' => $placardId,
                'playerId' => $playerId,
                'cardType' => $cardType,
                'timestamp' => $timestamp
            ];

            $redis->multi();
            $redis->hMSet($cardEventKey, $cardData);
            $redis->zAdd($gameCardsKey, $timestamp, $cardEventKey);
            $result = $redis->exec();

            if ($result) {
                http_response_code(201); 
                $response = [
                    "message" => "Card event added successfully",
                    "event" => $cardData
                ];
            } else {
                http_response_code(500);
                $response = ["error" => "Failed to add card event"];
            }
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

            $cardEventKey = $keys['card_event'] . $eventId;

            if (!$redis->exists($cardEventKey)) {
                http_response_code(404); 
                $response = ["error" => "Card event not found"];
                break;
            }

            $currentCardData = $redis->hGetAll($cardEventKey);

            $updatedData = [];
            $isChanged = false;

            if(isset($params['playerId'])){
                //need to check if playerId exists, only possible when there is players data
                if ($params['playerId'] != $currentCardData['playerId']) {
                    $updatedData['playerId'] = $params['playerId'];
                    $isChanged = true;
                }
            }

            if(isset($params['cardType'])){
                if(!in_array($params['cardType'], $gameConfig['cards'])) {
                    http_response_code(400);
                    $response = ["error" => "Invalid card type"];
                    break;
                }
                $playerIdForValidation = $updatedData['playerId'] ?? $currentCardData['playerId'];
                if(!CardValidationUtils::canAssignCard($redis, $eventId, $placardId, $sport, (int)$playerIdForValidation, $params['cardType'])) {
                    http_response_code(400);
                    $response = ["error" => "Cannot assign card to player according to game rules!"];
                    break;
                }
                if ($params['cardType'] != $currentCardData['cardType']) {
                    $updatedData['cardType'] = $params['cardType'];
                    $isChanged = true;
                }
            }

            if(isset($params['timestamp'])){
                if ((string)$params['timestamp'] !== (string)$currentCardData['timestamp']) {
                    $updatedData['timestamp'] = $params['timestamp'];
                    $isChanged = true;
                }
            }

            $providedUpdateParams = isset($params['playerId']) || isset($params['cardType']) || isset($params['timestamp']);

            if (!$providedUpdateParams || !$isChanged) {
                http_response_code(400);
                $response = ["error" => "No data to update or new values are the same as current values"];
                break;
            }

            $updatedData['eventId'] = $eventId;
            $updatedData['placardId'] = $placardId;
            $updatedData['playerId'] = $updatedData['playerId'] ?? $currentCardData['playerId'];
            $updatedData['cardType'] = $updatedData['cardType'] ?? $currentCardData['cardType'];
            $updatedData['timestamp'] = $updatedData['timestamp'] ?? $currentCardData['timestamp'];

            $timestampForZadd = $updatedData['timestamp'];

            $redis->multi();
            $redis->hMSet($cardEventKey, $updatedData);
            $redis->zAdd($gameCardsKey, $timestampForZadd, $cardEventKey);
            $result = $redis->exec();

            if ($result) {
                $response = [
                    "message" => "Card event updated successfully",
                    "event" => $updatedData
                ];
            } else {
                http_response_code(500);
                $response = ["error" => "Failed to update card event"];
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

            $cardEventKey = $keys['card_event'] . $eventId;

            if (!$redis->exists($cardEventKey)) {
                http_response_code(404); 
                $response = ["error" => "Card event not found"];
                break;
            }

            $redis->multi();
            $redis->del($cardEventKey);
            $redis->zRem($gameCardsKey, $cardEventKey);
            $result = $redis->exec();

            if ($result && isset($result[0]) && $result[0] > 0 && isset($result[1]) && $result[1] > 0) {
                 $response = [
                    "message" => "Card event removed successfully",
                    "eventId" => $eventId
                ];
            } else {
                 http_response_code(500);
                 $response = ["error" => "Failed to remove card event"];
            }
            break;

        case 'get':
            if ($requestMethod !== 'GET') {
                http_response_code(405); 
                $response = ["error" => "Invalid request method. Only GET is allowed for get action."];
                break;
            }
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
            http_response_code(400);
            $response = ["error" => "Invalid action specified"];
            break;
    }

} catch (Exception $e) {
    http_response_code(500); 
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

if (http_response_code() === 200 && !empty($response['error'])) {
    http_response_code(400);
} elseif (http_response_code() === 200 && empty($response)) {
    http_response_code(204);
}


echo json_encode($response);
?>