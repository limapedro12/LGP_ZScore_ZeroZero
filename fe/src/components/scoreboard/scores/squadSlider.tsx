import React, { useState, useEffect, useCallback } from 'react';
import BaseSlider from '../baseSlider';
import EventDisplay from '../eventDisplay';
import '../../../styles/sliderComponents.scss';

interface SquadSliderProps {
  team: 'home' | 'away';
}

interface Player {
  player_id: string;
  player_name: string;
  player_number: string;
  player_position: string;
  player_position_sigla: string;
  INTEAM: string;
}

const SquadSlider: React.FC<SquadSliderProps> = ({ team }) => {
    const [squadPlayers, setSquadPlayers] = useState<Player[]>([]);
    const MAX_PLAYERS_TO_DISPLAY = 8;

    // Mock data for now - in a real scenario, you would fetch this from an API
    const fetchSquadPlayers = useCallback(() => {
        try {
            // This would be replaced with an actual API call when available
            // For now, we're using the mock data provided
            const mockPlayersDataHomeTeam = [
                {
                    'player_id': '839058',
                    'player_name': 'Fábio Madeira',
                    'player_number': '14',
                    'player_position': 'Guarda-Redes',
                    'player_position_sigla': 'GR',
                    'INTEAM': '1',
                },
                {
                    'player_id': '553467',
                    'player_name': 'André Silva',
                    'player_number': '17',
                    'player_position': 'Guarda-Redes',
                    'player_position_sigla': 'GR',
                    'INTEAM': '1',
                },
                {
                    'player_id': '682487',
                    'player_name': 'Gonçalo Rufo',
                    'player_number': '12',
                    'player_position': 'Fixo / Ala',
                    'player_position_sigla': 'F/A',
                    'INTEAM': '1',
                },
                {
                    'player_id': '835956',
                    'player_name': 'Silas',
                    'player_number': '5',
                    'player_position': 'Universal',
                    'player_position_sigla': 'U',
                    'INTEAM': '1',
                },
                {
                    'player_id': '930612',
                    'player_name': 'João Ricardo',
                    'player_number': '18',
                    'player_position': 'Universal',
                    'player_position_sigla': 'U',
                    'INTEAM': '1',
                },
            ];

            const mockPlayersDataAwayTeam = [
                {
                    'player_id': '901234',
                    'player_name': 'Tiago Ferreira',
                    'player_number': '1',
                    'player_position': 'Guarda-Redes',
                    'player_position_sigla': 'GR',
                    'INTEAM': '1',
                },
                {
                    'player_id': '812345',
                    'player_name': 'Bruno Carvalho',
                    'player_number': '13',
                    'player_position': 'Guarda-Redes',
                    'player_position_sigla': 'GR',
                    'INTEAM': '1',
                },
                {
                    'player_id': '745632',
                    'player_name': 'Miguel Andrade',
                    'player_number': '8',
                    'player_position': 'Fixo / Ala',
                    'player_position_sigla': 'F/A',
                    'INTEAM': '1',
                },
                {
                    'player_id': '678954',
                    'player_name': 'Eduardo Ramos',
                    'player_number': '6',
                    'player_position': 'Universal',
                    'player_position_sigla': 'U',
                    'INTEAM': '1',
                },
                {
                    'player_id': '823476',
                    'player_name': 'Hugo Martins',
                    'player_number': '22',
                    'player_position': 'Universal',
                    'player_position_sigla': 'U',
                    'INTEAM': '1',
                },
            ];

            const mockPlayersData = team === 'home' ? mockPlayersDataHomeTeam : mockPlayersDataAwayTeam;

            const activePlayers = mockPlayersData
                .filter((player) => player.INTEAM === '1')
                .slice(0, MAX_PLAYERS_TO_DISPLAY);

            setSquadPlayers(activePlayers);
        } catch (error) {
            console.error('Error fetching squad players:', error);
            setSquadPlayers([]);
        }
    }, []);

    useEffect(() => {
        fetchSquadPlayers();

        // In a real scenario, you might want to refresh the data periodically
        const intervalId = setInterval(fetchSquadPlayers, 30000);

        return () => clearInterval(intervalId);
    }, [fetchSquadPlayers]);

    return (
        <BaseSlider title="Plantel" className="squad-slider">
            <div className="squad-list w-100 d-flex flex-column">
                {squadPlayers.map((player) => (
                    <div key={player.player_id} className="squad-player-item py-1">
                        <EventDisplay
                            playerName={player.player_name}
                            playerNumber={Number(player.player_number)}
                            team={team}
                            compact={true}
                        />
                    </div>
                ))}
            </div>
        </BaseSlider>
    );
};

export default SquadSlider;
