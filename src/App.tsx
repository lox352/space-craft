import "./App.css";

import { useEffect, useState } from "react";
import { Point } from "./types/point";
import { Stitch } from "./types/stitch";
import KnittingMachine from "./types/KnittingMachine";
import ChainModel from "./ChainModel/ChainModel";
import KnittingPattern from "./KnittingPattern";

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
  for (let i = 1; i < numberOfRows; i++) {
    knittingMachine.knitRow(["k1"]);
  }
  
  knittingMachine.decreaseHemispherically(Math.floor(stitchesPerRow / 4));

  return knittingMachine.stitches;
};

function App() {
  const [stitchesPerRow, setStitchesPerRow] = useState(150);
  const [numberOfRows, setNumberOfRows] = useState(20);
  const [stitches, setStitches] = useState<Stitch[]>(
    getStitches(stitchesPerRow, numberOfRows)
  );
  const [triggerColouring, setTriggerColouring] = useState(false);

  const handleColouring = () => {
    setTriggerColouring(true);
  };

  useEffect(() => {
    console.log("Regenerating stitches");
    setStitches((oldStitches) => {
      const newStitches = getStitches(stitchesPerRow, numberOfRows);
      newStitches.forEach((stitch, index) => {
        if (index < newStitches.length && oldStitches[index]) {
          stitch.colour = oldStitches[index].colour;
        }
      });
      return newStitches;
    });
  }, [stitchesPerRow, numberOfRows]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <input
        type="range"
        min="50"
        max="200"
        value={stitchesPerRow}
        onChange={(e) => setStitchesPerRow(Number(e.target.value))}
      />
      <p>Stitches per row: {stitchesPerRow}</p>
      <input
        type="range"
        min="1"
        max="100"
        value={numberOfRows}
        onChange={(e) => setNumberOfRows(Number(e.target.value))}
      />
      <p>Number of Rows: {numberOfRows}</p>
      <button onClick={handleColouring}>Apply Coloring</button>
      <div style={{ position: "relative" }}>
        {triggerColouring && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10,
              width: "100%",
              height: "100%",
            }}
          >
            <div className="spinner"></div>
          </div>
        )}
        <KnittingPattern stitches={stitches} setStitches={setStitches} />

        <ChainModel
          stitches={stitches}
          triggerColouring={triggerColouring}
          resetTrigger={() => setTriggerColouring(false)}
        />
      </div>
    </div>
  );
}

export default App;
