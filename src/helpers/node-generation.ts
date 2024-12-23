import { Point } from "../types/Point"
import { type LinkObject, type NodeObject } from "three-forcegraph";
import { toNode } from "./node-object";

export const nodeDistance = 160;
const radius = (nodeCount: number) => nodeDistance / Math.sin(Math.PI / nodeCount);

const getPosition = (nodeNumber: number, currentNodesPerRow: number, originalNodesPerRow: number): Point => {
  const angle = (nodeNumber / originalNodesPerRow) * Math.PI * 2;
  const x = radius(currentNodesPerRow) * Math.cos(angle);
  const y = (nodeDistance * nodeNumber) / originalNodesPerRow;
  const z = radius(currentNodesPerRow) * Math.sin(angle);
  return { x, y, z }
}

const generateHelix = (numPoints: number): Point[] => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const newPoint = getPosition(i, numPoints, numPoints);
    points.push(newPoint);
  }

  return points;
}

const getNextNode = (
  lastNode: NodeObject,
  lastLink: LinkObject,
  stitchesPerRow: number,
  type: "k1" | "k2tog" | "join"
): { nextNode: NodeObject; nextLinks: LinkObject[] } => {
  const currentStitckesPerRow = (lastLink.source as number) - (lastLink.target as number);
  const nextId = (lastNode.id as number) + 1;
  const nextNode = toNode(getPosition(nextId, currentStitckesPerRow, stitchesPerRow), nextId);

  let nextLinks: LinkObject[] = [];

  switch (type) {
    case "k1":
      nextLinks = [
        { source: nextId, target: lastNode.id },
        { source: nextId, target: (lastLink.target! as number) + 1 },
      ];
      break;
    case "k2tog":
      nextLinks = [
        { source: nextId, target: lastNode.id },
        { source: nextId, target: (lastLink.target! as number) + 1 },
        { source: nextId, target: (lastLink.target! as number) + 2 },
      ];
      break;
    case "join":
      nextLinks = [
        { source: nextId, target: lastNode.id },
        { source: nextId, target: (lastLink.target! as number) },
      ];
      break;
    default:
      break;
  }

  return { nextNode, nextLinks };
};

export { generateHelix, getNextNode };