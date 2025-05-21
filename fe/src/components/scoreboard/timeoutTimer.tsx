import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../../api/apiManager';
import { formatTime } from '../../utils/timeUtils';
import '../../styles/timeoutTimer.scss';

interface TimeoutTimerProps {
    onStatusChange?: (status: string) => void;
    substitute?: boolean;
}

const TimeoutTimer: React.FC<TimeoutTimerProps> = ({ onStatusChange, substitute = false }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [status, setStatus] = useState('default');
    const [placardId, setplacardId] = useState<string>('default');
    const [sport, setsport] = useState<string>('default');
    const [team, setTeam] = useState<string>('');

    const { placardId: urlplacardId, sport: urlsport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlplacardId) setplacardId(urlplacardId);
        if (urlsport) setsport(urlsport);
    }, [urlplacardId, urlsport]);

    const fetchTimerStatus = React.useCallback(async () => {
        if (!placardId || !sport || placardId === 'default' || sport === 'default') {
            return;
        }

        try {
            const response = await apiManager.getTimeoutStatus(placardId, sport);
            const data = response;
            if (data.remaining_time !== undefined) {
                setElapsedTime(data.remaining_time);
                setStatus(data.status || 'default');
                setTeam(data.team || '');

                if (onStatusChange) {
                    onStatusChange(data.status || 'default');
                }
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [placardId, sport, onStatusChange]);

    useEffect(() => {
        if (placardId && sport && placardId !== 'default' && sport !== 'default') {
            fetchTimerStatus();
            const intervalId = setInterval(fetchTimerStatus, 1000);
            return () => clearInterval(intervalId);
        }
        return undefined;
    }, [placardId, fetchTimerStatus, sport]);

    if (status === 'inactive' && !substitute) {
        return (
            <div className="timeout-timer-outer m-3">
                <div
                    className="timeout-timer-box
                d-flex align-items-center justify-content-center position-relative" style={{ background: 'none' }}
                >
                    <span className="timeout-timer-number" style={{ visibility: 'hidden' }}>
                        {formatTime(60, true)}
                        {' '}
                        {/* Use a default timeout value to maintain space */}
                    </span>
                </div>
            </div>
        );
    } else if (status === 'inactive') {
        return null;
    } else {
        return (
            <div className="timeout-timer-outer m-3">
                <div className="timeout-timer-box d-flex align-items-center justify-content-center position-relative">
                    {team === 'home' && <div className="arrow arrow-left" />}
                    <span className="timeout-timer-number">
                        {formatTime(elapsedTime, true)}
                    </span>
                    {team === 'away' && <div className="arrow arrow-right" />}
                </div>
            </div>
        );
    }
};

export default TimeoutTimer;
