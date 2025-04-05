<?php
require_once 'AbstractPlacard.php';
require_once 'FutsalTeam.php';

class FutsalPlacard extends AbstractPlacard {
    private $currentGoalsFirstTeam;
    private $currentGoalsSecondTeam;
    private $numberFoulsFirst;
    private $numberFoulsSecond;
    private $availableTimeOutsFirst;
    private $availableTimeOutsSecond;
    private $isTimeOut;
    private $isTimeStopped;

    public function __construct(?FutsalTeam $firstTeam = null, ?FutsalTeam $secondTeam = null, bool $isFinished = false, int $currentGoalsFirstTeam = 0, int $currentGoalsSecondTeam = 0, int $numberFoulsFirst = 0, int $numberFoulsSecond = 0, int $availableTimeOutsFirst = 0, int $availableTimeOutsSecond = 0, bool $isTimeOut = false, bool $isTimeStopped = false) {
        parent::__construct($firstTeam, $secondTeam, $isFinished, $type = "Futsal");
        $this->currentGoalsFirstTeam = $currentGoalsFirstTeam;
        $this->currentGoalsSecondTeam = $currentGoalsSecondTeam;
        $this->numberFoulsFirst = $numberFoulsFirst;
        $this->numberFoulsSecond = $numberFoulsSecond;
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
        $this->isTimeOut = $isTimeOut;
        $this->isTimeStopped = $isTimeStopped;
    }

    public function loadFromDatabase($conn, $id = null) {}

    public function saveToDatabase($conn) {}

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
