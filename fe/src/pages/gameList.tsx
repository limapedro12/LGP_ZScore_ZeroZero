import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';
import Filters from '../components/gameList/Filters';
import ShowGames from '../components/gameList/ShowGames';
import { Game } from '../types/types';
import apiManager, { ApiGame } from '../api/apiManager';

const GameList = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await apiManager.getAvailPlacards();
                if (response.ok) {
                    const data: ApiGame[] = await response.json();
                    const formattedGames = await Promise.all(data.map(async (game) => {
                        const homeTeam = await apiManager.getTeamInfo(game.firstTeamId);
                        const awayTeam = await apiManager.getTeamInfo(game.secondTeamId);
                        return {
                            id: game.id,
                            home: homeTeam?.name || 'Unknown', // Ensure `home` is defined
                            homeLogo: homeTeam?.logoURL || '', // Ensure `homeLogo` is defined
                            away: awayTeam?.name || 'Unknown', // Ensure `away` is defined
                            awayLogo: awayTeam?.logoURL || '', // Ensure `awayLogo` is defined
                            date: new Date(game.startTime).toLocaleDateString(),
                            time: new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            sport: game.sport,
                        };
                    }));
                    setGames(formattedGames);
                    setFilteredGames(formattedGames);
                } else {
                    console.error('Failed to fetch games');
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
