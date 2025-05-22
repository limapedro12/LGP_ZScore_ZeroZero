<?php
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();
$requestMethod = $_SERVER['REQUEST_METHOD'];

$requiredParams = ['action'];
$allowedActions = ['noTimer', 'noPeriodBox', 'noCards', 'typeOfScore', 'noShotClock', 'sportConfig'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$action = $params['action'] ?? null;

if($action === null){
    http_response_code(400);
    echo json_encode(["error" => "Missing action"]);
    exit;
}

$response = [];

try {
    $gameConfig = new GameConfig();
    
    switch ($action) {
        case 'noTimer':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sportsWithoutPeriodDuration = [];
            $configs = $gameConfig->getAllConfigs();

            foreach ($configs as $sport => $config) {
                if (!isset($config['periodDuration'])) {
                    $sportsWithoutPeriodDuration[] = $sport;
                }
            }
            $response = [
                "sports" => $sportsWithoutPeriodDuration
            ];
            break;
        case 'noPeriodBox':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sportsWithoutPeriodEndScore = [];
            $configs = $gameConfig->getAllConfigs();

            foreach ($configs as $sport => $config) {
                if (!isset($config['periodEndScore'])) {
                    $sportsWithoutPeriodEndScore[] = $sport;
                }
            }
            $response = [
                "sports" => $sportsWithoutPeriodEndScore
            ];
            break;
        case 'noCards':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sportsWithoutCards = [];
            $configs = $gameConfig->getAllConfigs();

            foreach ($configs as $sport => $config) {
                if (!isset($config['cards'])) {
                    $sportsWithoutCards[] = $sport;
                }
            }
            $response = [
                "sports" => $sportsWithoutCards
            ];
            break;
        case 'noShotClock':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sportsWithoutShotClock = [];
            $configs = $gameConfig->getAllConfigs();

            foreach ($configs as $sport => $config) {
                if (!isset($config['shotClock'])) {
                    $sportsWithoutShotClock[] = $sport;
                }
            }
            $response = [
                "sports" => $sportsWithoutShotClock
            ];
            break;
        case 'typeOfScore':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sport = $params['sport'] ?? null;
            if ($sport === null) {
                http_response_code(400);
                $response = ["error" => "Missing sport parameter"];
                break;
            }

            $sport = strtolower($sport);
            $configs = $gameConfig->getAllConfigs();
            
            if (!isset($configs[$sport])) {
                http_response_code(400);
                $response = ["error" => "Unknown sport: $sport"];
                break;
            }
            $config = $configs[$sport];
            if (!isset($config['typeOfScore'])) {
                http_response_code(400);
                $response = ["error" => "No type of score found for sport: $sport"];
                break;
            }
            $typeOfScore = $config['typeOfScore'];
            $response = [
                "sport" => $sport,
                "typeOfScore" => $typeOfScore
            ];
            break;
        case 'sportConfig':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sport = $params['sport'] ?? null;
            if ($sport === null) {
                http_response_code(400);
                $response = ["error" => "Missing sport parameter"];
                break;
            }

            $sport = strtolower($sport);
            $configs = $gameConfig->getAllConfigs();
            
            if (!isset($configs[$sport])) {
                http_response_code(400);
                $response = ["error" => "Unknown sport: $sport"];
                break;
            }
            $config = $configs[$sport];
            $response = [
                "sport" => $sport,
                "config" => $config
            ];
            break;

        default:
            http_response_code(400);
            $response = ["error" => "Invalid or missing action"];
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>