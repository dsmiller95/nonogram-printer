import { NonogramGrid } from './nonogram-grid';
import { NonogramCell } from './nonogram-cell';
import { SolvedNonogram } from './nonogram-parameter';

export interface SolvedNonogramWithDifficulty {
    solved: SolvedNonogram;
    difficultyRating: number;
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


export class RewindAction extends NonogramActionData{
    type: NonogramAction.REWIND;
    reason: string;
}

export enum NonogramAction {
    EVALUATE_ROW,
    GUESS,
    REWIND
}

export const actionDifficultyRating = {
    [NonogramAction.EVALUATE_ROW]: 1,
    [NonogramAction.GUESS]: 10,
    [NonogramAction.REWIND]: 0,
}