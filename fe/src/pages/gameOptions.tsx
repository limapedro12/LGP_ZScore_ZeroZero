import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/scoresCounter.scss';

const GameOptions: React.FC = () => {
    const { sport, id } = useParams<{ sport: string; id: string }>();
    const navigate = useNavigate();

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
