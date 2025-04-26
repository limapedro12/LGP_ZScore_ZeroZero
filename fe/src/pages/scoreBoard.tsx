import React from 'react';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import Substitution from '../components/substitution';
import '../styles/scoreBoard.scss';

/**
 * ScoreBoard component
 * This component displays the game score board with timer functionality
 * @returns {JSX.Element} ScoreBoard component
 */
const ScoreBoard = () => (
    <div className="scoreboard-container">
        <TimeoutTimer />
        <Timer />
        <TimeoutCounter />
        <Substitution />
    </div>
);

export default ScoreBoard;
