<?php
session_start();

// $conn = new mysqli(...); // já configurado antes

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$teamId = $data['teamId'] ?? null;
$action = $_GET['action'] ?? null;

if (!$teamId || !$action) {
    echo json_encode(["success" => false, "message" => "Missing teamId or action"]);
    exit;
}

$points = 0;
switch ($action) {
    case 'add':
        $points = 1;
        break;
    case 'remove':
        $points = -1;
        break;
    default:
        echo json_encode(["success" => false, "message" => "Invalid action"]);
        exit;
}

$sql = "UPDATE scores SET points = points + ? WHERE teamId = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $points, $teamId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Score updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}

$conn->close();
