import config from '../config/config';
import ENDPOINTS from './endPoints';

const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * API Manager that handles all API requests
 */
class ApiManager {
    startTimer = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.START_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'start',
                gameId,
                gameType,
            }),
        });
    };

    stopTimer = (gameId: string, gameType: string) => {
        const url = `${BASE_URL}${ENDPOINTS.STOP_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'pause',
                gameId,
                gameType,
            }),
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
        const url = `${BASE_URL}${ENDPOINTS.RESET_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'reset',
                gameId,
                gameType,
            }),
        });
    };

    adjustTimer = (gameId: string, gameType: string, seconds: number) => {
        const url = `${BASE_URL}${ENDPOINTS.ADJUST_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'adjust',
                gameId,
                gameType,
                seconds,
            }),
        });
    };

    setTimer = (gameId: string, gameType: string, time: number, period: number) => {
        const url = `${BASE_URL}${ENDPOINTS.SET_TIMER()}`;
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'set',
                gameId,
                gameType,
                time,
                period,
            }),
        });
    };
}

// Export a singleton instance
const apiManager = new ApiManager();
export default apiManager;
