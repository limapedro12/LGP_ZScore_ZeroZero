<?php
require_once 'AbstractTeam.php';

class VolleyballTeam extends AbstractTeam {
    public function __construct(int $id = 0, string $name = "", string $logoURL = "", array $players = []) {
        parent::__construct($id, $name, $logoURL, $players, $sport = "Volleyball");
    }

    public function loadFromDatabase($conn, $id) {}

    public function saveToDatabase($conn) {}
}
?>
