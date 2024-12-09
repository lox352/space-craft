import { BallCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Point } from "../types/point";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { RGB } from "../PixelCanvas/PixelGrid";

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
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vColor;

  uniform vec3 instanceColor; // Per-instance color as uniform

  void main() {
    vUv = uv;
    vColor = instanceColor; // Pass the color to the fragment shader
    // Apply model-view and projection matrix to the sprite (keeping rotation fixed)
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
  visible,
  colour,
}: {
  position: Point;
  rigidBodyRef: React.RefObject<RapierRigidBody>;
  fixed: boolean;
  visible: boolean;
  colour: RGB;
}) {
  const meshRef = React.createRef<THREE.Mesh>();
  const materialRef = React.createRef<THREE.ShaderMaterial>();
  const instanceColor = useRef(
    new Float32Array([colour[0] / 255, colour[1] / 255, colour[2] / 255])
  );

  useEffect(() => {
    if (!instanceColor.current) return;
        instanceColor.current[0] = colour[0] / 255;
        instanceColor.current[1] = colour[1] / 255;
        instanceColor.current[2] = colour[2] / 255;
  }, [colour]);

  useFrame(() => {
    if (rigidBodyRef.current) {
      if (materialRef.current) {
        materialRef.current.uniforms.instanceColor.value =
          instanceColor.current;
      }

      if (meshRef.current) {
        meshRef.current.lookAt(new THREE.Vector3(0, 0, 0)); // Target point (0, 0, 0) or you can change it
      }
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      collisionGroups={0b0010} // Assign to a specific group
      type={fixed ? "fixed" : "dynamic"}
      position={[position.x, position.y, position.z]}
      linearDamping={0.9}
      angularDamping={0.9}
    >
      <BallCollider args={[0.02]} />
      {visible && (
        <mesh scale={2} ref={meshRef}>
          <planeGeometry args={[1, 1]} />
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
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </RigidBody>
  );
}
