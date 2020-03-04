import { Pixel } from "../Pixel";

export function overwriteFavicon(pixels: Pixel[][]): void {
    var canvas = document.createElement('canvas');
        canvas.width = 16;canvas.height = 16;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;

    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#000';
    for(let columnIndex = 0; columnIndex < pixels.length; columnIndex++){
        for(let rowIndex = 0; rowIndex < pixels[columnIndex].length; rowIndex++){
            if(pixels[columnIndex][rowIndex] === Pixel.Black){
                ctx.fillRect(columnIndex, rowIndex, 1, 1);
            }
        }
    }
    
    var link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName('head')[0].appendChild(link);
}
