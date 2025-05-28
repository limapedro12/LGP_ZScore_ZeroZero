import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import apiManager, {
    FetchedEventItem, ApiScoreEventData, ApiFoulEventData, ApiCardEventData, ActionType, ApiTeam,
} from '../api/apiManager'; // Removed ApiTimeoutEventData, adjusted line length
import { formatTime } from '../utils/timeUtils';
import { getEventIconPath, EventCategory } from '../utils/scorersTableUtils';
import { getCardIconPath, Sport as CardUtilsSport } from '../utils/cardUtils';
import PlayerJersey from './playerJersey';
import './../styles/eventHistory.scss';

type Sport = 'futsal' | 'basketball' | 'volleyball';

interface Event {
    id: number | string;
    timestamp: number;
    type: 'card' | 'foul' | 'score' | 'timeout' | 'substitution';
    description: string;
    team?: 'home' | 'away';
    player?: string;
    details?: FetchedEventItem;
    icon?: React.ReactNode;
    teamLogo?: string;
    playerNumber?: string | number;
    originalPlayerId?: string | number;
    originalCardType?: string;
    originalPointValue?: number | string;
}

interface Player {
    id: string | number;
    name: string;
    number: string | number;
}

const mockHomePlayers: Player[] = [
    { id: 'H1', name: 'Jogador Casa 1', number: 10 },
    { id: 'H2', name: 'Jogador Casa 2', number: 12 },
    { id: 'H3', name: 'Carina Moura (Casa)', number: 13 },
];
const mockAwayPlayers: Player[] = [
    { id: 'A1', name: 'Jogador Fora 1', number: 7 },
    { id: 'A2', name: 'Jogador Fora 2', number: 9 },
];


const tabs: Record<Sport, string[]> = {
    futsal: ['recentes', 'golos', 'faltas', 'cartões', 'pausas'],
    basketball: ['recentes', 'golos', 'faltas', 'pausas'],
    volleyball: ['recentes', 'pontos', 'cartões', 'pausas'],
};

interface EditFormData {
    team: 'home' | 'away';
    playerId?: string | number;
    playerNumber?: string | number;
    cardType?: string;
    pointValue?: string | number;
}

interface EventUpdateParams {
    placardId: string;
    sport: Sport;
    eventId: string;
    team?: 'home' | 'away';
    playerId?: string | number;
    timestamp?: number;
    pointValue?: string | number;
    cardType?: string;
    [key: string]: string | number | undefined;
}

interface UpdateCardParams {
    placardId: string;
    sport: Sport;
    eventId: string;
    team: 'home' | 'away';
    playerId: string;
    cardType: string;
    timestamp: number;
    [key: string]: string | number | undefined;
}

