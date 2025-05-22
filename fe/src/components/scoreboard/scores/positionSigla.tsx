import React from 'react';

interface PositionSiglaProps {
  sigla: string;
  team: 'home' | 'away';
}

const PositionSigla: React.FC<PositionSiglaProps> = ({ sigla, team }) => (
    <div className={`score-event-point ${team}`}>
        <div className="score-event-point-value">
            {sigla}
        </div>
    </div>
);

export default PositionSigla;
