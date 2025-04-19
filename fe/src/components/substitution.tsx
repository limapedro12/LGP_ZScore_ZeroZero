import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/timer.scss';

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
            {/* Flash section for new substitutions */}
            {newSubstitutions.length > 0 && (
                <div className="substitution-box">
                    <div className="team-logo">
                        {newSubstitutions[0]['team']}
                    </div>
                    <div className="player-info">
                        <div className="player-out">
                            <span className="player-name">Player In</span>
                            <span className="jersey">
                                <span className="shirt">
                                    {newSubstitutions[0]['playerInId']}
                                </span>
                            </span>
                            <span className="arrow red">&#9650;</span>
                        </div>
                        <div className="player-in">
                            <span className="player-name">Player Out</span>
                            <span className="jersey">
                                <span className="shirt">
                                    {newSubstitutions[0]['playerOutId']}
                                </span>
                            </span>
                            <span className="arrow green">&#9660;</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Full list (if needed) */}
            {/* <div className="all-substitutions" hidden>
                <ul>
                    {substitutions.map((sub, index) => (
                        <li key={index}>
                            {sub.time} - {sub.playerIn} entrou no lugar de {sub.playerOut}
                        </li>
                    ))}
                </ul>
            </div> */}
        </div>
    );
};

export default Substitution;
