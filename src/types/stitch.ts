import { RGB } from "../PixelCanvas/PixelGrid";
import { Point } from "./point";
import { StitchType } from "./StitchType";

export interface Stitch {
  id: number;
  position: Point;
  links: number[];
  fixed: boolean;
  type: StitchType
  colour: RGB;
}