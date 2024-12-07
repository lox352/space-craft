import React, { useState, useRef } from "react";
import { SketchPicker } from "react-color";

type PixelArtEditorProps = {
  initialWidth?: number;
  initialHeight?: number;
  cellSize?: number;
};

const PixelArtEditor: React.FC<PixelArtEditorProps> = ({
  initialWidth = 16,
  initialHeight = 16,
  cellSize = 20,
}) => {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [color, setColor] = useState("#000000");
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: initialHeight }, () =>
      Array(initialWidth).fill("#ffffff")
    )
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const updatedGrid = grid.map((r, rowIndex) =>
      r.map((c, colIndex) =>
        rowIndex === row && colIndex === col ? color : c
      )
    );
    setGrid(updatedGrid);
  };

  const handleFill = () => {
    const filledGrid = Array.from({ length: height }, () =>
      Array(width).fill(color)
    );
    setGrid(filledGrid);
  };

  const resizeGrid = (newWidth: number, newHeight: number) => {
    const newGrid = Array.from({ length: newHeight }, (_, rowIndex) =>
      Array.from({ length: newWidth }, (_, colIndex) =>
        grid[rowIndex]?.[colIndex] ?? "#ffffff"
      )
    );
    setWidth(newWidth);
    setHeight(newHeight);
    setGrid(newGrid);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    setLastPosition({ x, y });
    setIsDrawing(true);
    handleCellClick(y, x); // Paint the initial pixel
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !lastPosition) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);

    // Check if we've moved
    if (x !== lastPosition.x || y !== lastPosition.y) {
      handleCellClick(y, x); // Paint the new pixel
      setLastPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastPosition(null);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <div>
        <div
          ref={canvasRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gap: "1px",
            border: "1px solid #ccc",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)} // Stop drawing when the mouse leaves the canvas
        >
          {grid.map((row, rowIndex) =>
            row.map((cellColor, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: cellColor,
                  cursor: "pointer",
                }}
              />
            ))
          )}
        </div>
        <button onClick={handleFill}>Fill</button>
      </div>
      <div>
        <h3>Canvas Size</h3>
        <div>
          <label>
            Width:
            <input
              type="number"
              min={1}
              value={width}
              onChange={(e) => resizeGrid(Number(e.target.value), height)}
            />
          </label>
        </div>
        <div>
          <label>
            Height:
            <input
              type="number"
              min={1}
              value={height}
              onChange={(e) => resizeGrid(width, Number(e.target.value))}
            />
          </label>
        </div>
        <h3>Color Picker</h3>
        <SketchPicker
          color={color}
          onChangeComplete={(newColor) => setColor(newColor.hex)}
        />
      </div>
    </div>
  );
};

export default PixelArtEditor;
