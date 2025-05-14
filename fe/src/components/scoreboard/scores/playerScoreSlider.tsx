import React, { useState, useEffect, useCallback } from 'react';
import { Sport } from '../../../utils/cardUtils';
import apiManager from '../../../api/apiManager';
import PlayerScoreEvent from './playerScoreEvent';
import BaseSlider from '../baseSlider';
import '../../../styles/sliderComponents.scss';

interface PlayerScoreSliderProps {
  sport: Sport;
  team: 'home' | 'away';
  placardId: string;
}

interface PlayerScore {
  playerId: string;
  playerName: string;
  playerNumber?: number;
  totalScore: number;
}

const PlayerScoreSlider: React.FC<PlayerScoreSliderProps> = ({ sport, team, placardId }) => {
    const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
    const MAX_PLAYERS_TO_DISPLAY = 5;

    const fetchAndAggregateScores = useCallback(async () => {
        if (!placardId || !sport) {
            setPlayerScores([]);
            return;
        }

        try {
            const response = await apiManager.getScoreHistory(placardId, sport);
            const teamScores = response.points.filter((event) => event.team === team);

            const playerScoreMap = new Map<string, PlayerScore>();

            teamScores.forEach((event) => {
                const playerId = event.playerId;
                const playerData = playerScoreMap.get(playerId) || {
                    playerId,
                    playerName: `Player ${playerId}`,
                    playerNumber: Number(playerId) || undefined,
                    totalScore: 0,
                };

                const pointValue = parseInt(String(event.pointValue), 10) || 1;

                playerData.totalScore += pointValue;
                playerScoreMap.set(playerId, playerData);
            });

            const sortedPlayers = Array.from(playerScoreMap.values())
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, MAX_PLAYERS_TO_DISPLAY);

            setPlayerScores(sortedPlayers);

        } catch (error) {
            console.error('Error fetching player scores:', error);
            setPlayerScores([]);
        }
    }, [placardId, sport, team]);

    useEffect(() => {
        fetchAndAggregateScores();
        const intervalId = setInterval(fetchAndAggregateScores, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndAggregateScores]);

    return (
        <BaseSlider title="Golos" className="player-scores-slider">
            <div className="player-scores-list w-100 d-flex flex-column gap-2">
                {playerScores.map((player) => (
                    <div key={player.playerId} className="player-score-item">
                        <PlayerScoreEvent
                            playerName={player.playerName}
                            playerNumber={player.playerNumber}
                            scoreCount={player.totalScore}
                            team={team}
                        />
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default PlayerScoreSlider;
