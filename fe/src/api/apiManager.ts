import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * API Manager that handles all API requests
 */
class ApiManager {
    startTimer = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.START_TIMER(gameId, gameType)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    stopTimer = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.STOP_TIMER(gameId, gameType)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    getTimerStatus = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.GET_TIMER(gameId, gameType)}`;
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    resetTimer = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.RESET_TIMER(gameId, gameType)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    adjustTimer = (gameId: string, gameType: string, seconds: number) => {
        const url = `${BASE_URL}${ENDPOINTS.ADJUST_TIMER(gameId, gameType, seconds)}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    setTimer = (gameId: string, gameType: string, time: number, period: number) => {
        const url = `${BASE_URL}${ENDPOINTS.SET_TIMER(gameId, gameType, time, period)}`;
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
