import { NonogramCell } from "../../models/nonogram-cell";
import { NonogramGrid } from "../../models/nonogram-grid";
import { Pixel, PixelState } from "../../Pixel";

export function nonogramGridToPixelGrid(
  nonogram: NonogramGrid
): PixelState[][] {
  return nonogram.gridData.map((row) =>
    row.map((cell) => nonogramCellToPixel(cell))
  );
}

export function nonogramCellToPixel(cell: NonogramCell): PixelState {
  switch (cell) {
    case NonogramCell.SET:
      return PixelState.Black;
    case NonogramCell.UNSET:
      return PixelState.White;
    case NonogramCell.UNKNOWN:
      return PixelState.Unknown;
  }
}
