import * as React from 'react';
import './Guide.css';
import { Pixel } from '../Pixel';
import qrCode from '../assets/self-link-qr.png';
import { generateGuidesWithPadding } from './guide-number-generator';

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
        if(!grid ||
            grid.length === 0 ||
            grid[0].length === 0){
            return {
                rows: [],
                cols: []
            };
        }
        const guide = generateGuidesWithPadding(grid.map(x => x.map(cell => cell.isBlack))) as {rows: GuideData[][], cols: GuideData[][]};

        if(Number.isNaN(guide.rows[0][0] as number)) {
            guide.rows[0][0] = 'QRCode';
        } else if(Number.isNaN(guide.cols[0][0] as number)) {
            guide.cols[0][0] = 'QRCode';
        }
        return guide;
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
