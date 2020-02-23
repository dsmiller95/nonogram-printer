import * as React from 'react';
import './Guide.css';
import qrCode from '../assets/self-link-qr.png';
import { GuideNumbers, addPaddingToGuides, nonogramKeyToGuideNumbers } from './guide-number-generator';
import { NonogramKey } from 'src/models/nonogram-parameter';

export interface IProps {
    nonogramKey: NonogramKey
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
        this.state = this.padAndDecorateKey(props.nonogramKey);
    }

    private padAndDecorateKey(key: NonogramKey): IState {
        const transformedGuide: GuideNumbers = nonogramKeyToGuideNumbers(key);
        const resultGuide = addPaddingToGuides(transformedGuide) as {rows: GuideData[][], cols: GuideData[][]};
        

        if(resultGuide.rows.length > 0 && Number.isNaN(resultGuide.rows[0][0] as number)) {
            resultGuide.rows[0][0] = 'QRCode';
        } else if(resultGuide.rows.length > 0 && Number.isNaN(resultGuide.cols[0][0] as number)) {
            resultGuide.cols[0][0] = 'QRCode';
        }
        return resultGuide;
    }

    private printStuff(){
        window.print();
    }

    public render() {
        let tmpState = this.padAndDecorateKey(this.props.nonogramKey);

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
