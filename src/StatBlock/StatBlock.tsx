import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { ObservableGridStateStore } from '../stores/grid-store';
import './StatBlock.css';
import { GridEditMode } from '../models/grid-edit-mode';

export interface IProps {
    gridStore: ObservableGridStateStore;
}

interface IState {
}

@observer
class StatBlock extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
    }

    public render() {
        const gridStore = this.props.gridStore;
        const solutions = gridStore.solution.solutions;
        const switchMode = () => {
            gridStore.switchMode();
        }
        const stepSolve = () => {
            gridStore.nextSolutionStep();
        }
        const isSolving = gridStore.mode === GridEditMode.SOLVE;
        return (
            <Card className="StatBlock no-print" variant="outlined">
                <CardContent>
                    <div className="data-block">
                        <Typography className="data-label">Solutions: </Typography>
                        <Typography className="data-value">
                            {solutions.length}
                        </Typography>
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Worst guesses: </Typography>
                        <Typography className="data-value">
                            {Math.max(...solutions.map(solution => solution.numberOfGuesses))}
                        </Typography>
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Best guesses: </Typography>
                        <Typography className="data-value">
                            {Math.min(...solutions.map(solution => solution.numberOfGuesses))}
                        </Typography>
                    </div>
                </CardContent>
                <CardActions>
                    <Button size="small" variant="contained" color="default"
                        onClick={switchMode} >
                        {gridStore.mode === GridEditMode.EDIT ? 'Step Solve' : 'Edit'}
                    </Button>
                    {isSolving ? <Button size="small" variant="contained" color="default"
                        onClick={stepSolve} >
                        Step
                    </Button> : ''}
                </CardActions>
            </Card>
        );
    }
}

export default StatBlock;
