
export function getLastItem<T>(iterator: Iterator<any, T, never>): T {
    let current: any;
    while(!(current = iterator.next()).done){};
    return current.value;
}