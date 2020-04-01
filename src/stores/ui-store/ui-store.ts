import { GridStore } from '../grid-store/grid-store';
import { GridEditMode } from '../../models/grid-edit-mode';
import { observable, action } from 'mobx';
import { RootStore } from '../root-store/root-store';

export class UIStore {
    @observable mode: GridEditMode = GridEditMode.EDIT;

    constructor(private rootStore: RootStore) {

    }

    @action beginSolvingComputed(){
        if(this.mode !== GridEditMode.SOLVE_COMPUTE){
            this.mode = GridEditMode.SOLVE_COMPUTE;
            this.rootStore.gridSolverStore.beginSolving();
        }
    }

    @action beginEditing(){
        if(this.mode !== GridEditMode.EDIT){
            this.mode = GridEditMode.EDIT;
        }
    }

    @action beginSolvingManual(){
        if(this.mode !== GridEditMode.SOLVE_MANUAL){
            this.mode = GridEditMode.SOLVE_MANUAL;
        }
    }
}