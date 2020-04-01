import * as React from 'react';
import { GridStore } from '../stores/grid-store/grid-store';
import './Grid.css';
import { Pixel, PixelState } from '../Pixel';
import { GridEditMode } from '../models/grid-edit-mode';
import { observer } from 'mobx-react';
import { UIStore } from '../stores/ui-store/ui-store';
import { GridSolverStore } from '../stores/grid-solver-store/grid-solver-store';

export interface IProps {
    gridStore: GridStore;
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
    private dragValueChange: PixelState;

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
        switch(pix.value){
            case PixelState.Black:
                return 'black';
            case PixelState.White:
                return 'white';
            case PixelState.Unknown:
                return 'unknown';
        }
    }

    public render() {
        const gridStore = this.props.gridStore;
        const isEditable = this.props.uiStore.mode === GridEditMode.EDIT;
        const grid = gridStore.grid;

        const colorClassForPosition = (row: number, col: number): string => {
            const pixelValue = grid[row][col];
            let baseColor = this.pixelToColor(pixelValue);
            return baseColor + (pixelValue.isMaybe ? ' uncertain' : '');
        };

        const dragEnter = (row: number, col: number) => {
            if(this.isDragging && isEditable){
                gridStore.updatePixel(row, col, this.dragValueChange);
            }
        };
        const dragStart = (pixel: Pixel) => {
            if(this.isDragging) return;
            this.isDragging = true;
            this.dragValueChange = pixel.value === PixelState.White ? PixelState.Black : PixelState.White;
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
