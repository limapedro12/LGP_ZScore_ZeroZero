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
$allowedActions = ['add', 'update', 'remove', 'get'];

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
$substitutionId = $params['substitutionId'] ?? null;


$redis = RedistUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

$prefixKey = "game:$placardId:team:$team:";
$substitutionSetKey = $prefixKey . "substitution_set";
$substitutionIdKey = $prefixKey . "substitution:$substitutionId"; 
try {
    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    if ($action !== 'get') {
        $ingamePlayers = getIngamePlayers($redis, $placardId, $sport, $team);
        if (array_key_exists("error", $ingamePlayers)){
            $response = ["error"=> $ingamePlayers["error"]];
            echo json_encode($response);
            exit;
        }
        $ingamePlayers = $ingamePlayers["players"];
    }

    switch ($action){
        case 'get':
            if (($requestMethod !== 'GET')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }

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

            if ($ingamePlayers[$playerOut] == false){
                $response = ["error"=> "Player $playerOut is not in the game"];
            }
            else if ($ingamePlayers[$playerIn] == true) {
                $response = ["error"=> "Player $playerIn is already in the game"];
            }

            else {
                $currentSubstitutionIDs = $redis->lRange($substitutionSetKey, 0, -1);
                foreach ($currentSubstitutionIDs as $itSubstitutionId) {
                    $substitutionInfo = json_decode($redis->get($prefixKey . "substitution:$itSubstitutionId"), true);
                    if ($substitutionInfo !== null) {
                        $currentSubstitutions[] = $substitutionInfo["substitutionId"];
                    }
                }
                if ($gameConfig["substitutionsPerTeam"] != 0 && sizeof($currentSubstitutions) >= $gameConfig["SubstitutionsPerTeam"]) { //TODO Still doesn't check per set (as in volleyball)
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
            if (($requestMethod !== 'POST')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }
            else if ((is_null($team) || ($team !== "home" && $team !== "away"))) {
                echo json_encode(["error" => "Missing valid team"]);
                exit;
            }
            else if (is_null($substitutionId)) {
                echo json_encode(["error"=> "Missing substitutionId"]);
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
            if (($requestMethod !== 'POST')) {
                http_response_code(400);
                echo json_encode(["error" => "Method not allowed"]);
                exit;
            }
            else if ((is_null($team) || ($team !== "home" && $team !== "away"))) {
                echo json_encode(["error" => "Missing valid team"]);
                exit;
            }
            else if (is_null($substitutionId)) {
                echo json_encode(["error"=> "Missing substitutionId"]);
                exit;
            }
            

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