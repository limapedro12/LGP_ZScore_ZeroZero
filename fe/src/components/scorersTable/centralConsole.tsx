import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sport, getSportEvents, TeamTag } from '../../utils/scorersTableUtils';
import EventInput from './eventInput';
import { Container, Row } from 'react-bootstrap';

interface CentralConsoleProps {
    sport: Sport;
}

const CentralConsole: React.FC<CentralConsoleProps> = ({ sport }) => {
    const sportEvents = getSportEvents(sport);
    const navigate = useNavigate();
    const { placardId } = useParams<{ placardId: string }>();

    return (
        <Container className="central-console-container p-3">
            <Row className="g-2">
                {sportEvents.map((eventConfig) => (
                    <div key={eventConfig.eventCategory} className="col-12">
                        <EventInput
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
                    </div>
                ))}
            </Row>
        </Container>
    );
};

export default CentralConsole;
