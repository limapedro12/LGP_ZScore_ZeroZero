<?php
require_once 'Placard.php';

$host = 'mariadb';
$db = 'zscore';
$user = 'user';
$pass = 'password';

$maxRetries = 20;
$retryDelay = 3;

for ($i = 0; $i < $maxRetries; $i++) {
    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Run schema.sql to set up the database schema
        $schemaFile = '/mariaDB/schema.sql';
        $schema = file_get_contents($schemaFile);
        $pdo->exec($schema);

        echo "Connected to the MariaDB database successfully!\n";

        // Example usage of the Placard class
        $placard = new Placard("Sample Title", "This is a sample description.");
        $placard->saveToDatabase($pdo);

        break;
    } catch (PDOException $e) {
        if ($i == $maxRetries - 1) {
            echo "Connection failed: " . $e->getMessage();
            exit(1);
        }
        echo "Retrying connection in $retryDelay seconds...\n";
        sleep($retryDelay);
    }
}
?>