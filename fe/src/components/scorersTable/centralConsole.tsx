import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sport, getSportEvents, TeamTag } from '../../utils/scorersTableUtils';
import EventInput from './eventInput';

interface CentralConsoleProps {
    sport: Sport;
}

const CentralConsole: React.FC<CentralConsoleProps> = ({ sport }) => {
    const sportEvents = getSportEvents(sport);
    const navigate = useNavigate();
    const { placardId } = useParams<{ placardId: string }>();

    return (
        <div className="central-console-container d-flex flex-column align-items-stretch w-75 h-75">
            {sportEvents.map((eventConfig) => (
                <EventInput
                    key={eventConfig.eventCategory}
                    eventName={eventConfig.eventName}
                    eventCategory={eventConfig.eventCategory}
                    onEventAction={(teamTag: TeamTag) => {
                        if (eventConfig.onEventAction) {
                            eventConfig.onEventAction(teamTag, navigate, sport, placardId);
                        } else {
                            console.warn(`No event action defined for ${eventConfig.eventName}`);
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default CentralConsole;
