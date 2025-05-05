import React from 'react';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import Cards from '../components/cards';
import '../styles/scoreBoard.scss';

/**
 * ScoreBoard component
 * This component displays the game score board with timer functionality
 * @returns {JSX.Element} ScoreBoard component
 */
const ScoreBoard = () => (
    <div className="scoreboard-layout">
        <div className="slider-container">
            <Cards direction="left" />
        </div>
        <div className="center-container">
            <TimeoutTimer />
            <Timer />
            <TimeoutCounter />
        </div>
        <div className="slider-container">
            <Cards direction="right" />
        </div>
    </div>
);

export default ScoreBoard;
