import React from 'react';
import EventDisplay from '../eventDisplay';
import ScorePoint from './scorePoints';
import '../../../styles/sliderComponents.scss';

interface PlayerScoreEventProps {
  playerName: string;
  playerNumber?: number;
  scoreCount: number;
  team: 'home' | 'away';
  teamColor?: string;

}

const PlayerScoreEvent: React.FC<PlayerScoreEventProps> = ({
    playerName,
    playerNumber,
    scoreCount,
    team,
    teamColor,
}) => (
    <EventDisplay
        playerName={playerName}
        playerNumber={playerNumber}
        team={team}
        rightElement={<ScorePoint value={scoreCount} team={team} />}
        teamColor={teamColor}
    />
);

export default PlayerScoreEvent;
