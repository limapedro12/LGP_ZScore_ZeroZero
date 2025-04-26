/**
 * This file contains the API endpoints for the application.
 */

const ENDPOINTS = {
    TIMER: () => '/timer/timer',
    API: () => '/api/api',
    TIMEOUT: () => '/events/timeout',
    CARDS: () => '/events/card',
    SUBSTITUTION: () => '/events/substitution',
};

export default ENDPOINTS;
