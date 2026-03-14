// src/components/modules/sinewaves/scene-layout.ts
import { useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export type SceneMode = 'phone' | 'portrait' | 'landscape'

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
    // Unchanged
    circle: { xRatio: -0.32, yRatio: 0 },
    wave:   { xRatio: 0.1,   yRatio: 0 },
    scaleFactor: 0.20,
  },
  portrait: {
    // NEW — tablet portrait: stacked, circle above wave. Tune visually at 768px and 820px portrait.
    circle: { xRatio: 0, yRatio: 0.25 },
    wave:   { xRatio: 0, yRatio: -0.22 },
    scaleFactor: 0.22,
  },
  phone: {
    // Wave only — no circle. xRatio 0 = centered. y stays 0 since wave fills the canvas.
    wave: { xRatio: 0, yRatio: 0 },
    scaleFactor: 0.24,
  },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Derives the scene layout mode from device width and canvas shape.
 *
 * - 'phone'     — narrow device (<600px); wave only, no unit circle
 * - 'portrait'  — tablet/desktop canvas that is taller than wide; stacked layout
 * - 'landscape' — canvas wider than tall (all phones in landscape, tablets + desktops in landscape)
 *
 * Uses window.innerWidth for device class (stable, not affected by camera FOV).
 * Uses R3F size (CSS pixels) for portrait/landscape — avoids the world-unit aspect
 * ratio bug where perspective camera FOV inflates world-unit viewport dimensions.
 */
export function useSceneMode(): SceneMode {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handler, { passive: true })
    window.addEventListener('orientationchange', handler, { passive: true })
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  const { size } = useThree()
  const isPortrait = size.width <= size.height
  const isPhone = windowWidth < 600

  if (isPhone && isPortrait)  return 'phone'      // phone portrait: wave only
  if (!isPhone && isPortrait) return 'portrait'   // tablet portrait: stacked
  return 'landscape'                              // everything landscape (any width)
}

export interface SceneLayoutResult {
  circle: { x: number; y: number }
  wave: { x: number; y: number }
  scale: number
  connector: { startX: number; endX: number } | null
}

/**
 * Derives world-space positions for circle and wave from the current scene mode.
 *
 * @param stage - Current stage to determine connector visibility
 * @param mode  - Scene mode from useSceneMode()
 */
export function useSceneLayout(stage: string, mode: SceneMode): SceneLayoutResult {
  const { viewport, size } = useThree()
  const { width, height } = viewport

  // Position config: phone mode uses landscape positions (circle won't render for phone)
  const config = (mode === 'portrait')
    ? SCENE_LAYOUT.portrait
    : SCENE_LAYOUT.landscape

  // Scale factor: phone uses its own scaleFactor, others use config's
  const scaleFactor = (mode === 'phone')
    ? SCENE_LAYOUT.phone.scaleFactor
    : config.scaleFactor

  // Scale base: portrait uses half height (each element gets ~50% of canvas height)
  const baseDimension = (mode === 'portrait')
    ? Math.min(size.width, size.height / 2)
    : Math.min(size.width, size.height)

  const scale = clamp(
    baseDimension * scaleFactor,
    SCENE_LAYOUT.scale.min,
    SCENE_LAYOUT.scale.max
  )

  const circle = {
    x: width * config.circle.xRatio,
    y: height * config.circle.yRatio,
  }

  // Phone: center wave. Portrait/Landscape: use config ratio.
  const wave = (mode === 'phone')
    ? { x: -WAVE_WIDTH / 2, y: 0 }
    : { x: width * config.wave.xRatio, y: height * config.wave.yRatio }

  // Connector only in landscape during observe stage
  const connector = (mode === 'landscape' && stage === 'observe')
    ? { startX: circle.x, endX: wave.x }
    : null

  return { circle, wave, scale, connector }
}

/**
 * @deprecated Use useSceneMode() instead.
 * Kept temporarily to avoid breaking any consumers not updated in this plan.
 */
export function useIsMobileViewport(): boolean {
  const mode = useSceneMode()
  return mode === 'phone'
}
