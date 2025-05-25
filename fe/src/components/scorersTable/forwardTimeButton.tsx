import React from 'react';
import { Button } from 'react-bootstrap';
import clockForward from '../../../public/icons/forward-icon.png';

interface TimeForwardButtonProps {
  value: number;
  onValueChange: (newValue: number) => void;
  onSubtractTime: () => void;
  timeOptions: number[];
}

const TimeForwardButton: React.FC<TimeForwardButtonProps> = ({
    value,
    onValueChange,
    onSubtractTime,
    timeOptions,
}) => {
    const cycleTimeValue = () => {
        const currentIndex = timeOptions.indexOf(value);
        const nextIndex = (currentIndex + 1) % timeOptions.length;
        onValueChange(timeOptions[nextIndex]);
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <div className="d-flex align-items-center mb-2">
                <p className="text-white fw-bold fs-6 mb-0 me-1">-</p>
                <Button
                    variant="outline-light"
                    size="sm"
                    className="value-indicator"
                    onClick={cycleTimeValue}
                >
                    {value}
                    s
                </Button>
            </div>
            <Button
                variant="outline-light"
                className="rounded-circle time-btn"
                onClick={onSubtractTime}
            >
                <img src={clockForward} alt="Subtract time" className="event-icon" />
            </Button>
        </div>
    );
};

export default TimeForwardButton;
