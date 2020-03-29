import { Typography } from '@material-ui/core';
import * as React from 'react';
import { GridEditMode } from '../models/grid-edit-mode';
import { GridStore } from '../stores/grid-store/grid-store';
import './grid-solver-info.css';
import { observer } from 'mobx-react';
import { NonogramActionData, NonogramAction, EvaluateRowAction, RewindAction } from '../models/nonogram-solve-steps';
import { RootStore } from '../stores/root-store/root-store';
import { UIStore } from '../stores/ui-store/ui-store';

export interface IProps {
    gridStore: GridStore;
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
                <Typography>Solving.  {actionToMessage(this.props.gridStore.partialSolution?.lastAction)}</Typography>
            </span>
        );
    }
}

export default GridSolverInfo;
