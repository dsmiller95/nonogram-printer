import { NonogramKey, SolvedNonogram, NonogramSolution, PartialNonogramSolution, NonogramAction, EvaluateRowAction, GuessAction, RewindAction } from '../models/nonogram-parameter';
import { NonogramGrid } from '../models/nonogram-grid';
import { NonogramCell } from '../models/nonogram-cell';

export function* solveNonogram(nonogramKey: NonogramKey): Generator<PartialNonogramSolution, SolvedNonogram, undefined> {
    let workingGrid = new NonogramGrid(nonogramKey.firstDimensionNumbers.length, nonogramKey.secondDimensionNumbers.length);

    yield {
        lastAction: {
            type: NonogramAction.REWIND,
            reason: 'this is the first grid'} as RewindAction,
        partialSolution: workingGrid
    }

    const firstSolve = yield* furtherSolveNonogramWithoutGuessing(nonogramKey, workingGrid);
    if(firstSolve === undefined){
        return {solutions: []};
    }

    const results = yield* solveNonogramWithGuesses(nonogramKey, firstSolve, 0);
    return {solutions: results};
}

function* solveNonogramWithGuesses(nonogramKey: NonogramKey, inputGrid: NonogramGrid, previousGuesses: number): Generator<PartialNonogramSolution, NonogramSolution[], undefined> {
    if(inputGrid.isSolved){
        return [{
            numberOfGuesses: previousGuesses,
            solution: inputGrid
        }];
    }
    let allSolutions: NonogramSolution[] = [];
    for(let first = 0; first < inputGrid.getDimensionSize(0); first++){
        for(let second = 0; second < inputGrid.getDimensionSize(1); second++){
            if(inputGrid.getCell(first, second) === NonogramCell.UNKNOWN){
                let newSolutions = yield* attemptToSolveWithGuess(nonogramKey, inputGrid, previousGuesses, first, second, NonogramCell.SET);
                allSolutions = allSolutions.concat(newSolutions);
                yield {
                    lastAction: {
                        type: NonogramAction.REWIND,
                        reason: allSolutions.length > 0 ? 'there could be more solutions' : 'no solutions were found with the last guess'
                    } as RewindAction,
                    partialSolution: inputGrid
                }
                newSolutions = yield* attemptToSolveWithGuess(nonogramKey, inputGrid, previousGuesses, first, second, NonogramCell.UNSET);
                allSolutions = allSolutions.concat(newSolutions);
                
                return allSolutions;
            }
        }
    }
    return allSolutions;
}

function* attemptToSolveWithGuess(nonogramKey: NonogramKey, inputGrid: NonogramGrid, previousGuesses: number, first: number, second: number, guessState: NonogramCell): Generator<PartialNonogramSolution, NonogramSolution[], undefined>{
    let newGrid = inputGrid.clone();
    newGrid.setCell(first, second, guessState);
    yield {
        lastAction: {
            type: NonogramAction.GUESS,
            firstDimensionIndex: first,
            secondDimensionIndex: second,
            guess: guessState
        } as GuessAction,
        partialSolution: newGrid
    }
    let solvedAttempt = yield* furtherSolveNonogramWithoutGuessing(nonogramKey, newGrid);
    if(solvedAttempt !== undefined) {
        return yield* solveNonogramWithGuesses(nonogramKey, solvedAttempt, previousGuesses + 1);
    }
    return [];
}


/**
 * If the passed in grid does not create a rule contradiction, returns a further solved grid
 * If when trying to solve the nonogram a contradiction occurs, returns undefined
 * @param nonogramKey the key off of which to solve the nonogram
 * @param workingGrid The current grid the algorithm should try to solve from
 */
export function* furtherSolveNonogramWithoutGuessing(nonogramKey: NonogramKey, workingGrid: NonogramGrid): Generator<PartialNonogramSolution, NonogramGrid | undefined, undefined> {
    let lastGridHash = '';
    while(lastGridHash != (lastGridHash = workingGrid.getGridHash()) ) {
        let result = yield* solveByEachDimension(workingGrid, nonogramKey);
        if(result === undefined) return undefined;
        workingGrid = result;
    }
    return workingGrid;
}

function* solveByEachDimension(workingGrid: NonogramGrid, key: NonogramKey): Generator<PartialNonogramSolution, NonogramGrid | undefined, undefined> {
    let result = yield* furtherSolveByDimension(workingGrid, 0, key.firstDimensionNumbers);
    if(result === undefined) return undefined;
    result = yield* furtherSolveByDimension(result, 1, key.secondDimensionNumbers);
    return result;
}

function* furtherSolveByDimension(workingGrid: NonogramGrid, dimension: number, numbersOnDimension: number[][]):  Generator<PartialNonogramSolution, NonogramGrid | undefined, undefined> {
    const resultGrid = workingGrid.clone();
    for (let indexInDimension = 0; indexInDimension < resultGrid.getDimensionSize(dimension); indexInDimension++) {
        const previousSlice = resultGrid.getSliceAcrossArray(dimension, indexInDimension);
        const furtherSolvedSlice = attemptToFurtherSolveSlice(
            previousSlice,
            numbersOnDimension[indexInDimension]);
        if(furtherSolvedSlice === undefined){
            return undefined;
        }
        resultGrid.applySliceAcrossArray(dimension, indexInDimension, furtherSolvedSlice);
        
        if(previousSlice.some((cell, index) => cell !== furtherSolvedSlice[index]) ){
            yield {
                lastAction: {
                    type: NonogramAction.EVALUATE_ROW,
                    index: indexInDimension,
                    dimension
                } as EvaluateRowAction,
                partialSolution: resultGrid
            } as PartialNonogramSolution;
        }
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
    sliceEnd: number = currentSlice.length): Generator<NonogramCell[], undefined, undefined> {

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