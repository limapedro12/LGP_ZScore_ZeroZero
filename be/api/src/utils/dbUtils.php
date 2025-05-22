<?php
    Class DbUtils {
        public static function connect() {
            $host = getenv('DB_HOST');
            $user = getenv('DB_USER');
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

        public static function selectTeam($teamId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractTeam WHERE id = ?");
            $stmt->bind_param("i", $teamId); 
            $stmt->execute();
            $results = $stmt->get_result();
            
            $data = $results->fetch_assoc();

            $stmt->close();
            $conn->close();
            
            return $data;
        }

        public static function insertTeam($teamId, $teamDesc,$acronym, $sport, $color, $logoURL)
        {
            if ($sport !== 'futsal' && $sport !== 'volleyball' && $sport !== 'basketball') {
                return true; // Invalid sport
            }
            $conn = DbUtils::connect();
            if ($conn === false) {
                echo json_encode(["error" => "Failed to connect to the database"]);
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractTeam (id, name, acronym, logoURL, sport, color) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isssss", $teamId, $teamDesc, $acronym, $logoURL, $sport, $color);
            if ($stmt->execute()) {
                $stmt->close();
                /*switch ($sport) {
                    case 'futsal':
                        $table = 'FutsalTeam';
                        break;
                    case 'volleyball':
                        $table = 'VolleyballTeam';
                        break;
                    case 'basketball':
                        $table = 'BasketballTeam';
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
                }*/
                $conn->close();
                return true; // Insert successful
            } else {
                $stmt->close();
                $conn->close();
                return false; // Insert failed
            }
        }

        public static function insertPlacard($placardId, $team1, $team2, $isFinished, $sport, $date)
        {
            if ($sport !== 'futsal' && $sport !== 'volleyball' && $sport !== 'basketball') {
                return true; // Invalid sport
            }

            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractPlacard (id, firstTeamId, secondTeamId, isFinished, sport, startTime) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiiss", $placardId, $team1, $team2, $isFinished, $sport, $date);
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

        public static function selectPlacard($placardId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlacard WHERE id = ?");
            $stmt->bind_param("i", $placardId); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_assoc();
            
            $stmt->close();
            $conn->close();

            return $results;

        }

        public static function updatePlacard($placardId, $team1, $team2, $isFinished, $sport)
        {
            if ($sport !== 'futsal' && $sport !== 'volleyball' && $sport !== 'basketball') {
                return true; // Invalid sport
            }

            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("UPDATE AbstractPlacard SET firstTeamId = ?, secondTeamId = ?, isFinished = ? WHERE id = ? AND sport = ?");
            $stmt->bind_param("iiiss", $team1, $team2, $isFinished, $placardId, $sport);
            if ($stmt->execute()) {
                $stmt->close();
                $conn->close();
                return true; // Update successful
            } else {
                $stmt->close();
                $conn->close();
                return false; // Update failed
            }
        }
        

        public static function selectPlayer($playerId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlayer WHERE id = ?");
            $stmt->bind_param("i", $playerId); 
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

        public static function selectTeamPlayers($teamId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlayer WHERE teamId = ?");
            $stmt->bind_param("i", $teamId); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_all(MYSQLI_ASSOC);
            
            $stmt->close();
            $conn->close();

            return $results;

        }

        public static function insertPlacardPlayer($placardId, $playerId, $isCaptain, $isStarting)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO PlacardPlayer (placardId, playerId, isCaptain, isStarting) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("iiii", $placardId, $playerId, $isCaptain, $isStarting);
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

        public static function selectPlacardPlayer($placardId, $playerId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM PlacardPlayer WHERE placardId = ? AND playerId = ?");
            $stmt->bind_param("ii", $placardId, $playerId); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_assoc();
            
            $stmt->close();
            $conn->close();

            return $results;

        }

        public static function selectTeamLineup($placardId, $teamId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT PlacardPlayer.id as id, PlacardPlayer.playerId as playerId, PlacardPlayer.isStarting as isStarting, AbstractPlayer.name as name,AbstractPlayer.position as position,AbstractPlayer.number as number,AbstractPlayer.teamId as teamId FROM PlacardPlayer JOIN AbstractPlayer ON PlacardPlayer.playerId = AbstractPlayer.id WHERE PlacardPlayer.placardId = ? AND AbstractPlayer.teamId = ?");
            $stmt->bind_param("ii", $placardId, $teamId);
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            $conn->close();
            return $results;
        }
    }
          
?>