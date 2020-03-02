import * as React from 'react';
import { ObservableGridStateStore } from '../stores/grid-store';
import './Grid.css';
import { Pixel } from '../Pixel';
import { GridEditMode } from '../models/grid-edit-mode';
import { observer } from 'mobx-react';

export interface IProps {
    gridStore: ObservableGridStateStore;
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
        const store = this.props.gridStore;
        const isEditable = store.mode === GridEditMode.EDIT;
        const grid = isEditable ? store.grid : store.partialGridSolve;
        const solutionGrid = store.aggregateSolutionGrid;

        const colorClassForPosition = (row: number, col: number): string => {
            const pixelValue = grid[row][col];
            const solutionValue = (isEditable && (solutionGrid !== undefined)) ? solutionGrid[row][col] : pixelValue;
            let baseColor = this.pixelToColor(pixelValue);
            return baseColor + ((solutionValue !== pixelValue) ? ' uncertain' : '');
        };

        const dragEnter = (row: number, col: number) => {
            if(this.isDragging){
                store.updatePixel(row, col, this.dragValueChange);
            }
        };
        const dragStart = (pixel: Pixel) => {
            if(!isEditable) return;
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
                                        dragStart(item);
                                        store.updatePixel(rowIndex, colIndex, this.dragValueChange);
                                        event.preventDefault();
                                    }}
                                    onTouchStart={(event) => {
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
