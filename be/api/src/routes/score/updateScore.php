<?php
require_once __DIR__ . '/../../utils/connRedis.php';
require_once __DIR__ . '/../../utils/scoreData.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$abstractTeamId = $data['abstractTeamId'] ?? null;
$placardId = $data['placardId'] ?? null;
$gameType = $data['gameType'] ?? null; // "futsal" or "volleyball"
$action = $_GET['action'] ?? null;

if (!$gameType) {
    echo json_encode(["success" => false, "message" => "error in gameType"]);
    exit;
}
if (!$abstractTeamId) {
    echo json_encode(["success" => false, "message" => "error in abstractTeamId"]);
    exit;
}
if ($action !== 'add' && $action !== 'remove') {
    echo json_encode(["success" => false, "message" => "error in action"]);
    exit;
}
if (!$placardId) {
    echo json_encode(["success" => false, "message" => "error in placardId"]);
    exit;
}

$delta = $action === 'add' ? 1 : -1;

try {
    $redis = connectRedis();
    if (!$redis) {
        throw new Exception("Failed to connect to Redis");
    }

    $result = updateScoreData($redis, $placardId, $abstractTeamId, $gameType, $delta);

    if ($result['success']) {
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "message" => $result['message']]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "An error occurred: " . $e->getMessage()]);
}
