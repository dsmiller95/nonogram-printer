import { action, computed, observable } from "mobx";
import { NonogramKey } from "../../models/nonogram-parameter";
import { Pixel, PixelState } from "../../Pixel";
import { RootStore } from "../root-store/root-store";
import { generateKey } from "nonogram-grid";

export class GridStore {
  @observable grid: Pixel[][];

  constructor(rootStore: RootStore) {}

  @computed get gridKey(): NonogramKey {
    if (!this.grid?.[0]) {
      return {
        secondDimensionNumbers: [],
        firstDimensionNumbers: [],
      };
    }
    const key = generateKey(
      this.grid.map((x) => x.map((pix) => pix === Pixel.Black))
    );
    return {
      firstDimensionNumbers: key.firstDimension,
      secondDimensionNumbers: key.secondDimension,
    };
  }

  @action updatePixel(row: number, column: number, value: PixelState) {
    if (this.grid[row][column].value !== value) {
      this.grid[row][column].value = value;
      this.grid = [...this.grid];
    }
  }

  @action instantiateGrid(gridData: Pixel[][]) {
    this.grid = gridData;
  }
}
