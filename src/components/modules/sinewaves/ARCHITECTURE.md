# Sinewaves Module Architecture Documentation

## Overview

The sinewaves module is a finished prototype that demonstrates the module architecture pattern for the portfolio. It teaches the relationship between the unit circle and sine waves through interactive manipulation before explanation.

**Core Learning Goal**: Discover that amplitude controls wave height and frequency controls oscillation speed through hands-on exploration.

---

## Module Anatomy

### File Structure

```
src/components/modules/sinewaves/
├── Layout.tsx         # Slot-based layout (header, explorePrompt, formula, visualization, controls, overlays)
├── Module.tsx        # Module state and slot content; uses SinewavesLayout
├── Scene.tsx         # Main 3D visualization container (React Three Fiber Canvas)
├── UnitCircle.tsx    # Interactive unit circle with rotating point
├── SineWave.tsx      # Animated sine wave trail visualization
├── Connector.tsx     # Dashed line connecting circle point to wave (observe stage only)
├── sinewaves-copy.ts # Stage prompts and copy
└── ARCHITECTURE.md   # This documentation file
```

### Component Hierarchy

```
Module (src/components/modules/sinewaves/Module.tsx)
└── SinewavesLayout (Layout.tsx) — owns structure, positioning, z-index
    ├── header          → ProgressBar (top)
    ├── explorePrompt   → ExplorePrompt (top-center, conditional; includes data-stage-overlay for transitions)
    ├── formula         → FormulaPreview (top-right)
    ├── visualization   → div (flex-1 + padding) + Scene (main 3D area)
    │   └── Canvas (React Three Fiber)
    │       └── Visualization
    │           ├── UnitCircle (left side, or top on mobile)
    │           ├── Connector (only in 'observe' stage)
    │           └── SineWave (right side, or bottom on mobile)
    │               └── SineWave (ghost/target wave, conditional)
    ├── controls        → fragment: DelayIndicator, Continue button, ControlPanel (amplitude/frequency/challenge/freeExplore),
    │                     QuestionCard, MatchCelebration, FeedbackBanner, reveal panel, action buttons (all conditional by stage)
    └── children        → CelebrationPulse (full-screen overlay)
```

Layout owns where each section lives (positioning, spacing, z-index). Module decides what to render in each slot.

### Integration Points

**Entry Point**: `src/components/modules/sinewaves/Module.tsx` (loaded via ModuleLoader from config)

**Module Registration**: `src/config/modules.ts`
```typescript
{
  id: 'sinewaves',
  title: 'Sinewaves',
  component: () => import('@/components/Module').then(m => ({ default: m.Module })),
}
```

**App Integration**: `src/App.tsx`
- Module is loaded via Suspense with `ModuleLoader` fallback
- Receives `onComplete` callback and `isVisible` prop
- Wrapped in Navigation component

---

## State Machine Pattern

### Stage Types

```typescript
type Stage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect' | 'freeExplore'
type ChallengePhase = 'observe' | 'diagnose' | 'match'
```

### Stage Flow

```
observe
  └─> [5s delay + Continue button]
      └─> amplitude
          └─> explore
              └─> [match detected]
                  └─> match
                      └─> [auto-transition after 2s or manual]
                          └─> reflect
                              └─> [correct answer]
                                  └─> frequency
                                      └─> explore
                                          └─> [match detected]
                                              └─> match
                                                  └─> reflect
                                                      └─> [correct answer]
                                                          └─> challenge
                                                              └─> observe (3s delay)
                                                                  └─> diagnose
                                                                      └─> [correct answer]
                                                                          └─> match
                                                                              └─> [match score >= 95%]
                                                                                  └─> reveal
                                                                                      └─> [user choice]
                                                                                          ├─> Try Another (back to challenge)
                                                                                          ├─> Explore (freeExplore substage)
                                                                                          └─> Finish (calls onComplete)
```

### State Management

**Primary State**:
- `stage`: Current stage (Stage type)
- `subStage`: Current substage (SubStage type)
- `challengePhase`: Challenge-specific phase (ChallengePhase type)

**Wave Parameters**:
- `amplitude`: Current amplitude value (0.5 - 2.0)
- `frequency`: Current frequency value (0.5 - 3.0)
- `phase`: Always 0 (removed from v2)

**Discovery Memory**:
- `discoveries`: `{ amplitude: number | null, frequency: number | null }`
  - Stores matched values when user successfully completes each parameter stage
  - Used to display discovered values on locked sliders

