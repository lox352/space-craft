import rasterGlobe from "../assets/raster_globe.tif";
import * as geotiff from "geotiff";
import { GlobalCoordinates } from "../types/GlobalCoordinates";

type RGB = [number, number, number];

enum Palette {
  Blue = "119,159,196",
  Green = "178,200,169",
  White = "233,240,248",
  Beige = "241,231,212",
  Black = "0,0,0",
}

class TiffLoader {
  private static instance: {width: number, height: number, rasterData: Uint8Array} | null = null;
  private static loadingPromise: Promise<{width: number, height: number, rasterData: Uint8Array}> | null = null;

  static async getInstance(): Promise<{width: number, height: number, rasterData: Uint8Array}> {
    if (TiffLoader.instance) {
      return TiffLoader.instance;
    }

    if (!TiffLoader.loadingPromise) {
      TiffLoader.loadingPromise = (async () => {
        const response = await fetch(rasterGlobe);
        const arrayBuffer = await response.arrayBuffer();
        const tiff = await geotiff.fromArrayBuffer(arrayBuffer);

        const image = await tiff.getImage();
        const [width, height] = [image.getWidth(), image.getHeight()];
        const rasterData = (await image.readRasters({
          interleave: true,
        })) as Uint8Array;

        console.log({ rasterDataLength: rasterData.length, expectedLength: width * height * 3 });


        const result = { width, height, rasterData };

        TiffLoader.instance = result;
        TiffLoader.loadingPromise = null;
        return result;
      })();
    }

    return TiffLoader.loadingPromise;
  }
}

const tiffLoader = TiffLoader.getInstance(); 

async function getClosestColor(
  globalCoordinates: GlobalCoordinates,
  palette: RGB[],
  sampleRadius: number = 1
): Promise<RGB | null> {
  const latitude = globalCoordinates.latitude;
  const longitude = globalCoordinates.longitude;

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(
      "Latitude must be in [-90, 90] and longitude in [-180, 180]"
    );
  }

  // Load the TIFF file
  const {width, height, rasterData} = await tiffLoader;

  // Convert latitude and longitude to pixel coordinates
  const x = Math.round(((longitude + 180) / 360) * width);
  const y = Math.round(((90 - latitude) / 180) * height);

  // Sample pixels around the target location
  const sampledColors: RGB[] = [];
  for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
    for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
      const px = x + dx;
      const py = y + dy;

      // Ensure pixel is within bounds
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4; // R, G, B, A
        sampledColors.push([
          rasterData[idx],
          rasterData[idx + 1],
          rasterData[idx + 2],
        ]);
      }
    }
  }

  if (sampledColors.length === 0) return null;

  // Compute the average color of sampled pixels
  const averageColor: RGB = sampledColors
    .reduce(
      (acc, color) => {
        acc[0] += color[0];
        acc[1] += color[1];
        acc[2] += color[2];
        return acc;
      },
      [0, 0, 0] as RGB
    )
    .map((value) => Math.round(value / sampledColors.length)) as RGB;

  // Find the closest color in the palette
  let closestColor: RGB | null = null;
  let smallestDistance = Infinity;

  for (const color of palette) {
    const distance = Math.sqrt(
      (averageColor[0] - color[0]) ** 2 +
        (averageColor[1] - color[1]) ** 2 +
        (averageColor[2] - color[2]) ** 2
    );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

export { getClosestColor, Palette, type RGB };