import { NonogramCell } from '../models/nonogram-parameter';

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