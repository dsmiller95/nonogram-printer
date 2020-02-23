import * as React from 'react';
import './StatBlock.css';
import { NonogramSolution } from '../models/nonogram-parameter';

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
                {this.props.solutions.map((solution, index) => 
                    <div key={index} className="row">
                        <span>{solution.numberOfGuesses}</span>
                    </div>
                )}
            </div>
        );
    }
}

export default StatBlock;
