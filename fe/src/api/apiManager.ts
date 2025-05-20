import config from '../config/config';
import { TeamTag } from '../utils/scorersTableUtils';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * Defines the possible timer actions that can be sent to the API
 */

type ActionType =
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
    | 'noPeriodBox';

type EndpointType = 'timer' | 'timeout' | 'api' | 'cards' | 'score' | 'substitution' | 'sports' | 'foul';

type EndpointKeyType = keyof typeof ENDPOINTS;


export interface PeriodScore {
    period: number;
    homePoints: number;
    awayPoints: number;
    totalPoints: number;
    winner: string;
}

export interface ScoreResponse {
    totalPeriods: number;
    currentPeriod: number;
    currentScore: {
        homeScore: number;
        awayScore: number;
    };
    periods: PeriodScore[];
    currentServer: TeamTag | null;
}

export interface ScoreEvent {
    eventId: number;
    placardId: string;
    team: TeamTag | null;
    playerId: string;
    period: number;
    pointValue: number;
    periodTotalPoints: number;
}

export interface ScoreHistoryResponse {
  points: ScoreEvent[];
}

interface RequestParams {
    placardId?: string;
    sport?: string;
    [key: string]: string | number | undefined;
}

interface ApiParams {
    action: 'login' | 'getMatchesColab' | 'getMatchLiveInfo' | 'getTeamLive' | 'getTeamPlayers';
    username?: string;
    password?: string;
    cookie?: string;
    placardId?: string;
    teamId?: string;
    [key: string]: string | undefined;
}

interface UpdateCardParams {
    placardId: string;
    sport: string;
    eventId: string;
    playerId?: string;
    cardType?: string;
    timestamp?: number;
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
    team?: TeamTag;
    remaining_time?: number;
    timer?: {
        status: 'running' | 'paused' | 'inactive';
        team: TeamTag;
        remaining_time: number;
    };
    homeTimeoutsUsed?: number;
    awayTimeoutsUsed?: number;
    totalTimeoutsPerTeam?: number;
    event?: {
        eventId: number;
        placardId: string;
        team: TeamTag | null;
        homeTimeoutsUsed: number;
        awayTimeoutsUsed: number;
        totalTimeoutsPerTeam: number;
    };
    events?: Array<{
        eventId: string;
        placardId: string;
        team: TeamTag | null;
        homeTimeoutsUsed: string;
        awayTimeoutsUsed: string;
        totalTimeoutsPerTeam: string;
    }>;
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

interface SportsResponse {
    sports?: string[];
}

/**
 * Interface for the response from the substitution API
 * @property {string} [message] - Optional message from the API
 * @property {number} substitutionId - The unique identifier for the substitution
 * @property {Map<string, boolean>} ingamePlayers - Map of players currently in the game
 * @property {Substitution[]} substitutions - Array of substitutions made
 * @property {string} [error] - Optional error message from the API
 */
interface SubstitutionResponse{
    message?: string;
    substitutionId?: string;
    substitutions?: Array<{
        substitutionId: string,
        team: string,
        playerInId: string,
        playerOutId: string,
        timestamp: string,
    }>;
    error?: string;
}

interface CreatedFoulDetails {
    eventId: string;
    placardId: string;
    sport: string;
    playerId: string;
    team: string;
    timestamp: number;
    period: number;
    accumulatedFoulsThisPeriod: number;
    penalty: boolean;
    penaltyFouls?: number;
    penaltyThreshold?: number;
    penaltyTypeConfigured?: string | null;
}

interface CreateFoulResponse {
    status: 'success';
    message: string;
    foul: CreatedFoulDetails;
}

interface GameFoulStatusResponse {
    status: 'success';
    message: string;
    data: {
        placardId: string;
        sport: string;
        currentGamePeriod: number;
        currentPeriodFouls: {
            home: number;
            away: number;
        };
        foulsPenaltyThreshold: number | null;
    };
}

/**
 * API Manager that handles all API requests
 */
class ApiManager {

