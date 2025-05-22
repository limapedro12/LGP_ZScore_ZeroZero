import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiManager, { ApiTeam, ScoreResponse } from '../api/apiManager';
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
import { BREAKPOINTS } from '../media-queries';

const ScoreBoard = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();

    const sport = sportParam as Sport || 'futsal';
    const placardId = placardIdParam || '1';

    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);
    const [noShotClockSports, setNoShotClockSports] = useState<string[]>([]);
    const [nonTimerSports, setNonTimerSports] = useState<string[]>([]);
    const [timeoutStatus, setTimeoutStatus] = useState('inactive');
    const [sliderItemsCount, setSliderItemsCount] = useState(4);
    const [sliderIndex, setSliderIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.md);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINTS.md);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const fetchNonTimerSports = useCallback(async () => {
        try {
            const response = await apiManager.getNonTimerSports();
            if (response && Array.isArray(response.sports)) {
                setNonTimerSports(response.sports);
            } else {
                setNonTimerSports([]);
            }
        } catch (error) {
            console.error('Error fetching non-timer sports:', error);
            setNonTimerSports([]);
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
        const fetchData = async () => {
            setDataLoaded(false);
            await Promise.all([
                fetchScores(),
                fetchNoPeriodSports(),
                fetchNoShotClockSports(),
                fetchNonTimerSports(),
            ]);
            setDataLoaded(true);
        };

        fetchData();
        const intervalId = setInterval(fetchScores, 5000);
        return () => clearInterval(intervalId);
    }, [fetchScores, fetchNoPeriodSports, fetchNoShotClockSports, fetchNonTimerSports]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSliderIndex((prev) => (prev + 1) % sliderItemsCount);
        }, 10000);
        return () => clearInterval(interval);
    }, [sliderItemsCount]);

    const Center = useMemo(() => {
        if (!dataLoaded) return null;

        return (
            <>
                {sport && !noShotClockSports.includes(sport) && (
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
                {sport && !nonTimerSports.includes(sport) && (
                    <div className="timer-wrapper w-100 d-flex justify-content-center">
                        <Timer />
                    </div>
                )}
                <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                    <TimeoutCounter />
                </div>
            </>
        );
    }, [sport, noShotClockSports, noPeriodBoxSports, nonTimerSports, timeoutStatus, scoreData, dataLoaded]);

    const containerClassName = 'scoreboard-container d-flex flex-column min-vh-100 p-0';

    const [homeTeam, setHomeTeam] = useState<ApiTeam | null>(null);
    const [awayTeam, setAwayTeam] = useState<ApiTeam | null>(null);

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
    }, [placardId, sport]);

    useEffect(() => {
        fetchTeams();
        const intervalId = setInterval(fetchTeams, 5000);
        return () => clearInterval(intervalId);
    }, [fetchTeams]);

    return (
        <Container fluid className={containerClassName}>
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow scoreData={scoreData} homeTeam={homeTeam} awayTeam={awayTeam} />
                </Col>
            </Row>

            {!isMobile ? (
                // Desktop Layout
                <Row className="slider-content-row w-100 justify-content-center flex-grow-1 overflow-hidden">
                    <Col xs={12} md={4} lg={4} className="ps-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="home"
                            placardId={placardId} sliderIndex={sliderIndex}
                            onItemsCountChange={handleSliderItemsCountChange}
                            teamColor={homeTeam?.color}
                            teamId={homeTeam?.id}
                        />
                    </Col>

                    <Col xs={12} md={4} lg={4} className="d-flex flex-column align-items-center justify-content-center h-100">
                        {Center}
                    </Col>

                    <Col xs={12} md={4} lg={4} className="pe-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="away" placardId={placardId} sliderIndex={sliderIndex}
                            onItemsCountChange={handleSliderItemsCountChange}
                            teamColor={awayTeam?.color}
                            teamId={awayTeam?.id}
                        />
                    </Col>
                </Row>
            ) : (
                <Row className="w-100 justify-content-center flex-grow-1 overflow-auto">
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
                                teamColor={homeTeam?.color}
                                teamId={homeTeam?.id}
                            />
                        </Col>
                        <Col className="pe-0 h-100 overflow-hidden">
                            <Slider
                                sport={sport} team="away" placardId={placardId} sliderIndex={sliderIndex}
                                onItemsCountChange={handleSliderItemsCountChange}
                                teamColor={awayTeam?.color}
                                teamId={awayTeam?.id}
                            />
                        </Col>
                    </Row>
                </Row>
            )}
        </Container>
    );
};

export default ScoreBoard;
