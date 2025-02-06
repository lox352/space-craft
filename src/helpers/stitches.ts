import KnittingMachine from "../types/KnittingMachine";
import { Point } from "../types/Point";
import { adjacentStitchDistance } from "../constants";
import { Stitch } from "../types/Stitch";

const generateCircle =
  (numPoints: number) =>
  (point: number): Point => {
    return {
      x:
        (adjacentStitchDistance *
          numPoints *
          Math.cos((point / numPoints) * Math.PI * 2)) /
        (2 * Math.PI),
      y: (point * adjacentStitchDistance) / numPoints,
      z:
        (adjacentStitchDistance *
          numPoints *
          Math.sin((point / numPoints) * Math.PI * 2)) /
        (2 * Math.PI),
    };
  };

const getStitches = (
  stitchesPerRow: number,
  numberOfRows: number,
  decreaseType: "Hemispherical" | "Pyramidal"
): Stitch[] => {
  const knittingMachine = new KnittingMachine(stitchesPerRow);
  knittingMachine.castOnRow(generateCircle(stitchesPerRow)).join();
  for (let i = 1; i < numberOfRows - 1; i++) {
    knittingMachine.knitRow(["k1"]);
  }
  if (decreaseType == "Hemispherical") {
    knittingMachine.decreaseHemispherically(Math.floor(stitchesPerRow / 4));
  } else {
    knittingMachine.decreasePyramidically(5);
  }

  return knittingMachine.stitches;
};

export { getStitches };
