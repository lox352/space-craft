import { Point } from "../types/point";
import { GlobalCoordinates } from "../types/GlobalCoordinates";
import { getClosestColor, Palette } from "./raster-colouring";
import { type RGB } from "../types/RGB";
import * as THREE from "three";
// import { getLandUsage, colourByLandUsage } from "./svg-colouring";

const colourPalette: RGB[] = Object.values(Palette).map((color) =>
  color.split(",").map(Number) as RGB
);

const colourNode = async (
  position: Point,
  mayY: number,
  palette: RGB[] = colourPalette
): Promise<THREE.Color> => {
  const coordinates = getGlobalCoordinates(position, mayY);
  const colour = await getClosestColor(coordinates, palette);
  //const colour = colourByLandUsage(getLandUsage(coordinates.latitude, coordinates.longitude));
  
  if (!colour) {
    console.error("Failed to get colour for node");
    return new THREE.Color(0x000000);
  }
  return new THREE.Color(colour[0], colour[1], colour[2]);
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
