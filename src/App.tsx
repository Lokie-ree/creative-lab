import { useState, useMemo, useEffect, useCallback } from "react"
import { Scene } from "./components/Scene"
import { ControlPanel } from "./components/ControlPanel"
import { FormulaReveal } from "./components/FormulaReveal"

const MATCH_THRESHOLD = 95

function generateTarget() {
  return {
    a: 0.5 + Math.random() * 1.5,  // 0.5 - 2.0
    f: 0.5 + Math.random() * 2.5,  // 0.5 - 3.0
    p: Math.random() * Math.PI * 2, // 0 - 2π
  }
}

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

  const [target, setTarget] = useState(generateTarget)
  const [hasMatched, setHasMatched] = useState(false)
  const [showReveal, setShowReveal] = useState(false)

  const matchScore = useMemo(
    () => calculateMatchScore(
      { a: amplitude, f: frequency, p: phase },
      target
    ),
    [amplitude, frequency, phase, target]
  )

  // Trigger reveal when match threshold is reached for the first time
  useEffect(() => {
    if (matchScore >= MATCH_THRESHOLD && !hasMatched) {
      setHasMatched(true)
      // Small delay for the user to see the match visually
      setTimeout(() => setShowReveal(true), 500)
    }
  }, [matchScore, hasMatched])

  const handleNewChallenge = useCallback(() => {
    // Reset state for new challenge
    setTarget(generateTarget())
    setHasMatched(false)
    setShowReveal(false)
    // Reset sliders to neutral position
    setAmplitude(1.0)
    setFrequency(1.0)
    setPhase(0)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0f]">
      {/* Challenge prompt - minimal, per Brilliant pedagogy */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
        <div className="text-gray-500 text-sm tracking-wide">
          {hasMatched ? (
            <span className="text-[#c8e44c]">Matched!</span>
          ) : (
            "Match the gray wave"
          )}
        </div>
      </div>

      {/* Visualization area */}
      <div className="flex-1 min-h-0">
        <Scene amplitude={amplitude} frequency={frequency} phase={phase} target={target} />
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

      {/* Earned reward - formula reveal */}
      <FormulaReveal
        show={showReveal}
        values={{ a: amplitude, f: frequency, p: phase }}
        onDismiss={() => setShowReveal(false)}
        onNewChallenge={handleNewChallenge}
      />
    </div>
  )
}

export default App
