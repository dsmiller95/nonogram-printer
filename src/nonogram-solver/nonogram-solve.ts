import { NonogramKey, SolvedNonogram, NonogramCell } from './models/nonogram-parameter';
import { NonogramGrid } from './models/nonogram-grid';

export function solveNonogram(nonogramKey: NonogramKey): SolvedNonogram {
    let workingGrid = new NonogramGrid(nonogramKey.firstDimensionNumbers.length, nonogramKey.secondDimensionNumbers.length);

    const result = furtherSolveNonogramWithoutGuessing(nonogramKey, workingGrid) as NonogramGrid;

    return {solutions: [{
        solution: result,
        numberOfGuesses: 0
    }]};
}

/**
 * If the passed in grid does not create a rule contradiction, returns a further solved grid
 * If when trying to solve the nonogram a contradiction occurs, returns undefined
 * @param nonogramKey the key off of which to solve the nonogram
 * @param workingGrid The current grid the algorithm should try to solve from
 */
export function furtherSolveNonogramWithoutGuessing(nonogramKey: NonogramKey, workingGrid: NonogramGrid): NonogramGrid | undefined{
    let lastGridHash = '';
    while(lastGridHash != (lastGridHash = workingGrid.getGridHash()) ) {
        let result = solveByEachDimension(workingGrid, nonogramKey);
        if(result === undefined) return undefined;
        workingGrid = result;
    }
    return workingGrid;
}

function solveByEachDimension(workingGrid: NonogramGrid, key: NonogramKey): NonogramGrid | undefined{
    let result = furtherSolveByDimension(workingGrid, 0, key.firstDimensionNumbers);
    if(result === undefined) return undefined;
    result = furtherSolveByDimension(result, 1, key.secondDimensionNumbers);
    if(result === undefined) return undefined;
    return result;
}

function furtherSolveByDimension(workingGrid: NonogramGrid, dimension: number, numbersOnDimension: number[][]): NonogramGrid | undefined {
    const resultGrid = workingGrid.clone();
    for (let indexInDimension = 0; indexInDimension < resultGrid.getDimensionSize(dimension); indexInDimension++) {
        const furtherSolvedSlice = attemptToFurtherSolveSlice(
            resultGrid.getSliceAcrossArray(dimension, indexInDimension),
            numbersOnDimension[indexInDimension]);
        if(furtherSolvedSlice === undefined){
            return undefined;
        }
        resultGrid.applySliceAcrossArray(dimension, indexInDimension, furtherSolvedSlice);
    }
    return resultGrid;
}


export function checkSliceValidity(slice: NonogramCell[], numbersOnSlice: number[]): boolean {
    const possiblePermutations = generateAllPossibleSlicePermutations(slice, numbersOnSlice);
    let firstPermutation = possiblePermutations.next();
    return !firstPermutation.done;
}

/**
 * Function which will take a given slice and solve it further based on the number keys
 *  returns undefined if it is impossible to fit the numbers into the given slice
 * @param slice a full row or column
 * @param sliceNumbers the list of numbers for this slice
 */
export function attemptToFurtherSolveSlice(slice: NonogramCell[], sliceNumbers: number[]): NonogramCell[] | undefined {
    if(!slice.some(cell => cell !== NonogramCell.UNKNOWN)){
        return solveEmptySlice(slice.length, sliceNumbers);
    }
    if(sliceNumbers.length <= 0){
        return slice.map(() => NonogramCell.UNSET);
    }

    const possiblePermutations = Array.from(generateAllPossibleSlicePermutations(slice, sliceNumbers));
    if(possiblePermutations.length <= 0){
        return undefined;
    }
    const reducedResult = reduceMultiplePermutations(possiblePermutations);
    return reducedResult;
}

/**
 * Reduce a collection of permutations into their commonalities. If only cell in all of the permutations
 *  is always the same value, it will be set to that value in the output. If the cell is not always exactly the same value,
 *  it will be set to Unknown
 * @param slicePermutations a list of concrete slice solutions. Any cells marked as Unknown in any permutation will come out as Unknown
 */
