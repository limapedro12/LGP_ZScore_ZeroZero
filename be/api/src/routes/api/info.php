<?php
    require_once __DIR__.'/../../utils/apiUtils.php';
    require_once __DIR__.'/../../utils/apiSyntax.php';
    require_once __DIR__.'/../../utils/dbUtils.php';
    require_once __DIR__.'/../../utils/requestUtils.php';

    function getAvailPlacards()
    {
        $apiurl = getenv('API_URL');
        $appkey = getenv('APP_KEY');
        session_start();
        $cookie = $_SESSION['api_cookie'];
        $matchesColab = getMatchesColab($apiurl, $appkey, $cookie);
        $placardIds = insertMatchesColab($matchesColab);
        if ($placardIds === false) {
            echo json_encode(["error" => "Failed to insert placards"]);
            exit;
        }
        $response = [];
        foreach ($placardIds as $pair) {
            foreach ($pair as $placardId => $sport) {    
                $placard = DbUtils::selectPlacard($placardId, $sport);
                if ($placard) {
                    $response[] = $placard;
                }else {
                    echo json_encode(["error" => "Failed to get placard info for placardId: $placardId"]);
                    exit;
                }
            }
        }
        return $response;
    }

    function getPlayersInfo($placardId, $teamId)
    {
        $apiurl = getenv('API_URL');
        $appkey = getenv('APP_KEY');
        session_start();
        $cookie = $_SESSION['api_cookie'];

        $teamLiveInfo = getTeamLive($apiurl, $appkey, $cookie, $placardId, $teamId);
        $sport = insertTeamLive($teamLiveInfo);
        if ($sport === false) {
            return json_encode(["error" => "Failed to insert team live info"]);
        }

        $playersInfo = DbUtils::selectTeamPlayers($teamId, $sport);
        if ($playersInfo === false) {
            return json_encode(["error" => "Failed to get players info"]);
        }
        return $playersInfo;
    }

    function getTeamInfo($placardId, $teamId)
    {
        $apiurl = getenv('API_URL');
        $appkey = getenv('APP_KEY');
        session_start();
        $cookie = $_SESSION['api_cookie'];
        $teamLiveInfo = getTeamLive($apiurl, $appkey, $cookie, $placardId, $teamId);
        $sport = insertTeamLive($teamLiveInfo);
        $teamInfo = DbUtils::selectTeam($teamId, $sport);
        if ($teamInfo === false) {
            return json_encode(["error" => "Failed to get team info"]);
        }
        
        return $teamInfo;
    }

    function getPlacardInfo($placardId, $sport)
    {
        $placardInfo = DbUtils::selectPlacard($placardId, $sport);
        if ($placardInfo === false) {
            return json_encode(["error" => "Failed to get placard info"]);
        }
        
        return $placardInfo;
    }

    header('Content-Type: application/json');
    $jsonBody = null;
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    $params = RequestUtils::getRequestParams($requestMethod);

    $action = $params['action'] ?? null;
    $placardId = $params['placardId'] ?? null;
    $teamId = $params['teamId'] ?? null;
    $sport = $params['sport'] ?? null;

    $allowedActions = ['getAvailPlacards', 'getPlacardInfo', 'getPlayersInfo', 'getTeamInfo' ];

    if (!in_array($action, $allowedActions)) {
        echo json_encode(["error" => "Invalid action: $action"]);
        exit;
    }

    switch ($action) {
        case 'getAvailPlacards':
            $response = getAvailPlacards();
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
        case 'getPlayersInfo':
            if ($placardId === null || $teamId === null) {
                echo json_encode(["error" => "Missing placardId or teamId"]);
                exit;
            }
            $response = getPlayersInfo($placardId, $teamId);
            break;
        case 'getTeamInfo':
            if ($placardId === null || $teamId === null) {
                echo json_encode(["error" => "Missing placardId or teamId"]);
                exit;
            }
            $response = getTeamInfo($placardId, $teamId);
            break;
    }

    echo json_encode($response);
?>