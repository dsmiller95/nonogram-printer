import { NonogramKey } from "../models/nonogram-parameter";
export interface GuideNumbers {
  rows: number[][];
  cols: number[][];
}

export function otherNonogramKeyToGuideNumbers(key: {
  firstDimension: number[][];
  secondDimension: number[][];
}): GuideNumbers {
  return {
    rows: key.secondDimension,
    cols: key.firstDimension,
  };
}

export function nonogramKeyToGuideNumbers(key: NonogramKey): GuideNumbers {
  return {
    rows: key.secondDimensionNumbers.map((x) => x.map((y) => y)),
    cols: key.firstDimensionNumbers.map((x) => x.map((y) => y)),
  };
}

export function addPaddingToGuides(guide: GuideNumbers) {
  let width: number = guide.cols.length;
  let height: number = guide.rows.length;

  const targetRowLength = Math.ceil(width / 2);
  guide.rows.forEach((row) =>
    row.unshift(...Array(targetRowLength - row.length).fill(NaN))
  );
  const targetColumnLength = Math.ceil(height / 2);
  guide.cols.forEach((column) =>
    column.unshift(...Array(targetColumnLength - column.length).fill(NaN))
  );
  return guide;
}
