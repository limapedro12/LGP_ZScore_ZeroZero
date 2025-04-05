import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/timer.scss';

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
    const [gameId, setGameId] = useState<string>('default');

    // Extract gameId from URL parameters
    const { gameId: urlGameId } = useParams<{ gameId: string }>();

    // Update gameId when URL parameter changes
    useEffect(() => {
        if (urlGameId) {
            setGameId(urlGameId);
        }
    }, [urlGameId]);

    // Fetch timer status from the API
    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(gameId);
            const data = await response.json();

            if (data.elapsed_time !== undefined) {
                setElapsedTime(data.elapsed_time);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [gameId]);

    // Periodically fetch timer status
    useEffect(() => {
        fetchTimerStatus();
        const intervalId = setInterval(fetchTimerStatus, 1000);

        return () => clearInterval(intervalId);
    }, [gameId, fetchTimerStatus]);

    return (
        <div className="timer">
            <h1>
                {formatTime(elapsedTime)}
            </h1>
        </div>
    );
};

export default Timer;
