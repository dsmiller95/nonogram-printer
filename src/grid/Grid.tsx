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

    public render() {
        const store = this.props.gridStore;
        const isEditable = store.mode === GridEditMode.EDIT;
        const grid = isEditable ? store.grid : store.partialGridSolve;

        const dragEnter = (row: number, col: number) => {
            // console.log('dragEnter', row, col, this.isDragging);
            if(this.isDragging){
                store.updatePixel(row, col, this.dragValueChange);
            }
        };
        const dragStart = (row: number, col: number, pixel: Pixel) => {
            if(!isEditable) return;
            if(this.isDragging) return;
            this.isDragging = true;
            this.dragValueChange = pixel === Pixel.White ? Pixel.Black : Pixel.White;
            store.updatePixel(row, col, this.dragValueChange);
            // console.log('drag start');
            //event.preventDefault();
        }
        return (
            <div className="gridContainer">
                <div className="Grid">
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
                                        console.log('onMouseEnter');
                                        dragEnter(rowIndex, colIndex)
                                    }}
                                    onMouseDown={(event) => {
                                        console.log('onMouseDown');
                                        dragStart(rowIndex, colIndex, item);
                                        event.preventDefault();
                                    }}
                                    onTouchStart={(event) => {
                                        console.log('onTouchStart');
                                        dragStart(rowIndex, colIndex, item);
                                    }}
                                    onTouchMove={(event) => {
                                        console.log('onTouchMove');
                                        // bad hack, pls change
                                        const newEvent = new MouseEvent('mouseover',{
                                            view: window,
                                            bubbles: true,
                                            cancelable: true
                                          });
                                        const element = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);
                                        element?.dispatchEvent(newEvent);
                                        event.stopPropagation();
                                        event.preventDefault();
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
