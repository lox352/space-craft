import { useState } from 'react'
import './App.css'
import ForceGraph from './ForceGraph'

function App() {
  const [nodeCount, setNodeCount] = useState(20)

  return (
    <>
      <input
      type="range"
      min="1"
      max="100"
      value={nodeCount}
      onChange={(e) => setNodeCount(Number(e.target.value))}
      />
      <p>Node Count: {nodeCount}</p>
      <ForceGraph nodeCount={nodeCount} />
    </>
  )
}

export default App
