import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStitches } from "../helpers/stitches";
import { Stitch } from "../types/Stitch";
import { defaultNumberOfRows, defaultStitchesPerRow } from "../constants";
import DestinationType from "../types/DestinationType";
import { OrientationParameters } from "../types/OrientationParameters";

interface PatternProps {
  setStitches: React.Dispatch<React.SetStateAction<Stitch[]>>;
  orientationParameters: OrientationParameters;
  setOrientationParameters: React.Dispatch<
    React.SetStateAction<OrientationParameters>
  >;
}

interface InputFieldProps {
  label: string;
  value: number;
  valueSetter: React.Dispatch<React.SetStateAction<number>>;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  valueSetter,
}) => (
  <div style={{ marginBottom: "20px" }}>
    <label>
      {label}
      <br />
      <input
        type="number"
        value={value}
        onChange={(e) => valueSetter(Number(e.target.value))}
      />
    </label>
  </div>
);

interface CoordinatesInputProps {
  orientationParameters: OrientationParameters;
  setOrientationParameters: React.Dispatch<
    React.SetStateAction<OrientationParameters>
  >;
  disabled: boolean;
}

const CoordinatesInput: React.FC<CoordinatesInputProps> = ({
  orientationParameters,
  setOrientationParameters,
  disabled,
}) => {
  const { coordinates } = orientationParameters;
  const setLatitude = (latitude: number) =>
    setOrientationParameters({
      ...orientationParameters,
      coordinates: { ...coordinates, latitude },
    });
  const setLongitude = (longitude: number) =>
    setOrientationParameters({
      ...orientationParameters,
      coordinates: { ...coordinates, longitude },
    });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "baseline",
        marginBottom: "20px",
      }}
    >
      <label
        style={{
          marginRight: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        Latitude
        <input
          type="number"
          value={coordinates.latitude}
          min="-90"
          max="90"
          step="0.1"
          onChange={(e) => setLatitude(Number(e.target.value))}
          style={{ marginTop: "5px" }}
          disabled={disabled}
        />
      </label>
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        Longitude
        <input
          type="number"
          value={coordinates.longitude}
          min="-180"
          max="180"
          step="0.1"
          onChange={(e) => setLongitude(Number(e.target.value))}
          style={{ marginTop: "5px" }}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

type LocationType =
  | "North Pole"
  | "South Pole"
  | "Current Location"
  | "Custom Location";

const h1Style = {
  fontSize: "2.5rem",
  marginBottom: "10px",
};

const h2Style = {
  fontSize: "1.5rem",
  marginTop: "5px",
  marginBottom: "5px",
};

const h3Style = {
  fontSize: "1rem",
  marginTop: "5px",
  marginBottom: "5px",
};

const Design: React.FC<PatternProps> = ({
  setStitches,
  orientationParameters,
  setOrientationParameters,
}) => {
  const navigate = useNavigate();

  const [stitchesPerRow, setStitchesPerRow] = useState(defaultStitchesPerRow);
  const [numberOfRows, setNumberOfRows] = useState(defaultNumberOfRows);
  const [locationType, setLocationType] = useState<LocationType>("North Pole");

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLocation = e.target.value;
    setLocationType(selectedLocation as LocationType);

    switch (selectedLocation) {
      case "North Pole":
        setOrientationParameters({
          ...orientationParameters,
          coordinates: { latitude: 90, longitude: 0 },
        });
        break;
      case "South Pole":
        setOrientationParameters({
          ...orientationParameters,
          coordinates: { latitude: -90, longitude: 0 },
        });
        break;
      case "Current Location":
        navigator.geolocation.getCurrentPosition((position) => {
          setOrientationParameters({
            ...orientationParameters,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        });
        break;
      case "Custom Location":
      default:
        break;
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDestination = e.target.value;
    setOrientationParameters({
      ...orientationParameters,
      targetDestination: selectedDestination as DestinationType,
    });
  };

  const handleViewAndColour = () => {
    setStitches(getStitches(stitchesPerRow, numberOfRows));
    navigate("/render");
  };

  return (
    <div style={{ textAlign: "left", padding: "20px" }}>
      <h1 style={h1Style}>Design</h1>
      <h2 style={h2Style}>Set Up Your Stitches</h2>
      <InputField
        label="Stitches per row"
        value={stitchesPerRow}
        valueSetter={setStitchesPerRow}
      />
      <InputField
        label="Number of rows before decreasing"
        value={numberOfRows}
        valueSetter={setNumberOfRows}
      />
      <h2 style={h2Style}>Orient Your Earth</h2>
      <h3 style={h3Style}>Choose a Location</h3>
      <div style={{ marginBottom: "10px" }}>
        <select value={locationType} onChange={handleLocationChange}>
          <option value="North Pole">North Pole</option>
          <option value="South Pole">South Pole</option>
          <option value="Current Location">Current Location</option>
          <option value="Custom Location">Custom Location</option>
        </select>
      </div>
      <CoordinatesInput
        orientationParameters={orientationParameters}
        setOrientationParameters={setOrientationParameters}
        disabled={locationType !== "Custom Location"}
      />
      <h3 style={h3Style}>Where Should This Point End Up?</h3>
      <div style={{ marginBottom: "10px" }}>
        <select
          value={orientationParameters.targetDestination}
          onChange={handleDestinationChange}
        >
          <option value="crown">The crown (top) of your hat</option>
          <option value="front">The front of your hat</option>
          <option value="rim">The rim (bottom) of your hat</option>
        </select>
      </div>
      <h2 style={h2Style}>Final Touches</h2>
      <h3 style={h3Style}>Display New Zealand?</h3>
      <label>
        <input
          type="checkbox"
          checked={orientationParameters.displayNewZealand}
          onChange={(e) =>
            setOrientationParameters({
              ...orientationParameters,
              displayNewZealand: e.target.checked,
            })
          }
          style={{ marginRight: "5px" }}
        />
        Yes, display New Zealand
      </label>
      <br />
      <button
        style={{
          backgroundColor: "#3f51b5",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px",
        }}
        onClick={handleViewAndColour}
      >
        Knit and Dye
      </button>
    </div>
  );
};

export default Design;
