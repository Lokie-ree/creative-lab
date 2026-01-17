/**
 * Matrix Preview Component
 *
 * Persistent display showing current matrix values and discovered transformation type.
 * Similar to FormulaPreview in sinewaves module.
 */

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'
import { fadeInSlideRight, pulse } from '@/lib/animations'
import type { Matrix2x2, TransformationType } from './utils'
import { VECTOR_TRANSFORMS_COPY } from '@/config/vector-transforms-copy'

interface MatrixPreviewProps {
  /** Current matrix values */
  matrix: Matrix2x2
  /** Set of discovered transformation types */
  discoveredTypes: Set<TransformationType>
  /** Current transformation type based on matrix */
  currentType: TransformationType
  /** Additional CSS classes */
  className?: string
}

/**
 * Get display label for transformation type
 */
function getTypeLabel(type: TransformationType): string {
  const labels: Record<TransformationType, string> = {
    identity: 'Identity',
    scaling: VECTOR_TRANSFORMS_COPY.discoveries.scaling.title,
    rotation: VECTOR_TRANSFORMS_COPY.discoveries.rotation.title,
    reflection: VECTOR_TRANSFORMS_COPY.discoveries.reflection.title,
    shearing: VECTOR_TRANSFORMS_COPY.discoveries.shearing.title,
  }
  return labels[type]
}

export function MatrixPreview({
  matrix,
  discoveredTypes,
  currentType,
  className,
}: MatrixPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)
  const a11Ref = useRef<HTMLSpanElement>(null)
  const a12Ref = useRef<HTMLSpanElement>(null)
  const a21Ref = useRef<HTMLSpanElement>(null)
  const a22Ref = useRef<HTMLSpanElement>(null)
  const prevMatrixRef = useRef<Matrix2x2>(matrix)

  // Entrance animation - only once when component first appears
  useGSAP(
    () => {
      if (containerRef.current && !hasAnimatedRef.current) {
        fadeInSlideRight(containerRef.current)
        hasAnimatedRef.current = true
      }
    },
    { dependencies: [], scope: containerRef }
  )

  // Pulse animation on matrix value changes
  useGSAP(
    () => {
      const prev = prevMatrixRef.current
      const refs = [
        { ref: a11Ref, changed: Math.abs(matrix.a11 - prev.a11) > 0.05 },
        { ref: a12Ref, changed: Math.abs(matrix.a12 - prev.a12) > 0.05 },
        { ref: a21Ref, changed: Math.abs(matrix.a21 - prev.a21) > 0.05 },
        { ref: a22Ref, changed: Math.abs(matrix.a22 - prev.a22) > 0.05 },
      ]

      refs.forEach(({ ref, changed }) => {
        if (changed && ref.current) {
          pulse(ref.current)
        }
      })

      prevMatrixRef.current = matrix
    },
    { dependencies: [matrix.a11, matrix.a12, matrix.a21, matrix.a22], scope: containerRef }
  )

  // Don't show until at least one non-identity discovery
  const hasAnyDiscovery = discoveredTypes.size > 0

  if (!hasAnyDiscovery) return null

  // Show transformation type label if current type has been discovered
  const showTypeLabel =
    currentType !== 'identity' && discoveredTypes.has(currentType)

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-(--lab-surface)/90 backdrop-blur-sm border border-(--lab-border) rounded-xl',
        'px-3 py-2 sm:px-4 sm:py-3 font-mono text-sm',
        className
      )}
    >
      {/* Label */}
      <div className="text-(--lab-text-muted) text-xs uppercase tracking-wider mb-2">
        Current Matrix
      </div>

      {/* Matrix display with bracket notation */}
      <div className="flex items-center gap-1">
        {/* Left bracket */}
        <span className="text-(--lab-text-muted) text-2xl leading-none self-stretch flex items-center">
          [
        </span>

        {/* Matrix values */}
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-3">
            <span
              ref={a11Ref}
              className={cn(
                'w-8 text-right tabular-nums',
                matrix.a11 !== 1 ? 'text-(--lab-accent)' : 'text-(--lab-text-muted)'
              )}
            >
              {matrix.a11.toFixed(1)}
            </span>
            <span
              ref={a12Ref}
              className={cn(
                'w-8 text-right tabular-nums',
                matrix.a12 !== 0 ? 'text-(--lab-accent)' : 'text-(--lab-text-muted)'
              )}
            >
              {matrix.a12.toFixed(1)}
            </span>
          </div>
          <div className="flex gap-3">
            <span
              ref={a21Ref}
              className={cn(
                'w-8 text-right tabular-nums',
                matrix.a21 !== 0 ? 'text-(--lab-accent)' : 'text-(--lab-text-muted)'
              )}
            >
              {matrix.a21.toFixed(1)}
            </span>
            <span
              ref={a22Ref}
              className={cn(
                'w-8 text-right tabular-nums',
                matrix.a22 !== 1 ? 'text-(--lab-accent)' : 'text-(--lab-text-muted)'
              )}
            >
              {matrix.a22.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right bracket */}
        <span className="text-(--lab-text-muted) text-2xl leading-none self-stretch flex items-center">
          ]
        </span>
      </div>

      {/* Transformation type label */}
      {showTypeLabel && (
        <div className="mt-2 pt-2 border-t border-(--lab-border)">
          <span className="text-xs text-(--lab-accent)">{getTypeLabel(currentType)}</span>
        </div>
      )}
    </div>
  )
}

export default MatrixPreview
