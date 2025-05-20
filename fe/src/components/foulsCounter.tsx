// src/components/FoulsCounter.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import apiManager from '../api/apiManager';
import BoxCounter from './boxCounter';
import '../styles/timeoutCounter.scss';
import { BREAKPOINTS } from '../media-queries/index';


const FoulsCounter: React.FC = () => {
    const [placardId, setPlacardId] = useState<string>('default');
    const [sport, setSport] = useState<string>('default');
    const [teamFouls, setTeamFouls] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const [foulsThreshold, setFoulsThreshold] = useState<number | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const { placardId: urlPlacardId, sport: urlSport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlPlacardId) {
            setPlacardId(urlPlacardId);
        }
        if (urlSport) {
            setSport(urlSport);
        }
    }, [urlPlacardId, urlSport]);

    const fetchTeamFouls = useCallback(async () => {

        if (placardId === 'default' || sport === 'default') {

            if (isLoading) {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiManager.getSimpleGameFoulStatus(placardId, sport);


            setTeamFouls({
                home: response.data.currentPeriodFouls.home,
                away: response.data.currentPeriodFouls.away,
            });
            if (response.data.foulsPenaltyThreshold !== null) {
                setFoulsThreshold(response.data.foulsPenaltyThreshold);
            } else {
                setFoulsThreshold(undefined);
            }
        } catch (error: unknown) {
            let errorMessage = 'Failed to fetch foul status.';
            if (error instanceof Error) {
                errorMessage = error.message;

            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            console.error('Error fetching foul status:', errorMessage);
            setTeamFouls({ home: 0, away: 0 });
            setFoulsThreshold(undefined);
        } finally {
            setIsLoading(false);
        }

    }, [placardId, sport, isLoading]);

    useEffect(() => {

        fetchTeamFouls();
        const intervalId = setInterval(fetchTeamFouls, 5000);
        return () => clearInterval(intervalId);
    }, [fetchTeamFouls]);

    const isVertical = useMediaQuery({ maxWidth: BREAKPOINTS.sm - 1 });
    const maxCountForDisplay = foulsThreshold === undefined ? 0 : foulsThreshold;

    return (
        <div className="foul-counter w-100 d-flex justify-content-center">
            <BoxCounter
                label="Faltas"
                homeCount={teamFouls.home}
                awayCount={teamFouls.away}
                maxCount={maxCountForDisplay}
                className={'foul-counter-container'}
                vertical={isVertical}
            />
        </div>
    );
};

export default FoulsCounter;
