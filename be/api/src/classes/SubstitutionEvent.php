<?php
require_once 'AbstractEvent.php';
require_once 'AbstractPlayer.php';

class SubstitutionEvent extends AbstractEvent {
    private AbstractPlayer $playerIn;
    private AbstractPlayer $playerOut;

    public function __construct(?string $time, ?string $sport, AbstractPlacard $placard,
                                AbstractPlayer $playerIn, AbstractPlayer $playerOut) {
        parent::__construct($time, $sport, $placard);
        $this->playerIn = $playerIn;
        $this->playerOut = $playerOut;
    }

    public function getPlayers() : array{
        return [
            'playerIn' => $this->playerIn,
            'playerOut' => $this->playerOut
        ];
    }

    public function setPlayerIn(AbstractPlayer $playerIn) : void {
        $this->playerIn = $playerIn;
    }

    public function setPlayerOut() : void {
        $this->playerOut = $this->playerIn;
    }
    
}

?>