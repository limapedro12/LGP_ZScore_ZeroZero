import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import apiManager from '../../api/apiManager';
import BoxCounter from './../scoreboard/boxCounter';
import { BREAKPOINTS } from '../../media-queries/index';

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
        if (placardId === 'default' || sport === 'default') {
            return;
        }
        try {
            const response = await apiManager.getGameTimeoutStatus(placardId, sport);
            const data = response;
            if (data !== undefined) {
                const homeTimeouts = Number(data.homeTimeoutsUsed) || 0;
                const awayTimeouts = Number(data.awayTimeoutsUsed) || 0;
                setTeamsTimeouts({ home: homeTimeouts, away: awayTimeouts });
                setMaxTimeouts(Number(data.totalTimeoutsPerTeam) || 0);
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

    const isVertical = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });

    return (
        <div className="timeout-counter w-100 d-flex justify-content-center m-3">
            <BoxCounter
                label="TO"
                homeCount={teamsTimeouts.home}
                awayCount={teamsTimeouts.away}
                maxCount={maxTimeouts}
                className={'timeout-counter-container'}
                vertical={isVertical}
            />
        </div>
    );
};

export default TimeoutCounter;
