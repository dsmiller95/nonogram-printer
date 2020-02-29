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

export interface PartialNonogramSolution {
    lastAction: NonogramActionData
    partialSolution: NonogramGrid;
}

export class NonogramActionData {
    type: NonogramAction;
}

export class EvaluateRowAction extends NonogramActionData{
    type: NonogramAction.EVALUATE_ROW;
    index: number;
    dimension: number;
}

export class GuessAction extends NonogramActionData{
    type: NonogramAction.GUESS;
    firstDimensionIndex: number;
    secondDimensionIndex: number;
    guess: NonogramCell;
}

export enum NonogramAction {
    EVALUATE_ROW,
    GUESS,
    REWIND
}

export enum NonogramCell {
    UNSET = 0,
    SET = 1,
    UNKNOWN = 2
}