export function reduceMultiplePermutations(slicePermutations: NonogramCell[][]): NonogramCell[]{
    const resultSlice = new Array(slicePermutations[0].length).fill(undefined);
    return resultSlice.map((cell, index) => {
        let cellValue = slicePermutations[0][index];
        for(let permutation = 1; permutation < slicePermutations.length; permutation++){
            const currentCell = slicePermutations[permutation][index];
            if(currentCell !== cellValue){
                return NonogramCell.UNKNOWN;
            }
        }
        return cellValue;
    });
}

/**
 * Utility function to shortcut to a best-guess solution of a completely empty row
 * @param sliceLength length of the empty slice
 * @param sliceNumbers The number key for the slice
 */
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
    sliceNumbers: number[]): Generator<NonogramCell[], undefined, never>
{
    const resultGen = slicePermutationGenerator(currentSlice, sliceNumbers);
    for(let result = resultGen.next(); !result.done; result = resultGen.next()){
        yield result.value;
    }
    return;
}

function isSliceCompatibleWithBase(
    baseSlice: NonogramCell[],
    newSlice: NonogramCell[],
    baseSliceStart: number = 0,
    baseSliceEnd: number = baseSliceStart + newSlice.length): boolean
{
    if(newSlice.length !== baseSliceEnd - baseSliceStart){
        throw "ERROR: cannot compare a new slice to a base slice sector of different size"
    }
    return !newSlice.some((newCell, index) =>
        baseSlice[index + baseSliceStart] !== NonogramCell.UNKNOWN &&
        baseSlice[index + baseSliceStart] !== newCell);
}

export function* slicePermutationGenerator(
    currentSlice: NonogramCell[],
    sliceNumbers: number[],
    sliceStartIndex: number = 0,
    sliceEnd: number = currentSlice.length): Generator<NonogramCell[], undefined, never> {

    const currentSpaceLength = sliceEnd - sliceStartIndex;
    if(sliceNumbers.length === 0){
        const result = new Array(currentSpaceLength).fill(NonogramCell.UNSET);
        if(isSliceCompatibleWithBase(currentSlice, result,
            sliceStartIndex)){
            yield result;
        }
        return;
    }
    const minimumSpanningSpace = getMinimumSpaceForNumbers(sliceNumbers);
    if(minimumSpanningSpace > currentSpaceLength) {
        return;
    }
    for(let indexInWiggleRoom = 0; indexInWiggleRoom <= currentSpaceLength - minimumSpanningSpace; indexInWiggleRoom++){
        if(indexInWiggleRoom + sliceStartIndex + sliceNumbers[0] === sliceEnd){
            //there's exactly enough space to fit just this one number at the end
            const result = new Array(indexInWiggleRoom + sliceNumbers[0])
                .fill(NonogramCell.UNSET)
                .fill(NonogramCell.SET, indexInWiggleRoom, indexInWiggleRoom + sliceNumbers[0]);
            if(isSliceCompatibleWithBase(currentSlice, result,
                sliceStartIndex)){
                yield result;
            }
            continue;
        }
        let prefix: NonogramCell[] = new Array(indexInWiggleRoom + sliceNumbers[0] + 1).fill(NonogramCell.UNSET);
        prefix = prefix.fill(NonogramCell.SET, indexInWiggleRoom, indexInWiggleRoom + sliceNumbers[0]);
        if(!isSliceCompatibleWithBase(currentSlice, prefix,
            sliceStartIndex)){
            continue;
        }

        const subSlicesStartIndex = indexInWiggleRoom + sliceNumbers[0] + 1 + sliceStartIndex;
        let subSlices = Array.from(slicePermutationGenerator(
            currentSlice,
            sliceNumbers.slice(1, sliceNumbers.length),
            subSlicesStartIndex))
        
        if(subSlices.length === 0){
            continue;
        }
        for (const currentSubSlice of subSlices) {
            yield [...prefix, ...currentSubSlice];
        }
    }
    return;
}

function getMinimumSpaceForNumbers(sliceNumbers: number[]): number{
    return sliceNumbers.reduce((sum, num) => sum + num, 0) + sliceNumbers.length - 1;
}