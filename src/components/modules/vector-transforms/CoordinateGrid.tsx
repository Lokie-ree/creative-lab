/**
 * Vector Transformations Module - Coordinate Grid Component
 *
 * Renders a 2D coordinate grid with axes, gridlines, and origin marker.
 * Provides spatial reference for vector visualization.
 */

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { colors } from '@/lib/colors'

interface CoordinateGridProps {
  /** Grid range (default: -3 to 3 on both axes) */
  range?: number
  /** Whether to show axis labels (labels rendered via HTML overlay) */
  showLabels?: boolean
}

/**
 * Grid configuration constants
 */
const GRID_COLOR = colors.border.muted
const AXIS_COLOR = colors.text.secondary
const GRID_OPACITY = 0.3
const AXIS_OPACITY = 0.8
const GRID_LINE_WIDTH = 1
const AXIS_LINE_WIDTH = 2
const ORIGIN_RADIUS = 0.08
const ORIGIN_COLOR = colors.accent.primary
const ORIGIN_OPACITY = 0.6

/**
 * Generate points for gridlines
 */
function useGridLines(range: number) {
  return useMemo(() => {
    const lines: Array<{
      points: [number, number, number][]
      isAxis: boolean
    }> = []

    // Vertical lines (x = -range to range)
    for (let x = -range; x <= range; x++) {
      lines.push({
        points: [
          [x, -range, 0],
          [x, range, 0],
        ],
        isAxis: x === 0,
      })
    }

    // Horizontal lines (y = -range to range)
    for (let y = -range; y <= range; y++) {
      lines.push({
        points: [
          [-range, y, 0],
          [range, y, 0],
        ],
        isAxis: y === 0,
      })
    }

    return lines
  }, [range])
}

/**
 * Origin marker component - small sphere at (0,0)
 */
function OriginMarker() {
  return (
    <mesh position={[0, 0, 0]}>
      <circleGeometry args={[ORIGIN_RADIUS, 32]} />
      <meshBasicMaterial
        color={ORIGIN_COLOR}
        opacity={ORIGIN_OPACITY}
        transparent
      />
    </mesh>
  )
}

/**
 * Coordinate Grid Component
 *
 * Renders:
 * - Major gridlines every 1 unit
 * - Thicker axis lines at x=0 and y=0
 * - Origin marker at (0,0)
 *
 * Grid is positioned at z=-0.1 to render behind vectors.
 */
export function CoordinateGrid({ range = 3 }: CoordinateGridProps) {
  const gridLines = useGridLines(range)

  return (
    <group position={[0, 0, -0.1]}>
      {/* Grid lines */}
      {gridLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.isAxis ? AXIS_COLOR : GRID_COLOR}
          lineWidth={line.isAxis ? AXIS_LINE_WIDTH : GRID_LINE_WIDTH}
          opacity={line.isAxis ? AXIS_OPACITY : GRID_OPACITY}
          transparent
        />
      ))}

      {/* Origin marker */}
      <OriginMarker />
    </group>
  )
}

/**
 * Coordinate Labels Component (HTML Overlay)
 *
 * Renders axis labels outside the R3F Canvas as HTML elements.
 * This provides crisp text that isn't affected by canvas scaling.
 */
interface CoordinateLabelsProps {
  range?: number
}

export function CoordinateLabels({ range = 3 }: CoordinateLabelsProps) {
  const labels = useMemo(() => {
    const items: Array<{
      value: number
      axis: 'x' | 'y'
    }> = []

    for (let i = -range; i <= range; i++) {
      if (i !== 0) {
        // Skip 0 (origin is marked differently)
        items.push({ value: i, axis: 'x' })
        items.push({ value: i, axis: 'y' })
      }
    }

    return items
  }, [range])

  // Calculate position percentages for labels
  // Grid spans from -range to +range, centered in container
  const getXPosition = (value: number) => {
    // Map value from [-range, range] to [0%, 100%]
    return ((value + range) / (range * 2)) * 100
  }

  const getYPosition = (value: number) => {
    // Map value from [-range, range] to [100%, 0%] (Y is inverted in CSS)
    return ((range - value) / (range * 2)) * 100
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* X-axis labels (bottom) */}
      {labels
        .filter((l) => l.axis === 'x')
        .map((label) => (
          <span
            key={`x-${label.value}`}
            className="absolute text-[10px] font-mono text-[var(--lab-text-dim)] -translate-x-1/2"
            style={{
              left: `${getXPosition(label.value)}%`,
              bottom: '4px',
            }}
          >
            {label.value}
          </span>
        ))}

      {/* Y-axis labels (left) */}
      {labels
        .filter((l) => l.axis === 'y')
        .map((label) => (
          <span
            key={`y-${label.value}`}
            className="absolute text-[10px] font-mono text-[var(--lab-text-dim)] -translate-y-1/2"
            style={{
              left: '4px',
              top: `${getYPosition(label.value)}%`,
            }}
          >
            {label.value}
          </span>
        ))}

      {/* Origin label */}
      <span
        className="absolute text-[10px] font-mono text-[var(--lab-text-dim)]"
        style={{
          left: `${getXPosition(0)}%`,
          bottom: '4px',
          transform: 'translateX(-50%)',
        }}
      >
        0
      </span>
    </div>
  )
}

export default CoordinateGrid
