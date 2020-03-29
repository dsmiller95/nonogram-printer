import { GridStore } from '../grid-store';

export class RootStore {
    public gridStore: GridStore;

    constructor() {
        this.gridStore = new GridStore(this);
    }
}