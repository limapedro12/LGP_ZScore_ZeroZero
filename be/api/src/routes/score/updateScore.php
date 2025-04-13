<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Ligação à base de dados com variáveis de ambiente ou valores padrão
$host = getenv("DB_HOST") ?: "mariadb";
$user = getenv("DB_USERNAME") ?: "user";
$password = getenv("DB_PASSWORD") ?: "zscoreUserPassword";
$dbname = getenv("DB_NAME") ?: "zscoredb";

$conn = new mysqli($host, $user, $password, $dbname);

// Verifica ligação
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$abstractTeamId = $data['abstractTeamId'] ?? null;
$placardId = $data['placardId'] ?? null;
$gameType = $data['gameType'] ?? null; // "futsal" ou "volleyball"
$action = $_GET['action'] ?? null;

if (!$abstractTeamId || !$action || !$placardId || !$gameType) {
    echo json_encode(["success" => false, "message" => "Missing required parameters"]);
    exit;
}

$delta = $action === 'add' ? 1 : ($action === 'remove' ? -1 : 0);
if ($delta === 0) {
    echo json_encode(["success" => false, "message" => "Invalid action"]);
    exit;
}

$conn = getDBConnection(); // função da tua config para obter a conexão

if ($gameType === 'futsal') {
    $queryTeam = "SELECT firstTeamId, secondTeamId FROM FutsalPlacard WHERE placardId = ?";
    $stmt = $conn->prepare($queryTeam);
    $stmt->bind_param("i", $placardId);
    $stmt->execute();
    $result = $stmt->get_result();
    $teams = $result->fetch_assoc();

    if (!$teams) {
        echo json_encode(["success" => false, "message" => "Invalid placardId"]);
        exit;
    }

    $column = null;
    if ((int)$abstractTeamId === (int)$teams['firstTeamId']) {
        $column = 'currentGoalsFirstTeam';
    } elseif ((int)$abstractTeamId === (int)$teams['secondTeamId']) {
        $column = 'currentGoalsSecondTeam';
    } else {
        echo json_encode(["success" => false, "message" => "Team not part of this game"]);
        exit;
    }

    $sql = "UPDATE FutsalPlacard SET $column = $column + ? WHERE placardId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $delta, $placardId);
    $stmt->execute();

} elseif ($gameType === 'volleyball') {
    // Aqui assumes que há uma tabela VolleyballSetResult com:
    // - setId
    // - placardId
    // - is_current (bool)
    // - pointsFirstTeam / pointsSecondTeam

    $querySet = "SELECT setId, firstTeamId, secondTeamId FROM VolleyballPlacard WHERE placardId = ?";
    $stmt = $conn->prepare($querySet);
    $stmt->bind_param("i", $placardId);
    $stmt->execute();
    $result = $stmt->get_result();
    $placardData = $result->fetch_assoc();

    if (!$placardData) {
        echo json_encode(["success" => false, "message" => "Invalid placardId"]);
        exit;
    }

    $currentSetQuery = "SELECT id FROM VolleyballSetResult WHERE placardId = ? AND is_current = 1";
    $stmt = $conn->prepare($currentSetQuery);
    $stmt->bind_param("i", $placardId);
    $stmt->execute();
    $result = $stmt->get_result();
    $set = $result->fetch_assoc();

    if (!$set) {
        echo json_encode(["success" => false, "message" => "No current set found"]);
        exit;
    }

    $column = null;
    if ((int)$abstractTeamId === (int)$placardData['firstTeamId']) {
        $column = 'pointsFirstTeam';
    } elseif ((int)$abstractTeamId === (int)$placardData['secondTeamId']) {
        $column = 'pointsSecondTeam';
    } else {
        echo json_encode(["success" => false, "message" => "Team not part of this volleyball placard"]);
        exit;
    }

    $sql = "UPDATE VolleyballSetResult SET $column = $column + ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $delta, $set['id']);
    $stmt->execute();

} else {
    echo json_encode(["success" => false, "message" => "Unknown game type"]);
    exit;
}

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Score updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "No changes made"]);
}

$conn->close();
