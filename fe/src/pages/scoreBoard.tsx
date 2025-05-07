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

const ScoreBoard = () => {
    const { placardId, sport } = useParams<{ placardId: string, sport: string }>();
    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);

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
        const intervalId = setInterval(fetchScores, 5000);
        return () => clearInterval(intervalId);
    }, [fetchScores]);

    return (
        <Container fluid className="scoreboard-container d-flex flex-column align-items-center justify-content-center min-vh-100 p-0">
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow scoreData={scoreData} />
                </Col>
            </Row>
            <Row className="set-box-wrapper w-100 justify-content-center">
                <Col xs={12} md={8} lg={6} className="p-0">
                    <SetBox scoreData={scoreData} />
                </Col>
            </Row>
            <Row className="w-100 justify-content-center flex-grow-1">
                <Col xs={12} md={8} lg={6} className="d-flex flex-column align-items-center justify-content-center">
                    <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                        <TimeoutTimer />
                    </div>
                    <div className="timer-wrapper w-100 d-flex justify-content-center">
                        <Timer />
                    </div>
                    <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                        <TimeoutCounter />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
