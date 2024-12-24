import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStitches } from "../helpers/stitches";
import { Stitch } from "../types/Stitch";
import { defaultNumberOfRows, defaultStitchesPerRow } from "../constants";

interface PatternProps {
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
}

const Design: React.FC<PatternProps> = ({ setStitches }) => {
  const navigate = useNavigate();

  const [stitchesPerRow, setStitchesPerRow] = useState(defaultStitchesPerRow);
  const [numberOfRows, setNumberOfRows] = useState(defaultNumberOfRows);

  const handleViewAndColour = () => {
    setStitches(getStitches(stitchesPerRow, numberOfRows));
    navigate("/space-craft/render");
  };

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Design</h1>
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
          backgroundColor: "#3f51b5",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onClick={handleViewAndColour}
      >
        View and Colour
      </button>
    </div>
  );
};

export default Design;
