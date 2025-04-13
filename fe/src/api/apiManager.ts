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

    addPoint = (abstractTeamId: number, placardId: number, gameType: 'futsal' | 'volleyball') => {
        const url = `${BASE_URL}${ENDPOINTS.ADD_POINT()}`; // deve conter ?action=add
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ abstractTeamId, placardId, gameType }),
        });
    };

    removePoint = (abstractTeamId: number, placardId: number, gameType: 'futsal' | 'volleyball') => {
        const url = `${BASE_URL}${ENDPOINTS.REMOVE_POINT()}`; // deve conter ?action=remove
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ abstractTeamId, placardId, gameType }),
        });
    };

}

// Export a singleton instance
const apiManager = new ApiManager();
export default apiManager;
