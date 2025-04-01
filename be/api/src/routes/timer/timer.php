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
    case 'start':
        if ($_SESSION['timer']['is_paused']) {
            if ($_SESSION['timer']['start_time'] === null) {
                $_SESSION['timer']['start_time'] = time();
            } else {
                $_SESSION['timer']['start_time'] = time() - $_SESSION['timer']['elapsed_time'];
            }
            $_SESSION['timer']['is_paused'] = false;
        }
        echo json_encode([
            "message" => "Timer started",
            "timer" => $_SESSION['timer']
        ]);
        break;
    case 'pause':
        if (!$_SESSION['timer']['is_paused'] && $_SESSION['timer']['start_time'] !== null) {
            $_SESSION['timer']['elapsed_time'] = time() - $_SESSION['timer']['start_time'];
            $_SESSION['timer']['is_paused'] = true;
        }
        echo json_encode([
            "message" => "Timer paused",
            "timer" => $_SESSION['timer']
        ]);
        break;
    case 'status':
        if (!$_SESSION['timer']['is_paused'] && $_SESSION['timer']['start_time'] !== null) {
            $_SESSION['timer']['elapsed_time'] = time() - $_SESSION['timer']['start_time'];
        }
        echo json_encode([
            "timer" => $_SESSION['timer']
        ]);
        break;
    case 'reset':
        $_SESSION['timer'] = [
            'start_time' => null,
            'elapsed_time' => 0,
            'is_paused' => true,
        ];
        echo json_encode([
            "message" => "Timer reset",
            "timer" => $_SESSION['timer']
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