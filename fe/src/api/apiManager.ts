import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * API Manager that handles all API requests
 */
class ApiManager {
    startTimer = (gameId: string) => {
        const url = `${BASE_URL}${ENDPOINTS.START_TIMER(gameId)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    stopTimer = (gameId: string) => {
        const url = `${BASE_URL}${ENDPOINTS.STOP_TIMER(gameId)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    getTimerStatus = (gameId: string) => {
        const url = `${BASE_URL}${ENDPOINTS.GET_TIMER(gameId)}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    resetTimer = (gameId: string) => {
        const url = `${BASE_URL}${ENDPOINTS.RESET_TIMER(gameId)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };
}

// Export a singleton instance
const apiManager = new ApiManager();
export default apiManager;
