import React from 'react';

interface ScorePointProps {
  value: number | string;
  team: 'home' | 'away';
}

const ScorePoint: React.FC<ScorePointProps> = ({ value, team }) => (
    <div className={`score-event-point ${team}`}>
        <div className="score-event-point-value">
            {value}
        </div>
    </div>
);

export default ScorePoint;
