<?php
abstract class AbstractPlayer {
    protected $id;
    protected $name;
    protected $position;
    protected $number;
    protected $team;
    protected $type;

    public function __construct(int $id = 0, string $name = "", string $position = "", int $number = 0, ?AbstractTeam $team = null, string $type = "") {
        $this->id = $id;
        $this->name = $name;
        $this->position = $position;
        $this->number = $number;
        $this->team = $team;
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

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function getPosition() {
        return $this->position;
    }

    public function setPosition($position) {
        $this->position = $position;
    }

    public function getNumber() {
        return $this->number;
    }

    public function setNumber($number) {
        $this->number = $number;
    }

    public function getType() {
        return $this->type;
    }

    public function setType($type) {
        $this->type = $type;
    }

    public function getTeam() {
        return $this->team;
    }

    public function setTeam($team) {
        $this->team = $team;
    }
}
?>