    /**
     * Generic request method that can be used for any endpoint     *
     */
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let errorPayload: any = { error: `API error: ${response.status} - ${response.statusText}` };
            try {
                const responseData = await response.json();
                if (responseData && typeof responseData === 'object') {
                    errorPayload = responseData; // Use backend's error structure
                }
            } catch (e) {
                console.error('Failed to parse error response JSON:', e);
            }

            const error = new Error(errorPayload.error || `API error: ${response.status}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).response = {
                data: errorPayload,
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                config: options,
            };
            throw error;
        }

        return response.json();
    };

    ApiRequest = (params: ApiParams, method: 'GET' | 'POST' = 'POST') => {
        const url = `${BASE_URL}${ENDPOINTS.API()}`;

        if (method === 'GET') {
            // Convert params to URL query parameters
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            return fetch(`${url}?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            });
        } else {
            // Use POST method with JSON body
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            });
        }
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

    startTimeout = (placardId: string, sport: string, team: TeamTag) =>
        this.makeRequest<TimeoutResponse>('timeout', 'start', { placardId, sport, team });

    pauseTimeout = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'pause', { placardId, sport });

    getTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'status', { placardId, sport }, 'GET');

    adjustTimeout = (placardId: string, sport: string, team: TeamTag, amount: number) =>
        this.makeRequest<TimeoutResponse>('timeout', 'adjust', { placardId, sport, team, amount });

    getTimeoutEvents = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'get', { placardId, sport }, 'GET');

    getGameTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'gameStatus', { placardId, sport }, 'GET');

    resetTimeouts = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'reset', { placardId, sport });

    login = (username: string, password: string) =>
        this.ApiRequest({ action: 'login', username: username, password: password });

    getTeamPlayers = () =>
        this.ApiRequest({ action: 'getTeamPlayers' }, 'GET');

    getScores = (placardId: string, sport: string) =>
        this.makeRequest<ScoreResponse>('score', 'gameStatus', { placardId, sport }, 'GET');

    getScoreHistory = (placardId: string, sport: string) =>
        this.makeRequest<ScoreHistoryResponse>('score', 'get', { placardId, sport }, 'GET');

    createScoreEvent = (placardId: string, sport: string, team: TeamTag, playerId: string, pointValue: number) =>
        this.makeRequest<ScoreResponse>('score', 'create', { placardId, sport, team, playerId, pointValue });

    getCards = (placardId: string, sport: string): Promise<CardsResponse> =>
        this.makeRequest<CardsResponse>('cards', 'get', { placardId, sport }, 'GET');

    // Substitution-specific methods
    getSubstitutionStatus = (placardId: string, sport: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'get', { placardId, sport }, 'GET');

    createSubstitution = (placardId: string, sport: string, team: string,
        playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'create', { placardId, sport, team, playerIn, playerOut });

    updateSubstitution = (placardId: string, sport: string, team: string,
        substitutionId: string, playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'update', { placardId, sport, team,
            substitutionId, playerIn, playerOut });

    deleteSubstitution = (placardId: string, sport: string, team: string, substitutionId: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'delete', { placardId, sport, team, substitutionId });


    createCard = (placardId: string, sport: string, playerId: string, cardType: string, team: string) =>
        this.makeRequest<CardsResponse>('cards', 'create', { placardId, sport, playerId, cardType, team });

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

        return this.makeRequest<CardsResponse>('cards', 'update', filteredParams);
    };

    getNonTimerSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noTimer', { }, 'GET');

    getNoPeriodSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noPeriodBox', { }, 'GET');

    createFoul = (placardId: string, sport: string, playerId: string, team: string) =>
        this.makeRequest<CreateFoulResponse>('foul', 'create', { placardId, sport, playerId, team });

    getSimpleGameFoulStatus = (placardId: string, sport: string): Promise<GameFoulStatusResponse> => {
        const params: RequestParams = { placardId, sport };
        return this.makeRequest<GameFoulStatusResponse>(
            'foul',
            'gameStatus',
            params,
            'GET'
        );
    };

}

const apiManager = new ApiManager();
export default apiManager;
