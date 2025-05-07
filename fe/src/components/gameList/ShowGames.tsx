// Create a new ShowGames component
import React from 'react';

const ShowGames = ({ games }) => {
    const parseDate = (dateString: string, timeString: string): Date => {
        const [day, month, year] = dateString.split('/').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    };

    const sortedGames = games.sort((a, b) => {
        const dateA = parseDate(a.date, a.time);
        const dateB = parseDate(b.date, b.time);
        return dateA - dateB;
    });

    return (
        <div className="games-section">
            {sortedGames.map((game, index) => (
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
};

export default ShowGames;
