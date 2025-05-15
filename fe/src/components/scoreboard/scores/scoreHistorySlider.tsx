import React, { useState, useEffect, useCallback } from 'react';
import { Sport } from '../../../utils/cardUtils';
import apiManager, { ScoreEvent } from '../../../api/apiManager';
import ScoreEventPoints from './scoreEventPoints';
import BaseSlider from '../baseSlider';
import '../../../styles/sliderComponents.scss';

interface ScoresSliderProps {
  sport: Sport;
  team: 'home' | 'away';
  placardId: string;
}

const ScoresSlider: React.FC<ScoresSliderProps> = ({ sport, team, placardId }) => {
    const [allScoreEvents, setAllScoreEvents] = useState<Array<ScoreEvent>>([]);
    const [displayedScores, setDisplayedScores] = useState<Array<ScoreEvent | null>>([]);
    const MAX_EVENTS_TO_DISPLAY = 8;

    const fetchAndSetScores = useCallback(async () => {
        if (!placardId || !sport) {
            setAllScoreEvents([]);
            return;
        }
        try {
            const response = await apiManager.getScoreHistory(placardId, sport);
            const sortedApiScores = response.points;
            setAllScoreEvents(sortedApiScores);
        } catch (error) {
            console.error('Error fetching card events:', error);
            setAllScoreEvents([]);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchAndSetScores();

        const intervalId = setInterval(fetchAndSetScores, 5000);

        return () => clearInterval(intervalId);
    }, [fetchAndSetScores]);

    useEffect(() => {
        if (allScoreEvents.length === 0) {
            setDisplayedScores([]);
            return;
        }

        const latestEvents = allScoreEvents.slice(0, MAX_EVENTS_TO_DISPLAY * 3);

        const allEventIds = latestEvents.map((event) => event.eventId);
        const minEventId = Math.min(...allEventIds);
        const maxEventId = Math.max(...allEventIds);

        const positionedEvents: Array<ScoreEvent | null> = Array(maxEventId - minEventId + 1).fill(null);

        latestEvents.forEach((event) => {
            const position = event.eventId - minEventId;
            if (event.team === team) {
                positionedEvents[position] = event;
            }
        });

        const chronologicalEvents = positionedEvents.reverse();

        const trimmedEvents = chronologicalEvents.slice(0, MAX_EVENTS_TO_DISPLAY);
        setDisplayedScores(trimmedEvents);

    }, [allScoreEvents, team]);

    return (
        <BaseSlider title="Histórico Pontos" className="scores-slider">
            <div className={`scores-slider-points ${team}-points d-flex flex-column align-items-center gap-2`}>
                {displayedScores.map((scoreEvent, index) => (
                    <div key={index} className="score-event-position">
                        {scoreEvent ? (
                            <ScoreEventPoints
                                scoreEvent={scoreEvent}
                                team={team}
                            />
                        ) : (
                            <div className="score-event-placeholder" />
                        )}
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default ScoresSlider;
