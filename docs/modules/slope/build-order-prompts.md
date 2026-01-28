# Slope Module
## Build-Order Prompts

**Version:** 1.0  
**Created:** January 2026  
**Based on:** UX Spec v1.0  
**Purpose:** Sequential, self-contained prompts for UI generation tools

---

## Overview

Interactive learning module where Grade 8 students discover slope as a visual, measurable relationship (rate of change) through direct manipulation before encountering the formula. Students rank lines by steepness, explore slope triangles, discover that slope is constant, and finally see the formula as earned notation.

**Tech Stack:**
- React Three Fiber + drei for 2D visualization
- GSAP for animations
- Tailwind CSS with lab color system
- TypeScript

---

## Build Sequence

1. **Foundation** - Math utilities, types, design tokens
2. **Canvas & Grid** - Coordinate system with progressive reveal
3. **Lines & Points** - Draggable lines and constrained points
4. **Slope Triangles** - Right-angle triangles with labeled legs
5. **Stage Manager** - Observe → Manipulate → Discover → Celebrate flow
6. **Challenge Mode** - "Find three triangles with slope = 2"
7. **Similar Triangles Proof** - Two triangles, angles, constant ratio reveal
8. **Controls & Feedback** - Sliders, equation display, hints
9. **Polish** - Responsive, accessibility, performance

---

## Prompt 1: Foundation & Slope Math

### Context

Building the core mathematical foundation for the slope module. Users will manipulate points along lines, calculate slope triangles, and discover that slope is constant regardless of which points are chosen.

### Requirements

- Create TypeScript utilities for slope calculations
- Define design tokens matching the lab color system
- Set up core types for lines, points, triangles, and stage state

### Core Math Functions Needed

```typescript
// Calculate slope from two points
function calculateSlope(p1: Point2D, p2: Point2D): number
// Returns: (y₂ - y₁) / (x₂ - x₁)

// Calculate line equation from slope and y-intercept
function lineEquation(slope: number, yIntercept: number): (x: number) => number
// Returns: y = mx + b function

// Constrain point to line (for dragging)
function constrainPointToLine(
  point: Point2D, 
  slope: number, 
  yIntercept: number
): Point2D
// Returns: Nearest point on line to dragged position

// Calculate slope triangle geometry
function calculateSlopeTriangle(
  p1: Point2D, 
  p2: Point2D
): SlopeTriangle
// Returns: { rise: number, run: number, ratio: number, vertices: [Point2D, Point2D, Point2D] }

// Check if two triangles have same slope (within tolerance)
function slopesMatch(
  triangle1: SlopeTriangle, 
  triangle2: SlopeTriangle, 
  tolerance: number = 0.01
): boolean

// Calculate angle measurements for similar triangles proof
function calculateTriangleAngles(triangle: SlopeTriangle): TriangleAngles
// Returns: { angle1: number, angle2: number, angle3: number } (in degrees)
```

### Types to Define

```typescript
type Point2D = {
  x: number
  y: number
}

type Line = {
  slope: number
  yIntercept: number
  color: string
  id: string
}

type SlopeTriangle = {
  p1: Point2D
  p2: Point2D
  rise: number      // Vertical leg length
  run: number       // Horizontal leg length
  ratio: number     // rise / run (the slope)
  vertices: [Point2D, Point2D, Point2D]  // Right-angle triangle vertices
}

type TriangleAngles = {
  angle1: number    // Angle at p1
  angle2: number    // Angle at p2
  angle3: number    // Right angle (always 90°)
}

type Stage = 
  | 'observe'      // Four lines, no grid, ranking prompt
  | 'manipulate'   // Lines draggable, ranking feedback
  | 'discover'     // Single line, points, triangle, ratio, challenge
  | 'celebrate'    // Two triangles, angles, proof, formula

type StageVisibility = {
  lines: boolean
  grid: boolean
  points: boolean
  triangle: boolean
  equation: boolean
  sliders: boolean
  angles: boolean
  secondTriangle: boolean
}
```

### Coordinate System Constants

```typescript
const COORDINATE_RANGE = {
  min: -10,
  max: 10
}

const DEFAULT_POINT_POSITIONS = {
  nearOrigin: { x: 0, y: 0 },
  farOut: { x: 2, y: 4 }  // For slope = 2 line
}

const DEFAULT_LINE_SLOPES = [-2, 0.5, 1, 2]  // Initial four lines

const SLIDER_RANGES = {
  slope: { min: -3, max: 3, step: 0.1 },
  yIntercept: { min: -5, max: 5, step: 0.1 }
}
```

### Design Tokens

Use existing lab color system:

```typescript
const colors = {
  line1: 'var(--lab-accent)',        // First line color
  line2: 'var(--lab-accent-muted)',  // Second line color
  line3: 'var(--lab-text)',           // Third line color
  line4: 'var(--lab-text-muted)',    // Fourth line color
  point: 'var(--lab-accent)',         // Draggable points
  triangle: 'var(--lab-accent)',      // Triangle stroke
  triangleFill: 'rgba(34, 211, 238, 0.1)',  // Semi-transparent fill
  grid: 'var(--lab-border)',          // Grid lines
  text: 'var(--lab-text)',            // Labels and text
  textDim: 'var(--lab-text-dim)',     // Muted labels
  bg: 'var(--lab-bg)',                // Canvas background
}
```

### Constraints

- All math must be client-side (no API calls)
- Handle edge cases: vertical lines (undefined slope), overlapping points
- Slope calculations use standard formula: (y₂ - y₁) / (x₂ - x₁)
- Triangle vertices form right-angle triangle (horizontal run, vertical rise)
- Don't implement UI components yet—just the utilities

### File Structure

```
/src/components/modules/slope/
└── utils/
    ├── slope-math.ts    # calculateSlope, lineEquation, constrainPointToLine
    ├── triangle-geometry.ts  # calculateSlopeTriangle, calculateTriangleAngles
    ├── types.ts          # All TypeScript types
    └── colors.ts         # Design tokens
```

---

## Prompt 2: Canvas & Coordinate Grid

### Context

Creating the visualization canvas where lines, points, and slope triangles will be displayed. The grid must support progressive reveal (hidden in Observe stage, visible in Discover/Celebrate stages).

### Requirements

**Canvas dimensions:**
- Default: 600px × 600px (square for coordinate symmetry)
- Responsive: Scale down to fit mobile (min 320px width)
- Coordinate system: -10 to +10 on both axes (20 units total per axis)
- Maintain 1:1 aspect ratio

**Grid appearance:**
- Major gridlines every 1 unit
- Axis lines (x=0, y=0) slightly thicker (2px vs 1px)
- Axis color: `var(--lab-text-dim)` with opacity 0.8
- Grid color: `var(--lab-border)` with opacity 0.3
- Origin point (0,0) marked with small circle (4px radius)
- Grid visibility controlled by stage (hidden in Observe, visible in Discover/Celebrate)

**Coordinate labels:**
- X-axis: -10, -5, 0, 5, 10 (bottom edge, major ticks only)
- Y-axis: -10, -5, 0, 5, 10 (left edge, major ticks only)
- Font: monospace, 10px, `var(--lab-text-dim)`
- Position labels outside grid area
- Labels hidden in Observe stage, visible in Discover/Celebrate

