import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';

const Score: React.FC = () => {
    const [teamScores, setTeamScores] = useState<Record<string, number>>({});
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();

    const teams = ['1', '2'];

    const fetchScores = React.useCallback(async () => {
        try {
            const scores: Record<string, number> = {};
            for (const team of teams) {
                const data = await apiManager.makeRequest<{ points: number }>(
                    'points',
                    'get',
                    { placardId: placardId!, sport: sport!, teamId: team },
                    'GET'
                );
                scores[team] = data.points;
            }
            setTeamScores(scores);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }, [placardId, sport, teams]);

    useEffect(() => {
        setTeamScores({ [teams[0]]: 0, [teams[1]]: 0 });
        fetchScores();
        const intervalId = setInterval(fetchScores, 5000);

        return () => clearInterval(intervalId);
    }, [fetchScores]);

    return (
        <>
            {Object.entries(teamScores).map(([team, score]) => (
                <p key={team}>
                    {team}
                    :
                    {' '}
                    {score}
                    {' '}
                    Point
                    {score !== 1 ? 's' : ''}
                </p>
            ))}
        </>
    );
};

export default Score;
