<?php
$gameId = $_POST['gameId'] ?? 123;
$teamId = $_POST['teamId'] ?? 1;

$redis = new Redis();
$redis->connect('redis', 6379);

$key = "foul:$gameId:$teamId";
$redis->incr($key);

echo json_encode(['success' => true]);
