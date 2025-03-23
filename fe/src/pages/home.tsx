import React from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

/**
 * Home page component
 * This is the component used in the landing page that shows the steps the
 * user has to follow to use the application successfully.
 *
 * @returns {React.FC} Home page component
 */
const HomePage: React.FC = () => (
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
    </>
);

export default HomePage;
