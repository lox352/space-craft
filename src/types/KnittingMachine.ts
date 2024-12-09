import { Point } from "./point";
import { Stitch } from "./stitch";
import { StitchType } from "./StitchType";
import { RGB } from "../types/RGB";

const defaultColour: RGB = [255, 255, 255];

class KnittingMachine {
  private stitchesPerRow: number;
  stitches: Stitch[];

  constructor(stitchesPerRow: number) {
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
    // console.log(`Number of stitches in row: ${numberOfStitchesInRow}`);
    const numberOfTimesToKnitPattern = Math.floor(
      numberOfStitchesInRow / pattern.length
    );
    // console.log(`Number of times to knit pattern: ${numberOfTimesToKnitPattern}`);
    for (let i = 0; i < numberOfTimesToKnitPattern; i++) {
      // console.log(`Knitting pattern ${i + 1} of ${numberOfTimesToKnitPattern}`);
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
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [stitchFromLastRow.id + 1, lastStitch.id],
      type: "k1",
      fixed: false,
      colour: defaultColour,
    };
    this.stitches.push(newStitch);

    return this;
  }

  knit2Tog(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [
        stitchFromLastRow.id + 2,
        stitchFromLastRow.id + 1,
        lastStitch.id,
      ],
      type: "k2tog",
      fixed: false,
      colour: defaultColour,
    };
    this.stitches.push(newStitch);

    return this;
  }

  knit3Tog(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [
        stitchFromLastRow.id + 3,
        stitchFromLastRow.id + 2,
        stitchFromLastRow.id + 1,
        lastStitch.id,
      ],
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
    console.log(
      `Decrease row ${rowIndex} is targetting ${targetRowCount} stitches`
    );
    const currentRowCount = this.numberOfStitchesInRow();
    console.log(`Current row has ${currentRowCount} stitches`);
    if (currentRowCount <= 12) {
      return;
    }
    const stitchesToRemove = currentRowCount - targetRowCount;
    console.log(`Removing ${stitchesToRemove} stitches`);
    if (stitchesToRemove <= 0) {
      return;
    }
    const segmentLength = Math.ceil((currentRowCount / stitchesToRemove) / 2);
    console.log(`Segment length is ${segmentLength}`);
    const segment: StitchType[] = Array.from({ length: segmentLength - 1 }, () => "k1")

    segment.push("k3tog");
    console.log(`Knitting a row with repeats of stitch types: ${segment}`);

    this.knitRow(segment);

    const newStitchesInRow = this.numberOfStitchesInRow();
    console.log(`Was aiming for ${targetRowCount} stitches, and got ${newStitchesInRow}`);
  }

  private numberOfStitchesInRow(): number {
    const finalStitch = this.stitches[this.stitches.length - 1];
    return finalStitch.id - this.stitches[finalStitch.links[0]].id;
  }
}

export default KnittingMachine;
