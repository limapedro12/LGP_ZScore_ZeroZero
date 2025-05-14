import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import Substitution from '../components/substitution';
import ScoresRow from '../components/scoresCounter';

const ScoreBoard = () => (
    <Container fluid className="scoreboard-container d-flex flex-column align-items-center justify-content-center min-vh-100 p-0">
        <Row className="scores-row-wrapper w-100">
            <Col xs={12} className="p-0">
                <ScoresRow />
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
        <Row>
            <Col xs={12} className="p-0">
                <Substitution />
            </Col>
        </Row>
    </Container>
);

export default ScoreBoard;
