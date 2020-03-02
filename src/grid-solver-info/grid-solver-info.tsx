import { Typography } from '@material-ui/core';
import * as React from 'react';
import { GridEditMode } from '../models/grid-edit-mode';
import { ObservableGridStateStore } from '../stores/grid-store';
import './grid-solver-info.css';
import { observer } from 'mobx-react';
import { NonogramActionData, NonogramAction, EvaluateRowAction, RewindAction } from 'src/models/nonogram-solve-steps';

export interface IProps {
    gridStore: ObservableGridStateStore
}

interface IState {
}

@observer
class GridSolverInfo extends React.Component<IProps, IState> {

    constructor(props: IProps){
        super(props);
    }

    public render() {
        const actionToMessage = (action: NonogramActionData | undefined): string => {
            if (action === undefined){
                return 'Done'
            }
            switch(action.type){
                case NonogramAction.GUESS: 
                    return 'Took a guess';
                case NonogramAction.EVALUATE_ROW:
                    const rowAction = action as EvaluateRowAction;
                    return `Evaluated a single ${rowAction.dimension === 0 ? 'column' : 'row'} via process of elimination`;
                case NonogramAction.REWIND:
                    const rewindAction = action as RewindAction;
                    return 'Rewound to a previous state because ' + rewindAction.reason;
            }
        }

        const isSolving = this.props.gridStore.mode === GridEditMode.SOLVE;
        if(!isSolving){
            return <span className='grid-panel-header'>
                <Typography>Edit</Typography>
            </span>
        }
        return (
            <span className='grid-panel-header'>
                <Typography>Solving.  {actionToMessage(this.props.gridStore.partialSolution?.lastAction)}</Typography>
            </span>
        );
    }
}

export default GridSolverInfo;
