<?php
abstract class AbstractPlacard {
    protected $id;
    protected $firstTeam;
    protected $secondTeam;
    protected $isFinished;
    protected $sport;

    public function __construct(?AbstractTeam $firstTeam = null, ?AbstractTeam $secondTeam = null, bool $isFinished = false, string $sport = "") {
        $this->firstTeam = $firstTeam;
        $this->secondTeam = $secondTeam;
        $this->isFinished = $isFinished;
        $this->sport = $sport;
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

    public function getsport() {
        return $this->sport;
    }

    public function setSport($sport) {
        $this->sport = $sport;
    }
}
?>
