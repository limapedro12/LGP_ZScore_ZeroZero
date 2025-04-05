<?php
require_once 'AbstractPlacard.php';

class VolleyballPlacard extends AbstractPlacard {
    private $currentSet;
    private $availableTimeOutsFirst;
    private $availableTimeOutsSecond;
    private $isTimeOut;
    private $setRes = []; // Array of set results [setNumber] => [pointsFirst, pointsSecond])

    public function __construct($firstTeamId = 0, $secondTeamId = 0, $isFinished = false, $currentSet = 0, $availableTimeOutsFirst = 0, $availableTimeOutsSecond = 0, $isTimeOut = false) {
        parent::__construct($firstTeamId, $secondTeamId, $isFinished, $type = "Volleyball");
        $this->currentSet = $currentSet;
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
        $this->isTimeOut = $isTimeOut;
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}

    public function addSetResult($setNumber, $pointsFirst, $pointsSecond) {
        $res = [
            'pointsFirst' => $pointsFirst,
            'pointsSecond' => $pointsSecond
        ];
        $this->setRes[$setNumber] = $res;
    }

    public function getSetNumber($setNumber) {
        return $this->setRes[$setNumber];
    }

    public function getCurrentSet() {
        return $this->currentSet;
    }

    public function setCurrentSet($currentSet) {
        $this->currentSet = $currentSet;
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

    public function getSetRes() {
        return $this->setRes;
    }

    public function setSetRes($setRes) {
        $this->setRes = $setRes;
    }
}
?>
