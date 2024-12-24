import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Design from "./components/Design";
import Render from "./components/Render";
import { useState } from "react";
import { Stitch } from "./types/Stitch";
import Pattern from "./components/Pattern";

function App() {
  const [stitches, setStitches] = useState<Stitch[]>([]);

  return (
    <Router>
      <Routes>
        <Route path="/space-craft" element={<Home />} />
        <Route
          path="/space-craft/design"
          element={<Design setStitches={setStitches} />}
        />
        <Route
          path="/space-craft/render"
          element={<Render stitches={stitches} setStitches={setStitches} />}
        />
        <Route
          path="/space-craft/pattern"
          element={<Pattern stitches={stitches} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
