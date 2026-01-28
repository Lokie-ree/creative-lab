# Slope Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive learning module where Grade 8 students discover slope as a visual rate of change through direct manipulation before encountering the formula.

**Architecture:** Stage-based learning flow (observe → manipulate → discover → celebrate) using React Three Fiber for 2D visualization. Students rank lines by steepness, drag points along lines to explore slope triangles, discover that slope is constant regardless of which points are chosen, and finally see the formula as earned notation for what they discovered.

**Tech Stack:** React 19 + TypeScript, React Three Fiber + drei, GSAP animations, Tailwind CSS, existing shared components (ParameterSlider, FeedbackBanner, etc.)

**Reference Docs:**
- PRD: `docs/modules/slope/prd.md`
- UX Spec: `docs/modules/slope/ux-spec.md`
- Build Prompts: `docs/modules/slope/build-order-prompts.md`
- Pattern Reference: `src/components/modules/sinewaves/ARCHITECTURE.md`

---

## Task 1: Foundation - Types & Constants

**Files:**
- Create: `src/components/modules/slope/utils/types.ts`

**Step 1: Create the types file**

```typescript
// src/components/modules/slope/utils/types.ts

export type Point2D = {
  x: number
  y: number
}

export type Line = {
  slope: number
  yIntercept: number
  color: string
  id: string
}

export type SlopeTriangle = {
  p1: Point2D
  p2: Point2D
  rise: number      // Vertical leg length (signed)
  run: number       // Horizontal leg length (signed)
  ratio: number     // rise / run (the slope)
  vertices: [Point2D, Point2D, Point2D]  // Right-angle triangle vertices
}

export type TriangleAngles = {
  angle1: number    // Angle at p1 (in degrees)
  angle2: number    // Angle at p2 (in degrees)
  angle3: number    // Right angle (always 90)
}

export type Stage = 'observe' | 'manipulate' | 'discover' | 'celebrate'

export type StageVisibility = {
  lines: boolean
  grid: boolean
  points: boolean
  triangle: boolean
  equation: boolean
  sliders: boolean
  angles: boolean
  secondTriangle: boolean
}

// Stage visibility configuration
export const STAGE_VISIBILITY: Record<Stage, StageVisibility> = {
  observe: {
    lines: true,
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false,
    angles: false,
    secondTriangle: false,
  },
  manipulate: {
    lines: true,
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false,
    angles: false,
    secondTriangle: false,
  },
  discover: {
    lines: true,
    grid: true,
    points: true,
    triangle: true,
    equation: false,
    sliders: false,
    angles: false,
    secondTriangle: false,
  },
  celebrate: {
    lines: true,
    grid: true,
    points: true,
    triangle: true,
    equation: true,
    sliders: true,
    angles: true,
    secondTriangle: true,
  },
}

// Coordinate system constants
export const COORDINATE_RANGE = {
  min: -10,
  max: 10,
}

// Default lines for observe/manipulate stages (slopes: -2, 0.5, 1, 2)
export const DEFAULT_LINE_SLOPES = [-2, 0.5, 1, 2]

// Slider ranges
export const SLIDER_RANGES = {
  slope: { min: -3, max: 3, step: 0.1 },
  yIntercept: { min: -5, max: 5, step: 0.1 },
}

// Challenge configuration
export const CHALLENGE_CONFIG = {
  targetSlope: 2,
  requiredTriangles: 3,
  slopeTolerance: 0.05,
  triangleDifferenceThreshold: 0.5, // Min distance between triangle points to count as "different"
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm build`
Expected: No errors in types.ts

**Step 3: Commit**

```bash
git add src/components/modules/slope/utils/types.ts
git commit -m "feat(slope): add foundation types and constants"
```

---

## Task 2: Foundation - Slope Math Utilities

**Files:**
- Create: `src/components/modules/slope/utils/slope-math.ts`

**Step 1: Create slope math utilities**

