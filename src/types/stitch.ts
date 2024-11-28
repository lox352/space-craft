import { Point } from "./point";

export interface Stitch {
  id: number;
  position: Point;
  links: number[];
}