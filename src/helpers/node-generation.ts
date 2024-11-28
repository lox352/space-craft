import { Point } from "../types/point"
import { type LinkObject, type NodeObject } from "three-forcegraph";
import { toNode } from "./node-object";

export const nodeDistance = 160;
const radius = (nodeCount: number) => nodeDistance / Math.sin(Math.PI / nodeCount);

const getPosition = (nodeNumber: number, nodesPerRow: number): Point => {
  const angle = (nodeNumber / nodesPerRow) * Math.PI * 2;
  const x = radius(nodesPerRow) * Math.cos(angle);
  const y = (nodeDistance * nodeNumber) / nodesPerRow;
  const z = radius(nodesPerRow) * Math.sin(angle);
  return { x, y, z }
}

const generateHelix = (numPoints: number): Point[] => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const newPoint = getPosition(i, numPoints);
    points.push(newPoint);
  }

  return points;
}

const getNextNode = (
  lastNode: NodeObject,
  lastLink: LinkObject,
  type: "k1" | "k2tog" | "join"
): { nextNode: NodeObject; nextLinks: LinkObject[] } => {
  const rowSize = (lastLink.source! as number) - (lastLink.target! as number)
  const nextId = (lastNode.id as number) + 1;
  const nextNode = toNode(getPosition(nextId, rowSize), nextId);

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