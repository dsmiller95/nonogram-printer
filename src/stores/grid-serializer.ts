import { PixelState } from "../Pixel";

const base64ConversionTable =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "abcdefghijklmnopqrstuvwxyz" + "0123456789+/";

export function binaryArrayToBase64(binary: boolean[]): string {
  let result = "";
  for (let i = 0; i < binary.length; i += 6) {
    const numbers = binary
      .slice(i, i + 6)
      .map((value, index) => (value ? Math.pow(2, index) : 0));
    const index = numbers.reduce((sum, num) => sum + num);
    const char = base64ConversionTable[index];
    if (!char) throw "unable to convert binary to base64; num: " + index;
    result += char;
  }
  return result;
}

export function* base64ToBinaryArray(base64: string) {
  for (let char of base64) {
    let index = base64ConversionTable.indexOf(char);
    if (index < 0) throw "Error: invalid base 64 character";
    for (let bit = 0; bit < 6; bit++) {
      yield index % 2 === 1;
      index = index >> 1;
    }
  }
}

export interface GridData {
  width: number;
  height: number;
  raw: string;
}

export const serializedKeys = ["width", "height", "raw"];

export function serializeGrid(
  gridData: PixelState[][]
): Record<string, string> {
  return {
    width: gridData.length.toFixed(),
    height: gridData[0].length.toFixed(),
    raw: binaryArrayToBase64(
      gridData.flat().map((pixel) => pixel === PixelState.Black)
    ),
  };
}

export function attemptDeserializeGrid(
  rawGridRecord: Record<string, string>
): PixelState[][] | undefined {
  if (!rawGridRecord.width || !rawGridRecord.height || !rawGridRecord.raw) {
    return undefined;
  }
  const gridData: GridData = {
    width: parseInt(rawGridRecord.width),
    height: parseInt(rawGridRecord.height),
    raw: rawGridRecord.raw,
  };
  let rawData: boolean[];
  try {
    rawData = Array.from(base64ToBinaryArray(gridData.raw));
  } catch (e) {
    console.error(e);
    return undefined;
  }
  if (rawData.length < gridData.width * gridData.height) {
    console.error("not enough data for grid");
    return undefined;
  }
  const result: PixelState[][] = [];
  for (let column = 0; column < gridData.width; column++) {
    const columnData: PixelState[] = [];
    for (let row = 0; row < gridData.height; row++) {
      const pixel = rawData[column * gridData.height + row]
        ? PixelState.Black
        : PixelState.White;
      columnData.push(pixel);
    }
    result.push(columnData);
  }
  return result;
}
