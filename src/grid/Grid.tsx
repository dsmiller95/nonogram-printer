import * as React from "react";
import { GridStore } from "../stores/grid-store/grid-store";
import "./Grid.css";
import { Pixel, PixelState } from "../Pixel";
import { GridEditMode } from "../models/grid-edit-mode";
import { observer } from "mobx-react";
import { UIStore } from "../stores/ui-store/ui-store";
import { PixelDisplay, GridDumb } from "nonogram-grid";
import "nonogram-grid/dist/index.css";

export interface IProps {
  gridStore: GridStore;
  uiStore: UIStore;
}

interface IState {}

@observer
class Grid extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  private dragValueChange: PixelState;

  componentDidMount() {}

  public render() {
    const gridStore = this.props.gridStore;
    const isEditable = this.props.uiStore.mode === GridEditMode.EDIT;
    const grid = gridStore.grid;

    const fullGrid = grid.map((row, rowIndex) =>
      row.map((pix, colIndex) => {
        if (!isEditable || !pix.isMaybe) {
          return pix.value === PixelState.Black
            ? PixelDisplay.Black
            : pix.value === PixelState.White
            ? PixelDisplay.White
            : PixelDisplay.Unknown;
        }
        return pix.value === PixelState.Black
          ? PixelDisplay.UnknownBlack
          : pix.value === PixelState.White
          ? PixelDisplay.UnknownWhite
          : PixelDisplay.Unknown;
      })
    );

    const dragEnter = (col: number, row: number) => {
      gridStore.updatePixel(col, row, this.dragValueChange);
    };
    const dragStart = (col: number, row: number) => {
      this.dragValueChange =
        grid[col][row].value === PixelState.White
          ? PixelState.Black
          : PixelState.White;
      gridStore.updatePixel(col, row, this.dragValueChange);
    };
    return (
      <div className="gridContainer">
        <div className="insideContainer">
          <GridDumb
            pixels={fullGrid}
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
