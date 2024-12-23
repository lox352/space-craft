import { Point } from "../types/Point";
import { GlobalCoordinates } from "../types/GlobalCoordinates";
import { getClosestColor, Palette } from "./raster-colouring";
import { type RGB } from "../types/RGB";

const colourPalette: RGB[] = Object.values(Palette).map((color) =>
  color.split(",").map(Number) as RGB
);

const colourNode = async (
  position: Point,
  maxY: number,
  palette: RGB[] = colourPalette
): Promise<RGB> => {
  const coordinates = getGlobalCoordinates(position, maxY);
  const colour = await getClosestColor(coordinates, palette);
  
  if (!colour) {
    console.error("Failed to get colour for node");
    return [0, 0, 0];
  }
  return colour;
};

const getGlobalCoordinates = (
  position: Point,
  maxY: number
): GlobalCoordinates => {
  const { x, y, z } = position;
  // Given Cartesian coordinates (x, y, z)
  const newY = y - maxY / 2;
  const radius = Math.sqrt(x * x + newY * newY + z * z);

  // Normalize coordinates
  const xNorm = x / radius;
  const yNorm = newY / radius;
  const zNorm = z / radius;

  // Compute longitude and latitude
  const longitude = Math.atan2(xNorm, zNorm); // Radians
  const latitude = Math.asin(yNorm); // Radians

  // Convert to degrees
  const longitudeDegrees = longitude * (180 / Math.PI);
  const latitudeDegrees = latitude * (180 / Math.PI);

  if (y > maxY / 2) {
    return { latitude: latitudeDegrees, longitude: longitudeDegrees };
  } else {
    const normalisedVerticalDistance = (y - maxY / 2) / (maxY / 2);
    const angle = Math.asin(normalisedVerticalDistance);
    const cylindricalLatitude = angle * (180 / Math.PI);
    return { latitude: cylindricalLatitude, longitude: longitudeDegrees };
  }
};

export { colourNode };