```typescript
// src/components/modules/slope/utils/slope-math.ts

import type { Point2D, SlopeTriangle, TriangleAngles } from './types'

/**
 * Calculate slope from two points
 * Returns Infinity for vertical lines, 0 for horizontal
 */
export function calculateSlope(p1: Point2D, p2: Point2D): number {
  const run = p2.x - p1.x
  const rise = p2.y - p1.y

  if (run === 0) {
    return rise > 0 ? Infinity : -Infinity
  }

  return rise / run
}

/**
 * Create a line equation function from slope and y-intercept
 * Returns y = mx + b function
 */
export function lineEquation(slope: number, yIntercept: number): (x: number) => number {
  return (x: number) => slope * x + yIntercept
}

/**
 * Constrain a point to lie on a line
 * Projects the point onto the nearest point on the line
 */
export function constrainPointToLine(
  point: Point2D,
  slope: number,
  yIntercept: number
): Point2D {
  // Handle vertical line case
  if (!isFinite(slope)) {
    return { x: 0, y: point.y }
  }

  // Handle horizontal line case
  if (slope === 0) {
    return { x: point.x, y: yIntercept }
  }

  // For line y = mx + b, find closest point to (px, py)
  // Perpendicular line through (px, py) has slope -1/m
  // Intersection gives closest point
  const perpSlope = -1 / slope
  const perpIntercept = point.y - perpSlope * point.x

  // Solve: mx + b = (-1/m)x + perpIntercept
  // x(m + 1/m) = perpIntercept - b
  const x = (perpIntercept - yIntercept) / (slope - perpSlope)
  const y = slope * x + yIntercept

  return { x, y }
}

/**
 * Calculate slope triangle geometry from two points
 * Creates right-angle triangle with horizontal run leg and vertical rise leg
 */
export function calculateSlopeTriangle(p1: Point2D, p2: Point2D): SlopeTriangle {
  // Ensure p1 is the left point (smaller x)
  const [left, right] = p1.x <= p2.x ? [p1, p2] : [p2, p1]

  const rise = right.y - left.y
  const run = right.x - left.x
  const ratio = run === 0 ? (rise > 0 ? Infinity : -Infinity) : rise / run

  // Triangle vertices: left point, right-angle corner, right point
  // Right angle is at the corner where rise meets run
  const rightAngleCorner: Point2D = { x: right.x, y: left.y }

  const vertices: [Point2D, Point2D, Point2D] = [
    left,           // Start point
    rightAngleCorner, // Right angle vertex
    right,          // End point
  ]

  return {
    p1: left,
    p2: right,
    rise,
    run,
    ratio,
    vertices,
  }
}

/**
 * Calculate triangle angles in degrees
 * For a slope triangle, angle3 is always 90 degrees
 */
export function calculateTriangleAngles(triangle: SlopeTriangle): TriangleAngles {
  const { rise, run } = triangle

  // angle1 is at p1 (left point) - angle between hypotenuse and run
  // This is arctan(rise/run)
  const angle1 = Math.abs(Math.atan2(Math.abs(rise), Math.abs(run)) * (180 / Math.PI))

  // angle2 is at p2 (right point) - complementary to angle1
  const angle2 = 90 - angle1

  // angle3 is always 90 degrees (right angle)
  const angle3 = 90

  return { angle1, angle2, angle3 }
}

/**
 * Check if two slope values match within tolerance
 */
export function slopesMatch(
  slope1: number,
  slope2: number,
  tolerance: number = 0.05
): boolean {
  // Handle infinity cases
  if (!isFinite(slope1) || !isFinite(slope2)) {
    return !isFinite(slope1) && !isFinite(slope2) && Math.sign(slope1) === Math.sign(slope2)
  }

  return Math.abs(slope1 - slope2) <= tolerance
}

/**
 * Check if two triangles are "different enough" to count as separate discoveries
 * Triangles are different if their defining points are sufficiently far apart
 */
export function trianglesAreDifferent(
  t1: SlopeTriangle,
  t2: SlopeTriangle,
  threshold: number = 0.5
): boolean {
  // Calculate distance between p1 points
  const d1 = Math.sqrt(
    Math.pow(t1.p1.x - t2.p1.x, 2) + Math.pow(t1.p1.y - t2.p1.y, 2)
  )

  // Calculate distance between p2 points
  const d2 = Math.sqrt(
    Math.pow(t1.p2.x - t2.p2.x, 2) + Math.pow(t1.p2.y - t2.p2.y, 2)
  )

  // Triangles are different if either point pair is far enough apart
  return d1 >= threshold || d2 >= threshold
}

/**
 * Format slope ratio for display
 * Shows as fraction if both rise and run are nice integers
 */
export function formatSlopeRatio(rise: number, run: number): string {
  const ratio = run === 0 ? Infinity : rise / run

  if (!isFinite(ratio)) {
    return 'undefined'
  }

  // Check if rise and run are close to integers
  const riseInt = Math.round(rise)
  const runInt = Math.round(run)

  if (Math.abs(rise - riseInt) < 0.01 && Math.abs(run - runInt) < 0.01 && runInt !== 0) {
    return `${riseInt}/${runInt} = ${ratio.toFixed(1)}`
  }

  return ratio.toFixed(2)
}
```

**Step 2: Verify TypeScript compiles**

Run: `pnpm build`
Expected: No errors in slope-math.ts

**Step 3: Commit**

```bash
git add src/components/modules/slope/utils/slope-math.ts
git commit -m "feat(slope): add slope math utilities"
```

---

## Task 3: Foundation - Index Export

**Files:**
- Create: `src/components/modules/slope/utils/index.ts`

**Step 1: Create index file**

```typescript
// src/components/modules/slope/utils/index.ts

export * from './types'
export * from './slope-math'
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/utils/index.ts
git commit -m "feat(slope): add utils index export"
```

---

## Task 4: Canvas & Coordinate Grid

**Files:**
- Create: `src/components/modules/slope/CoordinateGrid.tsx`

**Step 1: Create the coordinate grid component**

