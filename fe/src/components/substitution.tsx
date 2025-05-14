import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/substitution.scss';

type Substitution = {
    substitutionId: string,
    team: string,
    playerInId: string,
    playerOutId: string,
    timestamp: string,
}

/**
 * Substitution component displays the new substitution in a game
 * Fetches information every minute
 * Is visible for 15 seconds after change was detected
 */
const Substitution: React.FC = () => {
    const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
    const [displayQueue, setDisplayQueue] = useState<Substitution[]>([]);
    const [currentSubstitution, setCurrentSubstitution] = useState<Substitution | null>(null);
    const [placardId, setPlacardId] = useState<string>('default');
    const [sport, setSport] = useState<string>('default');
    const displayTimerRef = useRef<number | null>(null);

    const { placardId: urlPlacardId, sport: urlSport } = useParams<{placardId: string, sport: string}>();

    useEffect(() => {
        if (urlPlacardId) setPlacardId(urlPlacardId);
        if (urlSport) setSport(urlSport);
    }, [urlPlacardId, urlSport]);

    const areSubsEqual = (sub1: Substitution, sub2: Substitution): boolean => sub1.substitutionId === sub2.substitutionId &&
               sub1.playerInId === sub2.playerInId &&
               sub1.playerOutId === sub2.playerOutId &&
               sub1.timestamp === sub2.timestamp &&
               sub1.team === sub2.team;

    const fetchSubstitutions = React.useCallback(async () => {
        if (placardId === 'default' || sport === 'default') return;

        try {
            const response = await apiManager.getSubstitutionStatus(placardId, sport);
            const currSubstitutions : Substitution[] = response.substitutions || [];

            const newSubs = currSubstitutions.filter((apiSub) => {

                const matchingSub = substitutions.find((lastSub : Substitution) =>
                    lastSub.substitutionId === apiSub.substitutionId
                );

                // If there's no matching sub or if the details are different, it's a new/updated sub
                return !matchingSub || !areSubsEqual(apiSub, matchingSub);
            });

            if (newSubs.length > 0) {
                setDisplayQueue((prev : Substitution[]) => [...prev, ...newSubs]);
            }
            setSubstitutions((prev : Substitution[]) => {
                if (JSON.stringify(prev) !== JSON.stringify(currSubstitutions)) {
                    return currSubstitutions;
                }
                return prev;
            });
        } catch (error) {
            // console.error('Error fetching substitutions:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        if (placardId !== 'default' && sport !== 'default') {
            // Initial fetch
            fetchSubstitutions();

            // Set up interval to fetch every 15 seconds
            const intervalId = setInterval(fetchSubstitutions, 15 * 1000);
            return () => clearInterval(intervalId);
        }
        return undefined;
    }, [placardId, sport, fetchSubstitutions]);

    useEffect(() => {
        if (displayTimerRef.current) {
            clearTimeout(displayTimerRef.current);
            displayTimerRef.current = null;
        }

        // If we're not showing anything and have items in queue, show next one
        if (!currentSubstitution && displayQueue.length > 0) {
            const nextSub = displayQueue[0];
            setDisplayQueue((prev : Substitution[]) => prev.slice(1));
            setCurrentSubstitution(nextSub);

            // Set timer to clear current sub after 15 seconds
            displayTimerRef.current = setTimeout(() => {
                setCurrentSubstitution(null);
                displayTimerRef.current = null;
            }, 5 * 1000);
        }
    }, [currentSubstitution, displayQueue]);

    useEffect(() =>  () => {
        if (displayTimerRef.current) {
            clearTimeout(displayTimerRef.current);
        }
    }, []);

    if (!currentSubstitution) {
        return null;
    }

    return (
        <div className="substitution">
            <div className="substitution-box">
                <img src="/teamLogo.png" alt="Team Logo" className="team-logo" />
                <div className="player-names">
                    <div className="player-info">
                        <p className="player-name">John Leaver</p>
                        <div className="tshirt-img">
                            {currentSubstitution.playerOutId}
                        </div>
                    </div>
                    <div className="player-info">
                        <p className="player-name">Kid Entering</p>
                        <div className="tshirt-img">
                            {currentSubstitution.playerInId}
                        </div>
                    </div>
                </div>
                <img src="/substitutionTriangles.png" alt="Substitution Triangles" className="substitution-triangles" />
            </div>
        </div>
    );
};

export default Substitution;
