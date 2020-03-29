import { Button, Card, CardActions, CardContent, CircularProgress, Typography, makeStyles, withStyles, Theme, createStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { GridEditMode } from '../models/grid-edit-mode';
import { GridStore } from '../stores/grid-store/grid-store';
import './StatBlock.css';
import { pathToFileURL } from 'url';
import { Styles, WithStyles } from '@material-ui/core/styles/withStyles';
import { UIStore } from '../stores/ui-store/ui-store';

export interface IProps extends WithStyles<typeof styles> {
    gridStore: GridStore;
    uiStore: UIStore;
}

interface IState {
}

const styles = ({ palette, spacing }: Theme) => createStyles(
{
    root: {

    },
    card: {
        backgroundColor: palette.secondary.light
    },
    buttons: {

    }
});

@observer
class StatBlock extends React.Component<IProps, IState> {
    constructor(props: IProps){
        super(props);
    }

    public render() {
        const gridStore = this.props.gridStore;
        const uiStore = this.props.uiStore;
        const solutions = gridStore.solution.solutions;
        const switchMode = () => {
            uiStore.switchMode();
        }
        const stepSolve = () => {
            gridStore.nextSolutionStep();
        }

        const maybeLoading = (source: JSX.Element) => {
            if(gridStore.computingSolution)
                return <CircularProgress size={20} />;
            return source;
        }
        const isSolving = uiStore.mode === GridEditMode.SOLVE;
        return (
            <Card className={this.props.classes.card + " StatBlock no-print"} variant="outlined">
                <CardContent>
                    <div className="data-block">
                        <Typography className="data-label">Solutions: </Typography>
                        {maybeLoading(
                            <Typography className="data-value">
                                {solutions.length}
                            </Typography>
                        )}
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Worst guesses: </Typography>
                        {maybeLoading(
                            <Typography className="data-value">
                                {Math.max(...solutions.map(solution => solution.numberOfGuesses))}
                            </Typography>
                        )}
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Best guesses: </Typography>
                        {maybeLoading(
                            <Typography className="data-value">
                                {Math.min(...solutions.map(solution => solution.numberOfGuesses))}
                            </Typography>
                        )}
                    </div>
                    <div className="data-block">
                        <Typography className="data-label">Difficulty rating: </Typography>
                        {maybeLoading(
                            <Typography className="data-value">
                                {gridStore.difficultyRating}
                            </Typography>
                        )}
                    </div>
                </CardContent>
                <CardActions>
                    <Button size="small" variant="contained" color="secondary"
                        onClick={switchMode} >
                        {isSolving ? 'Edit' : 'Step Solve'}
                    </Button>
                    {isSolving ? <Button size="small" variant="contained" color="secondary"
                        onClick={stepSolve} >
                        Step
                    </Button> : ''}
                </CardActions>
            </Card>
        );
    }
}

export default withStyles(styles)(StatBlock);
