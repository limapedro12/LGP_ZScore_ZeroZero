<?php

require_once 'AbstractEvent.php';

 require_once 'AbstractPlayer.php';
 require_once 'AbstractTeam.php';

class FoulEvent extends AbstractEvent {

    protected ?string $playerId = null;
    protected ?string $teamId = null;
    protected ?int $period = null;

    /**
     * Constructor for FoulEvent.
     *
     * @param string|null $time The time within the game/period the foul occurred.
     * @param string|null $sport The type of sport (e.g., 'futsal'). <<-- ADICIONADO AQUI
     * @param AbstractPlacard|null $placard The placard/game object (using null based on endpoint usage). <<-- MOVIDO PARA 3º
     * @param string|null $playerId The ID of the player.
     * @param string|null $teamId The ID of the team.
     * @param int|null $period The period number.
     */
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

    /**
     * Helper method to convert FoulEvent properties to an array format,
     * similar to how data is stored in Redis hash.
     */
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

     /**
      * Get the sport type associated with the event.
      * (Assuming protected $sport exists and is set in AbstractEvent's constructor)
      * @return string|null
      */
     public function getSport(): ?string {
        return $this->sport; 
     }

     
     public function getGameId(): ?string {
         // Lógica para obter gameId, talvez do placard?
         // return $this->placard ? $this->placard->getId() : null;
         return null; // Exemplo
     }
     
}