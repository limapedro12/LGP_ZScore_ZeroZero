<?php

require_once __DIR__ . '/../config/gameConfig.php';
require_once __DIR__ . '/requestUtils.php';
require_once __DIR__ . '/redisUtils.php';

class PointValidationUtils {

    public static function changePeriod($placardId, $sport, $team) {
        global $redis;
        if (!$redis) {
            $redis = RedistUtils::connect();
        }
        
        $gameConfigManager = new GameConfig();
        $gameConfig = $gameConfigManager->getConfig($sport);
        
        if (!isset($gameConfig['periodEndScore'])) {
            return false;
        }
        
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
        
        if ($currentPeriod >= $gameConfig['periods']) {
            return false;
        }
        
        $periodEndScore = $gameConfig['periodEndScore'];
        $pointDifference = $gameConfig['pointDifference'] ?? 0;
        
        $endPeriod = false;
        
        if ($homePoints >= $periodEndScore && ($homePoints - $awayPoints) >= $pointDifference) {
            $endPeriod = true;
        } else if ($awayPoints >= $periodEndScore && ($awayPoints - $homePoints) >= $pointDifference) {
            $endPeriod = true;
        }
        
        if ($endPeriod) {

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
            return true;
        }
        
        return false;
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
}
?>