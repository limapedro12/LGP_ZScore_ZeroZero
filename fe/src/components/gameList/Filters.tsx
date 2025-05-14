import React, { useState } from 'react';

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
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [teamSearch, setTeamSearch] = useState<string>('');

    const handleFilterClick = (team: string) => {
        const updatedTeams = selectedTeams.includes(team)
            ? selectedTeams.filter((t) => t !== team)
            : [...selectedTeams, team];

        setSelectedTeams(updatedTeams);

        const filteredGames = games.filter((game) => {
            const matchesTeams = updatedTeams.every((team) => game.home === team || game.away === team);
            const matchesDate = selectedDate ? game.date.startsWith(selectedDate) : true;
            return matchesTeams && matchesDate;
        });

        onFilter(filteredGames);
    };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const date = event.target.value;
        setSelectedDate(date);

        const filteredGames = games.filter((game) => {
            const matchesDate = date ? game.date.startsWith(date) : true;
            const matchesTeams = selectedTeams.every((team) => game.home === team || game.away === team);
            return matchesDate && matchesTeams;
        });

        onFilter(filteredGames);
    };

    return (
        <div className="filters">
            <h2>Filtros</h2>
            <label>Data</label>
            <input
                type="text"
                placeholder="DD/MM/AA"
                value={selectedDate}
                onChange={handleDateChange}
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
                    .filter((team) => team.toLowerCase().includes(teamSearch.toLowerCase()))
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
