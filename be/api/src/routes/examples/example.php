<?php
require_once __DIR__ . '/../../index.php';

function testConection() {
    global $conn, $dbname;
    
    $tables = [];
    
    // Check if connection is successful
    if ($conn) {
        $result = "Connected to " . $dbname;
        
        // Get all tables in database
        $query = "SHOW TABLES";
        $tablesResult = $conn->query($query);
        
        if ($tablesResult) {
            while ($row = $tablesResult->fetch_array(MYSQLI_NUM)) {
                $tables[] = $row[0];
            }
        }
        
        return [
            'status' => $result,
            'tables' => $tables
        ];
    } else {
        return [
            'status' => 'Connection failed',
            'tables' => []
        ];
    }
}

// Example usage
$result = testConection();
echo json_encode($result);
?>