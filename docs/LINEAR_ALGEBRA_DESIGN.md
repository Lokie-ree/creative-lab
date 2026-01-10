# Linear Algebra: Vector Transformations Module - Design Document

> **Purpose:** Design spec for an interactive learning experience teaching matrix-vector transformations through discovery.
>
> **Date:** December 31, 2025
> **Status:** Sample design for Brilliant curriculum expansion
> **Target Audience:** Post-calculus learners exploring linear algebra

---

## Learning Goal

Users discover how matrix transformations affect vectors by manipulating transformation matrices and watching vectors transform in real-time. They build intuition for rotation, scaling, and reflection transformations before encountering formal matrix notation.

**Essential Concepts:**

| Concept | What Student Learns | Why Essential |
|---------|---------------------|---------------|
| Matrix-vector multiplication | How matrix entries control vector transformation | Foundation for all linear algebra |
| Rotation transformations | How angle parameters create rotations | Core geometric transformation |
| Scaling transformations | How diagonal entries scale components | Direct visual feedback |
| Reflection transformations | How off-diagonal entries create reflections | Reveals matrix structure |

**Key Insight:** "Matrix entries aren't arbitrary numbers—they control geometric behavior." The transformation matrix becomes a tool for understanding, not just a computational object.

**Skipped:** Matrix multiplication, determinants, eigenvalues (for depth over breadth).

---

## Architecture

### Stage Flow

```
observe → rotation → scaling → reflection → challenge → reveal
              │            │          │
          [explore]    [explore]  [explore]
              │            │          │
          [match]      [match]    [match]
              │            │          │
          [reflect]    [reflect]  [reflect]
```

**Progress:** Continuous bar at top showing stage completion

### State Shape

```typescript
type Stage = 'observe' | 'rotation' | 'scaling' | 'reflection' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect'
type ChallengePhase = 'diagnose' | 'match'

// Core state
const [stage, setStage] = useState<Stage>('observe')
const [subStage, setSubStage] = useState<SubStage>('explore')

// Transformation parameters
const [rotationAngle, setRotationAngle] = useState(0)        // 0 - 2π
const [scaleX, setScaleX] = useState(1.0)                    // 0.5 - 2.0
const [scaleY, setScaleY] = useState(1.0)                     // 0.5 - 2.0
const [reflectionAxis, setReflectionAxis] = useState<'x' | 'y' | 'diag'>('x')

// Fixed educational targets
const stageTargets = {
  rotation: Math.PI / 4,      // 45 degrees
  scaleX: 1.5,
  scaleY: 1.5,
  reflection: 'diag' as const
}

// Challenge state
const [challengePhase, setChallengePhase] = useState<ChallengePhase>('diagnose')
const [challengeType, setChallengeType] = useState<'rotation' | 'scaling' | 'reflection'>('rotation')
```

---

## Component Structure

### Reusable Components (from existing library)

| Component | Location | Usage |
|-----------|----------|-------|
| `Scene.tsx` | modules/linear-algebra/ | Responsive layout, R3F canvas |
| `ControlPanel.tsx` | controls/ | Slider infrastructure |
| `ProgressBar.tsx` | shared/ | Stage indicator |
| `AnimatedPanel.tsx` | shared/ | Panel animations |
| `CelebrationPulse.tsx` | shared/ | Match celebration |
| `QuestionCard.tsx` | feedback/ | MCQ component |
| `FeedbackBanner.tsx` | feedback/ | Correct/incorrect banner |
| `ExplorePrompt.tsx` | shared/ | Stage-specific prompts |

### New Components

| Component | Purpose |
|-----------|---------|
| `VectorVisualization.tsx` | Renders 2D vectors in coordinate plane |
| `TransformationMatrix.tsx` | Displays matrix entries with visual connection to vectors |
| `TargetVector.tsx` | Ghost vector showing target position |
| `TransformationPath.tsx` | Animated path showing vector transformation |
| `MatrixPreview.tsx` | Shows building matrix notation |

---

## Stage Specifications

### Stage 1: Observe

**Purpose:** Establish vector-to-transformation relationship.

| Property | Value |
|----------|-------|
| Duration | 5-second auto-play animation |
| Controls | None (watch only) |
| Exit | "Continue →" button appears after animation |
| Visual | Vector rotates, scales, reflects; matrix entries highlight in sync |

**User insight:** "The matrix entries control how the vector moves."

