import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";
import { float } from "./helpers/forces";
import { generateHelix, getNextNode, nodeDistance } from "./helpers/node-generation";
import { toNode, fixNode } from "./helpers/node-object";
import { LinkObject, type NodeObject } from "three-forcegraph"

interface ForceGraphProps {
  stitchesPerRow: number;
  numberOfRows: number;
}

const ForceGraph = ({ stitchesPerRow, numberOfRows }: ForceGraphProps) => {
  const graphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = graphRef.current;
    if (!currentRef) return;

    const nodes = generateHelix(stitchesPerRow)
      .map((point, i) => toNode(point, i))
      .map((node: NodeObject) => fixNode(node));

    const links = nodes.map((node, i) => ({
      source: node.id,
      target: nodes[(i + 1) % nodes.length].id,
    } as LinkObject));

    doStitch("join", nodes, links);
    for (let i = 0; i < numberOfRows * stitchesPerRow; i++) {
      doStitch("k1", nodes, links);
    }

    for (let i = 0; i < stitchesPerRow -5; i++) {
      doStitch("k2tog", nodes, links);
    }

    const graph = ForceGraph3D()(currentRef)
      .graphData({ nodes: nodes, links })
      .nodeAutoColorBy("id");

    graph.d3Force("center", null);
    graph.d3Force("float-up", (alpha) => float(alpha, nodes, 0));
    graph.d3AlphaDecay(0.01);
    graph.nodeRelSize(nodeDistance);
    graph.linkWidth(20);

    graph.width(currentRef.clientWidth);
    graph.height(currentRef.clientHeight);

    graph.d3Force("link")?.strength((link: any) => 1)?.distance(link => nodeDistance);

    graph.cameraPosition({x: 0, y: 10000, z: 5000});

    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [stitchesPerRow, numberOfRows]);

  return <div ref={graphRef} style={{ width: "100%", height: "600px" }} />;
};

export default ForceGraph;

function doStitch(stitchType: "join" | "k1" | "k2tog", nodes: NodeObject[], links: LinkObject[]) {
  const lastNode = nodes[nodes.length - 1];
  const lastLink = links[links.length - 1];
  const { nextNode, nextLinks } = getNextNode(lastNode, lastLink, stitchType);
  nodes.push(nextNode);
  links.push(...nextLinks);
}

