// Create a new ShowGames component
import React from 'react';
import { Game } from '../../types/types';

type ShowGamesProps = {
    games: Game[];
};

const ShowGames: React.FC<ShowGamesProps> = ({ games }) => {
    const parseDate = (dateString: string, timeString: string): Date => {
        const [day, month, year] = dateString.split('/').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
        return new Date(year, month - 1, day, hours, minutes);
    };

    const sortedGames = games.sort((a, b) => {
        const dateA = parseDate(a.date, a.time);
        const dateB = parseDate(b.date, b.time);
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <div className="games-section">
            {sortedGames.map((game, index) => (
                <div
                    className="game-card"
                    key={index}
                    onClick={() => {
                        window.location.href = `http://localhost:3000/gameOptions/${game.sport}/${game.id}`;
                    }}
                >
                    <div className="team1">
                        <div className="team-logo">
                            <img src={game.homeLogo} alt={`${game.home} logo`} />
                        </div>
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
                    <div className="team2">
                        <div className="team-logo">
                            <img src={game.awayLogo} alt={`${game.away} logo`} />
                        </div>
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
