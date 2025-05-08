import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
// import { useParams } from 'react-router-dom';
// import { Sport } from '../utils/cardUtils';
import  TeamLogo  from '../components/scorersTable/teamLogo';

const ScorersTable = () => {
    // const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: string, placardId: string }>();

    // const sport = sportParam as Sport || 'futsal';
    // const placardId = placardIdParam || '1';
    const containerClassName =
        `scorers-table-container d-md-flex flex-column justify-content-start vh-100 p-0 
        overflow-y-auto overflow-md-y-hidden overflow-x-hidden d-none`;

    return (
        <>
            <Container fluid className={containerClassName}>
                {/* LAYOUT FOR LARGER SCREENS */}
                <Row className="scorers-table-row w-100 d-none d-md-flex">
                    <Col md={3} className="p-0 align-items-center justify-content-center d-flex">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/slb.png" teamName="SLB" />
                    </Col>
                    <Col md={6} className="p-0">
                        <div>
                            <h2 className="text-center text-white">Central Console</h2>
                        </div>
                    </Col>
                    <Col md={3} className="p-0 align-items-center justify-content-center d-flex">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/scp.png" teamName="SCP" />
                    </Col>
                </Row>
                <Row className="scorers-table-row w-100 d-none d-md-flex">
                    <Col xs={12} className="p-0">
                        <div>
                            <h2 className="text-center text-white">Correction Button</h2>
                        </div>
                    </Col>
                </Row>
            </Container>

            <Container fluid className="d-flex flex-column d-md-none justify-content-center align-items-center p-0">
                <Row className="scorers-table-row w-100 justify-content-center align-items-center">
                    <Col xs={12} className="p-0 d-flex align-items-center justify-content-center w-100">
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/slb.png" teamName="SLB" />
                        {/* TEAM NAME AND LOGO NEED TO BE FETCHED FROM EITHER ZEROZERO'S API OR THE BACKEND */}
                        <TeamLogo logoSrc="/teamLogos/scp.png" teamName="SCP" />
                    </Col>
                </Row>
                <Row className="scorers-table-row w-100 mt-3">
                    <Col xs={12} className="p-0">
                        <div>
                            <h2 className="text-center text-white">Central Console</h2>
                        </div>
                    </Col>
                </Row>
                <Row className="scorers-table-row w-100 mt-3">
                    <Col xs={12} className="p-0">
                        <div>
                            <h2 className="text-center text-white">Correction Button</h2>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ScorersTable;
