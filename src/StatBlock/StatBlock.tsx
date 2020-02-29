import { Button, Card, CardActions, CardContent, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { ObservableGridStateStore } from 'src/stores/grid-store';
import './StatBlock.css';

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
        const solutions = this.props.gridStore.solution.solutions;
        const switchMode = () => {
            this.props.gridStore.switchMode();
        }
        return (
            <Card className="StatBlock" variant="outlined">
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
                        Step Solve
                    </Button>
                </CardActions>
            </Card>
        );
    }
}

export default StatBlock;
