import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
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

  // Use explicit prop if provided, otherwise fall back to stage-based logic
  const showGhost = showGhostProp ?? (stage !== 'observe')
  const showConnector = showConnectorProp ?? (connector !== null)

  // Get ghost wave parameters based on stage
  const ghostParams = useMemo(() => {
    if (stage === 'amplitude' && stageTargets) {
      return { a: stageTargets.amplitude, f: 1, p: 0 }
    }
    if (stage === 'frequency' && stageTargets) {
      return { a: stageTargets.amplitude, f: stageTargets.frequency, p: 0 }
    }
    if (stage === 'phase' && stageTargets) {
      return { a: stageTargets.amplitude, f: stageTargets.frequency, p: stageTargets.phase }
    }
    return target
  }, [stage, stageTargets, target])

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
          />
          {/* Target point on circle (ghost) */}
          {showGhost && (
            <UnitCircle
              amplitude={ghostParams.a}
              frequency={ghostParams.f}
              phase={ghostParams.p}
              color={colors.ghost}
              opacity={SCENE_LAYOUT.ghostOpacity}
              speedMultiplier={speedMultiplier}
            />
          )}
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
        />
      )}

      {/* Grid lines behind wave area */}
      <group position={[wave.x, wave.y, 0]}>
        <GridLines width={4.5} height={2.5} />
      </group>

      {/* Sine waves */}
      <group position={[wave.x, wave.y, 0]} scale={isPortrait ? scale : 1}>
        {/* Target wave (ghost) */}
        {showGhost && (
          <SineWave
            amplitude={ghostParams.a}
            frequency={ghostParams.f}
            phase={ghostParams.p}
            color={colors.ghost}
            opacity={SCENE_LAYOUT.ghostOpacity}
            speedMultiplier={speedMultiplier}
          />
        )}
        {/* User's wave */}
        <SineWave
          amplitude={amplitude}
          frequency={frequency}
          phase={phase}
          isPaused={isPaused}
          showLiveDot={stage !== 'observe'}
          glow={matchSuccess}
          speedMultiplier={speedMultiplier}
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
