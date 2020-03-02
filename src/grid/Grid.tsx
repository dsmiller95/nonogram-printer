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
            //  I'm warming up to the hack now...
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
        this.gridRef.addEventListener('touchend', (event) => {
            this.isDragging = false;
        });
        this.gridRef.addEventListener('touchcancel', () => {
            this.isDragging = false;
        });
    }

    public render() {
        const store = this.props.gridStore;
        const isEditable = store.mode === GridEditMode.EDIT;
        const grid = isEditable ? store.grid : store.partialGridSolve;

        const dragEnter = (row: number, col: number) => {
            if(this.isDragging){
                store.updatePixel(row, col, this.dragValueChange);
            }
        };
        const dragStart = (row: number, col: number, pixel: Pixel) => {
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
                                    className={"col" +
                                        (item === Pixel.Black ? " black" : "") +
                                        (item === Pixel.Unknown ? " unknown" : "") +
                                        (item === Pixel.White ? " white" : "") }
                                    onMouseEnter={() => {
                                        dragEnter(rowIndex, colIndex)
                                    }}
                                    onMouseDown={(event) => {
                                        dragStart(rowIndex, colIndex, item);
                                        store.updatePixel(rowIndex, colIndex, this.dragValueChange);
                                        event.preventDefault();
                                    }}
                                    onTouchStart={(event) => {
                                        dragStart(rowIndex, colIndex, item);
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
