const ENDPOINTS = {
    START_TIMER: () => '/timer/timer',
    STOP_TIMER: () => '/timer/timer',
    GET_TIMER: (gameId: string, gameType: string) => `/timer/timer?action=status&gameId=${gameId}&gameType=${gameType}`,
    RESET_TIMER: () => '/timer/timer',
    ADJUST_TIMER: () => '/timer/timer',
    SET_TIMER: () => '/timer/timer',
};

export default ENDPOINTS;
