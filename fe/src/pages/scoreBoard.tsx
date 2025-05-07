import React, { useState, useEffect, useCallback } from 'react';
import apiManager, { ScoreResponse } from '../api/apiManager';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import ScoresRow from '../components/scoresCounter';
import SetBox from '../components/setBox';
import TeamInfo from '../components/teamInfo';
// You will need to create these components:

const ScoreBoard = () => {
    const { placardId, sport } = useParams<{ placardId: string, sport: string }>();
    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);

    const fetchNoPeriodSports = useCallback(async () => {
        try {
            const response = await apiManager.getNoPeriodSports();
            if (response && Array.isArray(response.sports)) {
                setNoPeriodBoxSports(response.sports);
            } else {
                setNoPeriodBoxSports([]);
            }
        } catch (error) {
            setNoPeriodBoxSports([]);
        }
    }, []);

    const fetchScores = useCallback(async () => {
        if (!placardId || !sport) return;
        try {
            const response = await apiManager.getScores(placardId, sport);
            setScoreData(response);
        } catch (error) {
            setScoreData(null);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchScores();
        fetchNoPeriodSports();
        const intervalId = setInterval(fetchScores, 5000);
        return () => clearInterval(intervalId);
    }, [fetchScores, fetchNoPeriodSports]);

    return (
        <Container fluid className="scoreboard-container d-flex flex-column align-items-center justify-content-center min-vh-100">
            <Row className="scores-row-wrapper w-100">
                <Col xs={12}>
                    <ScoresRow scoreData={scoreData} />
                </Col>
            </Row>
            <Row className="info-row w-100 flex-grow-1">
                <Col xs={12} md={3} className="team-info-col">
                    <TeamInfo team="home" />
                </Col>
                <Col xs={12} md={6} className="general-info-col d-flex flex-column align-items-center justify-content-center">
                    {sport && !noPeriodBoxSports.includes(sport) && (
                        <SetBox scoreData={scoreData} />
                    )}
                    <TimeoutTimer />
                    <Timer />
                    <TimeoutCounter />
                </Col>
                <Col xs={12} md={3} className="team-info-col">
                    <TeamInfo team="away" />
                </Col>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
