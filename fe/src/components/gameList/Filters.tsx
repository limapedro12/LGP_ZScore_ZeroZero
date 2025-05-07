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

    const handleFilterClick = (team) => {
        const updatedTeams = selectedTeams.includes(team)
            ? selectedTeams.filter((t) => t !== team)
            : [...selectedTeams, team];

        setSelectedTeams(updatedTeams);

        const filteredGames = games.filter((game) =>
            updatedTeams.every((team) => game.home === team || game.away === team)
        );

        onFilter(filteredGames);
    };

    return (
        <div className="filters">
            <h2>Filtros</h2>
            <label>Data</label>
            <input type="text" placeholder="DD-MM-AA" />
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
            <button className="submit">Submit</button>
        </div>
    );
};

export default Filters;
