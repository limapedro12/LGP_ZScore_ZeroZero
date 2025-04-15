import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import apiManager from '../api/apiManager';
import { latestPollingData, startPolling, stopPolling } from '../services/polling';

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
                setTimerStatus(`Timer started: 
                    Start time: ${new Date(data.timer.start_time * 1000).toLocaleTimeString()}
                    Elapsed: ${data.timer.elapsed_time} seconds
                    Paused: ${data.timer.is_paused ? 'Yes' : 'No'}`);
            } else {
                setTimerStatus('Failed to start timer');
            }
        } catch (error) {
            setTimerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleStopTimer = async () => {
        try {
            const response = await apiManager.stopTimer();
            if (response.ok) {
                const data = await response.json();
                setTimerStatus(`Timer paused: 
                    Start time: ${data.timer.start_time ? new Date(data.timer.start_time * 1000).toLocaleTimeString() : 'None'}
                    Elapsed: ${data.timer.elapsed_time} seconds
                    Paused: ${data.timer.is_paused ? 'Yes' : 'No'}`);
            } else {
                setTimerStatus('Failed to stop timer');
            }
        } catch (error) {
            setTimerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleResetTimer = async () => {
        try {
            const response = await apiManager.resetTimer();
            if (response.ok) {
                const data = await response.json();
                setTimerStatus(`Timer reset: 
                    Start time: ${data.timer.start_time ? new Date(data.timer.start_time * 1000).toLocaleTimeString() : 'None'}
                    Elapsed: ${data.timer.elapsed_time} seconds
                    Paused: ${data.timer.is_paused ? 'Yes' : 'No'}`);
            } else {
                setTimerStatus('Failed to reset timer');
            }
        } catch (error) {
            setTimerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleGetTimerStatus = async () => {
        try {
            const response = await apiManager.getTimerStatus();
            if (response.ok) {
                const data = await response.json();
                setTimerStatus(`Current timer status: 
                    Start time: ${data.timer.start_time ? new Date(data.timer.start_time * 1000).toLocaleTimeString() : 'None'}
                    Elapsed: ${data.timer.elapsed_time} seconds
                    Paused: ${data.timer.is_paused ? 'Yes' : 'No'}`);
            } else {
                setTimerStatus('Failed to get timer status');
            }
        } catch (error) {
            setTimerStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };
    const [latestData, setLatestData] = useState<number>(0);
    useEffect(() => {
        startPolling('http://localhost:8080/polling/polling', 5000, latestData, setLatestData);

        const interval = setInterval(() => {
            setLatestData(latestPollingData);
        }, 5000);

        return () => {
            stopPolling();
            clearInterval(interval);
        };
    }, []);

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
                    <div className="d-flex gap-2 mb-3">
                        <Button variant="primary" onClick={handleStartTimer}>Start Timer</Button>
                        <Button variant="warning" onClick={handleStopTimer}>Stop Timer</Button>
                        <Button variant="danger" onClick={handleResetTimer}>Reset Timer</Button>
                        <Button variant="info" onClick={handleGetTimerStatus}>Get Status</Button>
                    </div>
                    {timerStatus && (
                        <Card className="mt-2">
                            <Card.Body>
                                {timerStatus}
                            </Card.Body>
                        </Card>
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
                <p>
                    {latestData.toString()}
                </p>
            </Container>
        </>
    );

};

export default HomePage;
