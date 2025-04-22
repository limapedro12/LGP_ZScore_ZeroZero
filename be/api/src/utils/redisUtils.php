<?php

class RedistUtils {
    /**
     * Connects to Redis server using persistent connection
     *
     * @param float $timeout Maximum time in seconds to wait for connection (default: 2.0)
     * @return Redis|false Returns Redis connection object on success, false on failure
     */
    public static function connect($timeout = 2.0) {
        $host = getenv('REDIS_HOST');
        $port = getenv('REDIS_PORT');
        try {
            $redis = new Redis();
            
            // Use persistent connection
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
}