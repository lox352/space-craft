import React, { useEffect, useRef } from "react";
import { Stitch } from "../types/Stitch";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import StitchPhysics from "./StitchPhysics";
import * as THREE from "three";
import { verticalStitchDistance } from "../constants";

interface ChainModelProps {
  stitches: Stitch[];
  triggerColouring: boolean;
  resetTrigger: () => void;
}

const ChainModel: React.FC<ChainModelProps> = ({
  stitches,
  triggerColouring,
  resetTrigger,
}) => {
  const stitchesRef = useRef(stitches);
  const stitchesPerRow = stitches.filter(stitch => stitch.fixed).length;
  const roughHeight = verticalStitchDistance * stitches.length / stitchesPerRow;

  useEffect(() => {
    return () => {
      console.log("ChainModel has unmounted");
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, roughHeight / 2, 4 * stitchesPerRow / 5] }}
      style={{ backgroundColor: "rgb(30, 30, 30)" }}
      shadows={"basic"}
    >
      <OrbitControls target={new THREE.Vector3(0, 5 * roughHeight / 12, 0 )} />
      <Physics
        gravity={[0, 9.81, 0]}
        timeStep="vary"
        updateLoop="independent"
        numSolverIterations={20}
        paused={false}
      >
        <StitchPhysics
          stitchesRef={stitchesRef}
          triggerColouring={triggerColouring}
          resetTrigger={resetTrigger}
        />
      </Physics>
    </Canvas>
  );
};

export default ChainModel;
