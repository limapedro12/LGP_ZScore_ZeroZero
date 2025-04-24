import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Offcanvas, ListGroup } from 'react-bootstrap';
import apiManager from '../api/apiManager';

/**
 * An real-time update of cards with a menu to display the last 5 cards.
 *
 * @returns {React.FC} Cards component
 */
const Cards: React.FC = () => {
    const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
    const [cards, setCards] = useState<Array<{ cardType: string; timestamp: number }>>([]);
    const [showMenu, setShowMenu] = useState(false);
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
            setCards(data.cards);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }, [placardId, sport]);

    useEffect(() => {
        fetchCards();
        const intervalId = setInterval(fetchCards, 5000);

        return () => clearInterval(intervalId);
    }, [fetchCards]);

    const lastCards = cards.slice(-5).reverse();

    return (
        <>
            {Object.entries(cardCounts).map(([cardType, count]) => (
                <p key={cardType}>
                    {count} {cardType.replace('_', ' ')} Card{count !== 1 ? 's' : ''}
                </p>
            ))}
            <button
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 15px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
                onClick={() => setShowMenu(true)}
            >
                Show Last Cards
            </button>
            <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Last Cards</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ListGroup>
                        {lastCards.map((card, index) => (
                            <ListGroup.Item key={index}>
                                {card.cardType} - {new Date(card.timestamp).toLocaleString()}
                            </ListGroup.Item>
                        ))}
                        {cards.length === 0 && <p>No cards available</p>}
                    </ListGroup>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default Cards;
