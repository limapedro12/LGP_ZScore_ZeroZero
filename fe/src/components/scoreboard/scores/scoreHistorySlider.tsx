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
  typeOfScore?: string;
}

interface ScoreEventWithIndex extends ScoreEvent {
  index: number;
}

const ScoresSlider: React.FC<ScoresSliderProps> = ({ sport, team, placardId, typeOfScore }) => {
    const [allScoreEvents, setAllScoreEvents] = useState<Array<ScoreEvent>>([]);
    const [displayedScores, setDisplayedScores] = useState<Array<ScoreEventWithIndex | null>>([]);
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

        const latestEvents = allScoreEvents.slice(0, MAX_EVENTS_TO_DISPLAY * 3) as ScoreEventWithIndex[];
        for (let i = 0; i < latestEvents.length; i++) {
            latestEvents[i].index = i;
        }

        const maxIndex = latestEvents.length - 1;
        const positionedEvents: Array<ScoreEventWithIndex | null> = Array(maxIndex + 1).fill(null);

        latestEvents.forEach((event) => {
            if (event.team === team) {
                positionedEvents[event.index] = event;
            }
        });

        const chronologicalEvents = positionedEvents;

        const trimmedEvents = chronologicalEvents.slice(0, MAX_EVENTS_TO_DISPLAY);
        console.log('Trimmed Events:', trimmedEvents);
        setDisplayedScores(trimmedEvents);

    }, [allScoreEvents, team]);

    return (
        <BaseSlider title={`Histórico ${typeOfScore}`} className="scores-slider">
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
