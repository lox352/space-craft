import { Point } from "../types/Point";
import { NodeObject } from "three-forcegraph";

const toNode = (point: Point, id: number | string): NodeObject => {
  return {
    id,
    x: point.x,
    y: point.y,
    z: point.z
  };
}

const fixNode = (node: NodeObject): NodeObject => {
  node.fx = node.x;
  node.fy = node.y;
  node.fz = node.z;

  return node;
}

export { toNode, fixNode };