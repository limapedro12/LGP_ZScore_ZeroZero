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
     * @param string|null $sport The type of sport (e.g., 'futsal').
     * @param AbstractPlacard|null $placard The placard/game object (using null based on endpoint usage).
     * @param string|null $playerId The ID of the player.
     * @param string|null $teamId The ID of the team.
     * @param int|null $period The period number.
     */
    public function __construct(
        ?string $time = null,
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


    public function getPlayerId(): ?string {
        return $this->playerId;
    }

    public function getTeamId(): ?string {
        return $this->teamId;
    }

    public function getPeriod(): ?int {
        return $this->period;
    }

  
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
     * Note: Assumes ID is set externally using setId().
     * Note: 'gameId' needs to be added manually if stored in hash.
     *
     * @return array
     */
    public function toDataArray(): array {
         return [
            'foulId'   => $this->getId(),
             'gameId' => $this->getGameId(), 
            'gameType' => $this->getSport(), 
            'playerId' => $this->getPlayerId(),
            'teamId'   => $this->getTeamId(),
            'time'     => $this->getTime(), 
            'period'   => $this->getPeriod() !== null ? (string)$this->getPeriod() : null,

        ];
    }

     
}