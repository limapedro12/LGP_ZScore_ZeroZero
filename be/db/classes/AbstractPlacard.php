<?php
abstract class AbstractPlacard {
    protected $id;
    protected $firstTeamId;
    protected $secondTeamId;
    protected $isFinished;
    protected $type;

    public function __construct($firstTeamId = 0, $secondTeamId = 0, $isFinished = false, $type = "") {
        $this->firstTeamId = $firstTeamId;
        $this->secondTeamId = $secondTeamId;
        $this->isFinished = $isFinished;
        $this->type = $type;
    }

    public function loadFromDatabase($pdo, $id) {}

    public function saveToDatabase($pdo) {}
}
?>
