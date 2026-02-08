// src/components/modules/sinewaves/scene-layout.ts
import { useThree } from '@react-three/fiber'

/**
 * Scene layout configuration for viewport-proportional positioning.
 * Ratios are multiplied by viewport width/height to get world-space positions.
 */
/**
 * Wave width must match WAVE_WIDTH in SineWave.tsx.
 * Used here to center the wave when the unit circle is hidden on mobile.
 */
const WAVE_WIDTH = 4

export const SCENE_LAYOUT = {
  landscape: {
    circle: { xRatio: -0.32, yRatio: 0 },
    wave: { xRatio: 0.1, yRatio: 0 },
    scaleFactor: 0.20,
  },
  portrait: {
    circle: { xRatio: 0, yRatio: 0.22 },
    wave: { xRatio: -0.15, yRatio: -0.18 },
    scaleFactor: 0.24,
  },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const

export interface SceneLayoutResult {
  isPortrait: boolean
  circle: { x: number; y: number }
  wave: { x: number; y: number }
  scale: number
  connector: { startX: number; endX: number } | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Hook for viewport-proportional scene positioning.
 * Replaces hardcoded magic numbers with calculations derived from R3F viewport.
 *
 * @param stage - Current stage to determine connector visibility
 * @returns Layout values for circle, wave, scale, and optional connector
 */
export function useSceneLayout(stage: string): SceneLayoutResult {
  const { viewport } = useThree()
  const { width, height } = viewport

  const isPortrait = width <= height
  const isMobile = isPortrait || (typeof window !== 'undefined' && window.innerWidth < 768)
  const config = isPortrait ? SCENE_LAYOUT.portrait : SCENE_LAYOUT.landscape

  const baseDimension = Math.min(width, height)
  const scale = clamp(
    baseDimension * config.scaleFactor,
    SCENE_LAYOUT.scale.min,
    SCENE_LAYOUT.scale.max
  )

  const circle = {
    x: width * config.circle.xRatio,
    y: height * config.circle.yRatio,
  }

  // On mobile the unit circle is hidden, so center the wave in the viewport.
  // The wave draws from x=0 to x=WAVE_WIDTH, so offset by -WAVE_WIDTH/2.
  const wave = isMobile
    ? { x: -WAVE_WIDTH / 2, y: 0 }
    : { x: width * config.wave.xRatio, y: height * config.wave.yRatio }

  // Connector only shows in landscape during observe stage
  const connector = (!isPortrait && stage === 'observe')
    ? { startX: circle.x, endX: wave.x }
    : null

  return { isPortrait, circle, wave, scale, connector }
}

/**
 * Hook to detect if we're in mobile viewport.
 * Uses R3F viewport aspect AND actual screen width to reliably
 * hide unit circle on phones (landscape phones slipped through
 * the old R3F-only check because camera FOV inflates viewport units).
 */
export function useIsMobileViewport(): boolean {
  const { viewport } = useThree()
  const isPortrait = viewport.width <= viewport.height
  const isNarrowScreen = typeof window !== 'undefined' && window.innerWidth < 768
  return isPortrait || isNarrowScreen
}
