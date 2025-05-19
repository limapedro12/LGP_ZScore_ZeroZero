import React, { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useParams, useNavigate } from 'react-router-dom';
import { Sport } from '../../utils/scorersTableUtils';
import TeamLogo from '../../components/scorersTable/teamLogo';
import CentralConsole from '../../components/scorersTable/centralConsole';
import '../../styles/scorersTable.scss';
import clockPaused from '../../../public/icons/clock_paused.png';
import clockResumed from '../../../public/icons/clock_resumed.png';
import clockEdit from '../../../public/icons/edit-clock-icon.png';
import apiManager from '../../api/apiManager';

interface TeamData {
    name: string;
    logoSrc: string;
}

const ScorersTable = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();
    const navigate = useNavigate();
    const [timerRunning, setTimerRunning] = useState(false);
    const sport = (sportParam as Sport) || 'volleyball';
    const [nonTimerSports, setNonTimerSports] = useState<string[]>([]);

    // Team data - in a real app, this would be fetched from an API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [teams, setTeams] = useState<{ home: TeamData, away: TeamData }>({
        home: { name: 'Benfica', logoSrc: '/teamLogos/slb.png' },
        away: { name: 'Sporting', logoSrc: '/teamLogos/scp.png' },
    });

    const isNonTimerSport = nonTimerSports.includes(sport);

    const fetchTimerStatus = useCallback(async () => {
        if (!placardIdParam || !sport) return;

        try {
            const response = await apiManager.getTimerStatus(placardIdParam, sport);
            setTimerRunning(response.status === 'running');
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [placardIdParam, sport]);

    const fetchNonTimerSports = useCallback(async () => {
        try {
            const response = await apiManager.getNonTimerSports();
            setNonTimerSports(Array.isArray(response?.sports) ? response.sports : []);
        } catch (error) {
            console.error('Error fetching non-timer sports:', error);
            setNonTimerSports([]);
        }
    }, []);

    useEffect(() => {
        if (!isNonTimerSport && placardIdParam && sport) {
            fetchTimerStatus();
        }
    }, [fetchTimerStatus, placardIdParam, sport, isNonTimerSport]);
    useEffect(() => {
        fetchNonTimerSports();
    }, [fetchNonTimerSports, placardIdParam]);

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

    const navigateToClockAdjustment = () => {
        navigate(`/scorersTable/${sport}/${placardIdParam}/clockAdjustment`);
    };

    const handleCorrection = () => {
        console.log('Correction button clicked - functionality to be implemented');
    };


    const renderControlButtons = (isMobile: boolean = false) => {
        if (isNonTimerSport) {
            return (
                <Row className={`w-100 justify-content-center my-auto ${isMobile ? '' : 'd-none d-md-flex'}`}>
                    <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                        <p className="text-white fw-bold fs-5 mb-2 text-center">Corrigir</p>
                        <Button
                            variant="primary"
                            className="event-button--large rounded-circle"
                            aria-label="Corrigir"
                            onClick={handleCorrection}
                        />
                    </Col>
                </Row>
            );
        }

        return (
            <Row className={`w-100 justify-content-center my-auto ${isMobile ? '' : 'd-none d-md-flex'}`}>
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
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
                </Col>
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                    <p className="text-white fw-bold fs-5 mb-2 text-center">Corrigir</p>
                    <Button
                        variant="primary"
                        className="event-button--large rounded-circle"
                        aria-label="Corrigir"
                        onClick={handleCorrection}
                    />
                </Col>
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                    <div className="d-flex flex-column align-items-center mx-2">
                        <p className="text-white fw-bold fs-5 mb-2 text-center">Editar tempo</p>
                        <Button
                            variant="light"
                            className="event-button--large rounded-circle"
                            aria-label="Ajustar timer manualmente"
                            onClick={navigateToClockAdjustment}
                        >
                            <img src={clockEdit} alt="" className="event-icon" />
                        </Button>
                    </div>
                </Col>
            </Row>
        );
    };

    return (
        <>
            {/* Desktop Layout */}
            <Container
                fluid className="scorers-table-container d-none
            d-md-flex flex-column justify-content-start align-items-center
            vh-100 p-0 overflow-y-auto overflow-md-y-hidden overflow-x-hidden"
            >
                {/* Teams and Central Console */}
                <Row className="w-100 align-items-center my-auto">
                    <Col md={3} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <TeamLogo logoSrc={teams.home.logoSrc} teamName={teams.home.name} />
                    </Col>
                    <Col md={6} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <CentralConsole sport={sport} />
                    </Col>
                    <Col md={3} className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <TeamLogo logoSrc={teams.away.logoSrc} teamName={teams.away.name} />
                    </Col>
                </Row>

                {renderControlButtons(false)}
            </Container>

            {/* Mobile Layout */}
            <Container
                fluid className="d-flex d-md-none flex-column
            justify-content-around align-items-center vh-100 p-3" style={{ backgroundColor: '#2c3e50' }}
            >
                {/* Teams */}
                <Row className="w-100 justify-content-around align-items-center mt-3">
                    <Col className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <TeamLogo logoSrc={teams.home.logoSrc} teamName={teams.home.name} />
                    </Col>
                    <Col className="p-0 d-flex flex-column align-items-center justify-content-center">
                        <TeamLogo logoSrc={teams.away.logoSrc} teamName={teams.away.name} />
                    </Col>
                </Row>

                {/* Central Console */}
                <Row className="w-100 mt-4 justify-content-center">
                    <div className="d-flex flex-column align-items-center">
                        <CentralConsole sport={sport} />
                    </div>
                </Row>

                {renderControlButtons(true)}
            </Container>
        </>
    );
};

export default ScorersTable;
