<?php
require_once 'AbstractTeam.php';

class FutsalTeam extends AbstractTeam {
    public function __construct(int $id = 0, string $name = "", string $logoURL = "", array $players = []) {
        parent::__construct($id, $players, $name, $logoURL, $type = "Volleyball");
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}
}
?>
