import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'; // Added Col for layout
import Image from 'react-bootstrap/Image'; // Added Image for the logo

interface TeamLogoProps {
    logoSrc: string;
    teamName: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoSrc, teamName }) => (
    <Container fluid className="d-flex flex-column align-items-center justify-content-center p-2 h-100">
        <Row className="text-center">
            <Col>
                <h4 className="team-name-display text-white fs-2">
                    {teamName}
                </h4>
            </Col>
        </Row>
        <Row className="text-center mt-2">
            <Col>
                <Image
                    src={logoSrc}
                    alt={`${teamName} logo`}
                    fluid
                    className="team-logo-display w-75 d-none d-md-inline"
                />
                <Image
                    src={logoSrc}
                    alt={`${teamName} logo`}
                    fluid
                    className="team-logo-display w-50 d-xs-inline d-md-none"
                />
            </Col>
        </Row>
    </Container>
);

export default TeamLogo;
