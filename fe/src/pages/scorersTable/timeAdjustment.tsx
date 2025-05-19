import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronUp, ChevronDown } from 'react-bootstrap-icons';
import apiManager from '../../api/apiManager';
import '../../styles/timeAdjustment.scss';

const pad = (n: number) => n.toString().padStart(2, '0');

interface SportConfig {
  periods: number;
  periodDuration: number;
}

const TimeAdjustment: React.FC = () => {
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();
    const navigate = useNavigate();

    // State management
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);
    const [period, setPeriod] = useState<number>(1);
    const [sportConfig, setSportConfig] = useState<SportConfig>({
        periods: 5,
        periodDuration: 600,
    });

    const periods = Array.from({ length: sportConfig.periods }, (_, i) => i + 1);
    const maxMinutes = Math.floor(sportConfig.periodDuration / 60);
    const maxSeconds = 59;

    useEffect(() => {
        const fetchData = async () => {
            if (!sport || !placardId) return;

            try {
                const timerResponse = await apiManager.getTimerStatus(placardId, sport);
                const totalSeconds = timerResponse.remaining_time;
                setMinutes(Math.floor(totalSeconds / 60));
                setSeconds(totalSeconds % 60);
                setPeriod(timerResponse.period || 1);

                const configResponse = await apiManager.getSportConfig(sport);
                if (configResponse && configResponse.config) {
                    setSportConfig({
                        periods: configResponse.config.periods || 5,
                        periodDuration: configResponse.config.periodDuration || 600,
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [sport, placardId]);

    // Navigation and submission handlers
    const handleGoBack = () => {
        navigate(`/scorersTable/${sport}/${placardId}`);
    };

    const handleSaveTime = async () => {
        if (!sport || !placardId) return;
        const totalSeconds = (minutes * 60) + seconds;
        try {
            await apiManager.setTimer(placardId, sport, totalSeconds, period);
            navigate(`/scorersTable/${sport}/${placardId}`);
        } catch (error) {
            console.error('Error setting timer:', error);
        }
    };

    // Time controls
    const incrementMinutes = () => setMinutes((prev) => Math.min(prev + 1, maxMinutes));
    const decrementMinutes = () => setMinutes((prev) => (prev > 0 ? prev - 1 : 0));
    const incrementSeconds = () => {
        if (seconds === maxSeconds) {
            if (minutes < maxMinutes) {
                setSeconds(0);
                incrementMinutes();
            }
        } else {
            setSeconds((prev) => prev + 1);
        }
    };
    const decrementSeconds = () => {
        if (seconds === 0 && minutes > 0) {
            setSeconds(maxSeconds);
            decrementMinutes();
        } else if (seconds > 0) {
            setSeconds((prev) => prev - 1);
        }
    };

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
                    <h1 className="page-title mb-0 text-center">Ajustar Tempo Manualmente</h1>
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
                            {/* Minutes */}
                            <div className="d-flex flex-column align-items-center">
                                <Button variant="outline-light" className="mb-3 rounded-circle time-btn" onClick={incrementMinutes}>
                                    <ChevronUp size={40} />
                                </Button>
                                <div className="display-1 fw-bold text-white timer-value">
                                    {pad(minutes)}
                                </div>
                                <Button variant="outline-light" className="mt-3 rounded-circle time-btn" onClick={decrementMinutes}>
                                    <ChevronDown size={40} />
                                </Button>
                                <div className="text-white-50 mt-3 fs-5">Minutos</div>
                            </div>

                            {/* Colon */}
                            <div className="d-flex flex-column align-items-center justify-content-center timer-colon-container">
                                <div className="display-1 fw-bold text-white colon">:</div>
                            </div>

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

                        {/* Period Pills */}
                        <div className="d-flex flex-column align-items-center period-section">
                            <div className="text-white fw-semibold mb-3 fs-4">Período</div>
                            <div className="d-flex gap-3 period-pills">
                                {periods.map((p) => (
                                    <Button
                                        key={p}
                                        variant={period === p ? 'primary' : 'outline-light'}
                                        className={`period-pill ${period === p ? 'active' : ''}`}
                                        onClick={() => setPeriod(p)}
                                    >
                                        {p}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
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
                                onClick={handleSaveTime}
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

export default TimeAdjustment;
