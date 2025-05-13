<?php
    Class DbUtils {
        public static function connect() {
            $host = getenv('DB_HOST');
            $user = 'user';
            $password = getenv('DB_PASSWORD');
            $db = getenv('DB_NAME');

            try {
                $conn = new mysqli($host, $user, $password, $db);
                if ($conn->connect_error) {
                    error_log("Connection failed: " . $conn->connect_error);
                    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
                    return false;
                }
                return $conn;
            } catch (Exception $e) {
                error_log("Connection error: " . $e->getMessage());
                echo json_encode(["error" => "Connection error: " . $e->getMessage()]);
                return false;
            }
        }

        public static function selectTeam($teamId, $sport)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractTeam WHERE id = ? AND sport = ?");
            $stmt->bind_param("is", $teamId, $sport); 
            $stmt->execute();
            $results = $stmt->get_result();
            
            $data = $results->fetch_assoc();

            $stmt->close();
            $conn->close();
            
            return $data;
        }

        public static function insertTeam($teamId, $teamDesc, $sport, $logoURL)
        {
            if ($sport !== 'futsal' && $sport !== 'voleibol') {
                return true; // Invalid sport
            }
            $conn = DbUtils::connect();
            if ($conn === false) {
                echo json_encode(["error" => "Failed to connect to the database"]);
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractTeam (id, name, logoURL, sport) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("isss", $teamId, $teamDesc, $logoURL, $sport);
            if ($stmt->execute()) {
                $stmt->close();
                switch ($sport) {
                    case 'futsal':
                        $table = 'FutsalTeam';
                        break;
                    case 'voleibol':
                        $table = 'VolleyballTeam';
                        break;
                }
                $stmt = $conn->prepare("INSERT INTO $table (id, abstractTeamId) VALUES (?, ?)");
                $stmt->bind_param("ii", $teamId, $teamId);
                if ($stmt->execute()) {
                    $stmt->close();
                } else {
                    $stmt->close();
                    $conn->close();
                    return false; // Insert failed
                }
                $conn->close();
                return true; // Insert successful
            } else {
                $stmt->close();
                $conn->close();
                return false; // Insert failed
            }
        }

        public static function insertPlacard($placardId, $team1, $team2, $isFinished,$sport)
        {
            if ($sport !== 'futsal' && $sport !== 'voleibol') {
                return true; // Invalid sport
            }

            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiis", $placardId, $team1, $team2, $isFinished,$sport);
            if ($stmt->execute()) {
                $stmt->close();
                $conn->close();
                return true; // Insert successful
            } else {
                $stmt->close();
                $conn->close();
                return false; // Insert failed
            }
        }

        public static function selectPlacard($placardId, $sport)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlacard WHERE id = ? AND sport = ?");
            $stmt->bind_param("is", $placardId, $sport); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_assoc();
            
            $stmt->close();
            $conn->close();

            return $results;

        }
        

        public static function selectPlayer($playerId, $sport)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlayer WHERE id = ? AND sport = ?");
            $stmt->bind_param("is", $playerId, $sport); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_assoc();
            
            $stmt->close();
            $conn->close();

            return $results;

        }

        public static function insertPlayer($playerId, $playerName, $sport, $playerPosition, $playerNumber, $teamId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractPlayer (id, name, sport, position, number, teamId) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("issssi", $playerId, $playerName, $sport, $playerPosition, $playerNumber, $teamId);
            if ($stmt->execute()) {
                $stmt->close();
                $conn->close();
                return true; // Insert successful
            } else {
                $stmt->close();
                $conn->close();
                return false; // Insert failed
            }
        }

        public static function selectTeamPlayers($teamId, $sport)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlayer WHERE teamId = ? AND sport = ?");
            $stmt->bind_param("is", $teamId, $sport); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_all(MYSQLI_ASSOC);
            
            $stmt->close();
            $conn->close();

            return $results;

        }
    }
          
?>