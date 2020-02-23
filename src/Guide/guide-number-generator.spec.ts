import { NonogramCell } from '../nonogram-solver/models/nonogram-parameter';
import { gridFromString } from '../nonogram-solver/test-utilities';
import { generateGuidesWithPadding, generateKey } from './guide-number-generator';

fdescribe('when generating guides based off of a grid', () => {
    it('should generate guides from a given grid with the right amount of padding', () => {
        const grid = gridFromString(`
            XOXXXOXX
            XOOOXOOX
            XXXXXOOX
            OOXOOXOX
            XXXXXXXX
            OOOOOOOO
        `).map(row => row.map(cell => cell === NonogramCell.SET));
        const guide = generateGuidesWithPadding(grid);
        expect(guide.rows).toEqual([
            [NaN,   3, 1],
            [NaN,   1, 1],
            [NaN,   1, 3],
            [  1,   1, 1],
            [NaN,   3, 1],
            [NaN, NaN, 2],
            [NaN,   1, 1],
            [NaN, NaN, 5]]);
        expect(guide.cols).toEqual([
            [NaN,   1,   3, 2],
            [NaN,   1,   1, 1],
            [NaN, NaN,   5, 1],
            [NaN,   1,   1, 1],
            [NaN, NaN, NaN, 8],
            [NaN, NaN, NaN, NaN]]);
    });
    it('should generate keys from a given grid with no padding', () => {
        const grid = gridFromString(`
            XOXXXOXX
            XOOOXOOX
            XXXXXOOX
            OOXOOXOX
            XXXXXXXX
            OOOOOOOO
        `).map(row => row.map(cell => cell === NonogramCell.SET));
        const guide = generateKey(grid);
        expect(guide.rows).toEqual([
            [3, 1],
            [1, 1],
            [1, 3],
            [1, 1, 1],
            [3, 1],
            [2],
            [1, 1],
            [5]]);
        expect(guide.cols).toEqual([
            [1, 3, 2],
            [1, 1, 1],
            [5, 1],
            [1, 1, 1],
            [8],
            []]);
    });
});