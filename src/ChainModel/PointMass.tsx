import { BallCollider, RigidBody } from "@react-three/rapier";
import { Point } from "../types/point";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";

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
    ctx.moveTo(size / 2, size * 0.9); // Bottom center (tip of the V)
    ctx.lineTo(size * 0.2, size * 0.3); // Left top
    ctx.lineTo(size * 0.4, size * 0.3); // Left top
    ctx.lineTo(size * 0.5, size * 0.55); // Center bottom left
    ctx.lineTo(size * 0.6, size * 0.3); // Right top
    ctx.lineTo(size * 0.8, size * 0.3); // Right top
    ctx.lineTo(size / 2, size * 0.9); // Back to bottom center
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vColor;

  uniform vec3 instanceColor; // Per-instance color as uniform

  void main() {
    vUv = uv;
    vColor = instanceColor; // Pass the color to the fragment shader
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D map;
  varying vec2 vUv;
  varying vec3 vColor;

  void main() {
    vec4 texColor = texture2D(map, vUv);
    gl_FragColor = vec4(texColor.rgb * vColor, texColor.a); // Multiply texture by color
  }
`;

const chevronTexture = createChevronTexture();

export default function PointMass({
  position,
  rigidBodyRef,
  fixed,
}: {
  position: Point;
  rigidBodyRef: React.RefObject<any>;
  fixed: boolean;
}) {
  const spriteRef = useRef<any>();
  const materialRef = useRef<any>();
  const instanceColor = useRef(new Float32Array([1, 0, 0])); // Default red color

  useFrame(() => {
    if (rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation();
      const color = new THREE.Color();
      color.setHSL((pos.y + 10) / 20, 0.8, 0.5);

      instanceColor.current[0] = color.r;
      instanceColor.current[1] = color.g;
      instanceColor.current[2] = color.b;

      if (materialRef.current) {
        materialRef.current.uniforms.instanceColor.value =
          instanceColor.current;
      }

      if (spriteRef.current) {
        if (!spriteRef.current.logged) {
          console.log(spriteRef.current);
          spriteRef.current.logged = true;
        }
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      type={fixed ? "fixed" : "dynamic"}
      mass={1}
      position={[position.x, position.y, position.z]}
      linearDamping={0.9}
      angularDamping={0.9}
    >
      <BallCollider args={[0.5]} />
      <sprite scale={[4, 4, 1]} ref={spriteRef}>
        <shaderMaterial
          ref={materialRef}
          attach="material"
          uniforms={{
            map: { value: chevronTexture },
            instanceColor: { value: instanceColor.current },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent={true}
        />
      </sprite>
    </RigidBody>
  );
}
