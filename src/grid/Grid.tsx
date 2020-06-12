import * as React from "react";
import { GridStore } from "../stores/grid-store/grid-store";
import "./Grid.css";
import { Pixel, PixelState } from "../Pixel";
import { GridEditMode } from "../models/grid-edit-mode";
import { observer } from "mobx-react";
import { UIStore } from "../stores/ui-store/ui-store";
import { PixelDisplay, GridDumb } from "nonogram-grid";
import "nonogram-grid/dist/index.css";
import { GridSolverStore } from "../stores/grid-solver-store/grid-solver-store";

export interface IProps {
  gridStore: GridStore;
  uiStore: UIStore;
  gridSolverStore: GridSolverStore;
}

interface IState {}

@observer
class Grid extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  private dragValueChange: PixelState;

  componentDidMount() {}

  private static pixelToDisplay(state: Pixel): PixelDisplay {
    if (!state.isMaybe) {
      return Grid.pixelStateToDisplay(state.value);
    }
    return state.value === PixelState.Black
      ? PixelDisplay.UnknownBlack
      : state.value === PixelState.White
      ? PixelDisplay.UnknownWhite
      : PixelDisplay.Unknown;
  }

  private static pixelStateToDisplay(state: PixelState): PixelDisplay {
    return state === PixelState.Black
      ? PixelDisplay.Black
      : state === PixelState.White
      ? PixelDisplay.White
      : PixelDisplay.Unknown;
  }

  public render() {
    const { gridStore, gridSolverStore, uiStore } = this.props;

    const isEditable = this.props.uiStore.mode === GridEditMode.EDIT;
    let grid: PixelDisplay[][];
    if (uiStore.mode === GridEditMode.SOLVE_COMPUTE) {
      grid = gridSolverStore.partialGridSolve.map((x) =>
        x.map((value) => Grid.pixelStateToDisplay(value))
      );
    } else {
      grid = gridStore.grid.map((row) =>
        row.map((pix) => {
          return Grid.pixelToDisplay(pix);
        })
      );
    }

    const dragEnter = (row: number, col: number) => {
      if (uiStore.mode === GridEditMode.EDIT) {
        gridStore.updatePixel(row, col, this.dragValueChange);
      }
    };
    const dragStart = (row: number, col: number) => {
      if (uiStore.mode === GridEditMode.EDIT) {
        this.dragValueChange =
          gridStore.grid[row][col].value === PixelState.White
            ? PixelState.Black
            : PixelState.White;
        gridStore.updatePixel(row, col, this.dragValueChange);
      }
    };
    return (
      <div className="gridContainer">
        <div className="insideContainer">
          <GridDumb
            pixels={grid}
            editable={isEditable}
            dragStart={dragStart}
            onDrag={dragEnter}
          ></GridDumb>
        </div>
      </div>
    );
  }
}

export default Grid;
