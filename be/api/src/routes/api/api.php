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

$allowedActions = ['login', 'getMatchesColab', 'getMatchLiveInfo', 'getTeamLive', 'getTeamPlayers', 'getPlayerInfo'];
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
if (is_null($cookie) && $action !== 'login' && $action !== 'getTeamPlayers' && $action !== 'getPlayerInfo') {
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

$players = [
            [
            'player_id' => '839058',
            'player_name' => 'Fábio Madeira',
            'player_number' => '14',
            'player_position' => 'Guarda-Redes',
            'player_position_sigla' => 'GR',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '553467',
            'player_name' => 'André Silva',
            'player_number' => '17',
            'player_position' => 'Guarda-Redes',
            'player_position_sigla' => 'GR',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '682487',
            'player_name' => 'Gonçalo Rufo',
            'player_number' => '12',
            'player_position' => 'Fixo / Ala',
            'player_position_sigla' => 'F/A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '835956',
            'player_name' => 'Silas',
            'player_number' => '5',
            'player_position' => 'Universal',
            'player_position_sigla' => 'U',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '930612',
            'player_name' => 'João Ricardo',
            'player_number' => '18',
            'player_position' => 'Universal',
            'player_position_sigla' => 'U',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '123456',
            'player_name' => 'Miguel Santos',
            'player_number' => '7',
            'player_position' => 'Ala',
            'player_position_sigla' => 'A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '789012',
            'player_name' => 'Rui Costa',
            'player_number' => '10',
            'player_position' => 'Pivot',
            'player_position_sigla' => 'P',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '345678',
            'player_name' => 'Pedro Lopes',
            'player_number' => '9',
            'player_position' => 'Ala',
            'player_position_sigla' => 'A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '901234',
            'player_name' => 'Tiago Ferreira',
            'player_number' => '11',
            'player_position' => 'Fixo',
            'player_position_sigla' => 'F',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '567890',
            'player_name' => 'Carlos Mendes',
            'player_number' => '8',
            'player_position' => 'Universal',
            'player_position_sigla' => 'U',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '112233',
            'player_name' => 'João Silva',
            'player_number' => '6',
            'player_position' => 'Ala',
            'player_position_sigla' => 'A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '445566',
            'player_name' => 'Ricardo Pereira',
            'player_number' => '15',
            'player_position' => 'Pivot',
            'player_position_sigla' => 'P',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '778899',
            'player_name' => 'Hugo Almeida',
            'player_number' => '13',
            'player_position' => 'Fixo',
            'player_position_sigla' => 'F',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '998877',
            'player_name' => 'Bruno Fernandes',
            'player_number' => '16',
            'player_position' => 'Ala',
            'player_position_sigla' => 'A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '665544',
            'player_name' => 'Diogo Costa',
            'player_number' => '19',
            'player_position' => 'Guarda-Redes',
            'player_position_sigla' => 'GR',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '223344',
            'player_name' => 'Nuno Gomes',
            'player_number' => '20',
            'player_position' => 'Universal',
            'player_position_sigla' => 'U',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '334455',
            'player_name' => 'Paulo Oliveira',
            'player_number' => '21',
            'player_position' => 'Fixo',
            'player_position_sigla' => 'F',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '556677',
            'player_name' => 'Vítor Hugo',
            'player_number' => '22',
            'player_position' => 'Ala',
            'player_position_sigla' => 'A',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '778800',
            'player_name' => 'Manuel Silva',
            'player_number' => '23',
            'player_position' => 'Pivot',
            'player_position_sigla' => 'P',
            'INTEAM' => '1',
            ],
            [
            'player_id' => '990011',
            'player_name' => 'António Costa',
            'player_number' => '24',
            'player_position' => 'Universal',
            'player_position_sigla' => 'U',
            'INTEAM' => '1',
            ],
        ];

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
    case 'getTeamPlayers':
        $response = json_encode($players);
        break;

    case 'getPlayerInfo':
        $id = $_GET['id'] ?? $jsonBody['id'] ?? null;
        if (is_null($id)) {
            echo json_encode(["error" => "Missing id"]);
            exit;
        }
        $player = null;
        foreach ($players as $p) {
            if ($p['player_id'] == $id) {
                $player = $p;
                break;
            }
        }
        if (is_null($player)) {
            echo json_encode(["error" => "Player not found"]);
            exit;
        }
        $response = json_encode($player);
        break;
    default:
        echo json_encode(["error" => "Invalid action"]);
        exit;
}

echo $response;

?>