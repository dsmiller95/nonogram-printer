import Button from '@material-ui/core/Button';
import * as React from 'react';
import { NonogramKey } from 'src/models/nonogram-parameter';
import qrCode from '../assets/self-link-qr.png';
import { addPaddingToGuides, GuideNumbers, nonogramKeyToGuideNumbers } from './guide-number-generator';
import './Guide.css';

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
                <Button onClick={this.printStuff} variant="contained" color="primary">
                    Print
                </Button>
                <div className="Guide">
                    <span className="rows">
                        {tmpState.rows.reverse().map((row, index) => 
                            <div key={index} className="row">
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
                        {tmpState.cols.map((col, index) => 
                            <div key={index} className="row">
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
