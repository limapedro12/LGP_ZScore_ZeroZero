import React from 'react';
import '../../styles/boxCounter.scss';

interface BoxCounterProps {
  label: string;
  homeCount: number;
  awayCount: number;
  maxCount: number;
  className?: string;
  vertical?: boolean;
}

const BoxCounter: React.FC<BoxCounterProps> = ({
    label,
    homeCount,
    awayCount,
    maxCount,
    className = '',
    vertical = false,
}) => {
    const renderBoxes = (count: number, side: 'home' | 'away') => {
        const boxes = [];

        for (let i = 0; i < maxCount; i++) {
            const isUsed = i < count;
            const boxElement = (
                <div
                    key={`${side}-${i}`}
                    className={`box-counter ${isUsed ? 'box-counter--filled' : 'box-counter--empty'}`}
                />
            );

            if (vertical) {
                boxes.push(boxElement);
            } else {
                if (side === 'home') {
                    boxes.unshift(boxElement);
                } else {
                    boxes.push(boxElement);
                }
            }

        }

        return boxes;
    };

    return (
        <div className={`box-counter-container ${className}`}>
            <div className="box-counter-team home">
                {renderBoxes(homeCount, 'home')}
            </div>
            <div className="box-counter-label">
                {label}
            </div>
            <div className="box-counter-team away">
                {renderBoxes(awayCount, 'away')}
            </div>
        </div>
    );
};

export default BoxCounter;
