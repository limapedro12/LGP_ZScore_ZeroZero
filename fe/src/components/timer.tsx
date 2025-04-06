import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/timer.scss';


const gameTypesFormat = (gameType: string, period: number): string => {
    const gameTypeLower = gameType.toLowerCase();
    switch (gameTypeLower) {
        case 'basketball':
            return `${period}Q`;
        default:
            return `${period}P`;
    }
};

/**
 * Function to format time in MM:SS format
 * @param seconds - The number of seconds to format
 * @returns {string} - The formatted time string in MM:SS format
 */
const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return [
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0'),
    ].join(':');
};

/**
 * Timer component
 * It fetches the timer status from the API and updates the UI accordingly
 * @returns {JSX.Element} - The Timer component
 */
const Timer: React.FC = () => {

    /**
     * State variables
     * elapsedTime - The elapsed time in seconds
     * isRunning - A boolean indicating if the timer is running
     * gameId - The ID of the game
     */
    const [elapsedTime, setElapsedTime] = useState(0);
    const [period, setPeriod] = useState(0);
    const [gameId, setGameId] = useState<string>('default');
    const [gameType, setGameType] = useState<string>('default');

    // Extract gameId from URL parameters
    const { gameId: urlGameId, gameType: urlGameType } = useParams<{ gameId: string, gameType: string }>();

    // Update gameId when URL parameter changes
    useEffect(() => {
        if (urlGameId) {
            setGameId(urlGameId);
        }

        if (urlGameType) {
            setGameType(urlGameType);
        }
    }, [urlGameId, urlGameType]);

    // Fetch timer status from the API
    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(gameId, gameType);
            const data = await response.json();
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
                setPeriod(data.period);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [gameId, gameType]);

    // Periodically fetch timer status
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
