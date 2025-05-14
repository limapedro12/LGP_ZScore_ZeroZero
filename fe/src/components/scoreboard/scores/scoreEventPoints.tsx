import React from 'react';
import { ScoreEvent } from '../../../api/apiManager';
import ScorePoint from './scorePoints';

interface ScoreEventPointsProps {
  scoreEvent: ScoreEvent;
  team: 'home' | 'away';
}

const ScoreEventPoints: React.FC<ScoreEventPointsProps> = ({ scoreEvent, team }) => {
    const { periodTotalPoints } = scoreEvent;

    return <ScorePoint value={periodTotalPoints} team={team} />;
};

export default ScoreEventPoints;
