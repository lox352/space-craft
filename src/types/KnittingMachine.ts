import { Point } from "./Point";
import { Stitch } from "./Stitch";
import { StitchType } from "./StitchType";
import { RGB } from "../types/RGB";
import { adjacentStitchDistance, verticalStitchDistance } from "../constants";
import seedrandom from "seedrandom";

const defaultColour: RGB = [255, 255, 255];

class KnittingMachine {
  private stitchesPerRow: number;
  private rng: () => number;
  stitches: Stitch[];

  constructor(stitchesPerRow: number) {
    this.rng = seedrandom(stitchesPerRow.toString())
    this.stitches = [];
    this.stitchesPerRow = stitchesPerRow;
  }

  castOnRow(
    getStitchPosition: (stitchNumber: number) => Point
  ): KnittingMachine {
    for (let i = 0; i < this.stitchesPerRow; i++) {
      const links = i == 0 ? [] : [i - 1];
      const newStitch: Stitch = {
        id: i,
        position: getStitchPosition(i),
        links,
        fixed: true,
        colour: defaultColour,
        type: "k1",
      };
      this.stitches.push(newStitch);
    }

    return this;
  }

  knitRow(pattern: StitchType[]): KnittingMachine {
    const numberOfStitchesInRow = this.numberOfStitchesInRow();
    const numberOfTimesToKnitPattern = Math.floor(
      numberOfStitchesInRow / pattern.length
    );
    for (let i = 0; i < numberOfTimesToKnitPattern; i++) {
      this.knitPattern(pattern);
    }

    return this;
  }

  knit(stitchType: StitchType): KnittingMachine {
    switch (stitchType) {
      case "k1":
        this.knit1();
        break;
      case "k2tog":
        this.knit2Tog();
        break;
      case "k3tog":
        this.knit3Tog();
        break;
      case "join":
        this.join();
        break;
    }

    return this;
  }

  knit1(): KnittingMachine {
    const stitchesInCurrentRow = this.numberOfStitchesInRow();
    const lastStitch = this.stitches[this.stitches.length - 1];

    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const links = [stitchFromLastRow.id + 1, lastStitch.id];

    const linkedStitch = this.stitches[links[0]];
    const radiusScaleFactor = ((adjacentStitchDistance * stitchesInCurrentRow) / (2 * Math.PI)) / (linkedStitch.position.x ** 2 + linkedStitch.position.z ** 2) ** 0.5;
    const newPosition = {
      y: linkedStitch.position.y + verticalStitchDistance,
      x: linkedStitch.position.x * radiusScaleFactor,
      z: linkedStitch.position.z * radiusScaleFactor,
    };

    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: newPosition,
      links: links,
      type: "k1",
      fixed: false,
      colour: defaultColour,
    };

    this.stitches.push(newStitch);

    return this;
  }

  knit2Tog(): KnittingMachine {
    const stitchesInCurrentRow = this.numberOfStitchesInRow() - 1;
    const lastStitch = this.stitches[this.stitches.length - 1];

    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const links = [
      stitchFromLastRow.id + 2,
      stitchFromLastRow.id + 1,
      lastStitch.id,
    ];

    const linkedStitch = this.stitches[links[1]];
    const radiusScaleFactor = ((adjacentStitchDistance * stitchesInCurrentRow) / (2 * Math.PI)) / (linkedStitch.position.x ** 2 + linkedStitch.position.z ** 2) ** 0.5;
    const newPosition = {
      y: linkedStitch.position.y + verticalStitchDistance,
      x: linkedStitch.position.x * radiusScaleFactor,
      z: linkedStitch.position.z * radiusScaleFactor,
    };

    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: newPosition,
      links: links,
      type: "k2tog",
      fixed: false,
      colour: defaultColour,
    };

    this.stitches.push(newStitch);

    return this;
  }

  knit3Tog(): KnittingMachine {
    const stitchesInCurrentRow = this.numberOfStitchesInRow() - 2;
    const lastStitch = this.stitches[this.stitches.length - 1];

    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const links = [
      stitchFromLastRow.id + 3,
      stitchFromLastRow.id + 2,
      stitchFromLastRow.id + 1,
      lastStitch.id,
    ];

    const linkedStitch = this.stitches[links[1]];
    const radiusScaleFactor = ((adjacentStitchDistance * stitchesInCurrentRow) / (2 * Math.PI)) / (linkedStitch.position.x ** 2 + linkedStitch.position.z ** 2) ** 0.5;
    const newPosition = {
      y: linkedStitch.position.y + verticalStitchDistance,
      x: linkedStitch.position.x * radiusScaleFactor,
      z: linkedStitch.position.z * radiusScaleFactor,
    };

    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: newPosition,
      links: links,
      type: "k3tog",
      fixed: false,
      colour: defaultColour,
    };

    this.stitches.push(newStitch);

    return this;
  }

  join(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: lastStitch.position,
      links: [0, lastStitch.id],
      type: "join",
      fixed: true,
      colour: defaultColour,
    };
    this.stitches.push(newStitch);

    return this;
  }

  public decreaseHemispherically(decreaseDistance: number): KnittingMachine {
    for (let i = 0; i < decreaseDistance; i++) {
      this.decreaseOneRowHemispherically(i, decreaseDistance);
    }

    return this;
  }

  private knitPattern(pattern: StitchType[]): void {
    pattern.forEach((stitchType) => {
      this.knit(stitchType);
    });
  }

  private decreaseOneRowHemispherically(
    rowIndex: number,
    decreaseDistance: number
  ): void {
    const targetRowCount = Math.ceil(
      this.stitchesPerRow *
        Math.cos((rowIndex + 0.5) * (Math.PI / 2 / decreaseDistance))
    );

    const currentRowCount = this.numberOfStitchesInRow();
    if (currentRowCount <= 12) {
      return;
    }

    const stitchesToRemove = currentRowCount - targetRowCount;

    if (stitchesToRemove < 2) {
      this.knitRow(["k1"]);
      return;
    }
    
    const segmentLength = Math.floor(currentRowCount / (stitchesToRemove / 2));
    const randomIndex = Math.floor(this.rng() * (segmentLength));
    const segment: StitchType[] = Array.from(
      { length: randomIndex },
      () => "k1"
    );
    segment.push("k3tog");
    for (let i = 0; i < segmentLength - randomIndex - 1; i++) {
      segment.push("k1");
    }

    this.knitRow(segment);
  }

  private numberOfStitchesInRow(): number {
    const finalStitch = this.stitches[this.stitches.length - 1];
    return finalStitch.id - this.stitches[finalStitch.links[0]].id;
  }
}

export default KnittingMachine;
