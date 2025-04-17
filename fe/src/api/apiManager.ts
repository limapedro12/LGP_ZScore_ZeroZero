import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

type ActionType = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status';
type EndpointType = 'timer' | 'timeoutTimer' | 'timeout'; // Extendable for other endpoints
type EndpointKeyType = keyof typeof ENDPOINTS;

interface RequestParams {
    placardId: string;
    sport: string;
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


class ApiManager {

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
                sport: params.sport,
                ...Object.fromEntries(
                    Object.entries(params).filter(([key]) => !['placardId', 'sport'].includes(key))
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

    startTimeoutTimer = (placardId: string, sport: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'start', { placardId, sport, team });

    pauseTimeoutTimer = (placardId: string, sport: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'pause', { placardId, sport, team });

    resetTimeoutTimer = (placardId: string, sport: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'reset', { placardId, sport, team });

    getTimeoutTimerStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutTimerResponse>('timeoutTimer', 'status', { placardId, sport }, 'GET');

    getTimeoutsCount = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'status', { placardId, sport }, 'GET');

    resetTeamTimeouts = (placardId: string, sport: string, team: 'home' | 'away') =>
        this.makeRequest<TimeoutsResponse>('timeout', 'reset', { placardId, sport, team });

    resetAllTimeouts = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'reset', { placardId, sport });

    adjustTimeouts = (placardId: string, sport: string, team: 'home' | 'away', value: number) =>
        this.makeRequest<TimeoutsResponse>('timeout', 'adjust', { placardId, sport, team, value });
}

const apiManager = new ApiManager();
export default apiManager;
