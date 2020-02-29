import * as React from 'react';
import { ObservableGridStateStore } from 'src/stores/grid-store';
import './Grid.css';
import { Pixel } from 'src/Pixel';

export interface IProps {
    gridStore: ObservableGridStateStore;
}

interface IState {
}

class Grid extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
        // this.state = {
        //     grid: this.generateGrid(props.width, props.height)
        // }
    }

    private isDragging = false;

    public render() {

        // if(!this.state.grid ||
        //     this.state.grid.length != this.props.width ||
        //     this.state.grid[0].length != this.props.height)
        // {
        //     this.setState({grid: this.generateGrid(this.props.width, this.props.height)});
        //     console.log(this.state.grid.length);
        //     console.log(this.state.grid[0].length);
        // }

        // let updatePixel = (pixel: Pixel) => {
        //     pixel.pixelClicked();
        //     this.props.onGridChanged(this.state.grid);
        //     this.setState(this.state);
        // }

        const store = this.props.gridStore;

        return (
            <div className="Grid">
                {store.grid.map((row, rowIndex) => 
                    <div key={rowIndex} className="row">
                        {row.map((item, colIndex) => 
                            <div
                                key={colIndex}
                                className={"col" + (item === Pixel.Black ? " black" : "") + (item === Pixel.Yellow ? " yellow" : "")}
                                onMouseEnter={() => {
                                    if(this.isDragging){
                                        store.updatePixel(rowIndex, colIndex);
                                    }
                                }}
                                onMouseDown={() => {
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
        );
    }
}

export default Grid;
