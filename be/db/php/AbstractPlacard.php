<?php
abstract class AbstractPlacard {
    protected $id;
    protected $firstTeamId;
    protected $secondTeamId;
    protected $isFinished;
    protected $type;

    public function __construct($pdo, $id = null) {
        if ($id !== null) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM AbstractPlacard WHERE id = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $this->id = $result['id'];
                    $this->firstTeamId = $result['firstTeamId'];
                    $this->secondTeamId = $result['secondTeamId'];
                    $this->isFinished = $result['isFinished'];
                    $this->type = $result['type'];
                } else {
                    throw new Exception("AbstractPlacard with ID $id not found.");
                }
            } catch (Exception $e) {
                echo "Error loading AbstractPlacard: " . $e->getMessage() . "\n";
            }
        }
    }

    public function saveToDatabase($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO AbstractPlacard (firstTeamId, secondTeamId, isFinished, type) VALUES (:firstTeamId, :secondTeamId, :isFinished, :type)");
            $stmt->bindParam(':firstTeamId', $this->firstTeamId);
            $stmt->bindParam(':secondTeamId', $this->secondTeamId);
            $stmt->bindParam(':isFinished', $this->isFinished);
            $stmt->bindParam(':type', $this->type);
            $stmt->execute();
            $this->id = $pdo->lastInsertId();
            echo "AbstractPlacard saved successfully with ID: " . $this->id . "\n";
        } catch (PDOException $e) {
            echo "Error saving AbstractPlacard: " . $e->getMessage() . "\n";
        }
    }
}
?>
