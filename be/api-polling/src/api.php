<?php
header("Content-Type: application/json");

// Simula um delay de resposta para simular uma atualização chegando
sleep(2);

// Simula uma atualização de dados
$response = [
    "timestamp" => time(),
    "message" => "Nova atualização disponível!"
];

echo json_encode($response);
?>