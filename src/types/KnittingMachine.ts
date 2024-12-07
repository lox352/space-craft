import { Point } from "./types/point";
import { Stitch } from "./types/stitch";

type StitchType = "k1" | "k2tog" | "k3tog" | "join";

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
      };
      this.stitches.push(newStitch);
    }

    return this;
  }

  knitRow(pattern: StitchType[]): KnittingMachine {
    const lastStitchId = this.stitches[this.stitches.length - 1].id;
    let timesObservedInLinks = 0;
    let i = 0;

    while (timesObservedInLinks < 2) {
      const stitch = pattern[i % pattern.length];
      this.knit(stitch);
      const links = this.stitches[this.stitches.length - 1].links;
      if (links.some((link) => link === lastStitchId)) {
        timesObservedInLinks++;
      }
      i++;
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
    };
    this.stitches.push(newStitch);

    return this;
  }
}

export default KnittingMachine;