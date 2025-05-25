import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * Defines the possible timer and also event actions that can be sent to the API
 */
export type ActionType =
    | 'start'
    | 'pause'
    | 'reset'
    | 'adjust'
    | 'set'
    | 'status'
    | 'get'
    | 'gameStatus'
    | 'create'
    | 'update'
    | 'delete'
    | 'noTimer'
    | 'add'
    | 'update'
    | 'remove'
    | 'get_accumulated'
    | 'list_game_fouls'
    | 'get_player_fouls';
export type EndpointType = 'timer' | 'timeout' | 'api' | 'cards' | 'score' | 'sports' | 'foul' | 'events';

type EndpointKeyType = keyof typeof ENDPOINTS;
type TeamType = 'home' | 'away';

interface PeriodScore {
    period: number;
    homePoints: number;
    awayPoints: number;
    totalPoints: number;
}

interface ScoreResponse {
    totalPeriods: number;
    currentScore: {
        homeScore: number;
        awayScore: number;
    };
    periods: PeriodScore[];
}

interface RequestParams {
    placardId?: string;
    sport?: string;
    [key: string]: string | number | undefined;
}

interface ApiParams {
    action: 'login' | 'getMatchesColab' | 'getMatchLiveInfo' | 'getTeamLive';
    username?: string;
    password?: string;
}

interface UpdateCardParams {
    placardId: string;
    sport: string;
    eventId: string;
    playerId?: string;
    cardType?: string;
    timestamp?: number;
    team?: 'home' | 'away'; // Add team property
    [key: string]: string | number | undefined;
}

interface TimerResponse {
    message?: string;
    status: 'running' | 'paused' | 'inactive';
    remaining_time: number;
    period: number;
    total_periods: number;
    error?: string;
}

interface TimeoutResponse {
    message?: string;
    status?: 'running' | 'paused' | 'inactive';
    team?: TeamType;
    remaining_time?: number;
    timer?: {
        status: 'running' | 'paused' | 'inactive';
        team: TeamType;
        remaining_time: number;
    };
    homeTimeoutsUsed?: number;
    awayTimeoutsUsed?: number;
    totalTimeoutsPerTeam?: number;
    event?: {
        eventId: number;
        placardId: string;
        team: TeamType | null;
        homeTimeoutsUsed: number;
        awayTimeoutsUsed: number;
        totalTimeoutsPerTeam: number;
    };
    events?: Array<ApiTimeoutEventData>; // Lista de eventos de timeout
    error?: string;
}

interface CardsResponse {
    cards: Array<{
        eventId: number;
        placardId: string;
        playerId: string;
        cardType: string;
        team: 'home' | 'away';
        timestamp: number;
    }>;
}

interface EventsResponse {
    events: Array<Record<string, string>>; // !!!!!!!!!!!!!
}
interface SportsResponse {
    sports?: string[];
}

// Novas definições de tipo para eventos brutos da API
export interface BaseApiEvent {
    eventId?: number | string; // ID do evento vindo da API
    id?: number | string;      // Alias para eventId, se usado pela API
    timestamp?: number | string; // Timestamp do evento, pode ser string ou número
    recordedAt?: string;     // Outra forma de timestamp que algumas APIs podem usar
    teamId?: string;         // ID da equipa, se aplicável
    team?: TeamType | null;  // 'home' ou 'away', se aplicável
    playerId?: string | number;// ID do jogador
    playerName?: string;     // Nome do jogador
    teamLogo?: string;       // URL do logo da equipa
    playerNumber?: string | number; // Número do jogador
    [key: string]: string;      // !!!!!!!!!!!!!!!!
}

export interface ApiScoreEventData extends BaseApiEvent {
    pointValue?: number | string; // Valor dos pontos/golos
    // Outros campos específicos de eventos de pontuação...
}

export interface ApiFoulEventData extends BaseApiEvent {
    period?: number | string; // Período em que a falta ocorreu
    // Outros campos específicos de eventos de falta...
}

// Atualize ApiCardEventData para herdar de BaseApiEvent e manter campos obrigatórios
export interface ApiCardEventData extends BaseApiEvent {
    eventId: number;
    placardId: string;
    playerId: string;
    cardType: string;
    team: TeamType;
    timestamp: number;
}

// Atualize ApiTimeoutEventData para herdar de BaseApiEvent
export interface ApiTimeoutEventData extends BaseApiEvent {
    eventId: string; // Campo obrigatório de TimeoutResponse.events
    // team já está em BaseApiEvent
    // Campos como homeTimeoutsUsed são mais para o sumário do timeout, não para o evento individual em si na normalização.
}

