import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

type ActionType = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status' | 'get' | 'gameStatus';
type EndpointType = 'timer' | 'timeout';
type EndpointKeyType = keyof typeof ENDPOINTS;
type TeamType = 'home' | 'away';

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
    events?: Array<{
        eventId: string;
        placardId: string;
        team: TeamType | null;
        homeTimeoutsUsed: string;
        awayTimeoutsUsed: string;
        totalTimeoutsPerTeam: string;
    }>;
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

    getGameStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'gameStatus', { placardId, sport }, 'GET');

    resetTimeouts = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'reset', { placardId, sport });

}

const apiManager = new ApiManager();
export default apiManager;
