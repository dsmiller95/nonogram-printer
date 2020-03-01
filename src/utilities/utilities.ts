import { Observable } from 'rxjs';

export function getLastItem<T>(iterator: Iterator<any, T, never>): T {
    let current: any;
    while(!(current = iterator.next()).done){};
    return current.value;
}

/**
 * Iterates to the end of an iterator, while allowing for interrupts in the computation so the main thread doesn't block completely
 * @param iterator the iterator to complete
 * @param interruptInterval the period of time between interrupt points
 * @param interruptPeriod The amount of delay after each interrupt point before the iterator starts again
 */
export function getLastItemWithInterrupt<T>(iterator: Iterator<any, T, never>, interruptInterval: number, interruptPeriod: number): Observable<T> {
    let current: IteratorResult<any, T>;
    if(interruptInterval <= interruptPeriod){
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