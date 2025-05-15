<?php

require_once __DIR__ . '/../config/gameConfig.php';
require_once __DIR__ . '/requestUtils.php';
require_once __DIR__ . '/redisUtils.php';
require_once __DIR__ . '/timeoutUtils.php';

class PointUtils {

    private static function shouldChangePeriod($homePoints, $awayPoints, $currentPeriod, $gameConfig) {
        if ($currentPeriod >= $gameConfig['periods']) {
            return false;
        }
        
        if (!isset($gameConfig['periodEndScore'])) {
            return false;
        }
        
        $periodEndScore = $gameConfig['periodEndScore'];
        $pointDifference = $gameConfig['pointDifference'] ?? 0;
        
        if ($homePoints >= $periodEndScore && ($homePoints - $awayPoints) >= $pointDifference) {
            return true;
        } else if ($awayPoints >= $periodEndScore && ($awayPoints - $homePoints) >= $pointDifference) {
            return true;
        }
        
        return false;
    }

    public static function changePeriod($placardId, $sport, $team) {
        global $redis;
        if (!$redis) {
            $redis = RedistUtils::connect();
        }
        
        $gameConfigManager = new GameConfig();
        $gameConfig = $gameConfigManager->getConfig($sport);
        
        $keys = RequestUtils::getRedisKeys($placardId, 'points');
        $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');
        
        $pipeline = $redis->pipeline();
        $pipeline->get($keys['home_points']);
        $pipeline->get($keys['away_points']);
        $pipeline->get($timerKeys['period']);
        $pipeline->get($timerKeys['status']);
        $results = $pipeline->exec();
        
        $homePoints = (int)($results[0] ?? 0);
        $awayPoints = (int)($results[1] ?? 0);
        $currentPeriod = (int)($results[2] ?? 1) ?? 1;
        $timerStatus = $results[3] ?? 'paused';
        
        if (!self::shouldChangePeriod($homePoints, $awayPoints, $currentPeriod, $gameConfig)) {
            return false;
        }
        
        $setData = [
            'home_points' => $homePoints,
            'away_points' => $awayPoints,
            'set_total_points' => $homePoints + $awayPoints
        ];

        $newPeriod = $currentPeriod + 1;
        
        $pipeline = $redis->pipeline();
        $pipeline->set($timerKeys['period'], $newPeriod);
        $pipeline->hMSet($keys['set_points'] . $currentPeriod, $setData);
        
        if ($timerStatus === 'running') {
            $pipeline->set($timerKeys['status'], 'paused');
        }
        
        if (isset($gameConfig['resetPointsEachPeriod'])) {
            $pipeline->set($keys['home_points'], 0);
            $pipeline->set($keys['away_points'], 0);
        }
        
        $pipeline->exec();

        if (isset($gameConfig['timeoutsPerPeriod'])) {
            TimeoutUtils::resetTimeoutsForNewPeriod($placardId);
        }
        return true;
    }
    
    public static function canModifyPoints($placardId, $sport, $team, $points) {
        global $redis;
        if (!$redis) {
            $redis = RedistUtils::connect();
        }

        $gameConfigManager = new GameConfig();
        $gameConfig = $gameConfigManager->getConfig($sport);

        if (!isset($gameConfig['periodEndScore'])) {
            return true;
        }

        $keys = RequestUtils::getRedisKeys($placardId, 'points');
        $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');
        $pipeline = $redis->pipeline();
        $pipeline->get($keys['home_points']);
        $pipeline->get($keys['away_points']);
        $pipeline->get($timerKeys['period']);
        $results = $pipeline->exec();

        $homePoints = (int)($results[0] ?? 0);
        $awayPoints = (int)($results[1] ?? 0);
        $currentPeriod = (int)($results[2] ?? 1) ?? 1;

        if (($currentPeriod == $gameConfig['periods']) && ((($homePoints + $points) > $gameConfig['periodEndScore']) || (($awayPoints + $points) > $gameConfig['periodEndScore']))) {
            return false;
        }
        
        return true;
    }

    public static function adjustPoints($placardId, $sport) {
        global $redis;
        if (!$redis) {
            $redis = RedistUtils::connect();
        }
    
        $gameConfigManager = new GameConfig();
        $gameConfig = $gameConfigManager->getConfig($sport);
    
        $keys = RequestUtils::getRedisKeys($placardId, 'points');
        $timerKeys = RequestUtils::getRedisKeys($placardId, 'timer');
    
        $pointEventKeys = $redis->zRange($keys['game_points'], 0, -1);
        $events = [];
        foreach ($pointEventKeys as $eventKey) {
            $events[] = [
                'key' => $eventKey,
                'data' => $redis->hGetAll($eventKey)
            ];
        }
    
        $redis->set($keys['home_points'], 0);
        $redis->set($keys['away_points'], 0);
        $totalPeriods = $gameConfig['periods'] ?? 1;
        for ($i = 1; $i <= $totalPeriods; $i++) {
            $setKey = $keys['set_points'] . $i;
            $redis->del($setKey);
        }
    
        $homePoints = 0;
        $awayPoints = 0;
        $currentPeriod = 1;
        $totalGamePoints = 0;
    
        foreach ($events as $event) {
            $data = $event['data'];
            if (empty($data['team'])) continue;
            $points = (int)($data['pointValue'] ?? 1);
    
            if ($data['team'] === 'home') {
                $homePoints += $points;
            } else if ($data['team'] === 'away') {
                $awayPoints += $points;
            }
    
            $totalGamePoints = $homePoints + $awayPoints;
    
            // Update event hash: totalGamePoints and period
            $redis->hMSet($event['key'], [
                'totalGamePoints' => $totalGamePoints,
                'period' => $currentPeriod
            ]);
            $redis->zAdd($keys['game_points'], $totalGamePoints, $event['key']);
    
            if (self::shouldChangePeriod($homePoints, $awayPoints, $currentPeriod, $gameConfig)) {
                $setData = [
                    'home_points' => $homePoints,
                    'away_points' => $awayPoints,
                    'set_total_points' => $homePoints + $awayPoints
                ];
                $redis->hMSet($keys['set_points'] . $currentPeriod, $setData);
    
                if (isset($gameConfig['resetPointsEachPeriod'])) {
                    $homePoints = 0;
                    $awayPoints = 0;
                }
                $currentPeriod++;
            }
        }
    
        $redis->multi();
        $redis->set($keys['home_points'], $homePoints);
        $redis->set($keys['away_points'], $awayPoints);
        $redis->set($timerKeys['period'], $currentPeriod);
        $redis->set($keys['total_game_points'], $totalGamePoints);
        $redis->exec();
    }
    
}
?>