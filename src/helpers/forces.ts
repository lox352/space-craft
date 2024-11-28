import { type NodeObject } from "three-forcegraph";

const float = (alpha: number, nodes: NodeObject[], strength: number): void => {
  nodes.forEach((node) => {
    if (node.id === -1) return;
    if (node.vy === undefined) return;

    node.vy += alpha * alpha * strength;
  });
}

export { float };