import { Pixel } from '../Pixel';

function pixelToStr(pix: Pixel): string{
    switch(pix){
        case Pixel.Black:
            return '0';
        case Pixel.White:
            return '-';
        case Pixel.Unknown:
            return 'x';
    }
}
function strToPixel(string: string): Pixel{
    switch(string){
        case '0':
            return Pixel.Black;
        case '-':
            return Pixel.White;
        case 'x':
            return Pixel.Unknown;
        default:
            throw `Error: invalid pixel string value: "${string}"`;
    }
}

export function serializeGrid(gridData: Pixel[][]): string {
    var outputObject = gridData.map(column => 
            column.map(pixel => pixelToStr(pixel)).join('')
            ).join(',');
    return outputObject;
}

export function deserializeGrid(gridString: string): Pixel[][] {
    const columns = gridString.split(',');
    const grid = columns.map(column => column.split('').map(char => strToPixel(char)));
    return grid;
}