<?php
require_once 'AbstractTeam.php';

class VoleibolTeam extends AbstractTeam {
    private $name;
    private $logoURL;

    public function __construct($id = 0, $name = "", $logoURL = "", $players = []) {
        parent::__construct($id, $type = "Voleibol", $players);
        $this->name = $name;
        $this->logoURL = $logoURL;
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
