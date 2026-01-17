# Module Anatomy
## Architectural Patterns for Interactive Learning Experiences

**Version:** 1.0  
**Created:** January 2026  
**Purpose:** Define reusable patterns that scale across modules

---

## Overview

This document captures the structural patterns discovered while building the Sinewave and Vector Transformations modules. These patterns form the foundation for a systematic approach to interactive learning experience design.

**Core principle:** Modules should feel different (unique visualizations, different math) but work the same (consistent stage flow, predictable interactions, familiar feedback patterns).

---

## Table of Contents

1. [Stage Machine Architecture](#stage-machine-architecture)
2. [Pedagogical Flow Template](#pedagogical-flow-template)
3. [Feedback Loop Architecture](#feedback-loop-architecture)
4. [Component Library](#component-library)
5. [Module Checklist](#module-checklist)

---

## Stage Machine Architecture

### The Problem

Without a stage system:
- UX decisions scattered across components
- State management becomes tangled
- Hard to reason about "what should be visible when"
- Difficult to add new stages without breaking existing flow
- No clear pattern for progressive complexity

### The Solution: Declarative Stage Definition

Each module defines stages as data, not imperative logic.

```typescript
type Stage = {
  id: string
  conditions: {
    enter: Condition[]   // What must be true to enter
    exit: Condition[]    // What triggers stage transition
  }
  ui: {
    controls: ControlConfig[]   // What's visible/interactive
    prompts: PromptConfig[]     // What text guides the user
    feedback: FeedbackConfig[]  // What responds to actions
  }
  transitions: {
    next?: string       // Auto-advance to this stage
    manual?: string[]   // User-triggered transitions
  }
}
```

### Example: Vector Transformations Stages

```typescript
const vectorTransformStages: Stage[] = [
  {
    id: 'diagonal-exploration',
    conditions: {
      enter: [{ type: 'initial' }],
      exit: [{ type: 'adjustment-count', target: 3, params: ['a11', 'a22'] }]
    },
    ui: {
      controls: [
        { id: 'a11-slider', state: 'active' },
        { id: 'a22-slider', state: 'active' },
        { id: 'a12-slider', state: 'hidden' },
        { id: 'a21-slider', state: 'hidden' }
      ],
      prompts: [{
        text: 'Change the matrix. Watch what happens to the vector.',
        position: 'above-canvas',
        style: 'persistent'
      }],
      feedback: [
        { type: 'real-time', element: 'transformed-vector', trigger: 'matrix-change' }
      ]
    },
    transitions: {
      next: 'off-diagonal-unlock'
    }
  },
  
  {
    id: 'off-diagonal-unlock',
    conditions: {
      enter: [{ type: 'adjustment-count', target: 3 }],
      exit: [{ type: 'time-elapsed', duration: 20000 }]
    },
    ui: {
      controls: [
        { id: 'a11-slider', state: 'active' },
        { id: 'a22-slider', state: 'active' },
        { id: 'a12-slider', state: 'active', animation: 'fade-in-pulse' },
        { id: 'a21-slider', state: 'active', animation: 'fade-in-pulse' }
      ],
      prompts: [{
        text: '✨ New controls unlocked!',
        position: 'top-right',
        style: 'badge',
        duration: 3000
      }],
      feedback: [
        { type: 'discovery', element: 'transformation-badge', trigger: 'classification-change' }
      ]
    },
    transitions: {
      next: 'challenge-ready'
    }
  },
  
  {
    id: 'challenge-ready',
    conditions: {
      enter: [{ type: 'time-elapsed', duration: 20000 }],
      exit: [{ type: 'user-action', action: 'start-challenge' }]
    },
    ui: {
      controls: [
        { id: 'all-sliders', state: 'active' },
        { id: 'challenge-button', state: 'visible', animation: 'fade-in' }
      ],
      prompts: [],
      feedback: [
        { type: 'discovery', element: 'transformation-badge', trigger: 'classification-change' }
      ]
    },
    transitions: {
      manual: ['challenge-active']
    }
  },
  
  {
    id: 'challenge-active',
    conditions: {
      enter: [{ type: 'user-action', action: 'start-challenge' }],
      exit: [{ type: 'match-success', threshold: { angle: 5, magnitude: 10 } }]
    },
    ui: {
      controls: [
        { id: 'all-sliders', state: 'active' },
        { id: 'exit-challenge-button', state: 'visible' }
      ],
      prompts: [{
        text: 'Match this vector',
        position: 'top-left',
        style: 'persistent'
      }],
      feedback: [
        { type: 'proximity', element: 'proximity-text', trigger: 'vector-change' },
        { type: 'visual', element: 'target-vector', trigger: 'stage-enter' }
      ]
    },
    transitions: {
      next: 'reveal',
      manual: ['challenge-ready']  // Exit challenge
    }
  },
  
  {
    id: 'reveal',
    conditions: {
      enter: [{ type: 'match-success' }],
      exit: [{ type: 'user-action', action: 'dismiss-reveal' }]
    },
    ui: {
      controls: [
        { id: 'all-sliders', state: 'disabled' }
      ],
      prompts: [],
      feedback: [
        { type: 'celebration', element: 'pulse-effect', trigger: 'stage-enter' },
        { type: 'modal', element: 'reveal-panel', trigger: 'stage-enter' }
      ]
    },
    transitions: {
      manual: ['challenge-ready', 'challenge-active']  // Try another or keep exploring
    }
  }
]
```

### Stage Manager Implementation Pattern

```typescript
function useStageManager(stages: Stage[], initialStageId: string) {
  const [currentStageId, setCurrentStageId] = useState(initialStageId)
  const [stageData, setStageData] = useState({})  // Tracks counters, timers, etc.
  
  const currentStage = stages.find(s => s.id === currentStageId)
  
  // Check exit conditions and auto-transition
  useEffect(() => {
    if (!currentStage) return
    
    const shouldExit = currentStage.conditions.exit.every(condition => 
      checkCondition(condition, stageData)
    )
    
    if (shouldExit && currentStage.transitions.next) {
      setCurrentStageId(currentStage.transitions.next)
    }
  }, [currentStage, stageData])
  
  // Manual transition function
  const transitionTo = (stageId: string) => {
    if (!currentStage?.transitions.manual?.includes(stageId)) {
      console.warn(`Invalid transition from ${currentStageId} to ${stageId}`)
      return
    }
    setCurrentStageId(stageId)
  }
  
  return {
    currentStage,
    stageData,
    updateStageData: setStageData,
    transitionTo
  }
}
```

### Key Benefits

1. **Declarative** — Stages describe what should happen, not how
2. **Testable** — Stage definitions are pure data, easy to validate
3. **Debuggable** — Current stage visible in React DevTools
4. **Flexible** — Add new stages without touching existing logic
5. **Reusable** — Stage manager works for any module

### What Scales Across Modules

**Stage pattern (consistent):**
```
Observe → Manipulate → Discover → Celebrate
```

**Stage specifics (unique per module):**
- What parameters control
- What triggers transitions
- What gets revealed

**Example applications:**
- **Sinewave:** Observe wave → Adjust amplitude → Adjust frequency → Match target → Reveal formula
- **Vector Transforms:** Observe vector → Adjust diagonal → Adjust off-diagonal → Match target → Reveal matrix
- **Phase Portraits:** Observe vector field → Adjust parameters → Discover equilibria → Reveal system dynamics

---

## Pedagogical Flow Template

### The Challenge-First Discovery Pattern

Every module follows the same learning arc, regardless of mathematical content.

```
┌─────────────┐
│  OBSERVE    │  No interaction required
│  (passive)  │  User sees phenomenon, builds curiosity
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ MANIPULATE  │  Direct control unlocked
│  (active)   │  User experiments freely, no goals
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  DISCOVER   │  Goal-directed challenge
│ (directed)  │  User applies understanding to match target
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CELEBRATE   │  Understanding earned
│  (reward)   │  Formula/notation revealed as confirmation
└─────────────┘
```

### Copy Placement Framework

| Copy Type | Purpose | Location | Duration | Style |
|-----------|---------|----------|----------|-------|
| **Stage Prompt** | Orient user to current goal | Top-left or above canvas | Persistent until stage change | Muted text, 14px |
| **Discovery Badge** | Acknowledge breakthrough | Top-right | 3 seconds | Accent pill with icon |
| **Proximity Feedback** | Guide toward goal | Top-right (below badges) | Dynamic updates | Color gradient by proximity |
| **Reveal Content** | Teach formal notation | Modal/panel overlay | User-dismissed | Structured with sections |
| **Idle Nudge** | Unstick confused users | Contextual (near target element) | 5 seconds or interaction | Tooltip with arrow |
| **Error Recovery** | Handle edge cases | Contextual | Until resolved | Alert style |

### Stage Prompt Examples

**Observe stage:**
- "Watch how the wave moves"
- "Notice what happens as time passes"
- "See the vector transform"

**Manipulate stage:**
- "Try changing the amplitude"
- "Drag this slider to control [parameter]"
- "Experiment with the controls"

**Discover stage:**
- "Can you match this wave?"
- "Match this vector"
- "Find the configuration that produces [target state]"

**Celebrate stage:**
- "Perfect match!"
- "You discovered [concept name]!"
- "You created a [transformation type] matrix"

### Earned Reveal Structure

Every reveal follows this template (enforced consistency):

```markdown
## 1. Celebration Acknowledgment
🎉 [Positive reinforcement]
Example: "Perfect match!" or "You nailed it!"

## 2. Concept Naming
You created/discovered: [Formal concept name]
Example: "You created a Rotation Matrix" or "You discovered Constructive Interference"

## 3. Visual Representation
[The formula/notation with user's actual values]
Example: Matrix notation with a11 = 0, a12 = -1, etc.

## 4. Entry-by-Entry Explanation
What each component does:
• [Component 1]: [Geometric/physical meaning]
• [Component 2]: [Geometric/physical meaning]
...

## 5. High-Level Summary
[1-2 sentence synthesis of what this accomplishes]
Example: "This rotates vectors 90° counterclockwise around the origin."

## 6. Next Actions
[Buttons for continuing journey]
- "Try Another" (new challenge)
- "Keep Exploring" (return to free exploration)
```

### Discovery Feedback Pattern

**When user creates recognizable patterns during exploration:**

```typescript
const discoveryTypes = {
  // Type detection happens in background
  detected: TransformationType | WaveType | SystemType
  
  // Badge appears on FIRST discovery only
  showBadge: boolean
  
  // Track what's been discovered
  discovered: Set<string>
}
```

**Badge display rules:**
- Only show on first discovery of each type
- Don't show during challenge mode (focus on goal)
- Don't show for "default" or "identity" states
- Auto-dismiss after 3 seconds
- Fade in + subtle pulse animation

**Example discoveries:**
- Vector Transforms: "Scaling", "Rotation", "Reflection"
- Sinewaves: "Amplitude Change", "Frequency Change", "Phase Shift"
- Phase Portraits: "Stable Node", "Saddle Point", "Center"

---

## Feedback Loop Architecture

### The Problem

Feedback is what makes manipulation feel direct. Poor feedback architecture leads to:
- Laggy interactions (disconnected cause-effect)
- Inconsistent animation timing
- Performance issues on mobile
- Hard-to-maintain animation code

### The Solution: Declarative Feedback Configs

Define what responds to what, separate from how it responds.

```typescript
type FeedbackConfig = {
  trigger: Trigger          // What causes this feedback
  element: ElementRef       // What responds
  response: Response[]      // How it responds
  conditions?: Condition[]  // Optional: Only if these are true
}

type Trigger = 
  | { type: 'parameter-change', params: string[] }
  | { type: 'proximity-change', thresholds: ProximityThreshold }
  | { type: 'stage-enter', stage: string }
  | { type: 'discovery', discoveryType: string }
  | { type: 'match-success' }
  | { type: 'user-action', action: string }

type Response = 
  | { type: 'animate', animation: Animation }
  | { type: 'show', transition: Transition }
  | { type: 'hide', transition: Transition }
  | { type: 'update-text', content: string | ((data: any) => string) }
  | { type: 'play-sound', sound: string }
  | { type: 'haptic', pattern: HapticPattern }

type Animation = {
  property: 'position' | 'opacity' | 'scale' | 'color' | 'rotation'
  from: Value | 'current'
  to: Value | ((data: any) => Value)
  duration: number
  easing: string
  delay?: number
}
```

### Example: Vector Transformation Feedback Loops

```typescript
const feedbackLoops: FeedbackConfig[] = [
  // Real-time vector transformation
  {
    trigger: { type: 'parameter-change', params: ['matrix'] },
    element: 'transformed-vector',
    response: [
      { 
        type: 'animate',
        animation: {
          property: 'position',
          from: 'current',
          to: (data) => transformVector(data.matrix, { x: 1, y: 0 }),
          duration: 0.4,
          easing: 'power2.out'
        }
      }
    ]
  },
  
  // Proximity feedback color transition
  {
    trigger: { type: 'proximity-change', thresholds: { close: 0.1, medium: 0.3, far: 0.5 } },
    element: 'proximity-text',
    response: [
      {
        type: 'update-text',
        content: (data) => {
          if (data.proximity < 0.1) return 'Almost there!'
          if (data.proximity < 0.3) return 'Getting closer...'
          return 'Keep going...'
        }
      },
      {
        type: 'animate',
        animation: {
          property: 'color',
          from: 'current',
          to: (data) => data.proximity < 0.1 ? 'accent' : 'muted',
          duration: 0.3,
          easing: 'linear'
        }
      }
    ],
    conditions: [{ type: 'stage-active', stage: 'challenge-active' }]
  },
  
  // Discovery badge appearance
  {
    trigger: { type: 'discovery', discoveryType: 'any' },
    element: 'discovery-badge',
    response: [
      { type: 'show', transition: 'fade-in-pulse' },
      { 
        type: 'hide', 
        transition: 'fade-out',
        delay: 3000  // Auto-dismiss after 3s
      }
    ],
    conditions: [
      { type: 'stage-not-active', stage: 'challenge-active' },
      { type: 'first-discovery', discoveryType: 'specific' }
    ]
  },
  
  // Celebration pulse on match
  {
    trigger: { type: 'match-success' },
    element: 'celebration-pulse',
    response: [
      {
        type: 'animate',
        animation: {
          property: 'scale',
          from: 0.5,
          to: 3,
          duration: 0.8,
          easing: 'power2.out'
        }
      },
      {
        type: 'animate',
        animation: {
          property: 'opacity',
          from: 0.4,
          to: 0,
          duration: 0.8,
          easing: 'linear'
        }
      }
    ]
  }
]
```

### Reusable Transitions Library

Create a shared transitions library that enforces consistency:

```typescript
// /src/lib/transitions.ts

export const transitions = {
  // Appearance transitions
  fadeIn: {
    opacity: [0, 1],
    duration: 0.3,
    easing: 'power2.out'
  },
  
  fadeOut: {
    opacity: [1, 0],
    duration: 0.3,
    easing: 'power2.in'
  },
  
  slideUp: {
    y: ['100%', '0%'],
    opacity: [0, 1],
    duration: 0.4,
    easing: 'power2.out'
  },
  
  slideDown: {
    y: ['0%', '100%'],
    opacity: [1, 0],
    duration: 0.4,
    easing: 'power2.in'
  },
  
  // Emphasis transitions
  pulse: {
    scale: [1, 1.05, 1],
    duration: 0.6,
    easing: 'power2.inOut'
  },
  
  fadeInPulse: {
    opacity: [0, 1],
    scale: [0.9, 1.05, 1],
    duration: 0.5,
    easing: 'power2.out'
  },
  
  // Celebration transitions
  celebrate: {
    scale: [0.5, 3],
    opacity: [0.4, 0],
    duration: 0.8,
    easing: 'power2.out'
  },
  
  // Interactive feedback
  highlightGlow: {
    boxShadow: [
      '0 0 0 rgba(34, 211, 238, 0)',
      '0 0 8px rgba(34, 211, 238, 0.6)',
      '0 0 0 rgba(34, 211, 238, 0)'
    ],
    duration: 1.5,
    repeat: Infinity,
    easing: 'power2.inOut'
  }
}

// Usage in components
import { transitions } from '@/lib/transitions'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={transitions.fadeIn}
>
  Content
</motion.div>
```

### Animation Performance Guidelines

**60fps Rule:**
- Only animate properties that don't trigger reflow: `transform`, `opacity`
- Never animate: `width`, `height`, `top`, `left` (use `transform` instead)

**Mobile optimization:**
- Reduce animation complexity on low-end devices
- Use `will-change` sparingly (only on actively animating elements)
- Debounce parameter updates if needed (max 60fps)

**GSAP best practices:**
```typescript
// Good: Transform-based animation
gsap.to(element, { x: 100, opacity: 0.5, duration: 0.4 })

// Bad: Layout-triggering animation
gsap.to(element, { left: '100px', width: '200px', duration: 0.4 })

// Good: Batch updates
gsap.set([elem1, elem2, elem3], { opacity: 0 })

// Bad: Sequential updates
gsap.set(elem1, { opacity: 0 })
gsap.set(elem2, { opacity: 0 })
gsap.set(elem3, { opacity: 0 })
```

---

## Component Library

### Primitive Components (The Building Blocks)

These components repeat across modules and should be abstracted into a shared library.

#### 1. ParameterSlider

**Purpose:** Unified control for adjusting numeric parameters

```typescript
interface ParameterSliderProps {
  label: string              // Display label (e.g., "a₁₁", "Amplitude")
  value: number              // Current value
  range: [number, number]    // Min and max
  step: number               // Increment step
  onChange: (value: number) => void
  disabled?: boolean         // Locked state
  formatValue?: (v: number) => string  // Custom display formatting
  onAdjust?: () => void      // Track adjustment count
  className?: string
}

// Usage
<ParameterSlider
  label="a₁₁"
  value={matrix.a11}
  range={[-2, 2]}
  step={0.1}
  onChange={(v) => setMatrix({ ...matrix, a11: v })}
  formatValue={(v) => v.toFixed(1)}
  onAdjust={() => incrementAdjustmentCount()}
/>
```

**Features:**
- Accessible (keyboard support, screen reader labels)
- Touch-optimized (44×44px minimum)
- Visual feedback (glow on focus, highlight on drag)
- Responsive (scales for mobile)

#### 2. ChallengeMode

**Purpose:** Framework for target-matching challenges

```typescript
interface ChallengeModeProps {
  active: boolean
  target: TargetState        // What user needs to match
  current: CurrentState      // User's current state
  proximityFn: (current: CurrentState, target: TargetState) => ProximityScore
  matchThreshold: MatchThreshold
  onMatch: (data: MatchData) => void
  onExit: () => void
  children?: React.ReactNode  // Render target visualization
}

// Usage
<ChallengeMode
  active={stage === 'challenge-active'}
  target={targetVector}
  current={transformedVector}
  proximityFn={calculateProximity}
  matchThreshold={{ angle: 5, magnitude: 10 }}
  onMatch={(data) => transitionTo('reveal')}
  onExit={() => transitionTo('exploration')}
>
  <TargetVectorVisualization vector={targetVector} />
</ChallengeMode>
```

**Features:**
- Proximity tracking
- Real-time feedback rendering
- Match detection
- Entry/exit animations

#### 3. DiscoveryBadge

**Purpose:** Acknowledge user discoveries during exploration

```typescript
interface DiscoveryBadgeProps {
  type: string | null        // Discovery type (e.g., 'rotation', 'scaling')
  labels: Record<string, string>  // Type → display label mapping
  discovered: Set<string>    // Already-discovered types
  onDiscover: (type: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

// Usage
<DiscoveryBadge
  type={classifyTransformation(matrix)}
  labels={{
    scaling: 'Scaling',
    rotation: 'Rotation',
    reflection: 'Reflection'
  }}
  discovered={discoveredTypes}
  onDiscover={(type) => setDiscoveredTypes(prev => new Set([...prev, type]))}
/>
```

**Features:**
- First-discovery detection
- Auto-dismiss timing
- Fade-in + pulse animation
- Icon + text customization

#### 4. RevealPanel

**Purpose:** Structured "earned understanding" modal

```typescript
interface RevealPanelProps {
  visible: boolean
  concept: string            // "Rotation Matrix", "Constructive Interference"
  notation: React.ReactNode  // Visual representation (matrix, formula, etc.)
  explanation: {
    entries: Array<{ label: string, meaning: string }>
    summary: string
  }
  onNext: () => void         // "Try Another" action
  onExplore: () => void      // "Keep Exploring" action
}

// Usage
<RevealPanel
  visible={stage === 'reveal'}
  concept="Rotation Matrix"
  notation={<MatrixNotation matrix={matrix} />}
  explanation={{
    entries: [
      { label: 'a₁₁ = 0.0', meaning: 'Horizontal component' },
      { label: 'a₁₂ = -1.0', meaning: 'Rotation component' },
      // ...
    ],
    summary: 'This rotates vectors 90° counterclockwise around the origin.'
  }}
  onNext={() => loadNewChallenge()}
  onExplore={() => transitionTo('exploration')}
/>
```

**Features:**
- Consistent structure (celebration → notation → explanation → summary → actions)
- Backdrop + focus trap
- Keyboard support (Escape to dismiss, Enter for primary action)
- Entrance/exit animations

#### 5. ProximityIndicator

**Purpose:** Real-time feedback during challenges

```typescript
interface ProximityIndicatorProps {
  score: ProximityScore      // Angle diff, magnitude diff, etc.
  labels: Record<string, string>  // Proximity level → text mapping
  thresholds: ProximityThreshold
  position?: 'top-right' | 'top-left'
}

// Usage
<ProximityIndicator
  score={calculateProximity(current, target)}
  labels={{
    far: 'Keep going...',
    medium: 'Getting closer...',
    close: 'Almost there!',
    match: 'Perfect match!'
  }}
  thresholds={{ close: 0.1, medium: 0.3, far: 0.5 }}
/>
```

**Features:**
- Color gradient by proximity (muted → accent)
- Smooth text transitions
- Configurable thresholds
- Qualitative feedback (not numeric)

#### 6. IdleNudge

**Purpose:** Contextual hints when user seems stuck

```typescript
interface IdleNudgeProps {
  trigger: IdleTrigger       // What condition activates this nudge
  target: RefObject<HTMLElement>  // Element to point at
  message: string
  onDismiss: () => void
}

// Usage
<IdleNudge
  trigger={{ type: 'idle', duration: 5000, stage: 'exploration' }}
  target={sliderRef}
  message="Try dragging this →"
  onDismiss={() => setNudgeShown(true)}
/>
```

**Features:**
- Tooltip with arrow pointer
- Auto-dismiss after 5s or interaction
- Positioning logic (above/below target)
- Fade-in animation

### Component Patterns That Repeat

#### 1. Progressive Reveal Pattern

Used when complexity should be introduced gradually:

```typescript
function useProgressiveReveal(unlockCondition: () => boolean) {
  const [isUnlocked, setIsUnlocked] = useState(false)
  
  useEffect(() => {
    if (!isUnlocked && unlockCondition()) {
      setIsUnlocked(true)
    }
  }, [isUnlocked, unlockCondition])
  
  return isUnlocked
}

// Usage in Vector Transforms
const offDiagonalUnlocked = useProgressiveReveal(() => adjustmentCount >= 3)

<ParameterSlider
  label="a₁₂"
  disabled={!offDiagonalUnlocked}
  className={offDiagonalUnlocked ? 'animate-fade-in-pulse' : 'hidden'}
  // ...
/>
```

#### 2. Discovery Tracking Pattern

Used to show badges only on first discovery:

```typescript
function useDiscoveryTracking<T extends string>() {
  const [discovered, setDiscovered] = useState<Set<T>>(new Set())
  const [currentDiscovery, setCurrentDiscovery] = useState<T | null>(null)
  
  const checkDiscovery = (type: T) => {
    if (!discovered.has(type) && type !== 'identity') {
      setCurrentDiscovery(type)
      setDiscovered(prev => new Set([...prev, type]))
      
      // Auto-dismiss after 3s
      setTimeout(() => setCurrentDiscovery(null), 3000)
    }
  }
  
  return { discovered, currentDiscovery, checkDiscovery }
}
```

#### 3. Match Detection Pattern

Used for challenge mode success criteria:

```typescript
function useMatchDetection(
  current: State,
  target: State,
  isMatch: (c: State, t: State) => boolean,
  onMatch: (data: MatchData) => void
) {
  const [hasMatched, setHasMatched] = useState(false)
  
  useEffect(() => {
    if (!hasMatched && isMatch(current, target)) {
      setHasMatched(true)
      onMatch({ current, target, timestamp: Date.now() })
    }
  }, [current, target, hasMatched, isMatch, onMatch])
  
  return { hasMatched, reset: () => setHasMatched(false) }
}
```

### shadcn Registry Structure

Create a custom registry for learning module primitives:

```bash
# Install learning module components
npx shadcn@latest add https://your-domain.com/registry/parameter-slider
npx shadcn@latest add https://your-domain.com/registry/challenge-mode
npx shadcn@latest add https://your-domain.com/registry/discovery-badge
npx shadcn@latest add https://your-domain.com/registry/reveal-panel
npx shadcn@latest add https://your-domain.com/registry/proximity-indicator
npx shadcn@latest add https://your-domain.com/registry/idle-nudge
```

Each component comes with:
- Full TypeScript types
- Accessibility built-in
- Animation patterns included
- Lab color system integration
- Responsive behavior
- Usage examples in docs

---

## Module Checklist

Use this checklist when building a new module to ensure architectural consistency.

### Stage Machine
- [ ] Stages defined as declarative config (not imperative logic)
- [ ] Clear enter/exit conditions for each stage
- [ ] UI config specifies controls, prompts, feedback per stage
- [ ] Transitions defined (auto-advance and manual)
- [ ] Stage manager implemented with useStageManager hook

### Pedagogical Flow
- [ ] Follows Observe → Manipulate → Discover → Celebrate pattern
- [ ] Stage prompts positioned consistently (top-left or above canvas)
- [ ] Discovery badges appear top-right, auto-dismiss after 3s
- [ ] Proximity feedback during challenge mode
- [ ] Reveal panel follows standard structure (celebration → notation → explanation → summary → actions)

### Feedback Loops
- [ ] Real-time parameter feedback (transformations animate smoothly)
- [ ] Proximity feedback color transitions based on closeness
- [ ] Discovery badges on first detection only
- [ ] Celebration effect on challenge success
- [ ] All animations use transitions library (fadeIn, slideUp, celebrate, etc.)
- [ ] Performance: Only animate transform and opacity

### Components
- [ ] ParameterSlider used for all numeric controls
- [ ] ChallengeMode framework handles target matching
- [ ] DiscoveryBadge tracks and displays breakthroughs
- [ ] RevealPanel provides earned understanding
- [ ] ProximityIndicator gives real-time goal feedback
- [ ] IdleNudge helps stuck users

### Accessibility
- [ ] Keyboard navigation works for all controls
- [ ] Screen readers announce state changes (aria-live regions)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets 44×44px minimum on mobile
- [ ] Respects prefers-reduced-motion

### Responsive
- [ ] Desktop: Side-by-side layout (canvas + controls)
- [ ] Tablet/Mobile: Stacked layout (canvas above controls)
- [ ] Canvas maintains aspect ratio at all viewport sizes
- [ ] Touch-optimized sliders (larger thumbs, no-scroll)
- [ ] Text readable at all sizes

### Performance
- [ ] Canvas renders at appropriate pixel ratio (max 2× on mobile)
- [ ] Animations stay at 60fps (use transform/opacity only)
- [ ] Parameter updates debounced if needed
- [ ] No memory leaks from animation timers

### Documentation
- [ ] Module has companion PRD (what and why)
- [ ] Build prompts exist for sequential implementation
- [ ] "Behind This" content explains pedagogical rationale
- [ ] Component README documents props and usage

---

## Evolution Notes

This document captures patterns as of January 2026 based on:
- Sinewave module (first implementation)
- Vector Transformations module (systematic redesign)

As more modules are built, update this document with:
- New patterns that emerge
- Refinements to existing patterns
- Deprecated patterns (what didn't work)

**Living document principle:** Architecture should serve the modules, not constrain them. If a pattern doesn't fit a new module's needs, question the pattern before forcing the fit.

---

## Next Steps

1. **Validate with Vector Transformations** — Build the module using these patterns, document what works and what needs adjustment
2. **Refactor Sinewave** — Apply patterns retroactively to prove they improve existing work
3. **Extract Component Library** — Once patterns are validated, create shadcn registry
4. **Document Edge Cases** — Capture gotchas, performance issues, common mistakes
5. **Build Module 3 (Phase Portraits)** — Stress-test patterns with different mathematical domain

---

*This anatomy is the foundation for systematic craft. Each module built strengthens the patterns, each pattern makes the next module easier.*