import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import apiManager from '../api/apiManager';

const HomePage: React.FC = () => {
    const [timerStatus, setTimerStatus] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [scoreMessage, setScoreMessage] = useState<string>('');
    const [selectedTeamId, setSelectedTeamId] = useState<number>(1); // valor default
    const teams = [
        { id: 1, name: 'Futsal Team' },
        { id: 2, name: 'Volleyball Team' },
    // só para testar, depois pode buscar-se à api
    ];


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

    // ----- Score Control Section -----
    const handleAddPoint = async () => {
        try {
            const response = await apiManager.addPoint(selectedTeamId);
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
            const response = await apiManager.removePoint(selectedTeamId);
            const data = await response.json();
            if (data.success) {
                setScore((prevScore) => prevScore - 1);
                setScoreMessage('Point removed successfully.');
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
                <div className="mb-4">
                    <h3>Timer Control</h3>
                    <div className="d-flex gap-2 mb-3">
                        <Button variant="primary" onClick={handleStartTimer}>
                            Start Timer
                        </Button>
                        <Button variant="warning" onClick={handleStopTimer}>
                            Stop Timer
                        </Button>
                        <Button variant="danger" onClick={handleResetTimer}>
                            Reset Timer
                        </Button>
                        <Button variant="info" onClick={handleGetTimerStatus}>
                            Get Status
                        </Button>
                    </div>
                    {timerStatus && (
                        <Card className="mt-2">
                            <Card.Body>
                                {timerStatus}
                            </Card.Body>
                        </Card>
                    )}
                </div>
                {/* New Score Control Section */}
                <div className="mb-4">
                    <h3>Score Control</h3>

                    {/* Team Selection Dropdown */}
                    <div className="mb-3">
                        <label htmlFor="teamSelect">Select Team:</label>
                        <select
                            id="teamSelect"
                            className="form-select"
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(parseInt(e.target.value, 10))}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

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

export default HomePage;
