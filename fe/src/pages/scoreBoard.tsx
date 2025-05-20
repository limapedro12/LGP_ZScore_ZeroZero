import React, { useState, useEffect, useCallback } from 'react';
import apiManager, { ScoreResponse } from '../api/apiManager';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/scoreboard/timer';
import TimeoutTimer from '../components/scoreboard/timeoutTimer';
import TimeoutCounter from '../components/scoreboard/timeoutCounter';
import ScoresRow from '../components/scoreboard/scoresCounter';
import SetBox from '../components/scoreboard/setBox';
import Slider from '../components/scoreboard/slider';
import ShotClock from '../components/scoreboard/shotClock';
import '../styles/scoreBoard.scss';
import { Sport } from '../utils/cardUtils';

const ScoreBoard = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();

    const sport = sportParam as Sport || 'futsal';
    const placardId = placardIdParam || '1';

    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);
    const [noShotClockSports, setNoShotClockSports] = useState<string[]>([]);
    const [timeoutStatus, setTimeoutStatus] = useState('inactive');
    const [sliderItemsCount, setSliderItemsCount] = useState(4);
    const [sliderIndex, setSliderIndex] = useState(0);

    const handleSliderItemsCountChange = useCallback((count: number) => {
        setSliderItemsCount(count);
    }, []);

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

    const fetchNoShotClockSports = useCallback(async () => {
        try {
            const response = await apiManager.getNoShotClockSports();
            if (response && Array.isArray(response.sports)) {
                setNoShotClockSports(response.sports);
            } else {
                setNoShotClockSports([]);
            }
        } catch (error) {
            setNoShotClockSports([]);
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
        fetchNoShotClockSports();
        const intervalId = setInterval(fetchScores, 5000);
        return () => clearInterval(intervalId);
    }, [fetchScores, fetchNoPeriodSports, fetchNoShotClockSports]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSliderIndex((prev) => (prev + 1) % sliderItemsCount);
        }, 10000);
        return () => clearInterval(interval);
    }, [sliderItemsCount]);

    const Center = (
        <>
            {sport && !noShotClockSports.includes(sport) && (noShotClockSports.length > 0) && (
                <div className="shot-clock-wrapper w-100 d-flex justify-content-center">
                    <ShotClock />
                </div>
            )}
            {sport && noPeriodBoxSports.includes(sport) && (
                <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                    <TimeoutTimer onStatusChange={handleTimeoutStatusChange} />
                </div>
            )}
            {sport && !noPeriodBoxSports.includes(sport) && (
                <>
                    <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                        <TimeoutTimer onStatusChange={handleTimeoutStatusChange} substitute={true} />
                    </div>
                    <SetBox
                        scoreData={scoreData}
                        timeoutActive={timeoutStatus !== 'inactive'}
                    />
                </>
            )}
            <div className="timer-wrapper w-100 d-flex justify-content-center">
                <Timer />
            </div>
            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <TimeoutCounter />
            </div>
            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <TimeoutCounter />
            </div>
        </>
    );

    const containerClassName =
        'scoreboard-container d-flex flex-column min-vh-100 p-0';

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

            <Row className="slider-content-row w-100 justify-content-center flex-grow-1 d-none d-md-flex overflow-hidden">
                <Col xs={12} md={4} lg={4} className="ps-0 h-100 overflow-hidden">
                    <Slider
                        sport={sport} team="home"
                        placardId={placardId} sliderIndex={sliderIndex}
                        onItemsCountChange={handleSliderItemsCountChange}
                    />
                </Col>

                <Col xs={12} md={4} lg={4} className="d-flex flex-column align-items-center justify-content-center h-100">
                    {Center}
                </Col>

                <Col xs={12} md={4} lg={4} className="pe-0 h-100 overflow-hidden">
                    <Slider
                        sport={sport} team="away" placardId={placardId} sliderIndex={sliderIndex}
                        onItemsCountChange={handleSliderItemsCountChange}
                    />
                </Col>
            </Row>

            <Row className="w-100 justify-content-center flex-grow-1 d-flex d-md-none overflow-auto">
                <Row className="w-100 m-0">
                    <Col xs={12} className="d-flex flex-column align-items-center justify-content-center">
                        {Center}
                    </Col>
                </Row>
                <Row className="w-100 px-0 pt-2 m-0">
                    <Col className="ps-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="home" placardId={placardId} sliderIndex={sliderIndex}
                            onItemsCountChange={handleSliderItemsCountChange}
                        />
                    </Col>

                    <Col className="pe-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="away" placardId={placardId} sliderIndex={sliderIndex}
                            onItemsCountChange={handleSliderItemsCountChange}
                        />
                    </Col>
                </Row>
            </Row>
        </Container>
    );
};

export default ScoreBoard;
