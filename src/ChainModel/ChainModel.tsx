import React, { useEffect, useRef, useState } from "react";
import { Stitch } from "../types/stitch";
import { Canvas } from "@react-three/fiber";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import PointMass from "./PointMass";
import Link from "./Link";
import * as THREE from "three";
import { colourNode } from "../helpers/node-colouring";
import { RGB } from "../PixelCanvas/PixelGrid";

const getStitchColour =
  (stitchRefs: React.MutableRefObject<React.RefObject<RapierRigidBody>[]>) => 
  async (stitchRef: React.RefObject<RapierRigidBody>): Promise<THREE.Color> => {
    if (!stitchRefs.current || !stitchRef.current)
      return new THREE.Color(0x000000); // Black

    const maxY = stitchRefs.current.reduce((max, ref) => {
      const y = ref.current?.translation().y || 0;
      return y > max ? y : max;
    }, 0);

    const colour = await colourNode(stitchRef.current.translation(), maxY);
    return colour;
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

  useEffect(() => {
    if (triggerColouring) {
      (async () => {
        for (let i = 1; i < stitchRefs.current.length; i++) {
          const stitchRef = stitchRefs.current[i];
          if (!stitchRef.current) continue;
          const colour = await getStitchColour(stitchRefs)(stitchRef);
          const stitch = stitches[i];
          stitch.colour = [colour.r, colour.g, colour.b];
        }
        resetTrigger();
      })();
    }
  }, [triggerColouring, resetTrigger, stitches]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas
        camera={{ position: [80, 15, 0] }}
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
                visible={stitch.id > 0}
                colour={stitch.colour}
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

export default ChainModel;
