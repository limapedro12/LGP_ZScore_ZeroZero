<?php
require_once 'AbstractTeam.php';

class FutsalTeam extends AbstractTeam {
    public function __construct($id = 0, $players = []) {
        parent::__construct($id, $type = "Futsal", $players);
    }
}
?>
