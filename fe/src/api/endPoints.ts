/**
 * This file contains the API endpoints for the application.
 */

const ENDPOINTS = {
    TIMER: () => '/timer/timer',
    START_TIMER: () => '/timer/timer?action=start',
    STOP_TIMER: () => '/timer/timer?action=pause',
    GET_TIMER: () => '/timer/timer?action=status',
    RESET_TIMER: () => '/timer/timer?action=reset',
    ADD_POINT: () => '/score/updateScore?action=add',
    REMOVE_POINT: () => '/score/updateScore?action=remove',
};

export default ENDPOINTS;
