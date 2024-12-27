import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SavedPattern as Pattern } from "../types/SavedPattern";
import ChainModel from "../ChainModel/ChainModel";

const SavedRender: React.FC = () => {
  const navigate = useNavigate();
  const [loadingPattern, setLoadingPattern] = React.useState(false);

  const params = useParams();
  const patternId = params.patternId;
  if (!patternId) {
    return "Could not find pattern";
  }
  const patternJson = localStorage.getItem(patternId);
  if (!patternJson) {
    return "Could not find pattern";
  }
  const pattern: Pattern = JSON.parse(patternJson);
  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Pre-dyed Hat</h1>
      <div style={{ height: "350px" }}>
        <ChainModel stitches={pattern.stitches} simulationActive={false} />
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
        onClick={() => {
          setLoadingPattern(true);
          navigate(`/pattern/${patternId}`);
        }}
      >
        {loadingPattern ? "Pattern loading..." : "Go to Pattern"}
      </button>
    </div>
  );
};

export default SavedRender;
