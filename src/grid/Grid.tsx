import * as React from 'react';
import { GridStore } from '../stores/grid-store/grid-store';
import './Grid.css';
import { Pixel } from '../Pixel';
import { GridEditMode } from '../models/grid-edit-mode';
import { observer } from 'mobx-react';
import { UIStore } from '../stores/ui-store/ui-store';
import { GridSolverStore } from '../stores/grid-solver-store/grid-solver-store';

export interface IProps {
    gridStore: GridStore;
    gridSolverStore: GridSolverStore;
    uiStore: UIStore;
}

interface IState {
}

@observer
class Grid extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
    }

    private isDragging = false;
    private dragValueChange: Pixel;

    private gridRef: HTMLDivElement;

    componentDidMount(){
        this.gridRef.addEventListener('touchmove', (event) => {
            if(event.touches.length > 1){
                return;
            }
            // bad hack, pls change
            //  I'm warming up to the hack though...
            const newEvent = new MouseEvent('mouseover',{
                view: window,
                bubbles: true,
                cancelable: true
              });
            const element = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);
            element?.dispatchEvent(newEvent);
            event.stopPropagation();
            event.preventDefault();
        }, {
            passive: false,
            capture: true
        });
        this.gridRef.addEventListener('touchend', () => {
            this.isDragging = false;
        });
        this.gridRef.addEventListener('touchcancel', () => {
            this.isDragging = false;
        });
    }

    private pixelToColor(pix: Pixel): string {
        switch(pix){
            case Pixel.Black:
                return 'black';
            case Pixel.White:
                return 'white';
            case Pixel.Unknown:
                return 'unknown';
        }
    }

    public render() {
        const gridStore = this.props.gridStore;
        const gridSolverStore = this.props.gridSolverStore;
        const isEditable = this.props.uiStore.mode === GridEditMode.EDIT;
        const grid = isEditable ? gridStore.grid : gridSolverStore.partialGridSolve;
        const solutionGrid = gridSolverStore.aggregateSolutionGrid;

        const colorClassForPosition = (row: number, col: number): string => {
            const pixelValue = grid[row][col];
            const solutionValue = (isEditable && (solutionGrid !== undefined)) ? solutionGrid[row][col] : pixelValue;
            let baseColor = this.pixelToColor(pixelValue);
            return baseColor + ((solutionValue !== pixelValue) ? ' uncertain' : '');
        };

        const dragEnter = (row: number, col: number) => {
            if(this.isDragging && isEditable){
                gridStore.updatePixel(row, col, this.dragValueChange);
            }
        };
        const dragStart = (pixel: Pixel) => {
            if(this.isDragging) return;
            this.isDragging = true;
            this.dragValueChange = pixel === Pixel.White ? Pixel.Black : Pixel.White;
        } 
        return (
            <div className="gridContainer">
                <div className="Grid" ref={ref => ref && (this.gridRef = ref)}>
                    {grid.map((row, rowIndex) => 
                        <div key={rowIndex} className="row">
                            {row.map((item, colIndex) => 
                                <div
                                    key={colIndex}
                                    className={"col " + colorClassForPosition(rowIndex, colIndex) }
                                    onMouseEnter={() => {
                                        dragEnter(rowIndex, colIndex)
                                    }}
                                    onMouseDown={(event) => {
                                        if(!isEditable) return;
                                        dragStart(item);
                                        gridStore.updatePixel(rowIndex, colIndex, this.dragValueChange);
                                        event.preventDefault();
                                    }}
                                    onTouchStart={(event) => {
                                        if(!isEditable) return;
                                        dragStart(item);
                                    }}
                                    onMouseUp={() => {
                                        this.isDragging = false;
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Grid;
