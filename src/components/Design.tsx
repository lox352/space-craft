import React, { useEffect, useState } from "react";
import { Stitch } from "../types/stitch";
import KnittingMachine from "../types/KnittingMachine";
import { Point } from "../types/point";
import { useNavigate } from "react-router-dom";

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

interface PatternProps {
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
}

const Design: React.FC<PatternProps> = ({ setStitches }) => {
  const navigate = useNavigate();

  const [stitchesPerRow, setStitchesPerRow] = useState(150);
  const [numberOfRows, setNumberOfRows] = useState(20);

  const handleViewAndColour = () => {
    setStitches(getStitches(stitchesPerRow, numberOfRows));
    navigate('/render');
  }

  return (
    <div style={{ textAlign: 'left', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Design</h1>
      <div>
        <label>
          Stitches per row
          <br />
          <input
            type="number"
            value={stitchesPerRow}
            onChange={(e) => setStitchesPerRow(Number(e.target.value))}
          />
        </label>
      </div>
      <div>
        <label>
          Number of rows before decreasing
          <br />
          <input
            type="number"
            value={numberOfRows}
            onChange={(e) => setNumberOfRows(Number(e.target.value))}
          />
        </label>
      </div>
      <button
        style={{
          backgroundColor: '#3f51b5',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={handleViewAndColour}
      >
        View and Colour
      </button>
    </div>
  );
};

export default Design;
