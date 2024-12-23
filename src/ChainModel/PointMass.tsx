import { BallCollider, RapierRigidBody, RigidBody } from "@react-three/rapier";
import { Point } from "../types/point";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { RGB } from "../PixelCanvas/PixelGrid";

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

export default function PointMass({
  position,
  rigidBodyRef,
  fixed,
  visible,
  colour,
  chevronTexture
}: {
  position: Point;
  rigidBodyRef: React.RefObject<RapierRigidBody>;
  fixed: boolean;
  visible: boolean;
  colour: RGB;
  chevronTexture: THREE.Texture;
}) {
  const meshRef = React.createRef<THREE.Mesh>();
  const materialRef = React.createRef<THREE.ShaderMaterial>();
  const instanceColor = useRef(
    new Float32Array([119 / 255, 159 / 255, 196 / 255])
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