**Visual Design:**
- Coordinate plane centered on screen
- Initial vector: `[1, 0]` (pointing right)
- Matrix displayed as 2×2 grid with highlighted entries
- Smooth animation showing rotation → scaling → reflection sequence
- Connector lines link matrix entries to vector components

---

### Stage 2: Rotation

**Purpose:** Rotation angle controls vector orientation.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Rotate the vector to match the target" |
| Slider | Rotation angle: 0 - 2π, starts at 0 |
| Target | Ghost vector at 45° (π/4) |
| Visual | Matrix entries update in real-time: `[cos(θ), -sin(θ)], [sin(θ), cos(θ)]` |
| Matrix Display | Shows live matrix with highlighted rotation entries |

**User discovery:** "Changing the angle changes the matrix entries, which changes the vector direction."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Angle = π/4 ± 0.1 radians |
| Celebration | Glow/pulse on vector, 0.8s pause |
| Matrix | Updates to show rotation matrix: `R(π/4)` |
| Visual | Vector aligns with target, matrix entries stabilize |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If the rotation angle were π/2 (90°), where would the vector point?" |
| Choices | Up / Right / Down / Left |
| On correct | Vector flashes to π/2 rotation, showing it points up |
| On incorrect | Subtle shake, allow retry |
| Exit | Auto-advance to scaling stage |

---

### Stage 3: Scaling

**Purpose:** Diagonal matrix entries scale vector components.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Scale the vector to match the target size" |
| Sliders | Scale X: 0.5 - 2.0, Scale Y: 0.5 - 2.0 (starts at 1.0, 1.0) |
| Locked | Rotation locked at π/4 |
| Target | Ghost vector scaled by 1.5 in both directions |
| Visual | Matrix diagonal entries update: `[sx, 0], [0, sy]` |
| Matrix Display | Shows scaling matrix with highlighted diagonal entries |

**User discovery:** "The diagonal entries control how much the vector stretches in each direction."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Scale X = 1.5 ± 0.1 AND Scale Y = 1.5 ± 0.1 |
| Celebration | Same pattern as rotation |
| Matrix | Updates to show scaling matrix: `S(1.5, 1.5)` |
| Visual | Vector matches target size, matrix entries stabilize |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If scale X were 2 and scale Y were 0.5, what shape would the vector create?" |
| Choices | Tall and thin / Short and wide / Square / Circle |
| On correct | Vector flashes to (2, 0.5) scaling, showing tall/thin shape |
| Exit | Auto-advance to reflection stage |

---

### Stage 4: Reflection

**Purpose:** Off-diagonal entries create reflections.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Reflect the vector across the diagonal line" |
| Control | Toggle: X-axis / Y-axis / Diagonal |
| Locked | Rotation and scaling locked at matched values |
| Target | Ghost vector reflected across diagonal |
| Visual | Matrix off-diagonal entries update based on reflection type |
| Matrix Display | Shows reflection matrix with highlighted off-diagonal entries |

**User discovery:** "The off-diagonal entries flip the vector across different axes."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Reflection axis = 'diag' |
| Celebration | Same pattern as previous stages |
| Matrix | Updates to show reflection matrix: `Ref(diag)` |
| Visual | Vector matches target reflection |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If we reflected across the x-axis, which matrix entry would change?" |
| Choices | Top-left / Top-right / Bottom-left / Bottom-right |
| On correct | Matrix flashes highlighting the correct entry |
| Exit | Auto-advance to challenge stage |

---

### Stage 5: Challenge

**Purpose:** Apply understanding independently.

#### Setup

```typescript
// Randomly pick which transformation type differs
const challengeType = pickRandom(['rotation', 'scaling', 'reflection'])

// Generate challenge vector differing by ONE transformation
const challengeVector = {
  rotation: challengeType === 'rotation'
    ? pickDifferentValue(Math.PI / 4, [0, Math.PI / 6, Math.PI / 3, Math.PI / 2])
    : Math.PI / 4,
  scaleX: challengeType === 'scaling'
    ? pickDifferentValue(1.5, [1.0, 1.25, 1.75, 2.0])
    : 1.5,
  scaleY: challengeType === 'scaling'
    ? pickDifferentValue(1.5, [1.0, 1.25, 1.75, 2.0])
    : 1.5,
  reflection: challengeType === 'reflection'
    ? pickDifferentValue('diag', ['x', 'y'])
    : 'diag',
}
```

