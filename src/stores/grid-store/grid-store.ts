import { action, computed, observable } from "mobx";
import { NonogramKey } from "../../models/nonogram-parameter";
import { Pixel, PixelState } from "../../Pixel";
import { RootStore } from "../root-store/root-store";
import { generateKey } from "nonogram-grid";

export class GridStore {
  @observable gridStates: PixelState[][];
  @observable gridMaybe: boolean[][];

  constructor(rootStore: RootStore) {}

  @computed get grid(): Pixel[][] {
    const newGrid = this.gridStates?.map((row, rowIndex) =>
      row.map((pix, colIndex) => {
        return {
          value: pix,
          isMaybe: this.gridMaybe?.[rowIndex][colIndex] ?? false,
        } as Pixel;
      })
    );
    return newGrid;
  }

  @computed get gridKey(): NonogramKey {
    if (!this.gridStates?.[0]) {
      return {
        secondDimensionNumbers: [],
        firstDimensionNumbers: [],
      };
    }
    const key = generateKey(
      this.gridStates.map((x) => x.map((pix) => pix === PixelState.Black))
    );
    return {
      firstDimensionNumbers: key.firstDimension,
      secondDimensionNumbers: key.secondDimension,
    };
  }

  @action updatePixel(row: number, column: number, value: PixelState) {
    if (this.gridStates[row][column] !== value) {
      this.gridStates[row][column] = value;
      this.gridStates = [...this.gridStates];
    }
  }

  @action setIsMaybe(isMaybe: boolean[][]) {
    this.gridMaybe = isMaybe;
  }

  @action instantiateGrid(gridData: PixelState[][]) {
    this.gridMaybe = gridData.map((row) => row.map((x) => false));
    this.gridStates = gridData;
  }
}