```typescript
// src/components/modules/slope/CoordinateGrid.tsx

import { useMemo } from 'react'
import { Line, Text } from '@react-three/drei'
import { colors } from '@/lib/colors'
import { COORDINATE_RANGE } from './utils'

interface CoordinateGridProps {
  visible: boolean
  showLabels?: boolean
}

export function CoordinateGrid({ visible, showLabels = true }: CoordinateGridProps) {
  if (!visible) return null

  const { min, max } = COORDINATE_RANGE
  const range = max - min

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: Array<{ points: [number, number, number][]; isAxis: boolean }> = []

    // Vertical lines (x = constant)
    for (let x = min; x <= max; x++) {
      lines.push({
        points: [
          [x, min, -0.1],
          [x, max, -0.1],
        ],
        isAxis: x === 0,
      })
    }

    // Horizontal lines (y = constant)
    for (let y = min; y <= max; y++) {
      lines.push({
        points: [
          [min, y, -0.1],
          [max, y, -0.1],
        ],
        isAxis: y === 0,
      })
    }

    return lines
  }, [min, max])

  // Generate axis labels (every 5 units)
  const axisLabels = useMemo(() => {
    const labels: Array<{ position: [number, number, number]; text: string }> = []

    for (let i = min; i <= max; i += 5) {
      if (i === 0) continue // Skip origin label

      // X-axis labels (below axis)
      labels.push({
        position: [i, min - 0.5, 0],
        text: String(i),
      })

      // Y-axis labels (left of axis)
      labels.push({
        position: [min - 0.5, i, 0],
        text: String(i),
      })
    }

    return labels
  }, [min, max])

  return (
    <group>
      {/* Grid lines */}
      {gridLines.map((line, index) => (
        <Line
          key={index}
          points={line.points}
          color={line.isAxis ? colors.text.secondary : colors.border.primary}
          lineWidth={line.isAxis ? 2 : 1}
          opacity={line.isAxis ? 0.8 : 0.3}
          transparent
        />
      ))}

      {/* Origin marker */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial color={colors.accent.primary} opacity={0.6} transparent />
      </mesh>

      {/* Axis labels */}
      {showLabels &&
        axisLabels.map((label, index) => (
          <Text
            key={index}
            position={label.position}
            fontSize={0.4}
            color={colors.text.secondary}
            anchorX="center"
            anchorY="middle"
            font="/fonts/mono.woff"
          >
            {label.text}
          </Text>
        ))}
    </group>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/CoordinateGrid.tsx
git commit -m "feat(slope): add coordinate grid component"
```

---

## Task 5: Line Component

**Files:**
- Create: `src/components/modules/slope/SlopeLine.tsx`

**Step 1: Create the line component**

```typescript
// src/components/modules/slope/SlopeLine.tsx

import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { colors } from '@/lib/colors'
import { COORDINATE_RANGE, type Line as LineType } from './utils'

interface SlopeLineProps {
  slope: number
  yIntercept: number
  color?: string
  lineWidth?: number
  opacity?: number
}

export function SlopeLine({
  slope,
  yIntercept,
  color = colors.accent.primary,
  lineWidth = 2,
  opacity = 1,
}: SlopeLineProps) {
  const { min, max } = COORDINATE_RANGE

  // Calculate line endpoints, constrained to coordinate range
  const points = useMemo(() => {
    // Handle vertical line case
    if (!isFinite(slope)) {
      return [
        [0, min, 0] as [number, number, number],
        [0, max, 0] as [number, number, number],
      ]
    }

    // Calculate y values at x = min and x = max
    let x1 = min
    let y1 = slope * x1 + yIntercept
    let x2 = max
    let y2 = slope * x2 + yIntercept

    // Constrain to visible range (clip at boundaries)
    if (y1 < min) {
      y1 = min
      x1 = (y1 - yIntercept) / slope
    } else if (y1 > max) {
      y1 = max
      x1 = (y1 - yIntercept) / slope
    }

    if (y2 < min) {
      y2 = min
      x2 = (y2 - yIntercept) / slope
    } else if (y2 > max) {
      y2 = max
      x2 = (y2 - yIntercept) / slope
    }

    return [
      [x1, y1, 0] as [number, number, number],
      [x2, y2, 0] as [number, number, number],
    ]
  }, [slope, yIntercept, min, max])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      opacity={opacity}
      transparent={opacity < 1}
    />
  )
}

// Line colors for the four initial lines
export const LINE_COLORS = [
  colors.accent.primary,      // Cyan
  '#f472b6',                  // Pink
  '#a78bfa',                  // Purple
  '#34d399',                  // Green
]
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/SlopeLine.tsx
git commit -m "feat(slope): add line component"
```

---

## Task 6: Draggable Point Component

**Files:**
- Create: `src/components/modules/slope/DraggablePoint.tsx`

**Step 1: Create the draggable point component**

