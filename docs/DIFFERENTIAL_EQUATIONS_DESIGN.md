# Differential Equations: Phase Portraits Module - Design Document

> **Purpose:** Design spec for an interactive learning experience teaching differential equation solutions through phase portrait visualization.
>
> **Date:** December 31, 2025
> **Status:** Sample design for Brilliant curriculum expansion
> **Target Audience:** Post-calculus learners exploring differential equations

---

## Learning Goal

Users discover how different differential equation parameters create different solution behaviors by manipulating a 2D system and watching trajectories evolve in real-time. They build intuition for stability, equilibrium points, and phase portraits before encountering formal differential equation notation.

**Essential Concepts:**

| Concept | What Student Learns | Why Essential |
|---------|---------------------|---------------|
| Solution trajectories | How differential equations generate paths in phase space | Foundation for understanding DEs |
| Equilibrium points | Where trajectories converge or diverge | Key to understanding system behavior |
| Stability | How parameter values create stable/unstable/center behaviors | Core concept for applications |
| Phase portraits | Visual representation of all possible solutions | Intuitive understanding of DE families |

**Key Insight:** "Differential equation parameters aren't arbitrary numbers—they control system behavior." The equation becomes a tool for understanding dynamics, not just a computational object.

**Skipped:** Analytical solution methods, Laplace transforms, numerical methods (for depth over breadth).

---

## Architecture

### Stage Flow

```
observe → parameters → trajectories → stability → challenge → reveal
              │            │              │
          [explore]    [explore]      [explore]
              │            │              │
          [match]      [match]        [match]
              │            │              │
          [reflect]    [reflect]      [reflect]
```

**Progress:** Continuous bar at top showing stage completion

### State Shape

```typescript
type Stage = 'observe' | 'parameters' | 'trajectories' | 'stability' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect'
type ChallengePhase = 'diagnose' | 'match'

// Core state
const [stage, setStage] = useState<Stage>('observe')
const [subStage, setSubStage] = useState<SubStage>('explore')

// System parameters (2D linear system: dx/dt = ax + by, dy/dt = cx + dy)
const [paramA, setParamA] = useState(0)      // -2 to 2
const [paramB, setParamB] = useState(1)      // -2 to 2
const [paramC, setParamC] = useState(-1)     // -2 to 2
const [paramD, setParamD] = useState(0)      // -2 to 2

// Fixed educational targets
const stageTargets = {
  parameters: { a: -1, b: 1, c: -1, d: 0 },  // Stable spiral
  trajectories: { a: 0, b: 1, c: -1, d: 0 }, // Center (periodic)
  stability: { a: 1, b: 0, c: 0, d: -1 },   // Saddle point
}

// Challenge state
const [challengePhase, setChallengePhase] = useState<ChallengePhase>('diagnose')
const [challengeType, setChallengeType] = useState<'stable' | 'unstable' | 'center' | 'saddle'>('stable')
```

---

## Component Structure

### Reusable Components (from existing library)

| Component | Location | Usage |
|-----------|----------|-------|
| `Scene.tsx` | modules/differential-equations/ | Responsive layout, R3F canvas |
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
| `PhasePlane.tsx` | Renders 2D phase plane with coordinate axes |
| `Trajectory.tsx` | Single solution trajectory path |
| `TrajectoryField.tsx` | Vector field showing direction at each point |
| `EquilibriumPoint.tsx` | Visualizes equilibrium points (stable/unstable/center) |
| `TargetPattern.tsx` | Ghost pattern showing target trajectory behavior |
| `ParameterMatrix.tsx` | Displays system matrix with visual connection to trajectories |
| `EquationPreview.tsx` | Shows building differential equation notation |

---

## Stage Specifications

### Stage 1: Observe

**Purpose:** Establish parameter-to-trajectory relationship.

| Property | Value |
|----------|-------|
| Duration | 5-second auto-play animation |
| Controls | None (watch only) |
| Exit | "Continue →" button appears after animation |
| Visual | Multiple trajectories evolve from different starting points; parameters highlight in sync |

**User insight:** "The parameters control how trajectories behave—some spiral in, some spiral out, some form circles."

**Visual Design:**
- Phase plane (x-y coordinate system) centered on screen
- Multiple starting points (dots) distributed across plane
- Trajectories animate outward from each starting point
- Vector field shows direction at each point (subtle arrows)
- System matrix displayed with highlighted parameters
- Color coding: stable (cyan), unstable (magenta), center (yellow)

