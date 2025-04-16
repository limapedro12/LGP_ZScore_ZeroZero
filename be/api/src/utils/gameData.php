<?php

/**
 * Retrieves the players and their status of a team for a specific game
 * 
 * This function fetches the players from Redis and checks if they are in the game.
 * 
 * @param Redis $redis Redis connection
 * @param string $placardId Game identifier
 * @param int $teamNumber Team number (1 or 2)
 * @return array Players and their status [(player : AbstractPlayer) => (ingame : bool)]
 */
function getIngamePlayers($redis, $placardId, $teamNumber) {
    try {
        $prefix = "game:$placardId:team$teamNumber:";
        $ingamePlayers = json_decode($redis->get($prefix . 'initial_lineup'));
        
        //get substitutions and calculate current players
        if ($ingamePlayers === null) {
            return [
                'error' => "No players found for team $teamNumber in game $placardId"
            ];
        }

        $substitutionKeys = $redis->sMembers($prefix . "substitution_set");
        $substitutions = array_map(fn($key) => $redis->hGetAll($key), $substitutionKeys);
        foreach ($substitutions as $substitution ){
                $ingamePlayers[$substitution['playerInId']] = true;
                $ingamePlayers[$substitution['playerOutId']] = false;
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
