# Vector Transformations Module
## Build-Order Prompts

**Version:** 1.0  
**Created:** January 2026  
**Purpose:** Sequential, self-contained prompts for UI generation tools

---

## Overview

Interactive linear algebra learning module where users discover how 2×2 matrices geometrically transform vectors through direct manipulation before encountering formal notation.

**Tech Stack:**
- React Three Fiber + drei for 3D visualization
- GSAP for animations
- Tailwind CSS with lab color system
- TypeScript

---

## Build Sequence

1. **Foundation** - Design tokens, types, transformation math utilities
2. **Layout Shell** - Canvas area, control panel container, grid coordinate system
3. **Vector Components** - Original vector, transformed vector with animation
4. **Matrix Controls** - 4-entry slider panel with progressive unlock
5. **Challenge Mode** - Target vector, proximity detection, match feedback
6. **Discovery Feedback** - Transformation type badges, celebration effects
7. **Reveal Panel** - Matrix notation display with labeled entries
8. **State Refinement** - Idle nudges, hints, error handling
9. **Polish** - Responsive layout, animations, accessibility

---

## Prompt 1: Foundation & Transformation Math

### Context
Building the core mathematical and visual foundation for a vector transformation module. Users will manipulate 2×2 matrices and watch vectors transform in real-time on a coordinate grid.

### Requirements
- Create TypeScript utilities for 2×2 matrix operations
- Define design tokens matching the lab color system from the codebase
- Set up core types for matrix, vector, and transformation state

### Core Math Functions Needed

```typescript
// Matrix-vector multiplication: [a11, a12; a21, a22] × [vx; vy]
function transformVector(matrix: Matrix2x2, vector: Vector2): Vector2

// Classify transformation type (for discovery feedback)
function classifyTransformation(matrix: Matrix2x2): TransformationType
// Returns: 'scaling' | 'rotation' | 'reflection' | 'shearing' | 'identity'

// Calculate proximity to target (for challenge mode)
function calculateProximity(current: Vector2, target: Vector2): ProximityScore
// Returns angle difference (degrees) and magnitude difference (percent)

// Check if two vectors are "close enough" for a match
function isMatch(current: Vector2, target: Vector2, threshold: MatchThreshold): boolean
// Threshold: within 5° rotation and 10% magnitude
```

### Types to Define

```typescript
type Matrix2x2 = {
  a11: number  // top-left
  a12: number  // top-right
  a21: number  // bottom-left
  a22: number  // bottom-right
}

type Vector2 = {
  x: number
  y: number
}

type TransformationType = 
  | 'identity' 
  | 'scaling' 
  | 'rotation' 
  | 'reflection' 
  | 'shearing'

type ProximityScore = {
  angleDiff: number      // degrees
  magnitudeDiff: number  // percentage
}

type MatchThreshold = {
  maxAngleDiff: number      // 5 degrees
  maxMagnitudeDiff: number  // 10 percent
}
```

### Transformation Classification Logic

**Identity:**
- a11 = 1, a12 = 0, a21 = 0, a22 = 1

**Scaling:**
- Off-diagonal entries are 0
- At least one diagonal entry ≠ 1
- Example: [2, 0; 0, 2] is 2× uniform scaling

**Rotation:**
- Determinant ≈ 1 (within 0.01 tolerance)
- Matrix is orthogonal (columns perpendicular)
- Example: [cos θ, -sin θ; sin θ, cos θ]

**Reflection:**
- Determinant ≈ -1 (within 0.01 tolerance)
- Example: [1, 0; 0, -1] is reflection across x-axis

**Shearing:**
- Everything else (catch-all category)

### Design Tokens

Use existing lab color system:

```typescript
const colors = {
  accent: 'var(--lab-accent)',        // Cyan for transformed vector
  accentMuted: 'var(--lab-text-muted)', // Gray for original vector
  border: 'var(--lab-border)',        // Grid lines
  bg: 'var(--lab-bg)',                // Canvas background
  textDim: 'var(--lab-text-dim)',     // Labels
}
```

### Constraints
- All math must be client-side (no API calls)
- Use determinant and dot product for classification
- Angle calculation: `Math.atan2(v.y, v.x) * 180 / Math.PI`
- Magnitude: `Math.sqrt(v.x * v.x + v.y * v.y)`
- Don't implement UI components yet—just the utilities

### File Structure

```
/src/components/modules/vector-transforms/
└── utils/
    ├── matrix-math.ts    # transformVector, classifyTransformation
    ├── proximity.ts      # calculateProximity, isMatch
    └── types.ts          # All TypeScript types
```

---

## Prompt 2: Canvas Layout & Coordinate Grid

### Context
Creating the visualization canvas where vectors will be displayed on a coordinate grid. This is the primary workspace where users watch transformations happen in real-time.

### Requirements

**Canvas dimensions:**
- Default: 600px × 600px (square for symmetry)
- Responsive: Scale down to fit mobile (min 320px width)
- Coordinate system: -3 to +3 on both axes (7 units total per axis)
- Maintain 1:1 aspect ratio

**Grid appearance:**
- Major gridlines every 1 unit
- Axis lines (x=0, y=0) slightly thicker (2px vs 1px)
- Axis color: `var(--lab-text-dim)` with opacity 0.8
- Grid color: `var(--lab-border)` with opacity 0.3
- Origin point (0,0) marked with small circle (4px radius)

**Coordinate labels:**
- X-axis: -3, -2, -1, 0, 1, 2, 3 (bottom edge)
- Y-axis: -3, -2, -1, 0, 1, 2, 3 (left edge)
- Font: monospace, 10px, `var(--lab-text-dim)`
- Position labels outside grid area

### Layout Structure

```
┌────────────────────────────────────┐
│  Y-axis labels                     │
│  -3 -2 -1  0  1  2  3              │
│                                    │
│   3 ·  ·  ·  ·  ·  ·  ·            │
│   2 ·  ·  ·  ·  ·  ·  ·            │
│   1 ·  ·  ·  ·  ·  ·  ·            │
│   0 ·  ·  ·  +──────────►  x       │
│  -1 ·  ·  ·  │  ·  ·  ·            │
│  -2 ·  ·  ·  │  ·  ·  ·            │
│  -3 ·  ·  ·  │  ·  ·  ·            │
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
- Zoom level adjusted so [-3, 3] range fills canvas

**Grid implementation options:**

Option A - Use drei's Grid helper:
```typescript
import { Grid } from '@react-three/drei'

<Grid 
  args={[7, 7]}           // 7 units per axis
  cellSize={1}            // Major gridline every 1 unit
  cellColor="#888888"     // Grid line color
  sectionSize={0}         // No section divisions
  fadeDistance={50}       // Don't fade
  infiniteGrid={false}    // Bounded grid
/>
```

Option B - Custom line components:
```typescript
// Horizontal lines: y = -3 to 3
// Vertical lines: x = -3 to 3
// Use drei's Line component for each gridline
```

**Axis lines (special styling):**
- X-axis: Line from (-3, 0, 0) to (3, 0, 0), width 2px
- Y-axis: Line from (0, -3, 0) to (0, 3, 0), width 2px

**Origin marker:**
- Small sphere at (0, 0, 0) with radius 0.08
- Color: `var(--lab-accent)` with opacity 0.6

### Coordinate Labels (HTML Overlay)

Use HTML overlays (not 3D text) for better readability:

```typescript
import { Html } from '@react-three/drei'