```typescript
// src/components/modules/slope/DraggablePoint.tsx

import { useRef, useState, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { colors } from '@/lib/colors'
import { constrainPointToLine, type Point2D } from './utils'
import * as THREE from 'three'

interface DraggablePointProps {
  position: Point2D
  slope: number
  yIntercept: number
  onPositionChange: (newPosition: Point2D) => void
  color?: string
  size?: number
  disabled?: boolean
}

export function DraggablePoint({
  position,
  slope,
  yIntercept,
  onPositionChange,
  color = colors.accent.primary,
  size = 0.3,
  disabled = false,
}: DraggablePointProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { camera, size: canvasSize } = useThree()

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Point2D => {
      // Get canvas element
      const canvas = document.querySelector('canvas')
      if (!canvas) return position

      const rect = canvas.getBoundingClientRect()

      // Normalize to [-1, 1]
      const x = ((clientX - rect.left) / rect.width) * 2 - 1
      const y = -((clientY - rect.top) / rect.height) * 2 + 1

      // Unproject to world coordinates
      const vector = new THREE.Vector3(x, y, 0)
      vector.unproject(camera)

      return { x: vector.x, y: vector.y }
    },
    [camera, position]
  )

  const handlePointerDown = useCallback(
    (e: THREE.Event) => {
      if (disabled) return
      e.stopPropagation()
      setIsDragging(true)
      // Capture pointer for smooth dragging
      ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
    },
    [disabled]
  )

  const handlePointerMove = useCallback(
    (e: THREE.Event) => {
      if (!isDragging || disabled) return

      const worldPos = screenToWorld(e.clientX, e.clientY)
      const constrainedPos = constrainPointToLine(worldPos, slope, yIntercept)

      onPositionChange(constrainedPos)
    },
    [isDragging, disabled, screenToWorld, slope, yIntercept, onPositionChange]
  )

  const handlePointerUp = useCallback(
    (e: THREE.Event) => {
      setIsDragging(false)
      ;(e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId)
    },
    []
  )

  const handlePointerEnter = useCallback(() => {
    if (!disabled) {
      setIsHovered(true)
      document.body.style.cursor = 'grab'
    }
  }, [disabled])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    if (!isDragging) {
      document.body.style.cursor = 'default'
    }
  }, [isDragging])

  // Visual size based on hover/drag state
  const visualSize = isHovered || isDragging ? size * 1.3 : size

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, 0.1]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <circleGeometry args={[visualSize, 32]} />
      <meshBasicMaterial
        color={color}
        opacity={disabled ? 0.5 : 1}
        transparent
      />
    </mesh>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/DraggablePoint.tsx
git commit -m "feat(slope): add draggable point component"
```

---

## Task 7: Slope Triangle Component

**Files:**
- Create: `src/components/modules/slope/SlopeTriangle.tsx`

**Step 1: Create the slope triangle component**

```typescript
// src/components/modules/slope/SlopeTriangle.tsx

import { useMemo } from 'react'
import { Line, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { colors, colorWithOpacity } from '@/lib/colors'
import { calculateSlopeTriangle, formatSlopeRatio, type Point2D, type SlopeTriangle as SlopeTriangleType } from './utils'

interface SlopeTriangleProps {
  p1: Point2D
  p2: Point2D
  showLabels?: boolean
  showRatio?: boolean
  color?: string
  opacity?: number
}

export function SlopeTriangle({
  p1,
  p2,
  showLabels = true,
  showRatio = true,
  color = colors.accent.primary,
  opacity = 1,
}: SlopeTriangleProps) {
  const triangle = useMemo(() => calculateSlopeTriangle(p1, p2), [p1, p2])

  // Don't render if points are too close
  if (Math.abs(triangle.run) < 0.1 && Math.abs(triangle.rise) < 0.1) {
    return null
  }

  const { vertices, rise, run, ratio } = triangle

  // Create triangle shape for fill
  const triangleShape = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(vertices[0].x, vertices[0].y)
    shape.lineTo(vertices[1].x, vertices[1].y)
    shape.lineTo(vertices[2].x, vertices[2].y)
    shape.closePath()
    return shape
  }, [vertices])

  // Calculate label positions
  const riseLabelPos: [number, number, number] = [
    vertices[1].x + 0.4,
    (vertices[1].y + vertices[2].y) / 2,
    0.05,
  ]

  const runLabelPos: [number, number, number] = [
    (vertices[0].x + vertices[1].x) / 2,
    vertices[0].y - 0.4,
    0.05,
  ]

  const ratioPos: [number, number, number] = [
    (vertices[0].x + vertices[2].x) / 2 + 0.8,
    (vertices[0].y + vertices[2].y) / 2 + 0.8,
    0.05,
  ]

  return (
    <group>
      {/* Triangle fill */}
      <mesh position={[0, 0, 0.02]}>
        <shapeGeometry args={[triangleShape]} />
        <meshBasicMaterial
          color={color}
          opacity={opacity * 0.15}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Triangle stroke */}
      <Line
        points={[
          [vertices[0].x, vertices[0].y, 0.03],
          [vertices[1].x, vertices[1].y, 0.03],
          [vertices[2].x, vertices[2].y, 0.03],
          [vertices[0].x, vertices[0].y, 0.03],
        ]}
        color={color}
        lineWidth={2}
        opacity={opacity}
        transparent={opacity < 1}
      />

      {/* Right angle marker */}
      <RightAngleMarker
        vertex={vertices[1]}
        color={color}
        opacity={opacity}
      />

      {/* Rise label */}
      {showLabels && Math.abs(rise) >= 0.5 && (
        <Text
          position={riseLabelPos}
          fontSize={0.35}
          color={color}
          anchorX="left"
          anchorY="middle"
        >
          {`rise = ${rise.toFixed(1)}`}
        </Text>
      )}

      {/* Run label */}
      {showLabels && Math.abs(run) >= 0.5 && (
        <Text
          position={runLabelPos}
          fontSize={0.35}
          color={color}
          anchorX="center"
          anchorY="top"
        >
          {`run = ${run.toFixed(1)}`}
        </Text>
      )}

      {/* Ratio display */}
      {showRatio && (
        <Html position={ratioPos}>
          <div
            className="px-2 py-1 rounded text-sm font-bold whitespace-nowrap"
            style={{
              backgroundColor: colorWithOpacity(colors.background.primary, 0.9),
              color: color,
              border: `1px solid ${color}`,
            }}
          >
            slope = {formatSlopeRatio(rise, run)}
          </div>
        </Html>
      )}
    </group>
  )
}

// Right angle marker (small square at the corner)
function RightAngleMarker({
  vertex,
  color,
  opacity = 1,
  size = 0.25,
}: {
  vertex: Point2D
  color: string
  opacity?: number
  size?: number
}) {
  return (
    <Line
      points={[
        [vertex.x - size, vertex.y, 0.03],
        [vertex.x - size, vertex.y + size, 0.03],
        [vertex.x, vertex.y + size, 0.03],
      ]}
      color={color}
      lineWidth={1.5}
      opacity={opacity}
      transparent={opacity < 1}
    />
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/SlopeTriangle.tsx
git commit -m "feat(slope): add slope triangle component"
```

