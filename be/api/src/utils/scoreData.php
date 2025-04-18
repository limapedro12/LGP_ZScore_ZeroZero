<?php

/**
 * Retrieves and updates score data for a specific game
 *
 * This function fetches and updates score values from Redis for futsal or volleyball games.
 * It ensures that scores do not go below zero and handles team-specific updates.
 *
 * @param Redis $redis Redis connection
 * @param string $placardId Game identifier
 * @param int $abstractTeamId Team identifier
 * @param string $gameType Type of game ("futsal" or "volleyball")
 * @param int $delta Change in score (+1 or -1)
 * @return array Updated score data or error message
 */
function updateScoreData($redis, $placardId, $abstractTeamId, $gameType, $delta) {
    try {
        $prefix = "game:$placardId:";
        $key = $gameType === 'futsal' ? $prefix . 'futsal' : $prefix . 'volleyball';

        // Inicializar dados se não existirem
        if (!$redis->exists($key)) {
            if ($gameType === 'futsal') {
                initializeFutsalData($redis, $placardId);
            } elseif ($gameType === 'volleyball') {
                initializeVolleyballData($redis, $placardId);
            }
        }

        // Fetch game data from Redis
        $gameData = $redis->hGetAll($key);
        $firstTeamId = $gameData['firstTeamId'];
        $secondTeamId = $gameData['secondTeamId'];

        if ($gameType === 'volleyball') {
            // Handle volleyball-specific logic
            $currentSet = (int)$gameData['currentSet'];
            $setKey = $prefix . "set:$currentSet";

            if (!$redis->exists($setKey)) {
                $redis->hMSet($setKey, [
                    "pointsFirstTeam" => 0,
                    "pointsSecondTeam" => 0
                ]);
            }

            $setData = $redis->hGetAll($setKey);
            $column = null;
            $currentPoints = null;

            if ((int)$abstractTeamId === (int)$firstTeamId) {
                $column = 'pointsFirstTeam';
                $currentPoints = (int)$setData[$column];
            } elseif ((int)$abstractTeamId === (int)$secondTeamId) {
                $column = 'pointsSecondTeam';
                $currentPoints = (int)$setData[$column];
            } else {
                throw new Exception("Team not part of this volleyball placard.");
            }

            // Prevent points from going negative
            if ($delta < 0 && $currentPoints <= 0) {
                throw new Exception("Points cannot go below zero.");
            }

            // Update the score in Redis
            $newPoints = $currentPoints + $delta;
            $redis->hSet($setKey, $column, $newPoints);

            return [
                'success' => true,
                'message' => "Score updated successfully",
                'team' => $abstractTeamId,
                'newPoints' => $newPoints,
                'setNumber' => $currentSet
            ];
        } else {
            // Handle futsal-specific logic
            $column = null;
            $currentPoints = null;

            if ((int)$abstractTeamId === (int)$firstTeamId) {
                $column = 'currentGoalsFirstTeam';
                $currentPoints = (int)$gameData[$column];
            } elseif ((int)$abstractTeamId === (int)$secondTeamId) {
                $column = 'currentGoalsSecondTeam';
                $currentPoints = (int)$gameData[$column];
            } else {
                throw new Exception("Team not part of this futsal placard.");
            }

            // Prevent points from going negative
            if ($delta < 0 && $currentPoints <= 0) {
                throw new Exception("Points cannot go below zero.");
            }

            // Update the score in Redis
            $newPoints = $currentPoints + $delta;
            $redis->hSet($key, $column, $newPoints);

            return [
                'success' => true,
                'message' => "Score updated successfully",
                'team' => $abstractTeamId,
                'newPoints' => $newPoints
            ];
        }
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => "An error occurred: " . $e->getMessage()
        ];
    }
}

function initializeFutsalData($redis, $placardId) {
    $key = "game:$placardId:futsal";
    $redis->hMSet($key, [
        "firstTeamId" => 1, // IDs fictícios para inicialização
        "secondTeamId" => 2,
        "currentGoalsFirstTeam" => 0,
        "currentGoalsSecondTeam" => 0
    ]);
}

function initializeVolleyballData($redis, $placardId) {
    $key = "game:$placardId:volleyball";
    $redis->hMSet($key, [
        "firstTeamId" => 1, // IDs fictícios para inicialização
        "secondTeamId" => 2,
        "currentSet" => 1
    ]);
    $setKey = "game:$placardId:set:1";
    $redis->hMSet($setKey, [
        "pointsFirstTeam" => 0,
        "pointsSecondTeam" => 0
    ]);
}