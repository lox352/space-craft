import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useSphere, useDistanceConstraint } from '@react-three/cannon';

// Constants
const CHAIN_LENGTH = 10; // Number of point masses in the chain
const GRAVITY = -9.8;

// Component for a point mass
function PointMass({ position }: { position: [number, number, number] }) {
  const [ref] = useSphere(() => ({
    mass: 1, // Give it some mass
    position,
    args: [0.1], // Radius of the sphere
  }));
  return (
    <mesh ref={ref}>
      <sphereBufferGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
}

// Component for a link
function Link({ bodyA, bodyB }: { bodyA: React.MutableRefObject<any>; bodyB: React.MutableRefObject<any> }) {
  useDistanceConstraint(bodyA, bodyB, { distance: 1 }); // Fix the distance between the two masses
  return null;
}

// Component for the chain
function Chain() {
  const masses = useRef([]);
  const positions = Array.from({ length: CHAIN_LENGTH }, (_, i) => [0, -i, 0] as [number, number, number]);

  return (
    <>
      {positions.map((pos, i) => (
        <PointMass key={i} position={pos} ref={(el) => (masses.current[i] = el)} />
      ))}
      {positions.map((_, i) =>
        i > 0 ? <Link key={i} bodyA={masses.current[i - 1]} bodyB={masses.current[i]} /> : null
      )}
    </>
  );
}

// Main App
export default function ChainSimulation() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
