<?php
require_once 'AbstractEvent.php';

class CardEvent extends AbstractEvent {
    private $player;
    private $cardType;

    public function __construct($time = null, ?string $sport = null, ?AbstractPlacard $placard = null, ?AbstractPlayer $player = null, string $cardType = null) {
        parent::__construct($time, $sport, $placard);
        $this->player = $player;
        $this->cardType = $cardType;
    }

    public function loadFromDatabase($conn, $id = null) {}

    public function saveToDatabase($conn) {}

    public function getPlayer() {
        return $this->player;
    }

    public function setPlayer($player) {
        $this->player = $player;
    }

    public function getCardType() {
        return $this->cardType;
    }

    public function setCardType($cardType) {
        $this->cardType = $cardType;
    }
}
?>
