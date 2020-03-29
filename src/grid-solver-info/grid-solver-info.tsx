import { Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import * as React from 'react';
import { GridEditMode } from '../models/grid-edit-mode';
import { EvaluateRowAction, NonogramAction, NonogramActionData, RewindAction } from '../models/nonogram-solve-steps';
import { GridSolverStore } from '../stores/grid-solver-store/grid-solver-store';
import { UIStore } from '../stores/ui-store/ui-store';
import './grid-solver-info.css';

export interface IProps {
    gridSolverStore: GridSolverStore;
    uiStore: UIStore;
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

        const isSolving = this.props.uiStore.mode === GridEditMode.SOLVE;
        if(!isSolving){
            return <span className='grid-panel-header'>
                <Typography>Edit</Typography>
            </span>
        }
        return (
            <span className='grid-panel-header'>
                <Typography>Solving.  {actionToMessage(this.props.gridSolverStore.partialSolution?.lastAction)}</Typography>
            </span>
        );
    }
}

export default GridSolverInfo;
