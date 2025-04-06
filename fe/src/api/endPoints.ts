const ENDPOINTS = {
    START_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=start&gameId=${gameId}&gameType=${gameType}`,
    STOP_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=pause&gameId=${gameId}&gameType=${gameType}`,
    GET_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=status&gameId=${gameId}&gameType=${gameType}`,
    RESET_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=reset&gameId=${gameId}&gameType=${gameType}`,
    ADJUST_TIMER: (gameId: string, gameType: string, seconds: number) =>
        `/timer/timer?action=adjust&gameId=${gameId}&gameType=${gameType}&seconds=${seconds}`,
    SET_TIMER: (gameId: string, gameType: string, time: number, period: number) =>
        `/timer/timer?action=set&gameId=${gameId}&gameType=${gameType}&time=${time}&period=${period}`,
};

export default ENDPOINTS;
