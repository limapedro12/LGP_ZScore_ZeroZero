<?php
require_once 'AbstractPlacard.php';

class FutsalPlacard extends AbstractPlacard {
    private $currentGoalsFirstTeam;
    private $currentGoalsSecondTeam;
    private $numberFoulsFirst;
    private $numberFoulsSecond;
    private $availableTimeOutsFirst;
    private $availableTimeOutsSecond;
    private $isTimeOut;
    private $isTimeStopped;

    public function __construct($firstTeamId = 0, $secondTeamId = 0, $isFinished = false, $currentGoalsFirstTeam = 0, $currentGoalsSecondTeam = 0, $numberFoulsFirst = 0, $numberFoulsSecond = 0, $currentTime = 0, $availableTimeOutsFirst = 0, $availableTimeOutsSecond = 0, $isTimeOut = false, $isTimeStopped = false) {
        parent::__construct($firstTeamId, $secondTeamId, $isFinished, $type = "Futsal");
        $this->currentGoalsFirstTeam = $currentGoalsFirstTeam;
        $this->currentGoalsSecondTeam = $currentGoalsSecondTeam;
        $this->numberFoulsFirst = $numberFoulsFirst;
        $this->numberFoulsSecond = $numberFoulsSecond;
        $this->currentTime = $currentTime;
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
        $this->isTimeOut = $isTimeOut;
        $this->isTimeStopped = $isTimeStopped;
    }

    public function loadFromDatabase($pdo, $id = null) {
        parent::loadFromDatabase($pdo, $id);
        if ($id !== null) {
            try {
                $stmt = $pdo->prepare("SELECT * FROM FutsalPlacard WHERE abstractPlacardId = :id");
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($result) {
                    $this->currentGoalsFirstTeam = $result['currentGoalsFirstTeam'];
                    $this->currentGoalsSecondTeam = $result['currentGoalsSecondTeam'];
                    $this->numberFoulsFirst = $result['numberFoulsFirst'];
                    $this->numberFoulsSecond = $result['numberFoulsSecond'];
                    $this->availableTimeOutsFirst = $result['availableTimeOutsFirst'];
                    $this->availableTimeOutsSecond = $result['availableTimeOutsSecond'];
                    $this->isTimeOut = $result['isTimeOut'];
                    $this->isTimeStopped = $result['isTimeStopped'];
                } else {
                    throw new Exception("FutsalPlacard with ID $id not found.");
                }
            } catch (Exception $e) {
                echo "Error loading FutsalPlacard: " . $e->getMessage() . "\n";
            }
        }
    }

    public function saveToDatabase($pdo) {
        parent::saveToDatabase($pdo);
        try {
            $stmt = $pdo->prepare("INSERT INTO FutsalPlacard (abstractPlacardId, currentGoalsFirstTeam, currentGoalsSecondTeam, numberFoulsFirst, numberFoulsSecond, availableTimeOutsFirst, availableTimeOutsSecond, isTimeOut, isTimeStopped) VALUES (:abstractPlacardId, :currentGoalsFirstTeam, :currentGoalsSecondTeam, :numberFoulsFirst, :numberFoulsSecond, :availableTimeOutsFirst, :availableTimeOutsSecond, :isTimeOut, :isTimeStopped)");
            $stmt->bindParam(':abstractPlacardId', $this->id);
            $stmt->bindParam(':currentGoalsFirstTeam', $this->currentGoalsFirstTeam);
            $stmt->bindParam(':currentGoalsSecondTeam', $this->currentGoalsSecondTeam);
            $stmt->bindParam(':numberFoulsFirst', $this->numberFoulsFirst);
            $stmt->bindParam(':numberFoulsSecond', $this->numberFoulsSecond);
            $stmt->bindParam(':availableTimeOutsFirst', $this->availableTimeOutsFirst);
            $stmt->bindParam(':availableTimeOutsSecond', $this->availableTimeOutsSecond);
            $stmt->bindParam(':isTimeOut', $this->isTimeOut);
            $stmt->bindParam(':isTimeStopped', $this->isTimeStopped);
            $stmt->execute();
            echo "FutsalPlacard saved successfully.\n";
        } catch (PDOException $e) {
            echo "Error saving FutsalPlacard: " . $e->getMessage() . "\n";
        }
    }
}
?>