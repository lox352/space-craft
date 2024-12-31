import { GlobalCoordinates } from "./types/GlobalCoordinates";

const adjacentStitchDistance = 2;
const verticalStitchDistance = 1.8;

const defaultStitchesPerRow = 200;
const defaultNumberOfRows = 25;

const northPole: GlobalCoordinates = { latitude: 90, longitude: 0 };
const southPole: GlobalCoordinates = { latitude: -90, longitude: 0 };

export {
  adjacentStitchDistance,
  verticalStitchDistance,
  defaultStitchesPerRow,
  defaultNumberOfRows,
  northPole,
  southPole
};
