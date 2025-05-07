import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import '../styles/scoreBoard.scss';
import ScoresRow from '../components/scoresCounter';
import Slider from '../components/scoreboard/slider';
import { useParams } from 'react-router-dom';
import { Sport } from '../utils/cardUtils';

const ScoreBoard = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();

    const sport = sportParam as Sport || 'futsal';
    const placardId = placardIdParam || '1';

    const Center = (
        <>
            <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                <TimeoutTimer />
            </div>
            <div className="timer-wrapper w-100 d-flex justify-content-center">
                <Timer />
            </div>
            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <TimeoutCounter />
            </div>
        </>
    );

    return (
        <Container fluid className="scoreboard-container d-flex flex-column align-items-center justify-content-center min-vh-100 p-0">
            {/* SCORE ROW */}
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow />
                </Col>
            </Row>

            {/* The following show when the screen is big */}
            <Row className="w-100 justify-content-center flex-grow-1 d-none d-md-flex">
                {/* HOME TEAM SLIDER */}
                <Col xs={12} md={3} lg={4}>
                    <Slider sport={sport} team="home" placardId={placardId} />
                </Col>

                {/* CENTRAL INFORMATION */}
                <Col xs={12} md={6} lg={4} className="d-flex flex-column align-items-center justify-content-center">
                    {Center}
                </Col>

                {/* AWAY TEAM SLIDER */}
                <Col xs={12} md={3} lg={4}>
                    <Slider sport={sport} team="away" placardId={placardId} />
                </Col>
            </Row>
            {/* The following show when the screen is small */}
            <Row className="w-100 justify-content-center flex-grow-1 d-flex d-md-none">
                {/* CENTRAL INFORMATION */}
                <Row>
                    <Col xs={12} md={8} lg={6} className="d-flex flex-column align-items-center justify-content-center">
                        {Center}
                    </Col>
                </Row>
                <Row>
                    {/* HOME TEAM SLIDER */}
                    <Col>
                        <Slider sport={sport} team="home" placardId={placardId} />
                    </Col>

                    {/* AWAY TEAM SLIDER */}
                    <Col>
                        <Slider sport={sport} team="away" placardId={placardId} />
                    </Col>
                </Row>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