// Position labels at grid edges
<Html position={[1, -3.3, 0]}>
  <span className="text-xs font-mono text-dim">1</span>
</Html>
```

Or use absolute-positioned div overlays outside the Canvas.

### States
- **Default:** Grid visible, no vectors yet
- **Active:** Grid provides static spatial reference as vectors animate
- **Grid never moves:** Only vectors transform, grid stays fixed

### Constraints
- Grid must be visually stable (no rotation or zoom)
- Ensure grid renders at z = -0.1 (behind vectors which are at z = 0)
- Labels should be crisp (not affected by canvas scaling)
- Maintain 1:1 aspect ratio to avoid distortion

### Component Structure

```typescript
interface CanvasProps {
  children?: React.ReactNode
}

export function Canvas({ children }: CanvasProps) {
  return (
    <div className="relative w-full aspect-square max-w-[600px]">
      <R3FCanvas camera={{ position: [0, 0, 10], ... }}>
        <CoordinateGrid />
        {children}
      </R3FCanvas>
      <CoordinateLabels />  {/* HTML overlay */}
    </div>
  )
}
```

---

## Prompt 3: Vector Components with Animation

### Context
Build the visual representation of original and transformed vectors as arrows on the coordinate grid. Vectors must animate smoothly when matrix values change.

### Requirements

**Vector appearance:**

**Original vector (basis vector î = [1, 0]):**
- Start point: (0, 0)
- End point: (1, 0) — always fixed
- Color: `var(--lab-text-muted)` (gray)
- Stroke width: 2px
- Opacity: 0.6
- Never animates (stays constant as reference)

**Transformed vector:**
- Start point: (0, 0)
- End point: Calculated from matrix transformation
- Color: `var(--lab-accent)` (cyan)
- Stroke width: 3px
- Opacity: 1.0
- Animates smoothly when matrix changes

### Arrow Design

Each vector is composed of:
1. **Shaft:** Line from origin to endpoint
2. **Arrowhead:** Small triangle/cone at endpoint

**Arrowhead specifications:**
- Size: 0.15 units (relative to coordinate system)
- Filled triangle pointing in vector direction
- Same color as vector shaft
- Rotates to align with vector angle

### Animation Behavior

**When matrix changes:**
- Transformed vector smoothly interpolates to new position
- Use GSAP with spring physics: `duration: 0.4s, ease: "power2.out"`
- Both position and rotation animate (vector tip + arrowhead)
- No discrete jumps—must be continuous

**Animation considerations:**
- Don't queue animations (cancel previous if new update comes)
- Complete animation within 400ms before next update
- Use `useFrame` hook carefully (only for continuous animation, not state updates)

### Component Structure

```typescript
interface VectorArrowProps {
  start: Vector2        // Usually (0, 0) for both vectors
  end: Vector2          // Endpoint position
  color: string         
  strokeWidth: number
  opacity: number
  animated?: boolean    // If true, animate position changes with GSAP
  label?: string        // Optional label (e.g., "v" or "T(v)")
}

export function VectorArrow({
  start,
  end,
  color,
  strokeWidth,
  opacity,
  animated = false,
  label
}: VectorArrowProps) {
  // Implementation
}
```

### Technical Details - React Three Fiber

**Vector shaft (line):**
```typescript
import { Line } from '@react-three/drei'

<Line
  points={[[start.x, start.y, 0], [end.x, end.y, 0]]}
  color={color}
  lineWidth={strokeWidth}
  opacity={opacity}
/>
```

**Arrowhead (cone geometry):**
```typescript
import { Cone } from '@react-three/drei'

// Position at vector endpoint
// Rotate to align with vector direction
const angle = Math.atan2(end.y - start.y, end.x - start.x)

<Cone
  args={[0.08, 0.15, 8]}  // radius, height, segments
  position={[end.x, end.y, 0]}
  rotation={[0, 0, angle - Math.PI / 2]}  // Align with vector
>
  <meshBasicMaterial color={color} opacity={opacity} transparent />
</Cone>
```

### Animation with GSAP

```typescript
import gsap from 'gsap'
import { useEffect, useRef } from 'react'

function VectorArrow({ end, animated }: VectorArrowProps) {
  const positionRef = useRef({ x: end.x, y: end.y })

  useEffect(() => {
    if (!animated) {
      positionRef.current = { x: end.x, y: end.y }
      return
    }

    gsap.to(positionRef.current, {
      x: end.x,
      y: end.y,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        // Trigger re-render to update visual position
      }
    })
  }, [end.x, end.y, animated])

  // Use positionRef.current for rendering
}
```

### Ghost Target Vector (Challenge Mode)

For challenge mode, target vector has modified appearance:

```typescript
interface TargetVectorProps extends VectorArrowProps {
  isTarget: true  // Flag to apply target styling
}

// Target styling differences:
// - Dashed stroke pattern (dashSize: 0.1, gapSize: 0.05)
// - Opacity: 0.4 (more transparent than active vector)
// - Same color as transformed vector
// - Does NOT animate when matrix changes (stays fixed)
```

### States

| State | Original Vector | Transformed Vector | Target Vector |
|-------|----------------|-------------------|---------------|
| Initial (exploration) | Visible, static at (1,0) | At (1,0), ready to animate | Hidden |
| User adjusting matrix | Static | Animating to new position | Hidden |
| Challenge mode | Static | Animating toward target | Visible, static |
| Match success | Static | Aligned with target | Visible |

### Constraints
- Original vector NEVER moves (always at [1, 0])
- Transformed vector completes animation before accepting next update
- Both vectors render at z = 0 (same depth, no z-fighting)
- Arrowhead must rotate smoothly with vector direction
- Animation frame rate: 60fps (use RAF or GSAP's ticker)

### Optional Label

If label prop provided, display near vector tip:

```typescript
import { Html } from '@react-three/drei'

