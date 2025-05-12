<?php
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
header('Content-Type: application/json');

$params = RequestUtils::getRequestParams();
$requestMethod = $_SERVER['REQUEST_METHOD'];

$requiredParams = ['action'];
$allowedActions = ['noTimer'];

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
    $reflection = new ReflectionClass($gameConfig);

    switch ($action) {
        case 'noTimer':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for this action."];
                break;
            }
            $sportsWithoutPeriodDuration = [];
            $configsProp = $reflection->getProperty('configs');
            $configsProp->setAccessible(true);
            $configs = $configsProp->getValue($gameConfig);

            foreach ($configs as $sport => $config) {
                if (!isset($config['periodDuration'])) {
                    $sportsWithoutPeriodDuration[] = $sport;
                }
            }
            $response = [
                "sports" => $sportsWithoutPeriodDuration
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