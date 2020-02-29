import { NonogramKey } from '../models/nonogram-parameter';
export interface GuideNumbers{
    rows: number[][],
    cols: number[][]
}

export function generateKey(grid: boolean[][]): NonogramKey {
    const firstDimension: number[][] = [];
    for(let firstDimensionIndex = 0; firstDimensionIndex < grid.length; firstDimensionIndex++){
        firstDimension.push(generateKeyForSlice(grid[firstDimensionIndex]));
    }
    
    const secondDimension: number[][] = [];
    for(let secondDimensionIndex = 0; secondDimensionIndex < grid[0].length; secondDimensionIndex++){
        secondDimension.push(generateKeyForSlice(grid.map(column => column[secondDimensionIndex])));
    }

    return {
        firstDimensionNumbers: firstDimension,
        secondDimensionNumbers: secondDimension
    };
}

export function nonogramKeyToGuideNumbers(key: NonogramKey): GuideNumbers {
    return {
        rows: key.secondDimensionNumbers.map(x => x.map(y => y)),
        cols: key.firstDimensionNumbers.map(x => x.map(y => y))
    }
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

export function addPaddingToGuides(guide: GuideNumbers){
    let width: number = guide.cols.length;
    let height: number = guide.rows.length;

    const targetRowLength = Math.ceil(width/2);
    guide.rows.forEach(row => row.unshift(...Array(targetRowLength - row.length).fill(NaN)));
    const targetColumnLength = Math.ceil(height/2);
    guide.cols.forEach(column => column.unshift(...Array(targetColumnLength - column.length).fill(NaN)));
    return guide;
}
