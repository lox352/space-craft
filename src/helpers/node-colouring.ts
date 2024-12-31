import { Point } from "../types/Point";
import { GlobalCoordinates } from "../types/GlobalCoordinates";
import { getClosestColor, Palette } from "./raster-colouring";
import { type RGB } from "../types/RGB";

const colourPalette: RGB[] = Object.values(Palette).map(
  (color) => color.split(",").map(Number) as RGB
);

function rotateAboutAxis(
  coord: GlobalCoordinates,
  angle: number
): GlobalCoordinates {
  const { latitude, longitude } = coord;
  const newLongitude = longitude + angle;
  if (newLongitude > 180) {
    return { latitude, longitude: newLongitude - 360 };
  }
  if (newLongitude < -180) {
    return { latitude, longitude: newLongitude + 360 };
  }
  return { latitude, longitude: newLongitude };
}

/**
 * Rotates the unit sphere such that {latitude: angleInDegrees, longitude: 0} ends up at {latitude: 0, longitude: 0}.
 * @param coord - The original coordinate { latitude, longitude }.
 * @param angleInDegrees - The angle to rotate by in degrees.
 * @returns The rotated coordinate { latitude, longitude }.
 */
function rotateVertically(
  coord: {latitude: number, longitude: number},
  angleInDegrees: number
): {latitude: number, longitude: number} {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const toDegrees = (radians: number) => (radians * 180) / Math.PI;

  // Convert input latitude and longitude to radians
  const latRad = toRadians(coord.latitude);
  const lonRad = toRadians(coord.longitude);
  const angleRad = toRadians(angleInDegrees);

  // Calculate the rotated coordinates
  const sinAngle = Math.sin(angleRad);
  const cosAngle = Math.cos(angleRad);

  const x = Math.cos(latRad) * Math.cos(lonRad);
  const y = Math.cos(latRad) * Math.sin(lonRad);
  const z = Math.sin(latRad);

  // Apply rotation around the y-axis
  const xRot = cosAngle * x - sinAngle * z;
  const yRot = y; // y-coordinate remains unchanged during vertical rotation
  const zRot = sinAngle * x + cosAngle * z;

  // Convert back to spherical coordinates
  const latitude = toDegrees(Math.asin(zRot));
  const longitude = toDegrees(Math.atan2(yRot, xRot));

  return { latitude, longitude };
}

/**
 * Rotates a given coordinate so that the `targetPoint` becomes either the new centre or the new north pole.
 * @param coord - The original coordinate { lat, lon }.
 * @param targetPoint - The new pole coordinate { lat, lon } to align to { lat: 90, lon: 0 }.
 * @param destination - The destination pole to align to (either the north pole or { lat: 0, lon: 0 }).
 * @returns The rotated coordinate { lat, lon }.
 */
function rotateToDestination(
  coord: GlobalCoordinates,
  targetPoint: GlobalCoordinates,
  destination: "centre" | "pole" = "centre"
): GlobalCoordinates {
  const { latitude: targetLatitude, longitude: targetLongitude } = targetPoint;
  let rotatedCoord;
  if (destination === "centre") {
    rotatedCoord = rotateVertically(coord, targetLatitude);
  } else {
    rotatedCoord = rotateVertically(coord, targetLatitude - 90);
  }
  const result = rotateAboutAxis(rotatedCoord, targetLongitude);
  return result;
}

const colourNode = async (
  position: Point,
  maxY: number,
  palette: RGB[] = colourPalette
): Promise<RGB> => {
  const coordinates = getGlobalCoordinates(position, maxY);
  const rotatedCoordinates = rotateToDestination(coordinates, {
    latitude: 90,
    longitude: 0,
  }, "pole");
  const colour = await getClosestColor(rotatedCoordinates, palette);

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
