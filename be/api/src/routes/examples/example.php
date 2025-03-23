<?php
// Query to fetch data from the `users` table
$sql = "SELECT id, username, email FROM users";
$result = $conn->query($sql);

// Check if the query was successful
if (!$result) {
    die(json_encode(["error" => "Query failed: " . $conn->error]));
}

// Fetch data and store it in an array
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

// Return the data as JSON
echo json_encode(["users" => $users]);
?>
