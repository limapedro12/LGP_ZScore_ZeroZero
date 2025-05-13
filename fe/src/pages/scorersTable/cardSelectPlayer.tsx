import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Image, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';
import PlayerButton from '../../components/scorersTable/playerButton';
import apiManager from '../../api/apiManager';
import {
    Sport,
    playerAssignmentActions,
    AssignCardActionParams,
    TeamTag,
} from '../../utils/scorersTableUtils';
import { CardTypeForSport, Sport as CardUtilsSportType } from '../../utils/cardUtils';

interface Player {
  id: string;
  name: string;
  number?: number;
}

const mockPlayers: Player[] = [
    { id: '1', name: 'Aaron Broussard', number: 1 },
    { id: '2', name: 'Maria Silva', number: 2 },
    { id: '3', name: 'John Doe', number: 3 },
    { id: '4', name: 'Jane Smith', number: 4 },
    { id: '5', name: 'Alex Johnson', number: 5 },
    { id: '6', name: 'Patricia Brown', number: 6 },
    { id: '7', name: 'Michael Davis', number: 7 },
    { id: '8', name: 'Linda Wilson', number: 8 },
    { id: '9', name: 'Robert Garcia', number: 9 },
    { id: '10', name: 'Jessica Martinez', number: 10 },
    { id: '11', name: 'David Rodriguez', number: 11 },
    { id: '12', name: 'Sarah Lopez', number: 12 },
    { id: '13', name: 'James Lee', number: 13 },
    { id: '14', name: 'Karen Harris', number: 14 },
];

const homeTeamLogo = '/teamLogos/slb.png';
const awayTeamLogo = '/teamLogos/scp.png';
const defaultTeamLogo = '/teamLogos/slb.png';

const CardSelectPlayerPage: React.FC = () => {
    const {
        sport,
        placardId,
        teamTag,
        cardType,
    } = useParams<{
        sport: Sport;
        placardId: string;
        teamTag: 'home' | 'away';
        cardType: CardTypeForSport<CardUtilsSportType>;
    }>();

    const navigate = useNavigate();

    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [teamLogo, setTeamLogo] = useState<string>(defaultTeamLogo);
    const [actionParams, setActionParams] = useState<AssignCardActionParams | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // TODO: Fetch players for the teamTag and sport
        setPlayers(mockPlayers);
    }, [sport, teamTag]);

    useEffect(() => {
        if (teamTag === 'home') {
            setTeamLogo(homeTeamLogo);
        } else if (teamTag === 'away') {
            setTeamLogo(awayTeamLogo);
        } else {
            setTeamLogo(defaultTeamLogo);
        }
    }, [teamTag]);


    useEffect(() => {
        if (cardType) {
            setActionParams({ cardType });
        } else {
            console.error('Card type is missing from URL parameters.');
            navigate(-1);
        }
    }, [cardType, navigate]);

    const handlePlayerSelect = (playerId: string) => {
        setSelectedPlayerId(playerId);
    };

    const handleGoBack = () => {
        if (sport && placardId && teamTag) {
            navigate(`/scorersTable/${sport}/${placardId}/selectCard/${teamTag}`);
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPlayerId || !placardId || !sport || !teamTag || !actionParams) {
            console.error('Missing information for submitting card event');
            return;
        }
        setErrorMessage(null);

        const actionConfig = playerAssignmentActions.assignCard; // Directly use assignCard
        if (!actionConfig) {
            console.error('No action configuration found for assignCard');
            return;
        }

        const { apiMethod, getApiArgs } = actionConfig;

        try {
            const apiArgs = getApiArgs(selectedPlayerId, placardId, sport, teamTag as TeamTag, actionParams);

            console.log(
                `Submitting card event: PlacardID=${placardId}, Sport=${sport}, PlayerID=´
                ${selectedPlayerId}, CardType=${actionParams.cardType}, Team=${teamTag}`
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiManagerInstance = apiManager as any;
            if (typeof apiManagerInstance[apiMethod] === 'function') {
                await apiManagerInstance[apiMethod](...apiArgs);
                console.log('Card event created successfully');
                navigate(`/scorersTable/${sport}/${placardId}`);
            } else {
                console.error(`API method ${apiMethod} not found on apiManager.`);
                setErrorMessage(`Client error: API method ${apiMethod} not found.`);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Failed to create card event:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(`Error: ${error.response.data.error}`);
            } else if (error.message) {
                setErrorMessage(`Error: ${error.message}`);
            } else {
                setErrorMessage('Failed to create card event. An unknown error occurred.');
            }
        }
    };

    const playersCol1 = players.slice(0, Math.ceil(players.length / 2));
    const playersCol2 = players.slice(Math.ceil(players.length / 2));

    const pageStyle: React.CSSProperties = {
        backgroundColor: '#2c3e50',
        minHeight: '100vh',
    };

    return (
        <Container fluid style={pageStyle} className="text-white d-flex flex-column p-0 vh-100">
            {errorMessage && (
                <Alert
                    variant="danger"
                    onClose={() => setErrorMessage(null)}
                    dismissible
                    className="position-absolute top-0 start-50 translate-middle-x mt-3 text-center"
                >
                    {errorMessage}
                </Alert>
            )}
            <Row className="w-100 gx-0 px-3 pt-3 pb-3 align-items-center flex-shrink-0">
                <Col xs="auto">
                    <Button variant="link" onClick={handleGoBack} className="p-0 me-2">
                        <ArrowLeft color="white" size={30} className="thicker-arrow-icon" />
                    </Button>
                </Col>
                <div className="d-flex align-items-center justify-content-center flex-grow-1">
                    <Image src={teamLogo} alt="Team Logo" style={{ height: '50px' }} className="me-3" />
                    <h1 className="fs-4 fw-bold mb-0">Selecionar Jogador</h1>
                </div>
                <Col xs="auto" style={{ visibility: 'hidden' }}>
                    <ArrowLeft color="white" size={30} />
                </Col>
            </Row>

            <Row className="w-100 gx-0 justify-content-center mt-3 flex-grow-1" style={{ overflowY: 'auto' }}>
                <Col xs={12} md={5} lg={5} className="d-flex flex-column align-items-center px-1">
                    {playersCol1.map((player) => (
                        <PlayerButton
                            key={player.id}
                            playerId={player.id}
                            playerName={player.name}
                            playerNumber={player.number}
                            onSelect={handlePlayerSelect}
                            isSelected={selectedPlayerId === player.id}
                        />
                    ))}
                </Col>
                <Col xs={12} md={5} lg={5} className="d-flex flex-column align-items-center px-1">
                    {playersCol2.map((player) => (
                        <PlayerButton
                            key={player.id}
                            playerId={player.id}
                            playerName={player.name}
                            playerNumber={player.number}
                            onSelect={handlePlayerSelect}
                            isSelected={selectedPlayerId === player.id}
                        />
                    ))}
                </Col>
            </Row>

            <Row className="w-100 gx-0 pt-3 pb-4 px-3 justify-content-center flex-shrink-0">
                <div className="d-flex flex-column align-items-center">
                    <Button
                        variant="light"
                        onClick={handleSubmit}
                        disabled={!selectedPlayerId || !actionParams}
                        className="rounded-pill px-4 py-2 fs-5 fw-bold text-dark"
                    >
                        Submeter
                    </Button>
                </div>
            </Row>
        </Container>
    );
};

export default CardSelectPlayerPage;
