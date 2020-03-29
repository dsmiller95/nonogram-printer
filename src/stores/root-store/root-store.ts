import { GridStore } from '../grid-store/grid-store';
import { UIStore } from '../ui-store/ui-store';

export class RootStore {
    public gridStore: GridStore;
    public uiStore: UIStore;

    constructor() {
        this.gridStore = new GridStore(this);
        this.uiStore = new UIStore(this);
    }
}