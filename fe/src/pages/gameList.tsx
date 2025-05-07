import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';
import Filters from '../components/gameList/Filters';
import ShowGames from '../components/gameList/ShowGames';

const GameList = () => {
    const games = [
        {
            date: '22/03/2025',
            time: '16:00',
            home: 'Vitória SC',
            away: 'Sporting CP',
        },
        {
            date: '10/04/2025',
            time: '14:00',
            home: 'Leixões',
            away: 'Sporting CP',
        },
        {
            date: '22/03/2025',
            time: '18:00',
            home: 'Vitória SC',
            away: 'Benfica',
        },
        {
            date: '07/04/2025',
            time: '20:00',
            home: 'Vitória SC',
            away: 'Leixões',
        },
        {
            date: '16/04/2025',
            time: '20:00',
            home: 'Vitória SC',
            away: 'Clube K',
        },
    ];

    const [filteredGames, setFilteredGames] = useState(games);

    const handleFilter = (filtered) => {
        setFilteredGames(filtered);
    };

    return (
        <Container fluid className="scoreboard-container d-flex">
            <Row>
                <Col>
                    {/* xs={5} md={5} lg={5}> */}
                    <div className="logo">
                        LOGO
                        <br />
                        ZScore
                    </div>
                </Col>
                <Col>
                    {/* xs={7} md={7} lg={7}> */}
                    <h1>Os seus jogos</h1>
                </Col>
            </Row>
            <Row>
                <Col xs={3} md={3} lg={3}>
                    <Filters games={games} onFilter={handleFilter} />
                </Col>
                <Col xs={5} md={5} lg={5}>
                    <ShowGames games={filteredGames} />
                </Col>
            </Row>
        </Container>
    );
};

export default GameList;
