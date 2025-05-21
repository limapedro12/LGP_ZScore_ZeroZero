import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/scoresCounter.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import apiManager, { ApiTeam, ScoreResponse } from '../../api/apiManager';
import { useParams } from 'react-router-dom';

const ScoresRow: React.FC<ScoreResponse> = (scoreData) => {
    const [scores, setScores] = useState<{ home: number, away: number }>({ home: 0, away: 0 });
    const [placardId, setPlacardId] = useState<string>('default');
    const [sport, setSport] = useState<string>('default');
    const [homeTeam, setHomeTeam] = useState<ApiTeam | null>(null);
    const [awayTeam, setAwayTeam] = useState<ApiTeam | null>(null);
    const { placardId: urlPlacardId, sport: urlSport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (scoreData && scoreData.currentScore) {
            setScores({
                home: scoreData.currentScore.homeScore,
                away: scoreData.currentScore.awayScore,
            });
        }
    }, [scoreData]);

    useEffect(() => {
        if (urlPlacardId) setPlacardId(urlPlacardId);
        if (urlSport) setSport(urlSport);
    }, [urlPlacardId, urlSport]);

    const fetchTeams = useCallback(async () => {
        if (placardId === 'default') {
            return;
        }
        try {
            const placardInfo = await apiManager.getPlacardInfo(placardId, sport);
            if (placardInfo) {
                const home = await apiManager.getTeamInfo(placardInfo.firstTeamId);
                const away = await apiManager.getTeamInfo(placardInfo.secondTeamId);
                setHomeTeam(home);
                setAwayTeam(away);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, [placardId]);

    useEffect(() => {
        fetchTeams();
        const intervalId = setInterval(fetchTeams, 5000);

        return () => clearInterval(intervalId);
    }, [fetchTeams]);

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