**UI State**:
- `isPaused`: Animation pause state (controlled by UnitCircle drag)
- `celebrationCount`: Counter that triggers CelebrationPulse effect
- `isTransitioning`: Flag for stage transition animations
- `selectedAnswer`: Selected answer for questions
- `isCorrect`: Whether selected answer is correct
- `showContinue`: Show continue button in observe stage

**Challenge State**:
- `challengeParam`: Which parameter changed ('amplitude' | 'frequency')
- `challengeWave`: Target wave parameters for challenge stage

### Stage Transitions

**Automatic Transitions**:
1. **Match Detection**: When user matches target in explore substage
   - Triggers celebration pulse
   - Transitions to 'match' substage
   - Auto-transitions to 'reflect' after 2s or manual continue

2. **Challenge Match**: When match score >= 95% in challenge stage
   - Triggers celebration pulse
   - Transitions to 'reveal' stage after 800ms delay

3. **Delay-Based Transitions**:
   - Observe stage: 5s delay → show continue button
   - Challenge observe phase: 3s delay → transition to diagnose

**Manual Transitions**:
- Continue button (observe → amplitude)
- Correct answer in reflect substage (amplitude → frequency, frequency → challenge)
- Correct answer in challenge diagnose phase (diagnose → match)
- User actions in reveal stage (Try Another, Explore, Finish)

### Transition Animation System

**Pattern**: Exit animations → state update → enter animations

```typescript
// Stage transition effect
useEffect(() => {
  if (prevStage !== stage) {
    setIsTransitioning(true)
    
    // Find all UI overlays with data-stage-overlay attribute
    const uiOverlays = document.querySelectorAll('[data-stage-overlay]')
    
    // Animate out current UI
    const exitPromises = Array.from(uiOverlays).map((el) => {
      return new Promise<void>((resolve) => {
        const animation = stageTransitionOut(el)
        animation?.eventCallback("onComplete", () => resolve())
      })
    })
    
    // Wait for exits, then update state and animate in
    Promise.all(exitPromises).then(() => {
      setPrevStage(stage)
      setIsTransitioning(false)
      
      setTimeout(() => {
        const newOverlays = document.querySelectorAll('[data-stage-overlay]')
        newOverlays.forEach((el) => stageTransitionIn(el))
      }, 50)
    })
  }
}, [stage, prevStage])
```

**Animation Functions** (from `src/lib/animations.ts`):
- `stageTransitionOut`: Fade out + slight scale down (0.5s)
- `stageTransitionIn`: Fade in + scale to 1 (0.5s)
- Respects `prefers-reduced-motion`

---

## Component Patterns

### 1. Scene Component (`Scene.tsx`)

**Purpose**: Wrapper around React Three Fiber Canvas that conditionally renders to prevent WebGL context conflicts.

**Props**:
```typescript
interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }  // Ghost wave target
  stage: Stage
  isPaused: boolean
  onPauseChange: (paused: boolean) => void
  stageTargets?: { amplitude: number; frequency: number; phase: number }
  isVisible?: boolean  // Controls Canvas mount/unmount
}
```

**Key Features**:
- Conditionally renders Canvas based on `isVisible` (prevents WebGL conflicts during transitions)
- Responsive layout: side-by-side on desktop, stacked on mobile
- Shows ghost/target wave when `stage !== 'observe'`
- Shows connector line only in 'observe' stage
- Passes stage-specific ghost parameters to child components

**Layout Constants**:
```typescript
const CIRCLE_X = -2.5  // Desktop: circle on left
const WAVE_X = -0.3    // Desktop: wave on right
const GHOST_OPACITY = 0.5
```

### 2. UnitCircle Component (`UnitCircle.tsx`)

**Purpose**: Interactive unit circle visualization with rotating point that represents the sine wave's source.

**Props**:
```typescript
interface UnitCircleProps {
  amplitude: number    // Controls circle radius (visual reinforcement)
  frequency: number
  phase: number
  color?: string
  opacity?: number
  isPaused?: boolean
  onPauseChange?: (paused: boolean) => void
  draggable?: boolean  // Enable drag interaction (observe stage)
}
```

**Key Features**:
- Circle radius scales with amplitude (reinforces amplitude = radius concept)
- Rotating point position: `(cos(angle) * amplitude, sin(angle) * amplitude)`
- Angle calculation: `frequency * time + phase`
- Draggable interaction (only in observe stage):
  - Pauses animation when dragging
  - Converts pointer position to angle on circle
  - Updates point position in real-time
