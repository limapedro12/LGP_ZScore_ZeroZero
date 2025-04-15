import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime } from '../utils/timeUtils';
import '../styles/timer.scss';

/**
 * Timer component displays the timeoutclock
 * Automatically updates every second by fetching data from API
 */
const TimeoutClock: React.FC = () => {
    // State to track timer information
    const [elapsedTime, setElapsedTime] = useState(0);
    const [gameId, setGameId] = useState<string>('default');
    const [gameType, setGameType] = useState<string>('default');
    const [team, setTeam] = useState<string>('home');
    const [teamTimeouts, setTeamTimeouts] = useState<{
        home: number;
        away: number;
    }>({
        home: 0,
        away: 0,
    });

    const { gameId: urlGameId, gameType: urlGameType } = useParams<{ gameId: string, gameType: string }>();

    useEffect(() => {
        if (urlGameId) setGameId(urlGameId);
        if (urlGameType) setGameType(urlGameType);
    }, [urlGameId, urlGameType]);

    const fetchTeamTimeouts = React.useCallback(async () => {
        try {
            const response = await apiManager.getTeamTimeouts(gameId, gameType);
            const data = await response.json();
            if (data.home !== undefined && data.away !== undefined) {
                setTeamTimeouts(data);
            }
        } catch (error) {
            console.error('Error fetching team timeouts:', error);
        }
    }
    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimerStatus(gameId, gameType);
            const data = await response.json();
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
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
            <div className="period" />
            <div className="time">
                {formatTime(elapsedTime)}
            </div>
        </div>
    );
};

export default TimeoutClock;
