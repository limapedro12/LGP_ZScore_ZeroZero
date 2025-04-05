<?php
session_start(); // Start the session

// Read credentials from environment variables (or use defaults if not set)
// $host = getenv("DB_HOST") ?: "localhost";
// $user = getenv("DB_USERNAME") ?: "root";
// $password = getenv("DB_PASSWORD") ?: "";
// $dbname = getenv("DB_NAME") ?: "placard";

// $conn = new mysqli($host, $user, $password, $dbname);

$json = file_get_contents('php://input');

// Decodifica o JSON para um array ou objeto
$data = json_decode($json, true); // true = array, false = objeto

// Agora você pode acessar os dados:
$team= $data['teamId'] ?? 'Desconhecido';
$points = $data['points'] ?? 'Não informado';

echo "team: $team, point: $points ";

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

$action = $_GET['action'] ?? null;

if (!isset($data["teamId"]) || !isset($data["points"])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$teamId = (int)$data["teamId"];
$points = (int)$data["points"];

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
?>
