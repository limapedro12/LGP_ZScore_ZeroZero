import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime, sportsFormat } from '../utils/timeUtils';
import '../styles/timer.scss';

/**
 * Timer component displays the current time and period for a game
 * Automatically updates every second by fetching data from API
 */
const Timer: React.FC = () => {
    // State to track timer information
    const [elapsedTime, setElapsedTime] = useState(0);
    const [period, setPeriod] = useState(0);
    const [gameId, setGameId] = useState<string>('default');
    const [sport, setsport] = useState<string>('default');

    const { gameId: urlGameId, sport: urlsport } = useParams<{ gameId: string, sport: string }>();

    useEffect(() => {
        if (urlGameId) setGameId(urlGameId);
        if (urlsport) setsport(urlsport);
    }, [urlGameId, urlsport]);

    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(gameId, sport);
            const data = response;
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
                setPeriod(data.period);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [gameId, sport]);

    useEffect(() => {
        fetchTimerStatus();
        const intervalId = setInterval(fetchTimerStatus, 1000);

        return () => clearInterval(intervalId);
    }, [gameId, fetchTimerStatus]);

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
