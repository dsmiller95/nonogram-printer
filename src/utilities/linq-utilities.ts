

type b<TIn, TOut> = (a: TIn) => TOut;

export function* selectGenerator<TIn, TOut, R>(
    thisIterator: Iterator<TIn, R, undefined>,
    transform: (previous: TIn) => TOut ): Generator<TOut, R, undefined> {
    
    let item: IteratorResult<TIn, R> = thisIterator.next();

    while(!item.done){
        yield transform(item.value);
        item = thisIterator.next();
    }
    return item.value;
};
