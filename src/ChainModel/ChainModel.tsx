import React from "react";
import { Stitch } from "../types/stitch";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import PointMass from "./PointMass";
import Link from "./Link";

interface ChainModelProps {
  stitches: Stitch[];
}

const ChainModel: React.FC<ChainModelProps> = ({ stitches }) => {
  const stitchRefs = stitches.map((stitch) => ({
    ref: React.createRef<never>(),
    stitch,
  }));

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas
        camera={{ position: [60, 15, 0] }}
        style={{ backgroundColor: "white" }}
      >
        <OrbitControls />
        <Physics gravity={[0, 9.81, 0]} timeStep="vary" paused={false}>
          {stitchRefs.map(({ ref, stitch }) => (
            <React.Fragment key={stitch.id}>
              <PointMass
                key={stitch.id}
                rigidBodyRef={ref}
                position={stitch.position}
                fixed={stitch.links.length <= 1}
              />
              {stitch.links.map((link) => {
                const { ref: linkedRef, stitch: linkedStitch } =
                  stitchRefs[link];
                return (
                  <Link
                    key={`${stitch.id}-${linkedStitch.id}}`}
                    bodyA={ref}
                    bodyB={linkedRef}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </Physics>
      </Canvas>
    </div>
  );
};

export default ChainModel;
