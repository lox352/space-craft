import "./App.css";
import { Canvas } from "@react-three/fiber";
import {
  BallCollider,
  Physics,
  RigidBody,
  useRopeJoint,
} from "@react-three/rapier";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";

import React from "react";
import { Point } from "./types/point";
import { Stitch } from "./types/stitch";
import * as THREE from "three";

function createChevronTexture() {
  const size = 1028; // Texture resolution
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Background (optional)
    ctx.clearRect(0, 0, size, size);

    // Draw downward-facing chevron
    ctx.beginPath();
    ctx.moveTo(size / 2, size * 0.9); // Bottom center (tip of the V)
    ctx.lineTo(size * 0.2, size * 0.3); // Left top
    ctx.lineTo(size * 0.5, size * 0.5); // Center bottom left
    ctx.lineTo(size * 0.8, size * 0.3); // Right top
    ctx.lineTo(size / 2, size * 0.9); // Back to bottom center
    ctx.closePath();
    ctx.fill();
  }

  return new THREE.CanvasTexture(canvas);
}

const texture = createChevronTexture();

function FixedPointMass({
  rigidBodyRef,
  position,
}: {
  rigidBodyRef: React.RefObject<any>;
  position: Point;
}) {
  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed"
      position={[position.x, position.y, position.z]}
      linearDamping={0.9}
      angularDamping={0.9}
    >
      <BallCollider args={[0.5]} />
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}

function MovablePointMass({
  position,
  rigidBodyRef,
}: {
  position: Point;
  rigidBodyRef: React.RefObject<any>;
}) {
  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      type="dynamic"
      mass={1}
      position={[position.x, position.y, position.z]}
      linearDamping={0.9}
      angularDamping={0.9}
    >
      <BallCollider args={[0.5]} />
      <sprite>
        <spriteMaterial map={texture} transparent={true} />
      </sprite>
    </RigidBody>
  );
}

function Link({
  bodyA,
  bodyB,
}: {
  bodyA: React.RefObject<any>;
  bodyB: React.RefObject<any>;
}) {
  useRopeJoint(bodyA, bodyB, [
    [0, 0, 0], // Attach at the center of the fixed sphere
    [0, 0, 0], // Attach at the center of the movable sphere
    2, // Maximum rope length
  ]);
  return null;
}

const generateCircle =
  (numPoints: number) =>
  (point: number): Point => {
    return {
      x: (numPoints * Math.cos((point / numPoints) * Math.PI * 2)) / Math.PI,
      y: (point * 2) / numPoints,
      z: (numPoints * Math.sin((point / numPoints) * Math.PI * 2)) / Math.PI,
    };
  };

type StitchType = "k1" | "k2tog" | "k3tog" | "join";

class KnittingMachine {
  private stitchesPerRow: number;
  stitches: Stitch[];

  constructor(stitchesPerRow: number) {
    this.stitches = [];
    this.stitchesPerRow = stitchesPerRow;
  }

  castOnRow(
    getStitchPosition: (stitchNumber: number) => Point
  ): KnittingMachine {
    for (let i = 0; i < this.stitchesPerRow; i++) {
      const links = i == 0 ? [] : [i - 1];
      const newStitch: Stitch = {
        id: i,
        position: getStitchPosition(i),
        links,
      };
      this.stitches.push(newStitch);
    }

    return this;
  }

  knitRow(pattern: StitchType[]): KnittingMachine {
    const lastStitchId = this.stitches[this.stitches.length - 1].id;
    let timesObservedInLinks = 0;
    let i = 0;

    while (timesObservedInLinks < 2) {
      const stitch = pattern[i % pattern.length];
      this.knit(stitch);
      const links = this.stitches[this.stitches.length - 1].links;
      if (links.some((link) => link === lastStitchId)) {
        timesObservedInLinks++;
      }
      i++;
    }

    return this;
  }

  knit(stitchType: StitchType): KnittingMachine {
    switch (stitchType) {
      case "k1":
        this.knit1();
        break;
      case "k2tog":
        this.knit2Tog();
        break;
      case "k3tog":
        this.knit3Tog();
        break;
      case "join":
        this.join();
        break;
    }

    return this;
  }

  knit1(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [stitchFromLastRow.id + 1, lastStitch.id],
    };
    this.stitches.push(newStitch);

    return this;
  }

  knit2Tog(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [
        stitchFromLastRow.id + 2,
        stitchFromLastRow.id + 1,
        lastStitch.id,
      ],
    };
    this.stitches.push(newStitch);

    return this;
  }

  knit3Tog(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const stitchFromLastRow = this.stitches[lastStitch.links[0]];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: stitchFromLastRow.position,
      links: [
        stitchFromLastRow.id + 3,
        stitchFromLastRow.id + 2,
        stitchFromLastRow.id + 1,
        lastStitch.id,
      ],
    };
    this.stitches.push(newStitch);

    return this;
  }

  join(): KnittingMachine {
    const lastStitch = this.stitches[this.stitches.length - 1];
    const newStitch: Stitch = {
      id: lastStitch.id + 1,
      position: lastStitch.position,
      links: [0, lastStitch.id],
    };
    this.stitches.push(newStitch);

    return this;
  }
}

const getStitches = (stitchesPerRow: number): Stitch[] => {
  const knittingMachine = new KnittingMachine(stitchesPerRow);
  knittingMachine.castOnRow(generateCircle(stitchesPerRow)).join();
  for (let i = 0; i < 30; i++) {
    knittingMachine.knitRow(["k1"]);
  }
  for (let i = 0; i < 5; i++) {
    knittingMachine.knitRow(["k1"]);
    knittingMachine.knitRow(["k1", "k1", "k1", "k3tog"]);
  }
  knittingMachine.knitRow(["k1", "k3tog"]);

  return knittingMachine.stitches;
};

function App() {
  const stitchesPerRow = 144;
  const stitchRefs = getStitches(stitchesPerRow).map((stitch) => {
    return { ref: React.createRef(), stitch };
  });

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Canvas camera={{ position: [60, 15, 0] }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />

        <Physics gravity={[0, 9.81, 0]}>
          {stitchRefs.map(({ ref, stitch }) => (
            <React.Fragment key={stitch.id}>
              {stitch.id < stitchesPerRow ? (
                <FixedPointMass
                  key={stitch.id}
                  rigidBodyRef={ref}
                  position={stitch.position}
                />
              ) : (
                <MovablePointMass
                  rigidBodyRef={ref}
                  position={stitch.position}
                />
              )}
              {stitch.links.map((link) => {
                const { ref: linkedRef, stitch: linkedStitch } =
                  stitchRefs[link];
                console.log(
                  `From ${stitch.id} to ${linkedStitch.id} at index ${link}`
                );
                return (
                  <Link
                    key={`${stitch.id}-${linkedStitch.id}}`}
                    bodyA={ref}
                    bodyB={linkedRef}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </Physics>
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer
              form="circle"
              intensity={100}
              rotation-x={Math.PI / 2}
              position={[0, 5, -9]}
              scale={2}
            />
            <Lightformer
              form="circle"
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, 1, -1]}
              scale={2}
            />
            <Lightformer
              form="circle"
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, -1, -1]}
              scale={2}
            />
            <Lightformer
              form="circle"
              intensity={2}
              rotation-y={-Math.PI / 2}
              position={[10, 1, 0]}
              scale={8}
            />
            <Lightformer
              form="ring"
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
