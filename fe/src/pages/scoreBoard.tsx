import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiManager, { ApiTeam, ScoreResponse,  Sport, ApiGame, SliderData, ApiPlayer, Substitution } from '../api/apiManager';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Timer from '../components/scoreboard/timer';
import TimeoutTimer from '../components/scoreboard/timeoutTimer';
import TimeoutCounter from '../components/scoreboard/timeoutCounter';
import ScoresRow from '../components/scoreboard/scoresCounter';
import SetBox from '../components/scoreboard/setBox';
import ShotClock from '../components/scoreboard/shotClock';
import Slider from '../components/scoreboard/slider';
import '../styles/scoreBoard.scss';
import { BREAKPOINTS } from '../media-queries';
import { correctSportParameter } from '../utils/navigationUtils';
import FoulsCounter from '../components/foulsCounter';
import SubstitutionModal from '../components/scoreboard/substitutionModal';

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


    const [hasPeriodBox, setHasPeriodBox] = useState<boolean>(false);
    const [hasShotClock, setHasShotClock] = useState<boolean>(false);
    const [hasTimer, setHasTimer] = useState<boolean>(false);
    const [hasCards, setHasCards] = useState<boolean>(false);
    const [hasFouls, setHasFouls] = useState<boolean>(false);

    const [isMobile, setIsMobile] = useState(window.innerWidth < BREAKPOINTS.md);

    const [shouldPollScoreHistory, setShouldPollScoreHistory] = useState(true);
    const [shouldPollCardEvents, setShouldPollCardEvents] = useState(true);
    const [shouldPollPlayers, setShouldPollPlayers] = useState(true);

    const latestSubstitutionRef = React.useRef<Substitution | null>(null);
    const [newSubstitution, setNewSubstitution] = useState<Substitution | null>(null);
    const [shouldPollFouls, setShouldPollFouls] = useState(true);

    const [sliderData, setSliderData] = useState<SliderData>({
        data: {
            home: { lineup: [] },
            away: { lineup: [] },
        },
        hasData: {
            scores: false,
            cards: false,
            players: false,
            fouls: false,
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

                const configResp = await apiManager.getSportConfig(info?.sport || sport);
                const config = configResp?.config || {};

                setHasPeriodBox('periodEndScore' in config);
                setHasShotClock('shotClock' in config);
                setHasTimer('periodDuration' in config);
                setHasCards('cards' in config);
                setHasFouls('foulsPenaltyThreshold' in config);

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
        if (!placardId || !sport || !hasCards) return;

        try {
            const response = await apiManager.getCards(placardId, sport);
            const hasCards = response.cards.length > 0;

            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, cards: hasCards },
            }));

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
    }, [placardId, sport, hasCards, shouldPollCardEvents]);

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

    const fetchFouls = useCallback(async () => {
        if (!placardId || !sport) return;

        try {
            const response = await apiManager.getFouls(placardId, sport);
            const hasFouls = response.fouls.length > 0;

            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, fouls: hasFouls },
            }));

            if (hasFouls && shouldPollFouls) {
                setShouldPollFouls(false);
            }
        } catch (error) {
            console.error('Error fetching fouls:', error);
            setSliderData((prev) => ({
                ...prev,
                hasData: { ...prev.hasData, fouls: false },
            }));
        }
    }, [placardId, sport, shouldPollFouls]);

    useEffect(() => {
        fetchScoreHistory();
        fetchCardEvents();
        fetchPlayers();
        fetchFouls();

        const intervals: number[] = [];

        if (shouldPollScoreHistory) {
            intervals.push(window.setInterval(fetchScoreHistory, 5000));
        }

        if (shouldPollCardEvents && hasCards) {
            intervals.push(window.setInterval(fetchCardEvents, 5000));
        }

        if (shouldPollPlayers) {
            intervals.push(window.setInterval(fetchPlayers, 5000));
        }

        if (shouldPollFouls && hasFouls) {
            intervals.push(window.setInterval(fetchFouls, 5000));
        }

        return () => {
            intervals.forEach((interval) => window.clearInterval(interval));
        };
    }, [
        fetchScoreHistory,
        fetchCardEvents,
        fetchPlayers,
        fetchFouls,
        shouldPollScoreHistory,
        shouldPollCardEvents,
        shouldPollPlayers,
        shouldPollFouls,
        hasCards,
        hasFouls,
    ]);

    useEffect(() => {
        let timeoutId: number;

        const fetchLatestSubstitution = async () => {
            if (!placardId || !sport) return;

            try {
                const response = await apiManager.getSubstitutionStatus(placardId, sport);
                const latest = response?.substitutions?.[response?.substitutions?.length - 1] || null;
                console.log(latest, latestSubstitutionRef.current);
                if (
                    (!latestSubstitutionRef.current && latest) ||
                (latestSubstitutionRef.current && latest && latestSubstitutionRef.current.eventId !== latest.eventId)
                ) {
                    setNewSubstitution(latest);
                    latestSubstitutionRef.current = latest;
                    if (timeoutId) clearTimeout(timeoutId);
                    timeoutId = window.setTimeout(() => {
                        setNewSubstitution(null);
                    }, 3000);
                }
            } catch (error) {
                console.error('Error fetching latest substitution:', error);
            }
        };

        fetchLatestSubstitution();
        const intervalId = window.setInterval(fetchLatestSubstitution, 5000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [placardId, sport]);


    const Center = useMemo(() => (
        <>
            {sport && hasShotClock && (
                <div className="shot-clock-wrapper w-100 d-flex justify-content-center">
                    <ShotClock />
                </div>
            )}

            {sport && !hasPeriodBox ? (
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

            {sport && hasTimer && (
                <div className="timer-wrapper w-100 d-flex justify-content-center">
                    <Timer />
                </div>
            )}

            <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                <TimeoutCounter />
            </div>

            {sport && hasFouls && (
                <div className="timeout-counter-wrapper w-100 d-flex justify-content-center">
                    <FoulsCounter />
                </div>
            )}
        </>
    ), [sport, hasShotClock, hasPeriodBox, hasTimer, timeoutStatus, scoreData, hasFouls]);

    return (
        <Container fluid className="scoreboard-container d-flex flex-column min-vh-100 p-0">
            <SubstitutionModal
                show={!!newSubstitution}
                substitution={newSubstitution}
                onHide={() => setNewSubstitution(null)}
                teamColor={
                    (() => {
                        if (newSubstitution?.team === 'home') {
                            return homeTeam?.color;
                        }
                        if (newSubstitution?.team === 'away') {
                            return awayTeam?.color;
                        }
                        return undefined;
                    })()
                }
                logoUrl={
                    (() => {
                        if (newSubstitution?.team === 'home') {
                            return homeTeam?.logoURL;
                        }
                        if (newSubstitution?.team === 'away') {
                            return awayTeam?.logoURL;
                        }
                        return undefined;
                    })()
                }
            />
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
