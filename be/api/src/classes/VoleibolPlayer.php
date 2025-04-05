<?php
require_once 'AbstractPlayer.php';
require_once 'VolleyballTeam.php';

class VolleyballPlayer extends AbstractPlayer {
    public function __construct(int $id = 0, string $name = "", string $position = "", int $number = 0, ?VolleyballTeam $team = null) {
        parent::__construct($id, $name, $position, $number, $team, $type = "Volleyball");
    }
}
?>
