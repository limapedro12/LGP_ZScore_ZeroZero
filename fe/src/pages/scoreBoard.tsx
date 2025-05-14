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
import Slider from '../components/scoreboard/slider';
import '../styles/scoreBoard.scss';
import { Sport } from '../utils/cardUtils';

const ScoreBoard = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();

    const sport = sportParam as Sport || 'futsal';
    const placardId = placardIdParam || '1';

    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);
    const [timeoutStatus, setTimeoutStatus] = useState('inactive');

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

    const handleTimeoutStatusChange = (status: string) => {
        setTimeoutStatus(status);
    };

    useEffect(() => {
        fetchScores();
        fetchNoPeriodSports();
        const intervalId = setInterval(fetchScores, 5000);
        return () => clearInterval(intervalId);
    }, [fetchScores, fetchNoPeriodSports]);

    const Center = (
        <>
            <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                <TimeoutTimer onStatusChange={handleTimeoutStatusChange} />
            </div>
            {sport && !noPeriodBoxSports.includes(sport) && (
                <SetBox
                    scoreData={scoreData}
                    timeoutActive={timeoutStatus !== 'inactive'}
                />
            )}
            <div className="timer-wrapper w-100 d-flex justify-content-center">
                <Timer />
            </div>
            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <TimeoutCounter />
            </div>
        </>
    );

    const containerClassName =
        'scoreboard-container d-flex flex-column vh-100 p-0';

    return (
        <Container
            fluid
            className={containerClassName}
        >
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow scoreData={scoreData} />
                </Col>
            </Row>

            {/* The following show when the screen is big */}
            <Row className="slider-content-row w-100 justify-content-center flex-grow-1 d-none d-md-flex overflow-hidden">
                {/* HOME TEAM SLIDER */}
                <Col xs={12} md={4} lg={4} className="ps-0 h-100 overflow-hidden">
                    <Slider sport={sport} team="home" placardId={placardId} />
                </Col>

                {/* CENTRAL INFORMATION */}
                <Col xs={12} md={4} lg={4} className="d-flex flex-column align-items-center justify-content-center h-100">
                    {Center}
                </Col>

                {/* AWAY TEAM SLIDER */}
                <Col xs={12} md={4} lg={4} className="pe-0 h-100 overflow-hidden">
                    <Slider sport={sport} team="away" placardId={placardId} />
                </Col>
            </Row>

            {/* The following show when the screen is small */}
            <Row className="w-100 justify-content-center flex-grow-1 d-flex d-md-none overflow-auto">
                {/* CENTRAL INFORMATION */}
                <Row className="w-100 m-0">
                    <Col xs={12} className="d-flex flex-column align-items-center justify-content-center">
                        {Center}
                    </Col>
                </Row>
                <Row className="w-100 px-0 pt-2 m-0">
                    {/* HOME TEAM SLIDER */}
                    <Col className="ps-0 h-100 overflow-hidden">
                        <Slider sport={sport} team="home" placardId={placardId} />
                    </Col>

                    {/* AWAY TEAM SLIDER */}
                    <Col className="pe-0 h-100 overflow-hidden">
                        <Slider sport={sport} team="away" placardId={placardId} />
                    </Col>
                </Row>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
