<?php

/**
 * Connect to Redis server using a persistent connection
 * 
 * @param float $timeout Connection timeout in seconds
 * @return Redis|false Returns Redis object on success, false on failure
 */
function connectRedis($timeout = 2.0) {
    // Use environment variables with defaults
    $host = getenv('REDIS_HOST');
    $port = getenv('REDIS_PORT');
    try {
        $redis = new Redis();
        
        // Use persistent connection with a unique persistent ID
        if (!$redis->pconnect($host, $port, $timeout, 'lgp_timer_persistent')) {
            error_log("Failed to connect to Redis at $host:$port");
            return false;
        }
        return $redis;
    } catch (Exception $e) {
        error_log("Redis connection error: " . $e->getMessage());
        return false;
    }
}