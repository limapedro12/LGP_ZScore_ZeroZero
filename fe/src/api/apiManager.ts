import config from '../config/config';
import ENDPOINTS from './endPoints';


const BASE_URL = `${config.API_HOSTNAME}`;
/**
 * API Manager that handles all API requests
 */
class ApiManager {
    startTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.START_TIMER()}`;
        console.log(`Starting timer with URL: ${url}`);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    stopTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.STOP_TIMER()}`;
        console.log(`Stopping timer with URL: ${url}`);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    getTimerStatus = () => {
        const url = `${BASE_URL}${ENDPOINTS.GET_TIMER()}`;
        console.log(`Fetching timer status with URL: ${url}`);
        return fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    resetTimer = () => {
        const url = `${BASE_URL}${ENDPOINTS.RESET_TIMER()}`;
        console.log(`Resetting timer with URL: ${url}`);
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
