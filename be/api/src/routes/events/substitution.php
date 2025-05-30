<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../classes/AbstractEvent.php';
require_once __DIR__ . '/../../classes/SubstitutionEvent.php';
require_once __DIR__ . '/../../utils/gameData.php';
require_once __DIR__ . '/../../config/gameConfig.php';


header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];
$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'sport', 'action'];
$allowedActions = ['create', 'update', 'delete', 'get'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$action =  $params['action'] ?? null;
$placardId =  $params['placardId'] ?? null;
$sport =  $params['sport'] ?? null;
$team = $params['team'] ?? null;
$playerIn = $params['playerIn'] ?? null;
$playerOut = $params['playerOut'] ?? null;
$eventId = $params['eventId'] ?? null;


$redis = RedistUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {
    $keys = RequestUtils::getRedisKeys($placardId, 'substitutions');

    $substitutionsKey = $keys['substitutions'];
    $eventCounterKey = $keys['event_counter'];

    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    switch ($action){
        case 'get':
            if (($requestMethod !== 'GET')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }

            $substitutionEventKeys = $redis->zRange($substitutionsKey, 0, -1);

            $pipe = $redis->pipeline();
            foreach ($substitutionEventKeys as $substitutionEventKey) {
                $pipe->hGetAll($substitutionEventKey);
            }
            $substitutionHashes = $pipe->exec();

            $substitutionsInfo = [];
            foreach ($substitutionHashes as $substitutionHash) {
                if ($substitutionHash) {
                    if (isset($substitutionHash['timestamp'])) $substitutionHash['timestamp'] = (int)$substitutionHash['timestamp'];
                    if (isset($substitutionHash['eventId'])) $substitutionHash['eventId'] = (int)$substitutionHash['eventId'];
                    $substitutionsInfo[] = $substitutionHash;
                }
            }

            $response = [
                "message"=> "Substitution status retrieved successfully",
                "substitutions" => $substitutionsInfo,
            ];
            break;

        case 'create':
            if (($requestMethod !== 'POST')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }
            else if ((is_null($team) || ($team !== "home" && $team !== "away"))) {
                echo json_encode(["error" => "Missing valid team"]);
                exit;
            }
            else if (is_null($playerIn)) {
                echo json_encode(["error" => "Missing playerIn"]);
                exit;
            }
            else if (is_null($playerOut)) {
                echo json_encode(["error"=> "Missing playerOut"]);
                exit;
            }

            $currentSubstitutionIDs = $redis->zRange($substitutionsKey, 0, -1);
            $currentSubstitutions = [];
            foreach ($currentSubstitutionIDs as $eventIdKey) {
                $substitutionInfo = $redis->hGetAll($eventIdKey);
                if (!empty($substitutionInfo) && $substitutionInfo["team"] === $team) {
                    $currentSubstitutions[] = $substitutionInfo["eventId"];
                }
            }
            if ($gameConfig["substitutionsPerTeam"] != 0 && sizeof($currentSubstitutions) >= $gameConfig["substitutionsPerTeam"]) {
                http_response_code(400);
                $response = ["error"=> "Maximum number of substitutions reached"];
                break;
            }
            $eventId = $redis->incr($eventCounterKey);
            $substitutionEventKey = $keys['substitution_event'] . $eventId;
            if (isset($gameConfig['periodDuration']) && $gameConfig['periodDuration']) {
                $gameTimePosition = RequestUtils::getGameTimePosition($placardId, $gameConfig);
            } else {
                $gameTimePosition = 0;
            }

            
            $substitutionData = [
                "eventId" => $eventId,
                "team" => $team,
                "playerInId" => $playerIn,
                "playerOutId" => $playerOut,
                "timestamp" => $gameTimePosition
            ];

            $redis->multi();
            $redis->hMSet($substitutionEventKey,$substitutionData);
            $redis->zAdd($substitutionsKey, $eventId, $substitutionEventKey);
            $result = $redis->exec();

            if ($result) {
                http_response_code(201);
                $response = [
                    "message"=> "Substitution created successfully",
                    "substitution"=> $substitutionData
                ];
            }
            else {
                http_response_code(500);
                $response = ["error"=> "Failed to create substitution event"];
            }
            break;
        case 'update':
            if (($requestMethod !== 'POST')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }
            else if (is_null($eventId)) {
                echo json_encode(["error"=> "Missing eventId"]);
                exit;
            }
            else if (is_null($playerIn)) {
                echo json_encode(["error" => "Missing playerIn"]);
                exit;
            } 
            else if (is_null($playerOut)) {
                echo json_encode(["error"=> "Missing playerOut"]);
                exit;
            }

            $substitutionEventKey = $keys['substitution_event'] . $eventId;
            $oldSubstitution = $redis->hGetAll($substitutionEventKey);
            if (empty($oldSubstitution)) {
                $response = ["error"=> "Substitution with ID $eventId not found"];
                break;
            }

            $team = $oldSubstitution["team"];

            $newTimestamp = $params['newTimestamp'] ?? $oldSubstitution["timestamp"];

            if ($oldSubstitution["playerInId"] === $playerIn
                        && $oldSubstitution["playerOutId"] === $playerOut 
                        && $oldSubstitution["timestamp"] == $newTimestamp) {
                http_response_code(400);            
                $response = ["error"=> "No changes detected"];
                break;
            }

            $substitutionData = [
                "eventId" => $eventId,
                "team" => $team,
                "playerInId" => $playerIn,
                "playerOutId" => $playerOut,
                "timestamp" => $newTimestamp
            ];

            $redis->multi();
            $redis->hMSet($substitutionEventKey, $substitutionData);
            $redis->zAdd($substitutionsKey, $eventId, $substitutionEventKey);
            $result = $redis->exec();

            if ($result) {
                $response = [
                    "message"=> "Substitution updated successfully",
                    "substitution"=> $substitutionData
                ];
            }
            else {
                http_response_code(500);
                $response = ["error"=> "Failed to update substitution event"];
            }
            break;
        case 'delete':
            if (($requestMethod !== 'POST')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }
            else if (is_null($eventId)) {
                echo json_encode(["error"=> "Missing eventId"]);
                exit;
            }

            $substitutionEventKey = $keys['substitution_event'] . $eventId;
            $oldSubstitution = $redis->hGetAll($substitutionEventKey);

            if (empty($oldSubstitution)) {
                $response = ["error"=> "Substitution with ID $eventId not found"];
                break;
            }

            $redis->multi();
            $redis->del($substitutionEventKey);
            $redis->zRem($substitutionsKey, $substitutionEventKey);
            $result = $redis->exec();

            if ($result && isset($result[0]) && $result[0] > 0 && isset($result[1]) && $result[1] > 0) {
                $response = [
                    "message"=> "Substitution deleted successfully",
                    "eventId"=> $eventId
                ];
            } else {
                http_response_code(500);
                $response = ["error"=> "Failed to delete substitution event"];
            }

            break;

        default:
            $response = ["error" => "Invalid action"];
            break;
    }
} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>