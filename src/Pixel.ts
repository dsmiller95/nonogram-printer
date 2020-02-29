export enum PixelValue {
    White = 0,
    Yellow = 1,
    Black = 2,
}

export class Pixel {
    constructor() {
        this.value = PixelValue.White;
    }

    get isBlack(){
        return this.value === PixelValue.Black;
    }
    get isYellow(){
        return this.value === PixelValue.Yellow;
    }

    value: PixelValue;
    pixelClicked() {
        this.value = (this.value+1)%3;// this.value === PixelValue.White ? PixelValue.Black : PixelValue.White;
    }
}