<?php
abstract class AbstractPlacard {
    protected $id;
    protected $firstTeam;
    protected $secondTeam;
    protected $isFinished;
    protected $type;

    public function __construct($firstTeam = null, $secondTeam = null, $isFinished = false, $type = "") {
        $this->firstTeam = $firstTeam;
        $this->secondTeam = $secondTeam;
        $this->isFinished = $isFinished;
        $this->type = $type;
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getFirstTeamId() {
        return $this->firstTeamId;
    }

    public function setFirstTeamId($firstTeamId) {
        $this->firstTeamId = $firstTeamId;
    }

    public function getSecondTeamId() {
        return $this->secondTeamId;
    }

    public function setSecondTeamId($secondTeamId) {
        $this->secondTeamId = $secondTeamId;
    }

    public function getIsFinished() {
        return $this->isFinished;
    }

    public function setIsFinished($isFinished) {
        $this->isFinished = $isFinished;
    }

    public function getType() {
        return $this->type;
    }

    public function setType($type) {
        $this->type = $type;
    }
}
?>
