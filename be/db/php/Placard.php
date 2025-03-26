<?php
class Placard {
    private $id;
    private $title;
    private $description;

    public function __construct($title, $description) {
        $this->title = $title;
        $this->description = $description;
    }

    public static function createTable($pdo) {
        try {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS placards (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ");
            echo "Table 'placards' created successfully or already exists.\n";
        } catch (PDOException $e) {
            echo "Error creating table: " . $e->getMessage() . "\n";
        }
    }

    public function saveToDatabase($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO placards (title, description) VALUES (:title, :description)");
            $stmt->bindParam(':title', $this->title);
            $stmt->bindParam(':description', $this->description);
            $stmt->execute();
            $this->id = $pdo->lastInsertId();
            echo "Placard saved successfully with ID: " . $this->id . "\n";
        } catch (PDOException $e) {
            echo "Error saving placard: " . $e->getMessage() . "\n";
        }
    }
}
?>
