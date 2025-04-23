import React, { useState, useEffect } from 'react';
import { latestPollingData, startPolling, stopPolling } from '../services/polling';

/**
 * An real time update of cards
 *
 * @returns {React.FC} Home page component
 */
const Cards: React.FC = () => {
    const [latestData, setLatestData] = useState<any[]>([]); // Assuming latestData is an array
    const [noYellow, setNoYellow] = useState<number>(0);
    const [noRed, setNoRed] = useState<number>(0);

    useEffect(() => {
        startPolling('http://localhost:8080/events/card?action=get&placardId=1&sport=volleyball', 5000);

        const interval = setInterval(() => {
            setLatestData(latestPollingData);
        }, 5000);

        return () => {
            stopPolling();
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        let yellowCount = 0;
        let redCount = 0;

        for (let i = 0; i < latestData.length; i++) {
            if (latestData[i].cardType === 'yellow') {
                yellowCount++;
            } else if (latestData[i].cardType === 'red') {
                redCount++;
            }
        }

        setNoYellow(yellowCount);
        setNoRed(redCount);
    }, [latestData]);

    return (
        <>
            <p>
                {noYellow}
                Yellow Cards
            </p>
            <p>
                {noRed}
                Red Cards
            </p>
        </>
    );
};

export default Cards;
