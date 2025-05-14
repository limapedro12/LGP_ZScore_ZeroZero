import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';
import Filters from '../components/gameList/Filters';
import ShowGames from '../components/gameList/ShowGames';

type Game = {
    home: string;
    away: string;
    date: string;
    time: string;
};

const GameList = () => {
    const games = [
        { date: '22/03/2025', time: '16:00', home: 'Vitória SC', away: 'Sporting CP' },
        { date: '10/04/2025', time: '14:00', home: 'Leixões', away: 'Sporting CP' },
        { date: '22/03/2025', time: '18:00', home: 'Vitória SC', away: 'Benfica' },
        { date: '07/04/2025', time: '20:00', home: 'Vitória SC', away: 'Leixões' },
        { date: '16/04/2025', time: '20:00', home: 'Vitória SC', away: 'Clube K' },
    ];

    const [filteredGames, setFilteredGames] = useState(games);

    const handleFilter = (filtered: Game[]) => {
        setFilteredGames(filtered);
    };

    const logo = (
        <div className="logo text-white">
            {/* <strong>LOGO</strong>
            <br />
            <span>ZScore</span> */}
            <img src="/images/logo.png" alt="XP Sports Logo" />
        </div>
    );

    const jogosTitle = (
        <h1 className="mb-0 text-white jogosTitle">
            Os seus jogos
        </h1>
    );

    return (
        <Container fluid className="scoreboard-container p-4">
            <Row className="mb-4 align-items-start d-none d-md-flex">
                <Col xs={4}>
                    {logo}
                </Col>

                <Col xs={4}>
                    <Filters games={games} onFilter={handleFilter} />
                </Col>

            </Row>

            <Row className="mb-4 d-none d-md-flex">
                <Col xs={6} className="text-center">
                    {jogosTitle}
                </Col>

                <Col xs={{ span: 10, offset: 2 }}>
                    <ShowGames games={filteredGames} />
                </Col>
            </Row>

            {/* Mobile */}
            <Row className="mb-4 align-items-start d-md-none">
                <Col xs={12}>
                    {logo}
                </Col>
                <Col xs={12}>
                    <Filters games={games} onFilter={handleFilter} />
                </Col>
                <Col xs={12}>
                    {jogosTitle}
                </Col>
                <Col xs={12}>
                    <ShowGames games={filteredGames} />
                </Col>
            </Row>
        </Container>
    );
};

export default GameList;
