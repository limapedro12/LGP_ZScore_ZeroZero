<?php
    require_once __DIR__.'/apiUtils.php';
    require_once __DIR__.'/dbUtils.php';

    function insertMatchesColab($matchesColab)
    {
        session_start();
        $matchesColab = json_decode($matchesColab, true);
        if (empty($matchesColab) || !isset($matchesColab['data'])) {
            echo json_encode(["error" => "Invalid data: " . json_encode($matchesColab)]);
            return false; // Invalid data
        }
        $data = $matchesColab['data'];
        $placardIds = [];
        foreach ($data as $sport => $placards)
        {
            if (empty($sport)) {
                continue; // Skip empty sport
            }
            $sport = strtolower($sport);
            if (!in_array($sport, ['futsal', 'voleibol'])) {
                continue; // Skip invalid sport
            }
            foreach ($placards as $placard)
            {
                $placardId = $placard['jogo_id'];
                $placardIds[] = [$placardId => $sport];

                if (DbUtils::selectPlacard($placardId, $sport)) {
                    continue; // Match already exists, skip to next
                }

                $team1 = $placard['equipa_casa_id'];
                $team2 = $placard['equipa_fora_id'];
                $team1Desc = $placard['equipa_casa_descr'];
                $team2Desc = $placard['equipa_fora_descr'];
                $isFinished = $placard['estado'] == 'NÃ£o terminado' ?  0 : 1;
                $date = $placard['data_jogo'];

                if (!DbUtils::selectTeam($team1, $sport)) {
                    
                    $apiurl = getenv('API_URL');
                    $appkey = getenv('APP_KEY');
                    $cookie = $_SESSION['api_cookie'];

                    $matchLiveInfo = getMatchLiveInfo($apiurl, $appkey, $cookie, $placardId);
                    $matchLiveInfo = json_decode($matchLiveInfo, true);
                    $team1logo = $matchLiveInfo['data']['home_team_logo'];
                    if (!DbUtils::insertTeam($team1, $team1Desc, $sport, $team1logo)) {
                        echo json_encode(["error" => "Failed to insert team: $team1 - $placardId"]);
                        return false; // Insert failed
                    }
                    
                } 
                if (!DbUtils::selectTeam($team2, $sport)) {
                    if (!$matchLiveInfo) {
                        $apiurl = getenv('API_URL');
                        $appkey = getenv('APP_KEY');
                        $cookie = $_SESSION['api_cookie'];

                        $matchLiveInfo = getMatchLiveInfo($apiurl, $appkey, $cookie, $placardId);
                        $matchLiveInfo = json_decode($matchLiveInfo, true);
                    }
                    $team2logo = $matchLiveInfo['data']['away_team_logo'];
                    if (!DbUtils::insertTeam($team2, $team2Desc, $sport, $team2logo)) {
                        echo json_encode(["error" => "Failed to insert team: $team2 - $placardId"]);
                        return false; // Insert failed
                    }
                }
                if (!DbUtils::insertPlacard($placardId, $team1, $team2, $isFinished, $sport)) {
                    echo json_encode(["error" => "Failed to insert placard: $placardId"]);
                    return false; // Insert failed
                }
            }
        }
        return $placardIds; // Insert successful
    }

   

    function insertTeamLive($teamLive)
    {
        $sportIds = [
            '3' => 'futsal',
            '10' =>  'basquetebol',
            '11' => 'voleibol'
        ];

        $teamLive = json_decode($teamLive, true);
        $data = $teamLive['data'];
        $profile = $data['PROFILE'];
        $teamId = $profile['ID'];
        $sport = $sportIds[$profile['SPORTID']];
        $players = $data['PLAYERS'];
        foreach ($players as $player) {
            $playerId = $player['player_id'];
            if (DbUtils::selectPlayer($playerId, $sport)) {
                continue; // Player already exists, skip to next
            }
            $playerName = $player['player_name'];
            $playerPosition = $player['player_position'];
            $playerNumber = $player['player_number'];
            if (!DbUtils::insertPlayer($playerId, $playerName, $sport, $playerPosition, $playerNumber, $teamId)) {
                return false; // Insert failed
            }
        }
        return $sport; // Insert successful
    }
    
        
?>