### Layout Structure

```
┌────────────────────────────────────┐
│  Y-axis labels                     │
│  -10  -5   0   5   10              │
│                                    │
│  10 ·  ·  ·  ·  ·  ·  ·            │
│   5 ·  ·  ·  ·  ·  ·  ·            │
│   0 ·  ·  ·  +──────────►  x       │
│  -5 ·  ·  ·  │  ·  ·  ·            │
│ -10 ·  ·  ·  │  ·  ·  ·            │
│             ▼                      │
│             y                      │
│                                    │
│     X-axis labels                  │
└────────────────────────────────────┘
```

### Technical Details - React Three Fiber

**Camera setup:**
- Use orthographic camera (no perspective distortion)
- Position: `[0, 0, 10]` looking at origin
- Zoom level adjusted so [-10, 10] range fills canvas

**Grid implementation:**

Option A - Use drei's Grid helper:
```typescript
import { Grid } from '@react-three/drei'

<Grid 
  args={[20, 20]}          // 20 units per axis
  cellSize={1}             // Major gridline every 1 unit
  cellColor="#888888"      // Grid line color
  sectionSize={0}          // No section divisions
  fadeDistance={50}        // Don't fade
  infiniteGrid={false}     // Bounded grid
  visible={showGrid}       // Stage-controlled visibility
/>
```

Option B - Custom line components:
```typescript
// Horizontal lines: y = -10 to 10
// Vertical lines: x = -10 to 10
// Use drei's Line component for each gridline
```

**Axis lines (special styling):**
- X-axis: Line from (-10, 0, 0) to (10, 0, 0), width 2px
- Y-axis: Line from (0, -10, 0) to (0, 10, 0), width 2px

**Origin marker:**
- Small sphere at (0, 0, 0) with radius 0.08
- Color: `var(--lab-accent)` with opacity 0.6

### Coordinate Labels (HTML Overlay)

Use HTML overlays (not 3D text) for better readability:

```typescript
import { Html } from '@react-three/drei'

// Position labels at grid edges
<Html position={[5, -10.3, 0]}>
  <span className="text-xs font-mono text-dim">5</span>
</Html>
```

Or use absolute-positioned div overlays outside the Canvas.

### States

- **Observe stage:** Grid hidden, no labels
- **Discover/Celebrate stages:** Grid visible, labels visible
- **Grid never moves:** Only content transforms, grid stays fixed

### Constraints

- Grid must be visually stable (no rotation or zoom)
- Ensure grid renders at z = -0.1 (behind lines/points which are at z = 0)
- Labels should be crisp (not affected by canvas scaling)
- Maintain 1:1 aspect ratio to avoid distortion
- Grid visibility controlled by stage prop

### Component Structure

```typescript
interface CoordinateGridProps {
  visible: boolean  // Stage-controlled
  range: { min: number, max: number }  // Default: -10 to 10
}

export function CoordinateGrid({ visible, range }: CoordinateGridProps) {
  if (!visible) return null
  
  return (
    <>
      <Grid args={[range.max - range.min, range.max - range.min]} />
      <AxisLines />
      <OriginMarker />
      <CoordinateLabels range={range} />
    </>
  )
}
```

---

## Prompt 3: Lines & Draggable Points

### Context

Build the visual representation of lines on the coordinate plane and draggable points that can be moved along those lines. Lines must support drag-to-rank in Observe/Manipulate stages, and points must be constrained to their line in Discover stage.

### Requirements

**Line appearance:**
- Stroke width: 2px
- Color: Distinct color per line (from design tokens)
- Extends across visible coordinate range (-10 to 10)
- Lines render at z = 0

**Line interaction (Observe → Manipulate stages):**
- Lines become draggable for ranking
- Visual feedback on hover (cursor: grab, line slightly brighter)
- Visual feedback on drag (line follows cursor, other lines shift)
- Snap to ranked position on release
- Ranking order stored in state

**Point appearance:**
- Size: 8px radius circle
- Color: `var(--lab-accent)`
- Hover state: Slightly larger (10px), subtle glow effect
- Points render at z = 0.1 (above lines)

**Point interaction (Discover stage):**
- Points draggable along their line
- Movement constrained to line equation (point cannot leave line)
- Visual feedback: Point follows cursor but snaps to line
- Smooth animation when constrained (200ms)
- Triangle updates in real-time as points move

### Line Component

```typescript
interface LineProps {
  slope: number
  yIntercept: number
  color: string
  id: string
  draggable?: boolean  // For ranking in Manipulate stage
  onDragStart?: () => void
  onDrag?: (newY: number) => void
  onDragEnd?: () => void
  zIndex?: number
}

export function Line({
  slope,
  yIntercept,
  color,
  id,
  draggable = false,
  onDragStart,
  onDrag,
  onDragEnd,
  zIndex = 0
}: LineProps) {
  // Calculate line endpoints for coordinate range
  const startX = -10
  const endX = 10
  const startY = slope * startX + yIntercept
  const endY = slope * endX + yIntercept
  
  // Constrain to visible range
  const constrainedStart = constrainToRange({ x: startX, y: startY })
  const constrainedEnd = constrainToRange({ x: endX, y: endY })
  
  return (
    <Line
      points={[
        [constrainedStart.x, constrainedStart.y, zIndex],
        [constrainedEnd.x, constrainedEnd.y, zIndex]
      ]}
      color={color}
      lineWidth={2}
      // Add drag handlers if draggable
    />
  )
}
```

### Point Component

```typescript
interface DraggablePointProps {
  position: Point2D
  line: Line  // { slope, yIntercept }
  onDrag: (newPosition: Point2D) => void
  color?: string
  size?: number
}

export function DraggablePoint({
  position,
  line,
  onDrag,
  color = 'var(--lab-accent)',
  size = 8
}: DraggablePointProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hovered, setHovered] = useState(false)
  
  const handleDrag = (event: DragEvent) => {
    // Convert screen coordinates to world coordinates
    const worldPos = screenToWorld(event.clientX, event.clientY)
    
    // Constrain to line
    const constrainedPos = constrainPointToLine(worldPos, line.slope, line.yIntercept)
    
    // Update position with animation
    gsap.to(position, {
      x: constrainedPos.x,
      y: constrainedPos.y,
      duration: 0.2,
      ease: 'power2.out',
      onUpdate: () => onDrag(constrainedPos)
    })
  }
  
  return (
    <mesh
      position={[position.x, position.y, 0.1]}
      onPointerDown={() => setIsDragging(true)}
      onPointerMove={isDragging ? handleDrag : undefined}
      onPointerUp={() => setIsDragging(false)}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <circleGeometry args={[hovered ? size * 1.25 : size, 32]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}
```

### Four Lines Setup (Observe Stage)

```typescript
const initialLines: Line[] = [
  { slope: -2, yIntercept: 0, color: colors.line1, id: 'line1' },
  { slope: 0.5, yIntercept: 0, color: colors.line2, id: 'line2' },
  { slope: 1, yIntercept: 0, color: colors.line3, id: 'line3' },
  { slope: 2, yIntercept: 0, color: colors.line4, id: 'line4' }
]
```

### Single Line Setup (Discover/Celebrate Stages)