---

### Stage 2: Parameters

**Purpose:** System parameters control trajectory shape.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Adjust parameters to create a stable spiral" |
| Sliders | Param A: -2 to 2, Param B: -2 to 2, Param C: -2 to 2, Param D: -2 to 2 |
| Target | Ghost pattern showing stable spiral behavior |
| Visual | Trajectories update in real-time as parameters change |
| Matrix Display | Shows system matrix: `[a, b], [c, d]` with highlighted entries |
| Vector Field | Updates dynamically showing direction changes |

**User discovery:** "Changing the parameters changes how trajectories move—some spiral inward, some outward."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Parameters match target stable spiral: a ≈ -1, b ≈ 1, c ≈ -1, d ≈ 0 (within threshold) |
| Celebration | Glow/pulse on trajectories, 0.8s pause |
| Matrix | Updates to show stable spiral matrix |
| Visual | Trajectories converge to stable spiral pattern |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If parameter A were positive instead of negative, what would happen to the trajectories?" |
| Choices | Spiral inward / Spiral outward / Form circles / Move in straight lines |
| On correct | Trajectories flash to positive A, showing outward spiral |
| On incorrect | Subtle shake, allow retry |
| Exit | Auto-advance to trajectories stage |

---

### Stage 3: Trajectories

**Purpose:** Different parameter combinations create different trajectory patterns.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Create trajectories that form closed circles (center behavior)" |
| Sliders | All parameters unlocked, but previous stable spiral values locked as starting point |
| Target | Ghost pattern showing center (periodic) behavior |
| Visual | Trajectories form closed loops when parameters match center behavior |
| Matrix Display | Shows center matrix: `[0, 1], [-1, 0]` (pure imaginary eigenvalues) |

**User discovery:** "Some parameter combinations create closed loops—the system oscillates forever."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Parameters match center behavior: a ≈ 0, b ≈ 1, c ≈ -1, d ≈ 0 |
| Celebration | Same pattern as previous stage |
| Matrix | Updates to show center matrix |
| Visual | Trajectories form perfect circles |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "How many equilibrium points does a center system have?" |
| Choices | 0 / 1 / 2 / Infinite |
| On correct | Equilibrium point highlights at origin |
| Exit | Auto-advance to stability stage |

---

### Stage 4: Stability

**Purpose:** Parameter values determine stability type.

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Create a saddle point (unstable in one direction, stable in another)" |
| Control | Sliders for all parameters, but center values locked |
| Target | Ghost pattern showing saddle behavior |
| Visual | Trajectories approach along one direction, diverge along another |
| Matrix Display | Shows saddle matrix: `[1, 0], [0, -1]` (real eigenvalues of opposite signs) |

**User discovery:** "Saddle points are unstable in one direction but stable in another—trajectories get pulled in two different ways."

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | Parameters match saddle: a ≈ 1, b ≈ 0, c ≈ 0, d ≈ -1 |
| Celebration | Same pattern as previous stages |
| Matrix | Updates to show saddle matrix |
| Visual | Trajectories show characteristic saddle pattern |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If both eigenvalues were positive, what type of equilibrium would you have?" |
| Choices | Stable node / Unstable node / Saddle / Center |
| On correct | Trajectories flash to unstable node pattern |
| Exit | Auto-advance to challenge stage |

---

### Stage 5: Challenge

**Purpose:** Apply understanding independently.

#### Setup

```typescript
// Randomly pick which stability type to match
const challengeType = pickRandom(['stable', 'unstable', 'center', 'saddle'])

// Generate challenge parameters for that type
const challengeParams = {
  stable: { a: -0.5, b: 1, c: -1, d: -0.5 },
  unstable: { a: 0.5, b: 1, c: -1, d: 0.5 },
  center: { a: 0, b: 1, c: -1, d: 0 },
  saddle: { a: 1, b: 0.5, c: 0.5, d: -1 },
}[challengeType]
```

#### Diagnose Phase (5a)

| Element | Details |
|---------|---------|
| Display | User's trajectory pattern + challenge pattern (different color) |
| Prompt | "This trajectory pattern is different. What type of equilibrium is it?" |
| Choices | Stable / Unstable / Center / Saddle |
| Visual | Side-by-side comparison of trajectory patterns |
| On correct | Unlock parameter sliders, proceed to match |

#### Match Phase (5b)