---

## Task 8: Scene Component

**Files:**
- Create: `src/components/modules/slope/Scene.tsx`

**Step 1: Create the main scene component**

```typescript
// src/components/modules/slope/Scene.tsx

import { Canvas, useThree } from '@react-three/fiber'
import { colors } from '@/lib/colors'
import { CoordinateGrid } from './CoordinateGrid'
import { SlopeLine, LINE_COLORS } from './SlopeLine'
import { DraggablePoint } from './DraggablePoint'
import { SlopeTriangle } from './SlopeTriangle'
import {
  type Stage,
  type Point2D,
  STAGE_VISIBILITY,
  DEFAULT_LINE_SLOPES,
} from './utils'

interface SceneProps {
  stage: Stage
  // Observe/Manipulate stage props
  lines?: Array<{ slope: number; yIntercept: number }>
  // Discover/Celebrate stage props
  currentSlope?: number
  currentYIntercept?: number
  point1?: Point2D
  point2?: Point2D
  onPoint1Change?: (pos: Point2D) => void
  onPoint2Change?: (pos: Point2D) => void
  // Celebrate stage props
  secondTrianglePoints?: { p1: Point2D; p2: Point2D }
  isVisible?: boolean
}

function Visualization({
  stage,
  lines,
  currentSlope = 2,
  currentYIntercept = 0,
  point1 = { x: 0, y: 0 },
  point2 = { x: 2, y: 4 },
  onPoint1Change,
  onPoint2Change,
  secondTrianglePoints,
}: Omit<SceneProps, 'isVisible'>) {
  const visibility = STAGE_VISIBILITY[stage]

  // Default lines for observe/manipulate stages
  const defaultLines = DEFAULT_LINE_SLOPES.map((slope, index) => ({
    slope,
    yIntercept: 0,
    color: LINE_COLORS[index],
  }))

  const displayLines = lines || defaultLines

  return (
    <>
      {/* Coordinate Grid */}
      <CoordinateGrid visible={visibility.grid} />

      {/* Lines */}
      {visibility.lines && (
        <>
          {stage === 'observe' || stage === 'manipulate' ? (
            // Multiple lines for ranking
            displayLines.map((line, index) => (
              <SlopeLine
                key={index}
                slope={line.slope}
                yIntercept={line.yIntercept}
                color={LINE_COLORS[index % LINE_COLORS.length]}
              />
            ))
          ) : (
            // Single line for discover/celebrate
            <SlopeLine
              slope={currentSlope}
              yIntercept={currentYIntercept}
              color={colors.accent.primary}
            />
          )}
        </>
      )}

      {/* Draggable Points (Discover/Celebrate) */}
      {visibility.points && (
        <>
          <DraggablePoint
            position={point1}
            slope={currentSlope}
            yIntercept={currentYIntercept}
            onPositionChange={onPoint1Change || (() => {})}
            disabled={stage === 'celebrate'}
          />
          <DraggablePoint
            position={point2}
            slope={currentSlope}
            yIntercept={currentYIntercept}
            onPositionChange={onPoint2Change || (() => {})}
            disabled={stage === 'celebrate'}
          />
        </>
      )}

      {/* Slope Triangle */}
      {visibility.triangle && (
        <SlopeTriangle
          p1={point1}
          p2={point2}
          showLabels={true}
          showRatio={true}
        />
      )}

      {/* Second Triangle (Celebrate stage) */}
      {visibility.secondTriangle && secondTrianglePoints && (
        <SlopeTriangle
          p1={secondTrianglePoints.p1}
          p2={secondTrianglePoints.p2}
          showLabels={true}
          showRatio={true}
          color={colors.learning.primary}
        />
      )}
    </>
  )
}

export function Scene({
  stage,
  lines,
  currentSlope,
  currentYIntercept,
  point1,
  point2,
  onPoint1Change,
  onPoint2Change,
  secondTrianglePoints,
  isVisible = true,
}: SceneProps) {
  if (!isVisible) {
    return null
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 15], fov: 50 }}
      style={{ background: colors.background.primary }}
    >
      <Visualization
        stage={stage}
        lines={lines}
        currentSlope={currentSlope}
        currentYIntercept={currentYIntercept}
        point1={point1}
        point2={point2}
        onPoint1Change={onPoint1Change}
        onPoint2Change={onPoint2Change}
        secondTrianglePoints={secondTrianglePoints}
      />
    </Canvas>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/Scene.tsx
git commit -m "feat(slope): add main scene component"
```

