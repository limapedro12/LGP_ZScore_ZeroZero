<?php

class RequestUtils {

    public static function getRequestParams() {
        $params = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents('php://input');
            if ($input) {
                $jsonBody = json_decode($input, true);
                if (is_array($jsonBody)) {
                    $params = array_merge($params, $jsonBody);
                }
            }
        } else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $params = array_merge($params, $_GET);
        }

        return $params;
    }

    public static function validateParams($params, $requiredParams, $allowedActions) {
        foreach ($requiredParams as $param) {
            if (!isset($params[$param])) {
                return ["error" => "Missing $param"];
            }
        }

        if (!in_array($params['action'], $allowedActions)) {
            return ["error" => "Invalid action"];
        }

        if (isset($params['sport'])) {
            try {
                $gameConfigManager = new GameConfig();
                $gameConfigManager->getConfig($params['sport']);
            } catch (Exception $e) {
                return ["error" => $e->getMessage()];
            }
        }

        return null;
    }

    public static function getRedisKeys($placardId, $type){
        $prefix = "game:$placardId:";

        switch($type){
            case 'timer':
                return [
                    'start_time' => $prefix . 'start_time',
                    'remaining_time' => $prefix . 'remaining_time',
                    'status' => $prefix . 'status',
                    'period' => $prefix . 'period'
                ];
            case 'timeout':
                return [
                    'game_timeouts' => $prefix . 'timeouts',
                    'event_counter' => $prefix . 'event_counter',
                    'timeout_event' => $prefix . 'timeout_event:',
                    'home_timeouts_used' => $prefix . 'home_timeouts_used',
                    'away_timeouts_used' => $prefix . 'away_timeouts_used',
                    'start_time' => $prefix . 'timeout_start_time',
                    'remaining_time' => $prefix . 'timeout_remaining_time',
                    'status' => $prefix . 'timeout_status',
                ];
        }
    }

}