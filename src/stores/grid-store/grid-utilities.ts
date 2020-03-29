import { NonogramCell } from '../../models/nonogram-cell';
import { NonogramGrid } from '../../models/nonogram-grid';
import { Pixel } from '../../Pixel';

    export function nonogramGridToPixelGrid(nonogram: NonogramGrid): Pixel[][] {
        return nonogram.gridData.map(row => 
            row.map(cell => nonogramCellToPixel(cell)));
    }

    export function nonogramCellToPixel(cell: NonogramCell): Pixel {
        switch(cell){
            case NonogramCell.SET:
                return Pixel.Black;
            case NonogramCell.UNSET:
                return Pixel.White;
            case NonogramCell.UNKNOWN:
                return Pixel.Unknown;
        }
    }