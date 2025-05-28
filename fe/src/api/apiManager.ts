import config from '../config/config';
import { TeamTag } from '../utils/scorersTableUtils';
import ENDPOINTS from './endPoints';
import { toast } from 'react-toastify';


const BASE_URL = `${config.API_HOSTNAME}`;

/**
 * Defines the possible timer actions that can be sent to the API
 */
type ActionType =
    | 'start'
    | 'pause'
    | 'reset'
    | 'adjust'
    | 'set'
    | 'status'
    | 'get'
    | 'gameStatus'
    | 'create'
    | 'update'
    | 'delete'
    | 'noTimer'
    | 'getAvailPlacards'
    | 'getTeamInfo'
    | 'getPlacardInfo'
    | 'getAllowColab'
    | 'getTeamLineup'
    | 'getPlayerInfo'
    | 'updateLineup'
    | 'noCards'
    | 'noPeriodBox'
    | 'noShotClock'
    | 'typeOfScore'
    | 'sportConfig';

type EndpointType = 'timer' | 'timeout' | 'api' | 'cards' | 'score' | 'substitution' | 'sports' | 'shotclock' | 'info'| 'foul';

type EndpointKeyType = keyof typeof ENDPOINTS;


export interface PeriodScore {
    period: number;
    homePoints: number;
    awayPoints: number;
    totalPoints: number;
    winner: string;
}

export interface ScoreResponse {
    totalPeriods: number;
    currentPeriod: number;
    currentScore: {
        homeScore: number;
        awayScore: number;
    };
    periods: PeriodScore[];
    currentServer: TeamTag | null;
}

export interface ScoreEvent {
    eventId: number;
    placardId: string;
    team: TeamTag | null;
    playerId: string;
    period: number;
    pointValue: number;
    periodTotalPoints: number;
    teamPoints: number;
    timeSpan: number;
}

export interface ScoreHistoryResponse {
  points: ScoreEvent[];
}

interface RequestParams {
    placardId?: string;
    sport?: string;
    [key: string]: string | number | undefined | ApiPlayer[];
}

interface ApiParams {
    action: 'login' | 'getMatchesColab' | 'getMatchLiveInfo' | 'getTeamLive';
    username?: string;
    password?: string;
    placardId?: string;
    teamId?: string;
    [key: string]: string | undefined;
}

interface UpdateCardParams {
    placardId: string;
    sport: string;
    eventId: string;
    playerId?: string;
    cardType?: string;
    timestamp?: number;
    [key: string]: string | number | undefined;
}

interface TimerResponse {
    message?: string;
    status: 'running' | 'paused' | 'inactive';
    remaining_time: number;
    period: number;
    total_periods: number;
    error?: string;
}

interface TimeoutResponse {
    message?: string;
    status?: 'running' | 'paused' | 'inactive';
    team?: TeamTag;
    remaining_time?: number;
    timer?: {
        status: 'running' | 'paused' | 'inactive';
        team: TeamTag;
        remaining_time: number;
    };
    homeTimeoutsUsed?: number;
    awayTimeoutsUsed?: number;
    totalTimeoutsPerTeam?: number;
    event?: {
        eventId: number;
        placardId: string;
        team: TeamTag | null;
        homeTimeoutsUsed: number;
        awayTimeoutsUsed: number;
        totalTimeoutsPerTeam: number;
    };
    events?: Array<{
        eventId: string;
        placardId: string;
        team: TeamTag | null;
        homeTimeoutsUsed: string;
        awayTimeoutsUsed: string;
        totalTimeoutsPerTeam: string;
    }>;
    error?: string;
}

interface ShotClockResponse {
    message?: string;
    status: 'running' | 'paused' | 'inactive' | 'expired';
    team?: TeamTag;
    remaining_time: number;
    duration?: number;
    error?: string;
}


export interface CardsResponse {
    cards: Array<{
        eventId: number;
        placardId: string;
        playerId: string;
        cardType: string;
        team: 'home' | 'away';
        timestamp: number;
    }>;
}

