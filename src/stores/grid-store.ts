import { autorun, computed, observable, action } from "mobx";
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateKey } from 'src/Guide/guide-number-generator';
import { NonogramKey, SolvedNonogram } from 'src/models/nonogram-parameter';
import { solveNonogram } from 'src/nonogram-solver/nonogram-solve';
import { Pixel } from "src/Pixel";
import { getLastItem } from 'src/utilities/utilities';
import { GridEditMode } from 'src/models/grid-edit-mode';

export class ObservableGridStateStore{
    @observable grid: Pixel[][];
    @observable solution: SolvedNonogram = {
        solutions: []
    };
    @observable mode: GridEditMode = GridEditMode.EDIT;

    constructor(){
        const keyChangedSubject = new Subject<NonogramKey>();
        autorun(() => {
            keyChangedSubject.next(this.gridKey);
        });
        keyChangedSubject.pipe(
            debounceTime(1000)
        ).subscribe(key => {
            this.computeSolution();
        });
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

    @action switchMode(){
        this.mode = (this.mode + 1) % 2;
    }

    @action updatePixel(row: number, column: number){
        this.grid[row][column] = this.grid[row][column] === Pixel.White ? Pixel.Black : Pixel.White;
        //this.grid[row][column] = (this.grid[row][column]+1)%3;
        this.grid = this.grid.map(x => x);
    }

    @action computeSolution() {
        this.solution = getLastItem(solveNonogram(this.gridKey));
    }

    @action instantiateGrid(width: number, height: number){
        let grid: Pixel[][] = [];
        for(let i = 0; i < width; i++){
            let col: Pixel[] = [];
            for (let j = 0; j < height; j++) {
                col.push(Pixel.White);
            }
            grid.push(col);
        }
        this.grid = grid;
    }
}