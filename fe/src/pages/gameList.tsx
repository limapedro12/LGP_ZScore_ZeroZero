import React, { useState } from 'react';
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
        <div className="scoreboard-container">
            <div className="sidebar">
                <div className="logo">
                    LOGO
                    <br />
                    ZScore
                </div>
                <Filters games={games} onFilter={handleFilter} />
            </div>
            <ShowGames games={filteredGames} />
        </div>
    );
};

export default GameList;
