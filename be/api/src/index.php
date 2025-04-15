<?php
header("Content-Type: application/json");
$servername = getenv('DB_HOST');
$username = "root"; //getenv('DB_USER');
$password = getenv('DB_ROOTPASSWORD');
$dbname = getenv('DB_NAME');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}



require 'router.php';

?>
