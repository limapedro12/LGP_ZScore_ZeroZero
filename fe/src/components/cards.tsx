import React, { useState, useEffect } from 'react';
import { latestPollingData, startPolling, stopPolling } from '../services/polling';

/**
 * An real time update of cards
 *
 * @returns {React.FC} Home page component
 */
const Cards: React.FC = () => {
    const [latestData, setLatestData] = useState<number>(0);
    useEffect(() => {
        startPolling('http://localhost:8080/polling/polling', 5000);

        const interval = setInterval(() => {
            setLatestData(latestPollingData);
        }, 5000);

        return () => {
            stopPolling();
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <p>
                {latestData.toString()}
            </p>
        </>
    );

};

export default Cards;
