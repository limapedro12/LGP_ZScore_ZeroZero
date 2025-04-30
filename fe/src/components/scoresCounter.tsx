import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/scoresCounter.scss';
import slbLogo from './slb.png';
import scpLogo from './scp.png';

interface ScoresRowProps {
  homeTeam?: {
    name: string;
    abbreviation: string;
    logo: string;
  };
  awayTeam?: {
    name: string;
    abbreviation: string;
    logo: string;
  };
}

const ScoresRow: React.FC<ScoresRowProps> = ({
    homeTeam = {
        abbreviation: 'SLB',
        logo: slbLogo,
    },
    awayTeam = {
        abbreviation: 'SCP',
        logo: scpLogo,
    },
}) => {
    const [placardId, setPlacardId] = useState<string>('default');
    const [sport, setSport] = useState<string>('default');
    const [scores, setScores] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const { placardId: urlPlacardId, sport: urlSport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlPlacardId) setPlacardId(urlPlacardId);
        if (urlSport) setSport(urlSport);
    }, [urlPlacardId, urlSport]);

    const fetchScores = useCallback(async () => {
        if (placardId === 'default' || sport === 'default') {
            return;
        }
        try {
            const response = await apiManager.getScores(placardId, sport);
            if (response.currentScore) {
                setScores({
                    home: response.currentScore.homeScore,
                    away: response.currentScore.awayScore,
                });
            }
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchScores();
        const intervalId = setInterval(fetchScores, 5000);

        return () => clearInterval(intervalId);
    }, [fetchScores]);

    return (
        <div className="scores-row">
            <div className="team home-team">
                <div className="team-logo-container">
                    <img src={homeTeam.logo} className="team-logo" alt={`${homeTeam.abbreviation} logo`} />
                </div>
                <div className="team-abbreviation">
                    {homeTeam.abbreviation}
                </div>
            </div>

            <div className="scores-container">
                <div className="score-box home-score">
                    {scores.home}
                </div>
                <div className="score-box away-score">
                    {scores.away}
                </div>
            </div>

            <div className="team away-team">
                <div className="team-abbreviation">
                    {awayTeam.abbreviation}
                </div>
                <div className="team-logo-container">
                    <img src={awayTeam.logo} className="team-logo" alt={`${awayTeam.abbreviation} logo`} />
                </div>
            </div>
        </div>
    );
};

export default ScoresRow;