{label && (
  <Html position={[end.x + 0.2, end.y + 0.2, 0]}>
    <span className="text-sm font-mono text-accent">{label}</span>
  </Html>
)}
```

---

## Prompt 4: Matrix Control Panel

### Context
4-slider interface for adjusting matrix entries. Users drag sliders to change transformation parameters and see immediate visual feedback on vectors.

### Requirements

**Panel layout:**
- Positioned below canvas on mobile, right side on desktop (>768px)
- Background: `var(--lab-surface)` with border `var(--lab-border)`
- Padding: 16px
- Border-radius: 8px
- Max-width: 320px (desktop)

**Matrix visual structure:**

Display entries in standard 2×2 matrix layout:

```
┌              ┐
│  a₁₁   a₁₂  │
│  a₂₁   a₂₂  │
└              ┘
```

### Each Matrix Entry Control

**Components per entry:**
- Label: "a₁₁", "a₁₂", "a₂₁", "a₂₂" (use subscript: `<sub>11</sub>`)
- Slider: Horizontal track with draggable thumb
- Value display: Current numeric value, 1 decimal place

**Slider specifications:**
- Range: -2 to 2
- Step: 0.1 (allows smooth exploration)
- Default values (identity matrix):
  - a₁₁ = 1
  - a₁₂ = 0
  - a₂₁ = 0
  - a₂₂ = 1

**Slider styling:**
- Track height: 6px
- Track background: `var(--lab-border)`
- Filled track: `var(--lab-accent)` (from min to thumb position)
- Thumb: 20px diameter circle, `var(--lab-accent)` with subtle glow on hover
- Width: 100% of container (responsive)
- Mobile: Increase thumb to 24px for better touch target

### Progressive Unlock (Critical UX Feature)

**Phase 1 - Initial State:**
- Show only diagonal entries (a₁₁, a₂₂)
- Off-diagonal sliders (a₁₂, a₂₁) are hidden or visually disabled:
  - Option A: `display: none` (recommended)
  - Option B: Visible but grayed out with `disabled` attribute

**Phase 2 - Unlock Trigger:**
- Detect when user adjusts diagonal sliders 3+ times total (not per slider)
- Track adjustment count in component state
- When count >= 3, trigger unlock animation

**Unlock Animation:**
- Off-diagonal controls fade in over 0.3s
- Subtle pulse effect (scale 1 → 1.05 → 1) to draw attention
- Accompany with brief tooltip: "New controls unlocked!"

### Layout Structure

```
┌─────────────────────────┐
│  Transformation Matrix  │  ← Optional title
│                         │
│  ┌────┐    ┌────┐      │
│  │a₁₁│    │a₁₂│      │  ← First row of matrix
│  └────┘    └────┘      │
│  [━━●━━]   [━━━━●]     │  ← Sliders for a₁₁, a₁₂
│   1.5        0.3        │  ← Value displays
│                         │
│  ┌────┐    ┌────┐      │
│  │a₂₁│    │a₂₂│      │  ← Second row of matrix
│  └────┘    └────┘      │
│  [━━━━●]   [●━━━━]     │  ← Sliders for a₂₁, a₂₂
│   -0.2       1.0        │
│                         │
│  [ ↺ Reset ]            │  ← Reset button
└─────────────────────────┘
```

### Reset Functionality

**Reset button:**
- Icon: Circular arrow (↺) or "Reset" text
- Action: Set all entries back to identity matrix [1, 0; 0, 1]
- Style: Secondary button (outline), small size
- Position: Bottom of panel

**Reset behavior:**
- Animate sliders back to default positions (0.3s)
- Transformed vector animates back to (1, 0)
- Does NOT lock off-diagonal sliders (once unlocked, stay unlocked)

### Interaction Details

**Slider onChange:**
```typescript
const handleSliderChange = (entry: 'a11' | 'a12' | 'a21' | 'a22', value: number) => {
  // Update matrix state
  setMatrix(prev => ({ ...prev, [entry]: value }))
  
  // Track adjustments for unlock trigger (only for diagonal in Phase 1)
  if (entry === 'a11' || entry === 'a22') {
    setAdjustmentCount(prev => prev + 1)
  }
}
```

**Value display:**
- Format: `value.toFixed(1)` (always 1 decimal)
- Color: `var(--lab-text)` (normal text)
- Font: Monospace for alignment
- Position: Directly below slider

### States

| State | Diagonal Sliders | Off-Diagonal Sliders | Reset Button |
|-------|------------------|---------------------|--------------|
| Initial | Active | Hidden | Visible |
| After 3 adjustments | Active | Fade in + pulse | Visible |
| User dragging slider | Active slider highlighted | Active if unlocked | Visible |
| After reset | Return to defaults | Remain visible (unlocked) | Visible |

### Responsive Behavior

**Desktop (>768px):**
- Panel positioned right of canvas (side-by-side layout)
- Fixed width: 320px
- Sticky positioning (stays visible when scrolling)

**Tablet/Mobile (<768px):**
- Panel below canvas (stacked layout)
- Width: 100% (max 400px)
- Increased touch targets (thumb 24px, track 8px)

### Component Structure

```typescript
interface MatrixControlPanelProps {
  matrix: Matrix2x2
  onChange: (matrix: Matrix2x2) => void
  onReset: () => void
}

export function MatrixControlPanel({
  matrix,
  onChange,
  onReset
}: MatrixControlPanelProps) {
  const [adjustmentCount, setAdjustmentCount] = useState(0)
  const isUnlocked = adjustmentCount >= 3

  // Implementation
}
```

### Accessibility

- Each slider has `aria-label`: "Matrix entry a-1-1, current value 1.5"
- Keyboard support:
  - Tab to focus slider
  - Arrow keys: ↑/→ increase by 0.1, ↓/← decrease by 0.1
  - Home: Jump to min (-2)
  - End: Jump to max (2)
- Value changes announced to screen readers via `aria-live="polite"`

### Constraints
- Slider changes trigger immediate vector transformation (no "Apply" button)
- Value display updates as slider moves (not just on release)
- Progressive unlock is one-way (once unlocked, stays unlocked even after reset)
- Don't show raw matrix bracket notation `[a b; c d]` until reveal phase

---

## Prompt 5: Challenge Mode & Target Matching

### Context
After user explores freely, challenge mode presents a target transformed vector and asks user to match it by adjusting matrix entries. This transitions from open exploration to goal-directed problem solving.

### Requirements

**Challenge activation:**
- "Try a Challenge" button appears after 20 seconds of exploration
- Button style: Secondary (outline), `var(--lab-accent)` border
- Position: Below matrix control panel or in top-right of canvas area
- Fade-in animation (opacity 0 → 1 over 0.5s)

**Button interaction:**
- Click triggers transition to challenge mode:
  1. Pick random target from predefined set
  2. Display target vector on canvas
  3. Show proximity feedback
  4. Hide "Try a Challenge" button
  5. Show "Exit Challenge" button (allows return to exploration)

### Target Vector Appearance

**Visual styling:**
- Same shape as transformed vector (arrow with head)
- Dashed/dotted stroke pattern to distinguish from active vector
- Color: `var(--lab-accent)` (same as transformed vector)
- Opacity: 0.5 (more transparent)
- Stroke width: 2px
- Does NOT animate when matrix changes (stays fixed at target position)

**Dashed line implementation (R3F):**
```typescript
<Line
  points={[[0, 0, 0], [target.x, target.y, 0]]}
  color="var(--lab-accent)"
  lineWidth={2}
  opacity={0.5}
  dashed={true}
  dashScale={50}
  dashSize={0.1}
  gapSize={0.05}
/>
```

### Predefined Challenge Targets

Choose from recognizable transformations (pick one randomly per challenge):

```typescript
const challengeTargets = [
  {
    name: '90° Rotation',
    matrix: { a11: 0, a12: -1, a21: 1, a22: 0 },
    description: 'Counterclockwise 90° rotation'
  },
  {
    name: 'Horizontal Reflection',
    matrix: { a11: 1, a12: 0, a21: 0, a22: -1 },
    description: 'Reflection across x-axis'
  },
  {
    name: '2× Scaling',
    matrix: { a11: 2, a12: 0, a21: 0, a22: 2 },
    description: 'Uniform 2× scaling'
  },
  {
    name: '45° Rotation',
    matrix: { 
      a11: Math.cos(Math.PI/4), 
      a12: -Math.sin(Math.PI/4), 
      a21: Math.sin(Math.PI/4), 
      a22: Math.cos(Math.PI/4) 
    },
    description: 'Counterclockwise 45° rotation'
  }
]

