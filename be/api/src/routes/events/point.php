<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../classes/AbstractEvent.php';
require_once __DIR__ . '/../../classes/PointEvent.php';
require_once __DIR__ . '/../../config/gameConfig.php';
require_once __DIR__ . '/../../classes/FutsalPlacard.php';
require_once __DIR__ . '/../../classes/VolleyballPlacard.php';

header('Content-Type: application/json');

$requestMethod = $_SERVER['REQUEST_METHOD'];

// Processar o corpo da requisição para métodos GET
if ($requestMethod === 'GET') {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        $params = json_decode($input, true) ?? [];
    }
} else {
    $params = RequestUtils::getRequestParams();
}

$requiredParams = ['placardId', 'sport', 'action']; // Alterado para 'sport'
$allowedActions = ['add', 'remove', 'get'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    http_response_code(400);
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$action = $params['action'] ?? null;
$sport = $params['sport'] ?? null;

$redis = RedisUtils::connect();
if (!$redis) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

$response = [];

try {
    if (!$sport) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid sport"]);
        exit;
    }

    $keys = RequestUtils::getRedisKeys($placardId, 'points');

    if (!isset($keys['game_points']) || !isset($keys['event_counter'])) {
        throw new Exception("Missing required keys in Redis.");
    }

    $gamePointsKey = $keys['game_points'];
    $eventCounterKey = $keys['event_counter'];

    // Incrementar o contador de eventos e criar a chave do evento
    $eventId = $redis->incr($eventCounterKey);
    $timestamp = time();
    $pointEventKey = $keys['point_event'] . $eventId;

    $redis->zAdd($gamePointsKey, $timestamp, $pointEventKey);

    $gameConfig = new GameConfig();
    $gameConfig = $gameConfig->getConfig($sport);

    switch ($action) {
        case 'add':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for add action."];
                break;
            }

            $teamId = $params['teamId'] ?? null;
            $points = $gameConfig['points'];

            if (!$teamId) {
                http_response_code(400);
                $response = ["error" => "Missing teamId for add action"];
                break;
            }

            // Determinar o tipo de jogo
            if ($sport === 'futsal') {
                // Carregar os dados do placard do Redis
                $placardData = $redis->hGetAll("placard:{$placardId}");

                // Inicializar os valores do placard
                $currentGoalsFirstTeam = isset($placardData['currentGoalsFirstTeam']) ? (int)$placardData['currentGoalsFirstTeam'] : 0;
                $currentGoalsSecondTeam = isset($placardData['currentGoalsSecondTeam']) ? (int)$placardData['currentGoalsSecondTeam'] : 0;

                // Criar objetos FutsalTeam para o placard
                $firstTeam = new FutsalTeam(1); // ID do time 1
                $secondTeam = new FutsalTeam(2); // ID do time 2

                // Instanciar o placard com os times
                $placard = new FutsalPlacard($firstTeam, $secondTeam);

                // Atualizar os pontos com base no teamId
                if ($teamId === 1) {
                    $currentGoalsFirstTeam += $points;
                    $placard->setCurrentGoalsFirstTeam($currentGoalsFirstTeam);
                } elseif ($teamId === 2) {
                    $currentGoalsSecondTeam += $points;
                    $placard->setCurrentGoalsSecondTeam($currentGoalsSecondTeam);
                } else {
                    http_response_code(400);
                    $response = ["error" => "Invalid teamId for futsal"];
                    break;
                }

                // Salvar os dados atualizados no Redis
                $redis->hMSet("placard:{$placardId}", [
                    'currentGoalsFirstTeam' => $currentGoalsFirstTeam,
                    'currentGoalsSecondTeam' => $currentGoalsSecondTeam,
                ]);

                // Salvar os dados do evento no Redis
                $redis->hMSet($pointEventKey, [
                    'eventId' => $eventId,
                    'placardId' => $placardId,
                    'teamId' => $teamId,
                    'timestamp' => $timestamp,
                    'points' => $points,
                    'totalPoints' => $teamId === 1 ? $currentGoalsFirstTeam : $currentGoalsSecondTeam
                ]);

                // Retornar os pontos atualizados
                $totalPoints = $teamId === 1 ? $currentGoalsFirstTeam : $currentGoalsSecondTeam;

                http_response_code(201);
                $response = [
                    "message" => "Point event added successfully",
                    "event" => [
                        "eventId" => $eventId,
                        "placardId" => $placardId,
                        "teamId" => $teamId,
                        "timestamp" => $timestamp,
                        "totalPoints" => $totalPoints
                    ]
                ];
            } elseif ($sport === 'volleyball') {
                // Parâmetro adicional para volleyball
                $setNumber = $params['setNumber'] ?? 1;

                // Carregar os dados do placard do Redis
                $placardData = $redis->hGetAll("placard:{$placardId}");

                // Inicializar placard e sets
                $placard = new VolleyballPlacard();
                $currentSet = isset($placardData['currentSet']) ? (int)$placardData['currentSet'] : $setNumber;
                $placard->setCurrentSet($currentSet);

                // Recuperar pontos atuais do set
                $pointsFirst = isset($placardData["set{$currentSet}_pointsFirst"]) ? (int)$placardData["set{$currentSet}_pointsFirst"] : 0;
                $pointsSecond = isset($placardData["set{$currentSet}_pointsSecond"]) ? (int)$placardData["set{$currentSet}_pointsSecond"] : 0;

                // Atualizar pontos
                if ($teamId === 1) {
                    $pointsFirst += $points;
                } elseif ($teamId === 2) {
                    $pointsSecond += $points;
                } else {
                    http_response_code(400);
                    $response = ["error" => "Invalid teamId for volleyball"];
                    break;
                }

                // Salvar resultado do set no placard
                $placard->addSetResult($currentSet, $pointsFirst, $pointsSecond);

                // Salvar dados atualizados no Redis
                $redis->hMSet("placard:{$placardId}", [
                    'currentSet' => $currentSet,
                    "set{$currentSet}_pointsFirst" => $pointsFirst,
                    "set{$currentSet}_pointsSecond" => $pointsSecond,
                ]);

                // Salvar evento do ponto
                $redis->hMSet($pointEventKey, [
                    'eventId' => $eventId,
                    'placardId' => $placardId,
                    'teamId' => $teamId,
                    'setNumber' => $currentSet,
                    'timestamp' => $timestamp,
                    'points' => $points,
                    'totalPoints' => $teamId === 1 ? $pointsFirst : $pointsSecond
                ]);

                $totalPoints = $teamId === 1 ? $pointsFirst : $pointsSecond;

                http_response_code(201);
                $response = [
                    "message" => "Point event added successfully",
                    "event" => [
                        "eventId" => $eventId,
                        "placardId" => $placardId,
                        "teamId" => $teamId,
                        "setNumber" => $currentSet,
                        "timestamp" => $timestamp,
                        "totalPoints" => $totalPoints
                    ]
                ];
            } else {
                http_response_code(400);
                $response = ["error" => "Unsupported sport type"];
            }
            break;

        case 'remove':
            if ($requestMethod !== 'POST') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only POST is allowed for add action."];
                break;
            }

            $teamId = $params['teamId'] ?? null;
            $points = $gameConfig['points'];

            if (!$teamId) {
                http_response_code(400);
                $response = ["error" => "Missing teamId for add action"];
                break;
            }

            // Determinar o tipo de jogo
            if ($sport === 'futsal') {
                // Carregar os dados do placard do Redis
                $placardData = $redis->hGetAll("placard:{$placardId}");

                // Inicializar os valores do placard
                $currentGoalsFirstTeam = isset($placardData['currentGoalsFirstTeam']) ? (int)$placardData['currentGoalsFirstTeam'] : 0;
                $currentGoalsSecondTeam = isset($placardData['currentGoalsSecondTeam']) ? (int)$placardData['currentGoalsSecondTeam'] : 0;

                // Criar objetos FutsalTeam para o placard
                $firstTeam = new FutsalTeam(1); // ID do time 1
                $secondTeam = new FutsalTeam(2); // ID do time 2

                // Instanciar o placard com os times
                $placard = new FutsalPlacard($firstTeam, $secondTeam);

                // Atualizar os pontos com base no teamId
                if ($teamId === 1) {
                    $currentGoalsFirstTeam -= $points;
                    $placard->setCurrentGoalsFirstTeam($currentGoalsFirstTeam);
                } elseif ($teamId === 2) {
                    $currentGoalsSecondTeam -= $points;
                    $placard->setCurrentGoalsSecondTeam($currentGoalsSecondTeam);
                } else {
                    http_response_code(400);
                    $response = ["error" => "Invalid teamId for futsal"];
                    break;
                }

                // Salvar os dados atualizados no Redis
                $redis->hMSet("placard:{$placardId}", [
                    'currentGoalsFirstTeam' => $currentGoalsFirstTeam,
                    'currentGoalsSecondTeam' => $currentGoalsSecondTeam,
                ]);

                // Salvar os dados do evento no Redis
                $redis->hMSet($pointEventKey, [
                    'eventId' => $eventId,
                    'placardId' => $placardId,
                    'teamId' => $teamId,
                    'timestamp' => $timestamp,
                    'points' => $points,
                    'totalPoints' => $teamId === 1 ? $currentGoalsFirstTeam : $currentGoalsSecondTeam
                ]);

                // Retornar os pontos atualizados
                $totalPoints = $teamId === 1 ? $currentGoalsFirstTeam : $currentGoalsSecondTeam;

                http_response_code(201);
                $response = [
                    "message" => "Point event added successfully",
                    "event" => [
                        "eventId" => $eventId,
                        "placardId" => $placardId,
                        "teamId" => $teamId,
                        "timestamp" => $timestamp,
                        "totalPoints" => $totalPoints
                    ]
                ];
            } elseif ($sport === 'volleyball') {
                $setNumber = $params['setNumber'] ?? 1;

                // Carregar os dados do placard do Redis
                $placardData = $redis->hGetAll("placard:{$placardId}");

                $placard = new VolleyballPlacard();
                $currentSet = isset($placardData['currentSet']) ? (int)$placardData['currentSet'] : $setNumber;
                $placard->setCurrentSet($currentSet);

                $pointsFirst = isset($placardData["set{$currentSet}_pointsFirst"]) ? (int)$placardData["set{$currentSet}_pointsFirst"] : 0;
                $pointsSecond = isset($placardData["set{$currentSet}_pointsSecond"]) ? (int)$placardData["set{$currentSet}_pointsSecond"] : 0;

                if ($teamId === 1) {
                    $pointsFirst -= $points;
                    if ($pointsFirst < 0) $pointsFirst = 0;
                } elseif ($teamId === 2) {
                    $pointsSecond -= $points;
                    if ($pointsSecond < 0) $pointsSecond = 0;
                } else {
                    http_response_code(400);
                    $response = ["error" => "Invalid teamId for volleyball"];
                    break;
                }

                $placard->addSetResult($currentSet, $pointsFirst, $pointsSecond);

                $redis->hMSet("placard:{$placardId}", [
                    'currentSet' => $currentSet,
                    "set{$currentSet}_pointsFirst" => $pointsFirst,
                    "set{$currentSet}_pointsSecond" => $pointsSecond,
                ]);

                $redis->hMSet($pointEventKey, [
                    'eventId' => $eventId,
                    'placardId' => $placardId,
                    'teamId' => $teamId,
                    'setNumber' => $currentSet,
                    'timestamp' => $timestamp,
                    'points' => -$points,
                    'totalPoints' => $teamId === 1 ? $pointsFirst : $pointsSecond
                ]);

                $totalPoints = $teamId === 1 ? $pointsFirst : $pointsSecond;

                http_response_code(201);
                $response = [
                    "message" => "Point event removed successfully",
                    "event" => [
                        "eventId" => $eventId,
                        "placardId" => $placardId,
                        "teamId" => $teamId,
                        "setNumber" => $currentSet,
                        "timestamp" => $timestamp,
                        "totalPoints" => $totalPoints
                    ]
                ];
            } else {
                http_response_code(400);
                $response = ["error" => "Unsupported sport type"];
            }
            break;

        case 'get':
            if ($requestMethod !== 'GET') {
                http_response_code(405);
                $response = ["error" => "Invalid request method. Only GET is allowed for get action."];
                break;
            }

            // Carregar os dados do placard do Redis
            $placardData = $redis->hGetAll("placard:{$placardId}");

            if ($sport === 'futsal') {
                // Inicializar os valores de totalPoints
                $totalPointsTeam1 = isset($placardData['currentGoalsFirstTeam']) ? (int)$placardData['currentGoalsFirstTeam'] : 0;
                $totalPointsTeam2 = isset($placardData['currentGoalsSecondTeam']) ? (int)$placardData['currentGoalsSecondTeam'] : 0;
            } elseif ($sport === 'volleyball') {
                $currentSet = isset($placardData['currentSet']) ? (int)$placardData['currentSet'] : 1;
                $totalPointsTeam1 = isset($placardData["set{$currentSet}_pointsFirst"]) ? (int)$placardData["set{$currentSet}_pointsFirst"] : 0;
                $totalPointsTeam2 = isset($placardData["set{$currentSet}_pointsSecond"]) ? (int)$placardData["set{$currentSet}_pointsSecond"] : 0;
            } else {
                http_response_code(400);
                $response = ["error" => "Unsupported sport type"];
                break;
            }

            // Recuperar as chaves dos eventos de pontos associados ao placard
            $pointEventKeys = $redis->zRange($gamePointsKey, 0, -1);

            if (empty($pointEventKeys)) {
                $response = [
                    "team1" => [
                        "lastEvent" => null,
                        "totalPoints" => $totalPointsTeam1
                    ],
                    "team2" => [
                        "lastEvent" => null,
                        "totalPoints" => $totalPointsTeam2
                    ]
                ];
                break;
            }

            // Inicializar variáveis para armazenar os últimos eventos
            $lastEventTeam1 = null;
            $lastEventTeam2 = null;

            // Obter os dados de cada evento de ponto
            foreach ($pointEventKeys as $key) {
                $eventData = $redis->hGetAll($key);

                if (!empty($eventData)) {
                    $teamId = (int)($eventData['teamId'] ?? 0);

                    if ($teamId === 1) {
                        $lastEventTeam1 = $eventData;
                    } elseif ($teamId === 2) {
                        $lastEventTeam2 = $eventData;
                    }
                }
            }

            // Construir a resposta com as estatísticas do jogo
            $response = [
                "team1" => [
                    "lastEvent" => $lastEventTeam1,
                    "totalPoints" => $totalPointsTeam1
                ],
                "team2" => [
                    "lastEvent" => $lastEventTeam2,
                    "totalPoints" => $totalPointsTeam2
                ]
            ];
            break;

        default:
            http_response_code(400);
            $response = ["error" => "Invalid action specified"];
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>