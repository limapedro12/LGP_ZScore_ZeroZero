import React, { useState, useEffect } from 'react';
import '../styles/scoresCounter.scss';
import slbLogo from './slb.png';
import scpLogo from './scp.png';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import type { ScoreResponse } from '../api/apiManager';


interface ScoresRowProps {
  scoreData?: ScoreResponse | null;
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
    scoreData,
    homeTeam = {
        abbreviation: 'SLB',
        logo: slbLogo,
    },
    awayTeam = {
        abbreviation: 'SCP',
        logo: scpLogo,
    },
}) => {
    const [scores, setScores] = useState<{ home: number, away: number }>({ home: 0, away: 0 });

    useEffect(() => {
        if (scoreData && scoreData.currentScore) {
            setScores({
                home: scoreData.currentScore.homeScore,
                away: scoreData.currentScore.awayScore,
            });
        }
    }, [scoreData]);

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
