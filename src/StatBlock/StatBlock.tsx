import * as React from 'react';
import { NonogramSolution } from '../models/nonogram-parameter';
import './StatBlock.css';
import { observer } from 'mobx-react';
import { Card, CardContent, Typography, Button, CardActions } from '@material-ui/core';

export interface IProps {
    solutions: NonogramSolution[];
}

interface IState {
}

@observer
class StatBlock extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
    }

    public render() {
        return (
            <Card className="StatBlock" variant="outlined">
                <CardContent>
                    <div className="data-block">
                        <Typography className="data-label">Solutions: </Typography>
                        <Typography className="data-value">
                            {this.props.solutions.length}
                        </Typography>
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Worst guesses: </Typography>
                        <Typography className="data-value">
                            {Math.max(...this.props.solutions.map(solution => solution.numberOfGuesses))}
                        </Typography>
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Best guesses: </Typography>
                        <Typography className="data-value">
                            {Math.min(...this.props.solutions.map(solution => solution.numberOfGuesses))}
                        </Typography>
                    </div>
                </CardContent>
                <CardActions>
                    <Button size="small" variant="contained" color="default">
                        Step Solve
                    </Button>
                </CardActions>
            </Card>
        );
    }
}

export default StatBlock;
