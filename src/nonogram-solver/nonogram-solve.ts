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
    if(totalActiveSquares === 0){
        return Array(sliceLength).fill(NonogramCell.UNSET);
    }
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

export function* generateAllPossibleSlicePermutations(
    currentSlice: NonogramCell[],
    sliceNumbers: number[])
{
    const resultGen = slicePermutationGenerator(currentSlice, sliceNumbers);
    for(let result = resultGen.next(); !result.done; result = resultGen.next()){
        yield result.value;
    }
    return;
}

function* slicePermutationGenerator(
    currentSlice: NonogramCell[],
    sliceNumbers: number[],
    sliceStartIndex: number = 0,
    sliceEnd: number = currentSlice.length) : Generator<NonogramCell[], undefined, never> {

    if(sliceNumbers.length === 0){
        yield [] as NonogramCell[];
        return;
    }
    const currentSpaceLength = sliceEnd - sliceStartIndex;
    const minimumSpanningSpace = getMinimumSpaceForNumbers(sliceNumbers);
    if(minimumSpanningSpace > currentSpaceLength) {
        return;
    }
    let i = 0;
    for(; i <= currentSpaceLength - minimumSpanningSpace; i++){
        if(i + sliceStartIndex + sliceNumbers[0] === sliceEnd){
            //there's exactly enough space to fit just this one number at the end
            let result = new Array(i + sliceNumbers[0])
                .fill(NonogramCell.UNSET)
                .fill(NonogramCell.SET, i, i + sliceNumbers[0]);
            yield result;
            continue;
        }
        let subSlices = slicePermutationGenerator(
            currentSlice,
            sliceNumbers.slice(1, sliceNumbers.length),
            i + sliceNumbers[0] + 1 + sliceStartIndex);

        let currentSubSlice = subSlices.next();
        if(currentSubSlice.done){
            continue;
        }

        let prefix: NonogramCell[] = new Array(i + sliceNumbers[0] + 1).fill(NonogramCell.UNSET);
        prefix = prefix.fill(NonogramCell.SET, i, i + sliceNumbers[0]);
        while(!currentSubSlice.done) {
            yield [...prefix, ...currentSubSlice.value];
            currentSubSlice = subSlices.next();
        }
    }
    // only combo left is the number at the way end
    // yield new Array(i + sliceNumbers[0])
    //     .fill(NonogramCell.UNSET)
    //     .fill(NonogramCell.SET, sliceEndIndex - sliceNumbers[0], sliceEndIndex);
    return;
}

function getMinimumSpaceForNumbers(sliceNumbers: number[]): number{
    return sliceNumbers.reduce((sum, num) => sum + num, 0) + sliceNumbers.length - 1;
}