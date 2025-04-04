const ENDPOINTS = {
    UPDATE_SCORE: 'http://localhost:8000/updateScore.php',
    START_TIMER: () => '/timer/timer?action=start',
    STOP_TIMER: () => '/timer/timer?action=pause',
    GET_TIMER: () => '/timer/timer?action=status',
    RESET_TIMER: () => '/timer/timer?action=reset',
};

export default ENDPOINTS;
