import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime } from '../utils/timeUtils';
import '../styles/timeoutTimer.scss';

const TimeoutTimer: React.FC = () => {
    // State to track timer information
    const [elapsedTime, setElapsedTime] = useState(0);
    const [status, setStatus] = useState('default');
    const [gameId, setGameId] = useState<string>('default');
    const [gameType, setGameType] = useState<string>('default');
    const [team, setTeam] = useState<string>('');

    const { gameId: urlGameId, gameType: urlGameType } = useParams<{ gameId: string, gameType: string }>();

    useEffect(() => {
        if (urlGameId) setGameId(urlGameId);
        if (urlGameType) setGameType(urlGameType);
    }, [urlGameId, urlGameType]);

    const fetchTimerStatus = React.useCallback(async () => {
        try {
            const response = await apiManager.getTimeoutTimerStatus(gameId, gameType);
            const data = await response;
            if (data.remaining_time !== undefined) {
                setElapsedTime(data.remaining_time);
                setStatus(data.status);
                setTeam(data.team || '');
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

    // Only render the timer if status is not 'inactive'
    return status !== 'inactive' ? (
        <div className="timeout-timer">
            <div className="timeout-time">
                {team === 'home' && <div className="arrow arrow-left" />}
                {formatTime(elapsedTime, true)}
                {team === 'away' && <div className="arrow arrow-right" />}
            </div>
        </div>
    ) : null;
};

export default TimeoutTimer;
