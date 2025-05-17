import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../../api/apiManager';
import { formatTime } from '../../utils/timeUtils';
import '../../styles/shotClock.scss';

interface ShotClockProps {
  onStatusChange?: (status: string) => void;
}

const ShotClock: React.FC<ShotClockProps> = ({ onStatusChange }) => {
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
            const response = await apiManager.getShotClockStatus(placardId, sport);
            const data = response;
            console.log('ShotClock data:', data);
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

    return status !== 'inactive' ? (
        <div className="shotClock-timer-outer m-3">
            <div className="shotClock-timer-box d-flex align-items-center justify-content-center position-relative">
                {team === 'home' && <div className="arrow arrow-left" />}
                <div className="shotClock-inner px-4">
                    <span className="shotClock-timer-number">
                        {formatTime(elapsedTime, true)}
                    </span>
                </div>
                {team === 'away' && <div className="arrow arrow-right" />}
            </div>
        </div>
    ) : null;
};

export default ShotClock;
