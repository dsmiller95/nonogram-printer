import { NonogramGrid } from './nonogram-grid';
export interface NonogramKey {
    firstDimensionNumbers: number[][];
    secondDimensionNumbers: number[][];
}

export interface SolvedNonogram {
    solutions: NonogramSolution[];
}

export interface NonogramSolution {
    solution: NonogramGrid;
    numberOfGuesses: number;
}

export enum NonogramCell{
    UNSET = 0,
    SET = 1,
    UNKNOWN = 2
}