import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronUp, ChevronDown } from 'react-bootstrap-icons';
import apiManager from '../../api/apiManager';
import '../../styles/timeAdjustment.scss';

const pad = (n: number) => n.toString().padStart(2, '0');

const TEAMS = [
    { label: 'Casa', value: 'home' },
    { label: 'Fora', value: 'away' },
];

const ShotClockAdjustment: React.FC = () => {
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();
    const navigate = useNavigate();

    const [seconds, setSeconds] = useState<number>(24);
    const [team, setTeam] = useState<'home' | 'away'>('home');
    const [maxSeconds, setMaxSeconds] = useState<number>(24);


    useEffect(() => {
        const checkNoShotClock = async () => {
            if (!sport) {
                return;
            }
            try {
                const response = await apiManager.getNoShotClockSports();
                if (Array.isArray(response?.sports) && response.sports.includes(sport)) {
                    navigate(`/scorersTable/${sport}/${placardId}`);
                }
            } catch (error) {
                console.error('Error checking no-shotclock sports:', error);
            }
        };
        checkNoShotClock();
    }, [sport, placardId, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            if (!sport || !placardId) return;
            try {
                const configResponse = await apiManager.getSportConfig(sport);
                if (configResponse?.config?.shotClock) {
                    setMaxSeconds(configResponse.config.shotClock);
                    setSeconds(configResponse.config.shotClock);
                }
                const status = await apiManager.getShotClockStatus(placardId, sport);
                if (status) {
                    setSeconds(status.remaining_time || configResponse?.config?.shotClock || 24);
                    if (status.team === 'home' || status.team === 'away') setTeam(status.team);
                }
            } catch (error) {
                console.error('Error fetching shot clock data:', error);
            }
        };
        fetchData();
    }, [sport, placardId]);

    const handleGoBack = () => {
        navigate(`/scorersTable/${sport}/${placardId}`);
    };

    const handleSave = async () => {
        if (!sport || !placardId) return;
        try {
            await apiManager.setShotClock(placardId, sport, team, seconds);
            navigate(`/scorersTable/${sport}/${placardId}`);
        } catch (error) {
            console.error('Error setting shot clock:', error);
        }
    };

    const incrementSeconds = () => setSeconds((prev) => Math.min(prev + 1, maxSeconds));
    const decrementSeconds = () => setSeconds((prev) => Math.max(prev - 1, 0));

    return (
        <Container fluid className="time-adjustment-container p-0 d-flex flex-column min-vh-100">
            {/* Header */}
            <Row className="header-row gx-0 pt-4 pb-4 px-4 align-items-center">
                <Col xs="auto">
                    <Button variant="link" onClick={handleGoBack} className="p-0 me-3 back-button">
                        <ArrowLeft color="white" size={36} className="thicker-arrow-icon" />
                    </Button>
                </Col>
                <Col>
                    <h1 className="page-title mb-0 text-center">Ajustar Shot Clock</h1>
                </Col>
                <Col xs="auto" style={{ visibility: 'hidden' }}>
                    <ArrowLeft color="white" size={36} />
                </Col>
            </Row>

            {/* Main Content */}
            <Row className="flex-grow-1 justify-content-center align-items-center w-100 m-0 py-auto">
                <Col xs={12} md={11} lg={10} className="p-0 d-flex justify-content-center">
                    <div className="p-5 rounded-4 time-adjustment-panel w-100">
                        <div className="d-flex flex-row align-items-center justify-content-center gap-4 mb-5 time-control-group">
                            {/* Seconds */}
                            <div className="d-flex flex-column align-items-center">
                                <Button variant="outline-light" className="mb-3 rounded-circle time-btn" onClick={incrementSeconds}>
                                    <ChevronUp size={40} />
                                </Button>
                                <div className="display-1 fw-bold text-white timer-value">
                                    {pad(seconds)}
                                </div>
                                <Button variant="outline-light" className="mt-3 rounded-circle time-btn" onClick={decrementSeconds}>
                                    <ChevronDown size={40} />
                                </Button>
                                <div className="text-white-50 mt-3 fs-5">Segundos</div>
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-center period-section">
                            <div className="text-white fw-semibold mb-3 fs-4">Equipa</div>
                            <div className="d-flex gap-3 period-pills">
                                {TEAMS.map((t) => (
                                    <Button
                                        key={t.value}
                                        variant={team === t.value ? 'primary' : 'outline-light'}
                                        className={`period-pill p-2 ${team === t.value ? 'active' : ''}`}
                                        onClick={() => setTeam(t.value as 'home' | 'away')}
                                    >
                                        {t.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex justify-content-center gap-4 mt-5">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="px-4 py-2 rounded-pill cancel-btn"
                                onClick={handleGoBack}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="success"
                                size="lg"
                                className="px-4 py-2 rounded-pill fw-bold save-btn"
                                onClick={handleSave}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ShotClockAdjustment;