// Calculate target vector by transforming basis vector [1, 0]
const targetVector = transformVector(target.matrix, { x: 1, y: 0 })
```

### Proximity Feedback

**Feedback levels based on proximity score:**

| Proximity | Angle Diff | Magnitude Diff | Feedback Text | Text Color |
|-----------|-----------|----------------|---------------|------------|
| Just started | Any | Any | "Match this vector" | `--lab-text-muted` |
| Far | > 30° | > 50% | "Keep going..." | `--lab-text-muted` |
| Medium | 15-30° | 25-50% | "Getting closer..." | `--lab-text` |
| Close | 5-15° | 10-25% | "Almost there!" | `--lab-accent` (yellow) |
| Match | < 5° | < 10% | "Perfect match!" | `--lab-accent` (bright) |

**Feedback positioning:**
- Display in top-right corner of canvas area (HTML overlay)
- Font: 14px, medium weight
- Animate color transition as user gets closer (smooth interpolation)
- Update on every matrix change (real-time feedback)

**Calculation:**
```typescript
import { calculateProximity, isMatch } from './utils/proximity'

const proximity = calculateProximity(transformedVector, targetVector)
const matched = isMatch(transformedVector, targetVector, {
  maxAngleDiff: 5,
  maxMagnitudeDiff: 10
})

const feedbackText = matched ? "Perfect match!" :
  proximity.angleDiff < 5 && proximity.magnitudeDiff < 10 ? "Almost there!" :
  proximity.angleDiff < 15 && proximity.magnitudeDiff < 25 ? "Getting closer..." :
  "Keep going..."
```

### Match Detection & Celebration

**When match detected:**

1. **Trigger celebration effect:**
   - Reuse `CelebrationPulse` component from Sinewave module
   - Radial gradient pulse from center of canvas
   - Color: `var(--lab-accent)` with 40% opacity
   - Duration: 0.8s, scale: 0.5 → 3

2. **Reveal matrix notation panel (Prompt 7):**
   - Slide in from bottom or fade in as modal
   - Shows matrix with actual values user created
   - Displays transformation type name

3. **Show "Try Another" button:**
   - Replaces "Exit Challenge" button
   - Primary button style
   - Action: Load new random target, reset matrix to identity

### Exit Challenge Mode

**"Exit Challenge" button:**
- Position: Where "Try a Challenge" was originally
- Action:
  1. Hide target vector
  2. Hide proximity feedback
  3. Show "Try a Challenge" button again
  4. Keep matrix at current values (don't reset)

### States

| State | Target Vector | Proximity Feedback | Button Visible |
|-------|--------------|-------------------|----------------|
| Exploration | Hidden | Hidden | "Try a Challenge" (after 20s) |
| Challenge active | Visible (dashed) | Visible, updating | "Exit Challenge" |
| Match detected | Visible | "Perfect match!" | Hidden (reveal panel takes over) |
| After reveal dismissed | Hidden | Hidden | "Try Another" + "Keep Exploring" |

### Interaction Flow

```
User in exploration mode
  ↓
After 20s → "Try a Challenge" button appears
  ↓
User clicks → Challenge mode activated
  ↓
Target vector appears, proximity feedback shown
  ↓
User adjusts matrix, watching proximity feedback
  ↓
Match detected → Celebration → Reveal panel
  ↓
User clicks "Try Another" → New challenge
  OR
User clicks "Keep Exploring" → Return to exploration mode
```

### Component Structure

```typescript
interface ChallengeModeProps {
  isActive: boolean
  currentVector: Vector2
  onMatchSuccess: (targetName: string, matrix: Matrix2x2) => void
  onExit: () => void
}

export function ChallengeMode({
  isActive,
  currentVector,
  onMatchSuccess,
  onExit
}: ChallengeModeProps) {
  const [target, setTarget] = useState<Challenge | null>(null)
  const [proximity, setProximity] = useState<ProximityScore | null>(null)

  // Pick random target on mount
  useEffect(() => {
    if (isActive && !target) {
      const randomTarget = challengeTargets[
        Math.floor(Math.random() * challengeTargets.length)
      ]
      setTarget(randomTarget)
    }
  }, [isActive])

  // Check proximity on every vector update
  useEffect(() => {
    if (target && currentVector) {
      const prox = calculateProximity(currentVector, target.vector)
      setProximity(prox)

      const matched = isMatch(currentVector, target.vector, {
        maxAngleDiff: 5,
        maxMagnitudeDiff: 10
      })

      if (matched) {
        onMatchSuccess(target.name, currentMatrix)
      }
    }
  }, [currentVector, target])

  if (!isActive || !target) return null

  return (
    <>
      <TargetVector vector={target.vector} />
      <ProximityFeedback proximity={proximity} />
    </>
  )
}
```

### Constraints
- Only one challenge active at a time
- Target stays fixed while user adjusts matrix (doesn't animate)
- Match threshold should require intentional effort (not lucky guesses)
- Proximity feedback qualitative, not numeric (keeps focus on geometry)
- Don't show multiple targets simultaneously

---

## Prompt 6: Discovery Badges & Celebration

### Context
When user creates specific transformation types during free exploration (not challenge mode), system acknowledges discovery with contextual badges. This provides positive reinforcement and teaches transformation taxonomy.

### Requirements

**Transformation types to detect:**

Based on classification from `utils/matrix-math.ts`:

1. **Scaling** - Diagonal entries non-zero, off-diagonal = 0, at least one diagonal ≠ 1
2. **Rotation** - Determinant ≈ 1, matrix is orthogonal
3. **Reflection** - Determinant ≈ -1

**Don't show badges for:**
- Identity matrix (default state, not a discovery)
- Shearing (too generic, not pedagogically meaningful)
- Transformations during challenge mode (focus is on matching, not discovery)

### Badge Appearance

**Visual design:**
- Shape: Pill (fully rounded ends)
- Size: Auto width, 32px height
- Background: `var(--lab-accent)` with 20% opacity
- Border: 1px solid `var(--lab-accent)`
- Text: "You discovered: [Scaling/Rotation/Reflection]"
- Icon: Checkmark (✓) or sparkle (✨) emoji before text
- Font: 12px, medium weight

**Positioning:**
- Top-right corner of canvas area (HTML overlay)
- Offset: 16px from top, 16px from right
- If proximity feedback is visible (challenge mode), position below it

### Badge Behavior

**Appearance animation:**
1. Fade in from opacity 0 → 1 (0.3s)
2. Slight scale effect: 0.9 → 1 (0.3s, ease-out)
3. Stay visible for 3 seconds
4. Fade out to opacity 0 (0.3s)
5. Remove from DOM after fade-out

**Discovery tracking:**
- Track which types have been discovered in component state
- Use Set<TransformationType>: `new Set(['scaling', 'rotation'])`
- Only show badge on FIRST discovery of each type
- If user creates same type again, don't show badge (already discovered)

**Example flow:**
```
User adjusts matrix to [2, 0; 0, 2]
  → Detected: scaling
  → Check: Has "scaling" been discovered? No
  → Show badge: "✨ You discovered: Scaling"
  → Add "scaling" to discovered set
  → Badge auto-dismisses after 3s

User adjusts matrix to [3, 0; 0, 3]
  → Detected: scaling
  → Check: Has "scaling" been discovered? Yes
  → Don't show badge (already seen)
```

### Detection Logic

**Run classification on every matrix change:**

```typescript
import { classifyTransformation } from './utils/matrix-math'

