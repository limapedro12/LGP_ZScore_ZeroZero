import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiManager, { ApiTeam, ScoreResponse, ApiPlayer } from '../api/apiManager';
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
    const [homeTeam, setHomeTeam] = useState<ApiTeam | null>(null);
    const [awayTeam, setAwayTeam] = useState<ApiTeam | null>(null);
    const [timeoutStatus, setTimeoutStatus] = useState('inactive');

    const [noPeriodBoxSports, setNoPeriodBoxSports] = useState<string[]>([]);
    const [noShotClockSports, setNoShotClockSports] = useState<string[]>([]);
    const [nonTimerSports, setNonTimerSports] = useState<string[]>([]);
    const [nonCardSports, setNonCardSports] = useState<string[]>([]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.md);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [sliderDataLoaded, setSliderDataLoaded] = useState(false);

    const [sliderItemsCount, setSliderItemsCount] = useState(4);
    const [sliderIndex, setSliderIndex] = useState(0);
    const [hasSliderData, setHasSliderData] = useState({
        scores: false,
        players: false,
        cards: false,
    });

    const [shouldPollScoreHistory, setShouldPollScoreHistory] = useState(true);
    const [shouldPollCardEvents, setShouldPollCardEvents] = useState(true);
    const [shouldPollPlayers, setShouldPollPlayers] = useState(true);

    const [homeTeamLineup, setHomeTeamLineup] = useState<ApiPlayer[]>([]);
    const [awayTeamLineup, setAwayTeamLineup] = useState<ApiPlayer[]>([]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINTS.md);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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

    const fetchTeams = useCallback(async () => {
        if (placardId === 'default') return;
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
                setHasSliderData((prev) => ({ ...prev, scores: hasScores }));
                if (hasScores) setShouldPollScoreHistory(false);
            } catch {
                setHasSliderData((prev) => ({ ...prev, scores: false }));
            }
        }

        if (placardId && sport && shouldPollCardEvents && !nonCardSports.includes(sport)) {
            try {
                const response = await apiManager.getCards(placardId, sport);
                const hasCards = response.cards.length > 0;
                setHasSliderData((prev) => ({ ...prev, cards: hasCards }));
                if (hasCards) setShouldPollCardEvents(false);
            } catch {
                setHasSliderData((prev) => ({ ...prev, cards: false }));
            }
        } else if (nonCardSports.includes(sport)) {
            setShouldPollCardEvents(false);
        }

        if (placardId && sport && shouldPollPlayers) {
            try {
                const response = await apiManager.getTeamPlayers();
                const hasPlayers = response.length > 0;
                setHasSliderData((prev) => ({ ...prev, players: hasPlayers }));
                if (hasPlayers) setShouldPollPlayers(false);
            } catch {
                setHasSliderData((prev) => ({ ...prev, players: false }));
            }
        }
    }, [placardId, sport, nonCardSports, shouldPollScoreHistory, shouldPollCardEvents, shouldPollPlayers]);

    useEffect(() => {
        const loadInitialData = async () => {
            setDataLoaded(false);
            await Promise.all([
                fetchScores(),
                fetchSportConfigurations(),
                fetchTeams(),
            ]);
            setDataLoaded(true);
        };

        loadInitialData();

        const scoresInterval = setInterval(fetchScores, 5000);
        const teamsInterval = setInterval(fetchTeams, 5000);

        return () => {
            clearInterval(scoresInterval);
            clearInterval(teamsInterval);
        };
    }, [fetchScores, fetchSportConfigurations, fetchTeams]);

    const fetchTeamLineups = useCallback(async () => {
        if (!placardId || !homeTeam?.id || !awayTeam?.id) return;

        try {
            const [homeLineup, awayLineup] = await Promise.all([
                apiManager.getTeamLineup(placardId, homeTeam.id),
                apiManager.getTeamLineup(placardId, awayTeam.id),
            ]);

            setHomeTeamLineup(Array.isArray(homeLineup) ? homeLineup : []);
            setAwayTeamLineup(Array.isArray(awayLineup) ? awayLineup : []);
        } catch (error) {
            console.error('Error fetching team lineups:', error);
        }
    }, [placardId, homeTeam?.id, awayTeam?.id]);

    useEffect(() => {
        if (homeTeam?.id && awayTeam?.id) {
            fetchTeamLineups();

            // Refresh lineups every 30 seconds
            const lineupsInterval = setInterval(fetchTeamLineups, 30000);
            return () => clearInterval(lineupsInterval);
        }
        return undefined;
    }, [homeTeam?.id, awayTeam?.id, fetchTeamLineups]);

    useEffect(() => {
        const loadSliderData = async () => {
            setSliderDataLoaded(false);
            await fetchSliderData();
            setSliderDataLoaded(true);
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

    useEffect(() => {
        const interval = window.setInterval(() => {
            setSliderIndex((prev) => (prev + 1) % sliderItemsCount);
        }, 10000);
        return () => window.clearInterval(interval);
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
        );
    }, [sport, noShotClockSports, noPeriodBoxSports, nonTimerSports, timeoutStatus, scoreData, dataLoaded]);

    if (!sliderDataLoaded) return null;

    return (
        <Container fluid className="scoreboard-container d-flex flex-column min-vh-100 p-0">
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
                            sport={sport} team="home" placardId={placardId}
                            sliderIndex={sliderIndex}
                            onItemsCountChange={setSliderItemsCount}
                            teamColor={homeTeam?.color}
                            sliderData={hasSliderData}
                            teamLineup={homeTeamLineup}

                        />
                    </Col>

                    <Col xs={12} md={4} lg={4} className="d-flex flex-column align-items-center justify-content-center h-100">
                        {Center}
                    </Col>

                    <Col xs={12} md={4} lg={4} className="pe-0 h-100 overflow-hidden">
                        <Slider
                            sport={sport} team="away" placardId={placardId}
                            sliderIndex={sliderIndex}
                            onItemsCountChange={setSliderItemsCount}
                            teamColor={awayTeam?.color}
                            sliderData={hasSliderData}
                            teamLineup={awayTeamLineup}

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
                                sliderIndex={sliderIndex}
                                onItemsCountChange={setSliderItemsCount}
                                teamColor={homeTeam?.color}
                                sliderData={hasSliderData}
                                teamLineup={homeTeamLineup}
                            />
                        </Col>
                        <Col className="pe-0 h-100 overflow-hidden">
                            <Slider
                                sport={sport} team="away" placardId={placardId}
                                sliderIndex={sliderIndex}
                                onItemsCountChange={setSliderItemsCount}
                                teamColor={awayTeam?.color}
                                sliderData={hasSliderData}
                                teamLineup={awayTeamLineup}
                            />
                        </Col>
                    </Row>
                </Row>
            )}
        </Container>
    );
};

export default ScoreBoard;
