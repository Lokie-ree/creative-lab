import { useState, useMemo } from "react"
import { Scene } from "./components/Scene"
import { ControlPanel } from "./components/ControlPanel"

function calculateMatchScore(
  user: { a: number; f: number; p: number },
  target: { a: number; f: number; p: number }
): number {
  const aDiff = Math.abs(user.a - target.a) / 2.0
  const fDiff = Math.abs(user.f - target.f) / 3.0
  const pDiff = Math.min(
    Math.abs(user.p - target.p),
    2 * Math.PI - Math.abs(user.p - target.p)
  ) / Math.PI

  const avgDiff = (aDiff + fDiff + pDiff) / 3
  return Math.max(0, (1 - avgDiff) * 100)
}

function App() {
  const [amplitude, setAmplitude] = useState(1.0)
  const [frequency, setFrequency] = useState(1.0)
  const [phase, setPhase] = useState(0)

  const [target] = useState(() => ({
    a: 0.5 + Math.random() * 1.5,
    f: 0.5 + Math.random() * 2.5,
    p: Math.random() * Math.PI * 2,
  }))

  const matchScore = useMemo(
    () => calculateMatchScore(
      { a: amplitude, f: frequency, p: phase },
      target
    ),
    [amplitude, frequency, phase, target]
  )

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f]">
      {/* Visualization area */}
      <div className="flex-1 min-h-0">
        <Scene amplitude={amplitude} frequency={frequency} phase={phase} />
      </div>

      {/* Control panel docked at bottom */}
      <ControlPanel
        amplitude={amplitude}
        frequency={frequency}
        phase={phase}
        onAmplitudeChange={setAmplitude}
        onFrequencyChange={setFrequency}
        onPhaseChange={setPhase}
        matchScore={matchScore}
      />
    </div>
  )
}

export default App
