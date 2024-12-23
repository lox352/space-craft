import KnittingMachine from "../types/KnittingMachine";
import { Point } from "../types/Point";
import { adjacentStitchDistance } from "../constants";
import { Stitch } from "../types/Stitch";


const generateCircle =
  (numPoints: number) =>
  (point: number): Point => {
    return {
      x: (adjacentStitchDistance * numPoints * Math.cos((point / numPoints) * Math.PI * 2)) / (2 * Math.PI),
      y: (point * adjacentStitchDistance) / numPoints,
      z: (adjacentStitchDistance * numPoints * Math.sin((point / numPoints) * Math.PI * 2)) / (2 * Math.PI),
    };
  };

const getStitches = (
  stitchesPerRow: number,
  numberOfRows: number
): Stitch[] => {
  const knittingMachine = new KnittingMachine(stitchesPerRow);
  knittingMachine.castOnRow(generateCircle(stitchesPerRow)).join();
  for (let i = 1; i < numberOfRows; i++) {
    knittingMachine.knitRow(["k1"]);
  }

  knittingMachine.decreaseHemispherically(Math.floor(stitchesPerRow * adjacentStitchDistance / 4));

  return knittingMachine.stitches;
};

export { getStitches };