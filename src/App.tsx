import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";

import React from "react";
import { Point } from "./types/point";
import { Stitch } from "./types/stitch";
import KnittingMachine from "./types/KnittingMachine";
import ChainModel from "./ChainModel/ChainModel";

const generateCircle =
  (numPoints: number) =>
  (point: number): Point => {
    return {
      x: (numPoints * Math.cos((point / numPoints) * Math.PI * 2)) / Math.PI,
      y: (point * 2) / numPoints,
      z: (numPoints * Math.sin((point / numPoints) * Math.PI * 2)) / Math.PI,
    };
  };

const getStitches = (
  stitchesPerRow: number,
  numberOfRows: number
): Stitch[] => {
  const knittingMachine = new KnittingMachine(stitchesPerRow);
  knittingMachine.castOnRow(generateCircle(stitchesPerRow)).join();
  for (let i = 0; i < numberOfRows; i++) {
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
  const numberOfRows = 30;
  const stitches = getStitches(stitchesPerRow, numberOfRows);
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <ChainModel stitches={stitches} />
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