- Exposes `getCurrentPosition()` via ref for Connector component
- Uses `useFrame` hook for animation loop

**Animation Pattern**:
```typescript
useFrame((state) => {
  if (isPaused || isDragging) return
  
  const t = state.clock.elapsedTime
  const angle = frequency * t + phase
  updatePosition(angle)  // Updates point and radius line
})
```

### 3. SineWave Component (`SineWave.tsx`)

**Purpose**: Animated sine wave trail that shows the wave's evolution over time.

**Props**:
```typescript
interface SineWaveProps {
  amplitude: number
  frequency: number
  phase: number
  color?: string
  opacity?: number
  isPaused?: boolean
  showLiveDot?: boolean  // Show dot at current wave position
}
```

**Key Features**:
- Trail system: maintains last 200 points, shifts array on each frame
- Live point calculation: `y = amplitude * sin(frequency * t + phase)`
- X positions distributed across `WAVE_WIDTH` (4 units)
- Exposes `getCurrentY()` via ref for Connector component
- Optional live dot at current position (shown when `showLiveDot={true}`)

**Trail Algorithm**:
```typescript
// Add new point at index 0, shift existing points right
if (pointCount < MAX_POINTS) {
  // Still filling - shift existing, add new at 0
} else {
  // Full - shift all, add new at 0
}
// Distribute x positions: live point at x=0, trail extends right
```

### 4. Connector Component (`Connector.tsx`)

**Purpose**: Dashed line connecting the unit circle point to the wave's live point (only in observe stage).

**Props**:
```typescript
interface ConnectorProps {
  circleX: number    // World X position of circle center
  waveX: number      // World X position of wave start
  frequency: number
  phase: number
  amplitude: number
  isPaused?: boolean
  color?: string
  opacity?: number
}
```

**Key Features**:
- Animated dashed line using `THREE.LineDashedMaterial`
- Updates both endpoints each frame:
  - Circle point: `(circleX + cos(angle), sin(angle))`
  - Wave point: `(waveX, amplitude * sin(angle))`
- Dot at wave point emphasizes the y-value connection
- Only rendered in 'observe' stage

### 5. Module Component (`Module.tsx`)

**Purpose**: Main orchestrator component that manages stage flow, UI overlays, and user interactions.

**Key Responsibilities**:
1. **Stage Management**: Tracks current stage, substage, and challenge phase
2. **Parameter Control**: Manages amplitude and frequency state
3. **Match Detection**: Monitors parameter values against targets
4. **Progress Tracking**: Updates PortfolioContext with module progress
5. **UI Orchestration**: Conditionally renders overlays based on stage
6. **Animation Coordination**: Manages stage transition animations

**Shared Components Used**:
- `ControlPanel`: Parameter sliders with lock/unlock states
- `QuestionCard`: Multiple choice questions
- `FeedbackBanner`: Correct/incorrect feedback
- `MatchCelebration`: Celebration overlay on match
- `ExplorePrompt`: Top-center instructional prompt
- `FormulaPreview`: Top-right formula display
- `ProgressBar`: Top progress indicator
- `DelayIndicator`: Countdown timer for delays
- `AnimatedPanel`: Wrapper for animated UI panels

**Match Detection Logic**:
```typescript
// Parameter stages (amplitude, frequency)
const checkMatch = () => {
  if (stage === 'amplitude') {
    return Math.abs(amplitude - STAGE_TARGETS.amplitude) <= AMPLITUDE_THRESHOLD
  }
  if (stage === 'frequency') {
    return Math.abs(frequency - STAGE_TARGETS.frequency) <= FREQUENCY_THRESHOLD
  }
  return false
}

// Challenge stage
const challengeMatchScore = calculateMatchScore(
  amplitude, frequency,
  challengeWave.a, challengeWave.f
)
// Match when score >= 95%
```

**Progress Tracking**:
```typescript
useEffect(() => {
  const progressMap: Record<string, number> = {
    observe: 0.05,
    amplitude: 0.25,
    frequency: 0.5,
    challenge: 0.75,
    reveal: 1,
  }
  
  updateModuleProgress('sinewaves', {
    status: stage === 'reveal' ? 'completed' : 'in-progress',
    progress: progressMap[stage] ?? 0,
    currentStage: stage,
  })
}, [stage, updateModuleProgress])
```

---

## Example Flow

