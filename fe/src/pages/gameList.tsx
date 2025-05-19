import React, { useState, useEffect } from 'react';
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
    sport: string;
};

type ApiGame = {
    id: string;
    firstTeamId: string;
    secondTeamId: string;
    isFinished: boolean;
    sport: string;
    startTime: string;
};

const GameList = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ action: 'getAvailPlacards' }),
                });

                if (response.ok) {
                    const data: ApiGame[] = await response.json();
                    const formattedGames = data.map((game) => ({
                        home: game.firstTeamId,
                        away: game.secondTeamId,
                        date: new Date(game.startTime).toLocaleDateString(),
                        time: new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }));
                    setGames(formattedGames);
                    setFilteredGames(formattedGames);
                } else {
                    console.error('Failed to fetch games:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };

        fetchGames();
    }, []);

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
