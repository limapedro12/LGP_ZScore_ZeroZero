import React, { useState, useEffect, useCallback } from 'react';
import { Sport, CardTypeForSport, getCardIconPath } from '../../../utils/cardUtils';
import apiManager from '../../../api/apiManager';
import BaseSlider from '../baseSlider';
import EventDisplay from '../eventDisplay';
import '../../../styles/sliderComponents.scss';

export interface TransformedCardEventData {
  id: string | number;
  playerName: string;
  playerNumber?: number;
  cardType: string;
}

interface CardSliderProps {
  sport: Sport;
  team: 'home' | 'away';
  placardId: string;
}

const CardSlider: React.FC<CardSliderProps> = ({ sport, team, placardId }) => {
    const [displayedCards, setDisplayedCards] = useState<Array<TransformedCardEventData>>([]);
    const MAX_EVENTS_TO_DISPLAY = 5;

    const fetchAndSetCards = useCallback(async () => {
        if (!placardId || !sport) {
            setDisplayedCards([]);
            return;
        }
        try {
            const response = await apiManager.getCards(placardId, sport);
            const sortedApiCards = response.cards.sort((a, b) => b.timestamp - a.timestamp);
            const teamFilteredCards = sortedApiCards.filter((apiCard) => apiCard.team === team);

            const transformedEvents: TransformedCardEventData[] = teamFilteredCards.map((apiCard) => ({
                id: apiCard.eventId,
                playerName: `Player ${apiCard.playerId}`,
                playerNumber: Number(apiCard.playerId) || undefined,
                cardType: apiCard.cardType,
            }));

            setDisplayedCards(transformedEvents.slice(0, MAX_EVENTS_TO_DISPLAY));
        } catch (error) {
            console.error('Error fetching card events:', error);
            setDisplayedCards([]);
        }
    }, [placardId, sport, team]);

    useEffect(() => {
        fetchAndSetCards();
        const intervalId = setInterval(fetchAndSetCards, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndSetCards]);

    const renderCardIcon = (cardType: string) => {
        const cardIconSrc = getCardIconPath(sport, cardType as CardTypeForSport<typeof sport>);

        return cardIconSrc ? (
            <div className="d-flex justify-content-center align-items-center h-100">
                <div
                    className="card-icon-wrapper"
                    style={{
                        height: '2.5rem',
                        width: '1.75rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <img
                        src={cardIconSrc}
                        alt={`${cardType} card`}
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
        <BaseSlider title="Cartões" className="card-slider">
            <div className="player-scores-list w-100 d-flex flex-column gap-2">
                {                    displayedCards.map((eventData) => (
                    <div key={eventData.id} className="player-score-item">
                        <EventDisplay
                            playerName={eventData.playerName}
                            playerNumber={eventData.playerNumber}
                            team={team}
                            rightElement={renderCardIcon(eventData.cardType)}
                        />
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default CardSlider;