### Stage 1: Observe (5 seconds)

**Goal**: Introduce the relationship between circle and wave visually.

**UI State**:
- Top: ExplorePrompt ("Watch where the wave comes from")
- Visualization: UnitCircle (left) + Connector + SineWave (right)
- Bottom: DelayIndicator (5s countdown) → Continue button

**User Actions**:
- Can drag the circle point (pauses animation)
- Can observe the connector line showing y-value relationship
- After 5s: Continue button appears

**Visual Elements**:
- Connector line animates, connecting circle point to wave
- No ghost wave (pure observation)
- Circle radius = 1.0 (default amplitude)

**Transition**: User clicks Continue → `setStage('amplitude')` → `setSubStage('explore')`

---

### Stage 2: Amplitude (Explore → Match → Reflect)

#### Explore Substage

**Goal**: Match ghost wave by adjusting amplitude only.

**UI State**:
- Top: ExplorePrompt ("Match the ghost wave by adjusting amplitude")
- Visualization: UnitCircle + SineWave (user) + SineWave (ghost, opacity 0.5)
- Bottom: ControlPanel with only amplitude slider visible

**User Actions**:
- Adjusts amplitude slider (0.5 - 2.0)
- Sees circle radius change in real-time
- Sees wave height change in real-time
- Target: amplitude = 1.5

**Match Detection**:
```typescript
// Continuous monitoring
if (Math.abs(amplitude - 1.5) <= 0.1) {
  setCelebrationCount(c => c + 1)  // Triggers pulse
  setSubStage('match')
}
```

#### Match Substage

**Goal**: Celebrate match and transition to reflection.

**UI State**:
- Overlay: MatchCelebration ("Amplitude controls the wave's height")
- Auto-transitions to reflect after 2s or manual continue

**User Actions**:
- Observes celebration
- Can click continue or wait for auto-transition

**Transition**: `setSubStage('reflect')`

#### Reflect Substage

**Goal**: Test understanding with prediction question.

**UI State**:
- Top: ExplorePrompt (same as explore)
- Bottom: QuestionCard ("If amplitude were 3, how high would the wave peak?")
- Bottom: FeedbackBanner (after answer selection)

**User Actions**:
- Selects answer (3)
- Sees feedback (correct/incorrect)
- If correct: Continue button → advances to frequency stage
- If incorrect: Try Again → resets selection

**Discovery Storage**:
```typescript
if (isCorrect && stage === 'amplitude') {
  setDiscoveries(prev => ({ ...prev, amplitude }))  // Stores 1.5
}
```

**Transition**: Correct answer → `setStage('frequency')` → `setSubStage('explore')`

---

### Stage 3: Frequency (Explore → Match → Reflect)

**Similar pattern to amplitude stage, but:**
- Both amplitude and frequency sliders visible
- Amplitude slider locked at discovered value (1.5)
- Target: frequency = 2.0
- Question: "How many complete waves fit when frequency = 3?"
- Stores `discoveries.frequency = 2.0` on correct answer

**Transition**: Correct answer → `setupChallenge()`

---

### Stage 4: Challenge (Observe → Diagnose → Match)

#### Observe Phase (3 seconds)

**Goal**: Observe that one parameter changed.

**UI State**:
- Top: ExplorePrompt ("Something changed")
- Visualization: User wave (at matched values) + Challenge wave (one param different)
- Bottom: DelayIndicator (3s countdown)

**Challenge Setup**:
```typescript
// Randomly pick which parameter differs
const param = Math.random() > 0.5 ? 'amplitude' : 'frequency'
setChallengeParam(param)

// Generate challenge wave
const newChallengeWave = {
  a: param === 'amplitude' ? pickRandom([0.75, 1.0, 1.25, 1.75, 2.0]) : 1.5,
  f: param === 'frequency' ? pickRandom([0.5, 1.0, 1.5, 2.5, 3.0]) : 2.0,
}
```

**Transition**: 3s delay → `setChallengePhase('diagnose')`

#### Diagnose Phase

**Goal**: Identify which parameter changed.

**UI State**:
- Top: No prompt (QuestionCard provides context)
- Bottom: QuestionCard ("What changed?" - Amplitude, Frequency, Both)

**User Actions**:
- Selects answer
- If correct: Celebration → `setChallengePhase('match')`
- If incorrect: Shake feedback → resets selection

**Transition**: Correct answer → `setChallengePhase('match')`

#### Match Phase

