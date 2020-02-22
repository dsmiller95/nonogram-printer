import { solveNonogram, attemptToFurtherSolveSlice, generateAllPossibleSlicePermutations } from './nonogram-solve';
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
    ' ': NonogramCell.UNKNOWN
}
function rowFromString(rowString: string){
    return Array.from(rowString).map(char => charMap[char]);
}
function gridFromString(gridString: string){
    return gridString
        .split('\n')
        .filter(str => str.length > 0)
        .map(string => rowFromString(string));
}

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

describe('when solving a single row ', () => {
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
    it('should finish solving a partially solved row', () => {
        const inputRow = [
            NonogramCell.UNKNOWN,
            NonogramCell.UNKNOWN,
            NonogramCell.SET,
        ];
        const result = attemptToFurtherSolveSlice(inputRow, [1]);
        expect(result).toEqual([
            NonogramCell.UNSET,
            NonogramCell.UNSET,
            NonogramCell.SET]);
    });
});

fdescribe('when generating all possible row permutations', () => {
    it('should generate one permutation for a completely full row', () => {
        const iterResult = generateAllPossibleSlicePermutations(
            rowFromString('      '),
            [6]
        );
        const arrayResult = Array.from(iterResult);
        expect(arrayResult.length).toBe(1);
        expect(arrayResult[0]).toEqual(rowFromString('XXXXXX'));
    });
    it('should generate one permutation for a completely full row with two numbers', () => {
        const iterResult = generateAllPossibleSlicePermutations(
            rowFromString('      '),
            [2, 3]
        );
        const arrayResult = Array.from(iterResult);
        expect(arrayResult.length).toBe(1);
        expect(arrayResult[0]).toEqual(rowFromString('XXOXXX'));
    });
    it('should generate two permutations for an almost full row', () => {
        const iterResult = generateAllPossibleSlicePermutations(
            rowFromString('      '),
            [5]
        );
        const arrayResult = Array.from(iterResult);
        expect(arrayResult.length).toBe(2);
        expect(arrayResult[0]).toEqual(rowFromString('XXXXXO'));
        expect(arrayResult[1]).toEqual(rowFromString('OXXXXX'));
    });
    it('should generate many permutations for one item in a mostly empty row', () => {
        const iterResult = generateAllPossibleSlicePermutations(
            rowFromString('    '),
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
            rowFromString('          '),
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
})