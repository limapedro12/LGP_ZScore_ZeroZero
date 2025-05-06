import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';

/**
 * An real-time update of cards with a menu to display the last 5 cards.
 *
 * @returns {React.FC} Cards component
 */
const Cards: React.FC = () => {
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    interface Card {
        cardType: string;
        playerId: string;
        timestamp: number;
    }

    const [lastCards, setLastCards] = useState<Array<Card>>([]);
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();

    const fetchCards = React.useCallback(async () => {
        try {
            if (!placardId || !sport) {
                console.error('Missing placardId or sport');
                return;
            }
            const data = await apiManager.getCards(placardId, sport);
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
            data.cards.sort((a, b) => b.timestamp - a.timestamp);
            const lastCards = data.cards.slice(0, 5);
            setLastCards(lastCards);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }, [placardId, sport]);

    const labels: Record<string, string> = {
        yellow: 'Amarelo',
        red: 'Vermelho',
        white: 'Branco',
        'yellow_red_together': 'Amarelo e Vermelho Juntos',
        'yellow_red_separately': 'Amarelo e Vermelho Separados',
    };

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
                    {labels[cardType] || cardType}
                </p>
            ))}
            <div>
                <h2>Últimos Cartões</h2>
                <ol>
                    {lastCards.map((card, index) => (
                        <li key={index}>
                            {labels[card.cardType] || card.cardType}
                            {' '}
                            -
                            {' '}
                            {card.playerId}
                        </li>
                    ))}
                    {lastCards.length === 0 && <p>No cards available</p>}
                </ol>
            </div>
        </>
    );
};

export default Cards;
