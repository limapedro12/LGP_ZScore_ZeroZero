<?php
// Query to fetch data from the `placards` table instead of users
$sql = "SELECT id, title, description FROM placards";
$result = $conn->query($sql);

// Check if the query was successful
if (!$result) {
    die(json_encode(["error" => "Query failed: " . $conn->error]));
}

// Fetch data and store it in an array
$placards = [];
while ($row = $result->fetch_assoc()) {
    $placards[] = $row;
}

// Return the data as JSON
echo json_encode(["placards" => $placards]);
?>