// src/components/FoulSlider.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Sport } from '../../../utils/cardUtils';
import apiManager from '../../../api/apiManager';
import BaseSlider from '../baseSlider';
import EventDisplay from '../eventDisplay';
import '../../../styles/sliderComponents.scss';

export interface TransformedFoulEventData {
  id: string | number;
  playerName: string;
  playerNumber?: number;
}

interface FoulSliderProps {
  sport: Sport;
  team: 'home' | 'away';
  placardId: string;
}

const FoulSlider: React.FC<FoulSliderProps> = ({ sport, team, placardId }) => {
    const [displayedFouls, setDisplayedFouls] = useState<Array<TransformedFoulEventData>>([]);
    const MAX_EVENTS_TO_DISPLAY = 5;

    const fetchAndSetFouls = useCallback(async () => {
        if (!placardId || !sport) {
            setDisplayedFouls([]);
            return;
        }
        try {
            const response = await apiManager.getFouls(placardId, sport);
            const sortedApiFouls = response.fouls.sort((a, b) => b.timestamp - a.timestamp);
            const teamFilteredFouls = sortedApiFouls.filter((apiFoul) => apiFoul.team === team);

            const transformedEvents: TransformedFoulEventData[] = teamFilteredFouls.map((apiFoul) => ({
                id: apiFoul.eventId,
                playerName: `Jogador ${apiFoul.playerId}`,
                playerNumber: Number(apiFoul.playerId) || undefined,
            }));

            setDisplayedFouls(transformedEvents.slice(0, MAX_EVENTS_TO_DISPLAY));
        } catch (error) {
            console.error('Error fetching foul events:', error);
            setDisplayedFouls([]);
        }
    }, [placardId, sport, team]);

    useEffect(() => {
        fetchAndSetFouls();
        const intervalId = setInterval(fetchAndSetFouls, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndSetFouls]);

    return (
        <BaseSlider title="Faltas" className="foul-slider">
            <div className="player-events-list w-100 d-flex flex-column gap-2">
                {displayedFouls.map((eventData) => (
                    <div key={eventData.id} className="player-event-item">
                        <EventDisplay
                            playerName={eventData.playerName}
                            playerNumber={eventData.playerNumber}
                            team={team}
                        />
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default FoulSlider;
