import { useState } from "react"
import { Scene } from "./components/Scene"

function App() {
  const [amplitude] = useState(1.0)
  const [frequency] = useState(1.0)
  const [phase] = useState(0)

  return (
    <div className="h-screen w-screen">
      <Scene amplitude={amplitude} frequency={frequency} phase={phase} />
    </div>
  )
}

export default App
