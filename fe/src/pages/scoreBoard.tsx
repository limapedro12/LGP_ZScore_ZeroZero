import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiManager, { ApiTeam, ScoreResponse, ApiPlayer, SliderData, Sport, ApiGame } from '../api/apiManager';
import { useParams, useNavigate } from 'react-router-dom';
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
import { BREAKPOINTS } from '../media-queries';

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

    const fetchScores = useCallback(async () => {
        const currentSport = placardInfo?.sport || sport;
        if (!placardId || !currentSport) return;

        try {
            const response = await apiManager.getScores(placardId, currentSport);
            setScoreData(response);
        } catch (error) {
            setScoreData(null);
        }
    }, [placardId, sport, placardInfo]);

    const fetchTeams = useCallback(async () => {
        if (placardId === 'default') return;
        try {
            const info = await apiManager.getPlacardInfo(placardId, sport);
            if (info) {
                setPlacardInfo(info);
                setSport(info.sport);

                // Only replace the sport parameter while keeping the same URL structure
                if (sportParam !== info.sport) {
                    const currentPath = window.location.pathname;
                    const newPath = currentPath.replace(`/${sportParam}/`, `/${info.sport}/`);
                    navigate(newPath, { replace: true });
                }

                const home = await apiManager.getTeamInfo(info.firstTeamId);
                const away = await apiManager.getTeamInfo(info.secondTeamId);
                setHomeTeam(home);
                setAwayTeam(away);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, [placardId, sport, sportParam, navigate]);

    const fetchSportConfigurations = useCallback(async () => {
        try {
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
            console.error('Error fetching sport configurations:', error);
        }
    }, []);

    const fetchSliderData = useCallback(async () => {
        if (placardId && sport && shouldPollScoreHistory) {
            try {
                const response = await apiManager.getScoreHistory(placardId, sport);
                const hasScores = response.points.length > 0;

                setSliderData((prev) => ({
                    ...prev,
                    hasData: { ...prev.hasData, scores: hasScores },
                }));

                if (hasScores) setShouldPollScoreHistory(false);
            } catch {
                setSliderData((prev) => ({
                    ...prev,
                    hasData: { ...prev.hasData, scores: false },
                }));
            }
        }

        if (placardId && sport && shouldPollCardEvents && !nonCardSports.includes(sport) && nonCardSports.length > 0) {
            try {
                const response = await apiManager.getCards(placardId, sport);
                const hasCards = response.cards.length > 0;

                setSliderData((prev) => ({
                    ...prev,
                    hasData: { ...prev.hasData, cards: hasCards },
                }));

                if (hasCards) setShouldPollCardEvents(false);
            } catch {
                setSliderData((prev) => ({
                    ...prev,
                    hasData: { ...prev.hasData, cards: false },
                }));
            }
        } else if (nonCardSports.includes(sport)) {
            setShouldPollCardEvents(false);
        }

        if (placardId && shouldPollPlayers && homeTeam?.id && awayTeam?.id) {
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

                if (hasPlayers) setShouldPollPlayers(false);
            } catch {
                setSliderData((prev) => ({
                    ...prev,
                    hasData: { ...prev.hasData, players: false },
                }));
            }
        }
    }, [placardId, sport, nonCardSports, shouldPollScoreHistory, shouldPollCardEvents,
        shouldPollPlayers, homeTeam?.id, awayTeam?.id]);

    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchTeams(),
                fetchSportConfigurations(),
            ]);

            fetchScores();
        };

        loadInitialData();

        const scoresInterval = setInterval(fetchScores, 5000);
        const teamsInterval = setInterval(fetchTeams, 5000);

        return () => {
            clearInterval(scoresInterval);
            clearInterval(teamsInterval);
        };
    }, [fetchScores, fetchSportConfigurations, fetchTeams]);

    useEffect(() => {
        const loadSliderData = async () => {
            await fetchSliderData();
        };

        loadSliderData();

        const intervals: number[] = [];

        if (shouldPollScoreHistory) {
            intervals.push(window.setInterval(fetchSliderData, 5000));
        }

        if (shouldPollCardEvents) {
            intervals.push(window.setInterval(fetchSliderData, 5000));
        }

        if (shouldPollPlayers) {
            intervals.push(window.setInterval(fetchSliderData, 5000));
        }

        return () => {
            intervals.forEach((interval) => window.clearInterval(interval));
        };
    }, [fetchSliderData, shouldPollScoreHistory, shouldPollCardEvents, shouldPollPlayers]);

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
