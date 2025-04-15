<?php


class TimerUtils {
    /**
     * Extract and validate request parameters
     * 
     * @return array Extracted parameters
     */
    public static function getRequestParams() {
        $jsonBody = null;
        if($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents('php://input');
            if ($input) {
                $jsonBody = json_decode($input, true);
            }
        }
        
        return [
            'placardId' => $_GET['gameId'] ?? $jsonBody['gameId'] ?? null,
            'gameType' => $_GET['gameType'] ?? $jsonBody['gameType'] ?? null,
            'action' => $_GET['action'] ?? $jsonBody['action'] ?? null,
            'team' => $_GET['team'] ?? $jsonBody['team'] ?? null,
            'seconds' => isset($jsonBody['seconds']) ? intval($jsonBody['seconds']) : 0,
            'time' => isset($jsonBody['time']) ? intval($jsonBody['time']) : 0
        ];
    }
    
    /**
     * Validate required parameters and allowed actions
     * 
     * @param array $params Parameters to validate
     * @param array $requiredParams List of required parameters
     * @param array $allowedActions List of allowed actions
     * @return array|null Error message or null if validation passes
     */
    public static function validateParams($params, $requiredParams, $allowedActions) {
        // Validate required parameters
        foreach ($requiredParams as $param) {
            if (is_null($params[$param])) {
                return ["error" => "Missing $param"];
            }
        }
        
        // Validate allowed actions
        if (!in_array($params['action'], $allowedActions)) {
            return ["error" => "Invalid action"];
        }
    
        // Validate game type if needed
        if (isset($params['gameType'])) {
            try {
                // Try to get config for this game type - will throw exception if invalid
                $gameConfigManager = new GameConfig();
                $gameConfigManager->getConfig($params['gameType']);
            } catch (Exception $e) {
                return ["error" => $e->getMessage()];
            }
        }
        
        return null;
    }
    
    /**
     * Generate Redis keys for a game
     * 
     * @param string $placardId Game identifier
     * @param string $prefix Optional prefix for the keys
     * @return array Redis keys
     */
    public static function getRedisKeys($placardId, $prefix = '') {
        $basePrefix = "game:$placardId:";
        
        if ($prefix) {
            $basePrefix .= "$prefix:";
        }
        
        return [
            'start_time' => $basePrefix . "start_time",
            'remaining_time' => $basePrefix . "remaining_time",
            'status' => $basePrefix . "status",
            'team' => $basePrefix . "team",
            'period' => "game:$placardId:period",
            'home_timeouts' => "game:$placardId:home_timeouts",
            'away_timeouts' => "game:$placardId:away_timeouts"
        ];
    }
}