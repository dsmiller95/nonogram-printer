export interface GuideNumbers{
    rows: number[][],
    cols: number[][]
}

export function generateKey(grid: boolean[][]): GuideNumbers {
    const columns: number[][] = [];
    for(let columnIndex = 0; columnIndex < grid.length; columnIndex++){
        columns.push(generateKeyForSlice(grid[columnIndex]));
    }
    
    const rows: number[][] = [];
    for(let row = 0; row < grid[0].length; row++){
        rows.push(generateKeyForSlice(grid.map(column => column[row])));
    }

    return {
        rows,
        cols: columns
    };
}

function generateKeyForSlice(slice: boolean[]): number[] {
    const key: number[] = [];
    let runLength = 0;
    for (let i = 0; i < slice.length; i++) {
        let pixel = slice[i]
        if(pixel) {
            runLength++;
        }
        if(runLength > 0 && !pixel) {
            key.push(runLength);
            runLength = 0;
        }
    }
    if(runLength > 0){
        key.push(runLength);
    }
    return key;
}

export function generateGuidesWithPadding(grid: boolean[][]): GuideNumbers {
    let width: number = grid.length;
    let height: number = grid[0].length;
    const keys = generateKey(grid);

    const targetRowLength = Math.ceil(width/2);
    keys.rows.forEach(row => row.unshift(...Array(targetRowLength - row.length).fill(NaN)));
    const targetColumnLength = Math.ceil(height/2);
    keys.cols.forEach(column => column.unshift(...Array(targetColumnLength - column.length).fill(NaN)));
    return keys;
}