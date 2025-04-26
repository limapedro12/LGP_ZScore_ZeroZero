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
else if (!($_SERVER['REQUEST_METHOD'] === 'GET' && $_GET['action'] === 'list')) {
    $response['message'] = 'Invalid request method. Only POST is allowed. (GET for list substitutions)';
    http_response_code(405);
    echo json_encode($response);
    exit;
}


$action = $_GET['action'] ?? $jsonBody['action'] ?? null;
$placardId = $_GET['placardId'] ?? $jsonBody['placardId'] ?? null; //GET is used for the list action
$sport = $_GET['sport'] ?? $jsonBody['sport'] ?? null;
$team = $jsonBody['team'] ?? null;
$playerIn = $jsonBody['playerIn'] ?? null;
$playerOut = $jsonBody['playerOut'] ?? null;
$substitutionId = $jsonBody['substitutionId'] ?? null;

$allowedActions = ['add', 'update', 'remove', 'list'];
if (is_null($action) || !in_array($action, $allowedActions)) {
    $response['message'] = 'Missing or invalid action parameter (Curr:' . $action . '). Allowed actions: ' . implode(', ', $allowedActions);
    http_response_code(400);
    echo json_encode($response);
    exit;
}
if (is_null($placardId)) {
    echo json_encode(["error" => "Missing gameId"]);
    exit;
}
if (is_null($sport)) {
    echo json_encode(["error" => "Missing sport"]);
    exit;
}
if ((is_null($team) || ($team !== "home" && $team !== "away")) && ($action !== "list")) {
    echo json_encode(["error" => "Missing valid team"]);
    exit;
}
if (is_null($playerIn) && ($action !== "remove" && $action !== "list")) {
    echo json_encode(["error" => "Missing playerIn"]);
    exit;
}
if (is_null($playerOut) && ($action !== "remove" && $action !== "list")) {
    echo json_encode(["error"=> "Missing playerOut"]);
    exit;
}
if (is_null($substitutionId) && ($action !== "add" && $action !== "list")) {
    echo json_encode(["error"=> "Missing substitutionId"]);
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

$prefixKey = "game:$placardId:team:$team:";
$substitutionSetKey = $prefixKey . "substitution_set";
$substitutionIdKey = $prefixKey . "substitution:$substitutionId"; 
try {
    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    if ($action !== 'list') {
        $ingamePlayers = getIngamePlayers($redis, $placardId, $sport, $team);
        if (array_key_exists("error", $ingamePlayers)){
            $response = ["error"=> $ingamePlayers["error"]];
            echo json_encode($response);
            exit;
        }
        $ingamePlayers = $ingamePlayers["players"];
    }

    switch ($action){
        case 'list':
            $prefix1Key = "game:$placardId:team:home:";
            $substitutions1 = $redis->lRange($prefix1Key . "substitution_set", 0, -1);
            // var_dump("subs1",$substitutions1);
            $substitutionsInfo = [];
            foreach ($substitutions1 as $itSubstitutionId) {
                $substitutionInfo = json_decode($redis->get($prefix1Key . "substitution:$itSubstitutionId"), true);
                if ($substitutionInfo !== null) {
                    $substitutionsInfo[] = $substitutionInfo;
                }
            }

            $prefix2Key = "game:$placardId:team:away:";
            $substitutions2 = $redis->lRange($prefix2Key . "substitution_set", 0, -1);
            foreach ($substitutions2 as $itSubstitutionId) {
                $substitutionInfo = json_decode($redis->get($prefix2Key . "substitution:$itSubstitutionId"), true);
                if ($substitutionInfo !== null) {
                    $substitutionsInfo[] = $substitutionInfo;
                }
            }

            $response = [
                "message"=> "Substitution status retrieved successfully",
                "substitutions" => $substitutionsInfo,
            ];
            break;

        case 'add':
            if ($ingamePlayers[$playerOut] == false){
                $response = ["error"=> "Player $playerOut is not in the game"];
            }
            else if ($ingamePlayers[$playerIn] == true) {
                $response = ["error"=> "Player $playerIn is already in the game"];
            }

            else {
                $currentSubstitutions = $redis->lRange($substitutionSetKey, 0, -1);
                if ($gameConfig["substitutionsPerTeam"] != 0 && sizeof($currentSubstitutions) >= $gameConfig["SubstitutionsPerTeam"]) {
                    $response = ["error"=> "Maximum number of substitutions reached"];
                    break;
                }
                $currentSubstitutionsId = array_map('intval', $currentSubstitutions);
                $maxId = sizeof($currentSubstitutions) > 0 ? max($currentSubstitutionsId) : 0;
                $newSubstitutionId =  (string) ($maxId + 1);

                $ingamePlayers[$playerIn] = true;
                $ingamePlayers[$playerOut] = false;

                $substitutionInfo = [
                    "substitutionId" => $newSubstitutionId,
                    "team" => $team,
                    "playerInId" => $playerIn,
                    "playerOutId" => $playerOut,
                ];

                $newSubstitutionIdKey = $prefixKey . "substitution:$newSubstitutionId";
                $redis->set($newSubstitutionIdKey,json_encode($substitutionInfo));
                // var_dump("newSubstitutionId", $newSubstitutionId, "subSetKey", $substitutionSetKey,"---");
                $redis->rPush($substitutionSetKey, $newSubstitutionId);

                $response = [
                    "message"=> "Substitution created successfully",
                    "substitutionId"=> $newSubstitutionId,
                    "ingamePlayers" => $ingamePlayers
                ];
            }
            break;
        case 'update':
            try {
                $oldSubstitution = json_decode($redis->get($substitutionIdKey),true);
                if ($oldSubstitution === null) {
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

                $redis->set($substitutionIdKey, json_encode([
                    "substitutionId" => $substitutionId,
                    "team" => $team,
                    "playerInId" => $playerIn,
                    "playerOutId" => $playerOut,
                ]));

                $response = [
                    "message"=> "Substitution updated successfully",
                    "substitutionId"=> $substitutionId,
                    "ingamePlayers" => $ingamePlayers,
                ];
                
            } catch (Exception $e) {
                $response = ["error"=> "Failed to update substitution: " . $e->getMessage()];
            }
            break;
        case 'remove':
            try {
                $oldSubstitution = json_decode($redis->get($substitutionIdKey),true);
                if ($oldSubstitution === null) {
                    $response = ["error"=> "Substitution with ID $substitutionId not found"];
                    break;
                }
                
                $ingamePlayers[$oldSubstitution["playerInId"]] = false;
                $ingamePlayers[$oldSubstitution["playerOutId"]] = true;
                
                $redis->del($substitutionIdKey);
                // var_dump("substitutionId", $substitutionId, "subSetKey", $substitutionSetKey, "---");
                $redis->lRem($substitutionSetKey, 0, (string) $substitutionId);

                $response = [
                    "message"=> "Substitution deleted successfully",
                    "substitutionId"=> $substitutionId,
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