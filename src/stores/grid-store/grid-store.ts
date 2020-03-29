import { action, autorun, computed, observable, reaction } from "mobx";
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NonogramGrid } from '../../models/nonogram-grid';
import { PartialNonogramSolution } from '../../models/nonogram-solve-steps';
import { Pixel } from "../../Pixel";
import { generateKey } from '../../Guide/guide-number-generator';
import { GridEditMode } from '../../models/grid-edit-mode';
import { NonogramCell } from '../../models/nonogram-cell';
import { NonogramKey, SolvedNonogram } from '../../models/nonogram-parameter';
import { solveNonogram } from '../../nonogram-solver/nonogram-solve';
import { getGridSolutionSummaryObservable } from '../../utilities/utilities';
import { attemptDeserializeGrid, serializedKeys, serializeGrid } from '../grid-serializer';
import { getQueryParams, setQueryParams } from '../window-query-param-accessor';
import { overwriteFavicon } from '../window-favicon-manager';
import { RootStore } from '../root-store/root-store';
import { nonogramGridToPixelGrid, nonogramCellToPixel } from './grid-utilities';

export class GridStore {
    @observable grid: Pixel[][];
    @observable partialGridSolve: Pixel[][];
    @observable partialSolution: PartialNonogramSolution | undefined;

    @observable solution: SolvedNonogram = {
        solutions: []
    };
    @observable difficultyRating: number = 0;
    @observable computingSolution: boolean = false;

    constructor(rootStore: RootStore){
        this.setupSolutionComputation();
        this.setupGridQueryParamUpdater();
    }

    private setupGridQueryParamUpdater() {
        reaction(() => this.grid, 
            (grid, reaction) => {
                if(!grid) return;
                const serialized = serializeGrid(grid);
                setQueryParams(serialized);
                overwriteFavicon(grid);
            }, {
                delay: 1000
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

        const solutions = this.solution.solutions.map(solution => nonogramGridToPixelGrid(solution.solution));
        if(solutions[0].length <= 0 || solutions[0][0].length <= 0) {
            return undefined;
        }

        const result: Pixel[][] = new Array(solutions[0].length)
            .fill(new Array(solutions[0][0].length).fill(undefined));
        return result.map((row, firstIndex) => row.map((pix, secondIndex) => {
            return solutions
                .map(solution => solution[firstIndex][secondIndex])
                .reduce((aggregate, current) => current === aggregate ? current : Pixel.Unknown)
        }));
    }

    @action updatePixel(row: number, column: number, value: Pixel){
        if(this.grid[row][column] !== value){
            this.grid[row][column] = value;
            this.grid = [...this.grid];
        }
    }

    private solutionGenerator: Generator<PartialNonogramSolution, SolvedNonogram, undefined>;
    @action beginSolving() {
        this.solutionGenerator = solveNonogram(this.gridKey);
        const nextStep = this.solutionGenerator.next();
        if(nextStep.done){
            this.partialSolution = undefined;
            return;
        }
        this.partialSolution = nextStep.value;
        this.partialGridSolve = nonogramGridToPixelGrid(this.partialSolution.partialSolution);
    }


    @action nextSolutionStep() {
        const nextStep = this.solutionGenerator.next();
        if(nextStep.done){
            this.partialSolution = undefined;
            return;
        }
        this.partialSolution = nextStep.value;
        const newPartialSolution = this.partialSolution.partialSolution.gridData.map(row => 
            row.map(cell => nonogramCellToPixel(cell)));
        this.partialGridSolve = newPartialSolution;
    }

    @action instantiateGrid(width: number, height: number) {
        const queryGridData = getQueryParams(...serializedKeys);
        const deserialized = attemptDeserializeGrid(queryGridData);
        if(deserialized){
            this.grid = deserialized;
            return;
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