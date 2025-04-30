import React from 'react';
import '../styles/scoreBoard.scss';
import '../styles/gameList.scss';

/**
 * GameList component
 * Initial page with score board operator games
 * @returns {JSX.Element} ScoreBoard component
 */
const GameList = () => (
    <div className="scoreboard-container">
        <p>LOGO ZScore</p>
        <div className="search">
          <input></input>
        </div>
        <div className="listOfGames">
        </div>
    </div>
);

export default GameList;
