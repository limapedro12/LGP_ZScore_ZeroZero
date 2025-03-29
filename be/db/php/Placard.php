<?php
class Placard {
    private $id;
    private $title;
    private $description;

    public function __construct($title, $description) {
        $this->title = $title;
        $this->description = $description;
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
