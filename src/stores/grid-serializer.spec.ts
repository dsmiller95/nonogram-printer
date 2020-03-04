import { Pixel } from "../Pixel";
import { base64ToBinaryArray, binaryArrayToBase64, attemptDeserializeGrid, serializeGrid } from './grid-serializer';

describe('when serializing and deserializing pixel grids', () => {
    it('should serialize and deserialize a big grid', () => {
        let sourceGrid = [
            [Pixel.White, Pixel.Black,   Pixel.White, Pixel.Black,    Pixel.White,    Pixel.Black],
            [Pixel.Black, Pixel.Black,   Pixel.White, Pixel.Black,    Pixel.White,    Pixel.Black],
            [Pixel.Black,   Pixel.Black,   Pixel.Black, Pixel.White,    Pixel.Black,    Pixel.White],
            [Pixel.Black, Pixel.White,   Pixel.Black, Pixel.Black,    Pixel.Black,    Pixel.White],
            [Pixel.Black, Pixel.Black,   Pixel.White, Pixel.Black,    Pixel.White,    Pixel.Black],
        ];

        const serialized = serializeGrid(sourceGrid.map(x => x.map(y => y)));
        const resultGrid = attemptDeserializeGrid(serialized);

        expect(resultGrid).toEqual(sourceGrid);
    });
    it('should fail gracefully if given no height', () => {
        const deserialize = {
            width: '333',
            raw: 'AAB'
        };
        const resultGrid = attemptDeserializeGrid(deserialize);
        expect(resultGrid).toBeUndefined();
    });
    it('should fail gracefully if given bad raw data', () => {
        const deserialize = {
            width: '2',
            height: '2',
            raw: '@#$%^$#1=-'
        };
        const resultGrid = attemptDeserializeGrid(deserialize);
        expect(resultGrid).toBeUndefined();
    });
    it('should fail gracefully if given not enough raw data', () => {
        const deserialize = {
            width: '4',
            height: '4',
            raw: 'k'
        };
        const resultGrid = attemptDeserializeGrid(deserialize);
        expect(resultGrid).toBeUndefined();
    });

    it('should encode and decode base64 from binary arrays', () => {
        const source = Array.from('010010111110101').map(char => char === '1');

        const base64 = binaryArrayToBase64([...source]);
        expect(base64.length).toBe(Math.ceil(source.length / 6));
        const result = Array.from(base64ToBinaryArray(base64)).splice(0, source.length);

        expect(result).toEqual(source);
    })

});