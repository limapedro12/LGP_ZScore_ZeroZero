import React, { useState } from 'react'; // REMOVER
// import React from 'react'; // COLOCAR
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import apiManager from '../api/apiManager'; // REMOVER
import { Button, Card, Tab, Tabs } from 'react-bootstrap'; // REMOVER

/**
 * Home page component
 * This is the component used in the landing page that shows the steps the
 * user has to follow to use the application successfully.
 *
 * @returns {React.FC} Home page component
 */

// COLOCAR O QUE ESTÁ COMENTADO ABAIXO:
// const HomePage: React.FC = () => (
//     <>
//         <Navbar expand="lg" className="bg-body-tertiary">
//             <Container>
//                 <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
//                 <Navbar.Toggle aria-controls="basic-navbar-nav" />
//                 <Navbar.Collapse id="basic-navbar-nav">
//                     <Nav className="me-auto">
//                         <Nav.Link href="#home">Home</Nav.Link>
//                         <Nav.Link href="#link">Link</Nav.Link>
//                         <NavDropdown title="Dropdown" id="basic-nav-dropdown">
//                             <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
//                             <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
//                             <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
//                             <NavDropdown.Divider />
//                             <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
//                         </NavDropdown>
//                     </Nav>
//                 </Navbar.Collapse>
//             </Container>
//         </Navbar>
//     </>
// );

// REMOVER TUDO ISTO ABAIXO:
const HomePage: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [scoreMessage, setScoreMessage] = useState<string>('');
    const [selectedTeamId] = useState<number>(1);
    const placardId = 1; // exemplo fixo por agora
    const gameType = 'futsal'; // ou 'volleyball'

    // ----- Score Control Section -----
    const handleAddPoint = async () => {
        try {
            const response = await apiManager.addPoint(selectedTeamId, placardId, gameType);
            const data = await response.json();
            if (data.success) {
                setScore((prevScore) => prevScore + 1);
                setScoreMessage('Point added successfully.');
            } else {
                setScoreMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setScoreMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleRemovePoint = async () => {
        try {
            const response = await apiManager.removePoint(selectedTeamId, placardId, gameType);
            const data = await response.json();
            if (data.success) {
                setScore((prevScore) => prevScore - 1);
                setScoreMessage('Point added successfully.');
            } else {
                setScoreMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setScoreMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    // ----------------------------------

    return (
        <>
            <Navbar expand="lg" className="bg-body-tertiary">
                <Container>
                    <Navbar.Brand href="#home">React-Bootstrap</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#link">Link</Nav.Link>
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-4">
                {/* New Score Control Section */}
                <div className="mb-4">
                    <h3>Score Control</h3>
                    {/* Buttons to Add or Remove Points */}
                    <div className="d-flex gap-2 mb-3">
                        <Button variant="success" onClick={handleAddPoint}>
                            +1 Point
                        </Button>
                        <Button variant="danger" onClick={handleRemovePoint}>
                            -1 Point
                        </Button>
                    </div>

                    {/* Current Score Display */}
                    <Card className="mt-2">
                        <Card.Body>
                            <h4>
                                Current Score:
                                <br />
                                {score}
                            </h4>
                            {scoreMessage && (
                                <>
                                    <br />
                                    {scoreMessage}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3">
                    <Tab eventKey="home" title="Home">
                        Tab content for Home
                    </Tab>
                    <Tab eventKey="profile" title="Profile">
                        Tab content for Profile
                    </Tab>
                    <Tab eventKey="contact" title="Contact" disabled>
                        Tab content for Contact
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
};
// REMOVER ATÉ ESTA LINHA
export default HomePage;
