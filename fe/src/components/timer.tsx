import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime, gameTypesFormat } from '../utils/timeUtils';
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
    const [gameType, setGameType] = useState<string>('default');

    const { gameId: urlGameId, gameType: urlGameType } = useParams<{ gameId: string, gameType: string }>();

    useEffect(() => {
        if (urlGameId) setGameId(urlGameId);
        if (urlGameType) setGameType(urlGameType);
    }, [urlGameId, urlGameType]);

    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(gameId, gameType);
            const data = await response;
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
                setPeriod(data.period);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [gameId, gameType]);

    useEffect(() => {
        fetchTimerStatus();
        const intervalId = setInterval(fetchTimerStatus, 1000);

        return () => clearInterval(intervalId);
    }, [gameId, fetchTimerStatus]);

    return (
        <div className="timer">
            <div className="period">
                {gameTypesFormat(gameType, period)}
            </div>
            <div className="time">
                {formatTime(elapsedTime)}
            </div>
        </div>
    );
};

export default Timer;
