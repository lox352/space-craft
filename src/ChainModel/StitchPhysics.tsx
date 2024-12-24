import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import PointMass from "./PointMass";
import Link from "./Link";
import { RapierRigidBody } from "@react-three/rapier";
import { Stitch } from "../types/Stitch";
import { colourNode } from "../helpers/node-colouring";
import * as THREE from "three";
import { RGB } from "../types/RGB";
import { adjacentStitchDistance, verticalStitchDistance } from "../constants";
import { useFrame } from "@react-three/fiber";

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

const geometry = new THREE.PlaneGeometry(1, 1);
const chevronTexture = createChevronTexture();

const getStitchColour =
  (maxY: number) =>
  async (stitchRef: React.RefObject<RapierRigidBody>): Promise<RGB> => {
    if (!stitchRef.current) return [0, 0, 0]; // Black

    const colour = await colourNode(stitchRef.current.translation(), maxY);
    return colour;
  };

interface StitchPhysicsProps {
  stitchesRef: React.MutableRefObject<Stitch[]>;
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
  simulationActive: boolean;
  setSimulationActive: React.Dispatch<React.SetStateAction<boolean>>;
}

const StitchPhysics: React.FC<StitchPhysicsProps> = ({
  stitchesRef,
  setStitches,
  simulationActive,
  setSimulationActive
}) => {
  const setRefsVersion = useState(0)[1];
  const frameNumber = useRef(0);
  const stitches = stitchesRef.current;

  const stitchRefs = useRef<React.RefObject<RapierRigidBody>[]>(
    stitches.map(() => React.createRef())
  );

  const colourRefs = useRef<React.MutableRefObject<Float32Array>[]>(
    stitches.map((stitch) => {
      const ref = React.createRef() as MutableRefObject<Float32Array>;
      if (!ref.current) {
        ref.current = new Float32Array([
          stitch.colour[0] / 255,
          stitch.colour[1] / 255,
          stitch.colour[2] / 255,
        ]);
      }
      return ref;
    })
  );

  useFrame(() => {
    if (frameNumber.current === 0) { setSimulationActive(true); }
    if (!simulationActive) return;
    frameNumber.current++;
    // Check velocities of all rigid bodies
    let totalMotion = 0;
    stitchRefs.current.forEach((stitchRef) => {
      const velocity = stitchRef.current?.linvel();
      const motionChange = velocity
        ? Math.abs(velocity.x) + Math.abs(velocity.y) + Math.abs(velocity.z)
        : 0;
      totalMotion += motionChange;
    });

    // Stop simulation if total motion is below a threshold
    const threshold = 0.8 * stitchRefs.current.length;
    if (totalMotion > threshold || frameNumber.current < 10) {
      console.log(
        `Total motion: ${totalMotion} and frame number: ${frameNumber.current}. Threshold: ${threshold}`
      );
      return;
    }

    console.log("Simulation stopped");

    setSimulationActive(false);
    (async () => {
      const maxY = stitchRefs.current.reduce((max, ref) => {
        const y = ref.current?.translation().y || 0;
        return y > max ? y : max;
      }, 0);

      for (let i = 1; i < stitchRefs.current.length; i++) {
        const stitchRef = stitchRefs.current[i];
        if (!stitchRef.current) continue;
        const colourRef = colourRefs.current[i];
        if (!colourRef.current) continue;

        const colour = await getStitchColour(maxY)(stitchRef);
        setStitches((stitches) =>
          stitches.map((stitch) =>
            stitch.id === i ? { ...stitch, colour } : stitch
          )
        );
        colourRef.current[0] = colour[0] / 255;
        colourRef.current[1] = colour[1] / 255;
        colourRef.current[2] = colour[2] / 255;
      }
      console.log("Colouring finished");
    })();
  });

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
    return () => {
      chevronTexture.dispose();
      geometry.dispose();
      console.log("StitchPhysics has unmounted");
    };
  }, []);

  return (
    <React.Fragment>
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
            colourRef={colourRefs.current[stitch.id]}
            chevronTexture={chevronTexture}
            geometry={geometry}
          />
        );
      })}
      {stitches.flatMap((stitch) =>
        stitch.links.map((link) => {
          const stitchRef = stitchRefs.current[stitch.id];
          const linkedStitchRef = stitchRefs.current[link];
          if (!stitchRef || !linkedStitchRef) return null;
          const stitchLength =
            stitch.id - link === 1
              ? adjacentStitchDistance
              : verticalStitchDistance;
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
    </React.Fragment>
  );
};

export default StitchPhysics;
