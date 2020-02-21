export interface NonogramKey {
    firstDimensionNumbers: number[][];
    secondDimensionNumbers: number[][];
}

export interface SolvedNonogram {
    gridData: NonogramCell[][];
}

export enum NonogramCell{
    UNSET = 0,
    SET = 1,
    UNKNOWN = 2
}