const [discoveredTypes, setDiscoveredTypes] = useState<Set<TransformationType>>(new Set())
const [currentBadge, setCurrentBadge] = useState<TransformationType | null>(null)

useEffect(() => {
  // Skip if in challenge mode
  if (isChallengeMode) return

  const type = classifyTransformation(matrix)

  // Skip identity and shearing
  if (type === 'identity' || type === 'shearing') return

  // Check if this is a new discovery
  if (!discoveredTypes.has(type)) {
    setCurrentBadge(type)
    setDiscoveredTypes(prev => new Set([...prev, type]))

    // Auto-dismiss after 3s
    setTimeout(() => setCurrentBadge(null), 3000)
  }
}, [matrix, isChallengeMode])
```

### Badge Text Mapping

```typescript
const badgeLabels: Record<TransformationType, string> = {
  scaling: 'Scaling',
  rotation: 'Rotation',
  reflection: 'Reflection',
  // identity and shearing not shown
}

const badgeText = currentBadge ? `✨ You discovered: ${badgeLabels[currentBadge]}` : null
```

### Celebration Pulse (Challenge Match)

**Separate from discovery badges** — this effect only triggers on successful challenge match.

**Visual effect:**
- Radial gradient pulse emanating from canvas center
- Color: `var(--lab-accent)` with gradient from 40% opacity → 0%
- Animation:
  - Start: Circle with radius 0.5 units (small)
  - End: Circle with radius 3 units (fills canvas)
  - Duration: 0.8s
  - Easing: ease-out
  - Opacity: 40% → 0% as it expands

**Implementation (R3F):**

```typescript
import { Circle } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

export function CelebrationPulse({ active }: { active: boolean }) {
  const [scale, setScale] = useState(0.5)
  const [opacity, setOpacity] = useState(0.4)

  useEffect(() => {
    if (active) {
      // Animate scale and opacity
      gsap.to({ value: 0.5 }, {
        value: 3,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function() {
          setScale(this.targets()[0].value)
          setOpacity(0.4 * (1 - this.progress()))
        },
        onComplete: () => {
          // Reset for next celebration
          setScale(0.5)
          setOpacity(0.4)
        }
      })
    }
  }, [active])

  if (!active) return null

  return (
    <Circle args={[scale, 64]} position={[0, 0, -0.5]}>
      <meshBasicMaterial 
        color="var(--lab-accent)" 
        opacity={opacity} 
        transparent 
      />
    </Circle>
  )
}
```

**Or use shader for radial gradient:**
```glsl
// Fragment shader for radial pulse
uniform float uRadius;
uniform float uOpacity;

void main() {
  float dist = length(vUv - 0.5) * 2.0; // 0 at center, 1 at edge
  float alpha = uOpacity * (1.0 - dist);
  gl_FragColor = vec4(color, alpha);
}
```

### States

| State | Discovery Badge | Celebration Pulse |
|-------|-----------------|-------------------|
| Free exploration | Shown on first discovery of each type | Not active |
| Challenge mode | Hidden | Not active |
| Match success | Hidden | Active (single pulse) |

### Constraints
- Only show one badge at a time (if user rapidly creates multiple new types, queue them)
- Don't show badges during challenge mode (distracting from goal)
- Celebration pulse should not obscure vectors or target
- Badge must not overlap proximity feedback text
- Auto-dismiss timing (3s) should feel complete but not linger

### Component Structure

```typescript
interface DiscoveryBadgeProps {
  type: TransformationType | null
  onDismiss: () => void
}

export function DiscoveryBadge({ type, onDismiss }: DiscoveryBadgeProps) {
  useEffect(() => {
    if (type) {
      const timer = setTimeout(onDismiss, 3000)
      return () => clearTimeout(timer)
    }
  }, [type, onDismiss])

  if (!type) return null

  return (
    <div className="absolute top-4 right-4 animate-fade-in">
      <div className="badge">
        ✨ You discovered: {badgeLabels[type]}
      </div>
    </div>
  )
}
```

---

## Prompt 7: Reveal Panel (Matrix Notation)

### Context
After successful challenge match, reveal the formal matrix notation with labeled entries and geometric explanation. This is the "earned understanding" moment—formula comes after discovery, not before.

### Requirements

**Panel appearance:**
- Type: Modal overlay (centered on screen) or slide-in panel (from bottom)
- Background: `var(--lab-surface)` with subtle shadow/elevation
- Border: 1px solid `var(--lab-border)`
- Border-radius: 12px
- Size: 400px width (desktop), 90vw (mobile, max 400px)
- Padding: 24px
- Backdrop: Semi-transparent dark overlay (rgba(0,0,0,0.6)) with blur effect

**Content structure:**

```
┌─────────────────────────────────────┐
│  🎉 Perfect Match!                  │  ← Header with celebration icon
│                                     │
│  You created a Rotation Matrix:    │  ← Transformation type
│                                     │
│     ┌                  ┐           │
│     │  0.0    -1.0     │           │  ← Matrix notation with actual values
│     │  1.0     0.0     │           │
│     └                  ┘           │
│                                     │
│  What each entry does:              │  ← Geometric explanations
│                                     │
│  • a₁₁ = 0.0: Horizontal component  │
│  • a₁₂ = -1.0: Rotation component   │
│  • a₂₁ = 1.0: Rotation component    │
│  • a₂₂ = 0.0: Vertical component    │
│                                     │
│  This rotates vectors 90°           │  ← High-level summary
│  counterclockwise around the origin.│
│                                     │
│  [ Try Another ]  [ Keep Exploring ]│  ← Action buttons
└─────────────────────────────────────┘
```

### Matrix Notation Display

**Bracket notation:**
- Use Unicode characters for brackets: ⌈ ⌉ or ┌ ┐
- Font: Monospace for alignment
- Size: 18px (larger than body text for emphasis)
- Color: `var(--lab-text)`

**Entry values:**
- Show actual numeric values from user's matrix
- Format: `value.toFixed(1)` (1 decimal place)
- Highlight user's final values in `var(--lab-accent)` color
- Example: If user created [0, -1; 1, 0], show those exact numbers

### Geometric Explanations

**Entry-by-entry breakdown:**

Provide intuitive explanations for each matrix entry based on transformation type:

**For Scaling:**
```
• a₁₁ = 2.0: Stretches horizontally by 2×
• a₁₂ = 0.0: No rotation or shearing
• a₂₁ = 0.0: No rotation or shearing
• a₂₂ = 2.0: Stretches vertically by 2×
```

**For Rotation:**
```
• a₁₁ = cos(θ): Controls horizontal component
• a₁₂ = -sin(θ): Creates counterclockwise rotation
• a₂₁ = sin(θ): Creates counterclockwise rotation
• a₂₂ = cos(θ): Controls vertical component
```

**For Reflection:**
```
• a₁₁ = 1.0: Preserves horizontal direction
• a₁₂ = 0.0: No rotation
• a₂₁ = 0.0: No rotation
• a₂₂ = -1.0: Flips vertical direction
```

**Transformation summary (1-2 sentences):**
- Scaling: "This uniformly scales vectors by [factor]×."
- Rotation: "This rotates vectors [angle]° counterclockwise around the origin."
- Reflection: "This reflects vectors across the [x/y]-axis."

### Action Buttons

**"Try Another" (Primary):**
- Style: Filled button, `var(--lab-accent)` background
- Action:
  1. Dismiss reveal panel
  2. Reset matrix to identity [1, 0; 0, 1]
  3. Pick new random challenge target
  4. Return to challenge mode (target visible, proximity feedback active)

**"Keep Exploring" (Secondary):**
- Style: Outline button, `var(--lab-accent)` border
- Action:
  1. Dismiss reveal panel
  2. Keep current matrix values (don't reset)
  3. Hide target vector
  4. Return to free exploration mode
  5. Show "Try a Challenge" button again

### Animation Sequence

**Panel entrance (on match success):**
1. Backdrop fades in (0 → 0.6 opacity, 0.2s)
2. Panel slides up from bottom (translate Y: 100% → 0%, 0.4s, ease-out)
   OR fades + scales in (opacity 0 → 1, scale 0.95 → 1, 0.3s)
3. Content elements fade in sequentially:
   - Header (0.1s delay)
   - Matrix notation (0.2s delay)
   - Explanations (0.3s delay)
   - Buttons (0.4s delay)

**Panel exit (on button click):**
1. Panel slides down or fades out (reverse of entrance, 0.3s)
2. Backdrop fades out (0.2s)
3. Remove from DOM after animation completes

### Keyboard Interaction

- **Escape key:** Dismisses panel (same as "Keep Exploring")
- **Enter key:** Activates "Try Another" (primary action)
- **Tab:** Cycles focus between two buttons
- Trap focus inside modal while open (prevent tabbing to background)

### States

| State | Panel Visible | Backdrop | Content |
|-------|--------------|----------|---------|
| Challenge active | No | No | - |
| Match detected | Yes (animating in) | Fading in | Sequentially appearing |
| Panel open | Yes | Visible | Fully visible |
| User clicks button | No (animating out) | Fading out | - |

### Dynamic Content Generation

```typescript
interface RevealPanelProps {
  matrix: Matrix2x2
  transformationType: TransformationType
  onTryAnother: () => void
  onKeepExploring: () => void
}

