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
    <Router basename={import.meta.env.DEV ? "/space-craft" : undefined}>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/design"
        element={<Design setStitches={setStitches} />}
      />
      <Route
        path="/render"
        element={<Render stitches={stitches} setStitches={setStitches} />}
      />
      <Route
        path="/pattern"
        element={<Pattern stitches={stitches} />}
      />
      </Routes>
    </Router>
  );
}

export default App;
