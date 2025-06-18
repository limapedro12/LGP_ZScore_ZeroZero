import React from 'react';
import PlayerJersey from '../playerJersey';
import { Button } from 'react-bootstrap';

interface PlayerButtonProps {
  playerId: string;
  playerName: string;
  playerNumber?: number;
  onSelect: (playerId: string) => void;
  isSelected: boolean;
}

const PlayerButton: React.FC<PlayerButtonProps> = ({
    playerId,
    playerName,
    playerNumber,
    onSelect,
    isSelected,
}) =>

    (
        <Button
            variant={isSelected ? 'light' : 'dark'}
            onClick={() => onSelect(playerId)}
            className={`d-flex align-items-center w-75  p-2 rounded ${!isSelected ? 'bg-transparent border-0' : ''}`}
        >
            <div className="d-none d-md-flex align-items-center w-100">
                <div className="d-flex align-items-center justify-content-center" style={{ width: '33%' }}>
                    <PlayerJersey number={playerNumber} />
                </div>
                <span className="fs-5 fw-medium text-truncate">
                    {playerName}
                </span>
            </div>

            <div className="d-flex d-md-none align-items-center w-100">
                <div className="d-flex align-items-center justify-content-center w-25">
                    <PlayerJersey number={playerNumber} />
                </div>
                <span className="fs-5 fw-medium text-truncate">
                    {playerName}
                </span>
            </div>
        </Button>
    )
;

export default PlayerButton;
