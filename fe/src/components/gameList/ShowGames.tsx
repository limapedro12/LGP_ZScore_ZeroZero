// Create a new ShowGames component
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from 'react-bootstrap';


type Game = {
    home: string;
    away: string;
    date: string;
    time: string;
    sport: string;
    placardId: string;
};

type ShowGamesProps = {
    games: Game[];
};

const ShowGames: React.FC<ShowGamesProps> = ({ games }) => {
    const navigate = useNavigate();

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
                    onClick={ () => {
                        navigate(`../scorersTable/${game.sport}/${game.placardId}`);
                    }
                    }
                >
                    <div className="team">
                        <div className="team-logo">Image</div>
                        <div className="team-name">
                            {game.home}
                        </div>
                    </div>
                    <div className="game-info">
                        <img src={`/icons/${game.sport}.png`} alt={`${game.sport} icon`} className="sport-icon" />
                        <div className="vs">VS</div>
                        <div>
                            {game.date}
                        </div>
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
