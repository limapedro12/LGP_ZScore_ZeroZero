<?php
require_once 'AbstractPlacard.php';

class VolleyballPlacard extends AbstractPlacard {
    private $currentSet;
    private $availableTimeOutsFirst;
    private $availableTimeOutsSecond;
    private $isTimeOut;

    public function __construct($pdo, $id = null) {
        parent::__construct($pdo, $id);
        if ($id !== null) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM VoleibolPlacard WHERE id = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $this->currentSet = $result['currentSet'];
                    $this->availableTimeOutsFirst = $result['availableTimeOutsFirst'];
                    $this->availableTimeOutsSecond = $result['availableTimeOutsSecond'];
                    $this->isTimeOut = $result['isTimeOut'];
                } else {
                    throw new Exception("VolleyballPlacard with ID $id not found.");
                }
            } catch (Exception $e) {
                echo "Error loading VolleyballPlacard: " . $e->getMessage() . "\n";
            }
        }
    }

    public function saveToDatabase($pdo) {
        parent::saveToDatabase($pdo);
        try {
            $stmt = $pdo->prepare("INSERT INTO VoleibolPlacard (abstractPlacardId, currentSet, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut) VALUES (:abstractPlacardId, :currentSet, :availableTimeOutsFirst, :availableTimeOutsSecond, :isTimeOut)");
            $stmt->bindParam(':abstractPlacardId', $this->id);
            $stmt->bindParam(':currentSet', $this->currentSet);
            $stmt->bindParam(':availableTimeOutsFirst', $this->availableTimeOutsFirst);
            $stmt->bindParam(':availableTimeOutsSecond', $this->availableTimeOutsSecond);
            $stmt->bindParam(':isTimeOut', $this->isTimeOut);
            $stmt->execute();
            echo "VolleyballPlacard saved successfully.\n";
        } catch (PDOException $e) {
            echo "Error saving VolleyballPlacard: " . $e->getMessage() . "\n";
        }
    }
}
?>
