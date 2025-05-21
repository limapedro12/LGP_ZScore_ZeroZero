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
                    'team' => $prefix . 'timeout_team',
                ];
            case 'shotclock':
                return [
                    'start_time' => $prefix . 'shotclock:start_time',
                    'remaining_time' => $prefix . 'shotclock:remaining_time',
                    'status' => $prefix . 'shotclock:status',
                    'active_team' => $prefix . 'shotclock:active_team'
                ];
            case 'cards':
                return [
                    'game_cards' => $prefix . 'cards',
                    'event_counter' => $prefix . 'eventcounter',
                    'card_event' => $prefix . 'cardevent:'
                ];
            case 'substitutions':
                return [
                    'substitutions' => $prefix . 'substitutions',
                    'event_counter' => $prefix . 'event_counter',
                    'substitution_event' => $prefix . 'substitutionevent:'
                ];
            case 'points':
                return [
                    'game_points' => $prefix . 'points',
                    'event_counter' => $prefix . 'eventcounter',
                    'point_event' => $prefix . 'point_event:',
                    'home_points' => $prefix . 'home_points',
                    'away_points' => $prefix . 'away_points',
                    'total_game_points' => $prefix . 'total_game_points',
                    'set_points' => $prefix . 'set_points:',
                    'current_server' => $prefix . 'current_server',
                ];
            case 'fouls':
                return [
                    'event_counter' => $prefix . 'eventcounter',
                    'game_fouls' => $prefix . 'fouls',
                    'foul_event' => "foulevent:",
                    'accumulated_foul' => $prefix . 'team:'
                ];    
        }
    }

    public static function getGameTimePosition($placardId) {
        global $redis, $gameConfig;

        $timerKeys = self::getRedisKeys($placardId, 'timer');

        if(!isset($gameConfig['periodDuration'])){
            return 0;
        }
        
        $pipeline = $redis->pipeline();
        $pipeline->get($timerKeys['period']);
        $pipeline->get($timerKeys['remaining_time']);
        $pipeline->get($timerKeys['status']);
        $pipeline->get($timerKeys['start_time']);
        $results = $pipeline->exec();
        
        $period = (int)($results[0] ?: 1);
        $remainingTime = (int)($results[1] ?: $gameConfig['periodDuration']);
        $status = $results[2] ?: 'paused';
        $startTime = (int)($results[3] ?: 0);
        
        if ($status === 'running' && $startTime > 0) {
            $currentTime = time();
            $elapsedSinceStart = $currentTime - $startTime;
            $remainingTime = max(0, $remainingTime - $elapsedSinceStart);
        }
        
        $elapsedInPeriod = $gameConfig['periodDuration'] - $remainingTime;
        
        $totalElapsed = (($period - 1) * $gameConfig['periodDuration']) + $elapsedInPeriod;
        
        return $totalElapsed;
    }
}