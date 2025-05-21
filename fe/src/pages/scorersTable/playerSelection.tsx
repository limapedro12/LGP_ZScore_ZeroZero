import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import apiManager from '../../api/apiManager';
import PlayerJersey from '../../components/playerJersey';
import { ToastContainer } from 'react-toastify';
import '../../styles/playerSelection.scss';

interface Player {
  player_id: string;
  player_name: string;
  player_number: string;
  player_position: string;
  player_position_sigla: string;
  INTEAM: string;
}

interface LocationState {
  eventCategory: string;
  pointValue?: number;
  cardType?: string;
}

const PlayerSelectionPage: React.FC = () => {
    const { sport, placardId, teamTag } = useParams<{ sport: string, placardId: string, teamTag: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { eventCategory, pointValue } = location.state as LocationState || { eventCategory: '', pointValue: undefined };

    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    let jerseyColor = '#008057';
    if (teamTag === 'home') {
        jerseyColor = '#E83030';
    }

    const fetchPlayers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiManager.getTeamPlayers();
            if (Array.isArray(response)) {
                setPlayers(response);
            } else {
                console.error('Invalid response format from API:', response);
                setPlayers([]);
            }
        } catch (error) {
            console.error('Error fetching players:', error);
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handlePlayerSelect = (playerId: string) => {
        if (selectedPlayerId === playerId) {
            setSelectedPlayerId(null);
        } else {
            setSelectedPlayerId(playerId);
        }
    };

    const handleConfirm = async () => {
        if (!selectedPlayerId || !sport || !placardId || !teamTag) return;

        try {
            switch (eventCategory) {
                case 'futsalScore':
                    await apiManager.createScoreEvent(
                        placardId,
                        sport,
                        teamTag as 'home' | 'away',
                        selectedPlayerId,
                        1
                    );
                    break;
                case 'volleyballScore':
                    await apiManager.createScoreEvent(
                        placardId,
                        sport,
                        teamTag as 'home' | 'away',
                        selectedPlayerId,
                        1
                    );
                    break;
                case 'basketballScore':
                    if (!pointValue) {
                        console.error('Point value is required for basketball scores');
                        return;
                    }
                    await apiManager.createScoreEvent(
                        placardId,
                        sport,
                        teamTag as 'home' | 'away',
                        selectedPlayerId,
                        pointValue
                    );
                    break;
                case 'card': {
                    const { cardType } = location.state as LocationState;
                    if (!cardType) {
                        console.error('Card type is required for card events');
                        return;
                    }
                    await apiManager.createCard(
                        placardId,
                        sport,
                        selectedPlayerId,
                        cardType,
                        teamTag as 'home' | 'away'
                    );
                    break;
                }
                default:
                    console.error(`Unsupported event category: ${eventCategory}`);
            }

            navigate(`/scorersTable/${sport}/${placardId}`);
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const filteredPlayers = players.filter((player) => {
        const nameMatches = player.player_name.toLowerCase().includes(searchTerm.toLowerCase());
        const numberMatches = player.player_number.includes(searchTerm);
        return nameMatches || numberMatches;
    });

    const getPlayerCardClass = (playerId: string) => {
        let className = 'player-card';
        if (selectedPlayerId === playerId) {
            className += ' selected';
        }
        return className;
    };

    let playersContent;
    if (isLoading) {
        playersContent = <div className="text-center text-white p-4">Carregando jogadores...</div>;
    } else if (filteredPlayers.length === 0) {
        playersContent = <div className="text-center text-white p-4">Sem jogadores disponíveis</div>;
    } else {
        playersContent = (
            <div className="players-grid">
                {filteredPlayers.map((player) => (
                    <div
                        key={player.player_id}
                        className={getPlayerCardClass(player.player_id)}
                        onClick={() => handlePlayerSelect(player.player_id)}
                    >
                        <div className="jersey-container">
                            <PlayerJersey
                                number={Number(player.player_number)}
                                color={jerseyColor}
                            />
                        </div>
                        <div className="player-details">
                            <div className="player-name">
                                {player.player_name}
                            </div>
                            <div className="player-position">
                                {player.player_position}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <Container fluid className="player-selection-container p-0">
            <ToastContainer />
            <Row className="header-row gx-0 pt-3 pb-3 px-3 align-items-center">
                <Col xs="auto">
                    <Button variant="link" onClick={handleGoBack} className="p-0 me-2 back-button">
                        <ArrowLeft color="white" size={30} className="thicker-arrow-icon" />
                    </Button>
                </Col>
                <Col>
                    <h1 className="page-title mb-0 text-center">Selecione o Jogador</h1>
                </Col>
                <Col xs="auto" style={{ visibility: 'hidden' }}>
                    <ArrowLeft color="white" size={30} />
                </Col>
            </Row>

            <Row className="search-row gx-0 py-3 px-3">
                <Col className="d-flex justify-content-center">
                    <Form.Control
                        type="text"
                        placeholder="Pesquisar jogador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </Col>
            </Row>

            <Row className="players-row gx-0" style={{ flexGrow: 1, overflowY: 'auto' }}>
                <Col>
                    {playersContent}
                </Col>
            </Row>

            <Row className="footer-row gx-0 pt-3 pb-4 px-3 justify-content-center">
                <div className="d-flex flex-column align-items-center">
                    <Button
                        variant="light"
                        className="confirm-button"
                        onClick={handleConfirm}
                        disabled={!selectedPlayerId}
                    >
                        Confirmar Seleção
                    </Button>
                </div>
            </Row>
        </Container>
    );
};

export default PlayerSelectionPage;
