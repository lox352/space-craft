import { GlobalCoordinates } from "./types/GlobalCoordinates";

const adjacentStitchDistance = 2;
const verticalStitchDistance = 1.6;

const defaultStitchesPerRow = 160;
const defaultNumberOfRows = 35;

const northPole: GlobalCoordinates = { latitude: 90, longitude: 0 };
const southPole: GlobalCoordinates = { latitude: -90, longitude: 180 };

export {
  adjacentStitchDistance,
  verticalStitchDistance,
  defaultStitchesPerRow,
  defaultNumberOfRows,
  northPole,
  southPole
};
