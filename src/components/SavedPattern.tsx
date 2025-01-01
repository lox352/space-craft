import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SavedPattern as Pattern } from "../types/SavedPattern";
import KnittingPattern from "../KnittingPattern";

const getPattern = (patternId: string) => {
  const savedPattern = localStorage.getItem(`pattern-${patternId}`);
  return savedPattern ? (JSON.parse(savedPattern) as Pattern) : null;
};

const saveProgress = (patternId: string, progress: number) => {
  const savedPattern = getPattern(patternId);
  if (savedPattern) {
    savedPattern.progress = progress;
    localStorage.setItem(`pattern-${patternId}`, JSON.stringify(savedPattern));
  } else {
    alert("Progress hasn't been saved because the pattern does not exist.");
  }
};

interface RecordingProgressProps {
  recordStitches: (delta: number | "addRow" | "takeRow") => void;
  progress: number;
  stitchesLength: number;
}

const buttonStyle = {
  marginRight: "5px",
  marginBottom: "10px",
  backgroundColor: "#646cff",
  color: "white",
  padding: "10px 5px",
  border: "2px solid black",
  borderRadius: "5px",
  width: "72px",
  cursor: "pointer",
};

const minusButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#f44336", // red color for minus buttons
};
const RecordingProgress: React.FC<RecordingProgressProps> = ({
  recordStitches,
  progress,
  stitchesLength,
}) => {
  return (
    <>
      <div
        style={{
          textAlign: "right",
          position: "sticky",
          bottom: "0",
          paddingTop: "10px",
        }}
      >
        <button style={buttonStyle} onClick={() => recordStitches(1)}>
          +1
        </button>
        <button style={buttonStyle} onClick={() => recordStitches(5)}>
          +5
        </button>
        <button style={buttonStyle} onClick={() => recordStitches(10)}>
          +10
        </button>
        <button style={buttonStyle} onClick={() => recordStitches("addRow")}>
          +Row
        </button>
      </div>
      <div style={{ textAlign: "right" }}>
        <button style={minusButtonStyle} onClick={() => recordStitches(-1)}>
          -1
        </button>
        <button style={minusButtonStyle} onClick={() => recordStitches(-5)}>
          -5
        </button>
        <button style={minusButtonStyle} onClick={() => recordStitches(-10)}>
          -10
        </button>
        <button
          style={minusButtonStyle}
          onClick={() => recordStitches("takeRow")}
        >
          -Row
        </button>
      </div>
      <div style={{ textAlign: "right", marginRight: buttonStyle.marginRight }}>
        {((progress / stitchesLength) * 100).toFixed(2)}% complete
      </div>
    </>
  );
};

const SavedPattern: React.FC = () => {
  const [recordingProgress, setRecordingProgress] = React.useState(false);

  const { patternId } = useParams();
  const savedPattern = patternId ? getPattern(patternId) : null;

  const [progress, setProgress] = useState(() =>
    Math.max(savedPattern?.progress || 0, 0)
  );

  const recordStitches = (delta: number | "addRow" | "takeRow") => {
    if (!savedPattern?.stitches) {
      alert("Pattern not found");
      return;
    }
    let newProgress = progress;
    if (delta === "addRow") {
      const nextRowStitch = savedPattern.stitches
        .slice(progress)
        .find((stitch) => stitch.links.slice(0, -1).includes(progress))?.id;
      if (!nextRowStitch) {
        alert("No next row stitch found");
        return;
      }
      newProgress = nextRowStitch;
    } else if (delta === "takeRow") {
      const currentStitch = savedPattern.stitches[progress];
      newProgress = currentStitch.links.slice(-2, -1)[0];
    } else {
      newProgress += delta;
    }

    setProgress(Math.max(newProgress ?? 0, 0));
  };

  useEffect(() => {
    if (patternId && recordingProgress) {
      saveProgress(patternId, progress);
    }
  }, [recordingProgress, progress, patternId]);

  if (!savedPattern) {
    return <h1>Pattern not found</h1>;
  }

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>
        Saved Pattern
      </h1>
      <KnittingPattern stitches={savedPattern.stitches} progress={progress} />
      {!recordingProgress && (
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
          onClick={() => {
            setRecordingProgress(true);
          }}
        >
          Record Progress
        </button>
      )}
      {recordingProgress && (
        <RecordingProgress
          recordStitches={recordStitches}
          progress={progress}
          stitchesLength={savedPattern.stitches.length}
        />
      )}
    </div>
  );
};

export default SavedPattern;