// Tipo de união para os itens que a função normalizeEventData irá processar
export type FetchedEventItem = ApiScoreEventData | ApiFoulEventData | ApiCardEventData | ApiTimeoutEventData;


/**
 * API Manager that handles all API requests
 */
class ApiManager {

    makeRequest = async <T>(
        endpoint: EndpointType,
        action: ActionType,
        params: RequestParams = {},
        method: 'GET' | 'POST' = 'POST'
    ): Promise<T> => {

        const endpointKey = endpoint.toUpperCase() as EndpointKeyType;
        let url = `${BASE_URL}${ENDPOINTS[endpointKey]()}`;

        if (method === 'GET') {
            const queryObj: Record<string, string> = { action };

            if (params.placardId !== undefined) queryObj.placardId = params.placardId;
            if (params.sport !== undefined) queryObj.sport = params.sport;

            // Add any other params
            Object.entries(params).forEach(([key, value]) => {
                if (!['placardId', 'sport'].includes(key) && value !== undefined) {
                    queryObj[key] = String(value);
                }
            });

            const queryParams = new URLSearchParams(queryObj);
            url = `${url}?${queryParams.toString()}`;
        }

        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (method === 'POST') {
            options.body = JSON.stringify({
                action,
                ...params,
            });
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    };

    ApiRequest = (params: ApiParams) => {
        const url = `${BASE_URL}${ENDPOINTS.API()}`;
        const options: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        };

        return fetch(url, options).then((response) => {
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        });
    };

    startTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'start', { placardId, sport });

    stopTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'pause', { placardId, sport });

    getTimerStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'status', { placardId, sport }, 'GET');

    resetTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'reset', { placardId, sport });

    adjustTimer = (placardId: string, sport: string, seconds: number) =>
        this.makeRequest<TimerResponse>('timer', 'adjust', { placardId, sport, seconds });

    setTimer = (placardId: string, sport: string, time: number, period: number) =>
        this.makeRequest<TimerResponse>('timer', 'set', { placardId, sport, time, period });

    startTimeout = (placardId: string, sport: string, team: TeamType) =>
        this.makeRequest<TimeoutResponse>('timeout', 'start', { placardId, sport, team });

    pauseTimeout = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'pause', { placardId, sport });

    getTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'status', { placardId, sport }, 'GET');

    adjustTimeout = (placardId: string, sport: string, team: TeamType, amount: number) =>
        this.makeRequest<TimeoutResponse>('timeout', 'adjust', { placardId, sport, team, amount });

    getTimeoutEvents = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'get', { placardId, sport }, 'GET');

    getGameTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'gameStatus', { placardId, sport }, 'GET');

    resetTimeouts = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'reset', { placardId, sport });

    login = (username: string, password: string) =>
        this.ApiRequest({ action: 'login', username: username, password: password });

    getScores = (placardId: string, sport: string) =>
        this.makeRequest<ScoreResponse>('score', 'gameStatus', { placardId, sport }, 'GET');

    getCards = (placardId: string, sport: string): Promise<CardsResponse> =>
        this.makeRequest<CardsResponse>('cards', 'get', { placardId, sport }, 'GET');

    createCard = (placardId: string, sport: string, playerId: string, cardType: string) =>
        this.makeRequest<CardsResponse>('cards', 'create', { placardId, sport, playerId, cardType });

    deleteCard = (placardId: string, sport: string, eventId: string) =>
        this.makeRequest<CardsResponse>('cards', 'delete', { placardId, sport, eventId });

    updateCard = (params: UpdateCardParams) => {
        const filteredParams: RequestParams = {
            placardId: params.placardId,
            sport: params.sport,
            eventId: params.eventId,
        };

        if (params.playerId !== undefined) {
            filteredParams.playerId = params.playerId;
        }
        if (params.cardType !== undefined) {
            filteredParams.cardType = params.cardType;
        }
        if (params.timestamp !== undefined) {
            filteredParams.timestamp = params.timestamp;
        }
        if (params.team !== undefined) { // Add team to filteredParams
            filteredParams.team = params.team;
        }

        return this.makeRequest<CardsResponse>('cards', 'update', filteredParams);
    };

    getNonTimerSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noTimer', { }, 'GET');

    getEvents = (placardId: string, sport: string): Promise<EventsResponse> =>
        this.makeRequest<EventsResponse>('events', 'get', { placardId, sport }, 'GET');

    getEventDetails = (placardId: string, sport: string, eventId: number) =>
        this.makeRequest<Record<string, string>>('events', 'get', { placardId, sport, eventId }, 'GET'); // !!!!!!!!!!!!
}

const apiManager = new ApiManager();
export default apiManager;
