import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Sport, CardTypeForSport, getAvailableCardsForSport, SportCard } from '../../utils/cardUtils';
import CardButton from '../../components/scorersTable/cards/cardButton';
import { ArrowLeft } from 'react-bootstrap-icons';
import '../../styles/arrow.scss';

const SelectCardPage = () => {
    const { sport: sportParam, placardId, teamTag } = useParams<{
        sport: string, placardId: string, teamTag: string}>();
    const navigate = useNavigate();

    const sport = sportParam as Sport;

    const [availableCards, setAvailableCards] = useState<SportCard<Sport>[]>([]);
    const [selectedCardType, setSelectedCardType] = useState<CardTypeForSport<Sport> | null>(null);

    useEffect(() => {
        if (sport) {
            setAvailableCards(getAvailableCardsForSport(sport));
        }
    }, [sport]);

    const handleCardSelect = (cardType: CardTypeForSport<Sport>) => {
        setSelectedCardType(cardType);
    };

    const handleGoBack = () => {
        navigate(`/scorersTable/${sport}/${placardId}`);
    };

    const handleSelectPlayer = () => {
        if (selectedCardType && sport && placardId && teamTag) {
            navigate(`/scorersTable/${sport}/${placardId}/playerSelection/${teamTag}`, {
                state: {
                    eventCategory: 'card',
                    cardType: selectedCardType,
                },
            });
        } else {
            console.warn('Cannot proceed to player selection. Missing details.');
        }
    };

    const pageStyle: React.CSSProperties = {
        backgroundColor: '#2c3e50',
        minHeight: '100vh',
    };

    const titleStyle: React.CSSProperties = {
        color: 'white',
        fontSize: '1.75rem',
        fontWeight: 'bold',
    };

    const selectPlayerButtonStyle: React.CSSProperties = {
        borderRadius: '20px',
        padding: '10px 20px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
    };

    return (
        <Container fluid style={pageStyle} className="d-flex flex-column p-0">
            <Row className="w-100 gx-0 pt-3 pb-3 px-3 align-items-center" style={{ flexShrink: 0 }}>
                <Col xs="auto">
                    <Button variant="link" onClick={handleGoBack} className="p-0 me-2">
                        <ArrowLeft color="white" size={30} className="thicker-arrow-icon" />
                    </Button>
                </Col>
                <Col>
                    <h1 style={titleStyle} className="mb-0 text-center">Selecione o cartão</h1>
                </Col>
                <Col xs="auto" style={{ visibility: 'hidden' }}>
                    <ArrowLeft color="white" size={30} />
                </Col>
            </Row>

            <Row className="w-100 gx-0 justify-content-center" style={{ flexGrow: 1, overflowY: 'auto' }}>
                <Col xs={8} sm={8} md={6} lg={6} xl={4} className="d-flex flex-column align-items-center px-3 py-3">
                    {availableCards.map((card) => (
                        <CardButton
                            key={card.type}
                            cardName={card.name}
                            cardType={card.type}
                            sport={sport}
                            onCardSelect={handleCardSelect}
                            selectedCardType={selectedCardType === null ? undefined : selectedCardType}
                        />
                    ))}
                </Col>
            </Row>

            <Row className="w-100 gx-0 pt-3 pb-4 px-3 justify-content-center" style={{ flexShrink: 0 }}>
                <div className="d-flex flex-column align-items-center">
                    <Button
                        variant="light"
                        style={selectPlayerButtonStyle}
                        onClick={handleSelectPlayer}
                        disabled={!selectedCardType}
                    >
                        Selecione Jogador
                    </Button>
                </div>
            </Row>
        </Container>
    );
};

export default SelectCardPage;
