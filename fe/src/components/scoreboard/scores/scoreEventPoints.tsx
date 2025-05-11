import React from 'react';
import { ScoreEvent } from '../../../api/apiManager';
import '../../../styles/scoreEventPoints.scss';

interface ScoreEventPointsProps {
  scoreEvent: ScoreEvent;
  team: 'home' | 'away';
}

const ScoreEventPoints: React.FC<ScoreEventPointsProps> = ({ scoreEvent, team }) => {
    const { periodTotalPoints } = scoreEvent;

    return (
        <div className={`score-event-point ${team}`}>
            <div className="score-event-point-value">
                {periodTotalPoints}
            </div>
        </div>
    );
};

export default ScoreEventPoints;
