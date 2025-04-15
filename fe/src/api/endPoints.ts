/**
 * This file contains the API endpoints for the application.
 */

const ENDPOINTS = {
    TIMER: () => '/timer/timer',
    ADD_POINT: () => '/score/updateScore?action=add',
    REMOVE_POINT: () => '/score/updateScore?action=remove',
    START_TIMER: () => '/timer/timer?action=start',
    STOP_TIMER: () => '/timer/timer?action=pause',
    GET_TIMER: () => '/timer/timer?action=status',
    RESET_TIMER: () => '/timer/timer?action=reset',
};

export default ENDPOINTS;
export const UPDATE_SCORE_URL = 'http://localhost:8000/api/score/updatescore.php'; // ou conforme teu path real
