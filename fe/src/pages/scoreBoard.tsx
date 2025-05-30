import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiManager, { ApiTeam, ScoreResponse,  Sport, ApiGame, SliderData, ApiPlayer } from '../api/apiManager';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/scoreboard/timer';
import TimeoutTimer from '../components/scoreboard/timeoutTimer';
import TimeoutCounter from '../components/scoreboard/timeoutCounter';
import ScoresRow from '../components/scoreboard/scoresCounter';
import SetBox from '../components/scoreboard/setBox';
import FoulsCounter from '../components/foulsCounter';
import ShotClock from '../components/scoreboard/shotClock';
import Slider from '../components/scoreboard/slider';
import '../styles/scoreBoard.scss';
import { BREAKPOINTS } from '../media-queries';
import { correctSportParameter } from '../utils/navigationUtils';

const ScoreBoard = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();
    const placardId = placardIdParam || '1';
    const navigate = useNavigate();
    const [sport, setSport] = useState<Sport>(sportParam as Sport || '');
    const [placardInfo, setPlacardInfo] = useState<ApiGame | null>(null);

    const [scoreData, setScoreData] = useState<ScoreResponse | null>(null);
    const [homeTeam, setHomeTeam] = useState<ApiTeam | null>(null);
    const [awayTeam, setAwayTeam] = useState<ApiTeam | null>(null);
    const [timeoutStatus, setTimeoutStatus] = useState('inactive');

    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);
    const [noShotClockSports, setNoShotClockSports] = useState<string[]>([]);
    const [nonTimerSports, setNonTimerSports] = useState<string[]>([]);
    const [nonCardSports, setNonCardSports] = useState<string[]>([]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.md);

    const [shouldPollScoreHistory, setShouldPollScoreHistory] = useState(true);
    const [shouldPollCardEvents, setShouldPollCardEvents] = useState(true);
    const [shouldPollPlayers, setShouldPollPlayers] = useState(true);
    //
    const [sliderData, setSliderData] = useState<SliderData>({
        data: {
            home: { lineup: [] },
            away: { lineup: [] },
        },
        hasData: {
            scores: false,
            cards: false,
            players: false,
        },
    });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINTS.md);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchScores = async () => {
            const currentSport = placardInfo?.sport || sport;
            if (!placardId || !currentSport) return;

            try {
                const response = await apiManager.getScores(placardId, currentSport);
                setScoreData(response);
            } catch (error) {
                setScoreData(null);
            }
        };

        fetchScores();
        const interval = setInterval(fetchScores, 5000);

        return () => clearInterval(interval);
    }, [placardId, sport, placardInfo]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (placardId === 'default') return;

            try {
                const info = await apiManager.getPlacardInfo(placardId, sport);
                if (info) {
                    setPlacardInfo(info);
                    setSport(info.sport);

                    correctSportParameter(sportParam, info.sport, navigate);

                    const home = await apiManager.getTeamInfo(info.firstTeamId);
                    const away = await apiManager.getTeamInfo(info.secondTeamId);
                    setHomeTeam(home);
                    setAwayTeam(away);
                }

                const [noPeriodResponse, noShotClockResponse, nonTimerResponse, noCardResponse] =
                await Promise.all([
                    apiManager.getNoPeriodSports(),
                    apiManager.getNoShotClockSports(),
                    apiManager.getNonTimerSports(),
                    apiManager.getNoCardSports(),
                ]);

                setNoPeriodBoxSports(noPeriodResponse?.sports || []);
                setNoShotClockSports(noShotClockResponse?.sports || []);
                setNonTimerSports(nonTimerResponse?.sports || []);
                setNonCardSports(noCardResponse?.sports || []);
            } catch (error) {
                console.error('Error fetching teams:', error);
            }
        };
        fetchInitialData();
    }, [placardId, sport, sportParam, navigate]);

    const fetchScoreHistory = useCallback(async () => {
        if (!placardId || !sport) return;

        try {
            const response = await apiManager.getScoreHistory(placardId, sport);
            const hasScores = response.points.length > 0;

            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, scores: hasScores },
            }));

            // Only for initial loading - stop polling once we have data
            if (hasScores && shouldPollScoreHistory) {
                setShouldPollScoreHistory(false);
            }
        } catch (error) {
            console.error('Error fetching score history:', error);
            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, scores: false },
            }));
        }
    }, [placardId, sport, shouldPollScoreHistory]);

    const fetchCardEvents = useCallback(async () => {
        if (!placardId || !sport || nonCardSports.includes(sport) || !nonCardSports.length) return;

        try {
            const response = await apiManager.getCards(placardId, sport);
            const hasCards = response.cards.length > 0;

            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, cards: hasCards },
            }));

            // Only for initial loading - stop polling once we have data
            if (hasCards && shouldPollCardEvents) {
                setShouldPollCardEvents(false);
            }
        } catch (error) {
            console.error('Error fetching card events:', error);
            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, cards: false },
            }));
        }
    }, [placardId, sport, nonCardSports, shouldPollCardEvents]);

    const fetchPlayers = useCallback(async () => {
        if (!placardId || !homeTeam?.id || !awayTeam?.id) return;

        try {
            const [homeLineup, awayLineup] = await Promise.all([
                apiManager.getTeamLineup(placardId, homeTeam.id),
                apiManager.getTeamLineup(placardId, awayTeam.id),
            ]);

            let homeLineupArray: ApiPlayer[] = [];
            if (Array.isArray(homeLineup)) {
                homeLineupArray = homeLineup;
            } else if (homeLineup) {
                homeLineupArray = [homeLineup];
            }

            let awayLineupArray: ApiPlayer[] = [];
            if (Array.isArray(awayLineup)) {
                awayLineupArray = awayLineup;
            } else if (awayLineup) {
                awayLineupArray = [awayLineup];
            }

            const hasPlayers = homeLineupArray.length > 0 || awayLineupArray.length > 0;

            setSliderData((prev) => ({
                ...prev,
                data: {
                    ...prev.data,
                    home: { ...prev.data.home, lineup: homeLineupArray },
                    away: { ...prev.data.away, lineup: awayLineupArray },
                },
                hasData: { ...prev.hasData, players: hasPlayers },
            }));

            // Only for initial loading - stop polling once we have data
            if (hasPlayers && shouldPollPlayers) {
                setShouldPollPlayers(false);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, players: false },
            }));
        }
    }, [placardId, homeTeam?.id, awayTeam?.id, shouldPollPlayers]);

    useEffect(() => {
    // Initial data loading - fetch immediately
        fetchScoreHistory();
        fetchCardEvents();
        fetchPlayers();

        // Set up polling intervals for each data type
        const intervals: number[] = [];

        // Only poll for initial data if we haven't found any yet
        if (shouldPollScoreHistory) {
            intervals.push(window.setInterval(fetchScoreHistory, 5000));
        }

        if (shouldPollCardEvents && !nonCardSports.includes(sport)) {
            intervals.push(window.setInterval(fetchCardEvents, 5000));
        }

        if (shouldPollPlayers) {
            intervals.push(window.setInterval(fetchPlayers, 5000));
        }

        return () => {
            intervals.forEach((interval) => window.clearInterval(interval));
        };
    }, [
        fetchScoreHistory, fetchCardEvents, fetchPlayers,
        shouldPollScoreHistory, shouldPollCardEvents, shouldPollPlayers,
        sport, nonCardSports, homeTeam?.id, awayTeam?.id,
    ]);

    const Center = useMemo(() => (
        <>
            {sport && !noShotClockSports.includes(sport) && noShotClockSports.length > 0 && (
                <div className="shot-clock-wrapper w-100 d-flex justify-content-center">
                    <ShotClock />
                </div>
            )}

            {sport && noPeriodBoxSports.includes(sport) ? (
                <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                    <TimeoutTimer onStatusChange={setTimeoutStatus} />
                </div>
            ) : (
                <>
                    <div className="timeout-timer-wrapper w-100 d-flex justify-content-center">
                        <TimeoutTimer onStatusChange={setTimeoutStatus} substitute={true} />
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
            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <FoulsCounter />
            </div>
        </>
    ), [sport, noShotClockSports, noPeriodBoxSports, nonTimerSports, timeoutStatus, scoreData]);

    return (
        <Container fluid className="scoreboard-container d-flex flex-column min-vh-100 p-0">
            <Row className="scores-row-wrapper w-100">
                <Col xs={12} className="p-0">
                    <ScoresRow scoreData={scoreData} homeTeam={homeTeam} awayTeam={awayTeam} />
                </Col>
            </Row>

            {!isMobile ? (
                <Row className="slider-content-row w-100 justify-content-center flex-grow-1 overflow-hidden">
                    <Col xs={12} md={4} lg={4} className="ps-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="home" placardId={placardId}
                            teamColor={homeTeam?.color}
                            sliderData={sliderData}
                        />
                    </Col>

                    <Col xs={12} md={4} lg={4} className="d-flex flex-column align-items-center justify-content-center h-100">
                        {Center}
                    </Col>

                    <Col xs={12} md={4} lg={4} className="pe-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="away" placardId={placardId}
                            teamColor={awayTeam?.color}
                            sliderData={sliderData}
                        />
                    </Col>
                </Row>
            ) : (
                // Mobile Layout
                <Row className="w-100 justify-content-center flex-grow-1 overflow-auto">
                    <Row className="w-100 m-0">
                        <Col xs={12} className="d-flex flex-column align-items-center justify-content-center">
                            {Center}
                        </Col>
                    </Row>
                    <Row className="w-100 px-0 pt-2 m-0">
                        <Col className="ps-0 h-100 overflow-hidden">
                            <Slider
                                sport={sport} team="home" placardId={placardId}
                                teamColor={homeTeam?.color}
                                sliderData={sliderData}
                            />
                        </Col>
                        <Col className="pe-0 h-100 overflow-hidden">
                            <Slider
                                sport={sport} team="away" placardId={placardId}
                                teamColor={awayTeam?.color}
                                sliderData={sliderData}
                            />
                        </Col>
                    </Row>
                </Row>
            )}
        </Container>
    );
};

export default ScoreBoard;
