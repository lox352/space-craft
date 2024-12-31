import React from "react";
import { useParams } from "react-router-dom";
import { SavedPattern as Pattern} from "../types/SavedPattern";
import KnittingPattern from "../KnittingPattern";

const SavedPattern: React.FC = () => {
  const patternId = useParams().patternId;
  if (!patternId) {
    return "Could not find pattern";
  }

  const savedPattern = localStorage.getItem(`pattern-${patternId}`);
  if (!savedPattern) {
    return "Could not find pattern";
  }

  const pattern = JSON.parse(savedPattern) as Pattern;
  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Saved Pattern
      </h1>
      <KnittingPattern stitches={pattern.stitches} />
    </div>
  );
};

export default SavedPattern;
