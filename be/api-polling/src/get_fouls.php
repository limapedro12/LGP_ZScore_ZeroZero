<?php
$gameId = $_GET['gameId'] ?? 123;
$team1Id = $_GET['team1'] ?? 1;
$team2Id = $_GET['team2'] ?? 2;

$redis = new Redis();
$redis->connect('redis', 6379); // nome do serviço no docker-compose

$fouls1 = $redis->get("foul:$gameId:$team1Id") ?: 0;
$fouls2 = $redis->get("foul:$gameId:$team2Id") ?: 0;

echo json_encode([
    'team1' => (int)$fouls1,
    'team2' => (int)$fouls2
]);
