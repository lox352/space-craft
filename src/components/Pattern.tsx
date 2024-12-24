import React from "react";
import { Stitch } from "../types/Stitch";
import KnittingPattern from "../KnittingPattern";

interface PatternProps {
  stitches: Stitch[];
}

const Pattern: React.FC<PatternProps> = ({ stitches }) => {
  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Hat Pattern
      </h1>
      <KnittingPattern stitches={stitches} />
    </div>
  );
};

export default Pattern;
