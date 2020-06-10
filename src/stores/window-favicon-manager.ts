import { PixelState } from "../Pixel";

export function overwriteFavicon(pixels: PixelState[][]): void {
  var canvas = document.createElement("canvas");
  canvas.width = pixels.length;
  canvas.height = pixels[0].length;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#FFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  for (let rowIndex = 0; rowIndex < pixels.length; rowIndex++) {
    for (let colIndex = 0; colIndex < pixels[rowIndex].length; colIndex++) {
      if (pixels[rowIndex][colIndex] === PixelState.Black) {
        ctx.fillRect(colIndex, rowIndex, 1, 1);
      }
    }
  }

  var link =
    (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "shortcut icon";
  link.href = canvas.toDataURL("image/x-icon");
  document.getElementsByTagName("head")[0].appendChild(link);
}