interface SportsResponse {
    sports?: string[];
    typeOfScore?: string;
    sport?: string;
    config?: {
        periods?: number;
        periodDuration?: number;
        substitutionsPerTeam?: number;
        timeoutDuration?: number;
        timeoutsPerTeam?: number;
        timeoutsPerPeriod?: number;
        cards?: string[];
        points?: number | number[];
        typeOfScore?: string;
        shotClock?: number;
        periodEndScore?: number;
        pointDifference?: number;
        resetPointsEachPeriod?: boolean;
        positions?: Record<string, string>;
    };
}

export interface SliderData {
  data: {
    home: {
      lineup: ApiPlayer[];
    };
    away: {
      lineup: ApiPlayer[];
    };
  };
  hasData: {
    scores: boolean;
    players: boolean;
    cards: boolean;
  };
}

export type Sport = 'futsal' | 'volleyball' | 'basketball';


/**
 * Interface for the response from the substitution API
 * @property {string} [message] - Optional message from the API
 * @property {number} substitutionId - The unique identifier for the substitution
 * @property {Map<string, boolean>} ingamePlayers - Map of players currently in the game
 * @property {Substitution[]} substitutions - Array of substitutions made
 * @property {string} [error] - Optional error message from the API
 */
interface SubstitutionResponse{
    message?: string;
    substitutionId?: string;
    substitutions?: Array<{
        substitutionId: string,
        team: string,
        playerInId: string,
        playerOutId: string,
        timestamp: string,
    }>;
    error?: string;
}

export interface ApiGame {
    id: string;
    firstTeamId: string;
    secondTeamId: string;
    isFinished: boolean;
    sport: Sport;
    startTime: string;
}

export interface ApiTeam {
    id: string;
    logoURL: string;
    color: string;
    acronym: string;
    name: string;
    sport: string;
}

export interface ApiColab {
    allowColab: boolean;
}

export interface ApiPlayer {
    id: string;
    playerId: string;
    isStarting: string;
    name: string;
    number: string;
    position: string;
    teamId: string;
    position_acronym: string;
    newPlayer?: boolean; // Indicates if this is a newly added player
}

interface CreatedFoulDetails {
    eventId: string;
    placardId: string;
    sport: string;
    playerId: string;
    team: string;
    timestamp: number;
    period: number;
    accumulatedFoulsThisPeriod: number;
    penalty: boolean;
    penaltyFouls?: number;
    penaltyThreshold?: number;
    penaltyTypeConfigured?: string | null;
}

interface CreateFoulResponse {
    status: 'success';
    message: string;
    foul: CreatedFoulDetails;
}

interface GameFoulStatusResponse {
    status: 'success';
    message: string;
    data: {
        placardId: string;
        sport: string;
        currentGamePeriod: number;
        currentPeriodFouls: {
            home: number;
            away: number;
        };
        foulsPenaltyThreshold: number | null;
    };
}

/**
 * API Manager that handles all API requests
 */
class ApiManager {

    /**
     * Generic request method that can be used for any endpoint     *
     */
    makeRequest = async <T>(
        endpoint: EndpointType,
        action: ActionType,
        params: RequestParams = {},
        method: 'GET' | 'POST' = 'POST'
    ): Promise<T> => {

        const endpointKey = endpoint.toUpperCase() as EndpointKeyType;
        let url = `${BASE_URL}${ENDPOINTS[endpointKey]()}`;

        if (method === 'GET') {
            const queryObj: Record<string, string> = { action };

            if (params.placardId !== undefined) queryObj.placardId = params.placardId;
            if (params.sport !== undefined) queryObj.sport = params.sport;

            // Add any other params
            Object.entries(params).forEach(([key, value]) => {
                if (!['placardId', 'sport'].includes(key) && value !== undefined) {
                    queryObj[key] = String(value);
                }
            });

            const queryParams = new URLSearchParams(queryObj);
            url = `${url}?${queryParams.toString()}`;
        }

        const options: RequestInit = {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (method === 'POST') {
            options.body = JSON.stringify({
                action,
                ...params,
            });
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let errorPayload: any = { error: `API error: ${response.status} - ${response.statusText}` };
                try {
                    const responseData = await response.json();
                    if (responseData && typeof responseData === 'object') {
                        errorPayload = responseData; // Use backend's error structure
                    }
                } catch (e) {
                    // ignore JSON parse error
                }

                toast.error(errorPayload.error || `API error: ${response.status}`);
                const error = new Error(errorPayload.error || `API error: ${response.status}`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error as any).response = {
                    data: errorPayload,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    config: options,
                };
                throw error;
            }

            const data = await response.json();
            // Optionally show a success toast for certain actions
            if (['create', 'update', 'delete', 'reset', 'start', 'pause', 'adjust', 'set'].includes(action) && data?.message) {
                toast.success(data.message);
            }
            return data;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (!error?.response) {
                toast.error(error?.message || 'Network error');
            }
            throw error;
        }
    };

