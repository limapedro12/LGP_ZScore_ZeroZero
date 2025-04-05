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

    public function __construct($firstTeamId = 0, $secondTeamId = 0, $isFinished = false, $currentGoalsFirstTeam = 0, $currentGoalsSecondTeam = 0, $numberFoulsFirst = 0, $numberFoulsSecond = 0, $availableTimeOutsFirst = 0, $availableTimeOutsSecond = 0, $isTimeOut = false, $isTimeStopped = false) {
        parent::__construct($firstTeamId, $secondTeamId, $isFinished, $type = "Futsal");
        $this->currentGoalsFirstTeam = $currentGoalsFirstTeam;
        $this->currentGoalsSecondTeam = $currentGoalsSecondTeam;
        $this->numberFoulsFirst = $numberFoulsFirst;
        $this->numberFoulsSecond = $numberFoulsSecond;
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
        $this->isTimeOut = $isTimeOut;
        $this->isTimeStopped = $isTimeStopped;
    }

    public function loadFromDatabase($pdo, $id = null) {}

    public function saveToDatabase($pdo) {}

    public function getCurrentGoalsFirstTeam() {
        return $this->currentGoalsFirstTeam;
    }

    public function setCurrentGoalsFirstTeam($currentGoalsFirstTeam) {
        $this->currentGoalsFirstTeam = $currentGoalsFirstTeam;
    }

    public function getCurrentGoalsSecondTeam() {
        return $this->currentGoalsSecondTeam;
    }

    public function setCurrentGoalsSecondTeam($currentGoalsSecondTeam) {
        $this->currentGoalsSecondTeam = $currentGoalsSecondTeam;
    }

    public function getNumberFoulsFirst() {
        return $this->numberFoulsFirst;
    }

    public function setNumberFoulsFirst($numberFoulsFirst) {
        $this->numberFoulsFirst = $numberFoulsFirst;
    }

    public function getNumberFoulsSecond() {
        return $this->numberFoulsSecond;
    }

    public function setNumberFoulsSecond($numberFoulsSecond) {
        $this->numberFoulsSecond = $numberFoulsSecond;
    }

    public function getAvailableTimeOutsFirst() {
        return $this->availableTimeOutsFirst;
    }

    public function setAvailableTimeOutsFirst($availableTimeOutsFirst) {
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
    }

    public function getAvailableTimeOutsSecond() {
        return $this->availableTimeOutsSecond;
    }

    public function setAvailableTimeOutsSecond($availableTimeOutsSecond) {
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
    }

    public function getIsTimeOut() {
        return $this->isTimeOut;
    }

    public function setIsTimeOut($isTimeOut) {
        $this->isTimeOut = $isTimeOut;
    }

    public function getIsTimeStopped() {
        return $this->isTimeStopped;
    }

    public function setIsTimeStopped($isTimeStopped) {
        $this->isTimeStopped = $isTimeStopped;
    }
}
?>
