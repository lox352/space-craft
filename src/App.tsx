import { useState } from 'react'
import './App.css'
import ForceGraph from './ForceGraph'

function App() {
  const [stitchesPerRow, setStitchesPerRow] = useState(20)
  const [numberOfRows, setNumberOfRows] = useState(20)

  return (
    <>
      <input
      type="range"
      min="1"
      max="100"
      value={stitchesPerRow}
      onChange={(e) => setStitchesPerRow(Number(e.target.value))}
      />
      <p>Node Count: {stitchesPerRow}</p>
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
