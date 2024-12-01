import { useState } from 'react'
import './App.css'
import ForceGraph from './ForceGraph'
import ChainSimulation from './ChainSimulation'

function App() {
  const [stitchesPerRow, setStitchesPerRow] = useState(144)
  const [numberOfRows, setNumberOfRows] = useState(20)

  return (
    <>
      <input
      type="range"
      min="50"
      max="200"
      value={stitchesPerRow}
      onChange={(e) => setStitchesPerRow(Number(e.target.value))}
      />
      <p>Stitches per row: {stitchesPerRow}</p>
      <input
      type="range"
      min="1"
      max="100"
      value={numberOfRows}
      onChange={(e) => setNumberOfRows(Number(e.target.value))}
      />
      <p>Number of Rows: {numberOfRows}</p>
      <ForceGraph stitchesPerRow={stitchesPerRow} numberOfRows={numberOfRows} />
    </>
  )
}

export default App
