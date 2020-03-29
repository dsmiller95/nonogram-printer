import { GridStore } from '../grid-store/grid-store';
import { GridEditMode } from '../../models/grid-edit-mode';
import { observable, action } from 'mobx';
import { RootStore } from '../root-store/root-store';

export class UIStore {
    @observable mode: GridEditMode = GridEditMode.EDIT;
    constructor(private rootStore: RootStore) {

    }

    @action switchMode(){
        if(this.mode === GridEditMode.EDIT){
            this.mode = GridEditMode.SOLVE;
            this.rootStore.gridSolverStore.beginSolving();
        } else {
            this.mode = GridEditMode.EDIT;
        }
    }
}