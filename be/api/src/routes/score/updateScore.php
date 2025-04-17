<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database connection
$host = getenv("DB_HOST") ?: "mariadb";
$user = getenv("DB_USERNAME") ?: "user";
$password = getenv("DB_PASSWORD");
$dbname = getenv("DB_NAME") ?: "zscoredb";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

error_log("Connected to database: " . $dbname);

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$abstractTeamId = $data['abstractTeamId'] ?? null;
$placardId = $data['placardId'] ?? null;
$gameType = $data['gameType'] ?? null; // "futsal" or "volleyball"
$action = $_GET['action'] ?? null;

if (!$gameType) {
    echo json_encode(["success" => false, "message" => "error in gameType"]);
    exit;
}
if (!$abstractTeamId) {
    echo json_encode(["success" => false, "message" => "error in abstractTeamId"]);
    exit;
}
if ($action !== 'add' && $action !== 'remove') {
    echo json_encode(["success" => false, "message" => "error in action"]);
    exit;
}
if (!$placardId) {
    echo json_encode(["success" => false, "message" => "error in placardId"]);
    exit;
}

$delta = $action === 'add' ? 1 : -1;

if ($gameType === 'futsal') {
    $queryTeam = "SELECT ap.firstTeamId, ap.secondTeamId 
                  FROM FutsalPlacard fp
                  JOIN AbstractPlacard ap ON fp.abstractPlacardId = ap.id
                  WHERE fp.abstractPlacardId = ?";
    $stmt = $conn->prepare($queryTeam);
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Database error: " . $conn->error]);
        exit;
    }
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
    $querySet = "SELECT ap.firstTeamId, ap.secondTeamId, vp.currentSet 
                 FROM VolleyballPlacard vp
                 JOIN AbstractPlacard ap ON vp.abstractPlacardId = ap.id
                 WHERE vp.abstractPlacardId = ?";
    $stmt = $conn->prepare($querySet);
    $stmt->bind_param("i", $placardId);
    $stmt->execute();
    $result = $stmt->get_result();
    $placardData = $result->fetch_assoc();

    if (!$placardData) {
        echo json_encode(["success" => false, "message" => "Invalid placardId"]);
        exit;
    }

    $currentSet = $placardData['currentSet'];
    $currentSetQuery = "SELECT id FROM VolleyballSetResult WHERE placardId = ? AND setNumber = ?";
    $stmt = $conn->prepare($currentSetQuery);
    $stmt->bind_param("ii", $placardId, $currentSet);
    $stmt->execute();
    $result = $stmt->get_result();
    $set = $result->fetch_assoc();

    if (!$set) {
        echo json_encode(["success" => false, "message" => "No set found for the current set number"]);
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
