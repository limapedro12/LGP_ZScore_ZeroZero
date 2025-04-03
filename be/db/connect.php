<?php
require_once 'classes/AbstractPlacard.php';
require_once 'classes/FutsalPlacard.php';
require_once 'classes/VolleyballPlacard.php';

$host = getenv('DB_HOST');
$db = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASSWORD');

$maxRetries = 20;
$retryDelay = 3;

for ($i = 0; $i < $maxRetries; $i++) {
    try {
        $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Run schema.sql to set up the database schema
        $schemaFile = '/schema/schema.sql';
        $schema = file_get_contents($schemaFile);
        $pdo->exec($schema);

        echo "Connected to the MariaDB database successfully!\n";

        // Example usage of the Placard class
        $futsalPlacard = new FutsalPlacard();
        $volleyballPlacard = new VolleyballPlacard();
        $futsalPlacard->saveToDatabase($pdo);
        $volleyballPlacard->saveToDatabase($pdo);
        echo "Placards saved successfully!\n";

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