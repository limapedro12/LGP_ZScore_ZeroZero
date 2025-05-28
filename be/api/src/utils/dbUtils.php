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

        public static function selectPlayerByzerozeroId($zerozeroId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("SELECT * FROM AbstractPlayer WHERE zerozero_id = ?");
            $stmt->bind_param("i", $zerozeroId); 
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_assoc();
            
            $stmt->close();
            $conn->close();

            return $results;

        }

        public static function insertPlayer($zerozeroId, $playerName, $sport, $playerPosition, $positionAcronym, $playerNumber, $teamId)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO AbstractPlayer (zerozero_id, name, sport, position, position_acronym, number, teamId) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("issssssi", $zerozeroId, $playerName, $sport, $playerPosition,$position_acronym, $playerNumber, $teamId);
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

        public static function insertPlacardPlayer($placardId, $playerId, $isStarting)
        {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return false;
            }

            $stmt = $conn->prepare("INSERT INTO PlacardPlayer (placardId, playerId, isStarting) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $placardId, $playerId, $isStarting);
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

            $stmt = $conn->prepare("SELECT PlacardPlayer.id as id, PlacardPlayer.playerId as playerId, PlacardPlayer.isStarting as isStarting, AbstractPlayer.name as name, AbstractPlayer.position as position, AbstractPlayer.position_acronym as position_acronym, AbstractPlayer.number as number,AbstractPlayer.teamId as teamId FROM PlacardPlayer JOIN AbstractPlayer ON PlacardPlayer.playerId = AbstractPlayer.id WHERE PlacardPlayer.placardId = ? AND AbstractPlayer.teamId = ?");
            $stmt->bind_param("ii", $placardId, $teamId);
            $stmt->execute();
            $result = $stmt->get_result();
            $results = $result->fetch_all(MYSQLI_ASSOC);
            $stmt->close();
            $conn->close();
            return $results;
        }

        public static function submitTeamRoster($placardId, $players) {
            $conn = DbUtils::connect();
            if ($conn === false) {
                return ["error" => "Failed to connect to the database"];
            }

            $conn->begin_transaction();
            try {

                $stmt = $conn->prepare("SELECT playerId FROM PlacardPlayer WHERE placardId = ?");
                $stmt->bind_param("i", $placardId);
                $stmt->execute();
                $result = $stmt->get_result();
                $currentPlayerIds = [];
                while ($row = $result->fetch_assoc()) {
                    $currentPlayerIds[] = (int)$row['playerId'];
                }
                $stmt->close();

                // 2. Get new player IDs from $players
                $newPlayerIds = [];
                foreach ($players as $player) {
                    $newPlayerIds[] = isset($player['playerId']) ? (int)$player['playerId'] : (int)$player['id'];
                }

                $toRemove = array_diff($currentPlayerIds, $newPlayerIds);

                if (count($toRemove) > 0) {
                    $placeholders = implode(',', array_fill(0, count($toRemove), '?'));
                    $types = str_repeat('i', count($toRemove) + 1);
                    $params = array_merge([$placardId], array_values($toRemove));
                    $stmt = $conn->prepare("DELETE FROM PlacardPlayer WHERE placardId = ? AND playerId IN ($placeholders)");
                    $stmt->bind_param($types, ...$params);
                    if (!$stmt->execute()) {
                        $conn->rollback();
                        $stmt->close();
                        $conn->close();
                        return ["error" => "Failed to remove players from lineup"];
                    }
                    $stmt->close();
                }
                
                foreach ($players as $player) {
                    $name = trim($player['name'] ?? '');
                    if (!preg_match('/^[a-zA-ZÀ-ÿ\s\'\-0-9]{1,50}$/u', $name)) {
                        $conn->rollback();
                        $conn->close();
                        return ["error" => "Invalid player name"];
                    }
                    $position = trim($player['position'] ?? '');
                    if (!preg_match('/^[a-zA-ZÀ-ÿ\s\'\-]{1,30}$/u', $position)) {
                        $conn->rollback();
                        $conn->close();
                        return ["error" => "Invalid player position"];
                    }
                    $position_acronym = trim($player['position_acronym'] ?? '');
                    if (!preg_match('/^[A-Z0-9]{1,3}$/', $position_acronym)) {
                        $conn->rollback();
                        $conn->close();
                        return ["error" => "Invalid position acronym"];
                    }
                    $number = $player['number'] ?? '';
                    if (!is_numeric($number) || intval($number) < 0 || intval($number) > 99) {
                        $conn->rollback();
                        $conn->close();
                        return ["error" => "Player number must be between 0 and 99"];
                    }
                    $number = intval($number);
                    $teamId = $player['teamId'] ?? '';
                    if (!is_numeric($teamId)) {
                        $conn->rollback();
                        $conn->close();
                        return ["error" => "Invalid team ID"];
                    }
                    $teamId = intval($teamId);


                    if (isset($player['newPlayer']) && $player['newPlayer']) {
                        $stmt = $conn->prepare("INSERT INTO AbstractPlayer (name, position, position_acronym, number, teamId, sport) VALUES (?, ?, ?, ?, ?, (SELECT sport FROM AbstractTeam WHERE id = ?))");
                        $stmt->bind_param("ssssii", $name, $position, $position_acronym, $number, $teamId, $teamId);
                        
                        if (!$stmt->execute()) {
                            $conn->rollback();
                            $stmt->close();
                            $conn->close();
                            return false;
                        }
                        
                        $playerId = $conn->insert_id;
                        $stmt->close();
                    } else {
                        $playerId = $player['playerId'] ?? $player['id'];
                        if (!is_numeric($playerId)) {
                            $conn->rollback();
                            $conn->close();
                            return false;
                        }
                        $playerId = intval($playerId);
                    }
                    
                    $stmt = $conn->prepare("SELECT id FROM PlacardPlayer WHERE placardId = ? AND playerId = ?");
                    $stmt->bind_param("ii", $placardId, $playerId);
                    $stmt->execute();
                    $result = $stmt->get_result();
                    $existingRecord = $result->fetch_assoc();
                    $stmt->close();
                    
                    $isStarting = isset($player['isStarting']) ? $player['isStarting'] : 0;
                    if ($isStarting === 'true' || $isStarting === '1' || $isStarting === true) {
                        $isStarting = 1;
                    } else {
                        $isStarting = 0;
                    }
                    
                    if ($existingRecord) {
                        $stmt = $conn->prepare("UPDATE PlacardPlayer SET isStarting = ? WHERE placardId = ? AND playerId = ?");
                        $stmt->bind_param("iii", $isStarting, $placardId, $playerId);
                    } else {
                        $stmt = $conn->prepare("INSERT INTO PlacardPlayer (placardId, playerId, isStarting) VALUES (?, ?, ?)");
                        $stmt->bind_param("iii", $placardId, $playerId, $isStarting);
                    }
                    
                    if (!$stmt->execute()) {
                        $conn->rollback();
                        $stmt->close();
                        $conn->close();
                        return false;
                    }
                    
                    $stmt->close();
                }
                
                $conn->commit();
                $conn->close();
                return true;
            } catch (Exception $e) {
                $conn->rollback();
                $conn->close();
                return ["error" => "Exception: " . $e->getMessage()];
            }
        }
    }


?>