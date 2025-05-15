import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Game = {
    home: string;
    away: string;
    date: string;
    time: string;
};

type FiltersProps = {
    games: Game[];
    onFilter: (filteredGames: Game[]) => void;
};

const normalizeString = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const Filters: React.FC<FiltersProps> = ({ games, onFilter }) => {
    const getUniqueTeams = (games: Game[]): string[] => {
        const teams = new Set<string>();
        games.forEach((game) => {
            teams.add(game.home);
            teams.add(game.away);
        });
        return Array.from(teams);
    };

    const teamLabels = getUniqueTeams(games);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [teamSearch, setTeamSearch] = useState<string>('');

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
            return matchesTeams && matchesDate;
        });

        onFilter(filteredGames);
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);

        let localFormattedDate: string | null = null;
        if (date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
            const year = date.getFullYear();
            localFormattedDate = `${day}/${month}/${year}`;
        }

        const filteredGames = games.filter((game) => {
            const matchesDate = localFormattedDate ? game.date === localFormattedDate : true;
            const matchesTeams = selectedTeams.length === 0 ? true : selectedTeams.every(
                (team) => game.home === team || game.away === team);
            return matchesDate && matchesTeams;
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
        </div>
    );
};

export default Filters;
