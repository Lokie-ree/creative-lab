/* eslint-disable react-refresh/only-export-components */
/**
 * Vector Transformations Module - Celebration Pulse Component
 *
 * Visual effect that triggers on successful challenge match.
 * Radial gradient pulse expands from center of canvas.
 */

import { useEffect, useRef, useState } from 'react'
import { Circle } from '@react-three/drei'
import gsap from 'gsap'
import { colors } from '@/lib/colors'

/**
 * Animation configuration
 */
const PULSE_DURATION = 0.8
const PULSE_START_SCALE = 0.5
const PULSE_END_SCALE = 3
const PULSE_START_OPACITY = 0.4
const PULSE_END_OPACITY = 0

interface CelebrationPulseProps {
  /** Trigger pulse animation when this changes to true */
  active: boolean
  /** Callback when animation completes */
  onComplete?: () => void
}

/**
 * Celebration Pulse Component (R3F)
 *
 * Renders a circle that expands and fades out when triggered.
 * Use inside an R3F Canvas.
 */
export function CelebrationPulse({ active, onComplete }: CelebrationPulseProps) {
  const [scale, setScale] = useState(PULSE_START_SCALE)
  const [opacity, setOpacity] = useState(0)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (active) {
      // Kill any existing animation
      if (animationRef.current) {
        animationRef.current.kill()
      }

      // Create animation object with start values
      const animState = { scale: PULSE_START_SCALE, opacity: PULSE_START_OPACITY }

      // Animate scale and opacity using requestAnimationFrame callback
      animationRef.current = gsap.to(animState, {
        scale: PULSE_END_SCALE,
        opacity: PULSE_END_OPACITY,
        duration: PULSE_DURATION,
        ease: 'power2.out',
        onStart: () => {
           
          setScale(PULSE_START_SCALE)
           
          setOpacity(PULSE_START_OPACITY)
        },
        onUpdate: () => {
           
          setScale(animState.scale)
           
          setOpacity(animState.opacity)
        },
        onComplete: () => {
          // Reset for next trigger
           
          setOpacity(0)
           
          setScale(PULSE_START_SCALE)
          onComplete?.()
        },
      })
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [active, onComplete])

  // Don't render if not visible
  if (opacity === 0) return null

  return (
    <Circle args={[scale, 64]} position={[0, 0, -0.5]}>
      <meshBasicMaterial
        color={colors.accent.primary}
        opacity={opacity}
        transparent
      />
    </Circle>
  )
}

/**
 * Celebration Pulse Component (HTML)
 *
 * Alternative implementation using CSS for HTML overlay.
 * Use outside the R3F Canvas.
 */
interface CelebrationPulseHtmlProps {
  /** Trigger animation */
  active: boolean
  /** Callback when animation completes */
  onComplete?: () => void
  /** Additional CSS classes */
  className?: string
}

export function CelebrationPulseHtml({
  active,
  onComplete,
  className,
}: CelebrationPulseHtmlProps) {
  const pulseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (active && pulseRef.current) {
      // Animate using GSAP
      gsap.fromTo(
        pulseRef.current,
        {
          scale: 0.3,
          opacity: 0.4,
        },
        {
          scale: 2,
          opacity: 0,
          duration: PULSE_DURATION,
          ease: 'power2.out',
          onComplete,
        }
      )
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        ref={pulseRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.accent.primary}40 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

/**
 * Hook for managing celebration state
 */
export function useCelebration() {
  const [isActive, setIsActive] = useState(false)

  const trigger = () => {
    setIsActive(true)
  }

  const reset = () => {
    setIsActive(false)
  }

  return {
    isActive,
    trigger,
    reset,
  }
}

export default CelebrationPulse
