import { GridStore } from '../grid-store/grid-store';
import { UIStore } from '../ui-store/ui-store';
import { GridSolverStore } from '../grid-solver-store/grid-solver-store';

export class RootStore {
    public editableGrid: GridStore;
    public gridSolverStore: GridSolverStore;
    public uiStore: UIStore;
    public manualGridSolveStore: GridStore;

    constructor() {
        this.editableGrid = new GridStore(this);
        this.gridSolverStore = new GridSolverStore(this, this.editableGrid);
        this.uiStore = new UIStore(this);
        this.manualGridSolveStore = new GridStore(this);
    }
}