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
  public constructor(value: PixelState, isMaybe = false) {
    this.value = value;
    this.isMaybe = isMaybe;
  }
}
