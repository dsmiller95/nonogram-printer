import * as React from "react";
import { GridStore } from "../stores/grid-store/grid-store";
import "./Grid.css";
import { Pixel } from "../Pixel";
import { GridEditMode } from "../models/grid-edit-mode";
import { observer } from "mobx-react";
import { UIStore } from "../stores/ui-store/ui-store";
import { GridSolverStore } from "../stores/grid-solver-store/grid-solver-store";

import { PixelDisplay, GridDumb } from "nonogram-grid";
import "nonogram-grid/dist/index.css";

export interface IProps {
  gridStore: GridStore;
  gridSolverStore: GridSolverStore;
  uiStore: UIStore;
}

interface IState {}

@observer
class Grid extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  private dragValueChange: Pixel;

  componentDidMount() {}

  public render() {
    const gridStore = this.props.gridStore;
    const gridSolverStore = this.props.gridSolverStore;
    const isEditable = this.props.uiStore.mode === GridEditMode.EDIT;
    const grid = isEditable ? gridStore.grid : gridSolverStore.partialGridSolve;
    const solutionGrid = gridSolverStore.aggregateSolutionGrid;

    const fullGrid = grid.map((row, rowIndex) =>
      row.map((pix, colIndex) => {
        if (!isEditable || solutionGrid === undefined) {
          return pix === Pixel.Black
            ? PixelDisplay.Black
            : pix === Pixel.White
            ? PixelDisplay.White
            : PixelDisplay.Unknown;
        }
        const solutionValue = solutionGrid[rowIndex][colIndex];

        switch (pix) {
          case Pixel.Black:
            return solutionValue === Pixel.Black
              ? PixelDisplay.Black
              : PixelDisplay.UnknownBlack;
          case Pixel.White:
            return solutionValue === Pixel.White
              ? PixelDisplay.White
              : PixelDisplay.UnknownWhite;
          case Pixel.Unknown:
            return PixelDisplay.Unknown;
        }
      })
    );

    const dragEnter = (row: number, col: number) => {
      gridStore.updatePixel(row, col, this.dragValueChange);
    };
    const dragStart = (row: number, col: number) => {
      this.dragValueChange =
        grid[row][col] === Pixel.White ? Pixel.Black : Pixel.White;
      gridStore.updatePixel(row, col, this.dragValueChange);
    };
    return (
      <div className="gridContainer">
        <GridDumb
          pixels={fullGrid}
          editable={isEditable}
          dragStart={dragStart}
          onDrag={dragEnter}
        ></GridDumb>
      </div>
    );
  }
}

export default Grid;
