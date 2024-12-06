import { BallCollider, RigidBody } from "@react-three/rapier";
import { Point } from "../types/point";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import React from "react";

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

const fragmentShader = `
  uniform sampler2D map;
  uniform vec3 color;
  varying vec2 vUv;

  void main() {
    vec4 texColor = texture2D(map, vUv);
    gl_FragColor = vec4(texColor.rgb * color, texColor.a);
  }
`;

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const texture = createChevronTexture();

const uniforms = {
  map: { value: texture },
  color: { value: new THREE.Color("blue") },
};

export default function PointMass({
  position,
  rigidBodyRef,
  fixed,
}: {
  position: Point;
  rigidBodyRef: React.RefObject<any>;
  fixed: boolean;
}) {

  useFrame(() => {
    if (rigidBodyRef.current) {
      const pos = rigidBodyRef.current.translation();
      const hslColor = new THREE.Color();
      hslColor.setHSL((pos.z + 10) / 2, 0.8, 0.5);
      uniforms.color.value.copy(hslColor);
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
      <sprite scale={4}>
        <shaderMaterial
          attach="material"
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </sprite>
    </RigidBody>
  );
}
