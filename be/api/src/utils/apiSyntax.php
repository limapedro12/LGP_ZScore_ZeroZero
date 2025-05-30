<?php
    require_once __DIR__.'/apiUtils.php';
    require_once __DIR__.'/dbUtils.php';

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }

    function insertMatchesColab()
    {
        $matchesColab = getMatchesColab();
        if ($matchesColab === false) {
            //echo json_encode(["error" => "Failed to fetch matches from Colab"]);
            return false; // Error fetching matches
        }
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
            if (!in_array($sport, ['futsal', 'voleibol', 'basquetebol'])) {
                continue; // Skip invalid sport
            }
            $map = [
                'futsal' => 'futsal',
                'voleibol' => 'volleyball',
                'basquetebol' => 'basketball'
            ];
            $sport = $map[$sport];
            foreach ($placards as $placard)
            {
                $placardId = $placard['jogo_id'];
                $team1 = $placard['equipa_casa_id'];
                $team2 = $placard['equipa_fora_id'];
                $placardIds[] = [$placardId => $sport];
                $queryResult = DbUtils::selectPlacard($placardId);
                if ($queryResult) {
                    $firstTeam = $queryResult['firstTeamId'];
                    $secondTeam = $queryResult['secondTeamId'];
                    if ($firstTeam == $team1 && $secondTeam == $team2) {
                        continue; // Placard already exists, skip to next
                    }
                    $updateFlag = true;   
                }

                $team1Desc = $placard['equipa_casa_descr'];
                $team2Desc = $placard['equipa_fora_descr'];
                $isFinished = $placard['estado'] == 'NÃ£o terminado' ?  0 : 1;
                $date = $placard['data_jogo'];
                $stadium = $placard['estadio_descr'];
                $competition = $placard['edicao_descr'];

                if (!DbUtils::selectTeam($team1, $sport)) {
                    $matchLiveInfo = getMatchLiveInfo($placardId);
                    $matchLiveInfo = json_decode($matchLiveInfo, true);
                    $team1logo = $matchLiveInfo['data']['home_team_logo'];
                    if ($team1 == '999999')
                    {
                        $team1Desc = 'To Be Determined';
                        $color = '#000000';
                        $acronym = 'TBD';
                        if (!DbUtils::insertTeam($team1, $team1Desc,$acronym, $sport, $color, $team1logo)) {
                            echo json_encode(["error" => "Failed to insert team"]);
                            return false; // Insert failed
                        }
                    }else{
                        $teamLiveInfo = getTeamLive($placardId,$team1);
                        $teamLiveInfo = json_decode($teamLiveInfo, true);
                        $color = $teamLiveInfo['data']['PROFILE']['NORMALCOLOR'];
                        $acronym = $teamLiveInfo['data']['PROFILE']['ACRONYM'];

                        if (!DbUtils::insertTeam($team1, $team1Desc,$acronym, $sport, $color, $team1logo)) {
                            echo json_encode(["error" => "Failed to insert home team"]);
                            return false; // Insert failed
                        }
                    }                 
                }
                if (!DbUtils::selectTeam($team2, $sport)) {
                    if (!$matchLiveInfo) {

                        $matchLiveInfo = getMatchLiveInfo($placardId);
                        $matchLiveInfo = json_decode($matchLiveInfo, true);
                    }
                    $team2logo = $matchLiveInfo['data']['away_team_logo'];
                    if ($team2 == '999999')
                    {
                        $team2Desc = 'To Be Determined';
                        $color = '#000000';
                        $acronym = 'TBD';
                        if (!DbUtils::insertTeam($team2, $team2Desc,$acronym, $sport, $color, $team2logo)) {
                            echo json_encode(["error" => "Failed to insert team"]);
                            return false; // Insert failed
                        }
                    }else{
                        $teamLiveInfo = getTeamLive($placardId,$team2);
                        $teamLiveInfo = json_decode($teamLiveInfo, true);
                        $color = $teamLiveInfo['data']['PROFILE']['NORMALCOLOR'];
                        $acronym = $teamLiveInfo['data']['PROFILE']['ACRONYM'] ?? 'nothing';
                        
                        if (!DbUtils::insertTeam($team2, $team2Desc,$acronym, $sport, $color, $team2logo)) {
                            echo json_encode(["error" => "Failed to insert away team"]);
                            return false; // Insert failed
                        }
                    }
                }
                if (isset($updateFlag) && $updateFlag) {
                    if (!DbUtils::updatePlacard($placardId, $team1, $team2, $isFinished, $sport)) {
                        echo json_encode(["error" => "Failed to update placard: $placardId"]);
                        return false; // Update failed
                    }
                    continue; // Skip to next placard
                }
                if (!DbUtils::insertPlacard($placardId, $team1, $team2, $isFinished, $sport, $date, $stadium, $competition)) {
                    echo json_encode(["error" => "Failed to insert placard: $placardId"]);
                    return false; // Insert failed
                }
                
            }
        }
        return $placardIds; // Insert successful
    }

   

    function insertTeamLive($placardId, $teamId)
    {
        $teamLive = getTeamLive($placardId,$teamId);
        $sportIds = [
            '3' => 'futsal',
            '10' =>  'basketball',
            '11' => 'voleyball'
        ];
        $teamLive = json_decode($teamLive, true);
        $data = $teamLive['data'];
        $profile = $data['PROFILE'];
        $teamId = $profile['ID'];
        $sport = $sportIds[$profile['SPORTID']];
        $players = $data['PLAYERS'];
        foreach ($players as $player) {
            $playerId = $player['player_id'];
            if (DbUtils::selectPlayerByzerozeroId($playerId)) {
                continue; // Player already exists, skip to next
            }
            $playerName = $player['player_name'];
            $playerPosition = $player['player_position'];
            $positionAcronym = $player['player_position_sigla'];
            $playerNumber = $player['player_number'];
            if (!DbUtils::insertPlayer($playerId, $playerName, $sport, $playerPosition, $positionAcronym, $playerNumber, $teamId)) {
                return false; // Insert failed
            }
        }
        return $sport; // Insert successful
    }
    
    function insertLineup($placardId)
    {
        $matchLiveInfo = getMatchLiveInfo($placardId);
        $matchLiveInfo = json_decode($matchLiveInfo, true);
        $data = $matchLiveInfo['data'];
        $homeTeamId = $data['id_home_team'];
        $awayTeamId = $data['id_away_team'];
        $homeStarting = $data['home_starting_eleven'] ?? [];
        $awayStarting = $data['away_starting_eleven'] ?? [];
        $homeBench = $data['home_bench'] ?? [];
        $awayBench = $data['away_bench'] ?? [];

        foreach($homeStarting as $player) {
            $playerId = $player['id'];
            if (DbUtils::selectPlacardPlayer($placardId, $playerId)){
                continue; // Player already exists, skip to next
            }
            if (!DbUtils::insertPlacardPlayer($placardId, $playerId, false, true)){
                echo json_encode(["error" => "Failed to insert home team starting player"]);
                return false; // Insert failed
            }
        }

        foreach($homeBench as $player) {
            $playerId = $player['id'];
            if (DbUtils::selectPlacardPlayer($placardId, $playerId)){
                continue; // Player already exists, skip to next
            }
            if (!DbUtils::insertPlacardPlayer($placardId, $playerId, false, false)){
                echo json_encode(["error" => "Failed to insert home team bench player"]);
                return false; // Insert failed
            }
        }

        foreach($awayStarting as $player) {
            $playerId = $player['id'];
            if (DbUtils::selectPlacardPlayer($placardId, $playerId)){
                continue; // Player already exists, skip to next
            }
            if (!DbUtils::insertPlacardPlayer($placardId, $playerId, true)){
                echo json_encode(["error" => "Failed to insert away team starting player"]);
                return false; // Insert failed
            }
        }
        foreach($awayBench as $player) {
            $playerId = $player['id'];
            if (DbUtils::selectPlacardPlayer($placardId, $playerId)){
                continue; // Player already exists, skip to next
            }
            if (!DbUtils::insertPlacardPlayer($placardId, $playerId, false)){
                echo json_encode(["error" => "Failed to insert away team bench player"]);
                return false; // Insert failed
            }
        }
    }
        
?>