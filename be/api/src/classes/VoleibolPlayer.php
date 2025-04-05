<?php
require_once 'AbstractPlayer.php';

class VolleyballPlayer extends AbstractPlayer {
    public function __construct($id = 0, $name = "", $position = "", $number = 0, $team = null) {
        parent::__construct($id, $name, $position, $number, $team, $type = "Volleyball");
    }
}
?>
