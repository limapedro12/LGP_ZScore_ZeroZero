import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;
/**
 * API Manager that handles all API requests
 */
class ApiManager {
    startTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.START_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    };

    stopTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.STOP_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    };

    getTimerStatus = () => {
        const url = `${BASE_URL}${ENDPOINTS.GET_TIMER()}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    };

    resetTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.RESET_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
    };

    updateScore = (teamId: number, points: number) => {
        const url = `${BASE_URL}${ENDPOINTS.UPDATE_SCORE}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ teamId, points }),
        });
    };
}

// Export a singleton instance
const apiManager = new ApiManager();
export default apiManager;
