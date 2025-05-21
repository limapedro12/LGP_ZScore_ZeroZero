import React from 'react';
import { Button } from 'react-bootstrap';
import clockRewind from '../../../public/icons/rewind-icon.png';

interface TimeRewindButtonProps {
  value: number;
  onValueChange: (newValue: number) => void;
  onAddTime: () => void;
  timeOptions: number[];
}

const TimeRewindButton: React.FC<TimeRewindButtonProps> = ({
    value,
    onValueChange,
    onAddTime,
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
                <p className="text-white fw-bold fs-6 mb-0 me-1">+</p>
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
                onClick={onAddTime}
            >
                <img src={clockRewind} alt="Add time" className="event-icon" />
            </Button>
        </div>
    );
};

export default TimeRewindButton;
