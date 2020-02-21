import { NonogramKey, SolvedNonogram, NonogramCell } from './models/nonogram-parameter';

export function solveNonogram(nonogramKey: NonogramKey): SolvedNonogram {
    const solvedGrid = Array(nonogramKey.firstDimensionNumbers.length).fill(undefined)
        .map(() => Array(nonogramKey.secondDimensionNumbers.length).fill(NonogramCell.UNKNOWN));

    for (let indexInFirst = 0; indexInFirst < solvedGrid.length; indexInFirst++) {
        solvedGrid[indexInFirst] = attemptToFurtherSolveSlice(solvedGrid[indexInFirst], nonogramKey.firstDimensionNumbers[indexInFirst]);
    }

    return {gridData: solvedGrid};
}

/**
 * 
 * @param slice a full row or column
 * @param sliceNumbers the list of numbers for this slice
 */
export function attemptToFurtherSolveSlice(slice: NonogramCell[], sliceNumbers: number[]): NonogramCell[] {
    if(!slice.some(cell => cell !== NonogramCell.UNKNOWN)){
        return solveEmptySlice(slice.length, sliceNumbers);
    }
    if(sliceNumbers.length <= 0){
        return slice.map(() => NonogramCell.UNSET);
    }
    for (const number of sliceNumbers) {
        if(number === slice.length){
            return slice.map(() => NonogramCell.SET);
        }
    }
    return slice;
}

function solveEmptySlice(sliceLength: number, sliceNumbers: number[]): NonogramCell[] {
    const totalActiveSquares = sliceNumbers.reduce((sum, current) => sum + current, 0);
    const placementVariance = sliceLength - (totalActiveSquares + sliceNumbers.length - 1);
    let newSlice: NonogramCell[] = Array(sliceLength).fill(NonogramCell.UNKNOWN);
    var currentIndexInSlice = 0;
    for (const number of sliceNumbers) {
        if(number > placementVariance){
            newSlice = newSlice.fill(NonogramCell.SET, currentIndexInSlice + placementVariance, currentIndexInSlice + number);
            if(placementVariance === 0 && (currentIndexInSlice + number) < sliceLength){
                newSlice[currentIndexInSlice + number] = NonogramCell.UNSET;
            }
        }
        currentIndexInSlice += number + 1;
    }
    return newSlice;
}