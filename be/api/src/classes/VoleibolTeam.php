<?php
require_once 'AbstractTeam.php';

class VolleyballTeam extends AbstractTeam {
    public function __construct($id = 0, $name = "", $logoURL = "", $players = []) {
        parent::__construct($id, $players, $name, $logoURL, $type = "Volleyball");
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}
}
?>
