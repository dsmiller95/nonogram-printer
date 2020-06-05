import * as React from "react";
import "./GridDumb.css";

export interface PixelInfo {
  color: string;
}

export enum PixelDisplay {
  White = 0,
  Unknown = 1,
  Black = 2,
  UnknownBlack = 3,
  UnknownWhite = 4,
}

export interface IProps {
  pixels: PixelDisplay[][];
  editable: boolean;
  dragStart: (row: number, col: number) => void;
  onDrag: (row: number, col: number) => void;
}

interface IState {}

class GridDumb extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
  }

  private isDragging = false;

  private gridRef: HTMLDivElement;

  componentDidMount() {
    this.gridRef.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length > 1) {
          return;
        }
        // bad hack, pls change
        //  I'm warming up to the hack though...
        const newEvent = new MouseEvent("mouseover", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        const element = document.elementFromPoint(
          event.touches[0].pageX,
          event.touches[0].pageY
        );
        element?.dispatchEvent(newEvent);
        event.stopPropagation();
        event.preventDefault();
      },
      {
        passive: false,
        capture: true,
      }
    );
    this.gridRef.addEventListener("touchend", () => {
      this.isDragging = false;
    });
    this.gridRef.addEventListener("touchcancel", () => {
      this.isDragging = false;
    });
  }

  private pixelToColorClass(pix: PixelDisplay): string {
    switch (pix) {
      case PixelDisplay.Black:
        return "black";
      case PixelDisplay.White:
        return "white";
      case PixelDisplay.Unknown:
        return "unknown";
      case PixelDisplay.UnknownBlack:
        return "black uncertain";
      case PixelDisplay.UnknownWhite:
        return "white uncertain";
    }
  }

  public render() {
    const isEditable = this.props.editable;
    const grid = this.props.pixels;

    const colorClassForPosition = (row: number, col: number): string => {
      const pixelValue = grid[row][col];
      return this.pixelToColorClass(pixelValue);
    };

    const dragEnter = (row: number, col: number) => {
      if (this.isDragging) {
        this.props.onDrag(row, col);
      }
    };
    const dragStart = (row: number, col: number) => {
      if (!isEditable || this.isDragging) return;
      this.isDragging = true;
      this.props.dragStart(row, col);
    };
    return (
      <div className="Grid" ref={(ref) => ref && (this.gridRef = ref)}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((item, colIndex) => (
              <div
                key={colIndex}
                className={"col " + colorClassForPosition(rowIndex, colIndex)}
                onMouseEnter={() => {
                  dragEnter(rowIndex, colIndex);
                }}
                onMouseDown={(event) => {
                  dragStart(rowIndex, colIndex);
                  event.preventDefault();
                }}
                onTouchStart={(event) => {
                  dragStart(rowIndex, colIndex);
                }}
                onMouseUp={() => {
                  this.isDragging = false;
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }
}

export default GridDumb;
