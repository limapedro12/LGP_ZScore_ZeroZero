import { Types } from 'mongoose';

/**
 * Module Types
 **/
export type ObjectId = undefined | Types.ObjectId;

export type User = {
    id: number;
    name: string;
    email: string;
};

export interface AbstractTeam {
    id: number;
    name: string;
    logoURL: string;
    players: AbstractPlayer[];
    type: string;
}

export interface AbstractPlayer {
    id: number;
    name: string;
    position: string;
    number: number;
    team: AbstractTeam | null;
    type: string;
}

export interface AbstractPlacard {
    id: number;
    firstTeam: AbstractTeam | null;
    secondTeam: AbstractTeam | null;
    isFinished: boolean;
    type: string;
}

export interface VolleyballTeam extends AbstractTeam {}

export interface VolleyballPlayer extends AbstractPlayer {}

export interface VolleyballPlacard extends AbstractPlacard {
    currentSet: number;
    availableTimeOutsFirst: number;
    availableTimeOutsSecond: number;
    isTimeOut: boolean;
    setRes: { [setNumber: number]: { pointsFirst: number; pointsSecond: number } };
}

export interface FutsalTeam extends AbstractTeam {}

export interface FutsalPlayer extends AbstractPlayer {}

export interface FutsalPlacard extends AbstractPlacard {
    currentGoalsFirstTeam: number;
    currentGoalsSecondTeam: number;
    numberFoulsFirst: number;
    numberFoulsSecond: number;
    availableTimeOutsFirst: number;
    availableTimeOutsSecond: number;
    isTimeOut: boolean;
    isTimeStopped: boolean;
}
