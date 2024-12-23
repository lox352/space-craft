import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Design from "./components/Design";
import Render from "./components/Render";
import { useState } from "react";
import { Stitch } from "./types/Stitch";
import { getStitches } from "./helpers/stitches";
import { defaultNumberOfRows, defaultStitchesPerRow } from "./constants";

function App() {
  const [stitches, setStitches] = useState<Stitch[]>(getStitches(defaultStitchesPerRow, defaultNumberOfRows));
  const [triggerColouring, setTriggerColouring] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/design"
          element={<Design setStitches={setStitches} />}
        />
        <Route
          path="/render"
          element={<Render stitches={stitches} setStitches={setStitches} triggerColouring={triggerColouring} setTriggerColouring={setTriggerColouring} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
