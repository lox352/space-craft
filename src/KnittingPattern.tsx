import React from "react";
import { Stitch } from "./types/stitch";

interface KnittingPatternProps {
  stitches: Stitch[];
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
}

const KnittingPattern: React.FC<KnittingPatternProps> = ({ stitches }) => {
  const stitchPositions: { [id: number]: { row: number; col: number } } = {};
  const filteredStitches = stitches.filter((stitch) => stitch.id !== 0);
  filteredStitches.forEach((stitch, index) => {
    if (index === 0) {
      stitchPositions[stitch.id] = { row: 0, col: 0 };
      return;
    }

    const linksToConsider = stitch.links.filter((id) => id !== 0).slice(0, -1);

    if (linksToConsider.length === 0) {
      const linkedStitchPos =
        stitchPositions[stitch.links[stitch.links.length - 1]];

      stitchPositions[stitch.id] = {
        row: linkedStitchPos.row,
        col: linkedStitchPos.col - 1,
      };
    } else {
      const middleIndex = Math.floor(linksToConsider.length / 2);
      const middleLink = linksToConsider[middleIndex];
      const middleLinkPos = stitchPositions[middleLink];
      stitchPositions[stitch.id] = {
        row: middleLinkPos.row - 1,
        col: middleLinkPos.col,
      };
    }
  });

  // Create the grid dimensions
  const minRow = Math.min(
    ...Object.values(stitchPositions).map((pos) => pos.row)
  );
  const maxRow = Math.max(
    ...Object.values(stitchPositions).map((pos) => pos.row)
  );
  const minCol = Math.min(
    ...Object.values(stitchPositions).map((pos) => pos.col)
  );
  const maxCol = Math.max(
    ...Object.values(stitchPositions).map((pos) => pos.col)
  );

  const numRows = maxRow - minRow + 1;
  const numCols = maxCol - minCol + 1;

  // Adjust positions to align to the grid
  const normalizedPositions = Object.fromEntries(
    Object.entries(stitchPositions).map(([id, pos]) => [
      id,
      { row: pos.row - minRow, col: pos.col - minCol },
    ])
  );

  // Render the grid
  return (
    <div
      style={{
      display: "grid",
      gridTemplateRows: `repeat(${numRows}, 1fr`,
      gridTemplateColumns: `repeat(${numCols}, 10px`,
      gap: "0px",
      minHeight: "30vh",
      overflow: "auto"
      }}
    >
      {filteredStitches.map((stitch) => {
      const position = normalizedPositions[stitch.id];
      return (
        <div
        key={stitch.id}
        style={{
          gridRow: position.row + 1,
          gridColumn: position.col + 1,
          backgroundColor: `rgb(${stitch.colour.join(",")})`,
          border: "1px solid black",
          textAlign: "center",
          aspectRatio: "1 / 1", // Maintain square shape
          position: "relative", // Needed for the diagonal line
        }}
        >
        {stitch.type === "k2tog" && (
          <div
          style={{
            position: "absolute",
            top: "14%",
            left: "15%",
            width: "100%",
            height: "100%",
            borderTop: "1px solid black",
            transform: "rotate(45deg)",
            transformOrigin: "-0.5px 0",
          }}
          />
        )}
        {stitch.type === "k3tog" && (
          <React.Fragment>
          <div
            style={{
            position: "absolute",
            left: "calc(-50% - 0.5px)",
            top: "calc(10%)",
            width: "100%",
            height: "85%",
            borderRight: "1px solid black",
            transformOrigin: "top right",
            transform: "rotate(20deg)",
            }}
          />
          <div
            style={{
            position: "absolute",
            left: "calc(-50% - 0.5px)",
            top: "calc(10%)",
            width: "100%",
            height: "80%",
            borderRight: "1px solid black",
            }}
          />
          <div
            style={{
            position: "absolute",
            left: "calc(-50% - 0.5px)",
            top: "calc(10%)",
            width: "100%",
            height: "85%",
            borderRight: "1px solid black",
            transformOrigin: "top right",
            transform: "rotate(-20deg)",
            }}
          />
          </React.Fragment>
        )}
        </div>
      );
      })}
    </div>
  );
};

export default KnittingPattern;
