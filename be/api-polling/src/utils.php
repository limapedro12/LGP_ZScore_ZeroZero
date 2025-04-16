<?php
function getRedisConnection() {
    $redis = new Redis();
    $redis->connect('redis', 6379);
    return $redis;
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}