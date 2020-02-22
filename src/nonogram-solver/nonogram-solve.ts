import { NonogramKey, SolvedNonogram, NonogramCell } from './models/nonogram-parameter';
import { NonogramGrid } from './models/nonogram-grid';

export function solveNonogram(nonogramKey: NonogramKey): SolvedNonogram {
    const workingGrid = new NonogramGrid(nonogramKey.firstDimensionNumbers.length, nonogramKey.secondDimensionNumbers.length);

    furtherSolveByDimension(workingGrid, 0, nonogramKey.firstDimensionNumbers);
    furtherSolveByDimension(workingGrid, 1, nonogramKey.secondDimensionNumbers);

    return {gridData: workingGrid.gridData};
}

function furtherSolveByDimension(workingGrid: NonogramGrid, dimension: number, numbersOnDimension: number[][]){
    for (let indexInDimension = 0; indexInDimension < workingGrid.getDimensionSize(dimension); indexInDimension++) {
        const furtherSolvedSlice = attemptToFurtherSolveSlice(
            workingGrid.getSliceAcrossArray(dimension, indexInDimension),
            numbersOnDimension[indexInDimension]);
        workingGrid.applySliceAcrossArray(dimension, indexInDimension, furtherSolvedSlice);
    }
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

    const possiblePermutations = Array.from(generateAllPossibleSlicePermutations(slice, sliceNumbers));
    if(possiblePermutations.length <= 0){
        return slice;
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
        if(isSliceCompatibleWithBase(currentSlice, result.value)) {
            yield result.value;
        }
    }
    return;
}

function isSliceCompatibleWithBase(
    baseSlice: NonogramCell[],
    newSlice: NonogramCell[],
    baseSliceStart: number = 0,
    baseSliceEnd: number = baseSlice.length): boolean
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
    sliceEnd: number = currentSlice.length) : Generator<NonogramCell[], undefined, never> {

    const currentSpaceLength = sliceEnd - sliceStartIndex;
    if(sliceNumbers.length === 0){
        yield new Array(currentSpaceLength).fill(NonogramCell.UNSET);
        return;
    }
    const minimumSpanningSpace = getMinimumSpaceForNumbers(sliceNumbers);
    if(minimumSpanningSpace > currentSpaceLength) {
        return;
    }
    for(let i = 0; i <= currentSpaceLength - minimumSpanningSpace; i++){
        if(i + sliceStartIndex + sliceNumbers[0] === sliceEnd){
            //there's exactly enough space to fit just this one number at the end
            let result = new Array(i + sliceNumbers[0])
                .fill(NonogramCell.UNSET)
                .fill(NonogramCell.SET, i, i + sliceNumbers[0]);
            yield result;
            continue;
        }
        const subSlicesStartIndex = i + sliceNumbers[0] + 1 + sliceStartIndex;
        let subSlices = Array.from(slicePermutationGenerator(
            currentSlice,
            sliceNumbers.slice(1, sliceNumbers.length),
            subSlicesStartIndex))
            .filter(slice => isSliceCompatibleWithBase(currentSlice, slice, subSlicesStartIndex, sliceEnd));
        
        if(subSlices.length === 0){
            continue;
        }

        let prefix: NonogramCell[] = new Array(i + sliceNumbers[0] + 1).fill(NonogramCell.UNSET);
        prefix = prefix.fill(NonogramCell.SET, i, i + sliceNumbers[0]);
        for (const currentSubSlice of subSlices) {
            yield [...prefix, ...currentSubSlice];
        }
    }
    return;
}

function getMinimumSpaceForNumbers(sliceNumbers: number[]): number{
    return sliceNumbers.reduce((sum, num) => sum + num, 0) + sliceNumbers.length - 1;
}