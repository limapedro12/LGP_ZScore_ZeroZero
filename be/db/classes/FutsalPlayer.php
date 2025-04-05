<?php
require_once 'AbstractPlayer.php';

class FutsalPlayer extends AbstractPlayer {
    public function __construct($id = 0, $name = "", $position = "", $number = 0, $team = null) {
        parent::__construct($id, $name, $position, $number, $team, $type = "Futsal");
    }

    public function loadFromDatabase($pdo, $id) {}

    public function saveToDatabase($pdo) {}
}
?>
