import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { EventCategory, getEventIconPath, TeamTag } from '../../utils/scorersTableUtils';

interface EventInputProps {
  eventName: string;
  eventCategory: EventCategory;
  onEventAction: (teamTag: TeamTag) => void;
  leftButtonDisabled?: boolean;
  rightButtonDisabled?: boolean;
}

const EventInput: React.FC<EventInputProps> = ({
    eventName,
    eventCategory,
    onEventAction, // Changed
    leftButtonDisabled = false,
    rightButtonDisabled = false,
}) => {
    const iconPath = getEventIconPath(eventCategory);

    const buttonClasses = `rounded-circle border border-2 border-dark d-flex 
    align-items-center justify-content-center p-2`;


    const iconStyle: React.CSSProperties = {
        maxHeight: '28px',
        maxWidth: '28px',
        minHeight: '28px',
        minWidth: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div className="event-input-container d-flex align-items-center justify-content-between my-2 py-2 px-3 w-100">
            <Button
                variant="light"
                onClick={() => onEventAction('home')}
                className={buttonClasses}
                disabled={leftButtonDisabled}
                aria-label={`${eventName} home team action`}
            >
                {iconPath ? (
                    <Image src={iconPath} alt="" fluid style={iconStyle} />
                ) : (
                    <span className="fw-bold fs-6" style={iconStyle}>&lt;</span>
                )}
            </Button>

            <span className="event-name text-white mx-3 fs-5 text-center flex-grow-1 fw-bold">
                {eventName}
            </span>

            <Button
                variant="light"
                onClick={() => onEventAction('away')}
                className={buttonClasses}
                disabled={rightButtonDisabled}
                aria-label={`${eventName} away team action`}
            >
                {iconPath ? (
                    <Image src={iconPath} alt="" fluid style={iconStyle} />
                ) : (
                    // Fallback text
                    <span className="fw-bold fs-6" style={iconStyle}>&gt;</span>
                )}
            </Button>
        </div>
    );
};

export default EventInput;