export function RevealPanel({
  matrix,
  transformationType,
  onTryAnother,
  onKeepExploring
}: RevealPanelProps) {
  const explanations = getExplanations(matrix, transformationType)
  const summary = getSummary(transformationType, matrix)

  return (
    <div className="modal-backdrop">
      <div className="reveal-panel">
        <h2>🎉 Perfect Match!</h2>
        <p>You created a {transformationType} Matrix:</p>
        
        <MatrixNotation matrix={matrix} />
        
        <div className="explanations">
          <h3>What each entry does:</h3>
          <ul>
            {explanations.map(exp => (
              <li key={exp.entry}>{exp.text}</li>
            ))}
          </ul>
        </div>
        
        <p className="summary">{summary}</p>
        
        <div className="actions">
          <button onClick={onTryAnother}>Try Another</button>
          <button onClick={onKeepExploring}>Keep Exploring</button>
        </div>
      </div>
    </div>
  )
}
```

### Constraints
- Don't show panel during free exploration (only after challenge match)
- Matrix notation must use user's exact values (not template placeholders)
- Explanations must be type-appropriate (don't give rotation explanations for scaling)
- Panel should be dismissible by clicking backdrop, Escape key, or buttons
- Focus trap must prevent background interaction while open
- On mobile, panel should be nearly full-screen (easier to read)

---

## Prompt 8: Idle State Nudges & Hints

### Context
Guide users who seem stuck or unsure what to do without being intrusive or patronizing. These micro-interactions help users discover the interface naturally while respecting their autonomy.

### Requirements

**Idle detection system:**

Track user interaction patterns and trigger contextual nudges based on specific conditions:

| Trigger Condition | When | Nudge Action | Dismiss Condition |
|------------------|------|-------------|-------------------|
| **Initial idle** | No slider interaction for 5s after page load | Pulse first diagonal slider (a₁₁) + tooltip: "Try dragging this →" | User adjusts any slider |
| **Single-slider repetition** | User adjusts same slider 3+ times without touching others | Highlight different slider with subtle glow | User adjusts different slider |
| **Challenge stuck** | 10+ slider adjustments in challenge mode, proximity still "Far" | Show "Hint" button below proximity feedback | User gets to "Medium" proximity or clicks hint |
| **Extended idle** | No interaction for 30 seconds | Auto-animate one random slider to demonstrate cause-effect | User interacts with any control |

### Tooltip System

**Visual design:**
- Background: `var(--lab-surface-elevated)` (slightly lighter than base surface)
- Border: 1px solid `var(--lab-accent)` with 50% opacity
- Border-radius: 6px
- Padding: 8px 12px
- Font: 12px, regular weight
- Color: `var(--lab-text)`
- Arrow pointer: 8px triangle pointing toward target element

**Positioning:**
- Position relative to target slider
- Preferred placement: Above slider (if space), otherwise below
- Offset: 8px from target
- Must not overlap control panel edges (adjust if needed)

**Auto-dismiss:**
- After 5 seconds if user doesn't interact
- Immediately on any user interaction (slider drag, button click)
- Fade out animation (0.2s)

**Example implementation:**
```typescript
interface TooltipProps {
  target: RefObject<HTMLElement>
  text: string
  visible: boolean
  onDismiss: () => void
}

export function Tooltip({ target, text, visible, onDismiss }: TooltipProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onDismiss, 5000)
      return () => clearTimeout(timer)
    }
  }, [visible, onDismiss])

  // Calculate position based on target ref
  // Render with arrow pointer
}
```

### Hint System (Challenge Mode)

**When to show:**
- User has made 10+ slider adjustments in challenge mode
- Proximity is still "Far" (angle diff > 30° OR magnitude diff > 50%)
- User hasn't clicked hint button yet this challenge

**Hint button appearance:**
- Text: "💡 Show Hint"
- Style: Ghost/text button (minimal styling)
- Position: Below proximity feedback text
- Fade in over 0.3s

**Hint content (when clicked):**

Provide targeted guidance based on what needs adjustment:

```typescript
function generateHint(currentVector: Vector2, targetVector: Vector2): string {
  const currentAngle = Math.atan2(currentVector.y, currentVector.x)
  const targetAngle = Math.atan2(targetVector.y, targetVector.x)
  const angleDiff = Math.abs(currentAngle - targetAngle) * 180 / Math.PI

  const currentMag = Math.sqrt(currentVector.x**2 + currentVector.y**2)
  const targetMag = Math.sqrt(targetVector.x**2 + targetVector.y**2)
  const magDiff = Math.abs(currentMag - targetMag) / targetMag

  // Prioritize angle if that's the bigger issue
  if (angleDiff > 15) {
    return "Try adjusting the off-diagonal entries (a₁₂ or a₂₁) to change the rotation."
  }

  // Otherwise focus on magnitude
  if (magDiff > 0.25) {
    return "Try adjusting the diagonal entries (a₁₁ or a₂₂) to change the size."
  }

  return "You're close! Make small adjustments to fine-tune."
}
```

**Hint display:**
- Replace "Show Hint" button with hint text
- Style: Same as proximity feedback but in `var(--lab-text-dim)`
- Icon: 💡 before text
- Stays visible until:
  - User reaches "Medium" proximity (hint is no longer needed)
  - User exits challenge mode

### Auto-Animation (Extended Idle)

**Trigger:** No interaction for 30 seconds

**Behavior:**
1. Pick random slider (any of the 4)
2. Animate its value:
   - From current value
   - To current + 0.5 (or current - 0.5 if at max)
   - Over 0.6s
   - Then back to original over 0.6s
3. Vector transforms in response (shows cause-effect)
4. Only trigger once per session (don't spam)

**Implementation:**
```typescript
const [hasAutoAnimated, setHasAutoAnimated] = useState(false)
const lastInteractionRef = useRef(Date.now())

