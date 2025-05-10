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
        <>
            <div className="w-50 d-flex d-lg-none align-items-center justify-content-center">
                <PlayerJersey number={playerNumber} />
            </div>
            <div className="w-25 d-none d-lg-flex align-items-center justify-content-center">
                <PlayerJersey number={playerNumber} />
            </div>
        </>
    );

    const nameElementAlignClass = team === 'home' ? 'justify-content-start' : 'justify-content-end';
    const nameElement = (
        <div className={`w-50 w-lg-25 d-flex align-items-center text-center text-white ${nameElementAlignClass}`}>
            <span className="fw-bold small text-truncate">
                {playerName}
            </span>
        </div>
    );

    const cardIconElement = (
        <>
            <div
                className={`w-25 d-flex d-lg-none align-items-center ${
                    team === 'home' ? 'justify-content-start ps-2' : 'justify-content-end pe-2'
                }`}
            >
                {cardIconSrc ? (
                    <img
                        src={cardIconSrc}
                        alt={`${cardType} card for ${sport}`}
                        className="img-fluid rounded w-75"
                    />
                ) : (
                    <span className="badge bg-secondary p-2">?</span>
                )}
            </div>
            <div
                className={`w-25 d-none d-lg-flex align-items-center ${
                    team === 'home' ? 'justify-content-start ps-2' : 'justify-content-end pe-2'}`}
            >
                {cardIconSrc ? (
                    <img
                        src={cardIconSrc}
                        alt={`${cardType} card for ${sport}`}
                        className="img-fluid rounded w-50"
                    />
                ) : (
                    <span className="badge bg-secondary p-2">?</span>
                )}
            </div>
        </>

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
