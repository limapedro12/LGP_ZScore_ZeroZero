import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import { Sport } from '../../utils/scorersTableUtils';
import TeamLogo from '../../components/scorersTable/teamLogo';
import CentralConsole from '../../components/scorersTable/centralConsole';
import '../../styles/scorersTable.scss';
import clockPaused from '../../../public/icons/clock_paused.png';
import clockResumed from '../../../public/icons/clock_resumed.png';
import clockRewind from '../../../public/icons/rewind-icon.png';
import clockForward from '../../../public/icons/forward-icon.png';
import apiManager from '../../api/apiManager';

const ScorersTable = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();
    const [timerRunning, setTimerRunning] = React.useState(false);
    const sport = (sportParam as Sport) || 'volleyball';
    const [nonTimerSports, setNonTimerSports] = useState<string[]>([]);

    // Adjustable time values in seconds
    const [rewindValue, setRewindValue] = useState(10);
    const [forwardValue, setForwardValue] = useState(10);

    // Available options for time adjustments
    const timeOptions = [5, 10, 15, 30, 60];

    const handleTimerToggle = () => {
        if (!placardIdParam || !sport) return;

        try {
            if (timerRunning) {
                apiManager.stopTimer(placardIdParam, sport);
            } else {
                apiManager.startTimer(placardIdParam, sport);
            }
            setTimerRunning(!timerRunning);
        } catch (error) {
            console.error('Error toggling timer:', error);
        }
    };

    const handleTimerAdjust = (seconds: number) => {
        if (!placardIdParam || !sport) return;

        try {
            apiManager.adjustTimer(placardIdParam, sport, seconds);
        } catch (error) {
            console.error(`Error adjusting timer by ${seconds} seconds:`, error);
        }
    };

    const changeRewindValue = () => {
        // Cycle through time options
        const currentIndex = timeOptions.indexOf(rewindValue);
        const nextIndex = (currentIndex + 1) % timeOptions.length;
        setRewindValue(timeOptions[nextIndex]);
    };

    const changeForwardValue = () => {
        // Cycle through time options
        const currentIndex = timeOptions.indexOf(forwardValue);
        const nextIndex = (currentIndex + 1) % timeOptions.length;
        setForwardValue(timeOptions[nextIndex]);
    };

    const fetchNonTimerSports = React.useCallback(async () => {
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

    useEffect(() => {
        fetchNonTimerSports();
    }, [fetchNonTimerSports]);

    const isNonTimerSport = nonTimerSports.includes(sport);

    const containerClassName =
        `scorers-table-container d-md-flex flex-column justify-content-start align-items-center vh-100 p-0 
        overflow-y-auto overflow-md-y-hidden overflow-x-hidden d-none`;

    const mobileContainerClassName =
        'd-flex flex-column d-md-none justify-content-around align-items-center vh-100 p-3';

    return (
        <>
            <Container fluid className={containerClassName} style={{ backgroundColor: '#2c3e50' }}>
                <Row className="w-100 d-none d-md-flex align-items-center my-auto">
                    <Col md={3} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/slb.png" teamName="Benfica" />
                    </Col>
                    <Col md={6} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <CentralConsole sport={sport} />
                    </Col>
                    <Col md={3} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/scp.png" teamName="Sporting" />
                    </Col>
                </Row>
                {/* Timer Button Row */}
                {!isNonTimerSport && (
                    <Row className="w-100 d-none d-md-flex align-items-center justify-content-center p-3">
                        <Col md={2} className="d-flex flex-column align-items-center">
                            <div className="d-flex align-items-center mb-2">
                                <p className="text-white fw-bold fs-5 mb-0 me-2">+</p>
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    className="value-indicator"
                                    onClick={changeRewindValue}
                                >
                                    {rewindValue}
                                    s
                                </Button>
                            </div>
                            <Button
                                variant="light"
                                className="event-button--large rounded-circle"
                                aria-label={`Recuar ${rewindValue} segundos`}
                                onClick={() => handleTimerAdjust(rewindValue)}
                            >
                                <img
                                    src={clockRewind}
                                    alt=""
                                    className="event-icon"
                                />
                            </Button>
                        </Col>
                        <Col md={2} className="d-flex flex-column align-items-center">
                            <p className="text-white fw-bold fs-5 mb-2">
                                {timerRunning ? 'Parar' : 'Iniciar'}
                            </p>
                            <Button
                                variant="light"
                                className="event-button--large rounded-circle"
                                aria-label={timerRunning ? 'Parar cronómetro' : 'Iniciar cronómetro'}
                                onClick={handleTimerToggle}
                            >
                                <img
                                    src={timerRunning ? clockPaused : clockResumed}
                                    alt=""
                                    className="event-icon"
                                />
                            </Button>
                        </Col>
                        <Col md={2} className="d-flex flex-column align-items-center">
                            <div className="d-flex align-items-center mb-2">
                                <p className="text-white fw-bold fs-5 mb-0 me-2">-</p>
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    className="value-indicator"
                                    onClick={changeForwardValue}
                                >
                                    {forwardValue}
                                    s
                                </Button>
                            </div>
                            <Button
                                variant="light"
                                className="event-button--large rounded-circle"
                                aria-label={`Avançar ${forwardValue} segundos`}
                                onClick={() => handleTimerAdjust(-forwardValue)}
                            >
                                <img
                                    src={clockForward}
                                    alt=""
                                    className="event-icon"
                                />
                            </Button>
                        </Col>
                    </Row>
                )}
                {/* Corrigir Button Row */}
                <Row className="w-100 d-none d-md-flex align-items-center justify-content-center p-5">
                    <Col md={4} className="d-flex flex-column align-items-center">
                        <p className="text-white fw-bold fs-5 mb-2">Corrigir</p>
                        <Button
                            variant="primary"
                            className="event-button--large rounded-circle"
                            aria-label="Corrigir"
                        />
                    </Col>
                </Row>
            </Container>

            <Container fluid className={mobileContainerClassName} style={{ backgroundColor: '#2c3e50' }}>
                <Row className="w-100 justify-content-around align-items-center mt-3">
                    <Col className="p-0 d-flex flex-column align-items-center justify-content-center">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/slb.png" teamName="Benfica" />
                    </Col>
                    <Col className="p-0 d-flex flex-column align-items-center justify-content-center">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/scp.png" teamName="Sporting" />
                    </Col>
                </Row>
                <Row className="w-100 mt-4 justify-content-center">
                    <div className="d-flex flex-column align-items-center">
                        <CentralConsole sport={sport} />
                    </div>
                </Row>
                {/* Timer Buttons Row (Mobile) */}
                {!isNonTimerSport && (
                    <Row className="w-100 py-3 justify-content-center">
                        <Col xs={12} className="d-flex justify-content-center timer-controls-mobile">
                            <div className="d-flex flex-column align-items-center mx-2">
                                <div className="d-flex align-items-center mb-2">
                                    <p className="text-white fw-bold fs-6 mb-0 me-1">+</p>
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        className="value-indicator-mobile"
                                        onClick={changeRewindValue}
                                    >
                                        {rewindValue}
                                        {' '}

                                    </Button>
                                </div>
                                <Button
                                    variant="light"
                                    className="event-button--large rounded-circle"
                                    aria-label={`+ ${rewindValue} segundos`}
                                    onClick={() => handleTimerAdjust(rewindValue)}
                                >
                                    <img
                                        src={clockRewind}
                                        alt=""
                                        className="event-icon"
                                    />
                                </Button>
                            </div>
                            <div className="d-flex flex-column align-items-center mx-2">
                                <p className="text-white fw-bold fs-5 mb-2 text-center">
                                    {timerRunning ? 'Parar' : 'Iniciar'}
                                </p>
                                <Button
                                    variant="light"
                                    className="event-button--large rounded-circle"
                                    aria-label={timerRunning ? 'Parar cronómetro' : 'Iniciar cronómetro'}
                                    onClick={handleTimerToggle}
                                >
                                    <img
                                        src={timerRunning ? clockPaused : clockResumed}
                                        alt=""
                                        className="event-icon"
                                    />
                                </Button>
                            </div>
                            <div className="d-flex flex-column align-items-center mx-2">
                                <div className="d-flex align-items-center mb-2">
                                    <p className="text-white fw-bold fs-6 mb-0 me-1">-</p>
                                    <Button
                                        variant="outline-light"
                                        size="sm"
                                        className="value-indicator-mobile"
                                        onClick={changeForwardValue}
                                    >
                                        {forwardValue}

                                    </Button>
                                </div>
                                <Button
                                    variant="light"
                                    className="event-button--large rounded-circle"
                                    aria-label={`Avançar ${forwardValue} segundos`}
                                    onClick={() => handleTimerAdjust(-forwardValue)}
                                >
                                    <img
                                        src={clockForward}
                                        alt=""
                                        className="event-icon"
                                    />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}
                {/* Corrigir Button Row (Mobile) */}
                <Row className="w-100 justify-content-center p-3">
                    <Col xs={12} className="d-flex flex-column align-items-center">
                        <p className="text-white fw-bold fs-5 mb-2 text-center">Corrigir</p>
                        <Button
                            variant="primary"
                            className="event-button--large rounded-circle"
                            aria-label="Corrigir"
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ScorersTable;
