/**
 * Vector Transformations Module - Matrix Control Panel
 *
 * 4-slider interface for adjusting matrix entries.
 * Supports progressive unlock of off-diagonal entries.
 */

import { useState, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { pulse } from '@/lib/animations'
import type { Matrix2x2 } from './utils'
import { SLIDER_CONFIG } from './utils'

/**
 * Configuration constants
 */
const UNLOCK_THRESHOLD = 3 // Diagonal adjustments needed to unlock off-diagonal

interface MatrixControlPanelProps {
  /** Current matrix values */
  matrix: Matrix2x2
  /** Callback when matrix changes */
  onChange: (matrix: Matrix2x2) => void
  /** Callback when reset button clicked */
  onReset: () => void
  /** Callback when any slider is adjusted (for idle detection) */
  onInteraction?: () => void
  /** Whether off-diagonal sliders are unlocked */
  isUnlocked?: boolean
  /** Callback when off-diagonal unlocks */
  onUnlock?: () => void
  /** Whether panel is disabled (e.g., during reveal) */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Individual Matrix Entry Slider
 */
interface MatrixSliderProps {
  entry: keyof Matrix2x2
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  hidden?: boolean
  unlocking?: boolean
}

function MatrixSlider({
  entry,
  label,
  value,
  onChange,
  disabled = false,
  hidden = false,
  unlocking = false,
}: MatrixSliderProps) {
  const valueRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevValueRef = useRef<number>(value)

  // Pulse animation on significant value change
  useGSAP(
    () => {
      if (
        !disabled &&
        valueRef.current &&
        Math.abs(value - prevValueRef.current) > SLIDER_CONFIG.step * 2
      ) {
        pulse(valueRef.current)
        prevValueRef.current = value
      }
    },
    { dependencies: [value, disabled], scope: valueRef }
  )

  // Unlock animation
  useGSAP(
    () => {
      if (unlocking && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          }
        )
        // Pulse to draw attention
        gsap.to(containerRef.current, {
          scale: 1.02,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          delay: 0.3,
        })
      }
    },
    { dependencies: [unlocking], scope: containerRef }
  )

  if (hidden) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col gap-2',
        disabled && 'opacity-50 pointer-events-none'
      )}
    >
      {/* Label and value */}
      <div className="flex justify-between items-center gap-2 text-xs sm:text-sm">
        <label className="text-[var(--lab-text-muted)] font-mono">
          {label}
        </label>
        <span
          ref={valueRef}
          className={cn(
            'font-mono tabular-nums',
            disabled ? 'text-[var(--lab-text-muted)]' : 'text-[var(--lab-accent)]'
          )}
        >
          {value.toFixed(1)}
        </span>
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        min={SLIDER_CONFIG.min}
        max={SLIDER_CONFIG.max}
        step={SLIDER_CONFIG.step}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
        aria-label={`Matrix entry ${entry}, current value ${value.toFixed(1)}`}
        className={cn(disabled && 'cursor-not-allowed')}
      />
    </div>
  )
}

/**
 * Matrix Control Panel Component
 *
 * Renders a 2x2 grid of sliders for matrix entries.
 * Off-diagonal entries unlock after 3 diagonal adjustments.
 */
export function MatrixControlPanel({
  matrix,
  onChange,
  onReset,
  onInteraction,
  isUnlocked: externalUnlocked,
  onUnlock,
  disabled = false,
  className,
}: MatrixControlPanelProps) {
  // Track diagonal adjustment count for progressive unlock
  const [adjustmentCount, setAdjustmentCount] = useState(0)
  const [justUnlocked, setJustUnlocked] = useState(false)

  // Use external unlock state if provided, otherwise internal
  const isUnlocked = externalUnlocked ?? adjustmentCount >= UNLOCK_THRESHOLD

  // Handle entry change
  const handleChange = (entry: keyof Matrix2x2, value: number) => {
    onChange({ ...matrix, [entry]: value })
    onInteraction?.()

    // Track diagonal adjustments for unlock
    if ((entry === 'a11' || entry === 'a22') && !isUnlocked) {
      const newCount = adjustmentCount + 1
      setAdjustmentCount(newCount)

      // Trigger unlock when threshold reached
      if (newCount >= UNLOCK_THRESHOLD) {
        setJustUnlocked(true)
        onUnlock?.()
        // Clear "just unlocked" state after animation
        setTimeout(() => setJustUnlocked(false), 600)
      }
    }
  }

  // Handle reset - keep unlock state
  const handleReset = () => {
    onReset()
    onInteraction?.()
  }

  return (
    <div
      className={cn(
        'bg-black/60 backdrop-blur-sm border border-[var(--lab-border)] rounded-xl p-4',
        'max-w-[320px] w-full',
        className
      )}
    >
      {/* Optional title */}
      <h3 className="text-sm font-medium text-[var(--lab-text)] mb-4 text-center">
        Transformation Matrix
      </h3>

      {/* Matrix grid layout */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Top row: a11, a12 */}
        <MatrixSlider
          entry="a11"
          label="a₁₁"
          value={matrix.a11}
          onChange={(v) => handleChange('a11', v)}
          disabled={disabled}
        />
        <MatrixSlider
          entry="a12"
          label="a₁₂"
          value={matrix.a12}
          onChange={(v) => handleChange('a12', v)}
          disabled={disabled}
          hidden={!isUnlocked}
          unlocking={justUnlocked}
        />

        {/* Bottom row: a21, a22 */}
        <MatrixSlider
          entry="a21"
          label="a₂₁"
          value={matrix.a21}
          onChange={(v) => handleChange('a21', v)}
          disabled={disabled}
          hidden={!isUnlocked}
          unlocking={justUnlocked}
        />
        <MatrixSlider
          entry="a22"
          label="a₂₂"
          value={matrix.a22}
          onChange={(v) => handleChange('a22', v)}
          disabled={disabled}
        />
      </div>

      {/* Unlock hint (when not yet unlocked) */}
      {!isUnlocked && (
        <p className="text-[10px] text-[var(--lab-text-dim)] text-center mb-3">
          Adjust diagonal sliders to unlock more controls
        </p>
      )}

      {/* Reset button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2"
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  )
}

/**
 * Compact Matrix Display
 *
 * Shows current matrix values in standard notation.
 * Used for visual reference, not interactive.
 */
interface MatrixDisplayProps {
  matrix: Matrix2x2
  className?: string
}

export function MatrixDisplay({ matrix, className }: MatrixDisplayProps) {
  return (
    <div
      className={cn(
        'font-mono text-sm text-[var(--lab-text)]',
        'flex items-center gap-1',
        className
      )}
    >
      <span className="text-lg">⌈</span>
      <div className="flex flex-col items-center">
        <div className="flex gap-3">
          <span className="w-8 text-right">{matrix.a11.toFixed(1)}</span>
          <span className="w-8 text-right">{matrix.a12.toFixed(1)}</span>
        </div>
        <div className="flex gap-3">
          <span className="w-8 text-right">{matrix.a21.toFixed(1)}</span>
          <span className="w-8 text-right">{matrix.a22.toFixed(1)}</span>
        </div>
      </div>
      <span className="text-lg">⌋</span>
    </div>
  )
}

export default MatrixControlPanel
