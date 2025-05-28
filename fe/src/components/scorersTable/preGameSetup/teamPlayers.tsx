import React from 'react';
import { ApiPlayer } from '../../../api/apiManager';
import PlayerJersey from '../../playerJersey';
import { Plus } from 'react-bootstrap-icons';

interface TeamPlayersProps {
    teamPlayers : ApiPlayer[];
    teamColor: string;
    onAddPlayer?: () => void;
}

const TeamPlayers: React.FC<TeamPlayersProps> = (
    { teamPlayers, teamColor, onAddPlayer }
) => (
    <div className="team-players">
        {teamPlayers.map((player) => (
            <div
                key={player.id}
                className="player-item"
            >
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
        ))}
        <div className="d-flex justify-content-center my-3">
            <button
                className="btn add-player-button"
                style={{
                    background: `linear-gradient(135deg, ${teamColor} 65%, #222 100%)`,
                }}
                onClick={onAddPlayer}
                type="button"
            >
                <Plus />
            </button>
        </div>
    </div>
);

export default TeamPlayers;
