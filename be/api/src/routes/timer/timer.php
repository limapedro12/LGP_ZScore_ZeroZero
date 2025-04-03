<?php
require_once __DIR__ . '/../../index.php';

$placardId = $_GET['gameId'] ?? 'default';
$action = $_GET['action'] ?? null;

// Use a transaction to reduce overhead
$conn->begin_transaction();
try {
    // Check if timer exists in a single query and create if needed
    $stmt = $conn->prepare("
        INSERT INTO timers (placard_id, start_time, elapsed_time, is_paused)
        SELECT ?, NULL, 0, TRUE FROM dual
        WHERE EXISTS (SELECT 1 FROM placards WHERE id = ?)
        AND NOT EXISTS (SELECT 1 FROM timers WHERE placard_id = ?)
    ");
    $stmt->bind_param("iii", $placardId, $placardId, $placardId);
    $stmt->execute();
    
    // Handle the requested action
    switch ($action) {
        case 'start':
            // Update and get timer in one transaction
            $stmt = $conn->prepare("
                UPDATE timers SET 
                    start_time = CASE 
                        WHEN is_paused = TRUE AND start_time IS NULL THEN FROM_UNIXTIME(?)
                        WHEN is_paused = TRUE THEN DATE_SUB(NOW(), INTERVAL elapsed_time SECOND)
                        ELSE start_time
                    END,
                    is_paused = CASE WHEN is_paused = TRUE THEN FALSE ELSE is_paused END
                WHERE placard_id = ?
            ");
            $now = time();
            $stmt->bind_param("ii", $now, $placardId);
            $stmt->execute();
            break;
            
        case 'pause':
            $stmt = $conn->prepare("
                UPDATE timers SET
                    elapsed_time = CASE 
                        WHEN is_paused = FALSE AND start_time IS NOT NULL
                        THEN TIMESTAMPDIFF(SECOND, start_time, NOW())
                        ELSE elapsed_time
                    END,
                    is_paused = CASE
                        WHEN is_paused = FALSE AND start_time IS NOT NULL
                        THEN TRUE
                        ELSE is_paused
                    END
                WHERE placard_id = ?
            ");
            $stmt->bind_param("i", $placardId);
            $stmt->execute();
            break;
            
        case 'reset':
            $stmt = $conn->prepare("
                UPDATE timers SET
                    start_time = NULL,
                    elapsed_time = 0,
                    is_paused = TRUE
                WHERE placard_id = ?
            ");
            $stmt->bind_param("i", $placardId);
            $stmt->execute();
            break;
    }
    
    // Get the current timer status in one query
    $stmt = $conn->prepare("
        SELECT 
            UNIX_TIMESTAMP(start_time) as start_timestamp,
            elapsed_time,
            is_paused,
            CASE 
                WHEN is_paused = FALSE AND start_time IS NOT NULL
                THEN UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(start_time)
                ELSE elapsed_time
            END as current_elapsed
        FROM timers
        WHERE placard_id = ?
    ");
    $stmt->bind_param("i", $placardId);
    $stmt->execute();
    $result = $stmt->get_result();
    $timer = $result->fetch_assoc();
    
    $conn->commit();
    
    // Format response
    $response = [
        'start_time' => $timer['start_timestamp'],
        'elapsed_time' => $timer['is_paused'] ? $timer['elapsed_time'] : $timer['current_elapsed'],
        'is_paused' => (bool)$timer['is_paused']
    ];
    
    echo json_encode([
        "message" => "Timer $action operation completed",
        "timer" => $response
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        "error" => "Database operation failed: " . $e->getMessage()
    ]);
}
?>