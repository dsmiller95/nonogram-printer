import { NonogramGrid } from './nonogram-grid';
import { NonogramCell } from './nonogram-cell';
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