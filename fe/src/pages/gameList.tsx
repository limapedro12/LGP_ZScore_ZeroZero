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
import { formatDate } from '../utils/dateUtils';
import LoginButton from '../components/loginButton';

const GameList = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

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
                            placardId: game.id,
                            home: homeTeam?.name || 'Unknown',
                            homeLogo: homeTeam?.logoURL || '',
                            away: awayTeam?.name || 'Unknown',
                            awayLogo: awayTeam?.logoURL || '',
                            date: formatDate(new Date(game.startTime)),
                            time: new Date(game.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            sport: game.sport,
                            liga: 'Liga Mock', // TODO remove this
                            local: 'Pavilhão Siza Vieira', // TODO remove this
                        };
                    }));
                    setGames(formattedGames);
                    setFilteredGames(formattedGames);
                } else {
                    console.error('Failed to fetch games');
                }
            } catch (error) {
                console.error('Error fetching games:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const handleFilter = (filtered: Game[]) => {
        setFilteredGames(filtered);
    };

    const logo = (
        <div className="logo text-white">
            <img src="/images/zscore_logo_no_bg.png" alt="XP Sports Logo" />
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

            <Row className="mb-4 d-none d-md-flex align-items-center">
                <Col xs={6}>
                    <div className="title-login d-flex justify-content-between align-items-center w-100">
                        {jogosTitle}
                        <LoginButton />
                    </div>
                </Col>

                <Col xs={{ span: 10, offset: 2 }}>
                    {loading ? (
                        <h1 className="text-white text-center">A Carregar...</h1>
                    ) : (
                        <ShowGames games={filteredGames} />
                    )}
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
                    {loading ? (
                        <h1 className="text-white text-center">A Carregar...</h1>
                    ) : (
                        <ShowGames games={filteredGames} />
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default GameList;
