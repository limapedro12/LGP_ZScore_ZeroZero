<?php
require_once __DIR__ . '/../../utils/redisUtils.php';
require_once __DIR__ . '/../../utils/requestUtils.php';
require_once __DIR__ . '/../../config/gameConfig.php';

header('Content-Type: application/json');

// Get and validate request parameters
$params = RequestUtils::getRequestParams();

$requiredParams = ['placardId', 'gameType', 'action'];
$allowedActions = ['status', 'reset', 'adjust'];

$validationError = RequestUtils::validateParams($params, $requiredParams, $allowedActions);
if ($validationError) {
    echo json_encode($validationError);
    exit;
}

$placardId = $params['placardId'] ?? null;
$gameType = $params['gameType'] ?? null;
$action = $params['action'] ?? null;
$team = $params['team'] ?? null;

if ($action === 'adjust' && empty($team)) {
    echo json_encode(["error" => "Team parameter is required for adjust action"]);
    exit;
}

if (!empty($team) && !in_array($team, ['home', 'away'])) {
    echo json_encode(["error" => "Team parameter must be 'home' or 'away'"]);
    exit;
}

// Connect to Redis
$redis = RedistUtils::connect();
if (!$redis) {
    echo json_encode(["error" => "Failed to connect to Redis"]);
    exit;
}

try {
    $gameConfigManager = new GameConfig();
    $gameConfig = $gameConfigManager->getConfig($gameType);
    
    $totalTimeoutsPerTeam = $gameConfig['timeoutsPerTeam'] ?? 0;
    $timeoutsPerPeriod = $gameConfig['timeoutsPerPeriod'] ?? 0;
    
    $homeTimeoutsKey = "game:$placardId:home_timeouts";
    $awayTimeoutsKey = "game:$placardId:away_timeouts";
    
    $homeTimeoutsUsed = (int)$redis->get($homeTimeoutsKey) ?: 0;
    $awayTimeoutsUsed = (int)$redis->get($awayTimeoutsKey) ?: 0;
    
    switch ($action) {
        case 'status':
            $response = [
                "home_timeouts_used" => $homeTimeoutsUsed,
                "away_timeouts_used" => $awayTimeoutsUsed,
                "total_timeouts_per_team" => $totalTimeoutsPerTeam,
                "timeouts_per_period" => $timeoutsPerPeriod
            ];
            break;
            
        case 'reset':
            if (!empty($team) && ($team == 'home' || $team == 'away')) {
                // Reset timeouts for specific team
                $teamKey = "game:$placardId:{$team}_timeouts";
                $redis->set($teamKey, 0);
                $response = [
                    "message" => "Timeouts reset for {$team} team",
                    "team" => $team,
                    "timeouts_used" => 0
                ];
            } else {
                // Reset timeouts for both teams
                $redis->set($homeTimeoutsKey, 0);
                $redis->set($awayTimeoutsKey, 0);
                $response = [
                    "message" => "Timeouts reset for both teams",
                    "home_timeouts_used" => 0,
                    "away_timeouts_used" => 0
                ];
            }
            break;
            
        case 'adjust':
            $value = isset($params['value']) ? intval($params['value']) : null;
            if ($value === null) {
                $response = ["error" => "Missing value parameter"];
                break;
            }
            
            $teamKey = "game:$placardId:{$team}_timeouts";
            $currentValue = (int)$redis->get($teamKey) ?: 0;
            $newValue = max(0, min($totalTimeoutsPerTeam, $currentValue + $value));
            
            $redis->set($teamKey, $newValue);
            
            $response = [
                "message" => "Timeouts adjusted for {$team} team",
                "team" => $team,
                "previous_value" => $currentValue,
                "adjustment" => $value,
                "new_value" => $newValue
            ];
            break;
            
        default:
            $response = ["error" => "Invalid action"];
            break;
    }
    
} catch (Exception $e) {
    $response = ["error" => "An error occurred: " . $e->getMessage()];
}

echo json_encode($response);
?>