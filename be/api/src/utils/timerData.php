<?php

/**
 * Retrieves and calculates timer data for a specific game
 *
 * This function fetches timer values from Redis and calculates the remaining time
 * based on whether the timer is running or paused. It also handles auto-pausing
 * and period transitions when a period ends.
 *
 * @param Redis $redis Redis connection
 * @param string $placardId Game identifier
 * @param int $currentTime Current Unix timestamp
 * @param array $gameConfig Game configuration parameters
 * @return array Timer data including status, remaining time, and period information
 */
function getTimerData($redis, $placardId, $currentTime, $gameConfig) {
    try{
        $prefix = "game:$placardId:";
        $status = $redis->get($prefix . 'status') ?: 'paused';
        $startTime = (int)$redis->get($prefix . 'start_time') ?: 0;
        $storedRemaining = (int)$redis->get($prefix . 'remaining_time');
        $period = (int)$redis->get($prefix . 'period') ?: 1;
        
        // Initialize remaining time if not set yet
        if ($storedRemaining === 0 && $redis->get($prefix . 'remaining_time') === false) {
            $storedRemaining = $gameConfig['periodDuration'];
        }
        
        // Calculate remaining time if timer is running
        $remainingTime = ($status === 'running' && $startTime > 0) 
            ? $storedRemaining - ($currentTime - $startTime)
            : $storedRemaining;
        
        // Auto-pause if timer reaches 0
        if ($remainingTime <= 0 && $status === 'running') {
            $remainingTime = 0;
            $redis->set($prefix . 'status', 'paused');
            $redis->set($prefix . 'remaining_time', 0);
            $status = 'paused';
            
            // If not the last period, prepare for next period
            if ($period < $gameConfig['periods']) {
                $redis->set($prefix . 'period', $period + 1);
                $redis->set($prefix . 'remaining_time', $gameConfig['periodDuration']);
            }
        }
            
        return [
            'status' => $status,
            'start_time' => $startTime,
            'remaining_time' => max(0, $remainingTime),
            'period' => $period,
            'total_periods' => $gameConfig['periods']
        ];
    } catch (Exception $e) {
        return [
            'error' => "Failed to get timer data: " . $e->getMessage()
        ];
    }
}