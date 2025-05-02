import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import { formatTime, sportsFormat } from '../utils/timeUtils';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/timer.scss';

const Timer: React.FC = () => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [period, setPeriod] = useState(0);
    const [placardId, setplacardId] = useState<string>('default');
    const [sport, setsport] = useState<string>('default');
    const nonTimerSports = ['volleyball'];

    const { placardId: urlplacardId, sport: urlsport } = useParams<{ placardId: string, sport: string }>();

    useEffect(() => {
        if (urlplacardId) setplacardId(urlplacardId);
        if (urlsport) setsport(urlsport);
    }, [urlplacardId, urlsport]);

    const fetchTimerStatus = React.useCallback(async () => {
        if (!placardId || !sport || placardId === 'default' || sport === 'default') {
            return;
        }
        try {
            const response = await apiManager.getTimerStatus(placardId, sport);
            const data = response;
            if (data.remaining_time !== undefined && data.period !== undefined) {
                setElapsedTime(data.remaining_time);
                setPeriod(data.period);
            }
        } catch (error) {
            console.error('Error fetching timer status:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        if (placardId && sport && placardId !== 'default' && (sport !== 'default' && !nonTimerSports.includes(sport))) {
            fetchTimerStatus();
            const intervalId = setInterval(fetchTimerStatus, 1000);
            return () => clearInterval(intervalId);
        }
        return undefined;
    }, [placardId, fetchTimerStatus, sport, nonTimerSports]);

    if (!nonTimerSports.includes(sport)) {
        return (
            <Container className="timer d-flex flex-column align-items-center justify-content-center py-3">
                <Row className="w-100">
                    <Col xs={12} className="text-center">
                        <div className="period display-4 fw-bold">
                            {sportsFormat(sport, period)}
                        </div>
                    </Col>
                </Row>
                <Row className="w-100">
                    <Col xs={12} className="text-center">
                        <div className="time display-1 fw-bold">
                            {formatTime(elapsedTime)}
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    } else {
        return null;
    }
};

export default Timer;
