import * as React from 'react';
import { ObservableGridStateStore } from 'src/stores/grid-store';
import './Grid.css';
import { Pixel } from 'src/Pixel';
import { GridEditMode } from 'src/models/grid-edit-mode';
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

    public render() {
        const store = this.props.gridStore;
        const isEditable = store.mode === GridEditMode.EDIT;
        const grid = isEditable ? store.grid : store.partialGridSolve;
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
                                        (item === Pixel.Yellow ? " yellow" : "") +
                                        (item === Pixel.White ? " white" : "") }
                                    onMouseEnter={() => {
                                        if(this.isDragging){
                                            store.updatePixel(rowIndex, colIndex);
                                        }
                                    }}
                                    onMouseDown={() => {
                                        if(!isEditable) return;
                                        this.isDragging = true;
                                        store.updatePixel(rowIndex, colIndex);
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
