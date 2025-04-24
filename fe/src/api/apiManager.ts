import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * Defines the possible timer actions that can be sent to the API
 */
type TimerAction = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status';
type ApiAction = 'login' | 'getMatchesColab' | 'getMatchLiveInfo' | 'getTeamLive';

/**
 * Interface for timer request parameters
 * @property {string} gameId - The unique identifier for the game
 * @property {string} gameType - The type of game (e.g., 'basketball', 'futsal')
 * @property {number} [seconds] - Optional seconds to adjust the timer by (for 'adjust' action)
 * @property {number} [time] - Optional time value in seconds to set the timer to (for 'set' action)
 * @property {number} [period] - Optional period number to set (for 'set' action)
 */
interface TimerParams {
    gameId: string;
    gameType: string;
    seconds?: number;
    time?: number;
    period?: number;
}

interface ApiParams {
    action: ApiAction;
    username?: string;
    password?: string;
    matchId?: string;
    teamId?: string;
    cookie?: string;
}

/**
 * API Manager that handles all API requests
 */
class ApiManager {

    /**
     * Generic method to handle all timer-related requests
     *
     * @param {TimerAction} action - The timer action to perform
     * @param {TimerParams} params - Parameters for the timer request
     * @param {('GET'|'POST')} [method='POST'] - HTTP method to use
     * @returns {Promise<Response>} - Fetch response
     */
    timerRequest = (action: TimerAction, params: TimerParams, method: 'GET' | 'POST' = 'POST') => {
        let url = `${BASE_URL}${ENDPOINTS.TIMER()}`;
        if (method === 'GET') {
            url = `${url}?action=${action}&gameId=${params.gameId}&gameType=${params.gameType}`;
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

        return fetch(url, options);
    };

    /**
     * Starts the timer for a specific game
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    startTimer = (gameId: string, gameType: string) =>
        this.timerRequest('start', { gameId, gameType });

    /**
     * Pauses/stops the timer for a specific game
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    stopTimer = (gameId: string, gameType: string) =>
        this.timerRequest('pause', { gameId, gameType });

    /**
     * Gets the current status of the timer
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise containing timer status
     */
    getTimerStatus = (gameId: string, gameType: string) =>
        this.timerRequest('status', { gameId, gameType }, 'GET');

    /**
     * Resets the timer to its initial state
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    resetTimer = (gameId: string, gameType: string) =>
        this.timerRequest('reset', { gameId, gameType });

    /**
     * Adjusts the timer by adding or subtracting seconds
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @param {number} seconds - Number of seconds to adjust (positive to add, negative to subtract)
     * @returns {Promise<Response>} - Fetch response promise
     */
    adjustTimer = (gameId: string, gameType: string, seconds: number) =>
        this.timerRequest('adjust', { gameId, gameType, seconds });

    /**
     * Sets the timer to a specific time and period
     *
     * @param {string} gameId - The game identifier
     * @param {string} gameType - The type of game
     * @param {number} time - Time in seconds to set the timer to
     * @param {number} period - Period number to set
     * @returns {Promise<Response>} - Fetch response promise
     */
    setTimer = (gameId: string, gameType: string, time: number, period: number) =>
        this.timerRequest('set', { gameId, gameType, time, period });
    apiRequest = (apiAction: ApiAction, params: ApiParams, method: 'GET'|'POST' = 'POST') => {
        const url = `${BASE_URL}${ENDPOINTS.API()}`;
        const options: RequestInit = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiAction,
                ...params,
            }),
        };

        return fetch(url, options);
    };
    login = async (username: string, password: string) => {
        const response = await this.apiRequest('login', { action: 'login', username: username, password: password });
        // Code used to check login response
        if (response.ok) {
            const data = await response.json();
            console.log('Response:', data);
            return data;
        }
        return response;
    };
}

const apiManager = new ApiManager();
export default apiManager;
