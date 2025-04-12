<?php
session_start();

// Coloca isso antes de qualquer saída
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// $conn = new mysqli(...); // já configurado antes

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$abstractTeamId = $data['abstractTeamId'] ?? null;
$action = $_GET['action'] ?? null;

if (!$abstractTeamId || !$action) {
    echo json_encode(["success" => false, "message" => "Missing abstractTeamId or action"]);
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

$sql = "UPDATE AbstractTeam SET points = points + ? WHERE abstractTeamId = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $points, $abstractTeamId);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Score updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}

$conn->close();
