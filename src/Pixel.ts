export enum PixelState {
    White = 0,
    Unknown = 1,
    Black = 2,
}

export class Pixel {
    public value: PixelState;
    /**
     * Set to true indicates that this pixel should render as partially defined
     */
    public isMaybe: boolean;
    public static White = {value: PixelState.White, isMaybe: false};
    public static Black = {value: PixelState.Black, isMaybe: false};
    public static Unknown = {value: PixelState.Unknown, isMaybe: false};
}