| Element | Details |
|---------|---------|
| Controls | All parameters unlocked for fine-tuning |
| Feedback | Match percentage indicator (0-100%) based on trajectory similarity |
| Threshold | 95% match triggers success |
| Visual | Real-time comparison between user trajectories and target pattern |
| Vector Field | Updates to show direction changes |
| On success | Celebration → reveal stage |

---

### Stage 6: Reveal

**Purpose:** Celebrate completion, reveal differential equation notation.

| Element | Details |
|---------|---------|
| Display | "You discovered the system:" |
| Equation | `dx/dt = ax + by`<br>`dy/dt = cx + dy` |
| Matrix | Full 2×2 system matrix with discovered values |
| Notation | `dX/dt = AX` where `X = [x, y]` and `A = [a, b], [c, d]` |
| Visual | User's final trajectory pattern |
| Copy | "System parameters control trajectory behavior. Stable systems converge, unstable systems diverge, centers oscillate forever." |
| Actions | Keep Exploring / Start Over |
| Trigger | Calls `onComplete` with final parameters |

---

## Questions Content

```typescript
const QUESTIONS = {
  parameters: {
    question: "If parameter A were positive instead of negative, what would happen to the trajectories?",
    choices: [
      { label: "Spiral inward", value: "inward" },
      { label: "Spiral outward", value: "outward" },
      { label: "Form circles", value: "circles" },
      { label: "Move in straight lines", value: "straight" },
    ],
    answer: "outward",
    flashValue: { a: 1, b: 1, c: -1, d: 0 }, // Unstable spiral
  },
  trajectories: {
    question: "How many equilibrium points does a center system have?",
    choices: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "Infinite", value: Infinity },
    ],
    answer: 1,
    highlightEquilibrium: true,
  },
  stability: {
    question: "If both eigenvalues were positive, what type of equilibrium would you have?",
    choices: [
      { label: "Stable node", value: "stable" },
      { label: "Unstable node", value: "unstable" },
      { label: "Saddle", value: "saddle" },
      { label: "Center", value: "center" },
    ],
    answer: "unstable",
    flashValue: { a: 1, b: 0, c: 0, d: 1 }, // Unstable node
  },
}
```

---

## Visual Design

**Aesthetic:** Clean, focused, Brilliant-aligned—NOT gaming-heavy

**Color Palette:**
- Background: Deep navy or off-black (`#0a0a0f`)
- Primary accent: Cyan/blue tones (cool theme)
- Trajectories: Cyan with gradient showing time progression
- Target trajectories: Semi-transparent cyan/blue
- Vector field: Subtle grey arrows
- Equilibrium points: Color-coded (stable: cyan, unstable: magenta, center: yellow, saddle: orange)
- Coordinate axes: Subtle grey lines

**Typography:**
- Headers: Geometric sans-serif
- UI labels: Clean sans-serif with good legibility
- Equation notation: Monospace font for clarity
- Formula: Elegant serif or mathematical font

**Interaction Feel:**
- Sliders: Large, touch-friendly, immediate response
- Trajectory animation: Smooth 60fps evolution
- Vector field: Updates dynamically with parameter changes
- Hover states: Subtle scale/glow on interactive elements
- Transitions: Smooth easing (0.2-0.3s)

---

## Technical Architecture

### Stack

```
Vite + React + TypeScript
├── React Three Fiber (2D visualization)
├── drei (R3F helpers)
├── GSAP (discrete transitions)
├── shadcn/ui (control components)
└── Tailwind CSS (styling)
```

### Component Hierarchy

```
<Module>
├── <Scene> (R3F Canvas)
│   ├── <PhasePlane /> — Grid and axes
│   ├── <TrajectoryField /> — Vector field visualization
│   ├── <Trajectory /> — Individual solution paths
│   ├── <EquilibriumPoint /> — Equilibrium visualization
│   ├── <TargetPattern /> — Ghost target trajectories
│   └── <ParameterMatrix /> — System matrix display
├── <ControlPanel>
│   ├── <ParameterSlider label="Param A" ... />
│   ├── <ParameterSlider label="Param B" ... />
│   ├── <ParameterSlider label="Param C" ... />
│   └── <ParameterSlider label="Param D" ... />
├── <ProgressBar stage={stage} />
├── <ExplorePrompt /> — Stage-specific prompts
├── <QuestionCard /> — Prediction questions
├── <FeedbackBanner /> — Correct/incorrect feedback
└── <EquationPreview /> — Building equation notation
```

### State Management

