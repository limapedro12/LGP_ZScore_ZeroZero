import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime, sportsFormat } from '../utils/timeUtils';
import '../styles/timer.scss';


const Timer: React.FC = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [period, setPeriod] = useState(0);
    const [placardId, setplacardId] = useState<string>('default');
    const [sport, setsport] = useState<string>('default');

    const { placardId: urlplacardId, sport: urlsport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlplacardId) setplacardId(urlplacardId);
        if (urlsport) setsport(urlsport);
    }, [urlplacardId, urlsport]);

    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(placardId, sport);
            const data = response;
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
                setPeriod(data.period);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchTimerStatus();
        const intervalId = setInterval(fetchTimerStatus, 1000);

        return () => clearInterval(intervalId);
    }, [placardId, fetchTimerStatus]);

    return (
        <div className="timer">
            <div className="period">
                {sportsFormat(sport, period)}
            </div>
            <div className="time">
                {formatTime(elapsedTime)}
            </div>
        </div>
    );
};

export default Timer;
