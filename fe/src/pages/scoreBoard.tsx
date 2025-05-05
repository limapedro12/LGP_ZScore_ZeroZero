import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import Cards from '../components/cards';
import '../styles/scoreBoard.scss';
import ScoresRow from '../components/scoresCounter';

const SliderList = [
    [<Cards key="left-1" direction="left" />,   <Cards key="right-1" direction="right" />],
    [<p key="left-2">Nada do lado Esquerdo</p>, <p key="right-2">Nada do lado Direito</p>],
];

const ScoreBoard = () => {
    const [currentSliderIndex, setCurrentSliderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSliderIndex((prevIndex) => (prevIndex + 1) % SliderList.length);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const Slider1 = (
        <div className="slider-container">
            {SliderList[currentSliderIndex][0]}
        </div>
    );

    const Slider2 = (
        <div className="slider-container">
            {SliderList[currentSliderIndex][1]}
        </div>
    );

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
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow />
                </Col>
            </Row>
            {/* The following show when the screen is big */}
            <Row className="w-100 justify-content-center flex-grow-1 d-none d-md-flex">
                <Col xs={12} md={3} lg={3}>
                    {Slider1}
                </Col>
                <Col xs={12} md={6} lg={6} className="d-flex flex-column align-items-center justify-content-center">
                    {Center}
                </Col>
                <Col xs={12} md={3} lg={3}>
                    {Slider2}
                </Col>
            </Row>
            {/* The following show when the screen is small */}
            <Row className="w-100 justify-content-center flex-grow-1 d-flex d-md-none">
                <Row>
                    <Col xs={12} md={8} lg={6} className="d-flex flex-column align-items-center justify-content-center">
                        {Center}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {Slider1}
                    </Col>
                    <Col>
                        {Slider2}
                    </Col>
                </Row>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
