<?php
require_once 'AbstractEvent.php';

class CardEvent extends AbstractEvent {
    private $player;
    private $cardColor;

    public function __construct($time = null, ?string $sport = null, ?AbstractPlacard $placard = null, ?AbstractPlayer $player = null, string $cardColor = null) {
        parent::__construct($time, $sport, $placard);
        $this->player = $player;
        $this->cardColor = $cardColor;
    }

    public function loadFromDatabase($conn, $id = null) {}

    public function saveToDatabase($conn) {}

    public function getPlayer() {
        return $this->player;
    }

    public function setPlayer($player) {
        $this->player = $player;
    }

    public function getCardColor() {
        return $this->cardColor;
    }

    public function setCardColor($cardColor) {
        $this->cardColor = $cardColor;
    }
}
?>
