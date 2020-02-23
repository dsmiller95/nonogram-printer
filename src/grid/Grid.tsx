import * as React from 'react';
import './Grid.css';
import { Pixel } from '../Pixel';

export interface IProps {
    width: number;
    height: number;
    onGridChanged: (grid: Pixel[][]) => void;
}

interface IState {
    grid: Pixel[][];
}

class Grid extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
        this.state = {
            grid: this.generateGrid(props.width, props.height)
        }
    }

    private generateGrid(width: number, height: number){
        let grid: Pixel[][] = [];
        for(let i = 0; i < width; i++){
            let col: Pixel[] = [];
            for (let j = 0; j < height; j++) {
                col.push(new Pixel());
            }
            grid.push(col);
        }
        return grid;
    }

    private isDragging = false;

    public render() {

        if(!this.state.grid ||
            this.state.grid.length != this.props.width ||
            this.state.grid[0].length != this.props.height)
        {
            this.setState({grid: this.generateGrid(this.props.width, this.props.height)});
            console.log(this.state.grid.length);
            console.log(this.state.grid[0].length);
        }

        let updatePixel = (pixel: Pixel) => {
            pixel.pixelClicked();
            this.props.onGridChanged(this.state.grid);
            this.setState(this.state);
        }

        return (
            <div className="Grid">
                {this.state.grid.map((row, index) => 
                    <div key={index} className="row">
                        {row.map((item, index) => 
                            <div
                                key={index}
                                className={"col" + (item.isBlack ? " black" : "") + (item.isYellow ? " yellow" : "")}
                                onMouseEnter={() => {
                                    if(this.isDragging){
                                        updatePixel(item);
                                    }
                                }}
                                onMouseDown={() => {
                                    this.isDragging = true;
                                    updatePixel(item);
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
