import React from "react";
import { Stitch } from "./types/Stitch";

interface KnittingPatternProps {
  stitches: Stitch[];
}

interface StitchPosition {
  row: number;
  col: number;
}

const StitchLabel: React.FC<{
  row: number;
  col: number;
  children: React.ReactNode;
}> = ({ row, col, children }) => (
  <div
    className="grid-label"
    id={`label-row-${row}-col-${col}`}
    style={{
      gridRow: row,
      gridColumn: col,
      color: "white",
      textAlign: "left",
      aspectRatio: "1 / 1",
      position: "relative",
    }}
  >
    {children}
  </div>
);

const StitchBox: React.FC<{
  stitch: Stitch;
  position: StitchPosition;
  numRows: number;
  numCols: number;
}> = ({ stitch, position, numRows, numCols }) => (
  <div
    key={`stitch-${stitch.id}-row-${position.row}-col-${position.col}`}
    id={`stitch-${stitch.id}-row-${position.row}-col-${position.col}`}
    style={{
      gridRow: numRows + position.row,
      gridColumn: numCols + position.col + 1,
      backgroundColor: `rgb(${stitch.colour.join(",")})`,
      border: "1px solid black",
      borderLeftWidth: (position.col - 1) % 5 === 0 ? "2px" : "1px",
      borderTopWidth: (position.row - 1) % 5 === 0 ? "2px" : "1px",
      textAlign: "center",
      position: "relative",
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

const KnittingPattern: React.FC<KnittingPatternProps> = ({ stitches }) => {
  const stitchPositions: { [id: number]: StitchPosition } = {};
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

  const saveToLocalStorage = () => {
    localStorage.setItem("stitches", JSON.stringify(stitches));
    alert("Stitches saved to local storage!");
  };

  return (
    <div>
      <div
        id="printable-section"
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${numRows + 1}, 10px)`,
          gridTemplateColumns: `repeat(${numCols + 2}, 10px)`,
          gap: "0px",
          minHeight: `${(numRows + 2) * 10}px`,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {[...Array(numCols)].map((_, colIndex) => {
          if ((colIndex + 1) % 5 === 0) {
            return (
              <StitchLabel
                key={`col-label-${colIndex}`}
                row={numRows + 1}
                col={1 + numCols - colIndex}
              >
                {colIndex + 1}
              </StitchLabel>
            );
          }
        })}
        {[...Array(numRows)].map((_, rowIndex) => {
          if ((rowIndex + 1) % 5 === 0) {
            return (
              <StitchLabel
                key={`col-label-${rowIndex}`}
                col={numCols + 2}
                row={numRows - rowIndex}
              >
                {rowIndex + 1}
              </StitchLabel>
            );
          }
        })}
        {filteredStitches.map((stitch) => {
          const position = stitchPositions[stitch.id];
          return (
            // <React.Fragment key={stitch.id}>
            //   {position.row === 0 && (position.col - 1) % 5 === 0 && (
            //     <StitchLabel
            //       row={numRows + 1}
            //       col={numCols + position.col}
            //     >
            //       {1 - position.col}
            //     </StitchLabel>
            //   )}
            //   {position.col === 0 && (position.row - 1) % 5 === 0 && (
            //     <StitchLabel
            //       row={numRows + position.row}
            //       col={numCols + 2}
            //     >
            //       {1 - position.row}
            //     </StitchLabel>
            //   )}
            <StitchBox
              key={`box-${stitch.id}`}
              stitch={stitch}
              position={position}
              numRows={numRows}
              numCols={numCols}
            />
            // </React.Fragment>
          );
        })}
      </div>
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
    </div>
  );
};

export default KnittingPattern;
