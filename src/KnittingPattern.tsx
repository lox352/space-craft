import React from "react";
import { Stitch } from "./types/Stitch";

interface KnittingPatternProps {
  stitches: Stitch[];
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
  const { minRow, minCol } = Object.values(stitchPositions).reduce(
    (acc, pos) => {
      acc.minRow = Math.min(acc.minRow, pos.row);
      acc.minCol = Math.min(acc.minCol, pos.col);
      return acc;
    },
    { minRow: Infinity, minCol: Infinity }
  );

  const numRows = 1 - minRow;
  const numCols = 1 - minCol;

  // Render the grid
  return (
    <div
      id="printable-section"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${numRows + 1}, 10px)`,
        gridTemplateColumns: `repeat(${numCols}, 10px)`,
        gap: "0px",
        minHeight: `${(numRows + 2) * 10}px`, // Adjust height to fit all rows
        overflowX: "auto",
        overflowY: "hidden", // Prevent scrolling in the Y direction
      }}
    >
      {filteredStitches.map((stitch) => {
        const position = stitchPositions[stitch.id];
        return (
          <React.Fragment key={stitch.id}>
            {position.row === 0 && (position.col - 1) % 5 === 0 && (
              <div
                className="grid-label"
                id={`label-${position.col}`}
                style={{
                  gridRow: numRows + 1,
                  gridColumn: numCols + position.col,
                  color: "white",
                  borderLeft: "2px solid black",
                  textAlign: "left",
                  aspectRatio: "1 / 1", // Maintain square shape
                  position: "relative", // Needed for the diagonal line
                }}
              >
                {1 - position.col}
              </div>
            )}
            <div
              key={`stitch-${stitch.id}-row-${position.row}-col-${position.col}`}
              id={`stitch-${stitch.id}-row-${position.row}-col-${position.col}`}
              style={{
                gridRow: numRows + position.row,
                gridColumn: numCols + position.col,
                backgroundColor: `rgb(${stitch.colour.join(",")})`,
                border: "1px solid black",
                borderLeftWidth: (position.col - 1) % 5 === 0 ? "2px" : "1px",
                textAlign: "center",
                //aspectRatio: "1 / 1", // Maintain square shape
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
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default KnittingPattern;
