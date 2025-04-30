import React from 'react';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';

const GameList = () => {
    const games = [
        {
            date: '22/03/2025',
            time: '16:00',
            home: 'Vitória SC',
            away: 'Sporting CP',
        },
        {
            date: '30/03/2025',
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

    return (
        <div className="scoreboard-container">
            <div className="sidebar">
                <div className="logo">
                    LOGO
                    <br />
                    ZScore
                </div>
                <div className="filters">
                    <h2>Filtros</h2>
                    <label>Data</label>
                    <input type="text" placeholder="DD-MM-AA" />
                    <div className="teams">
                        <button>Vitória SC</button>
                        <button>Sporting CP</button>
                        <button>Benfica</button>
                        <button>Clube K</button>
                    </div>
                    <button className="submit">Submit</button>
                </div>
            </div>

            <div className="games-section">
                <h1>Os seus jogos</h1>
                {games.map((game, index) => (
                    <div className="game-card" key={index}>
                        <div className="team">
                            <div className="team-logo">Image</div>
                            <div className="team-name">
                                {game.home}
                            </div>
                        </div>
                        <div className="game-info">
                            <div>
                                {game.date}
                            </div>
                            <div className="vs">VS</div>
                            <div>
                                {game.time}
                            </div>
                        </div>
                        <div className="team">
                            <div className="team-logo">Image</div>
                            <div className="team-name">
                                {game.away}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameList;
