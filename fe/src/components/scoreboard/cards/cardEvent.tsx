import React from 'react';
import PlayerJersey from '../../playerJersey';
import { Sport, CardTypeForSport, getCardIconPath } from '../../../utils/cardUtils';

interface CardEventProps<S extends Sport> {
  sport: S;
  playerName: string;
  playerNumber: number; // For the PlayerJersey component
  cardType: CardTypeForSport<S>;
  team: 'home' | 'away'; // Added team prop
}

const CardEvent = <S extends Sport>({
    sport,
    playerName,
    playerNumber,
    cardType,
    team,
}: CardEventProps<S>) => {
    const cardIconSrc = getCardIconPath(sport, cardType);

    const jerseyElement = (
        <div className={`col-3 d-flex align-items-center ${team === 'home' ? 'justify-content-start' : 'justify-content-end'}`}>
            <PlayerJersey number={playerNumber} />
        </div>
    );

    const nameElement = (
        <div className="col-4 text-center fw-bold text-white">
            {playerName}
        </div>
    );

    const cardIconElement = (
        <div className={`col-auto d-flex align-items-center ${team === 'home' ? 'ps-2' : 'pe-2'}`}>
            {cardIconSrc ? (
                <img
                    src={cardIconSrc}
                    alt={`${cardType} card for ${sport}`}
                    className="img-fluid rounded"
                />
            ) : (
                <span className="badge bg-secondary p-2">?</span>
            )}
        </div>
    );

    return (
        <div className={`d-flex align-items-center w-100 ${team === 'home' ? 'justify-content-start' : 'justify-content-end'}`}>
            {team === 'home' ? (
                <>
                    {jerseyElement}
                    {nameElement}
                    {cardIconElement}
                </>
            ) : (
                <>
                    {cardIconElement}
                    {nameElement}
                    {jerseyElement}
                </>
            )}
        </div>
    );
};

export default CardEvent;
