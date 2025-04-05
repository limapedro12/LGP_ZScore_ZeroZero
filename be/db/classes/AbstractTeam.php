<?php
abstract class AbstractTeam {
    protected $id;
    protected $players;
    protected $type;
    protected $name;
    protected $logoURL;

    public function __construct($id = 0, $name = "", $logoURL = "", $players = [], $type = "") {
        $this->id = $id;
        $this->name = $name;
        $this->logoURL = $logoURL;
        $this->type = $type;
        $this->players = $players;
    }

    public function loadFromDatabase($pdo, $id) {}

    public function saveToDatabase($pdo) {}

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

    public function getName() {
        return $this->name;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function getLogoURL() {
        return $this->logoURL;
    }

    public function setLogoURL($logoURL) {
        $this->logoURL = $logoURL;
    }
}
?>
