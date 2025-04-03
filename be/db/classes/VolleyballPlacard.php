<?php
require_once 'AbstractPlacard.php';

class VolleyballPlacard extends AbstractPlacard {
    private $currentSet;
    private $availableTimeOutsFirst;
    private $availableTimeOutsSecond;
    private $isTimeOut;
    private $setRes = []; // Array of set results as pairs (setNumber, [pointsFirst, pointsSecond])

    public function __construct($firstTeamId = 0, $secondTeamId = 0, $isFinished = false, $currentSet = 0, $availableTimeOutsFirst = 0, $availableTimeOutsSecond = 0, $isTimeOut = false) {
        parent::__construct($firstTeamId, $secondTeamId, $isFinished, $type = "Volleyball");
        $this->currentSet = $currentSet;
        $this->availableTimeOutsFirst = $availableTimeOutsFirst;
        $this->availableTimeOutsSecond = $availableTimeOutsSecond;
        $this->isTimeOut = $isTimeOut;
    }

    public function loadFromDatabase($pdo, $id) {}

    public function saveToDatabase($pdo) {}

    public function addSetResult($setNumber, $pointsFirst, $pointsSecond) {
        $this->setRes[] = [
            'setNumber' => $setNumber,
            'pointsFirst' => $pointsFirst,
            'pointsSecond' => $pointsSecond
        ];
    }

    public function getSetResults() {
        return $this->setRes;
    }
}
?>
