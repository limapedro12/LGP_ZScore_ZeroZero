<?php

require_once 'AbstractEvent.php';

 require_once 'AbstractPlayer.php';
 require_once 'AbstractTeam.php';

class FoulEvent extends AbstractEvent {

    protected ?string $playerId = null;
    protected ?string $teamId = null;
    protected ?int $period = null;

    public function __construct( 
        ?string $time = null,         
        ?string $sport = null,          
        ?AbstractPlacard $placard = null, 
        ?string $playerId = null,      
        ?string $teamId = null,        
        ?int $period = null           
    ) {

        parent::__construct($time, $sport, $placard);
        $this->playerId = $playerId;
        $this->teamId = $teamId;
        $this->period = $period;
    }

    // --- Getters ---
    public function getPlayerId(): ?string {
        return $this->playerId;
    }

    public function getTeamId(): ?string {
        return $this->teamId;
    }

    public function getPeriod(): ?int {
        return $this->period;
    }

    // --- Setters ---
    public function setPlayerId(?string $playerId): void {
        $this->playerId = $playerId;
    }

    public function setTeamId(?string $teamId): void {
        $this->teamId = $teamId;
    }

    public function setPeriod(?int $period): void {
        $this->period = $period;
    }


    public function toDataArray(): array {
         $data = [
            'foulId'   => $this->getId(), 
            'gameId' => $this->getGameId(), 
            'gameType' => $this->getSport(),  
            'playerId' => $this->getPlayerId(),
            'teamId'   => $this->getTeamId(),
            'time'     => $this->getTime(),     
            'period'   => $this->getPeriod() !== null ? (string)$this->getPeriod() : null,
        ];

        return array_filter($data, fn($value) => !is_null($value));
    }


     public function getSport(): ?string {
        return $this->sport; 
     }

     
     public function getGameId(): ?string {
         // Lógica para obter gameId, talvez do placard?
         // return $this->placard ? $this->placard->getId() : null;
         return null; // Exemplo
     }
     
}