import React, { ReactNode } from 'react';
import PlayerJersey from '../playerJersey';
import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS } from '../../media-queries';

interface EventDisplayProps {
  playerName?: string;
  playerNumber?: number;
  team: 'home' | 'away';
  rightElement?: ReactNode;
  compact?: boolean;
}

const EventDisplay: React.FC<EventDisplayProps> = ({
    playerName,
    playerNumber,
    team,
    rightElement,
    compact = false,
}) => {
    const homeColor = '#E83030';
    const awayColor = '#008057';
    const small = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });
    let isCompact = compact;

    if (small) {
        isCompact = false;
    }

    const jerseyColor = team === 'home' ? homeColor : awayColor;

    const jerseyElement = (
        <div className="w-25 d-flex align-items-center justify-content-center">
            <PlayerJersey number={playerNumber} color={jerseyColor} hideIcon={small} />
        </div>
    );

    let justifyClass;
    if (!isCompact) {
        console.log('not compact');
        justifyClass = 'justify-content-center';
    } else if (team === 'home') {
        justifyClass = 'justify-content-start';
    } else {
        justifyClass = 'justify-content-end';
    }

    const nameElement = playerName ? (
        <div className={`w-75 d-flex align-items-center ${justifyClass} text-white ms-2`}>
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
