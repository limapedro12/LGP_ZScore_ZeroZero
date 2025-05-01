import React from 'react';
import { useParams } from 'react-router-dom';
import Timer from '../components/timer';
import TimeoutTimer from '../components/timeoutTimer';
import TimeoutCounter from '../components/timeoutCounter';
import ScoresRow from '../components/scoresCounter';
import EventHistory from '../components/eventHistory';
import '../styles/scoreBoard.scss';

const ScoreBoard = () => {
    const { placardId, sport } = useParams<{ placardId: string; sport: string }>();

    return (
        <div className="scoreboard-container">
            <div className="scoreboard-top">
                <ScoresRow />
            </div>
            <div className="scoreboard-center">
                <TimeoutTimer />
                <Timer />
                <TimeoutCounter />
                <EventHistory />
            </div>
        </div>
    );
};

export default ScoreBoard;
