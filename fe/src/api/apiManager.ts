import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

type ActionType = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status' | 'get';
type EndpointType = 'timer' | 'timeoutTimer' | 'timeout' | 'cards'; // Added 'cards'
type EndpointKeyType = keyof typeof ENDPOINTS;

interface RequestParams {
    placardId: string;
    gameType: string;
    [key: string]: string | number;
}

interface TimerResponse {
    message?: string;
    status: 'running' | 'paused' | 'inactive';
    remaining_time: number;
    period: number;
    total_periods: number;
    error?: string;
}

interface TimeoutTimerResponse {
    message?: string;
    status: 'running' | 'paused' | 'inactive';
    team?: string;
    remaining_time: number;
    home_timeouts_used?: number;
    away_timeouts_used?: number;
    error?: string;
}

// Complete timeouts management response interface
interface TimeoutsResponse {
    message?: string;
    home_timeouts_used?: number;
    away_timeouts_used?: number;
    total_timeouts_per_team?: number;
    timeouts_per_period?: number;
    team?: string;
    timeouts_used?: number;
    previous_value?: number;
    adjustment?: number;
    new_value?: number;
    error?: string;
}

interface CardsResponse {
    cards: Array<{
        eventId: number;
        placardId: string;
        playerId: string;
        cardType: string;
        timestamp: number;
    }>;
}

/**
 * API Manager that handles all API requests
 */
class ApiManager {
    /**
     * Generic request method that can be used for any endpoint
     */
    makeRequest = async <T>(
        endpoint: EndpointType,
        action: ActionType,
        params: RequestParams,
        method: 'GET' | 'POST' = 'POST'
    ): Promise<T> => {

        const endpointKey = endpoint.toUpperCase() as EndpointKeyType;
        let url = `${BASE_URL}${ENDPOINTS[endpointKey]()}`;

        if (method === 'GET') {
            const queryParams = new URLSearchParams({
                action,
                placardId: params.placardId,
                gameType: params.gameType,
                ...Object.fromEntries(
                    Object.entries(params).filter(([key]) => !['placardId', 'gameType'].includes(key))
                ),
            });
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

    // Timer-specific methods
    startTimer = (placardId: string, gameType: string) =>
        this.makeRequest<TimerResponse>('timer', 'start', { placardId, gameType });

    stopTimer = (placardId: string, gameType: string) =>
        this.makeRequest<TimerResponse>('timer', 'pause', { placardId, gameType });

    getTimerStatus = (placardId: string, gameType: string) =>
        this.makeRequest<TimerResponse>('timer', 'status', { placardId, gameType }, 'GET');

    resetTimer = (placardId: string, gameType: string) =>
        this.makeRequest<TimerResponse>('timer', 'reset', { placardId, gameType });

    adjustTimer = (placardId: string, gameType: string, seconds: number) =>
        this.makeRequest<TimerResponse>('timer', 'adjust', { placardId, gameType, seconds });

    setTimer = (placardId: string, gameType: string, time: number, period: number) =>
        this.makeRequest<TimerResponse>('timer', 'set', { placardId, gameType, time, period });

    // Timeout Timer-specific methods
    startTimeoutTimer = (placardId: string, gameType: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'start', { placardId, gameType, team });

    pauseTimeoutTimer = (placardId: string, gameType: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'pause', { placardId, gameType, team });

    resetTimeoutTimer = (placardId: string, gameType: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'reset', { placardId, gameType, team });

    getTimeoutTimerStatus = (placardId: string, gameType: string) =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'status', { placardId, gameType }, 'GET');

    getTimeoutsCount = (placardId: string, gameType: string) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'status', { placardId, gameType }, 'GET');

    resetTeamTimeouts = (placardId: string, gameType: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutsResponse>('timeout', 'reset', { placardId, gameType, team });

    resetAllTimeouts = (placardId: string, gameType: string) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'reset', { placardId, gameType });

    adjustTimeouts = (placardId: string, gameType: string, team: 'home' | 'away', value: number) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'adjust', { placardId, gameType, team, value });

    getCards = (placardId: string, gameType: string): Promise<CardsResponse> =>
        this.makeRequest<CardsResponse>('cards', 'get', { placardId, gameType }, 'GET');
}

const apiManager = new ApiManager();
export default apiManager;
