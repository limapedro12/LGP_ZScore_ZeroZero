import React, { ReactNode } from 'react';
import PlayerJersey from '../playerJersey';

interface EventDisplayProps {
  playerName?: string;
  playerNumber?: number;
  team: 'home' | 'away';
  rightElement: ReactNode;
}

const EventDisplay: React.FC<EventDisplayProps> = ({
    playerName,
    playerNumber,
    team,
    rightElement,
}) => {
    const jerseyElement = (
        <>
            <div className="w-50 d-flex d-lg-none align-items-center justify-content-center">
                <PlayerJersey number={playerNumber} />
            </div>
            <div className="w-25 d-none d-lg-flex align-items-center justify-content-center">
                <PlayerJersey number={playerNumber} />
            </div>
        </>
    );

    const nameElement = playerName ? (
        <div className="w-50 w-lg-25 d-flex align-items-center justify-content-center text-white">
            <span className="fw-bold small text-truncate">
                {playerName}
            </span>
        </div>
    ) : null;

    const displayElement = (
        <>
            <div
                className={`w-25 d-flex d-lg-none align-items-center ${
                    team === 'home' ? 'justify-content-start ps-2' : 'justify-content-end pe-2'
                }`}
            >
                {rightElement}
            </div>
            <div
                className={`w-25 d-none d-lg-flex align-items-center ${
                    team === 'home' ? 'justify-content-start ps-2' : 'justify-content-end pe-2'}`}
            >
                {rightElement}
            </div>
        </>
    );

    return (
        <div className={`d-flex align-items-center w-100 ${team === 'home' ? 'justify-content-start' : 'justify-content-end'}`}>
            {team === 'home' ? (
                <>
                    {jerseyElement}
                    {nameElement}
                    {displayElement}
                </>
            ) : (
                <>
                    {displayElement}
                    {nameElement}
                    {jerseyElement}
                </>
            )}
        </div>
    );
};

export default EventDisplay;
