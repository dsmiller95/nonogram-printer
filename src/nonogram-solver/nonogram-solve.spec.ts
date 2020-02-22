import { solveNonogram, attemptToFurtherSolveSlice, generateAllPossibleSlicePermutations, slicePermutationGenerator, reduceMultiplePermutations } from './nonogram-solve';
import { NonogramCell } from './models/nonogram-parameter';

/**
 * X : set
 * O : unset
 *   : unknown
 * @param rowString a string to transform into a row of nonogram cells
 */
const charMap = {
    X: NonogramCell.SET,
    O: NonogramCell.UNSET,
    '-': NonogramCell.UNKNOWN
}
export function rowFromString(rowString: string): NonogramCell[]{
    return Array.from(rowString)
    .filter(char => ['X', 'O', '-'].includes(char))
    .map(char => charMap[char]);
}
export function gridFromString(gridString: string): NonogramCell[][]{
    return gridString
        .split('\n')
        .map(string => rowFromString(string))
        .filter(cells => cells.length > 0);
}

describe('nonogram solver', () => {
    describe('when solving a whole grid', () => {
        it('solves an empty case', () => {
            const result = solveNonogram({
                firstDimensionNumbers: [],
                secondDimensionNumbers: []
            });
            expect(result.gridData.length).toBe(0);
        });

        it('solves a single unset cell', () => {
            const result = solveNonogram({
                firstDimensionNumbers: [[]],
                secondDimensionNumbers: [[]]
            });
            expect(result.gridData.length).toBe(1);
            expect(result.gridData[0].length).toBe(1);
            expect(result.gridData[0][0]).toBe(NonogramCell.UNSET);
        });

        it('solves a single set cell', () => {
            const result = solveNonogram({
                firstDimensionNumbers: [[1]],
                secondDimensionNumbers: [[1]]
            });
            expect(result.gridData.length).toBe(1);
            expect(result.gridData[0].length).toBe(1);
            expect(result.gridData[0][0]).toBe(NonogramCell.SET);
        });

        it('solves a trivial nonogram which only requires on dimension of numbers', () => {
            const result = solveNonogram({
                firstDimensionNumbers: [[3], [1, 1], [3]],
                secondDimensionNumbers: [[3], [1, 1], [3]]
            });
            expect(result.gridData.length).toBe(3);
            expect(result.gridData[0].length).toBe(3);
            expect(result.gridData).toEqual([
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1],
            ]);
        });

        it('solves a trivial nonogram which requires both number dimensions', () => {
            const result = solveNonogram({
                firstDimensionNumbers: [[1], [1], [3]],
                secondDimensionNumbers: [[3], [1], [1]]
            });
            expect(result.gridData.length).toBe(3);
            expect(result.gridData[0].length).toBe(3);
            expect(result.gridData).toEqual([
                [1, 0, 0],
                [1, 0, 0],
                [1, 1, 1],
            ]);
        });
    });

    describe('when solving a single empty row', () => {
        it('should partially solve single number in larger row', () => {
            const result = attemptToFurtherSolveSlice(Array(5).fill(NonogramCell.UNKNOWN), [4]);
            expect(result).toEqual([
                NonogramCell.UNKNOWN, 
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.UNKNOWN]);
        });
        it('should completely solve single number in same-size row', () => {
            const result = attemptToFurtherSolveSlice(Array(3).fill(NonogramCell.UNKNOWN), [3]);
            expect(result).toEqual([
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.SET]);
        });
        it('should completely solve double number in just-sized row', () => {
            const result = attemptToFurtherSolveSlice(Array(5).fill(NonogramCell.UNKNOWN), [2, 2]);
            expect(result).toEqual([
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.UNSET,
                NonogramCell.SET,
                NonogramCell.SET]);
        });
        it('should partially solve multiple numbers in larger row', () => {
            const result = attemptToFurtherSolveSlice(
                Array(16).fill(NonogramCell.UNKNOWN),
                [1, 3, 5, 2]);
            expect(result).toEqual([
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.SET,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.SET,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN]);
        });
        it('should leave empty multiple numbers in much larger row', () => {
            const result = attemptToFurtherSolveSlice(
                Array(16).fill(NonogramCell.UNKNOWN),
                [1, 3, 2]);
            expect(result).toEqual([
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN,
                NonogramCell.UNKNOWN]);
        });
    });

    describe('when generating all possible row permutations', () => {
        it('should generate one permutation for a completely full row', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('------'),
                [6]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(1);
            expect(arrayResult[0]).toEqual(rowFromString('XXXXXX'));
        });
        it('should generate one permutation for a completely full row with two numbers', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('------'),
                [2, 3]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(1);
            expect(arrayResult[0]).toEqual(rowFromString('XXOXXX'));
        });
        it('should generate two permutations for an almost full row', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('------'),
                [5]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(2);
            expect(arrayResult[0]).toEqual(rowFromString('XXXXXO'));
            expect(arrayResult[1]).toEqual(rowFromString('OXXXXX'));
        });
        it('should generate many permutations for one item in a mostly empty row', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('----'),
                [1]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(4);
            expect(arrayResult).toEqual(gridFromString(
    `
    XOOO
    OXOO
    OOXO
    OOOX
    `));
        });
        it('should generate many permutations for a mostly empty row', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('----------'),
                [2, 1, 3]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(10);
            expect(arrayResult).toEqual(gridFromString(
    `
    XXOXOXXXOO
    XXOXOOXXXO
    XXOXOOOXXX
    XXOOXOXXXO
    XXOOXOOXXX
    XXOOOXOXXX
    OXXOXOXXXO
    OXXOXOOXXX
    OXXOOXOXXX
    OOXXOXOXXX
    `));
        });
        it('should generate permutations based on what is already in the row', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('--O----X--'),
                [2, 1, 3]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(6);
            expect(arrayResult).toEqual(gridFromString(
    `
    XXOXOXXXOO
    XXOXOOXXXO
    XXOXOOOXXX
    XXOOXOXXXO
    XXOOXOOXXX
    XXOOOXOXXX
    `));
        });
        it('should generate permutations based on what is already in the row without using the utility entry function', () => {
            const iterResult = slicePermutationGenerator(
                rowFromString('--------O-'),
                [2, 1, 3]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(1);
            expect(arrayResult).toEqual(gridFromString(
    `
    XXOXOXXXOO
    `));
        });
    });

    describe('when reducing a list of possibilities to their common elements', () => {
        it('should reduce a single permutation to the same thing', () => {
            const result = reduceMultiplePermutations([rowFromString('OXXXO')]);
            expect(result).toEqual(rowFromString('OXXXO'));
        });
        it('should reduce three permutations to the commonalities', () => {
            const result = reduceMultiplePermutations(gridFromString(
                `
                XXXOO
                OXXXO
                OOXXX
                `));
            expect(result).toEqual(rowFromString('--X--'));
        });
        it('should reduce a cell with an unknown value to unknown', () => {
            const result = reduceMultiplePermutations(gridFromString(
                `
                XX-O
                OXXX
                `));
            expect(result).toEqual(rowFromString('-X--'));
        });
    });

    describe('when further solving a single partially-filled row', () => {
        it('should completely solve the row when possible based on already set cells', () => {
            const result = attemptToFurtherSolveSlice(
                rowFromString('-O---'),
                [3]);
            expect(result).toEqual(rowFromString('OOXXX'));
        });
        it('should solve more of a row that is partially solved', () => {
            const result = attemptToFurtherSolveSlice(
                rowFromString('-O----'),
                [3]);
            expect(result).toEqual(rowFromString('OO-XX-'));
        });
        it('should solve more of a complex row that is partially solved', () => {
            const result = attemptToFurtherSolveSlice(
                rowFromString('----O-----------'),
                [3, 5, 1]);
            expect(result).toEqual(rowFromString('----O----X------'));
        });
    });
});