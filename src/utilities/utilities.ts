import { Observable } from 'rxjs';
import { NonogramKey, SolvedNonogram } from '../models/nonogram-parameter';
import { tap, switchMap, map, first } from 'rxjs/operators';
import { solveNonogram } from '../nonogram-solver/nonogram-solve';
import { actionDifficultyRating, SolvedNonogramWithDifficulty } from '../models/nonogram-solve-steps';

export function getLastItem<T>(iterator: Iterator<any, T, never>): T {
    let current: any;
    while(!(current = iterator.next()).done){};
    return current.value;
}

function tapIterator<T, TReturn>(iterator: Iterator<T, TReturn, never>, tap: (item: T) => void): Iterator<T, TReturn, never> {
    const result = {
        next: () => {
            const nextValue = iterator.next();
            if(!nextValue.done){
                tap(nextValue.value);
            }
            return nextValue;
        }
    }
    return result;
}

export function getGridSolutionSummaryObservable(keys: Observable<NonogramKey>): Observable<SolvedNonogramWithDifficulty> {
    return keys.pipe(
        switchMap(key => {
            const nonogramSolveIterator = solveNonogram(key);
            let nonogramComplexityRating = 0;
            const wrappedIterator = tapIterator(nonogramSolveIterator, (action) => {
                nonogramComplexityRating += actionDifficultyRating[action.lastAction.type];
            });
            return getLastItemWithInterrupt(wrappedIterator, 30, 1)
                .pipe(
                    first(),
                    map(solved => ({solved, difficultyRating: Math.ceil(nonogramComplexityRating / solved.solutions.length)}))
                )
        })
    );
}

/**
 * Iterates to the end of an iterator, while allowing for interrupts in the computation so the main thread doesn't block completely
 * @param iterator the iterator to complete
 * @param interruptInterval the period of time between interrupt points
 * @param interruptPeriod The amount of delay after each interrupt point before the iterator starts again
 */
export function getLastItemWithInterrupt<T>(iterator: Iterator<any, T, never>, interruptInterval: number, interruptPeriod: number): Observable<T> {
    let current: IteratorResult<any, T>;
    if(interruptInterval <= interruptPeriod) {
        throw "interruptPeriod must be less than the interval, otherwise no work gets done";
    }
    return new Observable((subscriber) => {
        let lastInterrupt = (new Date()).getTime();
        const computeFunction = () => {
            while(
                (lastInterrupt + interruptInterval) > (new Date()).getTime() && 
                !(current = iterator.next()).done){
                }
            if(subscriber.closed){
                return;
            }
            if(current.done){
                subscriber.next(current.value);
                subscriber.complete();
            } else {
                lastInterrupt = (new Date()).getTime()
                setTimeout(computeFunction, interruptPeriod);
            }
        };
        computeFunction();
    });
}