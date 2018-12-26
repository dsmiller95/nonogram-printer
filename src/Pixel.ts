export default class Pixel {
    constructor() {
        this.isBlack = false;
    }

    isBlack: boolean;
    pixelClicked() {
        this.isBlack = !this.isBlack;
    }
}