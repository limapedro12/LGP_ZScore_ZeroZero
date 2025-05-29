import * as React from 'react';
import EventDisplay from '../eventDisplay';

interface FoulEventProps {
    playerName?: string;
    playerNumber?: number;
    team: 'home' | 'away';
    teamColor?: string;
    foulsCommitted?: number;
    playerId: string | number;
}

const FoulEvent: React.FC<FoulEventProps> = ({
    playerName,
    playerNumber,
    team,
    teamColor,
    foulsCommitted = 0,
    playerId,
}) => {
    const renderFoulDotsDisplay = () => {
        const dots = [];
        const totalDots = 5;
        for (let i = 0; i < totalDots; i++) {
            dots.push(
                <span
                    key={`dot-${playerId}-${i}`}
                    className={`foul-dot-display ${i < foulsCommitted ? 'committed' : 'available'}`}
                />
            );
        }
        return (
            <div
                className={`foul-dots-display-container${team === 'away' ? ' reverse' : ''}`}
            >
                {dots}
            </div>
        );
    };

    return (
        <EventDisplay
            playerName={playerName}
            playerNumber={playerNumber}
            team={team}
            teamColor={teamColor}
            rightElement={renderFoulDotsDisplay()}
        />
    );
};

export default FoulEvent;