useEffect(() => {
  const checkIdle = setInterval(() => {
    const idleTime = Date.now() - lastInteractionRef.current

    if (idleTime > 30000 && !hasAutoAnimated) {
      // Pick random entry
      const entries = ['a11', 'a12', 'a21', 'a22']
      const randomEntry = entries[Math.floor(Math.random() * entries.length)]

      // Animate value
      const currentValue = matrix[randomEntry]
      const delta = currentValue < 1.5 ? 0.5 : -0.5

      gsap.to(matrix, {
        [randomEntry]: currentValue + delta,
        duration: 0.6,
        ease: 'power2.inOut',
        yoyo: true,  // Return to original
        repeat: 1,
        onUpdate: () => {
          // Trigger matrix state update
        }
      })

      setHasAutoAnimated(true)
    }
  }, 1000)  // Check every second

  return () => clearInterval(checkIdle)
}, [matrix, hasAutoAnimated])

// Reset idle timer on any interaction
const handleInteraction = () => {
  lastInteractionRef.current = Date.now()
}
```

### Slider Highlight (Repetition Nudge)

**Trigger:** User adjusts same slider 3+ times without touching others

**Effect:**
- Add subtle glow to a different slider
- Glow: Box-shadow with `var(--lab-accent)`, 0 0 8px
- Pulse animation (opacity 0.5 → 1 → 0.5, 1.5s, infinite)
- Applies to unlocked slider user hasn't tried yet

**Priority for highlighting:**
1. If only diagonal sliders touched → Highlight other diagonal slider
2. If diagonal sliders explored → Highlight off-diagonal (if unlocked)
3. If all sliders touched → Don't highlight (user is exploring naturally)

**Dismiss:**
- User adjusts the highlighted slider
- After 10 seconds (auto-dismiss to avoid annoyance)

### States Summary

| Idle Scenario | Visual Nudge | Duration | Dismiss Trigger |
|---------------|--------------|----------|----------------|
| First 5s | Slider pulse + tooltip | Until interaction | Any slider adjustment |
| Repetitive use | Highlight different slider | 10s max | User tries different slider |
| Challenge stuck | "Show Hint" button | Until clicked or solved | Proximity improves |
| 30s no interaction | Auto-animate slider | Single occurrence | Runs once |

### Constraints
- Nudges must be **helpful, not annoying**
- Never show multiple nudges simultaneously (creates confusion)
- All nudges must be dismissible by user interaction
- Don't interrupt active exploration (only trigger during true idle moments)
- Respect user agency (hints are suggestions, not demands)
- Track state across session (don't repeat same nudge)

### Accessibility

- Tooltips announced to screen readers via `role="tooltip"` and `aria-live="polite"`
- Hint button has clear `aria-label`: "Show hint for current challenge"
- Auto-animations don't violate `prefers-reduced-motion` (skip animation if set)
- Keyboard focus visible on hint button when it appears

---

## Prompt 9: Responsive Layout & Accessibility Polish

### Context
Ensure the module works seamlessly on mobile devices, tablets, and desktops while meeting WCAG AA accessibility standards. This is about inclusive design—making the experience work for everyone.

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
│  │               │  │  Matrix      │   │
│  │               │  │  Controls    │   │
│  │   Canvas      │  │              │   │
│  │   (600×600)   │  │  ┌────┐      │   │
│  │               │  │  │a₁₁│      │   │
│  │               │  │  └────┘      │   │
│  │               │  │  [━━●━━]     │   │
│  │               │  │              │   │
│  └───────────────┘  └──────────────┘   │
└─────────────────────────────────────────┘
    Left: Canvas          Right: Controls
```

