import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';
import Filters from '../components/gameList/Filters';
import ShowGames from '../components/gameList/ShowGames';
import { Game } from '../types/types';
import apiManager from '../api/apiManager';

const GameList = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const response = await apiManager.getAvailPlacards();
                if (response) {
                    const data = await response;
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
                const games = [ // TODO remove this later
                    { date: '22/03/2025', time: '16:00', home: 'Vitória SC', away: 'Sporting CP',
                        sport: 'futsal', placardId: '1', local: 'Pavilhão Siza Vieira', liga: 'Liga Mock',
                        homeLogo: 'teamLogos/slb.png', awayLogo: 'teamLogos/scp.png' },
                    { date: '10/04/2025', time: '14:00', home: 'Leixões', away: 'Sporting CP',
                        sport: 'futsal', placardId: '2', local: 'Pavilhão Siza Vieira', liga: 'Liga Mock',
                        homeLogo: 'teamLogos/slb.png', awayLogo: 'teamLogos/scp.png' },
                    { date: '22/03/2025', time: '18:00', home: 'Vitória SC', away: 'Benfica',
                        sport: 'volleyball', placardId: '3', local: 'Pavilhão Siza Vieira', liga: 'Liga Mock',
                        homeLogo: 'teamLogos/slb.png', awayLogo: 'teamLogos/scp.png' },
                    { date: '07/04/2025', time: '20:00', home: 'Vitória SC', away: 'Leixões',
                        sport: 'volleyball', placardId: '4', local: 'Pavilhão Siza Vieira', liga: 'Liga Mock',
                        homeLogo: 'teamLogos/slb.png', awayLogo: 'teamLogos/scp.png' },
                    { date: '16/04/2025', time: '20:00', home: 'Vitória SC', away: 'Clube K',
                        sport: 'basketball', placardId: '5', local: 'Pavilhão Siza Vieira', liga: 'Liga Mock',
                        homeLogo: 'teamLogos/slb.png', awayLogo: 'teamLogos/scp.png' },
                ];

                setGames(games);
                setFilteredGames(games);
            }
        };

        fetchGames();
    }, []);

    const handleFilter = (filtered: Game[]) => {
        setFilteredGames(filtered);
    };

    const logo = (
        <div className="logo text-white">
            <img src="/images/logo.png" alt="XP Sports Logo" />
        </div>
    );

    const jogosTitle = (
        <h1 className="mb-0 text-white jogosTitle">
            Os seus jogos
        </h1>
    );

    return (
        <Container fluid className="gameList-container p-4">
            <Row className="mb-4 align-items-start d-none d-md-flex">
                <Col xs={4} className="logoCol">
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
