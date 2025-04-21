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
function updateScoreData($redis, $placardId, int $abstractTeamId, string $gameType, int $delta): array {
    $key = "game:$placardId:$gameType";

    if (!$redis->exists($key)) {
        return ['success' => false, 'message' => ucfirst($gameType) . " game data not found in Redis."];
    }

    $gameData = $redis->hGetAll($key);
    $firstTeamId = (int)$gameData['firstTeamId'];
    $secondTeamId = (int)$gameData['secondTeamId'];

    $column = null;
    if ($abstractTeamId === $firstTeamId) {
        $column = 'pointsFirstTeam';
    } elseif ($abstractTeamId === $secondTeamId) {
        $column = 'pointsSecondTeam';
    } else {
        return ['success' => false, 'message' => "Team not part of this game."];
    }

    $currentPoints = (int)$gameData[$column];
    if ($delta < 0 && $currentPoints <= 0) {
        return ['success' => false, 'message' => "Points cannot go below zero."];
    }

    $newPoints = $currentPoints + $delta;
    $redis->hSet($key, $column, $newPoints);

    return [
        'success' => true,
        'message' => "Score updated successfully.",
        'team' => $abstractTeamId,
        'newPoints' => $newPoints
    ];
}

function getScoreData($redis, $placardId, string $gameType): array {
    $key = "game:$placardId:$gameType";

    if (!$redis->exists($key)) {
        return ['success' => false, 'message' => ucfirst($gameType) . " game data not found in Redis."];
    }

    $gameData = $redis->hGetAll($key);

    return [
        'success' => true,
        'data' => [
            'pointsFirstTeam' => (int)$gameData['pointsFirstTeam'],
            'pointsSecondTeam' => (int)$gameData['pointsSecondTeam']
        ]
    ];
}

//Para inicializar os dados de um jogo de futsal ou volley no Redis

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