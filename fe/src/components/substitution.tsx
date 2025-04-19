import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/substitution.scss';

type Substitution = {
    substitutionId: string,
    team: string,
    playerInId: string,
    playerOutId: string
}

/**
 * Substitution component displays the new substitution in a game
 * Fetches information every minute
 * Is visible for 15 seconds after change was detected
 */
const Substitution: React.FC = () => {
    const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
    const [newSubstitutions, setNewSubstitutions] = useState<Substitution[]>([]);
    const [gameId, setGameId] = useState<string>('default');
    const [gameType, setGameType] = useState<string>('default');

    const { gameId: urlGameId, gameType: urlGameType } = useParams<{gameId: string, gameType: string}>();

    useEffect(() => {
        if (urlGameId) setGameId(urlGameId);
        if (urlGameType) setGameType(urlGameType);
    }, [urlGameId, urlGameType]);

    const fetchSubstitutions = React.useCallback(async () => {
        try {
            const response = await apiManager.getSubstitutionsStatus(gameId, gameType);
            const currSubstitutions : Substitution[] = response.substitutions || [];
            const newSubs: Substitution[] = [];
            currSubstitutions.forEach((sub: Substitution) => {
                if (!substitutions.some((existingSub : Substitution) => existingSub.substitutionId === sub.substitutionId)) {
                    newSubs.push(sub);
                }
            });
            setNewSubstitutions(newSubs);
        } catch (error) {
            // console.error('Error fetching substitutions:', error);
        }
    }, [gameId, gameType, substitutions]);

    useEffect(() => {
        if (gameId !== 'default' && gameType !== 'default') {
            fetchSubstitutions();
            const intervalId = setInterval(fetchSubstitutions, 15 * 1000);

            return () => clearInterval(intervalId);
        }
        return undefined;
    }, [gameId, gameType, fetchSubstitutions]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log('newSubs', newSubstitutions);
            console.log('subs', substitutions);
            if (newSubstitutions.length > 0) {
                const nextSubstitution = newSubstitutions[0];
                setNewSubstitutions((prev : Substitution[]) => prev.slice(1));
                setTimeout(() => {
                    setSubstitutions((prev : Substitution[]) => [...prev, nextSubstitution]);
                }, 15 * 1000); // Display for 15 seconds
            }
        }, 5 * 1000);

        return () => clearInterval(intervalId);
    }, [newSubstitutions]);

    return (
        <div className="substitution">
            {newSubstitutions.length > 0 && (
                <div className="substitution-box">
                    <img src="/teamLogo.png" alt="Team Logo" className="team-logo" />
                    <div className="player-names">
                        <div className="player-info">
                            <p className="player-name">John Leaver</p>
                            <div className="tshirt-img">
                                {newSubstitutions[0].playerOutId}
                            </div>
                        </div>
                        <div className="player-info">
                            <p className="player-name">Kid Entering</p>
                            <div className="tshirt-img">
                                {newSubstitutions[0].playerInId}
                            </div>
                        </div>
                    </div>
                    <img src="/substitutionTriangles.png" alt="Substitution Triangles" className="substitution-triangles" />
                </div>
            )}
        </div>
    );
};

export default Substitution;
