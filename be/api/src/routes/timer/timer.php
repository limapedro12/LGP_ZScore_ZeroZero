<?php
session_start();

if (!isset($_SESSION['timer'])) {
    $_SESSION['timer'] = [
        'start_time' => null,
        'elapsed_time' => 0,
        'is_paused' => true,
    ];
}

// Debug info
$debug = [
    'GET' => $_GET,
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? 'not set'
];

$action = $_GET['action'] ?? null;

switch ($action) {
    case 'test':
        echo json_encode([
            "message" => "Timer test successful",
            "debug" => $debug
        ]);
        break;
    default:
        echo json_encode([
            "error" => "Invalid or missing action",
            "action_received" => $action,
            "debug" => $debug
        ]);
        break;
}
?>