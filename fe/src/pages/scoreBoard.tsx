import React from 'react';
import Timer from '../components/timer';
import Substitution from '../components/substitution';
import '../styles/scoreBoard.scss';

/**
 * ScoreBoard component
 * This component displays the game score board with timer functionality
 * @returns {JSX.Element} ScoreBoard component
 */
const ScoreBoard = () => (
    <div className="scoreboard-container">
        <Timer />
        <Substitution />
    </div>
);

export default ScoreBoard;