---

## Task 9: Challenge Progress Component

**Files:**
- Create: `src/components/modules/slope/ChallengeProgress.tsx`

**Step 1: Create the challenge progress component**

```typescript
// src/components/modules/slope/ChallengeProgress.tsx

import { cn } from '@/lib/utils'
import { CHALLENGE_CONFIG } from './utils'

interface ChallengeProgressProps {
  foundCount: number
  targetSlope: number
  visible: boolean
}

export function ChallengeProgress({
  foundCount,
  targetSlope,
  visible,
}: ChallengeProgressProps) {
  if (!visible) return null

  const { requiredTriangles } = CHALLENGE_CONFIG

  return (
    <div
      className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm border border-(--lab-border) rounded-lg px-4 py-3"
      data-stage-overlay
    >
      <p className="text-sm text-(--lab-text) mb-3">
        Find {requiredTriangles} DIFFERENT triangles with slope = {targetSlope}
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mb-2">
        {Array.from({ length: requiredTriangles }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300',
              i < foundCount
                ? 'bg-(--lab-accent) border-(--lab-accent) text-black'
                : 'bg-transparent border-(--lab-border) text-(--lab-text-muted)'
            )}
          >
            {i < foundCount ? '✓' : i + 1}
          </div>
        ))}
      </div>

      <p className="text-xs text-(--lab-text-muted)">
        {foundCount} of {requiredTriangles} found
      </p>
    </div>
  )
}

interface MatchFeedbackProps {
  count: number
  visible: boolean
}

export function MatchFeedback({ count, visible }: MatchFeedbackProps) {
  if (!visible) return null

  return (
    <div className="absolute top-20 right-4 bg-(--lab-accent)/20 border border-(--lab-accent) rounded-lg px-3 py-2 animate-fade-in">
      <p className="text-sm text-(--lab-accent) font-medium">
        ✓ Triangle {count} found! Keep going...
      </p>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/ChallengeProgress.tsx
git commit -m "feat(slope): add challenge progress component"
```

---

## Task 10: Stage Prompt Component

**Files:**
- Create: `src/components/modules/slope/StagePrompt.tsx`

**Step 1: Create the stage prompt component**

```typescript
// src/components/modules/slope/StagePrompt.tsx

import { type Stage } from './utils'

interface StagePromptProps {
  stage: Stage
  visible: boolean
}

const STAGE_PROMPTS: Record<Stage, { title: string; subtitle?: string }> = {
  observe: {
    title: 'Rank these from least steep to most steep',
    subtitle: 'Look at the lines and compare their steepness',
  },
  manipulate: {
    title: 'Drag to reorder the lines',
    subtitle: 'Arrange from least steep to most steep',
  },
  discover: {
    title: 'Find three DIFFERENT slope triangles with slope = 2',
    subtitle: 'Drag the points along the line to create different triangles',
  },
  celebrate: {
    title: 'You discovered why slope is constant!',
    subtitle: 'These similar triangles have the same ratios',
  },
}

export function StagePrompt({ stage, visible }: StagePromptProps) {
  if (!visible) return null

  const prompt = STAGE_PROMPTS[stage]

  return (
    <div
      className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-(--lab-border) rounded-lg px-4 py-3 max-w-sm"
      data-stage-overlay
    >
      <p className="text-base text-(--lab-text) font-medium">{prompt.title}</p>
      {prompt.subtitle && (
        <p className="text-sm text-(--lab-text-muted) mt-1">{prompt.subtitle}</p>
      )}
    </div>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/StagePrompt.tsx
git commit -m "feat(slope): add stage prompt component"
```

---

## Task 11: Formula Reveal Component

