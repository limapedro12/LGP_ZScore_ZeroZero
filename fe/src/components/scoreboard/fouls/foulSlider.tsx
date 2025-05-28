// src/components/FoulSlider.tsx

import React, { useState, useEffect, useCallback } from 'react';
import apiManager, { Sport, ApiPlayer } from '../../../api/apiManager';
import BaseSlider from '../baseSlider';
import FoulEvent from './foulEvent';
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
    players?: ApiPlayer[];
    teamColor?: string;
    onComplete?: () => void;
}

const FoulSlider: React.FC<FoulSliderProps> = ({
    sport,
    team,
    placardId,
    players = [],
    teamColor,
    onComplete,
}) => {
    const [foulsCountByPlayer, setFoulsCountByPlayer] = useState<Record<string, number>>({});
    const PLAYERS_PER_PAGE = 8;
    const totalPages = Math.ceil(players.length / PLAYERS_PER_PAGE);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [hasCompletedCycle, setHasCompletedCycle] = useState(false);

    const fetchAndSetFouls = useCallback(async () => {
        if (!placardId || !sport) {
            return;
        }
        try {
            const response = await apiManager.getFouls(placardId, sport);
            const teamFilteredFouls = response.fouls.filter((apiFoul) => apiFoul.team === team);

            const counts: Record<string, number> = {};
            for (const foul of teamFilteredFouls) {
                const pId = String(foul.playerId);
                counts[pId] = (counts[pId] || 0) + 1;
            }
            setFoulsCountByPlayer(counts);
        } catch (error) {
            console.error('Error fetching foul events:', error);
            setFoulsCountByPlayer({});
        }
    }, [placardId, sport, team, players]);

    useEffect(() => {
        fetchAndSetFouls();
        const intervalId = setInterval(fetchAndSetFouls, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndSetFouls]);

    useEffect(() => {
        if (totalPages <= 1) {
            const timeoutId = setTimeout(() => {
                setHasCompletedCycle(true);
            }, 10000);

            return () => clearTimeout(timeoutId);
        }

        const pageInterval = setInterval(() => {
            setCurrentPageIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % totalPages;
                if (nextIndex === 0) {
                    setHasCompletedCycle(true);
                }
                return nextIndex;
            });
        }, 10000 / totalPages);

        return () => clearInterval(pageInterval);
    }, [totalPages]);


    useEffect(() => {
        if (hasCompletedCycle && onComplete) {
            onComplete();
        }
    }, [hasCompletedCycle, onComplete]);

    const currentPagePlayers = players.slice(
        currentPageIndex * PLAYERS_PER_PAGE,
        (currentPageIndex + 1) * PLAYERS_PER_PAGE
    );
    const pageIndicator = totalPages > 1 ? `${currentPageIndex + 1}/${totalPages}` : '';

    return (
        <BaseSlider title={`Faltas ${pageIndicator}`} className="foul-slider">
            <div className="squad-list w-100 d-flex flex-column">
                {currentPagePlayers.length > 0 ? (
                    currentPagePlayers.map((player) => {
                        const committedFouls = foulsCountByPlayer[String(player.playerId)] || 0;
                        return (
                            <div key={player.playerId} className="squad-player-item">
                                <FoulEvent
                                    playerId={player.playerId}
                                    playerNumber={Number(player.number)}
                                    playerName={player.name}
                                    team={team}
                                    teamColor={teamColor}
                                    foulsCommitted={committedFouls}
                                />
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-2" style={{ color: 'white' }}>
                        Nenhuma falta registrada
                    </div>
                )}
            </div>
        </BaseSlider>
    );
};

export default FoulSlider;
