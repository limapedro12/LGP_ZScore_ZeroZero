<?php
// Read credentials from environment variables (or use defaults if not set)
$host = getenv("DB_HOST") ?: "localhost";
$user = getenv("DB_USERNAME") ?: "root";
$password = getenv("DB_PASSWORD") ?: "";
$dbname = getenv("DB_NAME") ?: "placard";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["team_id"]) || !isset($data["points"])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$team_id = (int)$data["team_id"];
$points = (int)$data["points"];

$sql = "UPDATE scores SET points = points + ? WHERE team_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $points, $team_id);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Score updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}

$conn->close();
?>
