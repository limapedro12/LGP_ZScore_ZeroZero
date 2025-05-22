import React, { useState, useEffect, useCallback } from 'react';
import { Sport, CardTypeForSport } from '../../../utils/cardUtils';
import apiManager, { ApiGame, ApiPlayer } from '../../../api/apiManager';
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
            const placardInfo: ApiGame = await apiManager.getPlacardInfo(placardId, sport);
            if (!placardInfo) {
                console.error('Failed to fetch placard info');
                setDisplayedCards([]);
                return;
            }

            const teamIdForLineup = team === 'home' ? placardInfo.firstTeamId : placardInfo.secondTeamId;

            if (!teamIdForLineup) {
                console.error(`Could not determine team ID for ${team} team from placard ${placardId}.`);
                setDisplayedCards([]);
                return;
            }

            const [cardResponse, playersResponse] = await Promise.all([
                apiManager.getCards(placardId, sport),
                apiManager.getTeamLineup(placardId, teamIdForLineup),
            ]);

            console.log('Card response:', cardResponse);
            console.log('Players response:', playersResponse);

            const allPlayers: ApiPlayer[] = Array.isArray(playersResponse) ? playersResponse : [];

            const sortedApiCards = cardResponse.cards.sort((a, b) => b.timestamp - a.timestamp);
            const teamFilteredCards = sortedApiCards.filter((apiCard) => apiCard.team === team);

            const transformedEvents: TransformedCardEventData[] = teamFilteredCards.map((apiCard) => {
                const player = allPlayers.find((p) => parseInt(p.playerId, 10) === parseInt(apiCard.playerId, 10));
                return {
                    id: apiCard.eventId,
                    playerName: player ? player.name : `Player ${apiCard.playerId}`,
                    playerNumber: player && player.number ? Number(player.number) : undefined,
                    cardType: apiCard.cardType,
                };
            });

            setDisplayedCards(transformedEvents.slice(0, MAX_EVENTS_TO_DISPLAY));
        } catch (error) {
            console.error('Error fetching card events or team lineup:', error);
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
