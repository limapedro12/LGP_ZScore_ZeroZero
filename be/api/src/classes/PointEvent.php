<?php
require_once 'AbstractEvent.php';

class PointEvent extends AbstractEvent {
    private $teamId;
    private $points;

    public function __construct($time = null, ?string $sport = null, ?AbstractPlacard $placard = null, ?int $teamId = null, int $points = 0) {
        parent::__construct($time, $sport, $placard);
        $this->teamId = $teamId;
        $this->points = $points;
    }

    public function loadFromDatabase($conn, $id = null) {}

    public function saveToDatabase($conn) {}

    public function getTeamId() {
        return $this->teamId;
    }

    public function setTeamId($teamId) {
        $this->teamId = $teamId;
    }

    public function getPoints() {
        return $this->points;
    }

    public function setPoints($points) {
        $this->points = $points;
    }
}
?>