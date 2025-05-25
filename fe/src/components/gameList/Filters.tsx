import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Game } from '../../types/types';
import { formatDate } from '../../utils/dateUtils';

type FiltersProps = {
    games: Game[];
    onFilter: (filteredGames: Game[]) => void;
};

const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const Filters: React.FC<FiltersProps> = ({ games, onFilter }) => {
    const getUniqueTeams = (games: Game[]): string[] => {
        const teams = new Set<string>();
        games.forEach((game) => {
            if (game.home) teams.add(game.home); // Ensure `home` is defined
            if (game.away) teams.add(game.away); // Ensure `away` is defined
        });
        return Array.from(teams);
    };

    const teamLabels = getUniqueTeams(games);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [teamSearch, setTeamSearch] = useState<string>('');
    const [selectedSport, setSelectedSport] = useState<string | null>(null);

    const handleFilterClick = (team: string) => {
        const updatedTeams = selectedTeams.includes(team)
            ? selectedTeams.filter((t) => t !== team)
            : [...selectedTeams, team];

        setSelectedTeams(updatedTeams);

        let localFormattedDate: string | null = null;
        if (selectedDate) {
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
            const year = selectedDate.getFullYear();
            localFormattedDate = `${day}/${month}/${year}`;
        }

        const filteredGames = games.filter((game) => {
            const matchesTeams = updatedTeams.length === 0 ? true : updatedTeams.every((t) => game.home === t || game.away === t);
            const matchesDate = localFormattedDate ? game.date === localFormattedDate : true;
            const matchesSport = selectedSport ? game.sport === selectedSport : true;
            return matchesTeams && matchesDate && matchesSport;
        });

        onFilter(filteredGames);
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);

        let localFormattedDate: string | null = null;
        if (date) {
            localFormattedDate = formatDate(date);
        }

        const filteredGames = games.filter((game) => {
            const matchesDate = localFormattedDate ? game.date === localFormattedDate : true;
            const matchesTeams = selectedTeams.every((team) => game.home === team || game.away === team);
            const matchesSport = selectedSport ? game.sport === selectedSport : true;
            return matchesDate && matchesTeams && matchesSport;
        });

        onFilter(filteredGames);
    };

    const handleSportChange = (sport: string | null) => {
        setSelectedSport(sport);
        const filteredGames = games.filter((game) => {
            const matchesSport = sport ? game.sport === sport : true;
            const matchesDate = selectedDate ? game.date.startsWith(selectedDate.toISOString().split('T')[0]) : true;
            const matchesTeams = selectedTeams.every((team) => game.home === team || game.away === team);
            return matchesSport && matchesDate && matchesTeams;
        });
        onFilter(filteredGames);
    };

    return (
        <div className="filters">
            <h2>Filtros</h2>
            <label>Data</label>
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecionar data"
            />
            <label>Equipas</label>
            <input
                type="text"
                placeholder="Procurar equipa"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
            />
            <div className="teams">
                {teamLabels
                    .filter((team) =>
                        normalizeString(team.toLowerCase()).includes(normalizeString(teamSearch.toLowerCase()))
                    )
                    .map((team, index) => (
                        <button
                            key={index}
                            onClick={() => handleFilterClick(team)}
                            className={selectedTeams.includes(team) ? 'active' : ''}
                        >
                            {team}
                        </button>
                    ))}
            </div>
            <label>Desporto</label>
            <div className="sports">
                {Object.entries({ 'Futsal': 'futsal', 'Voleibol': 'voleyball', 'Basket': 'basketball' }).map(([label, sport]) => (
                    <button
                        key={sport}
                        onClick={() => handleSportChange(selectedSport === sport ? null : sport)}
                        className={selectedSport === sport ? 'active' : ''}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Filters;
