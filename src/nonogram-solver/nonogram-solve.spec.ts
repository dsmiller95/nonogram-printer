import { NonogramAction } from '../models/nonogram-solve-steps';
import { NonogramCell } from '../models/nonogram-cell';
import { NonogramGrid } from '../models/nonogram-grid';
import { getLastItem } from '../utilities/utilities';
import { attemptToFurtherSolveSlice, checkSliceValidity, furtherSolveNonogramWithoutGuessing, generateAllPossibleSlicePermutations, reduceMultiplePermutations, slicePermutationGenerator, solveNonogram } from './nonogram-solve';
import { gridFromString, rowFromString } from './test-utilities';

describe('nonogram solver', () => {
    describe('when solving a whole grid', () => {
        it('solves an empty case', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [],
                secondDimensionNumbers: []
            }));
            expect(result.solutions[0].solution.gridData.length).toBe(0);
        });

        it('solves a single unset cell', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[]],
                secondDimensionNumbers: [[]]
            }));
            expect(result.solutions[0].solution.gridData.length).toBe(1);
            expect(result.solutions[0].solution.gridData[0].length).toBe(1);
            expect(result.solutions[0].solution.gridData[0][0]).toBe(NonogramCell.UNSET);
        });

        it('solves a single set cell', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[1]],
                secondDimensionNumbers: [[1]]
            }));
            expect(result.solutions[0].solution.gridData.length).toBe(1);
            expect(result.solutions[0].solution.gridData[0].length).toBe(1);
            expect(result.solutions[0].solution.gridData[0][0]).toBe(NonogramCell.SET);
        });

        it('solves a trivial nonogram which only requires on dimension of numbers', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[3], [1, 1], [3]],
                secondDimensionNumbers: [[3], [1, 1], [3]]
            }));
            expect(result.solutions[0].solution.gridData.length).toBe(3);
            expect(result.solutions[0].solution.gridData[0].length).toBe(3);
            expect(result.solutions[0].solution.gridData).toEqual([
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1],
            ]);
        });

        it('solves a nonogram which requires both number dimensions', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[1], [1], [3]],
                secondDimensionNumbers: [[3], [1], [1]]
            }));
            expect(result.solutions[0].solution.gridData.length).toBe(3);
            expect(result.solutions[0].solution.gridData[0].length).toBe(3);
            expect(result.solutions[0].solution.gridData).toEqual(gridFromString(`
                        XOO
                        XOO
                        XXX
            `));
        });

        it('solves a nonogram which requires multiple steps between dimensions', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[3], [], [1, 1], [1]],
                secondDimensionNumbers: [[1, 1], [1], [1, 2], []]
            }));
            expect(result.solutions[0].solution.gridData).toEqual(gridFromString(`
                        XXXO
                        OOOO
                        XOXO
                        OOXO
            `));
        });

        it('solves a nonogram which requires guessing', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[1, 1], [1], [1, 1], [1, 1]],
                secondDimensionNumbers: [[2], [2], [2], [1]]
            }));

            expect(result.solutions.length).toEqual(1);
            expect(result.solutions[0].numberOfGuesses).toEqual(1);
            expect(result.solutions[0].solution.gridData).toEqual(gridFromString(`
                        OXOX
                        OXOO
                        XOXO
                        XOXO
            `));
        });

        it('returns multiple results when a nonogram has multiple solutions', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [[1], [1]],
                secondDimensionNumbers: [[1], [1]]
            }));
            expect(result.solutions.length).toEqual(2);
            expect(result.solutions[0].numberOfGuesses).toEqual(1);
            expect(result.solutions[0].solution.gridData).toEqual(gridFromString(`
                        XO
                        OX
            `));
            expect(result.solutions[1].numberOfGuesses).toEqual(1);
            expect(result.solutions[1].solution.gridData).toEqual(gridFromString(`
                        OX
                        XO
            `));
        });

        it('generates partial solutions while solving a nonogram which requires guessing', () => {
            const expectedSteps = [
                {
                    type: NonogramAction.REWIND,
                    reason: 'this is the first grid'
                }, {
                    type: NonogramAction.GUESS,
                    firstDimensionIndex: 0,
                    secondDimensionIndex: 0,
                    guess: NonogramCell.SET
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 0
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 0
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 1
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 1
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 2
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 3
                }, {
                    type: NonogramAction.REWIND,
                    reason: 'no solutions were found with the last guess'
                }, {
                    type: NonogramAction.GUESS,
                    firstDimensionIndex: 0,
                    secondDimensionIndex: 0,
                    guess: NonogramCell.UNSET
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 0
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 0
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 1
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 2
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 1, index: 3
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 1
                }, {
                    type: NonogramAction.EVALUATE_ROW,
                    dimension: 0, index: 3
                }
            ];

            const result = solveNonogram({
                firstDimensionNumbers: [[1, 1], [1], [1, 1], [1, 1]],
                secondDimensionNumbers: [[2], [2], [2], [1]]
            });

            let index = 0;
            let iterate = result.next();
            for(; !iterate.done; iterate = result.next()){
                if(index >= expectedSteps.length){
                    fail('More steps to solve than expected');
                }
                let expectedStep = expectedSteps[index];
                expect(iterate.value.lastAction).toEqual(expectedStep)
                index++;
            }
            const solvedResult = iterate.value;

            expect(solvedResult.solutions.length).toEqual(1);
            expect(solvedResult.solutions[0].numberOfGuesses).toEqual(1);
            expect(solvedResult.solutions[0].solution.gridData).toEqual(gridFromString(`
                        OXOX
                        OXOO
                        XOXO
                        XOXO
            `));
        });

        it('solves a big nonogram with multiple solutions and guessing', () => {
            const result = getLastItem(solveNonogram({
                firstDimensionNumbers: [
                    [6], 
                    [2, 4], 
                    [3, 5], 
                    [2, 4, 4], 
                    [1, 6, 1], 
                    [1, 6, 2, 1], 
                    [2, 6, 5],
                    [3, 4, 5], 
                    [3, 2, 1], 
                    [2, 8, 1], 
                    [3, 1, 1, 3], 
                    [1, 1, 1, 1], 
                    [1, 1], 
                    [1, 1], 
                    [8]],
                secondDimensionNumbers: [
                    [6],
                    [2, 5], 
                    [3, 2, 3], 
                    [3, 1, 1], 
                    [2, 3, 1, 1],
                    [1, 5, 1, 1], 
                    [1, 5, 3, 1], 
                    [1, 5, 1, 1], 
                    [1, 5, 1, 1], 
                    [3, 3, 3, 1], 
                    [4, 1, 1], 
                    [4, 2, 1, 1], 
                    [4, 4, 1, 1], 
                    [3, 4, 3], 
                    [2, 2, 1], 
                    [6]]
            }));
            expect(result.solutions).toBeDefined();
            expect(result.solutions.length).toBe(2);
            expect(result.solutions[0].numberOfGuesses).toBe(2);
            expect(result.solutions[0].solution).toBe(gridFromString(`
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            OOOOOOOOOOOOOOOO
            `));
        });
    });

    describe('when solving a nonogram purely deductively without guessing', () => {
        it('partially solves a nonogram which cannot be completely solved by deduction', () => {
            const nonogramKey = {
                firstDimensionNumbers: [[3], [], [1, 1], [1, 1]],
                secondDimensionNumbers: [[1, 2], [1], [1, 1], [1]]
            };
            const workingGrid = new NonogramGrid(4, 4);
            const result = getLastItem(furtherSolveNonogramWithoutGuessing(nonogramKey, workingGrid));
            expect((result as NonogramGrid).gridData).toEqual(gridFromString(`
                        XXXO
                        OOOO
                        XO--
                        XO--
            `));
        });

        it('finishes solving a nonogram after a guess has been made', () => {
            const nonogramKey = {
                firstDimensionNumbers: [[1], [1]],
                secondDimensionNumbers: [[1], [1]]
            };
            const workingGrid = new NonogramGrid(2, 2);
            workingGrid.applySliceAcrossArray(0, 0, rowFromString('X-'));
            const result = getLastItem(furtherSolveNonogramWithoutGuessing(nonogramKey, workingGrid));
            expect(result).toBeDefined();
            expect((result as NonogramGrid).gridData).toEqual(gridFromString(`
                        XO
                        OX
            `));
        });

        it('returns nothing if the guess creates a contradiction', () => {
            const nonogramKey = {
                firstDimensionNumbers: [[1, 1], [1], [1, 1], [1, 1]],
                secondDimensionNumbers: [[2], [2], [2], [1]]
            };
            const workingGrid = new NonogramGrid(4, 4);
            workingGrid.applySliceAcrossArray(0, 1, rowFromString('---X'));
            const result = getLastItem(furtherSolveNonogramWithoutGuessing(nonogramKey, workingGrid));
            expect(result).toBeUndefined();
        });
    });

    describe('when checking the validity of a row based on numbers', () => {
        it('should return true when small numbers in unknown row', () => {
            const result = checkSliceValidity(rowFromString('----'), [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false when whole unset row with one number', () => {
            const result = checkSliceValidity(rowFromString('OOOO'), [1]);
            expect(result).toBe(false);
        });
        it('should return false when whole set row with one smaller number', () => {
            const result = checkSliceValidity(rowFromString('XXXX'), [1]);
            expect(result).toBe(false);
        });
        it('should return true when whole row solved with one smaller number', () => {
            const result = checkSliceValidity(rowFromString('OOXO'), [1]);
            expect(result).toBe(true);
        });
        it('should return true when row partially solved with one smaller number', () => {
            const result = checkSliceValidity(rowFromString('O-X-'), [1]);
            expect(result).toBe(true);
        });
        it('should return true when row partially solved with two smaller number', () => {
            const result = checkSliceValidity(rowFromString('X-XO'), [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false when row solved with too many X with one smaller number', () => {
            const result = checkSliceValidity(rowFromString('X-XO'), [1]);
            expect(result).toBe(false);
        });
        it('should return false when row fully incorrectly solved with two smaller number', () => {
            const result = checkSliceValidity(rowFromString('XXOO'), [1, 1]);
            expect(result).toBe(false);
        });
        it('should return true when long row only solved at end', () => {
            const result = checkSliceValidity(rowFromString('----OXOX'), [1, 1]);
            expect(result).toBe(true);
        });
        it('should return false when extra set cells at the end', () => {
            const result = checkSliceValidity(rowFromString('X-X-OXX'), [1, 1]);
            expect(result).toBe(false);
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
        it('should generate no permutations if the rows state is incompatible with the numbers', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('XXX---------'),
                [2, 1, 3]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(0);
        });
        it('should generate no permutations if there are too many Set cells', () => {
            const iterResult = generateAllPossibleSlicePermutations(
                rowFromString('X-X-OXX'),
                [1, 1]
            );
            const arrayResult = Array.from(iterResult);
            expect(arrayResult.length).toBe(0);
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
        it('should return undefined if the row is absolutely unsolvable', () => {
            const result = attemptToFurtherSolveSlice(
                rowFromString('XX--'),
                [1]);
            expect(result).toBeUndefined();;
        });
    });
});