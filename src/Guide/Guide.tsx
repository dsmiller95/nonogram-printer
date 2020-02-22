import * as React from 'react';
import './Guide.css';
import { Pixel } from '../Pixel';
import qrCode from '../assets/self-link-qr.png';

export interface IProps {
    grid: Pixel[][];
}

type QRCode = 'QRCode';
type GuideData = number | QRCode;

interface IState {
    rows: GuideData[][];
    cols: GuideData[][];
}

class Guide extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
        this.state = this.generateGuides(props.grid);
    }

    private generateGuides(grid: Pixel[][]): IState {
        let width: number, height: number;
        if(!grid ||
            (width = grid.length) == 0 ||
            (height = grid[0].length) == 0){
            return {
                rows: [],
                cols: []
            };
        }
        let cols: GuideData[][] = [];
        for(let i = 0; i < width; i++){
            let col: number[] = [];
            let runLength = 0;
            for (let j = 0; j < height; j++) {
                let pixel = grid[i][j];
                if(pixel.isBlack) {
                    runLength++;
                }
                if(runLength > 0 && !pixel.isBlack) {
                    col.push(runLength);
                    runLength = 0;
                }
            }
            if(runLength > 0){
                col.push(runLength);
            }
            while(col.length < Math.ceil(height/2)){
                col.unshift(NaN);
            }
            cols.push(col);
        }
        
        
        let rows: GuideData[][] = [];
        for(let i = 0; i < height; i++){
            let row: number[] = [];
            let runLength = 0;
            for (let j = 0; j < width; j++) {
                let pixel = grid[j][i];
                if(pixel.isBlack) {
                    runLength++;
                }
                if(runLength > 0 && !pixel.isBlack) {
                    row.push(runLength);
                    runLength = 0;
                }
            }
            if(runLength > 0){
                row.push(runLength);
            }
            while(row.length < Math.ceil(width/2)){
                row.unshift(NaN);
            }
            rows.push(row);
        }

        if(Number.isNaN(rows[0][0] as number)) {
            rows[0][0] = 'QRCode';
        } else if(Number.isNaN(cols[0][0] as number)) {
            cols[0][0] = 'QRCode';
        }
        return {
            rows,
            cols
        };
    }

    private printStuff(){
        window.print();
        /*let w = window.open();
        if(w == null){
            alert("couldn't print");
            return;
        }
        w.document.write(document.getElementsByClassName('Guide')[0].innerHTML);
        w.print();
        w.close();*/
    }

    public render() {
        let tmpState = this.generateGuides(this.props.grid);

        return (
            <div>
                <button onClick={this.printStuff}>
                    Print!!!
                </button>
                <div className="Guide">
                        
                    <span className="rows">
                        {tmpState.rows.reverse().map(row => 
                            <div className="row">
                                {row.map(item => 
                                    <div className="col">
                                        { item == 'QRCode' ?
                                            <img src={qrCode} className="qr-code" alt="logo" /> :
                                            <span className="text">{Number.isNaN(item) ? "" : item}</span>
                                        }
          
                                    </div>
                                )}
                            </div>
                        )}
                    </span>
                    <span className="divider"></span>
                    <span className="cols">
                        {tmpState.cols.map(col => 
                            <div className="row">
                                {col.map(item => 
                                    <div className="col">
                                        { item == 'QRCode' ?
                                            <img src={qrCode} className="qr-code" alt="logo" /> :
                                            <span className="text">{Number.isNaN(item) ? "" : item}</span>
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </span>
                </div>
            </div>
        );
    }
}

export default Guide;
