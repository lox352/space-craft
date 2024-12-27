import React from "react";
import { Stitch } from "../types/Stitch";
import KnittingPattern from "../KnittingPattern";
import { SavedPattern } from "../types/SavedPattern";

interface PatternProps {
  stitches: Stitch[];
}

const Pattern: React.FC<PatternProps> = ({ stitches }) => {
  const [patternSaved, setPatternSaved] = React.useState(false);
  const saveToLocalStorage = () => {
    const newId = `pattern-${Date.now().toString()}`;
    const savedPattern: SavedPattern = {
      id: newId,
      savedAt: new Date(),
      stitches,
      progress: 0,
    };
    localStorage.setItem(newId, JSON.stringify(savedPattern));
    window.location.hash = `#/pattern/${newId}`;
    setPatternSaved(true);
    alert(
      "Stitches saved to local storage! This pattern may be accessed at any time from the homepage."
    );
  };

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Hat Pattern</h1>
      <KnittingPattern stitches={stitches} />
      {!patternSaved && (
        <button
          style={{
            marginTop: "20px",
            backgroundColor: "#3f51b5",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={saveToLocalStorage}
        >
          Save Pattern
        </button>
      )}
    </div>
  );
};

export default Pattern;
