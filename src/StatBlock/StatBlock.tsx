import * as React from 'react';
import { NonogramSolution } from '../models/nonogram-parameter';
import './StatBlock.css';

export interface IProps {
    solutions: NonogramSolution[];
}

interface IState {
}

class StatBlock extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
    }

    public render() {
        return (
            <div className="StatBlock">
                <div>
                    <div className="data-block">
                        <div className="data-label">Number of possible solutions: </div>
                        <div className="data-value">{this.props.solutions.length}</div>
                    </div>
                    <div className="data-block">
                        <div className="data-label">Worst-case solution guesses: </div>
                        <div className="data-value">{Math.max(...this.props.solutions.map(solution => solution.numberOfGuesses))}</div>
                    </div>
                    <div className="data-block">
                        <div className="data-label">Best-case solution guesses: </div>
                        <div className="data-value">{Math.min(...this.props.solutions.map(solution => solution.numberOfGuesses))}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default StatBlock;
