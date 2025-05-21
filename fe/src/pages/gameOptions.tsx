import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import '../styles/scoresCounter.scss';
import apiManager from '../api/apiManager';

const GameOptions: React.FC = () => {
    const { sport, id } = useParams<{ sport: string; id: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [allowColab, setAllowColab] = useState<boolean | null>(null);

    useEffect(() => {
        const checkPermission = async () => {
            try {
                if (id) {
                    const response = await apiManager.getAllowColab(id);
                    if (response) {
                        setAllowColab(response.allowColab);
                        if (!response.allowColab) {
                            navigate(`/scoreboard/${sport}/${id}`);
                        }
                    }
                } else {
                    console.error('ID is undefined');
                    setAllowColab(false);
                }
            } catch (error) {
                console.error('Error checking allowColab:', error);
                setAllowColab(false);
            } finally {
                setLoading(false);
            }
        };

        checkPermission();
    }, [id, sport, navigate]);

    if (loading || allowColab === null) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="light" />
            </Container>
        );
    }
    if (!allowColab) navigate(`/scoreboard/${sport}/${id}`);
    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Row>
                <Col>
                    <div className="game-options text-center">
                        <h1 className="text-white">Select an Option</h1>
                        <button
                            className="btn btn-primary m-2"
                            onClick={() => navigate(`/scoreboard/${sport}/${id}`)}
                        >
                            Go to Scoreboard
                        </button>
                        <button
                            className="btn btn-secondary m-2"
                            onClick={() => navigate(`/scorersTable/${sport}/${id}`)}
                        >
                            Go to Scorers Table
                        </button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default GameOptions;