**Files:**
- Create: `src/components/modules/slope/FormulaReveal.tsx`

**Step 1: Create the formula reveal component**

```typescript
// src/components/modules/slope/FormulaReveal.tsx

import { type Point2D } from './utils'

interface FormulaRevealProps {
  p1: Point2D
  p2: Point2D
  visible: boolean
}

export function FormulaReveal({ p1, p2, visible }: FormulaRevealProps) {
  if (!visible) return null

  const rise = p2.y - p1.y
  const run = p2.x - p1.x
  const slope = run !== 0 ? rise / run : Infinity

  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-sm border-2 border-(--lab-accent) rounded-xl px-6 py-4 max-w-lg animate-fade-in"
      data-stage-overlay
    >
      <h3 className="text-lg font-bold text-(--lab-accent) mb-2">
        The Slope Formula
      </h3>
      <p className="text-sm text-(--lab-text) mb-4">
        You discovered that slope is constant. Here's the notation:
      </p>

      {/* Main formula */}
      <div className="bg-(--lab-bg) rounded-lg p-4 mb-4 text-center">
        <div className="text-2xl text-(--lab-accent) font-mono mb-2">
          slope = (y₂ - y₁) / (x₂ - x₁)
        </div>
        <div className="text-sm text-(--lab-text-muted)">
          Using your points: ({p1.x.toFixed(1)}, {p1.y.toFixed(1)}) and ({p2.x.toFixed(1)}, {p2.y.toFixed(1)})
        </div>
        <div className="text-lg text-(--lab-text) mt-2 font-mono">
          = ({p2.y.toFixed(1)} - {p1.y.toFixed(1)}) / ({p2.x.toFixed(1)} - {p1.x.toFixed(1)})
          = {rise.toFixed(1)} / {run.toFixed(1)}
          = {isFinite(slope) ? slope.toFixed(2) : 'undefined'}
        </div>
      </div>

      <p className="text-sm text-(--lab-text-muted) italic">
        This formula is just notation for the relationship you've been exploring!
      </p>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/FormulaReveal.tsx
git commit -m "feat(slope): add formula reveal component"
```

---

## Task 12: Main Module Component

**Files:**
- Create: `src/components/modules/slope/Module.tsx`

**Step 1: Create the main module orchestrator**

```typescript
// src/components/modules/slope/Module.tsx

import { useState, useCallback, useEffect } from 'react'
import { Scene } from './Scene'
import { StagePrompt } from './StagePrompt'
import { ChallengeProgress, MatchFeedback } from './ChallengeProgress'
import { FormulaReveal } from './FormulaReveal'
import {
  type Stage,
  type Point2D,
  type SlopeTriangle,
  CHALLENGE_CONFIG,
  calculateSlopeTriangle,
  slopesMatch,
  trianglesAreDifferent,
} from './utils'

interface ModuleProps {
  onComplete?: () => void
  isVisible?: boolean
}

export function Module({ onComplete, isVisible = true }: ModuleProps) {
  // Stage state
  const [stage, setStage] = useState<Stage>('observe')

  // Line parameters (for discover/celebrate stages)
  const [slope] = useState(CHALLENGE_CONFIG.targetSlope)
  const [yIntercept] = useState(0)

  // Point positions
  const [point1, setPoint1] = useState<Point2D>({ x: 0, y: 0 })
  const [point2, setPoint2] = useState<Point2D>({ x: 2, y: 4 })

  // Challenge state
  const [foundTriangles, setFoundTriangles] = useState<SlopeTriangle[]>([])
  const [showMatchFeedback, setShowMatchFeedback] = useState(false)

  // Second triangle for celebrate stage (different size, same slope)
  const [secondTrianglePoints] = useState<{ p1: Point2D; p2: Point2D }>({
    p1: { x: -4, y: -8 },
    p2: { x: -1, y: -2 },
  })

  // Handle point position changes
  const handlePoint1Change = useCallback((newPos: Point2D) => {
    setPoint1(newPos)
  }, [])

  const handlePoint2Change = useCallback((newPos: Point2D) => {
    setPoint2(newPos)
  }, [])

  // Check for matching triangles in discover stage
  useEffect(() => {
    if (stage !== 'discover') return

    const currentTriangle = calculateSlopeTriangle(point1, point2)
    const { targetSlope, slopeTolerance, triangleDifferenceThreshold, requiredTriangles } = CHALLENGE_CONFIG

    // Check if slope matches target
    if (!slopesMatch(currentTriangle.ratio, targetSlope, slopeTolerance)) {
      return
    }

    // Check if this triangle is different from all found triangles
    const isDifferent = foundTriangles.every((t) =>
      trianglesAreDifferent(currentTriangle, t, triangleDifferenceThreshold)
    )

    if (isDifferent) {
      setFoundTriangles((prev) => [...prev, currentTriangle])
      setShowMatchFeedback(true)

      // Hide feedback after 2 seconds
      setTimeout(() => setShowMatchFeedback(false), 2000)

      // Check if challenge complete
      if (foundTriangles.length + 1 >= requiredTriangles) {
        // Transition to celebrate stage after brief delay
        setTimeout(() => setStage('celebrate'), 1000)
      }
    }
  }, [point1, point2, stage, foundTriangles])

  // Auto-advance from observe to manipulate (for demo, normally user interaction triggers this)
  useEffect(() => {
    if (stage === 'observe') {
      const timer = setTimeout(() => setStage('manipulate'), 5000)
      return () => clearTimeout(timer)
    }
    if (stage === 'manipulate') {
      // Auto-advance to discover after 3 seconds (for demo)
      const timer = setTimeout(() => setStage('discover'), 3000)
      return () => clearTimeout(timer)
    }
  }, [stage])

  return (
    <div className="relative w-full h-full">
      {/* Main visualization */}
      <Scene
        stage={stage}
        currentSlope={slope}
        currentYIntercept={yIntercept}
        point1={point1}
        point2={point2}
        onPoint1Change={handlePoint1Change}
        onPoint2Change={handlePoint2Change}
        secondTrianglePoints={stage === 'celebrate' ? secondTrianglePoints : undefined}
        isVisible={isVisible}
      />

      {/* Stage prompt */}
      <StagePrompt stage={stage} visible={true} />

      {/* Challenge progress (discover stage) */}
      <ChallengeProgress
        foundCount={foundTriangles.length}
        targetSlope={CHALLENGE_CONFIG.targetSlope}
        visible={stage === 'discover'}
      />

      {/* Match feedback */}
      <MatchFeedback
        count={foundTriangles.length}
        visible={showMatchFeedback}
      />

      {/* Formula reveal (celebrate stage) */}
      <FormulaReveal
        p1={point1}
        p2={point2}
        visible={stage === 'celebrate'}
      />
    </div>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/Module.tsx
git commit -m "feat(slope): add main module orchestrator"
```