- Container: Flex row with gap (24px)
- Canvas: Fixed 600×600px (doesn't grow)
- Panel: Fixed 320px width, sticky positioning
- Panel stays visible on scroll (top: 80px)

### Tablet/Mobile Layout (<1024px)

```
┌──────────────────────┐
│                      │
│      Canvas          │
│    (responsive)      │
│                      │
└──────────────────────┘
┌──────────────────────┐
│   Matrix Controls    │
│                      │
│   ┌────┐  ┌────┐    │
│   │a₁₁│  │a₁₂│    │
│   └────┘  └────┘    │
│   [━━●━━] [━━━●━]   │
└──────────────────────┘
```

- Container: Flex column
- Canvas: 90vw × 90vw (maintains aspect ratio)
- Panel: 100% width, positioned below canvas
- Add spacing between canvas and panel (16px)

### Touch Optimizations (Mobile)

**Slider enhancements:**
- Increase thumb size: 24px (from 20px desktop)
- Increase track height: 8px (from 6px desktop)
- Increase touch target: 44×44px minimum (invisible padding)
- Add `touch-action: none` to prevent scroll during drag

**Button sizing:**
- Minimum height: 44px
- Minimum width: 80px
- Increase padding: 12px 20px (from 8px 16px)

**Canvas interaction:**
- Prevent default touch behaviors (no pinch-zoom on canvas)
- Disable double-tap zoom on canvas area
- Add meta viewport tag: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`

### Keyboard Navigation

**Tab order:**
1. Canvas (receives focus for screen reader description)
2. Matrix slider a₁₁
3. Matrix slider a₁₂ (if unlocked)
4. Matrix slider a₂₁ (if unlocked)
5. Matrix slider a₂₂
6. Reset button
7. "Try a Challenge" button (when visible)
8. Buttons in reveal panel (when open)

**Slider keyboard controls:**
- **Arrow keys:** ↑/→ increase by 0.1, ↓/← decrease by 0.1
- **Page Up/Down:** Increase/decrease by 0.5 (coarse adjustment)
- **Home:** Jump to minimum (-2)
- **End:** Jump to maximum (2)
- **Shift + Arrow:** Increase/decrease by 0.01 (fine adjustment)

**Modal focus trap:**
- When reveal panel opens, focus moves to first button
- Tab cycles between buttons only (can't tab to background)
- Escape key closes modal and returns focus to trigger

### Screen Reader Support

**Canvas area:**
```html
<div 
  role="img" 
  aria-label="Coordinate grid showing vector transformation. Original vector in gray, transformed vector in cyan."
  tabindex="0"
>
  {/* R3F Canvas */}
</div>
```

**Matrix sliders:**
```html
<input
  type="range"
  aria-label="Matrix entry a-1-1, current value 1.5"
  aria-valuemin={-2}
  aria-valuemax={2}
  aria-valuenow={matrix.a11}
  aria-valuetext={`${matrix.a11.toFixed(1)}`}
/>
```

**Live regions for dynamic feedback:**

```html
{/* Proximity feedback */}
<div aria-live="polite" aria-atomic="true">
  {proximityText}
</div>

{/* Discovery badge */}
<div role="status" aria-live="polite">
  {currentBadge && `You discovered: ${currentBadge}`}
</div>
```

**Transformation state announcements:**
- When transformation type detected, announce to screen reader
- When challenge matched, announce "Perfect match!"
- When reveal panel opens, announce "Matrix notation revealed"

### Color Contrast (WCAG AA)

**Verify contrast ratios:**
- Text on background: Minimum 4.5:1
- UI controls on background: Minimum 3:1
- Focused elements: Clear visual indication (not color-only)

**Current colors check:**
- Accent (`#22d3ee`) on dark background (`#0a0a0f`): ✅ High contrast
- Muted text (`#888888`) on dark background: ⚠️ Check (may need adjustment)
- Border (`var(--lab-border)`) visibility: ✅ Sufficient

**Non-color distinction:**
- Original vector: Gray + thinner stroke (2px)
- Transformed vector: Cyan + thicker stroke (3px)
- Target vector: Cyan + dashed pattern + 50% opacity
- Distinction works for colorblind users (shape/pattern differences)

### Animation Preferences

**Respect prefers-reduced-motion:**

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Apply globally
useEffect(() => {
  if (prefersReducedMotion) {
    // Disable GSAP animations
    gsap.globalTimeline.timeScale(100)  // Instant transitions
    
    // Or set config
    gsap.config({ nullTargetWarn: false })
  }
}, [prefersReducedMotion])
```

**What to disable if reduced motion preferred:**
- Vector position animations (instant snap instead)
- Celebration pulse (show/hide without animation)
- Discovery badge fade-in/out (instant show/hide)
- Reveal panel entrance (no slide, just appear)

**What to keep:**
- Static visuals (grid, vectors)
- Functional interactions (sliders still work)
- State changes (transformations still happen, just instantly)

### Responsive Font Sizing

**Use relative units:**
- Base font: 16px (1rem)
- Canvas labels: 0.625rem (10px)
- Proximity feedback: 0.875rem (14px)
- Button text: 1rem (16px)
- Reveal panel body: 0.875rem (14px)

**Mobile adjustments:**
- Increase base to 18px on small screens
- Scale all relative units proportionally

### Performance Optimizations (Mobile)

**Reduce render overhead:**
- Debounce slider updates (update max 60fps, not on every pixel)
- Use `will-change` for animated elements
- Lazy-load reveal panel (don't render until needed)

**Canvas optimizations:**
- Lower pixel ratio on low-end devices: `dpr={Math.min(window.devicePixelRatio, 2)}`
- Reduce antialiasing if performance suffers
- Use simpler geometry for arrowheads on mobile (8 segments vs 16)

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

**Responsive:**
- [ ] Layout doesn't break at any viewport width
- [ ] Touch targets meet 44×44px minimum
- [ ] Canvas maintains aspect ratio
- [ ] Text readable at all sizes
- [ ] No horizontal scroll

### Component Structure

```typescript
export function VectorTransformationsModule() {
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
      <MatrixControlPanel isMobile={isMobile} />
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
/src/components/modules/vector-transforms/
├── Module.tsx                      # Main orchestrator component
├── Canvas.tsx                      # R3F Canvas with grid (Prompt 2)
├── CoordinateGrid.tsx             # Grid lines and axis (Prompt 2)
├── VectorArrow.tsx                # Reusable vector component (Prompt 3)
├── MatrixControlPanel.tsx         # 4-slider interface (Prompt 4)
├── ChallengeMode.tsx              # Target matching logic (Prompt 5)
├── TargetVector.tsx               # Ghost target display (Prompt 5)
├── ProximityFeedback.tsx          # "Getting closer..." text (Prompt 5)
├── DiscoveryBadge.tsx             # Transformation badges (Prompt 6)
├── CelebrationPulse.tsx           # Match success effect (Prompt 6)
├── RevealPanel.tsx                # Matrix notation modal (Prompt 7)
├── MatrixNotation.tsx             # Formatted matrix display (Prompt 7)
├── IdleNudges.tsx                 # Tooltip system (Prompt 8)
├── HintSystem.tsx                 # Challenge hints (Prompt 8)
└── utils/
    ├── matrix-math.ts             # transformVector, classify (Prompt 1)
    ├── proximity.ts               # calculateProximity, isMatch (Prompt 1)
    ├── types.ts                   # TypeScript types (Prompt 1)
    └── colors.ts                  # Design tokens (Prompt 1)
```

---

## Quality Checklist

Before considering implementation complete:

### Functional Requirements
- [ ] All 4 matrix entries controllable via sliders
- [ ] Real-time vector transformation on matrix changes
- [ ] Progressive unlock (diagonal → off-diagonal after 3 adjustments)
- [ ] Challenge mode with target matching
- [ ] Proximity feedback updates in real-time
- [ ] Discovery badges appear on first transformation type detection
- [ ] Celebration pulse on challenge match
- [ ] Reveal panel shows actual matrix values with explanations
- [ ] Reset button returns to identity matrix
- [ ] Idle nudges guide stuck users

### Visual & Animation
- [ ] Grid displays correctly with labeled axes
- [ ] Vectors render as arrows with heads
- [ ] Original vector stays gray, transformed stays cyan
- [ ] Target vector appears dashed with lower opacity
- [ ] Smooth GSAP animations (0.4s duration, ease-out)
- [ ] No animation jank (60fps maintained)
- [ ] Badge fade-in/out smooth
- [ ] Celebration pulse expands and fades correctly
- [ ] Reveal panel slides in smoothly

### UX & Pedagogy
- [ ] Entry point clear ("Change the matrix...")
- [ ] No wrong answers in exploration mode
- [ ] Progressive complexity (simple → complex)
- [ ] Formula reveal comes after understanding
- [ ] Match threshold requires intentional effort (not luck)
- [ ] Hints helpful but not hand-holding
- [ ] Success feels earned, not given

### Responsive & Accessibility
- [ ] Works on mobile (320px width minimum)
- [ ] Touch targets 44×44px on mobile
- [ ] Keyboard navigation functional
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG AA
- [ ] Respects prefers-reduced-motion
- [ ] Focus visible on all interactive elements
- [ ] Modal focus trap works correctly

### Performance
- [ ] Client-side computation (no API calls)
- [ ] 60fps on mobile devices
- [ ] Canvas renders at appropriate pixel ratio
- [ ] No memory leaks from animations
- [ ] Slider updates debounced if needed

### States & Edge Cases
- [ ] Initial load shows identity matrix
- [ ] Progressive unlock triggers at 3 adjustments
- [ ] Challenge mode activates after 20s exploration
- [ ] Multiple discoveries tracked (no duplicate badges)
- [ ] Reveal panel dismissible (button/ESC/backdrop)
- [ ] Auto-animation only triggers once per session
- [ ] Hint system activates when stuck

---

## Next Steps After Build

1. **User testing:** Have 3-5 target users try module, observe where they get stuck
2. **Refinement:** Adjust match thresholds, hint triggers, animation timings based on feedback
3. **Documentation:** Create "Behind This" pedagogical rationale (see companion doc)
4. **Integration:** Wire into portfolio navigation and module selection
5. **Analytics:** Track which transformations discovered first, challenge success rates

---

*These prompts can be used sequentially with UI generation tools (v0, Bolt, Claude frontend-design) or as implementation guides for manual development.*