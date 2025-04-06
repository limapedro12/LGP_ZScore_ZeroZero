<?php
abstract class AbstractTeam {
    protected $id;
    protected $players;
    protected $sport;
    protected $name;
    protected $logoURL;

    public function __construct(int $id = 0, string $name = "", string $logoURL = "", array $players = [], string $sport = "") {
        $this->id = $id;
        $this->name = $name;
        $this->logoURL = $logoURL;
        $this->sport = $sport;
        $this->players = $players;
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}

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

    public function getSport() {
        return $this->sport;
    }

    public function setSport($sport) {
        $this->sport = $sport;
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