const EventHistory: React.FC = () => {
    const { sport: sportParam, placardId: placardIdParam } = useParams<{ sport: Sport, placardId: string }>();
    const navigate = useNavigate();

    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('recentes');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<EditFormData>>({});
    const [editFormError, setEditFormError] = useState<string | null>(null);
    const [showEditConfirmModal, setShowEditConfirmModal] = useState<boolean>(false);
    const [editConfirmMessage, setEditConfirmMessage] = useState<string>('');

    const [homeTeam, setHomeTeam] = useState<ApiTeam>();
    const [awayTeam, setAwayTeam] = useState<ApiTeam>();
    // const homeTeam: ApiTeam = ({
    //     id: 'home',
    //     name: 'Equipa Casa',
    //     logoURL: '/path/to/home/logo.png',
    //     color: '#FF0000', // Example color
    //     acronym: 'HC',
    //     sport: 'futsal', // Adjust sport as needed
    // });
    // const awayTeam: ApiTeam = ({
    //     id: 'away',
    //     name: 'Equipa Fora',
    //     logoURL: '/path/to/away/logo.png',
    //     color: '#0000FF', // Example color
    //     acronym: 'AF',
    //     sport: 'futsal', // Adjust sport as needed
    // });

    const sport = sportParam as Sport;
    const placardId = placardIdParam;

    const homePlayers = mockHomePlayers;
    const awayPlayers = mockAwayPlayers;

    const fetchTeams = useCallback(async () => {
        if (placardId === 'default') return;
        try {
            const info = await apiManager.getPlacardInfo(placardId, sport);
            if (info) {
                const home = await apiManager.getTeamInfo(info.firstTeamId);
                const away = await apiManager.getTeamInfo(info.secondTeamId);
                setHomeTeam(home);
                setAwayTeam(away);
            }
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    }, [placardId, sport, sportParam, navigate]);

    const getEventIcon = useCallback((event: Event, currentSport: Sport): React.ReactNode => {
        let category: EventCategory | undefined;
        let iconPath: string | undefined;

        switch (event.type) {
            case 'score':
                if (currentSport === 'futsal') category = 'futsalScore';
                else if (currentSport === 'basketball') category = 'basketballScore';
                else if (currentSport === 'volleyball') category = 'volleyballScore';
                if (category) {
                    iconPath = getEventIconPath(category);
                }
                break;
            case 'foul':
                iconPath = getEventIconPath('foul');
                break;
            case 'card':
                if (event.details && typeof event.details.cardType === 'string') {
                    if (currentSport === 'futsal' || currentSport === 'volleyball') {
                        iconPath = getCardIconPath(currentSport as CardUtilsSport, event.details.cardType);
                    } else {
                        iconPath = getEventIconPath('card');
                    }
                } else {
                    iconPath = getEventIconPath('card');
                }
                break;
            case 'timeout':
                iconPath = getEventIconPath('timeout');
                break;
            case 'substitution':
                iconPath = getEventIconPath('substitution');
                break;
            default:
                return null;
        }

        if (iconPath) {
            return <img src={iconPath} alt={`${event.type} icon`} className="event-history-icon-img" />;
        }
        return null;
    }, []);

    const normalizeEventData = useCallback((
        fetchedItems: ReadonlyArray<FetchedEventItem>,
        type: Event['type']
    ): Promise<Event[]> => Promise.all(fetchedItems.map(async (item: FetchedEventItem, index: number) => {
        let gameTimeSeconds = 0;
        let rawGameTimeValue: number | string | undefined | null = item.timestamp;

        if (rawGameTimeValue === undefined || rawGameTimeValue === null) {
            if ('timeSpan' in item && item.timeSpan !== null && item.timeSpan !== undefined) {
                rawGameTimeValue = item.timeSpan as string | number;
            }
        }

        if (rawGameTimeValue !== undefined && rawGameTimeValue !== null) {
            const parsedTimestamp = parseInt(String(rawGameTimeValue), 10);
            if (!isNaN(parsedTimestamp)) {
                gameTimeSeconds = parsedTimestamp;
            }
        }

        const randomSuffix = Math.random().toString(36).substring(7);
        const eventId: string | number = item.eventId || item.id || `${type}-${gameTimeSeconds}-${index}-${randomSuffix}`;

        let effectiveTeamDesignation: 'home' | 'away' | undefined;
        if (item.team === 'home' || item.teamId === 'home') {
            effectiveTeamDesignation = 'home';
        } else if (item.team === 'away' || item.teamId === 'away') {
            effectiveTeamDesignation = 'away';
        } else if (
            item.playerId &&
            (type === 'foul' || type === 'card' || type === 'score')
        ) {
            if (homePlayers.some((p) => String(p.id) === String(item.playerId))) {
                effectiveTeamDesignation = 'home';
            } else if (awayPlayers.some((p) => String(p.id) === String(item.playerId))) {
                effectiveTeamDesignation = 'away';
            }
        }

        let finalTeamValue: 'home' | 'away' | undefined = effectiveTeamDesignation;
        if (!finalTeamValue) {
            const rawTeamSource = item.teamId || item.team;
            if (rawTeamSource === 'home' || rawTeamSource === 'away') {
                finalTeamValue = rawTeamSource;
            }
        }

        let currentTeamLogo: string | undefined;
        if (finalTeamValue === 'home' && homeTeam) {
            currentTeamLogo = homeTeam.logoURL;
        } else if (finalTeamValue === 'away' && awayTeam) {
            currentTeamLogo = awayTeam.logoURL;
        } else {
            currentTeamLogo = item.teamLogo || undefined;
        }

        let newDescription: string;
        let resolvedPlayerName: string | undefined;
        let resolvedPlayerNumber: string | number | undefined;

        if (item.playerId) {
            const currentPlayerIdString = String(item.playerId);
            const foundPlayer = await apiManager.getPlayerInfo(currentPlayerIdString);
            if (foundPlayer.name) {
                resolvedPlayerName = foundPlayer.name;
                resolvedPlayerNumber = foundPlayer.number;
            } else {
                resolvedPlayerName = item.playerName || `Jogador ${currentPlayerIdString}`;
                resolvedPlayerNumber = item.playerNumber;
            }
        } else {
            resolvedPlayerName = item.playerName;
            resolvedPlayerNumber = item.playerNumber;
        }

        const playerNameForDescription = resolvedPlayerName || (item.playerId ? `Jogador ${item.playerId}` : undefined);

        switch (type) {
            case 'score': {
                newDescription = playerNameForDescription || (sport === 'volleyball' ? 'Ponto' : 'Golo');
                break;
            }
            case 'card': {
                newDescription = playerNameForDescription || 'Cartão';
                break;
            }
            case 'foul':
                newDescription = playerNameForDescription || 'Falta';
                break;
            case 'timeout':
                newDescription = 'Pausa Técnica';
                break;
            case 'substitution':
                newDescription = 'Substituição';
                break;
            default:
                newDescription = 'Evento desconhecido';
        }

        return {
            id: eventId,
            timestamp: gameTimeSeconds,
            type,
            description: newDescription,
            team: finalTeamValue,
            player: resolvedPlayerName,
            details: item,
            icon: null, // Icon is set later in the fetchEvents logic
            teamLogo: currentTeamLogo,
            playerNumber: resolvedPlayerNumber,
            originalPlayerId: item.playerId,
            originalCardType: type === 'card' ? (item as ApiCardEventData).cardType : undefined,
            originalPointValue: type === 'score' ? (item as ApiScoreEventData).pointValue : undefined,
        };
    })), [sport, homePlayers, awayPlayers, homeTeam, awayTeam]);

    const fetchEvents = useCallback(async () => {
        if (!placardId || !sport) {
            setError('ID do placar ou esporte não especificado.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [
                scoresResponse,
                foulsResponse,
                cardsData,
                timeoutEventsData,
            ] = await Promise.allSettled([
                apiManager.makeRequest<{ points: ApiScoreEventData[] }>('score', 'get', { placardId, sport }, 'GET'),
                apiManager.makeRequest<{ data: ApiFoulEventData[] }>('foul', 'get', { placardId, sport }, 'GET'),
                apiManager.getCards(placardId, sport),
                apiManager.getTimeoutEvents(placardId, sport),
            ]);

            let allEvents: Event[] = [];

            if (scoresResponse.status === 'fulfilled' && scoresResponse.value && scoresResponse.value.points) {
                allEvents = allEvents.concat(
                    await normalizeEventData(scoresResponse.value.points, 'score'),
                );
            }

            if (foulsResponse.status === 'fulfilled' && foulsResponse.value && foulsResponse.value.data) {
                allEvents = allEvents.concat(
                    await normalizeEventData(foulsResponse.value.data, 'foul'),
                );
            }

            if (cardsData.status === 'fulfilled' && cardsData.value.cards) {
                allEvents = allEvents.concat(
                    await normalizeEventData(cardsData.value.cards, 'card'),
                );
            }

            if (timeoutEventsData.status === 'fulfilled' && timeoutEventsData.value.events) {
                allEvents = allEvents.concat(
                    await normalizeEventData(timeoutEventsData.value.events, 'timeout'),
                );
            }

            allEvents = allEvents.map((event) => ({
                ...event,
                icon: getEventIcon(event, sport),
            }));

            allEvents.sort((a, b) => b.timestamp - a.timestamp);
            setEvents(allEvents);
        } catch (e) {
            console.error('Error fetching events:', e); // Log the error details
            setError('Falha ao carregar o histórico de eventos.');
        } finally {
            setLoading(false);
        }
    }, [placardId, sport, normalizeEventData, getEventIcon, homeTeam, awayTeam]); // Add homeTeam and awayTeam as dependencies

    useEffect(() => {
        const initializeData = async () => {
            if (placardId && sport) {
                await fetchTeams();
            }
        };
        initializeData();
    }, [placardId, sport]);

    useEffect(() => {
        if (homeTeam && awayTeam) {
            fetchEvents();
        }
    }, [homeTeam, awayTeam]);

    useEffect(() => {
        let currentFilteredEvents = events;
        if (activeTab !== 'recentes') {
            const tabToEventMap: Record<string, Event['type'] | undefined> = {
                golos: 'score',
                pontos: 'score',
                faltas: 'foul',
                cartões: 'card',
                pausas: 'timeout',
                substituições: 'substitution',
            };
            const eventType = tabToEventMap[activeTab];
            if (eventType) {
                currentFilteredEvents = events.filter((event) => event.type === eventType);
            }
        }
        setFilteredEvents(currentFilteredEvents);
    }, [activeTab, events]);

    const handleOpenEditModal = (event: Event) => {
        if (event.type !== 'score' && event.type !== 'card') {
            alert('A edição só é suportada para eventos de Golo/Ponto e Cartão.');
            return;
        }
        setEventToEdit(event);
        setEditFormData({
            team: event.team === 'home' || event.team === 'away' ? event.team : 'home',
            playerId: event.originalPlayerId,
            playerNumber: event.playerNumber,
            cardType: event.type === 'card' ? event.originalCardType : undefined,
            pointValue: event.type === 'score' ? event.originalPointValue : undefined,
        });
        setEditFormError(null);
        setShowEditModal(true);
    };

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev) => {
            const updatedData = { ...prev, [name]: value };
            if (name === 'playerId') {
                const selectedTeamPlayers = prev.team === 'home' ? homePlayers : awayPlayers;
                const selectedPlayer = selectedTeamPlayers.find((p) => String(p.id) === String(value));
                if (selectedPlayer) {
                    updatedData.playerNumber = selectedPlayer.number;
                }
            }
            return updatedData;
        });
    };

    const handleEditFormSubmit = async () => {
        if (!eventToEdit || !placardId || !sport) return;

        if (!editFormData.team) {
            setEditFormError('Erro interno: A equipa para o evento não está definida.');
            return;
        }
        setEditFormError(null);

        try {
            if (eventToEdit.type === 'score') {
                if (editFormData.pointValue === undefined || editFormData.pointValue === '') {
                    setEditFormError('Valor do Ponto/Golo é obrigatório.');
                    return;
                }
                // Construct params for score update
                const scoreUpdateParams: EventUpdateParams = {
                    placardId,
                    sport,
                    eventId: String(eventToEdit.id),
                    team: editFormData.team,
                    playerId: editFormData.playerId,
                    pointValue: editFormData.pointValue,
                    timestamp: eventToEdit.timestamp,
                };
                await apiManager.makeRequest('score', 'update', scoreUpdateParams, 'POST');
                setEditConfirmMessage('Golo/Ponto atualizado com sucesso!');
            } else if (eventToEdit.type === 'card') {
                if (!editFormData.cardType) {
                    setEditFormError('Tipo de Cartão é obrigatório.');
                    return;
                }

                const cardUpdateParams: UpdateCardParams = {
                    placardId,
                    sport,
                    eventId: String(eventToEdit.id),
                    team: editFormData.team,
                    playerId: String(editFormData.playerId),
                    cardType: editFormData.cardType,
                    timestamp: eventToEdit.timestamp,
                };
                console.log('Payload enviado:', cardUpdateParams);
                await apiManager.updateCard(cardUpdateParams);
                setEditConfirmMessage('Cartão atualizado com sucesso!');
            }

            setShowEditModal(false);
            setShowEditConfirmModal(true);
            fetchEvents();
        } catch (err) {
            let msg = 'Falha ao atualizar o evento.';
            if (err instanceof Error) msg += ` Detalhes: ${err.message}`;
            setEditFormError(msg);
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEventToEdit(null);
        setEditFormData({});
        setEditFormError(null);
    };

    const closeEditConfirmModal = () => {
        setShowEditConfirmModal(false);
        setEditConfirmMessage('');
    };


    const requestDeleteEvent = (event: Event) => {
        setEventToDelete(event);
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setEventToDelete(null);
    };

    const confirmDeleteEvent = async () => {
        if (!eventToDelete) return;

        try {
            let endpointType: EndpointType;
            let action: ActionType;
            const params: {
                placardId?: string,
                sport?: Sport,
                eventId: string | number,
                team?: string, // For timeout deletion
                amount?: number // For timeout deletion
            } = { placardId, sport, eventId: eventToDelete.id };

            switch (eventToDelete.type) {
                case 'score':
                    endpointType = 'score';
                    action = 'delete';
                    break;
                case 'foul':
                    endpointType = 'foul';
                    action = 'delete';
                    break;
                case 'card':
                    endpointType = 'cards'; // Correct endpoint for cards
                    action = 'delete';    // Correct action for cards
                    break;
                case 'timeout':
                    endpointType = 'timeout';
                    action = 'adjust'; // Action to remove a timeout
                    if (!eventToDelete.team || (eventToDelete.team !== 'home' && eventToDelete.team !== 'away')) {
                        alert('Erro: Equipa inválida ou não especificada para o evento de timeout a ser excluído.');
                        cancelDelete();
                        return;
                    }
                    params.team = eventToDelete.team;
                    params.amount = -1; // Decrement timeout count
                    break;
                case 'substitution':
                    alert('A exclusão de substituições ainda não é suportada.');
                    cancelDelete();
                    return;
                default: {
                    // const exhaustiveCheck: never = eventToDelete.type; // This will cause a type error if a case is missed
                    alert(`Não é possível excluir o tipo de evento: ${eventToDelete.type}`);
                    cancelDelete();
                    return;
                }
            }

            await apiManager.makeRequest(endpointType, action, params, 'POST');
            setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventToDelete.id)); // Update UI immediately
            // fetchEvents(); // Or refetch all events
        } catch (err) {
            let errorMessage = 'Falha ao excluir o evento.';
            if (err instanceof Error) {
                errorMessage += ` Detalhes: ${err.message}`;
            } else if (typeof err === 'object' && err !== null && 'message' in err) {
                errorMessage += ` Detalhes: ${(err as { message: string }).message}`;
            }
            alert(errorMessage);
        } finally {
            cancelDelete();
        }
    };


    if (!placardId || !sport) {
        return <div className="event-history-error">ID do placar ou esporte não fornecido.</div>;
    }
    if (loading) return <div className="event-history-loading">Carregando histórico de eventos...</div>;
    if (error) {
        return (
            <div className="event-history-error">
                Erro:
                {' '}
                {error}
            </div>
        );
    }
    if (!tabs[sport]) {
        return (
            <div className="event-history-error">
                Esporte
                {' '}
                &apos;
                {sport}
                &apos;
                {' '}
                não suportado ou não definido.
            </div>
        );
    }

    const currentPlayers = editFormData.team === 'home' ? homePlayers : awayPlayers;

    return (
        <div className="event-history">
            {/* ... existing JSX for back button, title, tabs ... */}
            <Button
                className="voltar-button-custom mb-3"
                onClick={() => navigate(-1)}
            >
                ←
            </Button>
            <h2 className="event-history-title">Eventos</h2>
            <div className="tabs-container">
                {tabs[sport].map((tabName) => (
                    <button
                        key={tabName}
                        className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
                        onClick={() => setActiveTab(tabName)}
                    >
                        {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                    </button>
                ))}
            </div>
            <ul className="events-list">
                {filteredEvents.length === 0 && (
                    <li className="event-item-empty">
                        Nenhum evento para exibir nesta categoria.
                    </li>
                )}
                {filteredEvents.map((event) => (
                    <li key={event.id} className={`event-item event-type-${event.type}`}>
                        <div className="event-time">
                            {sport === 'volleyball' && event.timestamp === 0
                                ? '-'
                                : formatTime(event.timestamp)}
                        </div>
                        <div className="event-icon-display">
                            {event.icon}
                        </div>
                        <div className="event-details-main">
                            <div className="event-info-left">
                                <span className="event-description-text">
                                    {event.description}
                                </span>
                                {event.type === 'substitution' && event.details && (
                                    <span className="substitution-details-text">
                                        {/* ... substitution details ... */}
                                        {event.details.playerInName || event.details.playerInId
                                            ? ` Entra: ${String(event.details.playerInName || event.details.playerInId)}`
                                            : ''}
                                        {event.details.playerInNumber ? ` (${String(event.details.playerInNumber)})` : ''}
                                        {event.details.playerOutName || event.details.playerOutId
                                            ? `, Sai: ${String(event.details.playerOutName || event.details.playerOutId)}`
                                            : ''}
                                        {event.details.playerOutNumber ? ` (${String(event.details.playerOutNumber)})` : ''}
                                    </span>
                                )}
                            </div>

                            {(
                                (event.playerNumber && event.type !== 'timeout') ||
                                (event.details &&
                                    event.details.playerId !== null &&
                                    event.details.playerId !== undefined &&
                                    event.type !== 'timeout') ||
                                event.teamLogo
                            ) && (
                                <div className="event-visuals-group">
                                    {/* Display PlayerJersey if playerNumber exists and not a timeout event */}
                                    {event.playerNumber !== undefined &&
                                        event.playerNumber !== null &&
                                        event.playerNumber !== '' &&
                                        event.type !== 'timeout' && (
                                        <div className="player-jersey-history-item">
                                            <PlayerJersey
                                                number={typeof event.playerNumber === 'string' ?
                                                    parseInt(event.playerNumber, 10) : event.playerNumber}
                                            />
                                        </div>
                                    )}

                                    {event.teamLogo && (
                                        <img
                                            src={event.teamLogo}
                                            alt={`${event.team || 'Equipa'} logo`}
                                            className="team-logo-miniature"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="event-actions">
                            {(event.type === 'score' || event.type === 'card') && (
                                <button
                                    onClick={() => handleOpenEditModal(event)}
                                    className="action-button edit-button"
                                    aria-label="Editar evento"
                                >
                                    ✏️
                                </button>
                            )}
                            <button
                                onClick={() => requestDeleteEvent(event)}
                                className="action-button delete-button"
                                aria-label="Excluir evento"
                            >
                                🗑️
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && eventToDelete && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <h3 className="confirmation-modal-title">Confirmar Exclusão?</h3>
                        <p className="confirmation-modal-text">
                            Tem a certeza que deseja excluir o evento: &quot;
                            {eventToDelete.description}
                            {eventToDelete.player ? ` - ${eventToDelete.player}` : ''}
                            &quot;?
                        </p>
                        <div className="confirmation-modal-actions">
                            <Button variant="danger" className="confirmation-modal-button cancel" onClick={cancelDelete}>
                                NÃO
                            </Button>
                            <Button variant="success" className="confirmation-modal-button confirm" onClick={confirmDeleteEvent}>
                                SIM
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && eventToEdit && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal edit-modal">
                        {/* Added edit-modal class for specific styling if needed */}
                        <h3 className="confirmation-modal-title">Editar Evento</h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEditFormSubmit();
                            }}
                            className="edit-event-form"
                        >
                            <div className="form-group">
                                <label>
                                    Equipa:
                                </label>
                                {/* Label for the static team display */}
                                <div className="team-display-info">
                                    {/* Container for the logo and name */}
                                    {editFormData.team && ( // Check if team info is available in form data
                                        <img
                                            src={editFormData.team === 'home' ? homeTeam.logoURL : awayTeam.logoURL}
                                            alt={`${editFormData.team} logo`}
                                            className="team-logo-form-preview"
                                        />
                                    )}
                                    {/* Optionally, display team name if desired */}
                                    {/* <span>{editFormData.team === 'home' ? 'Casa' : 'Fora'}</span> */}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="playerId">Jogador:</label>
                                <select
                                    id="playerId"
                                    name="playerId"
                                    value={editFormData.playerId || ''}
                                    onChange={handleEditFormChange}
                                    required
                                >
                                    <option value="">Selecione um Jogador</option>
                                    {currentPlayers.map((player) => (
                                        <option key={player.id} value={player.id}>
                                            {player.number}
                                            {' - '}
                                            {player.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {eventToEdit.type === 'score' && (
                                <div className="form-group">
                                    <label htmlFor="pointValue">Pontuação:</label>
                                    <input
                                        type="number"
                                        id="pointValue"
                                        name="pointValue"
                                        value={editFormData.pointValue || ''}
                                        onChange={handleEditFormChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            )}

                            {eventToEdit.type === 'card' && (
                                <div className="form-group">
                                    <label htmlFor="cardType">Tipo de Cartão:</label>
                                    <select
                                        id="cardType"
                                        name="cardType"
                                        value={editFormData.cardType || ''}
                                        onChange={handleEditFormChange}
                                        required
                                    >
                                        <option value="">Selecione o Tipo</option>
                                        <option value="yellow">Amarelo</option>
                                        <option value="red">Vermelho</option>
                                        {/* Add other card types if applicable for the sport */}
                                    </select>
                                </div>
                            )}
                            {/* Timestamp editing can be added here if needed */}

                            {editFormError && (
                                <p className="form-error-text">
                                    {editFormError}
                                </p>
                            )}

                            <div className="confirmation-modal-actions">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="confirmation-modal-button cancel"
                                    onClick={closeEditModal}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" className="confirmation-modal-button confirm">
                                    Editar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Confirmation Modal */}
            {showEditConfirmModal && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <h3 className="confirmation-modal-title">Alterações Confirmadas</h3>
                        <p className="confirmation-modal-text">
                            {editConfirmMessage}
                        </p>
                        <div className="confirmation-modal-actions">
                            <Button variant="success" className="confirmation-modal-button confirm" onClick={closeEditConfirmModal}>
                                OK
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventHistory;