```typescript
const discoverLine: Line = {
  slope: 2,  // Default slope for challenge
  yIntercept: 0,
  color: colors.line1,
  id: 'discover-line'
}
```

### States

| State | Lines Visible | Points Visible | Interaction |
|-------|--------------|----------------|-------------|
| Observe | 4 lines, no grid | None | None (passive observation) |
| Manipulate | 4 lines, draggable | None | Drag lines to rank |
| Discover | 1 line, grid visible | 2 points, draggable | Drag points along line |
| Celebrate | 1 line, grid visible | 2 points (fixed positions) | None (observation) |

### Constraints

- Points must never leave their line (constraint enforced in drag handler)
- Line dragging only active in Manipulate stage
- Point dragging only active in Discover stage
- Visual feedback must be immediate (no lag)
- Animation smooth (60fps)

### Integration Points

- Lines connect to stage manager (visibility controlled by stage)
- Points connect to triangle calculation (Prompt 4)
- Point positions trigger real-time triangle updates

---

## Prompt 4: Slope Triangles & Ratio Display

### Context

Build the visual representation of slope triangles (right-angle triangles showing rise/run) with labeled legs and prominent ratio display. Triangles must update in real-time as points move, and support displaying two triangles simultaneously for the similar triangles proof.

### Requirements

**Triangle appearance:**
- Right-angle triangle with horizontal run leg and vertical rise leg
- Stroke: 2px, `var(--lab-accent)` color
- Fill: Semi-transparent `rgba(34, 211, 238, 0.1)`
- Vertices: Three points forming right angle at intersection of legs

**Triangle labels:**
- Rise label: "rise = [value]" positioned on vertical leg
- Run label: "run = [value]" positioned on horizontal leg
- Labels use `var(--lab-text)` color, 12px font
- Labels positioned near midpoint of each leg

**Ratio display:**
- Format: "slope = [ratio]" or "[rise]/[run] = [ratio]"
- Position: Prominent, near triangle (above or to the right)
- Font: Larger (16px), bold, `var(--lab-accent)` color
- Updates in real-time as points move
- Format: Show as fraction if whole numbers, decimal otherwise

**Animation:**
- Triangle morphs smoothly (300ms) when points move
- Use GSAP for smooth vertex transitions
- No janky jumps—must be continuous

### Triangle Geometry Calculation

```typescript
function calculateSlopeTriangle(p1: Point2D, p2: Point2D): SlopeTriangle {
  const rise = p2.y - p1.y
  const run = p2.x - p1.x
  const ratio = rise / run
  
  // Calculate vertices for right-angle triangle
  // Right angle at p1, horizontal leg to p2.x, vertical leg to p2.y
  const vertices: [Point2D, Point2D, Point2D] = [
    p1,                                    // Right angle vertex
    { x: p2.x, y: p1.y },                  // End of run leg
    p2                                     // End of rise leg
  ]
  
  return {
    p1,
    p2,
    rise: Math.abs(rise),
    run: Math.abs(run),
    ratio,
    vertices
  }
}
```

### Triangle Component

```typescript
interface SlopeTriangleProps {
  triangle: SlopeTriangle
  showLabels?: boolean
  showRatio?: boolean
  animated?: boolean
  color?: string
}

export function SlopeTriangle({
  triangle,
  showLabels = true,
  showRatio = true,
  animated = true,
  color = 'var(--lab-accent)'
}: SlopeTriangleProps) {
  const [displayTriangle, setDisplayTriangle] = useState(triangle)
  
  useEffect(() => {
    if (animated) {
      gsap.to(displayTriangle, {
        ...triangle,
        duration: 0.3,
        ease: 'power2.out',
        onUpdate: () => setDisplayTriangle({ ...displayTriangle })
      })
    } else {
      setDisplayTriangle(triangle)
    }
  }, [triangle, animated])
  
  return (
    <group>
      {/* Triangle geometry */}
      <mesh>
        <shapeGeometry args={[createTriangleShape(displayTriangle.vertices)]} />
        <meshBasicMaterial 
          color={color} 
          opacity={0.1} 
          transparent 
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Triangle stroke */}
      <Line
        points={[
          ...displayTriangle.vertices.map(v => [v.x, v.y, 0.05]),
          [displayTriangle.vertices[0].x, displayTriangle.vertices[0].y, 0.05]
        ]}
        color={color}
        lineWidth={2}
      />
      
      {/* Labels */}
      {showLabels && (
        <>
          <RiseLabel triangle={displayTriangle} />
          <RunLabel triangle={displayTriangle} />
        </>
      )}
      
      {/* Ratio display */}
      {showRatio && (
        <RatioDisplay triangle={displayTriangle} />
      )}
    </group>
  )
}
```

### Ratio Display Component

```typescript
interface RatioDisplayProps {
  triangle: SlopeTriangle
  position?: 'above' | 'right' | 'below'
}

export function RatioDisplay({ 
  triangle, 
  position = 'above' 
}: RatioDisplayProps) {
  const formatRatio = () => {
    const { rise, run, ratio } = triangle
    
    // If whole numbers, show as fraction
    if (Number.isInteger(rise) && Number.isInteger(run)) {
      return `${rise}/${run} = ${ratio.toFixed(2)}`
    }
    
    // Otherwise show decimal
    return `slope = ${ratio.toFixed(2)}`
  }
  
  const displayPos = calculatePosition(triangle, position)
  
  return (
    <Html position={[displayPos.x, displayPos.y, 0.1]}>
      <div className="text-lg font-bold text-accent">
        {formatRatio()}
      </div>
    </Html>
  )
}
```

### Two Triangles (Celebrate Stage)

For similar triangles proof, display two triangles on the same line:

```typescript
interface TwoTrianglesProps {
  line: Line
  triangle1: SlopeTriangle
  triangle2: SlopeTriangle
  showAngles?: boolean
}

export function TwoTriangles({
  line,
  triangle1,
  triangle2,
  showAngles = false
}: TwoTrianglesProps) {
  return (
    <group>
      <SlopeTriangle triangle={triangle1} />
      <SlopeTriangle triangle={triangle2} />
      
      {showAngles && (
        <>
          <AngleMeasurements triangle={triangle1} />
          <AngleMeasurements triangle={triangle2} />
        </>
      )}
      
      {/* Ratio comparison text */}
      <RatioComparison triangle1={triangle1} triangle2={triangle2} />
    </group>
  )
}
```

### States

| State | Triangle Visible | Labels | Ratio | Animation |
|-------|-----------------|--------|-------|-----------|
| Observe | No | - | - | - |
| Manipulate | No | - | - | - |
| Discover | Yes (single) | Yes | Yes | Yes (morphs with points) |
| Celebrate | Yes (two) | Yes | Yes (both) | No (fixed positions) |

### Constraints

- Triangle must always form valid right angle
- Handle edge case: points overlap (show "undefined" or hide triangle)
- Ratio updates must be real-time (no delay)
- Triangle morphing must be smooth (300ms, no jumps)
- Labels must not overlap triangle or each other

### Integration Points

- Triangle connects to point positions (updates when points move)
- Ratio display connects to challenge detection (Prompt 6)
- Two triangles connect to similar triangles proof (Prompt 7)

---

## Prompt 5: Stage Manager & Transitions

### Context

Implement the stage machine that controls the Observe → Manipulate → Discover → Celebrate flow. Stages control visibility of UI elements, trigger transitions, and manage the learning progression.

