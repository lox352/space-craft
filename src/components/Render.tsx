import React, { useCallback } from "react";
import ChainModel from "../ChainModel/ChainModel";
import { Stitch } from "../types/stitch";

interface RenderProps {
  stitches: Stitch[];
  triggerColouring: boolean;
  setTriggerColouring: React.Dispatch<React.SetStateAction<boolean>>;
}

const Render: React.FC<RenderProps> = ({
  stitches,
  triggerColouring,
  setTriggerColouring,
}) => {
  const resetTrigger = () => {
    console.log("Colouring finished");
    setTriggerColouring(false);
  };

  const handleApplyColouring = () => {
    console.log("Colouring started");

    setTriggerColouring(true);
  };

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Dying Your Hat
      </h1>
      <div style={{ height: "500px" }}>
        <ChainModel
          stitches={stitches}
          triggerColouring={triggerColouring}
          resetTrigger={resetTrigger}
        />
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
        onClick={handleApplyColouring}
      >
        Apply Colouring
      </button>
    </div>
  );
};

export default Render;
