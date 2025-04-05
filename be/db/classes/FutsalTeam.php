<?php
require_once 'AbstractTeam.php';

class FutsalTeam extends AbstractTeam {
    public function __construct($id = 0, $name = "", $logoURL = "", $players = []) {
        parent::__construct($id, $players, $name, $logoURL, $type = "Voleibol");
    }

    public function loadFromDatabase($pdo, $id) {}

    public function saveToDatabase($pdo) {}
}
?>
