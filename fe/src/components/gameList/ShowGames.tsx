// Create a new ShowGames component
import React from 'react';

const ShowGames = ({ games }) => (
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
);

export default ShowGames;
