import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';

/**
 * An real time update of cards
 *
 * @returns {React.FC} Home page component
 */
const Cards: React.FC = () => {
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();

    const fetchCards = React.useCallback(async () => {
        try {
            const data = await apiManager.getCards(placardId!, sport!);
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

            for (let i = 0; i < data.cards.length; i++) {
                const cardType = data.cards[i].cardType;
                if (Object.prototype.hasOwnProperty.call(counts, cardType)) {
                    counts[cardType]++;
                }
            }

            setCardCounts(counts);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchCards();
        const intervalId = setInterval(fetchCards, 5000);

        return () => clearInterval(intervalId);
    }, [fetchCards]);

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
