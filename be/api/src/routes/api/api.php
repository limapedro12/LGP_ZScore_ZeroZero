<?php
require_once __DIR__ . '/../../index.php';
require_once __DIR__ . '/../../utils/apiUtils.php';

header('Content-Type: application/json');
$jsonBody = null;
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $jsonBody = json_decode($input, true);
    }
}

$apiurl = GETENV('API_URL');
if (empty($apiurl)) {
    echo json_encode(["error" => "API URL not set"]);
    exit;
}

$appkey = GETENV('APP_KEY');
if (empty($appkey)) {
    echo json_encode(["error" => "API Key not set"]);
    exit;
}

$action = $_GET['action'] ?? $jsonBody['action'] ?? null;
if (is_null($action)) {
    echo json_encode(["error" => "Missing action"]);
    exit;
}

$allowedActions = ['login', 'getMatchesColab', 'getMatchLiveInfo', 'getTeamLive'];
if (!in_array($action, $allowedActions)) {
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

$username = $_GET['username'] ?? $jsonBody['username'] ?? null;
$password = $_GET['password'] ?? $jsonBody['password'] ?? null;
if ((is_null($username) || is_null($password)) && $action === 'login') {
    echo json_encode(["error" => "Missing username or password"]);
    exit;
}
$cookie = $_GET['cookie'] ?? $jsonBody['cookie'] ?? null;
if (is_null($cookie) && $action !== 'login') {
    echo json_encode(["error" => "Missing cookie"]);
    exit;
}
$matchId = $_GET['matchId'] ?? $jsonBody['matchId'] ?? null;
if (is_null($matchId) && ($action === 'getMatchLiveInfo' || $action === 'getTeamLive')) {
    echo json_encode(["error" => "Missing matchId"]);
    exit;
}

$teamId = $_GET['teamId'] ?? $jsonBody['teamId'] ?? null;
if (is_null($teamId) && $action === 'getTeamLive') {
    echo json_encode(["error" => "Missing teamId"]);
    exit;
}

switch ($action) {
    case 'login':
        $response = login($apiurl, $appkey, $username, $password);
        break;
    case 'getMatchesColab':
        $response = getMatchesColab($apiurl, $appkey, $cookie);
        break;
    case 'getMatchLiveInfo':
        $response = getMatchLiveInfo($apiurl, $appkey, $cookie, $matchId);
        break;
    case 'getTeamLive':
        $response = getTeamLive($apiurl, $appkey, $cookie, $matchId, $teamId);
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
        exit;
}

echo $response;

?>