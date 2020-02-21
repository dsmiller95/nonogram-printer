import { solveNonogram, attemptToFurtherSolveSlice } from './nonogram-solve';
import { NonogramCell } from './models/nonogram-parameter';

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
});
