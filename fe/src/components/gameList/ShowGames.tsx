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

    const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
    const [popupPosition, setPopupPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

    const handleListClick = (game: Game, event: React.MouseEvent<HTMLLIElement>) => {
        if (selectedGame && selectedGame.placardId === game.placardId) {
            setSelectedGame(null);
            return;
        }

        setSelectedGame(game);
        setPopupPosition({ x: event.clientX - 140, y: event.clientY + 2 });
    };

    return (
        <div className="games-section">
            {sortedGames.map((game, index) => (
                <div
                    className="game-card"
                    key={index}
                    onClick={(event) => {
                        handleListClick(game, event);
                    }}
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

            {selectedGame && (
                <div
                    style={{
                        position: 'absolute',
                        top: popupPosition.y,
                        left: popupPosition.x,
                        background: 'white',
                        border: '1px solid gray',
                        padding: '10px',
                        borderRadius: '8px',
                        boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
                        zIndex: 1000,
                    }}
                >
                    <h4 className="view-option-header">
                        Select View
                    </h4>
                    <div className="view-option-pair">
                        <div
                            className="view-option"
                            onClick={() => {
                                // TODO check for authentication
                                navigate(`../scorersTable/${selectedGame.sport}/${selectedGame.placardId}`);
                            }}
                        >
                            <img src="/icons/scorersTable.png" alt="Scorers Table" className="view-option-icon" />
                            <p className="view-option-text">
                                Scorers Table
                            </p>
                        </div>
                        <div
                            className="view-option"
                            onClick={() => {
                                navigate(`../scoreboard/${selectedGame.sport}/${selectedGame.placardId}`);
                            }}
                        >
                            <img src="/icons/scoreboard.png" alt="Scorers Table" className="view-option-icon" />
                            <p className="view-option-text">
                                Scoreboard
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowGames;
