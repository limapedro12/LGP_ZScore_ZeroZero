import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * Defines the possible timer actions that can be sent to the API
 */
type TimerAction = 'start' | 'pause' | 'reset' | 'adjust' | 'set' | 'status';

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


/**
 * Interface for score request parameters
 * @property {number} abstractTeamId - The unique identifier for the team
 * @property {number} placardId - The unique identifier for the game
 * @property {string} gameType - The type of game (e.g., 'futsal', 'volleyball')
 */

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

    /**
     * Generic method to handle all score-related requests
     *
     * @param {string} action - The score action to perform (e.g., 'add', 'remove', 'get_score')
     * @param {Record<string, string | number>} params - Parameters for the score request
     * @param {('GET'|'POST')} [method='POST'] - HTTP method to use
     * @returns {Promise<Response>} - Fetch response
     */
    scoreRequest = (action: string, params: Record<string, string | number>, method: 'GET' | 'POST' = 'POST') => {
        let url = `${BASE_URL}${ENDPOINTS.SCORE()}`;
        if (method === 'GET') {
            const queryParams = new URLSearchParams({
                action,
                ...Object.fromEntries(Object.entries(params)),
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

        return fetch(url, options);
    };

    /**
     * Adds a point to a specific team in a game
     *
     * @param {number} abstractTeamId - The team identifier
     * @param {number} placardId - The game identifier
     * @param {'futsal'|'volleyball'} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    addPoint = (abstractTeamId: number, placardId: number, gameType: 'futsal' | 'volleyball') =>
        this.scoreRequest('add', { abstractTeamId, placardId, gameType });

    /**
     * Removes a point from a specific team in a game
     *
     * @param {number} abstractTeamId - The team identifier
     * @param {number} placardId - The game identifier
     * @param {'futsal'|'volleyball'} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    removePoint = (abstractTeamId: number, placardId: number, gameType: 'futsal' | 'volleyball') =>
        this.scoreRequest('remove', { abstractTeamId, placardId, gameType });

    /**
     * Gets the current score of a game
     *
     * @param {number} placardId - The game identifier
     * @param {'futsal'|'volleyball'} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise containing the current score
     */
    getScore = (placardId: number, gameType: 'futsal' | 'volleyball') =>
        this.scoreRequest('get_score', { abstractTeamId: 0, placardId, gameType }, 'GET');

    /**
     * Adds a point event
     *
     * @param {string} placardId - The game identifier
     * @param {string} gameType - The type of game
     * @param {number} teamId - The team identifier
     * @returns {Promise<Response>} - Fetch response promise
     */
    addPointEvent = (placardId: string, gameType: string, teamId: number) =>
        this.scoreRequest('add', { placardId, gameType, teamId });

    /**
     * Removes a point event
     *
     * @param {string} placardId - The game identifier
     * @param {string} gameType - The type of game
     * @param {number} eventId - The event identifier
     * @returns {Promise<Response>} - Fetch response promise
     */
    removePointEvent = (placardId: string, gameType: string, eventId: number) =>
        this.scoreRequest('remove', { placardId, gameType, eventId });

    /**
     * Gets all point events
     *
     * @param {string} placardId - The game identifier
     * @param {string} gameType - The type of game
     * @returns {Promise<Response>} - Fetch response promise
     */
    getPointEvents = (placardId: string, gameType: string) =>
        this.scoreRequest('get', { placardId, gameType }, 'GET');
}

const apiManager = new ApiManager();
export default apiManager;
