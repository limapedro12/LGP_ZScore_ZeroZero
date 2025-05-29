import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ApiTeam } from '../../../api/apiManager';

interface TeamLogosRowProps {
    homeTeam: ApiTeam;
    awayTeam: ApiTeam;
}

const TeamLogosRow: React.FC<TeamLogosRowProps> = ({
    homeTeam,
    awayTeam,
}) => (
    <Container fluid className="py-5">
        <Row className="justify-content-between align-items-center">
            <Col xs={5} md={4} className="d-flex justify-content-center align-items-center">
                <img
                    src={homeTeam?.logoURL || '/defaultLogo.png'}
                    alt={homeTeam?.acronym || 'Home'}
                    className="team-logo-pregame"
                />
                <div className="team-name mx-4">
                    {homeTeam?.acronym || 'Home'}
                </div>
            </Col>
            <Col xs={5} md={4} className="d-flex justify-content-center align-items-center">
                <div className="team-name mx-4">
                    {awayTeam?.acronym || 'Away'}
                </div>
                <img
                    src={awayTeam?.logoURL || '/defaultLogo.png'}
                    alt={awayTeam?.acronym || 'Away'}
                    className="team-logo-pregame"
                />
            </Col>
        </Row>
    </Container>
);

export default TeamLogosRow;
