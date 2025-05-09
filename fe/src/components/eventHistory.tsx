import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiManager, { EndpointType, ActionType } from '../api/apiManager';
import '../styles/eventHistory.scss';

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

    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('recentes');

    const sport = sportParam as Sport;
    const placardId = placardIdParam;

    const getEventIcon = useCallback((event: Event, currentSport: Sport): React.ReactNode => {
        switch (event.type) {
            case 'score':
                if (currentSport === 'futsal') return '⚽'; // Futsal icon
                if (currentSport === 'basketball') return '🏀'; // Basketball icon
                if (currentSport === 'volleyball') return '🏐'; // Volleyball icon
                return '🥅'; // Generic score icon
            case 'card': { // Added block scope for lexical declaration
                const details = event.details as { cardType?: unknown }; // More specific type assertion
                const cardType = details && typeof details.cardType === 'string' ?
                    details.cardType.toLowerCase() : '';
                if (cardType === 'yellow') return <div className="card-display-icon yellow-card-icon">🟨</div>;
                if (cardType === 'red') return <div className="card-display-icon red-card-icon">🟥</div>;
                return <div className="card-display-icon">📇</div>; // Generic card icon
            }
            case 'foul':
                return '✋'; // Foul icon (hand)
            case 'timeout':
                return '⏱️'; // Timeout icon (stopwatch)
            case 'substitution':
                return '🔄'; // Substitution icon
            default:
                return null;
        }
    }, []);

    const normalizeEventData = useCallback((
        fetchedItems: unknown[],
        type: Event['type'],
        currentSport: Sport,
    ): Event[] => {
        if (!Array.isArray(fetchedItems)) {
            return [];
        }
        return fetchedItems.map((item: any, index: number) => { // item can remain any for flexibility from API
            let description = '';
            const playerInfo = item.playerName || (item.playerId ? `Jogador ${item.playerId}` : '');
            const teamInfo = item.teamId || item.team;

            switch (type) {
                case 'score':
                    description = `${item.pointValue || 1} ${currentSport === 'volleyball' ? 'ponto(s)' : 'golo(s)'}`;
                    if (playerInfo) description += ` por ${playerInfo}`;
                    break;
                case 'card':
                    description = `Cartão ${item.cardType || ''}`; // Accessing item.cardType directly
                    if (playerInfo) description += ` para ${playerInfo}`;
                    break;
                case 'foul':
                    description = 'Falta';
                    if (playerInfo) description += ` de ${playerInfo}`;
                    if (item.period) description += ` (Período ${item.period})`;
                    break;
                case 'timeout':
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
            const randomSuffix = Math.random().toString(36).substring(7);
            const eventId = item.eventId || item.id ||
                `${type}-${item.timestamp}-${index}-${randomSuffix}`; // Broken into multiple lines
            const eventTimestamp = parseInt(item.timestamp || item.recordedAt || Date.now().toString(), 10);

            return {
                id: eventId,
                timestamp: eventTimestamp,
                type,
                description,
                team: teamInfo,
                player: playerInfo,
                details: item,
                icon: null, // Icon will be set later by getEventIcon
                teamLogo: item.teamLogo,
                playerNumber: item.playerNumber,
            };
        });
    }, []);

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
                    normalizeEventData((scoresResponse.value as { points: unknown[] }).points, 'score', sport),
                );
            } else if (scoresResponse.status === 'rejected') {
                // console.error('Erro ao buscar scores:', scoresResponse.reason);
            }

            if (foulsResponse.status === 'fulfilled' && foulsResponse.value && (foulsResponse.value as { data: unknown[] }).data) {
                allEvents = allEvents.concat(
                    normalizeEventData((foulsResponse.value as { data: unknown[] }).data, 'foul', sport),
                );
            } else if (foulsResponse.status === 'rejected') {
                // console.error('Erro ao buscar fouls:', foulsResponse.reason);
            }

            if (cardsData.status === 'fulfilled' && cardsData.value.cards) {
                allEvents = allEvents.concat(
                    normalizeEventData(cardsData.value.cards, 'card', sport),
                );
            } else if (cardsData.status === 'rejected') {
                // console.error('Erro ao buscar cards:', cardsData.reason);
            }

            if (timeoutEventsData.status === 'fulfilled' && timeoutEventsData.value.events) {
                allEvents = allEvents.concat(
                    normalizeEventData(timeoutEventsData.value.events, 'timeout', sport),
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

    const handleDelete = async (event: Event) => {
        if (window.confirm(`Tem certeza que deseja excluir este evento: ${event.description}?`)) {
            try {
                let endpointType: EndpointType;
                let action: ActionType;
                const params: {
                    placardId?: string,
                    sport?: Sport,
                    eventId: string | number,
                    team?: string
                } = { placardId, sport, eventId: event.id }; // Broken into multiple lines

                switch (event.type) {
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
                        action = 'remove'; // As per previous discussion, ensure this matches backend
                        break;
                    case 'timeout':
                        endpointType = 'timeout';
                        action = 'delete';
                        // params.team = event.team; // Example if necessary
                        break;
                    case 'substitution':
                        // console.warn('A lógica de exclusão para \'substitution\' não está implementada no backend.');
                        alert('A exclusão de substituições ainda não é suportada.');
                        return;
                    default: {
                        const exhaustiveCheck: never = event.type;
                        // console.error(`Tipo de evento desconhecido para exclusão: ${exhaustiveCheck}`);
                        alert(`Não é possível excluir o tipo de evento: ${exhaustiveCheck}`);
                        return;
                    }
                }

                // console.log(`A tentar excluir evento: type=${endpointType}, action=${action}, params=`, params);
                await apiManager.makeRequest(endpointType, action, params, 'POST');

                setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));
                alert('Evento excluído com sucesso!');

            } catch (err) {
                // console.error('Erro ao excluir evento:', err);
                let errorMessage = 'Falha ao excluir o evento.';
                if (err instanceof Error) {
                    errorMessage += ` Detalhes: ${err.message}`;
                } else if (typeof err === 'object' && err !== null && 'message' in err) {
                    errorMessage += ` Detalhes: ${(err as { message: string }).message}`;
                }
                alert(errorMessage);
            }
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
                                onClick={() => handleDelete(event)}
                                className="action-button delete-button"
                                aria-label="Excluir evento"
                            >
                                🗑️
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EventHistory;
