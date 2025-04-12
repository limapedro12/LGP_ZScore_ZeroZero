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

    addPoint = (teamId: number) => {
        const url = `${BASE_URL}${ENDPOINTS.ADD_POINT()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ teamId }),
        });
    };

    removePoint = (teamId: number) => {
        const url = `${BASE_URL}${ENDPOINTS.REMOVE_POINT()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ teamId }),
        });
    };
}

// Export a singleton instance
const apiManager = new ApiManager();
export default apiManager;
