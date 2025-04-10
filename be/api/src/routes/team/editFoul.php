<?php
require_once __DIR__ . '/../../connRedis.php';
// Basic endpoint to handle editing a team
header('Content-Type: application/json');

// Simulate a response for now
$response = ['status' => 'error', 'message' => 'Invalid request.'];

if (!isset($redis) || !$redis->ping()) {
    // Log error securely
    error_log("Redis connection failed or not established p");
    $response['message'] = 'Database service unavailable.'; 
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST is allowed.';
    echo json_encode($response);
    exit;
}

$foul_id = filter_input(INPUT_POST, 'foul_id', FILTER_SANITIZE_STRING); 
$game_id = filter_input(INPUT_POST, 'game_id', FILTER_SANITIZE_STRING); 
$player_id = filter_input(INPUT_POST, 'player_id', FILTER_SANITIZE_STRING); 
$foul_time = filter_input(INPUT_POST, 'foul_time', FILTER_SANITIZE_STRING);
$jersey_number = filter_input(INPUT_POST, 'jersey_number', FILTER_VALIDATE_INT);


if (empty($foul_id) || empty($game_id) || empty($player_id) || $foul_time === null || $jersey_number === false) {

   $response['message'] = 'Missing or invalid required fields (foul_id, game_id, player_id, foul_time, jersey_number).';
   echo json_encode($response);
   exit;
}


$foulKey = "foul:" . $foul_id;

$playerKey = "player:" . $player_id;


try {
 
   $existingFoulData = $redis->hGetAll($foulKey);

   if (empty($existingFoulData)) {
       $response['message'] = 'Foul record not found.';
       echo json_encode($response);
       exit;
   }

   if (!isset($existingFoulData['game_id']) || $existingFoulData['game_id'] !== $game_id) {
        $response['message'] = 'Foul record does not belong to the specified game.';
        // Log this potential inconsistency
        error_log("Foul ID {$foul_id} found, but game_id mismatch (expected {$game_id}, found {$existingFoulData['game_id']})");
        echo json_encode($response);
        exit;
   }


   $newTeamId = $redis->hGet($playerKey, 'team_id');
   if ($newTeamId === false || $newTeamId === null) { 
       $response['message'] = 'Could not find team information for the selected player.';
       echo json_encode($response);
       exit;
   }


   $oldTeamId = $existingFoulData['team_id'] ?? null; 

} catch (Exception $e) {
 
   error_log("Redis error during fetch: " . $e->getMessage());
   $response['message'] = 'Error accessing data store.';
   echo json_encode($response);
   exit;
}


$updatedFoulData = [
   'player_id' => $player_id,
   'team_id' => $newTeamId, // Update with the new player's team
   'foul_time' => $foul_time,
   'jersey_number' => $jersey_number,
   'updated_at' => time() // Add/Update timestamp

];

try {
   $redis->multi(); // Start transaction

   $redis->hMSet($foulKey, $updatedFoulData); 
   if ($oldTeamId && $oldTeamId !== $newTeamId) {
       // Team changed - adjust counters and set indexes
       $oldTeamFoulCountKey = "game:{$game_id}:team:{$oldTeamId}:foul_count";
       $newTeamFoulCountKey = "game:{$game_id}:team:{$newTeamId}:foul_count";
       $oldTeamFoulIndexKey = "game:{$game_id}:team:{$oldTeamId}:fouls";
       $newTeamFoulIndexKey = "game:{$game_id}:team:{$newTeamId}:fouls";

       // Decrement old team's counter (if it exists)
       $redis->decr($oldTeamFoulCountKey);
       // Increment new team's counter
       $redis->incr($newTeamFoulCountKey);

       $redis->sRem($oldTeamFoulIndexKey, $foul_id);
     
       $redis->sAdd($newTeamFoulIndexKey, $foul_id);

   }
  
   $results = $redis->exec();

   
   if ($results === false) {
       
       $response['message'] = 'Failed to update foul record due to conflicting operation.';
       error_log("Redis transaction failed for foul edit: {$foul_id}");
   } elseif (is_array($results)) {
        
       $response['status'] = 'success';
       $response['message'] = 'Foul updated successfully.';
       $response['updated_data'] = $updatedFoulData;

   } else {
       
        $response['message'] = 'An unexpected error occurred during the update.';
        error_log("Unexpected Redis EXEC result for foul edit {$foul_id}: " . print_r($results, true));
   }


} catch (Exception $e) {
   // Catch potential exceptions from the Redis client library during MULTI/EXEC
   error_log("Redis error during update transaction: " . $e->getMessage());
   $response['message'] = 'Error updating data store.';
  
}



echo json_encode($response);
exit;

?>