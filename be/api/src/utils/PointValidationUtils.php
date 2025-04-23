<?php

require_once __DIR__ . '/../config/gameConfig.php';
require_once __DIR__ . '/requestUtils.php';

class PointValidationUtils {

    /**
     * Retrieves all point events for a specific game from Redis.
     *
     * @param Redis $redis Redis connection instance.
     * @param string $placardId The ID of the game/placard.
     * @return array List of point events, or empty array if none/error.
     */
    public static function getGamePoints($redis, $placardId): array {
        try {
            $keys = RequestUtils::getRedisKeys($placardId, 'points');
            if (!$keys) return [];

            $gamePointsKey = $keys['game_points'];
            $pointEventKeys = $redis->zRange($gamePointsKey, 0, -1);

            if (empty($pointEventKeys)) {
                return [];
            }

            $pipe = $redis->pipeline();
            foreach ($pointEventKeys as $key) {
                $pipe->hGetAll($key);
            }
            $pointHashes = $pipe->exec();

            $points = [];
            foreach ($pointHashes as $hash) {
                if ($hash) {
                    if (isset($hash['timestamp'])) $hash['timestamp'] = (int)$hash['timestamp'];
                    if (isset($hash['eventId'])) $hash['eventId'] = (int)$hash['eventId'];
                    if (isset($hash['teamId'])) $hash['teamId'] = (int)$hash['teamId']; // Ensure teamId is int for comparison
                    $points[] = $hash;
                }
            }
            return $points;
        } catch (Exception $e) {
            error_log("Error fetching game points: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Validates if a point can be added or removed based on game rules.
     *
     * @param Redis $redis Redis connection instance.
     * @param string $placardId The ID of the game/placard.
     * @param string $sport The sport type ('futsal', 'volleyball', etc.).
     * @param int $teamId The ID of the team.
     * @param string $action The action to perform ('add' or 'remove').
     * @return bool True if the action is valid, false otherwise.
     */
    public static function canModifyPoints($redis, $placardId, $sport, $teamId, $action): bool {
        $allPoints = self::getGamePoints($redis, $placardId);
        $teamPoints = array_filter($allPoints, function($point) use ($teamId) {
            return isset($point['teamId']) && $point['teamId'] === $teamId;
        });

        $sportLower = strtolower($sport);

        switch ($sportLower) {
            case 'futsal':
                // Example: Limit points to 10 for futsal
                $currentPoints = count($teamPoints);
                if ($action === 'add' && $currentPoints >= 10) {
                    return false;
                }
                if ($action === 'remove' && $currentPoints <= 0) {
                    return false;
                }
                return true;

            case 'volleyball':
                // Example: No specific limit for volleyball
                return true;

            default:
                // Default behavior: Allow all actions
                return true;
        }
    }
}
?>