#### Diagnose Phase (5a)

| Element | Details |
|---------|---------|
| Display | User's vector + challenge vector (different color) |
| Prompt | "This vector is different. What transformation changed?" |
| Choices | Rotation / Scaling / Reflection / Multiple |
| Note | "Multiple" is always wrong (single-transformation challenge) |
| On correct | Unlock relevant controls, proceed to match |

#### Match Phase (5b)

| Element | Details |
|---------|---------|
| Controls | Only diagnosed transformation type unlocked |
| Feedback | Match percentage indicator (0-100%) |
| Threshold | 95% match triggers success |
| Visual | Real-time comparison between user vector and target |
| On success | Celebration → reveal stage |

---

### Stage 6: Reveal

**Purpose:** Celebrate completion, reveal matrix notation.

| Element | Details |
|---------|---------|
| Display | "You built the transformation matrix:" |
| Matrix | Full 2×2 matrix with discovered values highlighted |
| Notation | `T = R(θ) · S(sx, sy) · Ref(axis)` |
| Visual | User's final transformed vector |
| Copy | "Matrix entries control geometric behavior. Rotation, scaling, and reflection combine to create any linear transformation." |
| Actions | Keep Exploring / Start Over |
| Trigger | Calls `onComplete` with final transformation |

---

## Questions Content

```typescript
const QUESTIONS = {
  rotation: {
    question: "If the rotation angle were π/2 (90°), where would the vector point?",
    choices: [
      { label: "Up", value: "up" },
      { label: "Right", value: "right" },
      { label: "Down", value: "down" },
      { label: "Left", value: "left" },
    ],
    answer: "up",
    flashValue: Math.PI / 2,
  },
  scaling: {
    question: "If scale X were 2 and scale Y were 0.5, what shape would the vector create?",
    choices: [
      { label: "Tall and thin", value: "tall" },
      { label: "Short and wide", value: "wide" },
      { label: "Square", value: "square" },
      { label: "Circle", value: "circle" },
    ],
    answer: "tall",
    flashValue: { x: 2, y: 0.5 },
  },
  reflection: {
    question: "If we reflected across the x-axis, which matrix entry would change?",
    choices: [
      { label: "Top-left", value: "topLeft" },
      { label: "Top-right", value: "topRight" },
      { label: "Bottom-left", value: "bottomLeft" },
      { label: "Bottom-right", value: "bottomRight" },
    ],
    answer: "bottomLeft",
    highlightEntry: [1, 0], // Matrix entry to highlight
  },
}
```

---

## Visual Design

**Aesthetic:** Clean, focused, Brilliant-aligned—NOT gaming-heavy

**Color Palette:**
- Background: Deep navy or off-black (`#0a0a0f`)
- Primary accent: Cyan/blue tones (cool theme)
- Vectors: Cyan with gradient showing magnitude
- Target vectors: Semi-transparent cyan/blue
- Matrix entries: Highlighted in cyan when active
- Coordinate axes: Subtle grey lines

**Typography:**
- Headers: Geometric sans-serif
- UI labels: Clean sans-serif with good legibility
- Matrix notation: Monospace font for clarity
- Formula: Elegant serif or mathematical font

**Interaction Feel:**
- Sliders: Large, touch-friendly, immediate response
- Matrix entries: Clickable to highlight connections
- Vector animation: Smooth 60fps transformations
- Hover states: Subtle scale/glow on interactive elements
- Transitions: Smooth easing (0.2-0.3s)

---

## Technical Architecture

### Stack

```
Vite + React + TypeScript
├── React Three Fiber (3D/2D visualization)
├── drei (R3F helpers)
├── GSAP (discrete transitions)
├── shadcn/ui (control components)
└── Tailwind CSS (styling)
```

### Component Hierarchy

```
<Module>
├── <Scene> (R3F Canvas)
│   ├── <CoordinatePlane /> — Grid and axes
│   ├── <VectorVisualization vector={transformedVector} />
│   ├── <TargetVector vector={targetVector} />
│   ├── <TransformationPath from={original} to={transformed} />
│   └── <TransformationMatrix matrix={currentMatrix} />
├── <ControlPanel>
│   ├── <ParameterSlider label="Rotation" ... />
│   ├── <ParameterSlider label="Scale X" ... />
│   ├── <ParameterSlider label="Scale Y" ... />
│   └── <ReflectionToggle ... />
├── <ProgressBar stage={stage} />
├── <ExplorePrompt /> — Stage-specific prompts
├── <QuestionCard /> — Prediction questions
├── <FeedbackBanner /> — Correct/incorrect feedback
└── <MatrixPreview /> — Building matrix notation
```

