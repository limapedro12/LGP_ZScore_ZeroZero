import React, { useState, useEffect, useCallback } from 'react';
import CardEvent from './cardEvent';
import { Sport, CardTypeForSport } from '../../../utils/cardUtils';
import apiManager from '../../../api/apiManager';


export interface TransformedCardEventData {
  id: string | number;
  playerName: string;
  playerNumber: number;
  cardType: string;
}

interface CardSliderProps {
  sport: Sport;
  team: 'home' | 'away';
  placardId: string;
}

const CardSlider: React.FC<CardSliderProps> = ({ sport, team, placardId }) => {
    const [displayedCards, setDisplayedCards] = useState<Array<TransformedCardEventData>>([]);
    const MAX_EVENTS_TO_DISPLAY = 6;

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
                playerName: `Player ${apiCard.playerId} Nome longo`,
                playerNumber: 10,
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

    if (displayedCards.length === 0) {
        return null;
    }

    return (
        <div className={'d-flex flex-column w-100 h-100 gy-2 justify-content-around pb-2 overflow-y-auto'}>
            {displayedCards.map((eventData) => (
                <div
                    key={eventData.id}
                    className="w-100 d-flex justify-content-center align-items-center"
                >
                    <CardEvent
                        sport={sport}
                        cardType={eventData.cardType as CardTypeForSport<typeof sport>}
                        playerName={eventData.playerName}
                        playerNumber={eventData.playerNumber}
                        team={team}
                    />
                </div>
            ))}
        </div>
    );
};

export default CardSlider;
