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

    public function loadFromDatabase($pdo, $id = null) {}

    public function saveToDatabase($pdo) {}
}
?>
