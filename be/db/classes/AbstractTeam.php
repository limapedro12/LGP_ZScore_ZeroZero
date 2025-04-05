<?php
abstract class AbstractTeam {
    protected $id;
    protected $players;
    protected $type;

    public function __construct($id = 0, $type = "", $players = []) {
        $this->id = $id;
        $this->type = $type;
        $this->players = $players;
    }

    public function getId() {
        return $this->id;
    }

    public function setId($id) {
        $this->id = $id;
    }

    public function getPlayers() {
        return $this->players;
    }

    public function setPlayers($players) {
        $this->players = $players;
    }

    public function getType() {
        return $this->type;
    }

    public function setType($type) {
        $this->type = $type;
    }
}
?>
