import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

type ActionType = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status' | 'create' | 'delete' | 'update';
type EndpointType = 'timer' | 'substitutions'; // Extendable for other endpoints
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

type Substitution = {
    [key: string]: string;
}

/**
 * Interface for the response from the substitution API
 * @property {string} [message] - Optional message from the API
 * @property {number} substitutionId - The unique identifier for the substitution
 * @property {Map<string, boolean>} ingamePlayers - Map of players currently in the game
 * @property {string} [error] - Optional error message from the API
 */
interface SubstitutionResponse{
    message?: string;
    substitutionId?: number;
    ingamePlayers?: Map<string, boolean>;
    substitutions?: Substitution[];
    error?: string;
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

    // Substitution-specific methods
    getSubstitutionsStatus = (placardId: string, gameType: string) =>
        this.makeRequest<SubstitutionResponse>('substitutions', 'status', { placardId, gameType }, 'GET');

    createSubstitution = (placardId: string, gameType: string, teamNumber: string,
        playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitutions', 'create', { placardId, gameType, teamNumber, playerIn, playerOut });

    updateSubstitution = (placardId: string, gameType: string, teamNumber: string,
        substitutionId: string, playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitutions', 'update', { placardId, gameType, teamNumber,
            substitutionId, playerIn, playerOut });

    deleteSubstitution = (placardId: string, gameType: string, teamNumber: string, substitutionId: string) =>
        this.makeRequest<SubstitutionResponse>('substitutions', 'delete', { placardId, gameType, teamNumber, substitutionId });
}

const apiManager = new ApiManager();
export default apiManager;
