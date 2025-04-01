import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import apiManager from '../api/apiManager';

/**
 * Home page component
 * This is the component used in the landing page that shows the steps the
 * user has to follow to use the application successfully.
 *
 * @returns {React.FC} Home page component
 */
const HomePage: React.FC = () => {
    const [timerStatus, setTimerStatus] = useState<string>('');

    const handleStartTimer = async () => {
        try {
            const response = await apiManager.startTimer();
            if (response.ok) {
                const data = await response.json();
                setTimerStatus('Timer started successfully');
                console.log('Timer started:', data);
            } else {
                setTimerStatus('Failed to start timer');
                console.error('Failed to start timer');
            }
        } catch (error) {
            setTimerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            console.error('Error starting timer:', error);
        }
    };

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
                <div className="mb-4">
                    <h3>Timer Control</h3>
                    <Button variant="primary" onClick={handleStartTimer}>Start Timer</Button>
                    {timerStatus && (
                        <p className="mt-2">
                            {timerStatus}
                        </p>
                    )}
                </div>
                <Tabs
                    defaultActiveKey="profile"
                    id="uncontrolled-tab-example"
                    className="mb-3"
                >
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

export default HomePage;