### State Management

```typescript
// Transformation parameters (user-controlled)
const [rotationAngle, setRotationAngle] = useState(0)
const [scaleX, setScaleX] = useState(1.0)
const [scaleY, setScaleY] = useState(1.0)
const [reflectionAxis, setReflectionAxis] = useState<'x' | 'y' | 'diag'>('x')

// Base vector (fixed for learning)
const baseVector = useMemo(() => [1, 0], [])

// Derived: Compute transformed vector
const transformedVector = useMemo(() => {
  let v = [...baseVector]
  
  // Apply rotation
  const cos = Math.cos(rotationAngle)
  const sin = Math.sin(rotationAngle)
  v = [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos]
  
  // Apply scaling
  v = [v[0] * scaleX, v[1] * scaleY]
  
  // Apply reflection
  if (reflectionAxis === 'x') v = [v[0], -v[1]]
  if (reflectionAxis === 'y') v = [-v[0], v[1]]
  if (reflectionAxis === 'diag') v = [v[1], v[0]]
  
  return v
}, [rotationAngle, scaleX, scaleY, reflectionAxis])

// Derived: Compute transformation matrix
const transformationMatrix = useMemo(() => {
  // Build matrix from current parameters
  // R(θ) · S(sx, sy) · Ref(axis)
  // ...
}, [rotationAngle, scaleX, scaleY, reflectionAxis])
```

### Performance Considerations

- Use `useMemo` for matrix computations
- Limit vector trail to ~100 points
- Reuse geometries/materials
- Pre-allocate vectors, reuse via `.set()`
- Never `setState` inside `useFrame`

---

## Pedagogical Foundation

### Brilliant's Philosophy Applied

**"We don't teach how to do something before asking questions."**  
→ Module opens with a challenge (match the vector), not matrix multiplication rules

**"Let the learner try to find a solution before learning the procedure."**  
→ Users manipulate sliders to discover relationships; matrix notation appears after success

**"Lessons build intuition with visual explanations and hands-on manipulation first, then introduce formal procedures."**  
→ The visualization IS the explanation; the matrix is the capstone, not the foundation

**"The difference between a good student and a great student is that great students continually fail."**  
→ "Getting closer" feedback celebrates progress; no punishing wrong answers

### The "Earned Reveal" Mechanic

**Traditional approach:**
```
Here's the rotation matrix: R(θ) = [cos(θ), -sin(θ)], [sin(θ), cos(θ)]
Now try changing the angle...
```

**This module's approach:**
```
[User manipulates rotation slider]
[User sees vector rotate, matrix entries update]
[User matches target vector]
→ "You built: R(π/4)"
→ The matrix describes what they ALREADY understand
```

The matrix becomes a **label for intuition**, not a **barrier to entry**.

### Visual Connections

- Matrix entries highlight when corresponding transformation is active
- Connector lines link matrix entries to vector components
- Real-time updates show immediate cause-and-effect
- Transformation path animates smoothly, showing the journey

---

## Success Criteria

The module succeeds if:

- [ ] A hiring manager can understand it in 30 seconds without reading instructions
- [ ] Someone learns something about matrix transformations by playing with it for 2 minutes
- [ ] The matrix notation reveal feels earned, not dumped
- [ ] It runs smoothly on mobile and desktop
- [ ] It signals: "This person thinks about learning, not just interfaces"
- [ ] Users can predict transformation outcomes before seeing them
- [ ] The connection between matrix entries and geometric effects is clear
- [ ] Module completable in ~3-4 minutes

---

## Extension Opportunities

**Future Enhancements:**
- Matrix multiplication visualization (combining transformations)
- 3D transformations (extend to 3×3 matrices)
- Eigenvalue/eigenvector discovery
- Determinant visualization (area scaling)
- Composition of transformations

**Curriculum Integration:**
- Natural follow-up to trigonometry (rotation matrices use sin/cos)
- Bridge to calculus (linear approximations)
- Foundation for computer graphics applications
- Preparation for systems of equations

---

*Last updated: December 31, 2025*
