import React, { useEffect, useRef, useState } from "react";
import { Stitch } from "../types/stitch";
import { Canvas } from "@react-three/fiber";
import { Physics, RapierRigidBody } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import PointMass from "./PointMass";
import Link from "./Link";
import * as THREE from "three";
import { colourNode } from "../helpers/node-colouring";

function createChevronTexture() {
  const size = 256; // Texture resolution
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Background (optional)
    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "white";

    // Draw downward-facing chevron
    ctx.beginPath();
    ctx.moveTo(size / 2, size * 1); // Bottom center (tip of the V)
    ctx.lineTo(size * 0, size * 0); // Left top
    ctx.lineTo(size * 0.25, size * 0); // Left top
    ctx.lineTo(size * 0.5, size * 0.5); // Center bottom left
    ctx.lineTo(size * 0.75, size * 0); // Right top
    ctx.lineTo(size * 1, size * 0); // Right top
    ctx.lineTo(size / 2, size * 1); // Back to bottom center
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

const chevronTexture = createChevronTexture();

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
        console.log("Colouring finished");
        resetTrigger();
      })();
    }
  }, [triggerColouring, resetTrigger, stitches]);

  return (
    <Canvas
      camera={{ position: [0, 100, 100] }}
      style={{ backgroundColor: "rgb(20, 20, 20)" }}
    >
      <OrbitControls />
      <Physics
        gravity={[0, 5, 0]}
        timeStep="vary"
        paused={false}
        updateLoop="independent"
      >
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
              chevronTexture={chevronTexture}
            />
          );
        })}
        {stitches.flatMap((stitch) =>
          stitch.links.map((link) => {
            const stitchRef = stitchRefs.current[stitch.id];
            const linkedStitchRef = stitchRefs.current[link];
            if (!stitchRef || !linkedStitchRef) return null;
            const stitchLength = stitch.id - link === 1 ? 2 : 1.5;
            // console.log(`Connecting ${stitch.id} to ${link} using rope length ${stitchLength}`);
            //const stitchLength = 2;
            return (
              <Link
                key={`${stitch.id}-${link}`}
                bodyA={stitchRef}
                bodyB={linkedStitchRef}
                maxLength={stitchLength}
              />
            );
          })
        )}
      </Physics>
    </Canvas>
  );
};

export default ChainModel;
