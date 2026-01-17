/**
 * Vector Transformations Module - Reveal Panel Component
 *
 * Modal showing matrix notation with geometric explanations after successful match.
 * This is the "earned understanding" moment - formula comes after discovery.
 */

import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Matrix2x2, TransformationType } from './utils'
import {
  getTransformationDescription,
  getEntryExplanations,
  formatMatrixForDisplay,
} from './utils'

interface RevealPanelProps {
  /** The matrix user created */
  matrix: Matrix2x2
  /** The transformation type */
  transformationType: TransformationType
  /** Challenge name that was matched */
  challengeName: string
  /** Whether panel is visible */
  isOpen: boolean
  /** Callback to try another challenge */
  onTryAnother: () => void
  /** Callback to return to free exploration */
  onKeepExploring: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Matrix Notation Display
 *
 * Shows the 2x2 matrix in standard notation with brackets.
 */
interface MatrixNotationProps {
  matrix: Matrix2x2
  className?: string
}

function MatrixNotation({ matrix, className }: MatrixNotationProps) {
  const displayMatrix = formatMatrixForDisplay(matrix)

  return (
    <div
      className={cn(
        'font-mono text-lg text-[var(--lab-text)] flex items-center gap-1',
        className
      )}
    >
      {/* Left bracket */}
      <div className="flex flex-col text-2xl text-[var(--lab-text-muted)]">
        <span>⌈</span>
        <span>⌊</span>
      </div>

      {/* Matrix entries */}
      <div className="flex flex-col gap-1 px-2">
        <div className="flex gap-4">
          <span className="w-12 text-right text-[var(--lab-accent)]">
            {displayMatrix.a11.toFixed(1)}
          </span>
          <span className="w-12 text-right text-[var(--lab-accent)]">
            {displayMatrix.a12.toFixed(1)}
          </span>
        </div>
        <div className="flex gap-4">
          <span className="w-12 text-right text-[var(--lab-accent)]">
            {displayMatrix.a21.toFixed(1)}
          </span>
          <span className="w-12 text-right text-[var(--lab-accent)]">
            {displayMatrix.a22.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Right bracket */}
      <div className="flex flex-col text-2xl text-[var(--lab-text-muted)]">
        <span>⌉</span>
        <span>⌋</span>
      </div>
    </div>
  )
}

/**
 * Entry Explanations List
 *
 * Shows what each matrix entry does geometrically.
 */
interface EntryExplanationsProps {
  matrix: Matrix2x2
  transformationType: TransformationType
}

function EntryExplanations({ matrix, transformationType }: EntryExplanationsProps) {
  const explanations = getEntryExplanations(matrix, transformationType)

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-[var(--lab-text)]">
        What each entry does:
      </h4>
      <ul className="space-y-1 text-sm text-[var(--lab-text-muted)]">
        {explanations.map((exp) => (
          <li key={exp.entry} className="flex items-start gap-2">
            <span className="font-mono text-[var(--lab-accent)]">
              {exp.entry} = {exp.value}:
            </span>
            <span>{exp.explanation}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Reveal Panel Component
 *
 * Modal overlay showing matrix notation and explanations.
 * Appears after successful challenge match.
 */
export function RevealPanel({
  matrix,
  transformationType,
  challengeName,
  isOpen,
  onTryAnother,
  onKeepExploring,
  className,
}: RevealPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  // Get transformation summary
  const summary = getTransformationDescription(matrix, transformationType)

  // Capitalize transformation type for display
  const typeLabel =
    transformationType.charAt(0).toUpperCase() + transformationType.slice(1)

  // Use challengeName in aria-label for accessibility
  const ariaLabel = `${challengeName} - Perfect Match`

  // Entrance animation
  useGSAP(
    () => {
      if (isOpen && panelRef.current && backdropRef.current) {
        // Animate backdrop
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: 'power2.out' }
        )

        // Animate panel
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.95, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.2)',
            delay: 0.1,
          }
        )
      }
    },
    { dependencies: [isOpen], scope: panelRef }
  )

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onKeepExploring()
      } else if (e.key === 'Enter') {
        onTryAnother()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onKeepExploring, onTryAnother])

  if (!isOpen) return null

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center', className)}>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onKeepExploring}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 w-[90vw] max-w-[400px]',
          'bg-[var(--lab-surface)] border border-[var(--lab-border)]',
          'rounded-xl p-6 shadow-2xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-2xl" aria-hidden>
            🎉
          </span>
          <h2
            id="reveal-title"
            className="text-xl font-semibold text-[var(--lab-text)] mt-2"
          >
            Perfect Match!
          </h2>
          <p className="text-sm text-[var(--lab-text-muted)] mt-1">
            You created a{' '}
            <span className="text-[var(--lab-accent)]">{typeLabel} Matrix</span>
          </p>
        </div>

        {/* Matrix notation */}
        <div className="flex justify-center mb-6">
          <MatrixNotation matrix={matrix} />
        </div>

        {/* Entry explanations */}
        <div className="mb-6">
          <EntryExplanations
            matrix={matrix}
            transformationType={transformationType}
          />
        </div>

        {/* Summary */}
        <p className="text-sm text-[var(--lab-text)] text-center mb-6 italic">
          "{summary}"
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="default"
            onClick={onTryAnother}
            className="flex-1 bg-[var(--lab-accent)] hover:bg-[var(--lab-accent-hover)] text-black"
          >
            Try Another
          </Button>
          <Button
            variant="outline"
            onClick={onKeepExploring}
            className="flex-1 border-[var(--lab-accent)] text-[var(--lab-accent)] hover:bg-[var(--lab-accent)]/10"
          >
            Keep Exploring
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RevealPanel
