import React from "react";
import ChainModel from "../ChainModel/ChainModel";
import { Stitch } from "../types/Stitch";
import { useNavigate } from "react-router-dom";

interface RenderProps {
  stitches: Stitch[];
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
}

const Render: React.FC<RenderProps> = ({ stitches, setStitches }) => {
  const [simulationActive, setSimulationActive] = React.useState(false);
  const [simulationCompleted, setSimulationCompleted] = React.useState(false);
  const simulationRunCount = React.useRef(0);

  React.useEffect(() => {
    if (simulationActive) {
      simulationRunCount.current += 1;
    }

    if (simulationRunCount.current === 1 && !simulationActive) {
      setSimulationCompleted(true);
    }
  }, [simulationActive]);

  const navigate = useNavigate();

  const generatePattern = () => {
    navigate("/pattern");
  };

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Dying Your Hat
      </h1>
      <div style={{ height: "500px" }}>
        <ChainModel
          stitches={stitches}
          setStitches={setStitches}
          simulationActive={simulationActive}
          setSimulationActive={setSimulationActive}
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
        disabled={simulationActive}
        onClick={generatePattern}
      >
        {!simulationCompleted ? "Dying in progress..." : "Generate Pattern"}
      </button>
    </div>
  );
};

export default Render;
