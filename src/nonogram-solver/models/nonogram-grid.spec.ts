import { NonogramGrid } from './nonogram-grid';
import { NonogramCell } from './nonogram-parameter';
import { rowFromString, gridFromString } from '../nonogram-solve.spec';
fdescribe('nonogram grid data model', () => {
    describe('when creating a new grid', () => {
        it('should start with unknown values', () => {
            const result = new NonogramGrid(3, 4);
            expect(result.gridData.length).toBe(3);
            expect(result.gridData[0].length).toBe(4);
            expect(result.gridData[0][0]).toBe(NonogramCell.UNKNOWN);
        });
    });
    describe('when applying slices to the grid', () => {
        let grid: NonogramGrid;
        beforeEach(() => {
            grid = new NonogramGrid(3, 3);
        });
        it('should apply a slice into the first dimension', () => {
            grid.applySliceAcrossArray(0, 1, rowFromString('XOX'));
            expect(grid.gridData[1]).toEqual(rowFromString('XOX'));
        });
        it('should apply a slice into the second dimension', () => {
            grid.applySliceAcrossArray(1, 1, rowFromString('XOX'));
            expect(grid.gridData[0][1]).toEqual(NonogramCell.SET);
            expect(grid.gridData[1][1]).toEqual(NonogramCell.UNSET);
            expect(grid.gridData[2][1]).toEqual(NonogramCell.SET);
        });
    });
    describe('when retrieving slices from the grid', () => {
        let grid: NonogramGrid;
        beforeEach(() => {
            grid = new NonogramGrid(3, 3);
            grid.gridData = gridFromString(
`
XXX
XOO
OOX
`
            );
        });
        it('should get a slice in the first dimension', () => {
            const result = grid.getSliceAcrossArray(0, 1);
            expect(result).toEqual(rowFromString('XOO'));
        });
        it('should get a slice in the second dimension', () => {
            const result = grid.getSliceAcrossArray(1, 0);
            expect(result).toEqual(rowFromString('XXO'));
        });
    });
});

