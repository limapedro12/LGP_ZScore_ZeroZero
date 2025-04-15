<?php

header("Content-Type: application/json");

$debug = [
    'GET' => $_GET,
    'REQUEST_URI' => $_SERVER['REQUEST_URI'],
    'QUERY_STRING' => $_SERVER['QUERY_STRING'] ?? 'not set'
];

if (isset($_GET['number']) && is_numeric($_GET['number'])) {
    $number = (int)$_GET['number']; 
    $response = [
        "result" => $number + 1 
    ];
} else {
    $response = [
        "error" => "Invalid or missing 'number' parameter"
    ];
}

echo json_encode($response);
?>