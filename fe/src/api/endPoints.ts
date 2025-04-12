const ENDPOINTS = {
    ADD_POINT: () => '/score/updateScore?action=add',
    REMOVE_POINT: () => '/score/updateScore?action=remove',
    START_TIMER: () => '/timer/timer?action=start',
    STOP_TIMER: () => '/timer/timer?action=pause',
    GET_TIMER: () => '/timer/timer?action=status',
    RESET_TIMER: () => '/timer/timer?action=reset',
};

export default ENDPOINTS;
