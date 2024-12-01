import "./App.css";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BallCollider,
  Physics,
  RigidBody,
  useRopeJoint,
} from "@react-three/rapier";
import { Environment, Lightformer } from "@react-three/drei";

import React from "react";

function FixedPointMass({
  rigidBodyRef,
}: {
  rigidBodyRef: React.RefObject<any>;
}) {
  return (
    <RigidBody ref={rigidBodyRef} type="fixed" colliders={false}>
      <BallCollider args={[0.1]} />
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}

function MovablePointMass({
  position,
  rigidBodyRef,
}: {
  position: [number, number, number];
  rigidBodyRef: React.RefObject<any>;
}) {
  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      type="dynamic"
      mass={1}
      position={position}
    >
      <BallCollider args={[0.1]} />
      <mesh ref={rigidBodyRef}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
}

function Link({
  bodyA,
  bodyB,
  maxLength,
}: {
  bodyA: React.RefObject<any>;
  bodyB: React.RefObject<any>;
  maxLength: number;
}) {
  useRopeJoint(bodyA, bodyB, [
    [0, 0, 0], // Attach at the center of the fixed sphere
    [0, 0, 0], // Attach at the center of the movable sphere
    maxLength, // Maximum rope length
  ]);
  return null;
}

function App() {
  const fixedRef = React.useRef<any>(null);
  const movableRefs = Array.from({ length: 10 }, () => React.createRef<any>());

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Physics gravity={[0, 9.8, 0]}>
          {/* Fixed point mass */}
          <FixedPointMass rigidBodyRef={fixedRef} />

          {/* Movable point masses and links */}
          {movableRefs.map((ref, index) => (
            <React.Fragment key={index}>
              <MovablePointMass
                position={[0, 0, -0.5 * (index + 1)]}
                rigidBodyRef={ref}
              />
              {index === 0 ? (
                <Link bodyA={fixedRef} bodyB={ref} maxLength={0.5} />
              ) : (
                <Link
                  bodyA={movableRefs[index - 1]}
                  bodyB={ref}
                  maxLength={0.5}
                />
              )}
            </React.Fragment>
          ))}
        </Physics>
        <Environment resolution={256}>
          <group>
            <Lightformer
              form="circle"
              color="#4060ff"
              intensity={80}
              onUpdate={(self) => self.lookAt(0, 0, 0)}
              position={[10, 10, 0]}
              scale={10}
            />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}

export default App;

// function App() {
//   const [stitchesPerRow, setStitchesPerRow] = useState(144)
//   const [numberOfRows, setNumberOfRows] = useState(20)

//   return (

//     <>
//       <input
//       type="range"
//       min="50"
//       max="200"
//       value={stitchesPerRow}
//       onChange={(e) => setStitchesPerRow(Number(e.target.value))}
//       />
//       <p>Stitches per row: {stitchesPerRow}</p>
//       <input
//       type="range"
//       min="1"
//       max="100"
//       value={numberOfRows}
//       onChange={(e) => setNumberOfRows(Number(e.target.value))}
//       />
//       <p>Number of Rows: {numberOfRows}</p>
//       <ForceGraph stitchesPerRow={stitchesPerRow} numberOfRows={numberOfRows} />
//     </>
//   )
// }
