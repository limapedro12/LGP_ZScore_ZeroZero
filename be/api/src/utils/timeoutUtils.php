<?php

require_once __DIR__ . '/redisUtils.php';
require_once __DIR__ . '/requestUtils.php';

class TimeoutUtils {
    public static function resetTimeoutsForNewPeriod($placardId) {
        $redis = RedistUtils::connect();
        $keys = RequestUtils::getRedisKeys($placardId, 'timeout');
        
        $statusKey = $keys['status'];
        $startTimeKey = $keys['start_time'];
        $remainingTimeKey = $keys['remaining_time'];
        $activeTeamKey = $keys['team'];
        
        $redis->multi();
        $redis->set($statusKey, 'inactive');
        $redis->set($remainingTimeKey, 0);
        $redis->set($startTimeKey, 0);
        $redis->del($activeTeamKey);
        return $redis->exec();
    }
}