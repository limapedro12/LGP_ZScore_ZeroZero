import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import { Sport } from '../utils/scorersTableUtils';
import TeamLogo from '../components/scorersTable/teamLogo';
import CentralConsole from '../components/scorersTable/centralConsole';

const ScorersTable = () => {
    const { sport: sportParam /* , placardId: placardIdParam */ } = useParams<{ sport: string, placardId: string }>();

    const sport = (sportParam as Sport) || 'volleyball';

    const containerClassName =
        `scorers-table-container d-md-flex flex-column justify-content-start align-items-center vh-100 p-0 
        overflow-y-auto overflow-md-y-hidden overflow-x-hidden d-none`;

    const mobileContainerClassName =
        'd-flex flex-column d-md-none justify-content-around align-items-center vh-100 p-3';

    const correctionButtonStyle: React.CSSProperties = {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#0d6efd',
        borderColor: '#0d6efd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
    };

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

                <Row className="w-100 d-none d-md-flex align-items-center h-25">
                    <div className="d-flex flex-column align-items-center">
                        <p className="text-white fw-bold fs-5 mb-2">Corrigir</p>
                        <Button style={correctionButtonStyle} aria-label="Corrigir" />
                    </div>
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
                <Row className="w-100 py-3 justify-content-center">
                    <div className="d-flex flex-column align-items-center">
                        <p className="text-white fw-bold fs-5 mb-2 text-center">Corrigir</p>
                        <Button style={correctionButtonStyle} aria-label="Corrigir" />
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default ScorersTable;
