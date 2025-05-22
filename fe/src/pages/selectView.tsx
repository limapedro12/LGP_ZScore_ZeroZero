import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Game } from '../utils/gameUtils';
import '../styles/selectView.scss';


const SelectView: React.FC = () => {
    const navigate = useNavigate();

    const location = useLocation();
    const { game } = location.state || { } as { game: Game };

    useEffect(() => {
        if (!game) {
            navigate('/gameList');
        }
    }, [game, navigate]);

    const color = '#000000';

    return (
        <div className="select-view-container">
            <div
                className="back-button"
                onClick={() => {
                    navigate('/gameList');
                }}
            >
                <svg width="0" height="0">
                    <filter id={`color-${color.replace('#', '')}`} colorInterpolationFilters="sRGB">
                        <feColorMatrix
                            type="matrix"
                            values={`0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 0 1
                        0 0 0 1 0`}
                        />
                    </filter>
                </svg>
                <img
                    src={'/icons/back.svg'}
                    alt="Player Jersey"
                    className="img-fluid"
                    style={{ filter: `url(#color-${color.replace('#', '')})` }}
                />
            </div>

            <div className="card">

                <div className="header">
                    <div className="team">
                        <img
                            src="/teamLogos/slb.png" // TODO : Replace with dynamic logo
                            alt={`${game.home} logo`}
                        />
                        <span className="team-name">
                            {game.home}
                        </span>
                    </div>
                    <div className="match-info">
                        <p>
                            {game.date}
                        </p>
                        <p className="match-vs">
                            VS
                        </p>
                        <p>
                            {game.time}
                        </p>
                    </div>
                    <div className="team">
                        <img
                            src="/teamLogos/scp.png" // TODO : Replace with dynamic logo
                            alt={`${game.away} logo`}
                        />
                        <span className="team-name">
                            {game.away}
                        </span>
                    </div>
                </div>

                <div className="details">
                    <div className="detail-row">
                        <span>📅</span>
                        <span>
                            {game.date}
                        </span>
                    </div>
                    {game.local &&
                    <div className="detail-row">
                        <span>📍</span>
                        <span>
                            {game.local}
                        </span>
                    </div>
                    }
                    {game.liga &&
                    <div className="detail-row">
                        <span>🏆</span>
                        <span>
                            {game.liga}
                        </span>
                    </div>
                    }
                </div>

                <div className="actions">
                    <button
                        onClick={() => {
                            navigate(`/scoreboard/${game.sport}/${game.placardId}`);
                        }}
                    >
                        Iniciar Placard
                    </button>
                    <button
                        onClick={() => {
                            navigate(`/scorersTable/${game.sport}/${game.placardId}`); // TODO : If authenticated
                        }}
                    >
                        Iniciar Mesa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectView;
