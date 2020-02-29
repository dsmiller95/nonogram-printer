import { action, autorun, computed, observable } from "mobx";
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { generateKey } from 'src/Guide/guide-number-generator';
import { GridEditMode } from 'src/models/grid-edit-mode';
import { NonogramCell } from 'src/models/nonogram-cell';
import { NonogramKey, PartialNonogramSolution, SolvedNonogram } from 'src/models/nonogram-parameter';
import { solveNonogram } from 'src/nonogram-solver/nonogram-solve';
import { Pixel } from "src/Pixel";
import { getLastItem } from 'src/utilities/utilities';

export class ObservableGridStateStore{
    @observable grid: Pixel[][];
    @observable partialGridSolve: Pixel[][];
    @observable solution: SolvedNonogram = {
        solutions: []
    };
    @observable mode: GridEditMode = GridEditMode.EDIT;
    @observable partialSolution: PartialNonogramSolution | undefined;

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
        if(this.mode === GridEditMode.EDIT){
            this.beginSolving();
        } else {
            this.mode = GridEditMode.EDIT
        }
    }

    @action updatePixel(row: number, column: number){
        this.grid[row][column] = this.grid[row][column] === Pixel.White ? Pixel.Black : Pixel.White;
        //this.grid[row][column] = (this.grid[row][column]+1)%3;
        this.grid = this.grid.map(x => x);
    }

    @action computeSolution() {
        this.solution = getLastItem(solveNonogram(this.gridKey));
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
                return Pixel.Yellow;
        }
    }

    @action nextSolutionStep() {
        console.log('stepped');
        const nextStep = this.solutionGenerator.next();
        console.log(nextStep);
        if(nextStep.done){
            this.partialSolution = undefined;
            return;
        }
        this.partialSolution = nextStep.value;
        const newPartialSolution = this.partialSolution.partialSolution.gridData.map(row => 
            row.map(cell => this.nonogramCellToPixel(cell)));
        console.log(newPartialSolution);
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