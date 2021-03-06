import { action, autorun, observable } from "mobx";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { PartialNonogramSolution } from "../../models/nonogram-solve-steps";
import { PixelState } from "../../Pixel";
import { NonogramKey, SolvedNonogram } from "../../models/nonogram-parameter";
import { solveNonogram } from "../../nonogram-solver/nonogram-solve";
import { getGridSolutionSummaryObservable } from "../../utilities/utilities";
import { RootStore } from "../root-store/root-store";
import {
  nonogramGridToPixelGrid,
  nonogramCellToPixel,
} from "../grid-store/grid-utilities";
import { GridStore } from "../grid-store/grid-store";

export class GridSolverStore {
  @observable partialGridSolve: PixelState[][];
  @observable partialSolution: PartialNonogramSolution | undefined;

  @observable solution: SolvedNonogram = {
    solutions: [],
  };
  @observable difficultyRating: number = 0;
  @observable computingSolution: boolean = false;
  @observable stepTimeMS: number = 200;
  @observable autoStepSolve: boolean = false;

  constructor(rootStore: RootStore, private gridStore: GridStore) {
    this.setupSolutionComputation();
    this.setupAutoSolutionStepping();
  }

  private stepSolveInterval: number;
  private setupAutoSolutionStepping() {
    autorun(() => {
      window.clearInterval(this.stepSolveInterval);
      if (this.autoStepSolve) {
        this.stepSolveInterval = window.setInterval(() => {
          this.nextSolutionStep();
        }, this.stepTimeMS);
      }
    });
  }

  private setupSolutionComputation() {
    const keyChangeObservable = new Observable<NonogramKey>((subscriber) => {
      const disposer = autorun(() => {
        if (subscriber.closed) {
          disposer();
          return;
        }
        subscriber.next(this.gridStore.gridKey);
      });
    });

    getGridSolutionSummaryObservable(
      keyChangeObservable.pipe(
        tap(() => {
          this.computingSolution = true;
        })
      )
    ).subscribe((solution) => {
      this.computingSolution = false;
      this.difficultyRating = solution.difficultyRating;
      const aggSolution = this.getAggregateSolutionGrid(solution.solved);
      if (aggSolution) {
        this.setMaybesOnSourceGrid(aggSolution);
      }
      this.solution = solution.solved;
    });
  }

  private setMaybesOnSourceGrid(aggregateSolutionGrid: PixelState[][]): void {
    const maybes = aggregateSolutionGrid.map((row, rowIndex) =>
      row.map((pixel, colIndex) => {
        const gridValue = this.gridStore.gridStates[rowIndex][colIndex];
        return pixel !== gridValue;
      })
    );
    this.gridStore.setIsMaybe(maybes);
  }

  private getAggregateSolutionGrid(
    solution: SolvedNonogram
  ): PixelState[][] | undefined {
    if (!solution.solutions?.[0]) {
      return undefined;
    }

    const solutions = solution.solutions.map((solution) =>
      nonogramGridToPixelGrid(solution.solution)
    );
    if (solutions[0].length <= 0 || solutions[0][0].length <= 0) {
      return undefined;
    }

    const result: PixelState[][] = new Array(solutions[0].length).fill(
      new Array(solutions[0][0].length).fill(undefined)
    );

    return result.map((row, rowIndex) =>
      row.map((pix, colIndex) => {
        return solutions
          .map((solution) => solution[rowIndex][colIndex])
          .reduce((aggregate, current) =>
            current === aggregate ? current : PixelState.Unknown
          );
      })
    );
  }

  private solutionGenerator: Generator<
    PartialNonogramSolution,
    SolvedNonogram,
    undefined
  >;
  @action beginSolving() {
    this.solutionGenerator = solveNonogram(this.gridStore.gridKey);
    const nextStep = this.solutionGenerator.next();
    if (nextStep.done) {
      this.partialSolution = undefined;
      return;
    }
    this.partialSolution = nextStep.value;
    this.partialGridSolve = nonogramGridToPixelGrid(
      this.partialSolution.partialSolution
    );
  }

  @action nextSolutionStep() {
    const nextStep = this.solutionGenerator?.next();
    if (nextStep.done) {
      this.partialSolution = undefined;
      return;
    }
    this.partialSolution = nextStep.value;
    const newPartialSolution = this.partialSolution.partialSolution.gridData.map(
      (row) => row.map((cell) => nonogramCellToPixel(cell))
    );
    this.partialGridSolve = newPartialSolution;
  }
}
