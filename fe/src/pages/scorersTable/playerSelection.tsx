import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import PlayerJersey from '../../components/playerJersey';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/playerSelection.scss';
import apiManager, { ApiPlayer, Sport } from '../../api/apiManager';
import { correctSportParameter } from '../../utils/navigationUtils';

interface LocationState {
  eventCategory: string;
  pointValue?: number;
  cardType?: string;
}

const PlayerSelectionPage: React.FC = () => {
    const { sport: sportParam, placardId, teamTag } = useParams<{ sport: string, placardId: string, teamTag: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { eventCategory, pointValue } = location.state as LocationState || { eventCategory: '', pointValue: undefined };

    const [players, setPlayers] = useState<ApiPlayer[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [jerseyColor, setJerseyColor] = useState(teamTag === 'home' ? '#E83030' : '#008057');
    const [selectedPlayerOut, setSelectedPlayerOut] = useState<ApiPlayer | null>(null);
    const [selectedPlayerIn, setSelectedPlayerIn] = useState<ApiPlayer | null>(null);
    const [selectionStep, setSelectionStep] = useState<'out' | 'in'>('out');
    const isSubstitutionMode = location.state?.eventCategory === 'substitution';
    const [currentSport, setCurrentSport] = useState<Sport>(sportParam as Sport);

    const fetchPlayers = useCallback(async () => {
        setIsLoading(true);
        if (!placardId || !teamTag || !currentSport) {
            setPlayers([]);
            setIsLoading(false);
            return;
        }
        try {
            const placardInfo = await apiManager.getPlacardInfo(placardId, currentSport);
            if (placardInfo.sport) {
                setCurrentSport(placardInfo.sport);
                correctSportParameter(sportParam, placardInfo.sport, navigate);
            }
            let targetTeamId: string | undefined;
            if (teamTag === 'home') targetTeamId = placardInfo.firstTeamId;
            else if (teamTag === 'away') targetTeamId = placardInfo.secondTeamId;
            if (!targetTeamId) {
                setPlayers([]);
                setIsLoading(false);
                return;
            }
            const teamInfo = await apiManager.getTeamInfo(targetTeamId as string);
            setJerseyColor(teamInfo.color);
            const lineupData = await apiManager.getTeamLineup(placardId, targetTeamId);
            if (Array.isArray(lineupData)) setPlayers(lineupData);
            else if (lineupData && typeof lineupData === 'object' && lineupData.playerId) setPlayers([lineupData as ApiPlayer]);
            else setPlayers([]);
        } catch {
            setPlayers([]);
        } finally {
            setIsLoading(false);
        }
    }, [placardId, teamTag, currentSport, sportParam, navigate]);

    useEffect(() => {
        fetchPlayers();
    }, [fetchPlayers]);

    const handleGoBack = () => navigate(-1);

    const handlePlayerSelect = (player: ApiPlayer) => {
        if (!isSubstitutionMode) {
            setSelectedPlayerId((prevId) => (prevId === player.playerId ? null : player.playerId));
        } else {
            if (selectionStep === 'out') {
                if (selectedPlayerIn && selectedPlayerIn.playerId === player.playerId) return;
                setSelectedPlayerOut(player);
                setSelectionStep('in');
            } else if (selectionStep === 'in') {
                if (selectedPlayerOut && selectedPlayerOut.playerId === player.playerId) {
                    setSelectedPlayerOut(null);
                    setSelectedPlayerIn(null);
                    setSelectionStep('out');
                    return;
                }
                if (selectedPlayerIn && selectedPlayerIn.playerId === player.playerId) {
                    setSelectedPlayerIn(null);
                    return;
                }
                setSelectedPlayerIn(player);
            }
        }
    };

    const handleConfirm = async () => {
        if (!currentSport || !placardId || !teamTag) return;
        try {
            if (isSubstitutionMode) {
                if (!selectedPlayerOut || !selectedPlayerIn) return;
                await apiManager.createSubstitution(
                    placardId,
                    currentSport,
                teamTag as 'home' | 'away',
                selectedPlayerIn.playerId,
                selectedPlayerOut.playerId
                );
            } else {
                if (!selectedPlayerId) return;
                switch (eventCategory) {
                    case 'futsalScore':
                    case 'volleyballScore':
                        await apiManager.createScoreEvent(
                            placardId,
                            currentSport,
                            teamTag as 'home' | 'away',
                            selectedPlayerId,
                            1
                        );
                        break;
                    case 'basketballScore':
                        if (!pointValue) return;
                        await apiManager.createScoreEvent(
                            placardId,
                            currentSport,
                            teamTag as 'home' | 'away',
                            selectedPlayerId,
                            pointValue
                        );
                        break;
                    case 'card': {
                        const { cardType } = location.state as LocationState;
                        if (!cardType) return;
                        await apiManager.createCard(
                            placardId,
                            currentSport,
                            selectedPlayerId,
                            cardType,
                            teamTag as 'home' | 'away'
                        );
                        break;
                    }
                    case 'foul':
                        await apiManager.createFoul(
                            placardId,
                            currentSport,
                            selectedPlayerId,
                            teamTag as 'home' | 'away'
                        );
                        break;
                    default:
                        return;
                }
            }
            navigate(`/scorersTable/${currentSport}/${placardId}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error confirming player selection:', error);
        // Error toast is already shown by apiManager, no need to add another
        }
    };

    const filteredPlayers = players.filter((player) => {
        const nameMatches = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const numberMatches = player.number ? String(player.number).includes(searchTerm) : false;
        return nameMatches || numberMatches;
    });

    const getPlayerCardClass = (player: ApiPlayer) => {
        let className = 'player-card';
        if (isSubstitutionMode) {
            if (selectedPlayerOut?.playerId === player.playerId) className += ' selected-out';
            else if (selectedPlayerIn?.playerId === player.playerId) className += ' selected-in';
        } else {
            if (selectedPlayerId === player.playerId) className += ' selected';
        }
        return className;
    };

    let pageTitle = 'Selecione o Jogador';
    if (isSubstitutionMode) {
        if (selectionStep === 'out') pageTitle = 'Selecione o Jogador a SAIR';
        else pageTitle = selectedPlayerOut ? `A SAIR: ${selectedPlayerOut.name} 
        (#${selectedPlayerOut.number}) - Selecione o Jogador a ENTRAR` : 'Selecione o Jogador a ENTRAR';
    }

    let confirmButtonText = 'Confirmar Seleção';
    let isConfirmDisabled = !selectedPlayerId;
    if (isSubstitutionMode) {
        confirmButtonText = 'Confirmar Substituição';
        isConfirmDisabled = !selectedPlayerOut || !selectedPlayerIn;
    }

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
                        key={player.playerId}
                        className={getPlayerCardClass(player)}
                        onClick={() => handlePlayerSelect(player)}
                    >
                        <div className="jersey-container">
                            <PlayerJersey
                                number={Number(player.number)}
                                color={jerseyColor}
                            />
                        </div>
                        <div className="player-details">
                            <div className="player-name">
                                {player.name}
                            </div>
                            <div className="player-position">
                                {player.position_acronym || player.position}
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
                    <h1
                        className="page-title mb-0 text-center"
                        style={{ fontSize: isSubstitutionMode && selectionStep === 'in' && selectedPlayerOut ? '1.2rem' : '1.75rem' }}
                    >
                        {pageTitle}
                    </h1>
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
                        disabled={isConfirmDisabled}
                    >
                        {confirmButtonText}
                    </Button>
                </div>
            </Row>
        </Container>
    );
};

export default PlayerSelectionPage;