    ApiRequest = (params: ApiParams, method: 'GET' | 'POST' = 'POST') => {
        const url = `${BASE_URL}${ENDPOINTS.API()}`;

        if (method === 'GET') {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value);
                }
            });

            return fetch(`${url}?${queryParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            });
        } else {
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
                credentials: 'include',
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                return response.json();
            });
        }
    };

    startTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'start', { placardId, sport });

    stopTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'pause', { placardId, sport });

    getTimerStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'status', { placardId, sport }, 'GET');

    resetTimer = (placardId: string, sport: string) =>
        this.makeRequest<TimerResponse>('timer', 'reset', { placardId, sport });

    adjustTimer = (placardId: string, sport: string, seconds: number) =>
        this.makeRequest<TimerResponse>('timer', 'adjust', { placardId, sport, seconds });

    setTimer = (placardId: string, sport: string, time: number, period: number) =>
        this.makeRequest<TimerResponse>('timer', 'set', { placardId, sport, time, period });

    startShotClock = (placardId: string, sport: string, team: TeamTag) =>
        this.makeRequest<ShotClockResponse>('shotclock', 'start', { placardId, sport, team });

    pauseShotClock = (placardId: string, sport: string) =>
        this.makeRequest<ShotClockResponse>('shotclock', 'pause', { placardId, sport });

    resetShotClock = (placardId: string, sport: string, team?: TeamTag) => {
        const params: RequestParams = { placardId, sport };
        if (team) params.team = team;
        return this.makeRequest<ShotClockResponse>('shotclock', 'reset', params);
    };

    getShotClockStatus = (placardId: string, sport: string) =>
        this.makeRequest<ShotClockResponse>('shotclock', 'status', { placardId, sport }, 'GET');


    startTimeout = (placardId: string, sport: string, team: TeamTag) =>
        this.makeRequest<TimeoutResponse>('timeout', 'start', { placardId, sport, team });

    pauseTimeout = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'pause', { placardId, sport });

    getTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'status', { placardId, sport }, 'GET');

    adjustTimeout = (placardId: string, sport: string, team: TeamTag, amount: number) =>
        this.makeRequest<TimeoutResponse>('timeout', 'adjust', { placardId, sport, team, amount });

    getTimeoutEvents = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'get', { placardId, sport }, 'GET');

    getGameTimeoutStatus = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'gameStatus', { placardId, sport }, 'GET');

    resetTimeouts = (placardId: string, sport: string) =>
        this.makeRequest<TimeoutResponse>('timeout', 'reset', { placardId, sport });

    login = (username: string, password: string) =>
        this.ApiRequest({ action: 'login', username: username, password: password });

    getScores = (placardId: string, sport: string) =>
        this.makeRequest<ScoreResponse>('score', 'gameStatus', { placardId, sport }, 'GET');

    getScoreHistory = (placardId: string, sport: string) =>
        this.makeRequest<ScoreHistoryResponse>('score', 'get', { placardId, sport }, 'GET');

    createScoreEvent = (placardId: string, sport: string, team: TeamTag, playerId: string, pointValue: number) =>
        this.makeRequest<ScoreResponse>('score', 'create', { placardId, sport, team, playerId, pointValue });

    getCards = (placardId: string, sport: string): Promise<CardsResponse> =>
        this.makeRequest<CardsResponse>('cards', 'get', { placardId, sport }, 'GET');

    getSubstitutionStatus = (placardId: string, sport: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'get', { placardId, sport }, 'GET');

    createSubstitution = (placardId: string, sport: string, team: string,
        playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'create', { placardId, sport, team, playerIn, playerOut });

    updateSubstitution = (placardId: string, sport: string, team: string,
        substitutionId: string, playerIn: string, playerOut: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'update', { placardId, sport, team,
            substitutionId, playerIn, playerOut });

    deleteSubstitution = (placardId: string, sport: string, team: string, substitutionId: string) =>
        this.makeRequest<SubstitutionResponse>('substitution', 'delete', { placardId, sport, team, substitutionId });


    createCard = (placardId: string, sport: string, playerId: string, cardType: string, team: string) =>
        this.makeRequest<CardsResponse>('cards', 'create', { placardId, sport, playerId, cardType, team });

    deleteCard = (placardId: string, sport: string, eventId: string) =>
        this.makeRequest<CardsResponse>('cards', 'delete', { placardId, sport, eventId });

    getAvailPlacards = () =>
        this.makeRequest<ApiGame[]>('info', 'getAvailPlacards', {});
    getTeamInfo = (teamId: string) =>
        this.makeRequest<ApiTeam>('info', 'getTeamInfo', { teamId });
    getPlacardInfo = (placardId: string, sport: string) =>
        this.makeRequest<ApiGame>('info', 'getPlacardInfo', { placardId, sport });
    getAllowColab = (placardId: string) =>
        this.makeRequest<ApiColab>('info', 'getAllowColab', { placardId });
    getTeamLineup = (placardId: string, teamId: string) =>
        this.makeRequest<ApiPlayer>('info', 'getTeamLineup', { placardId, teamId });
    updateLineup = (placardId: string, players: ApiPlayer[]) =>
        this.makeRequest<{success: boolean, message: string}>('info', 'updateLineup', {
            placardId,
            players,
        });

    getPlayerInfo = (playerId: string) =>
        this.makeRequest<ApiPlayer>('info', 'getPlayerInfo', { playerId });

    updateCard = (params: UpdateCardParams) => {
        const filteredParams: RequestParams = {
            placardId: params.placardId,
            sport: params.sport,
            eventId: params.eventId,
        };

        if (params.playerId !== undefined) {
            filteredParams.playerId = params.playerId;
        }
        if (params.cardType !== undefined) {
            filteredParams.cardType = params.cardType;
        }
        if (params.timestamp !== undefined) {
            filteredParams.timestamp = params.timestamp;
        }

        return this.makeRequest<CardsResponse>('cards', 'update', filteredParams);
    };

    getNonTimerSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noTimer', { }, 'GET');

    getNoPeriodSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noPeriodBox', { }, 'GET');

    getNoCardSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noCards', { }, 'GET');

    getNoShotClockSports = () =>
        this.makeRequest<SportsResponse>('sports', 'noShotClock', { }, 'GET');

    setShotClock = (placardId: string, sport: string, team: TeamTag, time: number) =>
        this.makeRequest<ShotClockResponse>('shotclock', 'set', { placardId, sport, team, time });

    getSportScoreType = (sport: string) =>
        this.makeRequest<SportsResponse>('sports', 'typeOfScore', { sport }, 'GET');

    getSportConfig = (sport: string) =>
        this.makeRequest<SportsResponse>('sports', 'sportConfig', { sport }, 'GET');
    createFoul = (placardId: string, sport: string, playerId: string, team: string) =>
        this.makeRequest<CreateFoulResponse>('foul', 'create', { placardId, sport, playerId, team });

    getSimpleGameFoulStatus = (placardId: string, sport: string): Promise<GameFoulStatusResponse> => {
        const params: RequestParams = { placardId, sport };
        return this.makeRequest<GameFoulStatusResponse>(
            'foul',
            'gameStatus',
            params,
            'GET'
        );
    };

}

const apiManager = new ApiManager();
export default apiManager;