### Requirements

**Stage definitions:**
- **Observe:** Four lines visible, no grid, prompt: "Rank these from least steep to most steep"
- **Manipulate:** Lines draggable, ranking feedback, transition trigger: user starts dragging
- **Discover:** Single line, grid revealed, points, triangle, challenge: "Find three different triangles with slope = 2"
- **Celebrate:** Two triangles, angles, proof explanation, formula reveal

**Stage visibility rules:**
```typescript
const stageVisibility: Record<Stage, StageVisibility> = {
  observe: {
    lines: true,
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false,
    angles: false,
    secondTriangle: false
  },
  manipulate: {
    lines: true,  // draggable
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false,
    angles: false,
    secondTriangle: false
  },
  discover: {
    lines: true,  // single line
    grid: true,
    points: true,
    triangle: true,
    equation: false,
    sliders: false,  // revealed later in stage
    angles: false,
    secondTriangle: false
  },
  celebrate: {
    lines: true,
    grid: true,
    points: true,
    triangle: true,
    equation: true,
    sliders: true,
    angles: true,
    secondTriangle: true
  }
}
```

**Transition triggers:**
- **Observe → Manipulate:** User starts dragging a line
- **Manipulate → Discover:** User completes ranking, system reveals: "You just compared slopes. Let's understand what makes one steeper."
- **Discover → Celebrate:** User completes challenge (finds three triangles with slope = 2), system reveals similar triangles proof
- **Celebrate completion:** Formula appears, module complete

### Stage Manager Hook

```typescript
function useStageManager() {
  const [currentStage, setCurrentStage] = useState<Stage>('observe')
  const [stageData, setStageData] = useState({
    rankingComplete: false,
    challengeTriangles: [] as SlopeTriangle[],
    challengeTarget: 2  // slope = 2
  })
  
  const visibility = stageVisibility[currentStage]
  
  const transitionTo = (stage: Stage) => {
    // Smooth transition animation
    gsap.to({}, {
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => setCurrentStage(stage)
    })
  }
  
  // Auto-transitions based on conditions
  useEffect(() => {
    if (currentStage === 'observe' && /* user starts dragging */) {
      transitionTo('manipulate')
    }
    
    if (currentStage === 'manipulate' && stageData.rankingComplete) {
      transitionTo('discover')
    }
    
    if (currentStage === 'discover' && stageData.challengeTriangles.length >= 3) {
      transitionTo('celebrate')
    }
  }, [currentStage, stageData])
  
  return {
    currentStage,
    visibility,
    stageData,
    updateStageData: setStageData,
    transitionTo
  }
}
```

### Challenge Detection (Discover Stage)

Track when user finds three different triangles with same slope:

```typescript
function useChallengeDetection(
  currentTriangle: SlopeTriangle,
  targetSlope: number
) {
  const [foundTriangles, setFoundTriangles] = useState<SlopeTriangle[]>([])
  
  useEffect(() => {
    const tolerance = 0.01
    const slopeMatch = Math.abs(currentTriangle.ratio - targetSlope) < tolerance
    
    if (slopeMatch) {
      // Check if this triangle is "different" from existing ones
      const isDifferent = foundTriangles.every(t => 
        !trianglesSimilar(currentTriangle, t)
      )
      
      if (isDifferent) {
        setFoundTriangles(prev => [...prev, currentTriangle])
      }
    }
  }, [currentTriangle, targetSlope, foundTriangles])
  
  return {
    foundTriangles,
    count: foundTriangles.length,
    isComplete: foundTriangles.length >= 3
  }
}
```

### Stage Prompt Component

```typescript
interface StagePromptProps {
  stage: Stage
  visible: boolean
}

export function StagePrompt({ stage, visible }: StagePromptProps) {
  const prompts: Record<Stage, string> = {
    observe: "Rank these from least steep to most steep",
    manipulate: "Drag to reorder the lines",
    discover: "Find three DIFFERENT slope triangles that all show slope = 2",
    celebrate: "You discovered why slope is constant!"
  }
  
  if (!visible) return null
  
  return (
    <div className="absolute top-4 left-4 bg-surface border border-border rounded-lg px-4 py-2">
      <p className="text-sm text-text">{prompts[stage]}</p>
    </div>
  )
}
```

### Transition Animations

```typescript
const transitions = {
  stageChange: {
    duration: 0.5,
    ease: 'power2.out'
  },
  
  elementFadeIn: {
    opacity: [0, 1],
    duration: 0.3,
    ease: 'power2.out'
  },
  
  elementFadeOut: {
    opacity: [1, 0],
    duration: 0.3,
    ease: 'power2.in'
  }
}
```

### States

| Stage | UI Elements | User Actions | Next Stage Trigger |
|-------|------------|--------------|-------------------|
| Observe | 4 lines, prompt | None (passive) | User starts dragging line |
| Manipulate | 4 draggable lines, feedback | Drag lines to rank | Ranking complete |
| Discover | 1 line, grid, points, triangle, challenge | Drag points, find triangles | 3 triangles found |
| Celebrate | 2 triangles, angles, proof, formula | Observe, read | Module complete |

### Constraints

