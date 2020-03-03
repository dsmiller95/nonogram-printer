import { Pixel } from "../Pixel";
import { deserializeGrid, serializeGrid } from './grid-serializer';

describe('when serializing and deserializing pixel grids', () => {
    it('should serialize and deserialize a big grid', () => {
        let sourceGrid = [
            [Pixel.White, Pixel.Black,   Pixel.White, Pixel.Black,    Pixel.White,    Pixel.Unknown],
            [Pixel.Unknown, Pixel.Black,   Pixel.White, Pixel.Unknown,    Pixel.White,    Pixel.Black],
            [Pixel.Black,   Pixel.Black,   Pixel.Black, Pixel.White,    Pixel.Black,    Pixel.White],
            [Pixel.Unknown, Pixel.White,   Pixel.Unknown, Pixel.Black,    Pixel.Black,    Pixel.White],
            [Pixel.Black, Pixel.Black,   Pixel.White, Pixel.Black,    Pixel.White,    Pixel.Black],
        ];

        const serialized = serializeGrid(sourceGrid.map(x => x.map(y => y)));
        const resultGrid = deserializeGrid(serialized);

        expect(resultGrid).toEqual(sourceGrid);
    });
});