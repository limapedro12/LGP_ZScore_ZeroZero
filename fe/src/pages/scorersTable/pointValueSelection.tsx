import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import '../../styles/pointValueSelection.scss';

const PointValueSelection: React.FC = () => {
    const { sport, placardId, teamTag } = useParams<{ sport: string, placardId: string, teamTag: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { eventCategory } = location.state || { eventCategory: '' };

    const handleGoBack = () => {
        navigate(`/scorersTable/${sport}/${placardId}`);
    };

    const handlePointValueSelect = (pointValue: number) => {
        navigate(`/scorersTable/${sport}/${placardId}/playerSelection/${teamTag}`, {
            state: {
                eventCategory,
                pointValue,
            },
        });
    };

    return (
        <Container fluid className="point-value-container p-0">
            <Row className="header-row gx-0 pt-3 pb-3 px-3 align-items-center">
                <Col xs="auto">
                    <Button variant="link" onClick={handleGoBack} className="p-0 me-2 back-button">
                        <ArrowLeft color="white" size={30} className="thicker-arrow-icon" />
                    </Button>
                </Col>
                <Col>
                    <h1 className="page-title mb-0 text-center">Valor do Cesto</h1>
                </Col>
                <Col xs="auto" style={{ visibility: 'hidden' }}>
                    <ArrowLeft color="white" size={30} />
                </Col>
            </Row>

            <Row className="points-content-container gx-0 mt-2">
                <Col className="d-flex flex-column align-items-center">
                    <div className="basketball-visual">
                        <Image
                            src="/icons/basketball-score-icon.png"
                            alt="Basketball"
                            className="basketball-icon"
                        />
                    </div>

                    <div className="point-buttons-container">
                        <Button
                            className="point-button"
                            onClick={() => handlePointValueSelect(1)}
                        >
                            <div className="point-button-content">
                                <div className="point-value">1</div>
                                <div className="point-details">
                                    <div className="point-title">Lance Livre</div>
                                    <div className="point-desc">Da linha de lance livre</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            className="point-button"
                            onClick={() => handlePointValueSelect(2)}
                        >
                            <div className="point-button-content">
                                <div className="point-value">2</div>
                                <div className="point-details">
                                    <div className="point-title">Campo</div>
                                    <div className="point-desc">Dentro da linha de 3 pontos</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            className="point-button"
                            onClick={() => handlePointValueSelect(3)}
                        >
                            <div className="point-button-content">
                                <div className="point-value">3</div>
                                <div className="point-details">
                                    <div className="point-title">Triplo</div>
                                    <div className="point-desc">Fora da linha de 3 pontos</div>
                                </div>
                            </div>
                        </Button>
                    </div>
                </Col>
            </Row>

            <Row className="court-illustration gx-0">
                <Col>
                    <div className="court-graphic" />
                </Col>
            </Row>
        </Container>
    );
};

export default PointValueSelection;
