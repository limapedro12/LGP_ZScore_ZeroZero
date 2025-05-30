import React from 'react';
import { ApiPlayer } from '../../../api/apiManager';
import PlayerJersey from '../../playerJersey';
import { Trash } from 'react-bootstrap-icons';

interface TeamPlayersProps {
    teamPlayers : ApiPlayer[];
    teamColor: string;
    onAddPlayer?: () => void;
    onRemovePlayer?: (playerId: string | number) => void;
}

const TeamPlayers: React.FC<TeamPlayersProps> = (
    { teamPlayers, teamColor, onAddPlayer, onRemovePlayer }
) => (
    <div className="d-flex flex-column h-100">
        <div className="team-players" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            {teamPlayers.map((player) => (
                <div
                    key={player.id}
                    className="player-item d-flex justify-content-between align-items-center"
                >
                    <div className="d-flex align-items-center">
                        <div className="jersey-container">
                            <PlayerJersey
                                number={Number(player.number)}
                                color={teamColor}
                            />
                        </div>
                        <div className="player-name">
                            <span>
                                {player.name}
                            </span>
                        </div>
                    </div>
                    {onRemovePlayer && (
                        <button
                            className="btn btn-link p-0 ms-2 mx-3"
                            title="Remover jogador"
                            onClick={() => onRemovePlayer(player.id)}
                            style={{ color: '#dc3545', fontSize: '1.5rem' }}
                            type="button"
                        >
                            <Trash />
                        </button>
                    )}
                </div>
            ))}
        </div>
        <div className="d-flex justify-content-center my-3">
            <button
                className="btn add-player-button"
                style={{
                    background: teamColor,
                    color: ['#ffffff', '#fff', 'white'].includes(teamColor.toLowerCase()) ? 'black' : 'white',
                }}
                onClick={onAddPlayer}
                type="button"
            >
                adicionar jogador
            </button>
        </div>
    </div>
);

export default TeamPlayers;
