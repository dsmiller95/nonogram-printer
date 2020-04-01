import { action, computed, observable } from "mobx";
import { generateKey } from '../../Guide/guide-number-generator';
import { NonogramKey } from '../../models/nonogram-parameter';
import { Pixel, PixelState } from "../../Pixel";
import { RootStore } from '../root-store/root-store';

export class GridStore {
    @observable grid: Pixel[][];

    constructor(rootStore: RootStore){
    }
    
	@computed get gridKey(): NonogramKey {
        if(!this.grid?.[0]) {
            return ({
                secondDimensionNumbers: [],
                firstDimensionNumbers: []
            });
        }
        return generateKey(this.grid.map(x => x.map(pix => pix === Pixel.Black)));
    }

    @action updatePixel(row: number, column: number, value: PixelState){
        if(this.grid[row][column].value !== value){
            this.grid[row][column].value = value;
            this.grid = [...this.grid];
        }
    }

    @action instantiateGrid(gridData: Pixel[][]) {
        this.grid = gridData;
    }
}