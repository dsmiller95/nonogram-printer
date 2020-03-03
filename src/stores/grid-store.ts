import { action, autorun, computed, observable } from "mobx";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PartialNonogramSolution } from 'src/models/nonogram-solve-steps';
import { Pixel } from "src/Pixel";
import { generateKey } from '../Guide/guide-number-generator';
import { GridEditMode } from '../models/grid-edit-mode';
import { NonogramCell } from '../models/nonogram-cell';
import { NonogramKey, SolvedNonogram } from '../models/nonogram-parameter';
import { solveNonogram } from '../nonogram-solver/nonogram-solve';
import { getGridSolutionSummaryObservable } from '../utilities/utilities';
import { selectGenerator } from 'src/utilities/linq-utilities';
import { NonogramGrid } from 'src/models/nonogram-grid';
import { getQueryParam, setQueryParam } from './window-query-param-accessor';
import { deserializeGrid, serializeGrid } from './grid-serializer';
import { refStructEnhancer } from 'mobx/lib/internal';

export class ObservableGridStateStore{
    @observable grid: Pixel[][];
    @observable partialGridSolve: Pixel[][];
    @observable mode: GridEditMode = GridEditMode.EDIT;
    @observable partialSolution: PartialNonogramSolution | undefined;

    @observable solution: SolvedNonogram = {
        solutions: []
    };
    @observable difficultyRating: number = 0;
    @observable computingSolution: boolean = false;

    constructor(){
        this.setupSolutionComputation();
        this.setupGridQueryParamUpdater();
    }

    private setupGridQueryParamUpdater() {
        const disposer = autorun(() => {
            if(!this.grid) return;
            const serialized = serializeGrid(this.grid);
            setQueryParam('grid', serialized);
        });
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

        getGridSolutionSummaryObservable(
            keyChangeObservable.pipe(tap(() => this.computingSolution = true))
            ).subscribe(solution => {
                this.computingSolution = false;
                this.solution = solution.solved;
                this.difficultyRating = solution.difficultyRating;
            })
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

    @computed get aggregateSolutionGrid(): Pixel[][] | undefined {
        if(this.computingSolution || !this.solution?.solutions?.[0]){
            return undefined;
        }

        const solutions = this.solution.solutions.map(solution => this.nonogramGridToPixelGrid(solution.solution));

        const result: Pixel[][] = new Array(solutions[0].length)
            .fill(new Array(solutions[0][0].length).fill(undefined));
        return result.map((row, firstIndex) => row.map((pix, secondIndex) => {
            return solutions
                .map(solution => solution[firstIndex][secondIndex])
                .reduce((aggregate, current) => current === aggregate ? current : Pixel.Unknown)
        }));
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
        this.partialGridSolve = this.nonogramGridToPixelGrid(this.partialSolution.partialSolution);
    }

    private nonogramGridToPixelGrid(nonogram: NonogramGrid): Pixel[][] {
        return nonogram.gridData.map(row => 
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

    @action instantiateGrid(width: number, height: number) {
        const queryGridData = getQueryParam('grid');
        if(queryGridData && queryGridData.length > 0) {
            try {
                const newGrid = deserializeGrid(queryGridData);
                this.grid = newGrid;
                return;
            } catch (e){
                console.error('problem deserializing grid from query parameters, creating blank grid');
                console.error(e);
            }
        }
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