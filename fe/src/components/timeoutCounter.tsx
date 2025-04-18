import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import BoxCounter from './boxCounter';
import '../styles/timeoutCounter.scss';

const TimeoutCounter: React.FC = () => {
    const [placardId, setplacardId] = useState<string>('default');
    const [sport, setsport] = useState<string>('default');
    const [teamsTimeouts, setTeamsTimeouts] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const [maxTimeouts, setMaxTimeouts] = useState<number>(0);
    const { placardId: urlplacardId, sport: urlsport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlplacardId) setplacardId(urlplacardId);
        if (urlsport) setsport(urlsport);
    }, [urlplacardId, urlsport]);

    const fetchTeamsTimeouts = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimeoutEvents(placardId, sport);
            const data = response;
            if (data.events !== undefined) {
                const lastTimeout = data.events[0];
                if (!lastTimeout) {
                    const homeTimeouts = Number(data.homeTimeoutsUsed) || 0;
                    const awayTimeouts = Number(data.awayTimeoutsUsed) || 0;
                    setTeamsTimeouts({ home: homeTimeouts, away: awayTimeouts });
                    setMaxTimeouts(Number(data.totalTimeoutsPerTeam) || 0);
                } else {
                    const homeTimeouts = Number(lastTimeout.homeTimeoutsUsed) || 0;
                    const awayTimeouts = Number(lastTimeout.awayTimeoutsUsed) || 0;
                    setTeamsTimeouts({ home: homeTimeouts, away: awayTimeouts });
                    setMaxTimeouts(Number(lastTimeout.totalTimeoutsPerTeam) || 0);
                }
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchTeamsTimeouts();
        const intervalId = setInterval(fetchTeamsTimeouts, 5000);

        return () => clearInterval(intervalId);
    }, [placardId, fetchTeamsTimeouts]);

    return (
        <div className="timeout-counter">
            <BoxCounter
                label="TO"
                homeCount={teamsTimeouts.home}
                awayCount={teamsTimeouts.away}
                maxCount={maxTimeouts}
                className="timeout-counter-container"
            />
        </div>
    );
};

export default TimeoutCounter;
