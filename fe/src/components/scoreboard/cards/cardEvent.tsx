import React from 'react';
import EventDisplay from '../eventDisplay';
import { Sport, CardTypeForSport, getCardIconPath } from '../../../utils/cardUtils';
import '../../../styles/sliderComponents.scss';

interface CardEventProps<S extends Sport> {
  sport: S;
  playerName: string;
  playerNumber?: number;
  cardType: CardTypeForSport<S>;
  team: 'home' | 'away';
  teamColor?: string;
}

const CardEvent = <S extends Sport>({
    sport,
    playerName,
    playerNumber,
    cardType,
    team,
    teamColor,
}: CardEventProps<S>) => {

    const renderCardIcon = (cardType: CardTypeForSport<S>) => {
        const cardIconSrc = getCardIconPath(sport, cardType);

        return cardIconSrc ? (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div
                    className="card-icon-wrapper"
                    style={{
                        height: '3.5rem',
                        width: '2.5rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={cardIconSrc}
                        alt={`${cardType} card for ${sport}`}
                        className="img-fluid"
                        style={{
                            height: '100%',
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                </div>
            </div>
        ) : (
            <span className="badge bg-secondary p-2">?</span>
        );
    };

    return (
        <EventDisplay
            playerName={playerName}
            playerNumber={playerNumber}
            team={team}
            rightElement={renderCardIcon(cardType)}
            teamColor={teamColor}
        />
    );
};

export default CardEvent;
