import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiManager from '../api/apiManager';
import '../styles/cards.scss'; // Import the SCSS file

/**
 * Props for the Cards component.
 */
interface CardsProps {
    direction?: 'left' | 'right';
}

/**
 * A real-time update of cards with a menu to display the last 5 cards.
 *
 * @param {CardsProps} props - The props for the component.
 * @returns {React.FC} Cards component
 */
const Cards: React.FC<CardsProps> = ({ direction = 'left' }) => {
    const [lastCards, setLastCards] = useState<Array<any>>([]);
    const { sport, placardId } = useParams<{ sport: string; placardId: string }>();

    const fetchCards = React.useCallback(async () => {
        try {
            const data = await apiManager.getCards(placardId!, sport!);
            data.cards.sort((a, b) => b.timestamp - a.timestamp);
            const lastCards = data.cards.slice(0, 5);
            setLastCards(lastCards);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    }, [placardId, sport]);

    // const labels: Record<string, string> = {
    //     yellow: 'Amarelo',
    //     red: 'Vermelho',
    //     white: 'Branco',
    //     'yellow_red_together': 'Amarelo e Vermelho Juntos',
    //     'yellow_red_separately': 'Amarelo e Vermelho Separados',
    // };

    const renderCardVisual = (cardType: string) => {
        switch (cardType) {
            case 'yellow':
                return <div className="card-visual yellow" />;
            case 'red':
                return <div className="card-visual red" />;
            case 'yellow_red_together':
                return (
                    <div className="card-visual yellow-red-together">
                        <div className="half yellow" />
                        <div className="half red" />
                    </div>
                );
            case 'yellow_red_separately':
                return (
                    <div className="yellow_red_separately">
                        <div className="card-visual yellow" />
                        <div className="card-visual red" />
                    </div>
                );
            case 'white':
                return <div className="card-visual white" />;
            default:
                return null;
        }
    };

    useEffect(() => {
        fetchCards();
        const intervalId = setInterval(fetchCards, 5000);

        return () => clearInterval(intervalId);
    }, [fetchCards]);

    return (
        <>
            <div className="cards">
                <h2 className="cartoes-title">Cartões</h2>
                {lastCards.map((card, index) => (
                    <div key={index} className="card-row">
                        {direction === 'right' ? (
                            <>
                                <div className="card-visual-outside al-right">
                                    {renderCardVisual(card.cardType)}
                                </div>
                                <div className="card-name">
                                    {`Nome Jogador ${card.playerId}`}
                                </div>
                                <div className="card-number">No.</div>
                            </>
                        ) : (
                            <>
                                <div className="card-number">No.</div>
                                <div className="card-name">
                                    {`Nome Jogador ${card.playerId}`}
                                </div>
                                <div className="card-visual-outside">
                                    {renderCardVisual(card.cardType)}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default Cards;