```typescript
// System parameters (user-controlled)
const [paramA, setParamA] = useState(0)
const [paramB, setParamB] = useState(1)
const [paramC, setParamC] = useState(-1)
const [paramD, setParamD] = useState(0)

// Numerical integration state
const [trajectories, setTrajectories] = useState<Array<Array<[number, number]>>>([])
const [timeStep, setTimeStep] = useState(0.01)
const [maxTime, setMaxTime] = useState(10)

// Derived: Compute trajectories from starting points
const computeTrajectories = useCallback((params: { a: number, b: number, c: number, d: number }) => {
  const startingPoints = [
    [1, 0], [0, 1], [-1, 0], [0, -1],
    [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]
  ]
  
  return startingPoints.map(start => {
    const path: [number, number][] = [start]
    let [x, y] = start
    
    for (let t = 0; t < maxTime; t += timeStep) {
      const dx = params.a * x + params.b * y
      const dy = params.c * x + params.d * y
      x += dx * timeStep
      y += dy * timeStep
      path.push([x, y])
    }
    
    return path
  })
}, [timeStep, maxTime])

// Derived: Compute equilibrium point type
const equilibriumType = useMemo(() => {
  const trace = paramA + paramD
  const determinant = paramA * paramD - paramB * paramC
  const discriminant = trace * trace - 4 * determinant
  
  if (determinant < 0) return 'saddle'
  if (discriminant < 0) return 'center'
  if (trace < 0) return 'stable'
  if (trace > 0) return 'unstable'
  return 'center'
}, [paramA, paramB, paramC, paramD])
```

### Performance Considerations

- Use `useMemo` for trajectory computations
- Limit trajectory points to ~1000 per path
- Use Web Workers for heavy numerical integration if needed
- Reuse geometries/materials for trajectory rendering
- Pre-allocate vectors, reuse via `.set()`
- Never `setState` inside `useFrame`
- Throttle parameter updates during slider drag

---

## Pedagogical Foundation

### Brilliant's Philosophy Applied

**"We don't teach how to do something before asking questions."**  
→ Module opens with a challenge (match the trajectory pattern), not differential equation theory

**"Let the learner try to find a solution before learning the procedure."**  
→ Users manipulate parameters to discover relationships; equation notation appears after success

**"Lessons build intuition with visual explanations and hands-on manipulation first, then introduce formal procedures."**  
→ The visualization IS the explanation; the differential equation is the capstone, not the foundation

**"The difference between a good student and a great student is that great students continually fail."**  
→ "Getting closer" feedback celebrates progress; no punishing wrong answers

### The "Earned Reveal" Mechanic

**Traditional approach:**
```
Here's the system: dx/dt = ax + by, dy/dt = cx + dy
The eigenvalues determine stability...
Now try changing the parameters...
```

**This module's approach:**
```
[User manipulates parameters]
[User sees trajectories evolve, patterns emerge]
[User matches target pattern]
→ "You discovered: dx/dt = -x + y, dy/dt = -x"
→ The equation describes what they ALREADY understand
```

The differential equation becomes a **label for intuition**, not a **barrier to entry**.

### Visual Connections

- Parameter sliders directly control trajectory behavior
- Vector field updates in real-time showing direction changes
- Equilibrium points highlight when trajectories converge/diverge
- Color coding reinforces stability concepts (stable = cyan, unstable = magenta)
- Trajectory paths show the "journey" of solutions through phase space

---

## Success Criteria

The module succeeds if:

- [ ] A hiring manager can understand it in 30 seconds without reading instructions
- [ ] Someone learns something about differential equations by playing with it for 2 minutes
- [ ] The differential equation reveal feels earned, not dumped
- [ ] It runs smoothly on mobile and desktop
- [ ] It signals: "This person thinks about learning, not just interfaces"
- [ ] Users can predict trajectory behavior before seeing it
- [ ] The connection between parameters and stability is clear
- [ ] Module completable in ~3-4 minutes
- [ ] Trajectory animations are smooth and visually clear

---

## Extension Opportunities

**Future Enhancements:**
- Nonlinear systems (limit cycles, chaos)
- 3D phase space visualization
- Time series plots alongside phase portraits
- Bifurcation diagrams (parameter sweeps)
- Real-world applications (pendulum, predator-prey, etc.)

**Curriculum Integration:**
- Natural follow-up to calculus (derivatives → differential equations)
- Bridge to physics (mechanical systems, circuits)
- Foundation for engineering applications (control systems)
- Preparation for advanced mathematics (dynamical systems theory)

---

*Last updated: December 31, 2025*
