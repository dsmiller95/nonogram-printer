import { gridFromString } from "../nonogram-solver/test-utilities";
import {
  addPaddingToGuides,
  otherNonogramKeyToGuideNumbers,
} from "./guide-number-generator";
import { NonogramCell } from "../models/nonogram-cell";
import { generateKey } from "nonogram-grid";

describe("when generating guides based off of a grid", () => {
  it("should generate guides from a given grid with the right amount of padding", () => {
    const grid = gridFromString(`
            XOXXXOXX
            XOOOXOOX
            XXXXXOOX
            OOXOOXOX
            XXXXXXXX
            OOOOOOOO
        `).map((row) => row.map((cell) => cell === NonogramCell.SET));
    let guide = otherNonogramKeyToGuideNumbers(generateKey(grid));
    guide = addPaddingToGuides(guide);
    expect(guide.rows).toEqual([
      [NaN, 3, 1],
      [NaN, 1, 1],
      [NaN, 1, 3],
      [1, 1, 1],
      [NaN, 3, 1],
      [NaN, NaN, 2],
      [NaN, 1, 1],
      [NaN, NaN, 5],
    ]);
    expect(guide.cols).toEqual([
      [NaN, 1, 3, 2],
      [NaN, 1, 1, 1],
      [NaN, NaN, 5, 1],
      [NaN, 1, 1, 1],
      [NaN, NaN, NaN, 8],
      [NaN, NaN, NaN, NaN],
    ]);
  });
});
