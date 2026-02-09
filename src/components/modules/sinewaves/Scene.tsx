import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { UnitCircle } from "./UnitCircle"
import { SineWave } from "./SineWave"
import { Connector } from "./Connector"
import { GridLines } from "./GridLines"
import { colors } from "@/lib/colors"
import { useSceneLayout, useIsMobileViewport, SCENE_LAYOUT } from "./scene-layout"

type Stage = 'observe' | 'amplitude' | 'frequency' | 'phase' | 'challenge' | 'reveal'

interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }
  stage: Stage
  isPaused: boolean
  onPauseChange: (paused: boolean) => void
  stageTargets?: { amplitude: number; frequency: number; phase: number }
  isVisible?: boolean
  matchSuccess?: boolean
  showGhost?: boolean      // Explicitly control ghost visibility
  showConnector?: boolean  // Explicitly control connector visibility
  speedMultiplier?: number // Animation speed multiplier
}

function Visualization({
  amplitude, frequency, phase, target, stage, isPaused, onPauseChange,
  stageTargets, matchSuccess,
  showGhost: showGhostProp,
  showConnector: showConnectorProp,
  speedMultiplier = 1,
}: SceneProps) {
  const { isPortrait, circle, wave, scale, connector } = useSceneLayout(stage)
  const isMobile = useIsMobileViewport()

  // Shared animation time — accumulates delta only when unpaused, with speedMultiplier
  const animTimeRef = useRef(0)
  const lastClockRef = useRef(-1)

  useFrame((state) => {
    const now = state.clock.elapsedTime
    if (lastClockRef.current >= 0 && !isPaused) {
      animTimeRef.current += (now - lastClockRef.current) * speedMultiplier
    }
    lastClockRef.current = now
  })

  // Use explicit prop if provided, otherwise fall back to stage-based logic
  const showGhost = showGhostProp ?? (stage !== 'observe')
  const showConnector = showConnectorProp ?? (connector !== null)

  // Get ghost wave parameters based on stage
  // Mirror user's non-target parameter so only the relevant difference is visible
  const ghostParams = useMemo(() => {
    if (stage === 'amplitude' && stageTargets) {
      return { a: stageTargets.amplitude, f: frequency, p: 0 }
    }
    if (stage === 'frequency' && stageTargets) {
      return { a: amplitude, f: stageTargets.frequency, p: 0 }
    }
    if (stage === 'phase' && stageTargets) {
      return { a: stageTargets.amplitude, f: stageTargets.frequency, p: stageTargets.phase }
    }
    return target
  }, [stage, stageTargets, target, amplitude, frequency])

  return (
    <>
      {/* Unit circle — hidden on mobile */}
      {!isMobile && (
        <group position={[circle.x, circle.y, 0]} scale={scale}>
          <UnitCircle
            amplitude={amplitude}
            frequency={frequency}
            phase={phase}
            isPaused={isPaused}
            onPauseChange={onPauseChange}
            speedMultiplier={speedMultiplier}
            timeRef={animTimeRef}
          />
          {/* Target point on circle (ghost) — always rendered, opacity-faded */}
          <UnitCircle
            amplitude={ghostParams.a}
            frequency={ghostParams.f}
            phase={ghostParams.p}
            color={colors.ghost}
            opacity={SCENE_LAYOUT.ghostOpacity}
            speedMultiplier={speedMultiplier}
            timeRef={animTimeRef}
            visible={showGhost}
          />
        </group>
      )}

      {/* Connector line — only in landscape, desktop, and when showConnector is true */}
      {!isMobile && showConnector && connector && (
        <Connector
          circleX={circle.x}
          waveX={wave.x}
          frequency={frequency}
          phase={phase}
          amplitude={amplitude}
          scale={scale}
          isPaused={isPaused}
          speedMultiplier={speedMultiplier}
          timeRef={animTimeRef}
        />
      )}

      {/* Sine waves + grid (same scaled group so grid matches wave area) */}
      <group position={[wave.x, wave.y, 0]} scale={isPortrait ? scale : 1}>
        <GridLines width={4.5} height={5} />
        {/* Target wave (ghost) — always rendered, opacity-faded */}
        <SineWave
          amplitude={ghostParams.a}
          frequency={ghostParams.f}
          phase={ghostParams.p}
          color={colors.ghost}
          opacity={SCENE_LAYOUT.ghostOpacity}
          speedMultiplier={speedMultiplier}
          timeRef={animTimeRef}
          visible={showGhost}
        />
        {/* User's wave */}
        <SineWave
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          isPaused={isPaused}
          showLiveDot={stage !== 'observe'}
          glow={matchSuccess}
          speedMultiplier={speedMultiplier}
          timeRef={animTimeRef}
        />
      </group>
    </>
  )
}

export function Scene({
  amplitude, frequency, phase, target, stage, isPaused, onPauseChange,
  stageTargets, isVisible = true, matchSuccess,
  showGhost, showConnector, speedMultiplier,
}: SceneProps) {
  // Conditionally render Canvas to prevent WebGL context conflicts
  // when both Hero and Module are mounted during SlideTransition
  if (!isVisible) {
    return null
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: colors.background.primary }}
    >
      <Visualization
        amplitude={amplitude}
        frequency={frequency}
        phase={phase}
        target={target}
        stage={stage}
        isPaused={isPaused}
        onPauseChange={onPauseChange}
        stageTargets={stageTargets}
        matchSuccess={matchSuccess}
        showGhost={showGhost}
        showConnector={showConnector}
        speedMultiplier={speedMultiplier}
      />
    </Canvas>
  )
}
