import React, { useState, useEffect } from 'react';
import '../../styles/scoresCounter.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ApiTeam, ScoreResponse } from '../../api/apiManager';

interface ScoresRowProps {
    scoreData?: ScoreResponse | null;
    homeTeam?: ApiTeam | null;
    awayTeam?: ApiTeam | null;
}

const ScoresRow: React.FC<ScoresRowProps> = ({
    scoreData,
    homeTeam,
    awayTeam,
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
        <Container fluid className="scores-row-container">
            <Row className="align-items-center justify-content-between">
                {/* Home Team - Desktop */}
                <Col xs={0} md={3} lg={2} xl={2} className="team-col d-none d-md-flex">
                    <div className="team-display home-team">
                        <img
                            src={homeTeam?.logoURL || '/defaultLogo.png'}
                            alt={homeTeam?.acronym || 'Home'}
                            className="team-logo-scoreboard"
                        />
                        <div className="team-abbr">
                            {homeTeam?.acronym || 'Home'}
                        </div>
                    </div>
                </Col>

                {/* Scores - Desktop & Mobile */}
                <Col xs={12} md={6} lg={8} xl={8} className="score-center-col">
                    {/* Mobile View */}
                    <div className="d-flex d-md-none flex-row align-items-start justify-content-center w-100 score-logo-group">
                        <div className="d-flex flex-column align-items-center mx-4 flex-fill">
                            <div className="score-box">
                                {scores.home}
                            </div>
                            <img src={homeTeam?.logoURL} alt={homeTeam?.acronym || 'Home'} className="team-logo-scoreboard" />
                            <div className="team-abbr">
                                {homeTeam?.acronym || 'Home'}
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-center mx-4 flex-fill">
                            <div className="score-box">
                                {scores.away}
                            </div>
                            <img
                                src={awayTeam?.logoURL || '/defaultLogo.png'}
                                alt={awayTeam?.acronym || 'Away'}
                                className="team-logo-scoreboard"
                            />
                            <div className="team-abbr">
                                {awayTeam?.acronym || 'Away'}
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="d-none d-md-flex flex-row align-items-center justify-content-center w-100 scores-gap">
                        <div className="score-box">
                            {scores.home}
                        </div>
                        <div className="score-box">
                            {scores.away}
                        </div>
                    </div>
                </Col>

                {/* Away Team - Desktop */}
                <Col xs={0} md={3} lg={2} xl={2} className="team-col d-none d-md-flex">
                    <div className="team-display away-team">
                        <div className="team-abbr">
                            {awayTeam?.acronym || 'Away'}
                        </div>
                        <img
                            src={awayTeam?.logoURL || '/defaultLogo.png'}
                            alt={awayTeam?.acronym || 'Away'}
                            className="team-logo-scoreboard"
                        />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ScoresRow;
