import React, { useState, useEffect, useCallback } from 'react';
import BaseSlider from '../baseSlider';
import EventDisplay from '../eventDisplay';
import apiManager from '../../../api/apiManager';
import PositionSigla from './positionSigla';
import '../../../styles/sliderComponents.scss';
import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS } from '../../../media-queries';


interface SquadSliderProps {
  team: 'home' | 'away';
  onComplete?: () => void;
  teamColor?: string;
}

interface Player {
  player_id: string;
  player_name: string;
  player_number: string;
  player_position: string;
  player_position_sigla: string;
  INTEAM: string;
}

const SquadSlider: React.FC<SquadSliderProps> = ({ team, onComplete, teamColor }) => {
    const [squadPlayers, setSquadPlayers] = useState<Player[]>([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
    const PLAYERS_PER_PAGE = 8;
    const small = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });


    const fetchSquadPlayers = useCallback(async () => {
        try {
            const response = await apiManager.getTeamPlayers();

            if (Array.isArray(response)) {
                setSquadPlayers(response);
            } else {
                console.error('Invalid response format from API:', response);
                setSquadPlayers([]);
            }
        } catch (error) {
            console.error('Error fetching squad players:', error);
            setSquadPlayers([]);
        }
    }, []);

    useEffect(() => {
        fetchSquadPlayers();

        const intervalId = setInterval(fetchSquadPlayers, 30000);

        return () => clearInterval(intervalId);
    }, [fetchSquadPlayers]);

    const totalPages = Math.ceil(squadPlayers.length / PLAYERS_PER_PAGE);

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
        }, 10000 / 3);

        return () => clearInterval(pageInterval);
    }, [totalPages]);

    useEffect(() => {
        if (hasCompletedCycle && onComplete) {
            onComplete();
        }
    }, [hasCompletedCycle, onComplete]);

    const currentPagePlayers = squadPlayers.slice(
        currentPageIndex * PLAYERS_PER_PAGE,
        (currentPageIndex + 1) * PLAYERS_PER_PAGE
    );

    const pageIndicator = totalPages > 1 ? `${currentPageIndex + 1}/${totalPages}` : '';

    return (
        <BaseSlider title={`Plantel ${pageIndicator}`} className="squad-slider">
            <div className="squad-list w-100 d-flex flex-column">
                {currentPagePlayers.length > 0 ? (
                    currentPagePlayers.map((player) => (
                        <div key={player.player_id} className="squad-player-item py-1">
                            <EventDisplay
                                playerName={player.player_name}
                                playerNumber={Number(player.player_number)}
                                team={team}
                                rightElement={
                                    !small ? <PositionSigla sigla={player.player_position_sigla} team={team} /> : undefined
                                }
                                teamColor={teamColor}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center text-white p-3">
                        Sem jogadores
                    </div>
                )}
            </div>
        </BaseSlider>
    );
};

export default SquadSlider;
