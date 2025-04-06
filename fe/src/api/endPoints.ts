const ENDPOINTS = {
    START_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=start&gameId=${gameId}&gameType=${gameType}`,
    STOP_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=pause&gameId=${gameId}&gameType=${gameType}`,
    GET_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=status&gameId=${gameId}&gameType=${gameType}`,
    RESET_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=reset&gameId=${gameId}&gameType=${gameType}`,
};

export default ENDPOINTS;
