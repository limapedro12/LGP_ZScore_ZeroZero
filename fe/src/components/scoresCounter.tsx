import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/scoresCounter.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

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
        logo: '/teamLogos/slb.png',
    },
    awayTeam = {
        abbreviation: 'SCP',
        logo: '/teamLogos/scp.png',
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
        <Container fluid className="scores-row-container py-3">
            <Row className="align-items-center justify-content-between">
                <Col xs={0} md={3} lg={2} className="text-center team-col d-none d-md-flex flex-column">
                    <img src={homeTeam.logo} alt={homeTeam.abbreviation} className="team-logo" />
                    <div className="team-abbr">
                        {homeTeam.abbreviation}
                    </div>
                </Col>
                <Col xs={12} md={6} lg={8} className="score-center-col">
                    <div className="d-flex d-md-none flex-row align-items-start justify-content-center w-100 score-logo-group mt-3">
                        <div className="d-flex flex-column align-items-center mx-4 flex-fill">
                            <div className="score-box mb-2">
                                {scores.home}
                            </div>
                            <img src={homeTeam.logo} alt={homeTeam.abbreviation} className="team-logo" />
                            <div className="team-abbr">
                                {homeTeam.abbreviation}
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-center mx-4 flex-fill">
                            <div className="score-box mb-2">
                                {scores.away}
                            </div>
                            <img src={awayTeam.logo} alt={awayTeam.abbreviation} className="team-logo" />
                            <div className="team-abbr">
                                {awayTeam.abbreviation}
                            </div>
                        </div>
                    </div>
                    <div className="d-none d-md-flex flex-row align-items-center justify-content-center w-100 scores-gap">
                        <div className="score-box">
                            {scores.home}
                        </div>
                        <div className="score-box">
                            {scores.away}
                        </div>
                    </div>
                </Col>
                <Col xs={0} md={3} lg={2} className="text-center team-col d-none d-md-flex flex-column">
                    <img src={awayTeam.logo} alt={awayTeam.abbreviation} className="team-logo" />
                    <div className="team-abbr">
                        {awayTeam.abbreviation}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ScoresRow;
