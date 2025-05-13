import React, { useState } from 'react';

const Filters = ({ games, onFilter }) => {
    const getUniqueTeams = (games) => {
        const teams = new Set();
        games.forEach((game) => {
            teams.add(game.home);
            teams.add(game.away);
        });
        return Array.from(teams);
    };

    const teamLabels = getUniqueTeams(games);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    const handleFilterClick = (team) => {
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

    const handleDateChange = (event) => {
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
            <div className="teams">
                {teamLabels.map((team, index) => (
                    <button
                        key={index}
                        onClick={() => handleFilterClick(team)}
                        className={selectedTeams.includes(team) ? 'active' : ''}
                    >
                        {team}
                    </button>
                ))}
            </div>
            {/* <button className="submit">Submit</button> */}
        </div>
    );
};

export default Filters;
