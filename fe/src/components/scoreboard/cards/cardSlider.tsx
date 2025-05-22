import React, { useState, useEffect, useCallback } from 'react';
import { Sport, CardTypeForSport } from '../../../utils/cardUtils';
import apiManager from '../../../api/apiManager';
import BaseSlider from '../baseSlider';
import '../../../styles/sliderComponents.scss';
import CardEvent from './cardEvent';
import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS } from '../../../media-queries';

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
    const small = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });


    const fetchAndSetCards = useCallback(async () => {
        if (!placardId || !sport) {
            setDisplayedCards([]);
            return;
        }
        try {
            const [cardResponse, playersResponse] = await Promise.all([
                apiManager.getCards(placardId, sport),
                apiManager.getTeamPlayers(),
            ]);

            const allPlayers = Array.isArray(playersResponse) ? playersResponse : [];

            const sortedApiCards = cardResponse.cards.sort((a, b) => b.timestamp - a.timestamp);
            const teamFilteredCards = sortedApiCards.filter((apiCard) => apiCard.team === team);


            const transformedEvents: TransformedCardEventData[] = teamFilteredCards.map((apiCard) => {
                const player = allPlayers.find((p) => p.player_id === apiCard.playerId);
                return {
                    id: apiCard.eventId,
                    playerName: player ? player.player_name : `Player ${apiCard.playerId}`,
                    playerNumber: player ? Number(player.player_number) : undefined,
                    cardType: apiCard.cardType,
                };
            });

            setDisplayedCards(transformedEvents.slice(0, MAX_EVENTS_TO_DISPLAY));
        } catch (error) {
            console.error('Error fetching card events or team players:', error);
            setDisplayedCards([]);
        }
    }, [placardId, sport, team]);

    useEffect(() => {
        fetchAndSetCards();
        const intervalId = setInterval(fetchAndSetCards, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndSetCards]);


    return (
        <BaseSlider title="Cartões" className="card-slider">
            <div className="player-scores-list w-100 d-flex flex-column gap-2">
                {                    displayedCards.map((eventData) => (
                    <div key={eventData.id} className="player-score-item">
                        <CardEvent
                            sport={sport}
                            playerName={!small ? eventData.playerName : '' }
                            playerNumber={eventData.playerNumber}
                            cardType={eventData.cardType as CardTypeForSport<typeof sport>}
                            team={team}
                        />
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default CardSlider;
