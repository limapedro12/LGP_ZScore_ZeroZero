/**
 * This file contains the API endpoints for the application.
 */

const ENDPOINTS = {
    TIMER: () => '/timer/timer',
    TIMEOUTTIMER: () => '/timer/timeoutTimer',
    TIMEOUT: () => '/timeout/timeout',
    CARDS: () => '/events/card', // Added endpoint for cards
};

export default ENDPOINTS;
