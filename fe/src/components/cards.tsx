import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { latestPollingData, startPolling, stopPolling } from '../services/polling';

/**
 * An real time update of cards
 *
 * @returns {React.FC} Home page component
 */
const Cards: React.FC = () => {
    const [latestData, setLatestData] = useState<any | null>(null);
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();

    useEffect(() => {
        startPolling(`http://localhost:8080/events/card?action=get&placardId=${placardId}&sport=${sport}`, 5000);

        const interval = setInterval(() => {
            setLatestData(latestPollingData);
        }, 5000);

        return () => {
            stopPolling();
            clearInterval(interval);
        };
    }, [sport, placardId]);

    useEffect(() => {
        if (latestData === null) return;

        const counts: Record<string, number> = {};

        if (sport === 'futsal') {
            counts['yellow'] = 0;
            counts['red'] = 0;
        } else if (sport === 'volleyball') {
            counts['white'] = 0;
            counts['yellow'] = 0;
            counts['red'] = 0;
            counts['yellow_red_together'] = 0;
            counts['yellow_red_separately'] = 0;
        }

        for (let i = 0; i < latestData.cards.length; i++) {
            const cardType = latestData.cards[i].cardType;
            if (Object.prototype.hasOwnProperty.call(counts, cardType)) {
                counts[cardType]++;
            }
        }

        setCardCounts(counts);
    }, [latestData, sport]);

    return (
        <>
            {Object.entries(cardCounts).map(([cardType, count]) => (
                <p key={cardType}>
                    {count}
                    {' '}
                    {cardType.replace('_', ' ')}
                    {' '}
                    Card
                    {count !== 1 ? 's' : ''}
                </p>
            ))}
        </>
    );
};

export default Cards;
