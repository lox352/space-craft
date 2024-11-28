import { useEffect, useRef } from "react";
import ForceGraph3D from "3d-force-graph";

interface ForceGraphProps {
  nodeCount: number;
}

const ForceGraph = ({ nodeCount }: ForceGraphProps) => {
  const graphRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const currentRef = graphRef.current;
    if (!currentRef) return;

    const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: i }));
    const links = Array.from({ length: nodeCount - 1 }, (_, j) => ({
      source: j,
      target: j + 1,
    }));

    const graph = ForceGraph3D()(currentRef)
      .graphData({ nodes, links })
      .nodeAutoColorBy("id")
      .linkWidth(1);

    graph.width(currentRef.clientWidth);
    graph.height(currentRef.clientHeight);

    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [nodeCount]);

  return <div ref={graphRef} style={{ width: "100%", height: "600px" }} />;
};

export default ForceGraph;
