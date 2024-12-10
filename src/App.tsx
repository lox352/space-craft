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

  useEffect(() => {
    setStitches((oldStitches) => {
      console.log("Regenerating stitches");
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
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "rgb(20, 20, 20)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            position: "relative",
            flexDirection: "column",
          }}
        >
          <ChainModel
            stitches={stitches}
            triggerColouring={triggerColouring}
            resetTrigger={() => {
              console.log(
                `Resetting trigger from ${triggerColouring} to false`
              );
              setTriggerColouring(false);
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "-10%",
            }}
          >
            <KnittingPattern stitches={stitches} setStitches={setStitches} />
          </div>
        </div>
        <div className="responsive-container">
          <div className="first-range-control">
            <input
              type="range"
              min="50"
              max="200"
              value={stitchesPerRow}
              onChange={(e) => setStitchesPerRow(Number(e.target.value))}
            />
            <p>Stitches per row: {stitchesPerRow}</p>
          </div>
          <div className="last-range-control">
            <input
              type="range"
              min="1"
              max="50"
              value={numberOfRows}
              onChange={(e) => setNumberOfRows(Number(e.target.value))}
            />
            <p>Number of Rows: {numberOfRows}</p>
          </div>
          <button
            className="action-button"
            onClick={() => setTriggerColouring(true)}
          >
            Colour like the globe!
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