- Stages must transition smoothly (500ms animation)
- Visibility rules strictly enforced (no elements visible in wrong stage)
- Challenge detection must be accurate (tolerance-based matching)
- Stage data persists across transitions (don't lose progress)
- Transitions are one-way (can't go backwards without explicit reset)

### Integration Points

- Stage manager connects to all UI components (visibility props)
- Challenge detection connects to celebration (Prompt 6)
- Stage transitions connect to reveal system (Prompt 7)

---

## Prompt 6: Challenge Mode & Discovery Feedback

### Context

Implement the challenge system where users must find three different slope triangles with the same slope value. Provide real-time feedback on progress and celebrate when the challenge is complete.

### Requirements

**Challenge setup:**
- Target slope: 2 (default, can be configured)
- Challenge prompt: "Find three DIFFERENT slope triangles that all show slope = 2"
- Display current count: "You've found [count] of 3 triangles"
- Progress indicator: Visual bar or dots showing 0/3, 1/3, 2/3, 3/3

**Triangle detection:**
- Check if current triangle's slope matches target (within 0.01 tolerance)
- Check if triangle is "different" from previously found triangles
- Criteria for "different": Triangle vertices are not too close to existing triangles
- Store found triangles in state

**Feedback display:**
- Success message when triangle found: "Triangle [count] found! Keep going..."
- Completion message: "Perfect! You found all three triangles!"
- Visual highlight: Pulse effect on ratio display when match detected
- Progress updates in real-time

**Discovery celebration:**
- When challenge complete, trigger celebration animation
- Celebration pulse effect (radial gradient expanding from center)
- Transition to Celebrate stage automatically

### Challenge Component

```typescript
interface ChallengeModeProps {
  active: boolean  // true in Discover stage
  currentTriangle: SlopeTriangle
  targetSlope: number
  onComplete: () => void
}

export function ChallengeMode({
  active,
  currentTriangle,
  targetSlope,
  onComplete
}: ChallengeModeProps) {
  const [foundTriangles, setFoundTriangles] = useState<SlopeTriangle[]>([])
  const [lastMatchTime, setLastMatchTime] = useState(0)
  
  // Check if current triangle matches target
  useEffect(() => {
    if (!active) return
    
    const tolerance = 0.01
    const slopeMatch = Math.abs(currentTriangle.ratio - targetSlope) < tolerance
    
    if (slopeMatch) {
      // Check if triangle is different from existing ones
      const isDifferent = foundTriangles.every(t => 
        !trianglesSimilar(currentTriangle, t, threshold: 0.5)
      )
      
      if (isDifferent) {
        setFoundTriangles(prev => [...prev, currentTriangle])
        setLastMatchTime(Date.now())
        
        // Check if challenge complete
        if (foundTriangles.length + 1 >= 3) {
          setTimeout(() => onComplete(), 500)  // Brief delay for feedback
        }
      }
    }
  }, [active, currentTriangle, targetSlope, foundTriangles, onComplete])
  
  return (
    <div className="absolute top-4 right-4">
      <ChallengeProgress count={foundTriangles.length} target={3} />
      {lastMatchTime > 0 && (
        <MatchFeedback count={foundTriangles.length} />
      )}
    </div>
  )
}
```

### Progress Indicator

```typescript
interface ChallengeProgressProps {
  count: number
  target: number
}

export function ChallengeProgress({ count, target }: ChallengeProgressProps) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-2">
      <p className="text-sm text-text mb-2">
        Find three DIFFERENT triangles with slope = 2
      </p>
      <div className="flex gap-2">
        {Array.from({ length: target }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-8 h-8 rounded-full border-2",
              i < count 
                ? "bg-accent border-accent" 
                : "bg-transparent border-border"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-text-dim mt-2">
        {count} of {target} found
      </p>
    </div>
  )
}
```

### Match Feedback

```typescript
interface MatchFeedbackProps {
  count: number
}

export function MatchFeedback({ count }: MatchFeedbackProps) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [count])
  
  if (!visible) return null
  
  return (
    <div className="mt-2 bg-accent/20 border border-accent rounded-lg px-3 py-1 animate-fade-in">
      <p className="text-sm text-accent font-medium">
        ✓ Triangle {count} found! Keep going...
      </p>
    </div>
  )
}
```

### Celebration Pulse

```typescript
interface CelebrationPulseProps {
  active: boolean
}

export function CelebrationPulse({ active }: CelebrationPulseProps) {
  const [scale, setScale] = useState(0.5)
  const [opacity, setOpacity] = useState(0.4)
  
  useEffect(() => {
    if (active) {
      gsap.to({ value: 0.5 }, {
        value: 3,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function() {
          setScale(this.targets()[0].value)
          setOpacity(0.4 * (1 - this.progress()))
        },
        onComplete: () => {
          setScale(0.5)
          setOpacity(0.4)
        }
      })
    }
  }, [active])
  
  if (!active) return null
  
  return (
    <mesh position={[0, 0, -0.5]}>
      <circleGeometry args={[scale, 64]} />
      <meshBasicMaterial 
        color="var(--lab-accent)" 
        opacity={opacity} 
        transparent 
      />
    </mesh>
  )
}
```

### States

| State | Challenge Active | Progress | Feedback | Celebration |
|-------|-----------------|----------|----------|-------------|
| Discover (start) | Yes | 0/3 | None | No |
| Triangle found | Yes | 1/3, 2/3 | Match feedback | No |
| Challenge complete | No | 3/3 | Completion message | Yes (pulse) |
| Celebrate stage | No | - | - | No |

### Constraints

- Challenge only active in Discover stage
- Triangle detection must be accurate (tolerance-based)
- "Different" triangles must be meaningfully distinct (not just slightly different positions)
- Progress persists if user continues exploring (don't reset on stage transition)
- Celebration triggers automatically on completion

### Integration Points

- Challenge connects to stage manager (triggers Celebrate stage)
- Progress connects to ratio display (visual feedback on match)
- Celebration connects to reveal system (Prompt 7)

---

## Prompt 7: Similar Triangles Proof & Formula Reveal

### Context

Implement the similar triangles proof visualization and formula reveal in the Celebrate stage. This is the "earned understanding" moment where students see why slope is constant and finally encounter the formula as notation for what they've discovered.

### Requirements

**Two triangles display:**
- Show two slope triangles on the same line simultaneously
- Triangles should be visually distinct (different sizes, different positions)
- Both triangles show their rise/run/ratio values
- Both triangles display angle measurements

**Angle measurements:**
- Display angles at each vertex of both triangles
- Format: "∠ = [degrees]°"
- Position: Near each angle vertex
- Highlight that corresponding angles are equal (proves similarity)

**Similar triangles explanation:**
- Scaffolded text reveal:
  1. "Notice the angles are the same"
  2. "These are similar triangles"
  3. "Similar triangles have the same ratios"
  4. "That's why slope is constant!"
- Text appears sequentially with fade-in animations

**Formula reveal:**
- Formula appears LAST: (y₂ - y₁) / (x₂ - x₁)
- Frame as "notation for what you discovered"
- Display with user's actual point values
- Example: "Using your points: (2, 4) and (4, 8), slope = (8-4)/(4-2) = 4/2 = 2"

### Two Triangles Component

```typescript
interface SimilarTrianglesProofProps {
  line: Line
  triangle1: SlopeTriangle
  triangle2: SlopeTriangle
  showAngles: boolean
  showExplanation: boolean
}

export function SimilarTrianglesProof({
  line,
  triangle1,
  triangle2,
  showAngles,
  showExplanation
}: SimilarTrianglesProofProps) {
  return (
    <group>
      {/* First triangle */}
      <SlopeTriangle 
        triangle={triangle1} 
        showLabels={true}
        showRatio={true}
      />
      
      {/* Second triangle */}
      <SlopeTriangle 
        triangle={triangle2} 
        showLabels={true}
        showRatio={true}
      />
      
      {/* Angle measurements */}
      {showAngles && (
        <>
          <AngleMeasurements triangle={triangle1} />
          <AngleMeasurements triangle={triangle2} />
          <AngleComparison triangle1={triangle1} triangle2={triangle2} />
        </>
      )}
      
      {/* Explanation text */}
      {showExplanation && (
        <SimilarTrianglesExplanation />
      )}
    </group>
  )
}
```

### Angle Measurements Component

```typescript
interface AngleMeasurementsProps {
  triangle: SlopeTriangle
}

export function AngleMeasurements({ triangle }: AngleMeasurementsProps) {
  const angles = calculateTriangleAngles(triangle)
  
  return (
    <group>
      {/* Angle at p1 */}
      <AngleArc
        center={triangle.p1}
        startAngle={0}
        endAngle={angles.angle1}
        label={`${angles.angle1.toFixed(1)}°`}
      />
      
      {/* Angle at p2 */}
      <AngleArc
        center={triangle.p2}
        startAngle={180}
        endAngle={180 + angles.angle2}
        label={`${angles.angle2.toFixed(1)}°`}
      />
      
      {/* Right angle marker */}
      <RightAngleMarker
        vertex={triangle.vertices[0]}
        leg1={triangle.vertices[1]}
        leg2={triangle.vertices[2]}
      />
    </group>
  )
}
```

### Angle Comparison Component

```typescript
interface AngleComparisonProps {
  triangle1: SlopeTriangle
  triangle2: SlopeTriangle
}

export function AngleComparison({ triangle1, triangle2 }: AngleComparisonProps) {
  const angles1 = calculateTriangleAngles(triangle1)
  const angles2 = calculateTriangleAngles(triangle2)
  
  const anglesMatch = 
    Math.abs(angles1.angle1 - angles2.angle1) < 1 &&
    Math.abs(angles1.angle2 - angles2.angle2) < 1
  
  return (
    <Html position={[0, 5, 0]}>
      <div className="bg-surface border border-accent rounded-lg px-4 py-2">
        <p className="text-sm text-text">
          {anglesMatch ? (
            <>
              ✓ Angles match: {angles1.angle1.toFixed(1)}° = {angles2.angle1.toFixed(1)}°
              <br />
              These are similar triangles!
            </>
          ) : (
            "Calculating angles..."
          )}
        </p>
      </div>
    </Html>
  )
}
```

### Formula Reveal Component

```typescript
interface FormulaRevealProps {
  triangle: SlopeTriangle
  visible: boolean
}

export function FormulaReveal({ triangle, visible }: FormulaRevealProps) {
  if (!visible) return null
  
  const { p1, p2, rise, run, ratio } = triangle
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-surface border-2 border-accent rounded-lg px-6 py-4 max-w-2xl animate-fade-in">
      <h3 className="text-lg font-bold text-accent mb-2">
        The Slope Formula
      </h3>
      <p className="text-sm text-text mb-4">
        You discovered that slope is constant. Here's the notation:
      </p>
      
      <div className="bg-bg rounded p-4 mb-4 font-mono text-center">
        <div className="text-2xl text-accent mb-2">
          slope = (y₂ - y₁) / (x₂ - x₁)
        </div>
        <div className="text-sm text-text-dim">
          Using your points: ({p1.x}, {p1.y}) and ({p2.x}, {p2.y})
        </div>
        <div className="text-lg text-text mt-2">
          = ({p2.y} - {p1.y}) / ({p2.x} - {p1.x}) = {rise} / {run} = {ratio.toFixed(2)}
        </div>
      </div>
      
      <p className="text-sm text-text-dim italic">
        This formula is just notation for the relationship you've been exploring!
      </p>
    </div>
  )
}
```

### Explanation Sequence

```typescript
interface SimilarTrianglesExplanationProps {
  visible: boolean
}

export function SimilarTrianglesExplanation({ visible }: SimilarTrianglesExplanationProps) {
  const [step, setStep] = useState(0)
  
  const steps = [
    "Notice the angles are the same in both triangles",
    "These are similar triangles",
    "Similar triangles have the same ratios",
    "That's why slope is constant between any two points!"
  ]
  
  useEffect(() => {
    if (!visible) return
    
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 2000)  // Show each step for 2 seconds
    
    return () => clearInterval(interval)
  }, [visible, steps.length])
  
  if (!visible) return null
  
  return (
    <Html position={[0, -5, 0]}>
      <div className="bg-surface border border-border rounded-lg px-4 py-3 animate-fade-in">
        <p className="text-sm text-text">
          {steps[step]}
        </p>
        <div className="flex gap-1 mt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded",
                i <= step ? "bg-accent" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </Html>
  )
}
```

### States

| State | Two Triangles | Angles | Explanation | Formula |
|-------|--------------|--------|-------------|---------|
| Discover | No | No | No | No |
| Celebrate (start) | Yes | Yes | Step 1 | No |
| Celebrate (mid) | Yes | Yes | Steps 2-3 | No |
| Celebrate (end) | Yes | Yes | Step 4 | Yes |

### Constraints

- Formula must appear LAST (after all visual discovery)
- Explanation steps must be sequential (don't show all at once)
- Angle measurements must be accurate (within 1° tolerance for display)
- Formula uses user's actual point values (not generic example)
- All text must be readable (adequate contrast, proper sizing)

### Integration Points

- Two triangles connect to challenge completion (uses found triangles)
- Formula connects to stage manager (appears in Celebrate stage)
- Explanation connects to reveal timing (sequential appearance)

---

## Prompt 8: Controls, Sliders & Feedback Systems

### Context

Implement the control panel with slope and y-intercept sliders, equation display, and feedback systems (hints, idle nudges). Controls must support progressive reveal and provide real-time feedback.

### Requirements

**Control panel layout:**
- Position: Right side on desktop, below canvas on mobile
- Background: `var(--lab-surface)` with border
- Padding: 16px
- Border-radius: 8px

**Slope slider:**
- Range: -3 to 3
- Step: 0.1
- Default: 2 (for challenge)
- Label: "Slope (m)"
- Real-time feedback: Line rotates around origin as slider moves

**Y-intercept slider:**
- Range: -5 to 5
- Step: 0.1
- Default: 0
- Label: "Y-intercept (b)"
- Real-time feedback: Line shifts vertically, slope remains constant

**Equation display:**
- Format: "y = mx" or "y = mx + b"
- Updates in real-time as sliders change
- Visible only in Celebrate stage (after discovery)
- Position: Below sliders in control panel

**Progressive reveal:**
- Sliders hidden in Observe/Manipulate stages
- Sliders appear in Discover stage (after challenge starts)
- Equation appears in Celebrate stage only

### Control Panel Component

```typescript
interface ControlPanelProps {
  slope: number
  yIntercept: number
  onSlopeChange: (value: number) => void
  onYInterceptChange: (value: number) => void
  visible: boolean  // Stage-controlled
  showEquation: boolean  // Celebrate stage only
}

export function ControlPanel({
  slope,
  yIntercept,
  onSlopeChange,
  onYInterceptChange,
  visible,
  showEquation
}: ControlPanelProps) {
  if (!visible) return null
  
  return (
    <div className="bg-surface border border-border rounded-lg p-4 w-full max-w-xs">
      <h3 className="text-sm font-semibold text-text mb-4">
        Line Controls
      </h3>
      
      {/* Slope slider */}
      <div className="mb-4">
        <label className="text-xs text-text-dim mb-2 block">
          Slope (m)
        </label>
        <ParameterSlider
          value={slope}
          min={-3}
          max={3}
          step={0.1}
          onChange={onSlopeChange}
          formatValue={(v) => v.toFixed(1)}
        />
        <div className="text-xs text-text-dim mt-1 text-center">
          {slope.toFixed(1)}
        </div>
      </div>
      
      {/* Y-intercept slider */}
      <div className="mb-4">
        <label className="text-xs text-text-dim mb-2 block">
          Y-intercept (b)
        </label>
        <ParameterSlider
          value={yIntercept}
          min={-5}
          max={5}
          step={0.1}
          onChange={onYInterceptChange}
          formatValue={(v) => v.toFixed(1)}
        />
        <div className="text-xs text-text-dim mt-1 text-center">
          {yIntercept.toFixed(1)}
        </div>
      </div>
      
      {/* Equation display */}
      {showEquation && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-dim mb-2">Line Equation:</p>
          <p className="text-sm font-mono text-accent">
            y = {slope.toFixed(1)}x{yIntercept !== 0 ? ` + ${yIntercept.toFixed(1)}` : ''}
          </p>
        </div>
      )}
    </div>
  )
}
```

### Idle Nudge System

```typescript
interface IdleNudgeProps {
  idleTime: number  // seconds since last interaction
  stage: Stage
  targetElement?: RefObject<HTMLElement>
}

export function IdleNudge({ idleTime, stage, targetElement }: IdleNudgeProps) {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    // Show hint after 30 seconds of inactivity
    if (idleTime > 30 && stage === 'discover') {
      setVisible(true)
      
      // Auto-dismiss after 5 seconds or on interaction
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [idleTime, stage])
  
  if (!visible) return null
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-surface border border-accent rounded-lg px-4 py-2 animate-fade-in">
      <p className="text-sm text-text">
        💡 Try moving the points to see what changes
      </p>
    </div>
  )
}
```

### Hint System (Challenge Mode)

```typescript
interface ChallengeHintProps {
  active: boolean
  attempts: number  // Number of point movements
  proximity: 'far' | 'medium' | 'close'
  onShow: () => void
}

export function ChallengeHint({ 
  active, 
  attempts, 
  proximity,
  onShow 
}: ChallengeHintProps) {
  const [hintVisible, setHintVisible] = useState(false)
  
  useEffect(() => {
    // Show hint button after 10+ attempts and still far from target
    if (active && attempts >= 10 && proximity === 'far') {
      setHintVisible(true)
    } else {
      setHintVisible(false)
    }
  }, [active, attempts, proximity])
  
  if (!hintVisible) return null
  
  return (
    <button
      onClick={() => {
        setHintVisible(false)
        onShow()
      }}
      className="text-xs text-accent hover:text-accent-bright underline"
    >
      💡 Show Hint
    </button>
  )
}
```

### Feedback Banner

```typescript
interface FeedbackBannerProps {
  message: string
  type: 'success' | 'hint' | 'error'
  visible: boolean
  duration?: number
  onDismiss: () => void
}

export function FeedbackBanner({
  message,
  type,
  visible,
  duration = 3000,
  onDismiss
}: FeedbackBannerProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, duration, onDismiss])
  
  if (!visible) return null
  
  const styles = {
    success: 'bg-green-500/20 border-green-500 text-green-500',
    hint: 'bg-blue-500/20 border-blue-500 text-blue-500',
    error: 'bg-red-500/20 border-red-500 text-red-500'
  }
  
  return (
    <div className={cn(
      "absolute top-4 left-1/2 transform -translate-x-1/2 border rounded-lg px-4 py-2 animate-fade-in",
      styles[type]
    )}>
      <p className="text-sm">{message}</p>
    </div>
  )
}
```

### States

| State | Sliders Visible | Equation Visible | Hints Active |
|-------|----------------|------------------|--------------|
| Observe | No | No | No |
| Manipulate | No | No | No |
| Discover | Yes (after challenge starts) | No | Yes (if stuck) |
| Celebrate | Yes | Yes | No |

### Constraints

- Sliders must provide immediate visual feedback (line updates in real-time)
- Equation must use actual slider values (not placeholders)
- Hints must be helpful but not hand-holding
- Idle nudges must be non-intrusive (auto-dismiss)
- All controls must be keyboard accessible

### Integration Points

- Sliders connect to line equation (updates line in real-time)
- Equation connects to formula reveal (shows connection)
- Hints connect to challenge detection (helps stuck users)
- Idle nudges connect to stage manager (stage-specific messages)

---

## Prompt 9: Responsive Layout & Accessibility Polish

### Context

Ensure the module works seamlessly on mobile devices, tablets, and desktops while meeting WCAG AA accessibility standards. This includes responsive layouts, keyboard navigation, screen reader support, and performance optimization.

### Requirements

**Responsive breakpoints:**

| Viewport Width | Canvas Size | Control Panel | Layout |
|---------------|-------------|---------------|--------|
| Desktop (>1024px) | 600×600px | 320px width, right side | Side-by-side |
| Tablet (768-1024px) | 500×500px | 100% width, max 400px | Stacked (panel below) |
| Mobile (480-768px) | 90vw × 90vw | 100% width | Stacked |
| Small mobile (<480px) | 90vw × 90vw | 100% width | Stacked, larger touch targets |

### Desktop Layout (>1024px)

```
┌─────────────────────────────────────────┐
│  ┌───────────────┐  ┌──────────────┐   │
│  │               │  │  Controls    │   │
│  │               │  │              │   │
│  │   Canvas      │  │  Slope: [━━●]│   │
│  │   (600×600)   │  │  Y-int: [━━●]│   │
│  │               │  │              │   │
│  │               │  │  y = 2x      │   │
│  │               │  │              │   │
│  └───────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
    Left: Canvas          Right: Controls
```

- Container: Flex row with gap (24px)
- Canvas: Fixed 600×600px
- Panel: Fixed 320px width, sticky positioning

### Tablet/Mobile Layout (<1024px)

```
┌──────────────────────┐
│                      │
│      Canvas          │
│    (responsive)      │
│                      │
└──────────────────────┘
┌──────────────────────┐
│   Controls           │
│                      │
│   Slope: [━━●━━]     │
│   Y-int: [━━━●━]     │
│                      │
│   y = 2x             │
└──────────────────────┘
```

- Container: Flex column
- Canvas: 90vw × 90vw (maintains aspect ratio)
- Panel: 100% width, positioned below canvas

### Touch Optimizations (Mobile)

**Slider enhancements:**
- Increase thumb size: 24px (from 20px desktop)
- Increase track height: 8px (from 6px desktop)
- Increase touch target: 44×44px minimum
- Add `touch-action: none` to prevent scroll during drag

**Point dragging:**
- Larger hit area for points (12px radius on mobile vs 8px desktop)
- Prevent default touch behaviors (no pinch-zoom on canvas)
- Disable double-tap zoom on canvas area

### Keyboard Navigation

**Tab order:**
1. Canvas (receives focus for screen reader description)
2. Slope slider
3. Y-intercept slider
4. Challenge progress indicator
5. Hint button (if visible)
6. Formula reveal close button (if visible)

**Slider keyboard controls:**
- Arrow keys: ↑/→ increase by 0.1, ↓/← decrease by 0.1
- Page Up/Down: Increase/decrease by 0.5
- Home: Jump to minimum
- End: Jump to maximum
- Shift + Arrow: Fine adjustment (0.01)

**Point dragging (keyboard alternative):**
- Focus point with Tab
- Arrow keys move point along line (constrained)
- Enter confirms position

### Screen Reader Support

**Canvas area:**
```html
<div 
  role="img" 
  aria-label="Coordinate grid showing slope triangles. Drag points to explore slope relationships."
  tabindex="0"
>
  {/* R3F Canvas */}
</div>
```

**Sliders:**
```html
<input
  type="range"
  aria-label="Slope slider, current value 2.0"
  aria-valuemin={-3}
  aria-valuemax={3}
  aria-valuenow={slope}
  aria-valuetext={`${slope.toFixed(1)}`}
/>
```

**Live regions for dynamic feedback:**
```html
{/* Challenge progress */}
<div aria-live="polite" aria-atomic="true">
  {challengeCount} of 3 triangles found
</div>

{/* Ratio updates */}
<div role="status" aria-live="polite">
  Current slope: {ratio.toFixed(2)}
</div>
```

### Color Contrast (WCAG AA)

**Verify contrast ratios:**
- Text on background: Minimum 4.5:1
- UI controls on background: Minimum 3:1
- Focus indicators: Clear visual indication (not color-only)

**Current colors check:**
- Accent (`#22d3ee`) on dark background: ✅ High contrast
- Text (`var(--lab-text)`) on dark background: ✅ Sufficient
- Muted text (`var(--lab-text-dim)`) on dark background: ⚠️ Check

**Non-color distinction:**
- Points: Accent color + larger size on hover
- Triangles: Stroke + fill pattern
- Lines: Different colors + stroke width
- Distinction works for colorblind users

### Animation Preferences

**Respect prefers-reduced-motion:**

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

useEffect(() => {
  if (prefersReducedMotion) {
    // Disable GSAP animations
    gsap.globalTimeline.timeScale(100)  // Instant transitions
  }
}, [prefersReducedMotion])
```

**What to disable if reduced motion preferred:**
- Triangle morphing (instant snap instead)
- Celebration pulse (show/hide without animation)
- Stage transitions (instant change)
- Point dragging animation (instant position)

**What to keep:**
- Static visuals (grid, lines, triangles)
- Functional interactions (sliders still work)
- State changes (slope still calculates, just instantly)

### Performance Optimizations (Mobile)

**Reduce render overhead:**
- Debounce slider updates (update max 60fps, not on every pixel)
- Use `will-change` for animated elements
- Lazy-load formula reveal (don't render until needed)

**Canvas optimizations:**
- Lower pixel ratio on low-end devices: `dpr={Math.min(window.devicePixelRatio, 2)}`
- Reduce antialiasing if performance suffers
- Use simpler geometry for points on mobile (16 segments vs 32)

### Testing Checklist

Before release, verify on:

**Devices:**
- [ ] iPhone (Safari, Chrome)
- [ ] Android phone (Chrome, Firefox)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari, Edge)

**Accessibility:**
- [ ] Keyboard navigation works for all interactions
- [ ] Screen reader announces all state changes
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Reduced motion respected
- [ ] Touch targets 44×44px on mobile

**Responsive:**
- [ ] Layout doesn't break at any viewport width
- [ ] Canvas maintains aspect ratio
- [ ] Text readable at all sizes
- [ ] No horizontal scroll
- [ ] Controls accessible on all screen sizes

### Component Structure

```typescript
export function SlopeModule() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  
  return (
    <div className={cn(
      "flex gap-6",
      isMobile ? "flex-col items-center" : "flex-row"
    )}>
      <Canvas 
        dpr={isMobile ? Math.min(window.devicePixelRatio, 2) : undefined}
        prefersReducedMotion={prefersReducedMotion}
      />
      <ControlPanel isMobile={isMobile} />
    </div>
  )
}
```

### Constraints

- Don't break existing functionality when adding responsive styles
- Test on real devices, not just browser resize
- Ensure slider precision maintained on touch (no accidental jumps)
- Respect system preferences (dark mode, reduced motion, high contrast)
- Maintain consistent visual hierarchy across all screen sizes

---

## Implementation File Structure

```
/src/components/modules/slope/
├── Module.tsx                      # Main orchestrator
├── Canvas.tsx                      # R3F Canvas wrapper (Prompt 2)
├── CoordinateGrid.tsx             # Grid and axes (Prompt 2)
├── Line.tsx                        # Line component (Prompt 3)
├── DraggablePoint.tsx             # Point component (Prompt 3)
├── SlopeTriangle.tsx              # Triangle component (Prompt 4)
├── RatioDisplay.tsx                # Ratio display (Prompt 4)
├── TwoTriangles.tsx                # Similar triangles proof (Prompt 7)
├── AngleMeasurements.tsx           # Angle arcs and labels (Prompt 7)
├── FormulaReveal.tsx               # Formula display (Prompt 7)
├── StageManager.tsx                # Stage machine (Prompt 5)
├── ChallengeMode.tsx               # Challenge system (Prompt 6)
├── ControlPanel.tsx                # Sliders and equation (Prompt 8)
├── FeedbackBanner.tsx              # Feedback messages (Prompt 8)
├── IdleNudge.tsx                   # Hints and nudges (Prompt 8)
└── utils/
    ├── slope-math.ts               # Math utilities (Prompt 1)
    ├── triangle-geometry.ts         # Triangle calculations (Prompt 1)
    ├── types.ts                     # TypeScript types (Prompt 1)
    └── colors.ts                   # Design tokens (Prompt 1)
```

---

## Quality Checklist

Before considering implementation complete:

### Functional Requirements
- [ ] Four lines display in Observe stage (no grid)
- [ ] Lines draggable for ranking in Manipulate stage
- [ ] Single line with two draggable points in Discover stage
- [ ] Slope triangle updates in real-time as points move
- [ ] Challenge detects three different triangles with slope = 2
- [ ] Two triangles display in Celebrate stage
- [ ] Angle measurements show on both triangles
- [ ] Formula appears LAST after all discovery
- [ ] Sliders control line in real-time
- [ ] Equation updates as sliders change

### Visual & Animation
- [ ] Grid hidden in Observe, visible in Discover/Celebrate
- [ ] Lines render correctly with distinct colors
- [ ] Points constrained to line when dragged
- [ ] Triangle morphs smoothly (300ms) when points move
- [ ] Ratio display updates in real-time
- [ ] Celebration pulse expands and fades correctly
- [ ] Stage transitions smooth (500ms)
- [ ] No animation jank (60fps maintained)

### UX & Pedagogy
- [ ] Entry point clear ("Rank these from least steep to most steep")
- [ ] No numbers in Observe stage (pure visual comparison)
- [ ] Progressive reveal (grid, angles, sliders, equation)
- [ ] Formula appears LAST (earned understanding)
- [ ] Challenge requires intentional effort (not luck)
- [ ] Similar triangles proof scaffolded (step-by-step)
- [ ] Hints helpful but not hand-holding

### Responsive & Accessibility
- [ ] Works on mobile (320px width minimum)
- [ ] Touch targets 44×44px on mobile
- [ ] Keyboard navigation functional
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG AA
- [ ] Respects prefers-reduced-motion
- [ ] Focus visible on all interactive elements

### Performance
- [ ] Client-side computation (no API calls)
- [ ] 60fps on mobile devices
- [ ] Canvas renders at appropriate pixel ratio
- [ ] No memory leaks from animations
- [ ] Slider updates debounced if needed

### States & Edge Cases
- [ ] Initial load shows Observe stage
- [ ] Stage transitions trigger correctly
- [ ] Challenge detection accurate (tolerance-based)
- [ ] Points never leave line (constraint enforced)
- [ ] Formula uses actual user values
- [ ] Idle nudges appear after 30s inactivity

---

## Next Steps After Build

1. **User testing:** Have 3-5 Grade 8 students try module, observe where they get stuck
2. **Refinement:** Adjust challenge difficulty, hint triggers, animation timings based on feedback
3. **Documentation:** Create "Behind This" pedagogical rationale
4. **Integration:** Wire into portfolio navigation and module selection
5. **Analytics:** Track challenge completion rates, time per stage, discovery patterns

---

*These prompts can be used sequentially with UI generation tools (v0, Bolt, Claude frontend-design) or as implementation guides for manual development.*
