const ENDPOINTS = {
    START_TIMER: (gameId: string) => `/timer/timer?action=start&gameId=${gameId}`,
    STOP_TIMER: (gameId: string) => `/timer/timer?action=pause&gameId=${gameId}`,
    GET_TIMER: (gameId: string) => `/timer/timer?action=status&gameId=${gameId}`,
    RESET_TIMER: (gameId: string) => `/timer/timer?action=reset&gameId=${gameId}`,
};

export default ENDPOINTS;