---

## Task 13: Module Index Export

**Files:**
- Create: `src/components/modules/slope/index.ts`

**Step 1: Create module index**

```typescript
// src/components/modules/slope/index.ts

export { Module } from './Module'
export { Scene } from './Scene'
export { CoordinateGrid } from './CoordinateGrid'
export { SlopeLine } from './SlopeLine'
export { DraggablePoint } from './DraggablePoint'
export { SlopeTriangle } from './SlopeTriangle'
export { StagePrompt } from './StagePrompt'
export { ChallengeProgress } from './ChallengeProgress'
export { FormulaReveal } from './FormulaReveal'
export * from './utils'
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/index.ts
git commit -m "feat(slope): add module index export"
```

---

## Task 14: Add Storybook Story for Development

**Files:**
- Create: `src/components/modules/slope/Module.stories.tsx`

**Step 1: Create Storybook story**

```typescript
// src/components/modules/slope/Module.stories.tsx

import type { Meta, StoryObj } from '@storybook/react'
import { Module } from './Module'

const meta: Meta<typeof Module> = {
  title: 'Modules/Slope',
  component: Module,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Module>

export const Default: Story = {
  args: {
    isVisible: true,
  },
}

export const ObserveStage: Story = {
  args: {
    isVisible: true,
  },
}
```

**Step 2: Verify Storybook runs**

Run: `pnpm storybook`
Expected: Story renders without errors

**Step 3: Commit**

```bash
git add src/components/modules/slope/Module.stories.tsx
git commit -m "feat(slope): add Storybook story for development"
```

---

## Task 15: Visual Testing & Iteration

**Files:**
- None (testing existing components)

**Step 1: Run Storybook and verify all stages**

Run: `pnpm storybook`

Verify:
1. Observe stage shows 4 lines without grid
2. Manipulate stage (auto-advances after 5s)
3. Discover stage shows grid, points, triangle
4. Points can be dragged along line
5. Triangle updates as points move
6. Slope ratio displays correctly
7. Challenge progress tracks found triangles
8. Celebrate stage shows formula reveal

**Step 2: Fix any visual issues**

Common issues to check:
- Line clipping at coordinate boundaries
- Point drag responsiveness
- Triangle geometry correctness
- Label positioning and readability
- Mobile responsiveness

**Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix(slope): visual polish and bug fixes"
```

---

## Summary

This plan implements the slope module in 15 tasks:

1. **Tasks 1-3**: Foundation (types, math utilities, exports)
2. **Tasks 4-8**: Core visualization (grid, line, points, triangle, scene)
3. **Tasks 9-11**: UI overlays (challenge progress, prompts, formula reveal)
4. **Tasks 12-13**: Module orchestrator and exports
5. **Tasks 14-15**: Development tools and testing

**Key patterns followed:**
- Stage machine with visibility rules (like sinewaves module)
- R3F Canvas with conditional rendering
- GSAP animations for transitions
- Progressive disclosure of UI elements
- TDD-style incremental development

**Next steps after this plan:**
- Add drag-to-rank interaction for observe/manipulate stages
- Implement similar triangles proof visualization with angles
- Add idle nudges and hint system
- Responsive layout optimization
- Accessibility improvements
