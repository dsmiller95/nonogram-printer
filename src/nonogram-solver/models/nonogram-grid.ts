import { NonogramCell } from './nonogram-parameter';
import * as md5 from 'md5';

export class NonogramGrid {
    gridData: NonogramCell[][];

    constructor(firstDimensionSize: number, secondDimensionSize: number){
        this.gridData = Array(firstDimensionSize).fill(undefined)
            .map(() => Array(secondDimensionSize).fill(NonogramCell.UNKNOWN));
    }

    public clone(): NonogramGrid {
        const newGrid = new NonogramGrid(this.getDimensionSize(0), this.getDimensionSize(1));
        newGrid.gridData = this.gridData.map(first =>
            first.map(cell => cell));
        return newGrid;
    }

    public getDimensionSize(dimension: number){
        if(dimension === 0){
            return this.gridData.length;
        }
        if(dimension === 1){
            return this.gridData[0]?.length ?? 0;
        }
        throw `Dimension ${dimension} not supported yet`;
    }

    /**
     * Return a unique identifier based on the current state of the grid
     */
    public getGridHash(): string{
        return md5(this.gridData
            .flatMap(x => x));
    }
    
    public applySliceAcrossArray(
        dimension: number,
        indexInDimension: number,
        slice: NonogramCell[]
        ): void
    {
        if(dimension === 0){
            this.gridData[indexInDimension] = [...slice];
            return;
        }
        if(dimension === 1){
            for(let i = 0; i < this.gridData.length; i++){
                this.gridData[i][indexInDimension] = slice[i];
            }
            return;
        }
        throw `Dimension ${dimension} not supported yet`;
    }

    getSliceAcrossArray(dimension: number, indexInDimension: number): NonogramCell[]{
        if(dimension === 0){
            return [...this.gridData[indexInDimension]];
        }
        if(dimension === 1){
            return this.gridData.map(row => 
                row[indexInDimension]
            );
        }
        throw `Dimension ${dimension} not supported yet`;
    }

}