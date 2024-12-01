import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";
import { float } from "./helpers/forces";
import {
  generateHelix,
  getNextNode,
  nodeDistance,
} from "./helpers/node-generation";
import { toNode, fixNode } from "./helpers/node-object";
import { colourNode } from "./helpers/node-colouring";
import { LinkObject, NodeObject } from "three-forcegraph";
import * as THREE from "three";

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

    const links = nodes.map(
      (node, i) =>
        ({
          source: node.id,
          target: nodes[(i + 1) % nodes.length].id,
        } as LinkObject)
    );

    doStitch("join", nodes, links, stitchesPerRow);
    for (let i = 0; i < numberOfRows * stitchesPerRow; i++) {
      doStitch("k1", nodes, links, stitchesPerRow);
    }

    for (let i = 0; i < stitchesPerRow - 5; i++) {
      doStitch("k2tog", nodes, links, stitchesPerRow);
    }

    const graph = ForceGraph3D()(currentRef)
      .graphData({ nodes: nodes, links })
      .nodeAutoColorBy("id")
      .enableNodeDrag(false)
      .d3VelocityDecay(0.05);

    
    graph.d3Force("center", null);
    graph.d3Force("float-up", (alpha) => float(alpha, nodes, 5));
    graph.d3AlphaDecay(0.01);
    graph.nodeRelSize(nodeDistance);
    graph.linkWidth(20);
    graph.linkVisibility(false);
    graph.nodeResolution(1);
    graph.nodeThreeObject((foo) => {
      const sprite = new THREE.Sprite();
      sprite.scale.set(100, 100, 1);
      sprite.material = new THREE.SpriteMaterial({
        color: 0xffffff,
      });
      return sprite;
    });
    let engineStopped = false;
    graph.width(currentRef.clientWidth);
    graph.height(currentRef.clientHeight);
    graph.cooldownTicks(100);
    // graph.onEngineStop(() => graph.zoomToFit(40));
    //graph.onEngineStop(() => graph.nodeColor((node: NodeObject) => colourNode(node)));
    graph.onEngineStop(() => {
      if (engineStopped) return;
      console.log("Callback")
      graph.zoomToFit(100);
      graph.nodeThreeObject((node: NodeObject) => {
        const sprite = new THREE.Sprite();
        sprite.scale.set(100, 100, 1);
        sprite.material = new THREE.SpriteMaterial({
          color: colourNode(node, nodes),
        });
        return sprite;
      });
      engineStopped = true;
    });

    graph.d3Force("charge")?.strength((node: NodeObject) => {
      if (!node) return -30;

      const distanceFromYAxis = Math.sqrt(
        (node!.x as number) ** 2 + (node!.z as number) ** 2
      );

      if (distanceFromYAxis < 100) return 0;

      return -30;
    });

    graph.d3Force("y-axis-attraction", (alpha) => {
      nodes.forEach((node) => {
        if (!node) return;
        const distanceFromYAxis = Math.sqrt(
          (node.x as number) ** 2 + (node.z as number) ** 2
        );
        if (distanceFromYAxis > 100) return;
        const forceStrength = 100 * alpha; // Adjust the strength as needed
        node.vx! -= (node.x as number) * forceStrength;
        node.vz! -= (node.z as number) * forceStrength;
      });
    });

    graph
      .d3Force("link")
      ?.strength((link: any) => 1)
      ?.distance((link: LinkObject<NodeObject>) => {
        const source = link.source as NodeObject;
        if (!source) return nodeDistance;
        const distanceFromYAxis = Math.sqrt(
          (source!.x as number) ** 2 + (source!.z as number) ** 2
        );
        if (distanceFromYAxis < 100) return 0;
        return nodeDistance;
      });

    graph.cameraPosition(
      { x: 20000, y: 20000, z: 0 },
      { x: 0, y: numberOfRows * 80, z: 0 }
    );

    return () => {
      if (currentRef) {
        graph._destructor();
        currentRef.innerHTML = "";
      }
    };
  }, [stitchesPerRow, numberOfRows]);

  return <div ref={graphRef} style={{ width: "100%", height: "600px" }} />;
};

export default ForceGraph;

function doStitch(
  stitchType: "join" | "k1" | "k2tog",
  nodes: NodeObject[],
  links: LinkObject[],
  stitchesPerRow: number
) {
  const lastNode = nodes[nodes.length - 1];
  const lastLink = links[links.length - 1];
  const { nextNode, nextLinks } = getNextNode(
    lastNode,
    lastLink,
    stitchesPerRow,
    stitchType
  );
  nodes.push(nextNode);
  links.push(...nextLinks);
}
