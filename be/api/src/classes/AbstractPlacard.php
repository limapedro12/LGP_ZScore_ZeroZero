<?php
abstract class AbstractPlacard {
    protected $id;
    protected $firstTeam;
    protected $secondTeam;
    protected $isFinished;
    protected $sport;
    protected $events;

    public function __construct(?AbstractTeam $firstTeam = null, ?AbstractTeam $secondTeam = null, bool $isFinished = false, string $sport = "") {
        $this->firstTeam = $firstTeam;
        $this->secondTeam = $secondTeam;
        $this->isFinished = $isFinished;
        $this->sport = $sport;
        $this->events = [];
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getFirstTeam() {
        return $this->firstTeam;
    }

    public function setFirstTeam($firstTeam) {
        $this->firstTeam = $firstTeam;
    }

    public function getSecondTeam() {
        return $this->secondTeam;
    }

    public function setSecondTeam($secondTeam) {
        $this->secondTeam = $secondTeam;
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

    public function getEvents() {
        return $this->events;
    }

    public function addEvent(?AbstractEvent $event) {
        $this->events[] = $event;
    }
}
?>
