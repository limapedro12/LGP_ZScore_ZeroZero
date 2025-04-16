<?php
require_once __DIR__ . '/../../utils/connRedis.php';
require_once __DIR__ . '/../../utils/gameData.php';
require_once __DIR__ . '/../../config/gameConfig.php';


header('Content-Type: application/json');
$jsonBody = null;

if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $jsonBody = json_decode($input, true);
    }
}
else {
    $response['message'] = 'Invalid request method. Only POST is allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit;
}

try {
    $redis = connectRedis();
    if (!$redis || !$redis->ping()) {
        throw new Exception("Failed to connect to Redis");
    }
} catch (Exception $e) {
    error_log("Redis Connection Error: " . $e->getMessage());
    $response['message'] = 'Service unavailable (Database connection failed).';
    http_response_code(503);
    echo json_encode($response);
    exit;
}

$action = $jsonBody['action'] ?? null;
$allowedActions = ['create', 'update', 'delete'];

if (is_null($action) || !in_array($action, $allowedActions)) {
    $response['message'] = 'Missing or invalid action parameter. Allowed actions: ' . implode(', ', $allowedActions);
    http_response_code(400);
    echo json_encode($response);
    exit;
}

$placardId = $_GET['gameId'] ?? $jsonBody['gameId'] ?? null;
$gameType = $_GET['gameType'] ?? $jsonBody['gameType'] ?? null;
$teamNumber = $_GET['teamNumber'] ?? $jsonBody['teamNumber'] ?? null;
$playerIn = $_GET['playerIn'] ?? $jsonBody['playerIn'] ?? null;
$playerOut = $_GET['playerOut'] ?? $jsonBody['playerOut'] ?? null;
$substitutionId = $_GET['substitutionId'] ?? $jsonBody['substitutionId'] ?? null;

if (is_null($placardId)) {
    echo json_encode(["error" => "Missing gameId"]);
    exit;
}
if (is_null($gameType)) {
    echo json_encode(["error" => "Missing gameType"]);
    exit;
}
if (is_null($teamNumber)) {
    echo json_encode(["error" => "Missing teamNumber"]);
    exit;
}
if (is_null($playerIn) && $action !== "delete") {
    echo json_encode(["error" => "Missing playerIn"]);
    exit;
}
if (is_null($playerOut) && $action !== "delete") {
    echo json_encode(["error"=> "Missing playerOut"]);
    exit;
}
if (is_null($substitutionId) && $action !== 'create') {
    echo json_encode(["error"=> "Missing substitutionId"]);
    exit;
}


$prefixKey = "game:$placardId:team$teamNumber"; 
try {
    $ingamePlayers = getIngamePlayers($redis, $placardId, $teamNumber);
    if ($ingamePlayers["error"] != null){
        $response = ["error"=> $ingamePlayers["error"]];
        echo json_encode($response);
        exit;
    }
    $ingamePlayers = $ingamePlayers["players"];

    switch ($action){
        case 'create':
            if ($ingamePlayers["error"] != null){
                $response = ["error"=> $ingamePlayers["error"]];
            }
            else if ($ingamePlayers[$playerOut] == false){
                $response = ["error"=> "Player $playerOut is not in the game"];
            }
            else if ($ingamePlayers[$playerIn] == true) {
                $response = ["error"=> "Player $playerIn is already in the game"];
            }

            else {
                $currentSubstitutions = $redis->sMembers($prefixKey . "substitution_set");
                if ($ingamePlayers[$playerOut] === false){
                    $response = ["error"=> "No substitution found"];
                    break;
                }
                $substitutionId = sizeof($currentSubstitutions) + 1;

                $ingamePlayers[$playerIn] = true;
                $ingamePlayers[$playerOut] = false;

                $substitutionInfo = [
                    "substitutionId" => $substitutionId,
                    "playerInId" => $playerIn,
                    "playerOutId" => $playerOut,
                ];

                $redis->hMSet($prefixKey . "substitutions:$substitutionId", $substitutionInfo);
                $redis->sAdd($prefixKey . "substitution_set", $substitutionId);

                $response = [
                    "message"=> "Substitution created successfully",
                    "substitutionId"=> $substitutionId,
                    "ingamePlayers" => $ingamePlayers
                ];
            }
            break;
        case 'update':
            try {

                $key = $prefixKey . "substitution:$substitutionId";
                $oldSubstitution = $redis->hGetAll( $key);
                if ($oldSubstitution === false) {
                    $response = ["error"=> "Substitution with ID $substitutionId not found"];
                    break;
                }

                //validate alterations
                if ($oldSubstitution["playerInId"] !== $playerIn && $ingamePlayers[$playerIn] === true) {
                    $response = ["error"=> "Player $playerIn is already in the game"];
                    break;
                }
                if ($oldSubstitution["playerOutId"] !== $playerOut && $ingamePlayers[$playerOut] === false){
                    $response = ["error"=> "Player $playerOut is not in the game"];
                    break;
                }

                $ingamePlayers[$oldSubstitution["playerInId"]] = false;
                $ingamePlayers[$playerIn] = true;
                $ingamePlayers[$oldSubstitution["playerOutId"]] = true;
                $ingamePlayers[$playerOut] = false;

                $redis->hMSet($key, [
                    "substitutionId" => $substitutionId,
                    "playerInId" => $playerIn,
                    "playerOutId" => $playerOut,
                ]);

                $response = [
                    "message"=> "Substitution updated successfully",
                    "ingamePlayers" => $ingamePlayers,
                ];
                
            } catch (Exception $e) {
                $response = ["error"=> "Failed to update substitution: " . $e->getMessage()];
            }
            break;
        case 'delete':
            try {

                $key = $prefixKey ."substitution:$substitutionId";
                $oldSubstitution = $redis->hGetAll( $key);
                if ($oldSubstitution === false) {
                    $response = ["error"=> "Substitution with ID $substitutionId not found"];
                    break;
                }

                $ingamePlayers[$oldSubstitution["playerInId"]] = false;
                $ingamePlayers[$oldSubstitution["playerOutId"]] = true;

                $redis->del($key);
                $redis->sRem($prefixKey . "substitution_set", $substitutionId);

                $response = [
                    "message"=> "Substitution updated successfully",
                    "ingamePlayers" => $ingamePlayers,
                ];
                
            } catch (Exception $e) {
                $response = ["error"=> "Failed to update substitution: " . $e->getMessage()];
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