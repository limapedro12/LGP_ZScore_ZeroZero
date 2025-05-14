import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiManager, {
    EndpointType,
    ActionType,
    FetchedEventItem,
    ApiScoreEventData,
    ApiFoulEventData,
    ApiCardEventData,
    ApiTimeoutEventData,
} from '../api/apiManager';
import '../styles/eventHistory.scss';
import Button from 'react-bootstrap/Button';
import { formatTime } from '../utils/timeUtils';
import { getEventIconPath, EventCategory } from '../utils/scorersTableUtils';
import { getCardIconPath, Sport as CardUtilsSport } from '../utils/cardUtils';
import PlayerJersey from './playerJersey';

type Sport = 'futsal' | 'basketball' | 'volleyball';

interface Event {
    id: number | string;
    timestamp: number;
    type: 'card' | 'foul' | 'score' | 'timeout' | 'substitution';
    description: string;
    team?: string;
    player?: string;
    details?: Record<string, unknown>;
    icon?: React.ReactNode;
    teamLogo?: string;
    playerNumber?: string | number;
}

const tabs: Record<Sport, string[]> = {
    futsal: ['recentes', 'golos', 'faltas', 'cartões', 'pausas'],
    basketball: ['recentes', 'golos', 'faltas', 'pausas'],
    volleyball: ['recentes', 'pontos', 'cartões', 'pausas'],
};

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

    const sport = sportParam as Sport;
    const placardId = placardIdParam;

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
        type: Event['type'],
        currentSport: Sport,
    ): Event[] => fetchedItems.map((item: FetchedEventItem, index: number) => {
        let description = '';
        const playerInfo = item.playerName || (item.playerId ? `Jogador ${item.playerId}` : '');
        const teamInfo = item.teamId || item.team;

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


        switch (type) {
            case 'score': {
                const scoreItem = item as ApiScoreEventData;
                description = `${scoreItem.pointValue || 1} ${currentSport === 'volleyball' ? 'ponto(s)' : 'golo(s)'}`;
                if (playerInfo) description += ` por ${playerInfo}`;
                break;
            }
            case 'card': {
                if (playerInfo) description += `${playerInfo}`;
                break;
            }
            case 'foul': {
                if (playerInfo) description += ` ${playerInfo}`;
                break;
            }
            case 'timeout':
                description = 'Pausa Técnica';
                break;
            case 'substitution':
                description = `Substituição: Entra ${item.playerInName || item.playerInId}, Sai ${item.playerOutName
                  || item.playerOutId}`;
                break;
            default:
                description = 'Evento desconhecido';
        }

        return {
            id: eventId,
            timestamp: gameTimeSeconds,
            type,
            description,
            team: teamInfo || undefined,
            player: playerInfo,
            details: { ...item },
            icon: null,
            teamLogo: item.teamLogo,
            playerNumber: item.playerNumber,
        };
    }), []);

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
                apiManager.makeRequest('score', 'get', { placardId, sport }, 'GET'),
                apiManager.makeRequest('foul', 'list_game_fouls', { placardId, sport }, 'GET'),
                apiManager.getCards(placardId, sport),
                apiManager.getTimeoutEvents(placardId, sport),
            ]);

            let allEvents: Event[] = [];

            if (scoresResponse.status === 'fulfilled' && scoresResponse.value && (scoresResponse.value as { points: unknown[] }).points) {
                allEvents = allEvents.concat(
                    normalizeEventData((scoresResponse.value as { points: unknown[] }).points as ApiScoreEventData[], 'score', sport),
                );
            } else if (scoresResponse.status === 'rejected') {
                // Intentionally empty
            }

            if (foulsResponse.status === 'fulfilled' && foulsResponse.value && (foulsResponse.value as { data: unknown[] }).data) {
                allEvents = allEvents.concat(
                    normalizeEventData((foulsResponse.value as { data: unknown[] }).data as ApiFoulEventData[], 'foul', sport),
                );
            } else if (foulsResponse.status === 'rejected') {
                // Intentionally empty
            }

            if (cardsData.status === 'fulfilled' && cardsData.value.cards) {
                allEvents = allEvents.concat(
                    normalizeEventData(cardsData.value.cards as ApiCardEventData[], 'card', sport),
                );
            } else if (cardsData.status === 'rejected') {
                // Intentionally empty
            }

            if (timeoutEventsData.status === 'fulfilled' && timeoutEventsData.value.events) {
                allEvents = allEvents.concat(
                    normalizeEventData(timeoutEventsData.value.events as ApiTimeoutEventData[], 'timeout', sport),
                );
            } else if (timeoutEventsData.status === 'rejected') {
                // Intentionally empty
            }

            allEvents = allEvents.map((event) => ({
                ...event,
                icon: getEventIcon(event, sport),
            }));

            allEvents.sort((a, b) => b.timestamp - a.timestamp);
            setEvents(allEvents);

        } catch (e) {
            setError('Falha ao carregar o histórico de eventos.');
        } finally {
            setLoading(false);
        }
    }, [placardId, sport, normalizeEventData, getEventIcon]);

    useEffect(() => {
        if (placardId && sport) {
            fetchEvents();
            const intervalId = setInterval(fetchEvents, 30000);
            return () => clearInterval(intervalId);
        }
        return undefined;
    }, [fetchEvents, placardId, sport]);

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


    const handleEdit = (event: Event) => {
        alert(`Edição para '${event.description}' iniciada.\nImplementar navegação para formulário de edição específico.`);
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
                team?: string,
                amount?: number
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
                    endpointType = 'cards';
                    action = 'delete';
                    break;
                case 'timeout':
                    endpointType = 'timeout';
                    action = 'adjust';

                    if (!eventToDelete.team || (eventToDelete.team !== 'home' && eventToDelete.team !== 'away')) {
                        alert('Erro: Equipa inválida ou não especificada para o evento de timeout a ser excluído.');
                        cancelDelete();
                        return;
                    }
                    params.team = eventToDelete.team;
                    params.amount = -1;
                    break;
                case 'substitution':
                    alert('A exclusão de substituições ainda não é suportada.');
                    cancelDelete();
                    return;
                default: {
                    const exhaustiveCheck: never = eventToDelete.type;
                    alert(`Não é possível excluir o tipo de evento: ${exhaustiveCheck}`);
                    cancelDelete();
                    return;
                }
            }

            await apiManager.makeRequest(endpointType, action, params, 'POST');
            setEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventToDelete.id));
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

    return (
        <div className="event-history">
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
                            <span className="event-description-text">
                                {event.description}
                            </span>
                        </div>
                        <div className="event-team-info">
                            {event.playerNumber && (
                                <PlayerJersey number={parseInt(String(event.playerNumber), 10)} />
                            )}
                            {event.teamLogo && (
                                <img
                                    src={event.teamLogo}
                                    alt={`${event.team || 'Equipa'} logo`}
                                    className="team-logo-display"
                                />
                            )}
                        </div>
                        <div className="event-actions">
                            <button
                                onClick={() => handleEdit(event)}
                                className="action-button edit-button"
                                aria-label="Editar evento"
                            >
                                ✏️
                            </button>
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

            {showDeleteConfirm && eventToDelete && (
                <div className="confirmation-modal-overlay">
                    <div className="confirmation-modal">
                        <h3 className="confirmation-modal-title">Confirmar Alterações?</h3>
                        <p className="confirmation-modal-text">
                            Tem a certeza que deseja excluir o evento: &quot;
                            {eventToDelete.description}
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
        </div>
    );
};

export default EventHistory;
