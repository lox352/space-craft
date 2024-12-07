import React, { useState } from "react";

type RGB = [number, number, number];
type PixelGrid = RGB[][];

interface PixelCanvasProps {
  rows: number;
  columns: number;
  initialColor?: RGB;
}

const PixelCanvas: React.FC<PixelCanvasProps> = ({
  rows,
  columns,
  initialColor = [255, 255, 255],
}) => {
  const [grid, setGrid] = useState<PixelGrid>(
    Array.from({ length: rows }, () =>
      Array.from({ length: columns }, () => initialColor)
    )
  );
  const [selectedColor, setSelectedColor] = useState<RGB>([0, 0, 0]);

  const updateCell = (row: number, col: number) => {
    const newGrid = grid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? selectedColor : cell
      )
    );
    setGrid(newGrid);
  };

  const resizeGrid = (newRows: number, newColumns: number) => {
    const resizedGrid = Array.from({ length: newRows }, (_, rowIndex) =>
      Array.from(
        { length: newColumns },
        (_, colIndex) => grid[rowIndex]?.[colIndex] || initialColor
      )
    );
    setGrid(resizedGrid);
  };

  // Handlers for resizing
  const handleRightDrag = (e: React.MouseEvent) => {
    const newColumns = Math.max(1, Math.ceil(e.movementX / 2));
    resizeGrid(grid.length, grid[0].length + newColumns);
  };

  const handleBottomDrag = (e: React.MouseEvent) => {
    const newRows = Math.max(1, grid.length + Math.floor(e.movementY / 20));
    resizeGrid(newRows, grid[0].length);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Color Picker */}
      <div>
        <label>Pick a color: </label>
        <input
          type="color"
          onChange={(e) => {
            const hex = e.target.value;
            const rgb = [
              parseInt(hex.slice(1, 3), 16),
              parseInt(hex.slice(3, 5), 16),
              parseInt(hex.slice(5, 7), 16),
            ] as RGB;
            setSelectedColor(rgb);
          }}
        />
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
          gridTemplateRows: `repeat(${grid.length}, 20px)`,
          position: "relative",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((color, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => updateCell(rowIndex, colIndex)}
              style={{
                width: 20,
                height: 20,
                backgroundColor: `rgb(${color.join(",")})`,
                border: "1px solid #ddd",
                cursor: "pointer",
              }}
            />
          ))
        )}
      </div>

      {/* Resize Handles */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          height: "100%",
          width: 10,
          cursor: "ew-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const onMouseMove = (moveEvent: MouseEvent) =>
            handleRightDrag(moveEvent as unknown as React.MouseEvent);
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 10,
          cursor: "ns-resize",
          zIndex: 10,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          const onMouseMove = (moveEvent: MouseEvent) =>
            handleBottomDrag(moveEvent as unknown as React.MouseEvent);
          const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        }}
      />
    </div>
  );
};

export default PixelCanvas;
