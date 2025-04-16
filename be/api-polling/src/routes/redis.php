<?php
header('Content-Type: application/json');

try {
    // Conectar ao Redis
    $redis = new Redis();
    $redis->connect('redis', 6379);

    // Verificar ação
    $action = $_GET['action'] ?? null;
    $key = $_GET['key'] ?? null;
    $value = $_GET['value'] ?? null;

    switch ($action) {
        case 'set':
            if ($key && $value) {
                $redis->set($key, $value);
                echo json_encode(["message" => "Key set successfully", "key" => $key, "value" => $value]);
            } else {
                echo json_encode(["error" => "Missing key or value"]);
            }
            break;

        case 'get':
            if ($key) {
                $value = $redis->get($key);
                echo json_encode(["key" => $key, "value" => $value]);
            } else {
                echo json_encode(["error" => "Missing key"]);
            }
            break;

        case 'delete':
            if ($key) {
                $redis->del($key);
                echo json_encode(["message" => "Key deleted successfully", "key" => $key]);
            } else {
                echo json_encode(["error" => "Missing key"]);
            }
            break;

        default:
            echo json_encode(["error" => "Invalid or missing action"]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>