import React, { useEffect, useRef, useState } from "react";
import { Stitch } from "../types/stitch";
import { Canvas } from "@react-three/fiber";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import PointMass from "./PointMass";
import Link from "./Link";
import * as THREE from "three";
import { colourNode } from "../helpers/node-colouring";

const getStitchColour =
  (stitchRefs: React.MutableRefObject<React.RefObject<RapierRigidBody>[]>) =>
  (stitchRef: React.RefObject<RapierRigidBody>): THREE.Color => {
    if (!stitchRefs.current || !stitchRef.current)
      return new THREE.Color(0x000000);

    const maxY = stitchRefs.current.reduce((max, ref) => {
      const y = ref.current?.translation().y || 0;
      return y > max ? y : max;
    }, 0);

    const colour = colourNode(stitchRef.current.translation(), maxY);
    switch (colour) {
      case "blue":
        return new THREE.Color(0x0000ff);
      case "green":
        return new THREE.Color(0x00ff00);
      case "white":
        return new THREE.Color(0xffffff);
      case "black":
        return new THREE.Color(0x000000);
      default:
        return new THREE.Color(0xffffff); // Default to white if no match
    }
  };

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
  const setRefsVersion = useState(0)[1];

  const stitchRefs = useRef<React.RefObject<RapierRigidBody>[]>(
    stitches.map(() => React.createRef())
  );

  useEffect(() => {
    for (let i = stitchRefs.current.length; i < stitches.length; i++) {
      stitchRefs.current.push(React.createRef<RapierRigidBody>());
    }

    if (stitchRefs.current.length > stitches.length) {
      stitchRefs.current.splice(stitches.length);
    }

    stitches.forEach((stitch) => {
      const ref = stitchRefs.current[stitch.id];
      if (stitch.links.length <= 1) {
        if (ref && ref.current) {
          console.log(
            `Refs changed for ${stitch.id}, new position is ${stitch.position.x}, ${stitch.position.y}, ${stitch.position.z}`
          );
          ref.current.setTranslation(stitch.position, false); // Update position
          ref.current.setBodyType(1, false);
        }
      } else {
        if (ref && ref.current) {
          ref.current.setBodyType(0, false);
        }
      }
    });

    setRefsVersion((v) => v + (1 % 1000));
  }, [stitches, setRefsVersion]);

  // const worker = useRef(new Worker());

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas
        camera={{ position: [60, 15, 0] }}
        style={{ backgroundColor: "black" }}
      >
        <OrbitControls />
        <Physics gravity={[0, 9.81, 0]} timeStep="vary" paused={false}>
          {stitches.map((stitch) => {
            const stitchRef = stitchRefs.current[stitch.id];
            if (!stitchRef) return null;
            return (
              <PointMass
                key={stitch.id}
                rigidBodyRef={stitchRef}
                position={stitch.position}
                fixed={stitch.links.length <= 1}
                getStitchColour={getStitchColour(stitchRefs)}
                triggerColouring={triggerColouring}
                resetTrigger={resetTrigger}
                visible={stitch.id > 0}
              />
            );
          })}
          {stitches.flatMap((stitch) =>
            stitch.links.map((link) => {
              const stitchRef = stitchRefs.current[stitch.id];
              const linkedStitchRef = stitchRefs.current[link];
              if (!stitchRef || !linkedStitchRef) return null;
              return (
                <Link
                  key={`${stitch.id}-${link}`}
                  bodyA={stitchRef}
                  bodyB={linkedStitchRef}
                  maxLength={2}
                />
              );
            })
          )}
        </Physics>
      </Canvas>
    </div>
  );
};
// {stitch.links.map((link) => {
//   const linkedStitchRef = stitchRefs.current.get(link);
//   if (!linkedStitchRef) return null;
//   return (
//     <Link
//       key={`${stitch.id}-${link}`}
//       bodyA={stitchRef}
//       bodyB={linkedStitchRef}
//     />
//   );
// })}
export default ChainModel;
