<?php

require_once __DIR__ . '/requestUtils.php'; 

/**
 * Retrieves the players and their status of a team for a specific game
 * 
 * This function fetches the players from Redis and checks if they are in the game.
 * 
 * @param Redis $redis Redis connection
 * @param string $placardId Game identifier
 * @param int $team Team number (1 or 2)
 * @param GameConfig $gameConfig Game configuration parameters
 * @return array Players and their status [(player : AbstractPlayer) => (ingame : bool)]
 */
function getIngamePlayers($redis, $placardId, $sport, $team) {
    try {
        $initialLineupKey = 'game:$placardId:team:$team:initial_lineup';
        $keys = RequestUtils::getRedisKeys($placardId, 'substitutions');
        $substitutionSetKey = $keys['substitutions'];
        $ingamePlayers = json_decode($redis->get($initialLineupKey),true );

        // if ($ingamePlayers === null) { //correct, but need a stub for testing
        //     return [
        //         'error' => "No players found for team $team in game $placardId"
        //     ];
        // }
        if (empty($ingamePlayers)) {
            switch ($sport){
                case 'volleyball':
                    $ingamePlayers = [
                        '1' => true,
                        '2' => true,
                        '3' => true,
                        '4' => true,
                        '5' => true,
                        '6' => true,
                        '7' => false,
                        '8' => false,
                        '9' => false,
                        '10' => false,
                        '11' => false,
                        '12' => false
                    ];
                    $redis->set($initialLineupKey, json_encode($ingamePlayers));
                    break;

                case 'basketball':
                    $ingamePlayers = [
                        '1' => true,
                        '2' => true,
                        '3' => true,
                        '4' => true,
                        '5' => true,
                        '6' => false,
                        '7' => false,
                        '8' => false,
                        '9' => false,
                        '10' => false,
                        '11' => false,
                        '12' => false
                    ];
                    $redis->set($initialLineupKey, json_encode($ingamePlayers));
                    break;
                case 'futsal':
                    $ingamePlayers = [
                        '1' => true,
                        '2' => true,
                        '3' => true,
                        '4' => true,
                        '5' => true,
                        '6' => false,
                        '7' => false,
                        '8' => false,
                        '9' => false,
                        '10' => false,
                        '11' => false,
                        '12' => false,
                        '13' => false,
                        '14' => false
                    ];
                    $redis->set($initialLineupKey, json_encode($ingamePlayers));
                    break;
            }
        }
        
        //get substitutions and calculate current players
        $substitutionKeys = $redis->zRange($substitutionSetKey, 0, -1);
        $substitutions = array_map(fn($key) => $redis->hGetAll($key), $substitutionKeys);
        // var_dump("gameData",$substitutionKeys, $substitutions);
        foreach ($substitutions as $substitution){
            if (!empty($substitution) && $substitution['team'] === $team) {
                $ingamePlayers[$substitution['playerInId']] = true;
                $ingamePlayers[$substitution['playerOutId']] = false;
            }
        }
        return [
            "players" => $ingamePlayers
        ];
    } catch (Exception $e) {
        return [
            'error' => "Failed to get team players: " . $e->getMessage()
        ];
    }
}
