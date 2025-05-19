<?php
require_once __DIR__ . '/../../index.php';
require_once __DIR__ . '/../../utils/apiUtils.php';

header("Access-Control-Allow-Origin: http://localhost:3000"); // Must match request origin exactly
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Content-Length, Authorization, Accept, X-Requested-With");
header("Access-Control-Allow-Methods: PUT, POST, GET, DELETE, OPTIONS");

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
$jsonBody = null;
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $jsonBody = json_decode($input, true);
    }
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
        $response = login($username, $password);
        break;
    case 'getMatchesColab':
        $response = getMatchesColab();
        break;
    case 'getMatchLiveInfo':
        $response = getMatchLiveInfo($matchId);
        break;
    case 'getTeamLive':
        $response = getTeamLive($matchId,$teamId);
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
        exit;
}

echo $response;

?>