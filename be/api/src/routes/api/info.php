<?php
    require_once __DIR__.'/../../utils/apiUtils.php';
    require_once __DIR__.'/../../utils/apiSyntax.php';
    require_once __DIR__.'/../../utils/dbUtils.php';
    require_once __DIR__.'/../../utils/requestUtils.php';

    function getAvailPlacards()
    {
        $placardIds = insertMatchesColab();
        if ($placardIds === false) {
            echo json_encode(["error" => "Failed to insert placards"]);
            exit;
        }

        $allPlacards = DbUtils::selectAllPlacards();

        if ($allPlacards === false) {
            if (http_response_code() === 200) { 
                 echo json_encode(["error" => "Failed to retrieve placards from database."]);
            }
            exit;
        }
        
        return $allPlacards;
    }

    function getPlacards()
    {
        $placards = DbUtils::selectAllPlacards();
        if ($placards === false) {
            return json_encode(["error" => "Failed to get placards"]);
        }
        
        return $placards;
    }


    function getPlacardInfo($placardId)
    {
        $placardInfo = DbUtils::selectPlacard($placardId);
        if ($placardInfo === false) {
            return json_encode(["error" => "Failed to get placard info"]);
        }
        
        return $placardInfo;
    }

    function getTeamInfo($teamId)
    {
        $teamInfo = DbUtils::selectTeam($teamId);
        if ($teamInfo === false) {
            return json_encode(["error" => "Failed to get team info"]);
        }
        
        return $teamInfo;
    }

    function getTeamLineup($placardId, $teamId)
    {
        $insert = insertLineup($placardId);
        $lineup = DbUtils::selectTeamLineup($placardId, $teamId);
        if ($lineup === false) {
            return json_encode(["error" => "Failed to get lineup"]);
        }

        return $lineup;
    }

    function getPlayerInfo($playerId){
        $player = DbUtils::selectPlayer($playerId);
        if ($player === false || is_null($player)) {
            return ["error" => "Player not found"];
        }
        return $player;
    }

    header('Content-Type: application/json');
    $jsonBody = null;
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    $params = RequestUtils::getRequestParams($requestMethod);

    $action = $params['action'] ?? null;
    $placardId = $params['placardId'] ?? null;
    $teamId = $params['teamId'] ?? null;
    $sport = $params['sport'] ?? null;

    switch ($action) {
        case 'getAvailPlacards':
            $response = getAvailPlacards();
            break;
        case 'getPlacards':
            $response = getPlacards();
            break;
        case 'getPlacardInfo':
            if ($placardId === null) {
                echo json_encode(["error" => "Missing placardId"]);
                exit;
            }
            if ($sport === null) {
                echo json_encode(["error" => "Missing sport"]);
                exit;
            }

            $response = getPlacardInfo($placardId, $sport);
            break;

        case 'getTeamLineup':
            if ($placardId === null || $teamId === null) {
                echo json_encode(["error" => "Missing placardId or teamId"]);
                exit;
            }
            $response = getTeamLineup($placardId, $teamId);
            break;
        case 'getTeamInfo':
            if ($teamId === null) {
                echo json_encode(["error" => "Missing teamId"]);
                exit;
            }
            $response = getTeamInfo($teamId);
            break;
        case 'getAllowColab':
            if ($placardId === null) {
                echo json_encode(["error" => "Missing placardId"]);
                exit;
            }
            $response = getAllowColab($placardId);
            break;
        case 'getPlayerInfo':
            $playerId = $params['playerId'] ?? null;
            if ($playerId === null) {
                echo json_encode(["error" => "Missing playerId"]);
                exit;
            }
            $response = getPlayerInfo($playerId);
            break;
        default:
            echo json_encode(["error" => "Invalid action"]);
            exit;
    }

    echo json_encode($response);
?>