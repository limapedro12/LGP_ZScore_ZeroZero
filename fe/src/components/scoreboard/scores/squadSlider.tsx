import React, { useState, useEffect } from 'react';
import BaseSlider from '../baseSlider';
import EventDisplay from '../eventDisplay';
import PositionSigla from './positionSigla';
import '../../../styles/sliderComponents.scss';
import { useMediaQuery } from 'react-responsive';
import { BREAKPOINTS } from '../../../media-queries';
import { ApiPlayer } from '../../../api/apiManager';

interface SquadSliderProps {
  team: 'home' | 'away';
  onComplete?: () => void;
  teamColor?: string;
  players?: ApiPlayer[];
}

const SquadSlider: React.FC<SquadSliderProps> = ({
    team,
    onComplete,
    teamColor,
    players = [],
}) => {
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
    const PLAYERS_PER_PAGE = 8;
    const small = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });

    const totalPages = Math.ceil(players.length / PLAYERS_PER_PAGE);

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
        <BaseSlider title={`Plantel ${pageIndicator}`} className="squad-slider">
            <div className="squad-list w-100 d-flex flex-column">
                {currentPagePlayers.length > 0 ? (
                    currentPagePlayers.map((player) => (
                        <div key={player.playerId} className="squad-player-item py-1">
                            <EventDisplay
                                playerName={player.name}
                                playerNumber={Number(player.number)}
                                team={team}
                                rightElement={
                                    !small ? <PositionSigla sigla={player.position_acronym} team={team} /> : undefined
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
