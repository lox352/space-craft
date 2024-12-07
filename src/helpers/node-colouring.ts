import { NodeObject } from "three-forcegraph";
import { point, booleanPointInPolygon } from "@turf/turf";
import land from "../assets/land.json";
import glaciated_areas from "../assets/glaciated_areas.json";
import arctic_ice_shelves from "../assets/antarctic_ice_shelves.json";
import { Point } from "../types/point";

type LandUsage = "water" | "land" | "glaciated_areas" | "antarctic_ice_shelves";

interface GlobalCoordinates {
  latitude: number;
  longitude: number;
}

const checkIfLand = (latitude: number, longitude: number): LandUsage => {
  const pt = point([longitude, latitude]);
  if (
    land.geometries.some((feature: any) => booleanPointInPolygon(pt, feature))
  ) {
    if (
      glaciated_areas.geometries.some((feature: any) =>
        booleanPointInPolygon(pt, feature)
      )
    ) {
      return "glaciated_areas";
    }

    return "land";
  }

  if (
    arctic_ice_shelves.geometries.some((feature: any) =>
      booleanPointInPolygon(pt, feature)
    )
  ) {
    return "antarctic_ice_shelves";
  }

  return "water";
};

const colourNode = (
  position: Point,
  mayY: number
): "blue" | "green" | "white" | "black" => {
  const coordinates = getGlobalCoordinates(position, mayY);
  const landUsage = checkIfLand(coordinates.latitude, coordinates.longitude);
  switch (landUsage) {
    case "water":
      return "blue";
    case "land":
      return "green";
    case "glaciated_areas":
      return "white";
    case "antarctic_ice_shelves":
      return "white";
    default:
      return "black";
  }
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
    const cylindricalLatitude = (90 * (y - maxY / 2)) / (maxY / 2);
    return { latitude: cylindricalLatitude, longitude: longitudeDegrees };
  }
};

export { colourNode };