**Goal**: Match the challenge wave by adjusting the changed parameter.

**UI State**:
- Top: ExplorePrompt ("Now match it")
- Visualization: User wave + Challenge wave (ghost)
- Bottom: ControlPanel with both sliders visible
  - One slider locked (the parameter that didn't change)
  - One slider unlocked (the parameter that changed)
- Match score indicator (0-100%)

**Match Detection**:
```typescript
const challengeMatchScore = calculateMatchScore(
  amplitude, frequency,
  challengeWave.a, challengeWave.f
)

if (challengeMatchScore >= 95) {
  setCelebrationCount(c => c + 1)
  setDiscoveries({ amplitude, frequency })  // Final matched values
  setTimeout(() => setStage('reveal'), 800)
}
```

**Match Score Calculation**:
```typescript
function calculateMatchScore(userA, userF, targetA, targetF) {
  const ampScore = 1 - Math.min(Math.abs(userA - targetA) / 1.5, 1)
  const freqScore = 1 - Math.min(Math.abs(userF - targetF) / 2.5, 1)
  return Math.min(ampScore, freqScore) * 100  // Use minimum (both must match)
}
```

**Transition**: Match score >= 95% → `setStage('reveal')`

---

### Stage 5: Reveal

**Goal**: Provide "So What?" context and completion options.

**UI State**:
- Top: FormulaPreview (shows complete formula with discoveries)
- Center: "So What?" panel (explains real-world applications)
- Bottom: Action buttons (Try Another, Explore, Finish)

**User Options**:
1. **Try Another**: `setupChallenge()` → returns to challenge stage
2. **Explore**: `setSubStage('freeExplore')` → unlocks all sliders, free play
3. **Finish**: `onComplete({ a: amplitude, f: frequency })` → returns to constellation

**Free Explore Mode**:
- All sliders unlocked
- No targets or constraints
- User can experiment freely
- Prompt: "Free exploration - Play with the parameters"

---

## Key Design Patterns

### 1. Discovery-First Learning

**Pattern**: User manipulates → matches target → sees formula

**Implementation**:
- FormulaPreview component shows discoveries as they're made
- Formula builds incrementally: `y = A sin(t)` → `y = A sin(ft)`
- No formula shown until user has matched the parameter

### 2. Progressive Disclosure

**Pattern**: Reveal complexity gradually, one concept at a time

**Implementation**:
- Observe: See relationship (no interaction required)
- Amplitude: One slider, one concept
- Frequency: Two sliders, but amplitude locked (reinforces previous learning)
- Challenge: Both sliders, but one locked (tests diagnosis)

### 3. Visual Feedback Systems

**Pattern**: Multiple feedback channels for user actions

**Implementation**:
- **Ghost Wave**: Shows target visually (no numbers needed)
- **Match Score**: Progress bar (0-100%) in challenge stage
- **Celebration Pulse**: Full-screen pulse on match
- **Match Celebration**: Overlay message on parameter match
- **Feedback Banner**: Correct/incorrect for questions

### 4. State-Driven UI

**Pattern**: UI elements conditionally render based on stage/substage

**Implementation**:
```typescript
// Example: Control panel visibility
{stage === 'amplitude' && subStage === 'explore' && (
  <ControlPanel visibleSliders={['amplitude']} />
)}

{stage === 'frequency' && subStage === 'explore' && (
  <ControlPanel 
    visibleSliders={['amplitude', 'frequency']}
    lockedSliders={['amplitude']}
  />
)}
```

### 5. Animation Coordination

**Pattern**: Exit animations complete before state changes, then enter animations

**Implementation**:
- `data-stage-overlay` attribute marks elements for transition
- `isTransitioning` flag prevents double-renders
- Promise-based animation coordination
- Respects `prefers-reduced-motion`

### 6. Responsive Layout

**Pattern**: Different layouts for desktop vs mobile

**Implementation**:
- Desktop: Side-by-side (circle left, wave right)
- Mobile: Stacked (circle top, wave bottom)
- Uses `useThree().viewport` to detect orientation
- Scales components appropriately

---

## Constants & Configuration

### Stage Targets
```typescript
const STAGE_TARGETS = {
  amplitude: 1.5,
  frequency: 2.0,
}
```

### Match Thresholds
```typescript
const AMPLITUDE_THRESHOLD = 0.1
const FREQUENCY_THRESHOLD = 0.15
const CHALLENGE_MATCH_THRESHOLD = 95  // Percentage
```

### Challenge Values
```typescript
const CHALLENGE_AMPLITUDES = [0.75, 1.0, 1.25, 1.75, 2.0]
const CHALLENGE_FREQUENCIES = [0.5, 1.0, 1.5, 2.5, 3.0]
```

### Slider Ranges
```typescript
// ControlPanel.tsx
amplitude: { min: 0.5, max: 2.0, step: 0.05 }
frequency: { min: 0.5, max: 3.0, step: 0.1 }
```

### Progress Mapping
```typescript
const progressMap = {
  observe: 0.05,
  amplitude: 0.25,
  frequency: 0.5,
  challenge: 0.75,
  reveal: 1.0,
}
```

---

## Copy & Content

**Location**: `src/config/sinewave-copy.ts`

**Structure**:
- `stages`: Copy for each stage/substage
- `discoveries`: Labels for discovered concepts
- `matchCelebration`: Messages for match events
- `behindThis`: Meta-content for celebration modal

**Usage Pattern**:
```typescript
const promptContent = getPromptContent()
// Returns { setup, text, subtext } or null based on stage/substage
```

---

## Integration with Portfolio System

### Progress Tracking

**Context**: `PortfolioContext` (from `src/context/PortfolioContext.tsx`)

**Updates**:
```typescript
updateModuleProgress('sinewaves', {
  status: 'in-progress' | 'completed',
  progress: 0.0 - 1.0,
  currentStage: stage,
})
```

**Storage**: Persisted to `localStorage` via `usePortfolioState` hook

### Completion Flow

1. User clicks "Finish" in reveal stage
2. `onComplete({ a: amplitude, f: frequency })` called
3. App.tsx receives completion → shows CelebrationModal
4. User can navigate back to constellation

---

## Technical Stack

### 3D Visualization
- **React Three Fiber**: React renderer for Three.js
- **Three.js**: 3D graphics library
- **@react-three/drei**: Helpers (Line component)

### Animation
- **GSAP**: UI animations (stage transitions, micro-interactions)
- **React Three Fiber useFrame**: 3D animation loop (60fps)

### State Management
- **React Hooks**: useState, useEffect, useCallback, useMemo
- **PortfolioContext**: Module progress tracking

### UI Components
- **shadcn/ui**: Base component library
- **Tailwind CSS**: Styling
- **Custom Components**: Module-specific UI elements

---

## Lessons Learned & Patterns to Reuse

### ✅ What Works Well

1. **Stage Machine Pattern**: Clear separation of stages with explicit transitions
2. **Discovery Memory**: Storing matched values reinforces learning
3. **Ghost Wave System**: Visual target without numbers is intuitive
4. **Progressive Disclosure**: One concept at a time reduces cognitive load
5. **Animation Coordination**: Promise-based transitions prevent glitches
6. **Responsive Layout**: Viewport detection for mobile optimization

### 🔄 Patterns to Refine for Future Modules

1. **Module Component**: Currently hardcoded to sinewaves - needs abstraction
2. **Stage Transitions**: Could be extracted to reusable hook
3. **Match Detection**: Threshold-based system works but could be more flexible
4. **Question System**: Hardcoded questions - could be config-driven
5. **Copy Management**: Centralized copy is good, but stage-specific logic is scattered

### 📋 Checklist for New Modules

- [ ] Define stage types and flow
- [ ] Create Scene component with Canvas wrapper
- [ ] Implement visualization components (3D or 2D)
- [ ] Set up stage machine with transitions
- [ ] Add match detection logic
- [ ] Create copy configuration file
- [ ] Implement progress tracking
- [ ] Add responsive layout support
- [ ] Test animation coordination
- [ ] Verify WebGL context handling (if using 3D)

---

## Future Considerations

### Potential Refactorings

1. **Abstract Module Component**: Extract stage machine to reusable hook
2. **Module Factory Pattern**: Create modules from configuration
3. **Unified Animation System**: Standardize transition patterns
4. **Question System**: Make questions config-driven
5. **Match Detection**: Create flexible matching system

### Extension Points

1. **New Stages**: Easy to add stages to the flow
2. **New Parameters**: Can add phase or other parameters
3. **New Visualizations**: Can add additional 3D elements
4. **New Interactions**: Can add drag, click, or other interactions
5. **New Feedback**: Can add new feedback mechanisms

---

*This documentation serves as the reference implementation for future modules. The vector transformations module should follow similar patterns while adapting to its specific learning goals and interactions.*
