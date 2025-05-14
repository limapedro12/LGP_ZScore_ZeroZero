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
    onEventAction,
    leftButtonDisabled = false,
    rightButtonDisabled = false,
}) => {
    const iconPath = getEventIconPath(eventCategory);

    return (
        <div className="event-input-container d-flex align-items-center justify-content-between my-2 py-2 px-3 w-100">
            <Button
                variant="light"
                onClick={() => onEventAction('home')}
                className="event-button rounded-circle"
                disabled={leftButtonDisabled}
                aria-label={`${eventName} home team action`}
            >
                {iconPath ? (
                    <Image src={iconPath} alt="" className="event-icon" />
                ) : (
                    <span className="fw-bold fs-6">&lt;</span>
                )}
            </Button>

            <span className="event-name text-white fs-5 text-center flex-grow-1 fw-bold">
                {eventName}
            </span>

            <Button
                variant="light"
                onClick={() => onEventAction('away')}
                className="event-button rounded-circle"
                disabled={rightButtonDisabled}
                aria-label={`${eventName} away team action`}
            >
                {iconPath ? (
                    <Image src={iconPath} alt="" className="event-icon" />
                ) : (
                    <span className="fw-bold fs-6">&gt;</span>
                )}
            </Button>
        </div>
    );
};

export default EventInput;
