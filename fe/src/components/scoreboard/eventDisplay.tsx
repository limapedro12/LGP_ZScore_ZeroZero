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
  teamColor?: string;
}

const EventDisplay: React.FC<EventDisplayProps> = ({
    playerName,
    playerNumber,
    team,
    rightElement,
    compact = false,
    teamColor,
}) => {
    const small = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });
    let isCompact = compact;

    if (small) {
        isCompact = false;
    }

    const hasPlayerName = Boolean(playerName && playerName.trim() !== '');

    let jerseyWidthClass = 'w-25';
    let displayWidthClass = 'w-25';
    let containerJustifyClass = team === 'home' ? 'justify-content-start' : 'justify-content-end';

    if (!hasPlayerName) {
        jerseyWidthClass = 'w-50';
        displayWidthClass = 'w-50';
        containerJustifyClass = 'justify-content-center';
    }

    const jerseyElement = (
        <div className={`${jerseyWidthClass} d-flex align-items-center justify-content-center`}>
            <PlayerJersey number={playerNumber} color={teamColor} hideIcon={small} />
        </div>
    );

    let justifyClass;
    if (!isCompact) {
        justifyClass = 'justify-content-center';
    } else if (team === 'home') {
        justifyClass = 'justify-content-start';
    } else {
        justifyClass = 'justify-content-end';
    }

    const nameElement = hasPlayerName ? (
        <div className={`w-75 d-flex align-items-center ${justifyClass} text-white ms-2 overflow-hidden`}>
            <span className="player-name fw-bold text-truncate">
                {playerName}
            </span>
        </div>
    ) : null;

    let displayJustifyClass = '';
    if (!hasPlayerName) {
        displayJustifyClass = 'justify-content-center';
    } else if (team === 'home') {
        displayJustifyClass = 'justify-content-start ps-2';
    } else {
        displayJustifyClass = 'justify-content-end pe-2';
    }

    const displayElement = (
        <div className={`${displayWidthClass} d-flex align-items-center ${displayJustifyClass}`}>
            {rightElement}
        </div>
    );

    return (
        <div className={`d-flex align-items-center w-100 ${containerJustifyClass}`}>
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
