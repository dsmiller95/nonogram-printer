export interface NonogramKey {
    firstDimensionNumbers: number[][];
    secondDimensionNumbers: number[][];
}

export interface SolvedNonogram {
    gridData: NonogramCell[][];
}

export enum NonogramCell{
    UNSET,
    SET,
    UNKNOWN
}