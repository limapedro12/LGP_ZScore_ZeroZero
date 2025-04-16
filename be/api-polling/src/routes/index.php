<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

try {
    $redis = new Redis();
    $redis->connect('redis', 6379);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $key = $data['key'] ?? 'default';
        $value = $data['value'] ?? 'empty';
        
        $redis->set($key, $value);
        echo json_encode(['status' => 'success', 'message' => 'Value stored']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $key = $_GET['key'] ?? 'default';
        $value = $redis->get($key);
        echo json_encode(['status' => 'success', 'value' => $value]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit;
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);