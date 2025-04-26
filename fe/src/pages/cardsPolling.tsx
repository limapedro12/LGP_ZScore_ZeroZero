import React from 'react';
import Cards from '../components/cards';
import '../styles/scoreBoard.scss';

/**
 * ScoreBoard component
 * This component displays the game score board with timer functionality
 * @returns {JSX.Element} ScoreBoard component
 */
const CardsPolling = () => (
    <div className="scoreboard-container">
        <div className="text-white">
            <Cards />
        </div>
    </div>
);

export default CardsPolling;
