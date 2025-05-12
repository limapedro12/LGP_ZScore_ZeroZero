import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiManager, {
    EndpointType,
    ActionType,
    FetchedEventItem, // Importar o novo tipo de união
    ApiScoreEventData,  // Importar para type casting se necessário
    ApiFoulEventData,   // Importar para type casting se necessário
    ApiCardEventData,   // Importar para type casting se necessário
    ApiTimeoutEventData, // Importar para type casting se necessário
} from '../api/apiManager';
import '../styles/eventHistory.scss';
import Button from 'react-bootstrap/Button';

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

    // Novos estados para o modal de confirmação de exclusão
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const sport = sportParam as Sport;
    const placardId = placardIdParam;

    const getEventIcon = useCallback((event: Event, currentSport: Sport): React.ReactNode => {
        switch (event.type) {
            case 'score':
                if (currentSport === 'futsal') return '⚽'; // Futsal icon
                if (currentSport === 'basketball') return '🏀'; // Basketball icon
                if (currentSport === 'volleyball') return '🏐'; // Volleyball icon
                return '🥅'; // Generic score icon
            case 'card': {
                const details = event.details as { cardType?: unknown };
                const cardType = details && typeof details.cardType === 'string' ?
                    details.cardType.toLowerCase() : '';
                if (cardType === 'yellow') return <div className="card-display-icon yellow-card-icon">🟨</div>;
                if (cardType === 'red') return <div className="card-display-icon red-card-icon">🟥</div>;
                return <div className="card-display-icon">📇</div>;
            }
            case 'foul':
                return '✋';
            case 'timeout':
                return '⏱️';
            case 'substitution':
                return '🔄';
            default:
                return null;
        }
    }, []);

    const normalizeEventData = useCallback((
        fetchedItems: ReadonlyArray<FetchedEventItem>, // Usar o tipo FetchedEventItem
        type: Event['type'],
        currentSport: Sport,
    ): Event[] => fetchedItems.map((item: FetchedEventItem, index: number) => { // Fix for arrow-body-style
        let description = '';
        // Acesso seguro às propriedades, pois agora estão no tipo FetchedEventItem (maioria opcionais via BaseApiEvent)
        const playerInfo = item.playerName || (item.playerId ? `Jogador ${item.playerId}` : '');
        const teamInfo = item.teamId || item.team; // item.team é TeamType | null, item.teamId é string | undefined

        let eventTimestamp: number; // eventId will be const now

        const rawTimestamp = item.timestamp || item.recordedAt;
        // Garantir que o timestamp é um número; usar Date.now() como fallback robusto
        eventTimestamp = rawTimestamp ? parseInt(String(rawTimestamp), 10) : Date.now();
        if (isNaN(eventTimestamp)) { // Se parseInt falhar (e.g. timestamp não numérico)
            eventTimestamp = Date.now();
        }

        const randomSuffix = Math.random().toString(36).substring(7);
        const eventId: string | number = item.eventId || item.id || `${type}-${eventTimestamp}-${index}-${randomSuffix}`;


        switch (type) {
            case 'score': { // Fix for no-case-declarations
                const scoreItem = item as ApiScoreEventData;
                description = `${scoreItem.pointValue || 1} ${currentSport === 'volleyball' ? 'ponto(s)' : 'golo(s)'}`;
                if (playerInfo) description += ` por ${playerInfo}`;
                break;
            }
            case 'card': { // Fix for no-case-declarations
                const cardItem = item as ApiCardEventData; // cardType é obrigatório em ApiCardEventData
                description = `Cartão ${cardItem.cardType}`;
                if (playerInfo) description += ` para ${playerInfo}`;
                break;
            }
            case 'foul': { // Fix for no-case-declarations
                const foulItem = item as ApiFoulEventData;
                description = 'Falta';
                if (playerInfo) description += ` de ${playerInfo}`;
                if (foulItem.period) description += ` (Período ${foulItem.period})`;
                break;
            }
            case 'timeout':
                // const timeoutItem = item as ApiTimeoutEventData; // Não usado diretamente para descrição
                description = 'Pausa Técnica';
                if (teamInfo) description += ` (${teamInfo})`;
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
            timestamp: eventTimestamp,
            type,
            description,
            team: teamInfo || undefined, // Garantir que é string ou undefined
            player: playerInfo,
            details: { ...item }, // Manter todos os detalhes originais do item
            icon: null, // Será definido mais tarde por getEventIcon
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
                // console.error('Erro ao buscar scores:', scoresResponse.reason);
            }

            if (foulsResponse.status === 'fulfilled' && foulsResponse.value && (foulsResponse.value as { data: unknown[] }).data) {
                allEvents = allEvents.concat(
                    normalizeEventData((foulsResponse.value as { data: unknown[] }).data as ApiFoulEventData[], 'foul', sport),
                );
            } else if (foulsResponse.status === 'rejected') {
                // console.error('Erro ao buscar fouls:', foulsResponse.reason);
            }

            if (cardsData.status === 'fulfilled' && cardsData.value.cards) {
                allEvents = allEvents.concat(
                    normalizeEventData(cardsData.value.cards as ApiCardEventData[], 'card', sport),
                );
            } else if (cardsData.status === 'rejected') {
                // console.error('Erro ao buscar cards:', cardsData.reason);
            }

            if (timeoutEventsData.status === 'fulfilled' && timeoutEventsData.value.events) {
                allEvents = allEvents.concat(
                    normalizeEventData(timeoutEventsData.value.events as ApiTimeoutEventData[], 'timeout', sport),
                );
            } else if (timeoutEventsData.status === 'rejected') {
                // console.error('Erro ao buscar timeouts:', timeoutEventsData.reason);
            }

            allEvents = allEvents.map((event) => ({
                ...event,
                icon: getEventIcon(event, sport),
            }));

            allEvents.sort((a, b) => b.timestamp - a.timestamp);
            setEvents(allEvents);

        } catch (e) {
            // console.error("Erro geral ao buscar eventos:", e);
            setError('Falha ao carregar o histórico de eventos.');
        } finally {
            setLoading(false);
        }
    }, [placardId, sport, normalizeEventData, getEventIcon]);

    useEffect(() => {
        if (placardId && sport) {
            fetchEvents();
            const intervalId = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
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
        // console.log('Iniciar edição para o evento:', event);
        // Exemplo: navigate(`/scoreboard/${sport}/${placardId}/event/${event.type}/${event.id}/edit`,
        // { state: { eventDetails: event.details } });
        alert(`Edição para '${event.description}' iniciada.\nImplementar navegação para formulário de edição específico.`);
    };

    // Modificada para mostrar o modal em vez do prompt
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
                team?: string
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
                    action = 'remove';
                    break;
                case 'timeout':
                    endpointType = 'timeout';
                    action = 'delete';
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

    const formatDisplayTime = (timestamp: number): string => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                            {formatDisplayTime(event.timestamp)}
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
                                <span className="player-number-badge">
                                    {event.playerNumber}
                                </span>
                            )}
                            {event.teamLogo && (
                                <img
                                    src={event.teamLogo}
                                    alt="Logo da Equipe"
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
                                onClick={() => requestDeleteEvent(event)} // Modificado aqui
                                className="action-button delete-button"
                                aria-label="Excluir evento"
                            >
                                🗑️
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {/* Modal de Confirmação de Exclusão */}
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
