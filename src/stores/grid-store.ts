import { action, autorun, computed, observable } from "mobx";
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Pixel } from "src/Pixel";
import { generateKey } from '../Guide/guide-number-generator';
import { GridEditMode } from '../models/grid-edit-mode';
import { NonogramCell } from '../models/nonogram-cell';
import { NonogramKey, PartialNonogramSolution, SolvedNonogram } from '../models/nonogram-parameter';
import { solveNonogram } from '../nonogram-solver/nonogram-solve';
import { getLastItemWithInterrupt } from '../utilities/utilities';

export class ObservableGridStateStore{
    @observable grid: Pixel[][];
    @observable partialGridSolve: Pixel[][];
    @observable mode: GridEditMode = GridEditMode.EDIT;
    @observable partialSolution: PartialNonogramSolution | undefined;

    @observable solution: SolvedNonogram = {
        solutions: []
    };
    @observable computingSolution: boolean = false;

    constructor(){
        this.setupSolutionComputation();
    }

    private setupSolutionComputation(){
        const keyChangeObservable = new Observable<NonogramKey>(subscriber => {
            const disposer = autorun(() => {
                if(subscriber.closed){
                    disposer();
                    return;
                }
                subscriber.next(this.gridKey);
            });
        });

        keyChangeObservable.pipe(
            tap(() => {this.computingSolution = true}),
            switchMap(key => {
                return getLastItemWithInterrupt(solveNonogram(key), 30, 1)
            })
        ).subscribe(result => {
            console.log(`solved: `, result);
            this.computingSolution = false;
            this.solution = result;
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
        if(this.mode === GridEditMode.EDIT){
            this.beginSolving();
        } else {
            this.mode = GridEditMode.EDIT;
        }
    }

    @action updatePixel(row: number, column: number, value: Pixel){
        if(this.grid[row][column] !== value){
            this.grid[row][column] = value;
        }
    }

    private solutionGenerator: Generator<PartialNonogramSolution, SolvedNonogram, undefined>;
    @action beginSolving() {
        this.mode = GridEditMode.SOLVE;
        this.solutionGenerator = solveNonogram(this.gridKey);
        const nextStep = this.solutionGenerator.next();
        if(nextStep.done){
            this.partialSolution = undefined;
            return;
        }
        this.partialSolution = nextStep.value;
        this.partialGridSolve = this.partialSolution.partialSolution.gridData.map(row => 
            row.map(cell => this.nonogramCellToPixel(cell)));
    }

    private nonogramCellToPixel(cell: NonogramCell): Pixel {
        switch(cell){
            case NonogramCell.SET:
                return Pixel.Black;
            case NonogramCell.UNSET:
                return Pixel.White;
            case NonogramCell.UNKNOWN:
                return Pixel.Unknown;
        }
    }

    @action nextSolutionStep() {
        const nextStep = this.solutionGenerator.next();
        if(nextStep.done){
            this.partialSolution = undefined;
            return;
        }
        this.partialSolution = nextStep.value;
        const newPartialSolution = this.partialSolution.partialSolution.gridData.map(row => 
            row.map(cell => this.nonogramCellToPixel(cell)));
        this.partialGridSolve = newPartialSolution;
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