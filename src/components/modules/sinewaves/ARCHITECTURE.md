# Sinewaves Module Architecture Documentation

## Overview

The sinewaves module teaches the relationship between the unit circle and sine waves through interactive manipulation before explanation. It uses the Observatory HUD design (user-controlled pacing, staged reveals, mobile-first layout).

**Core Learning Goal**: Discover that amplitude controls wave height and frequency controls oscillation speed through hands-on exploration.

---

## Module Anatomy

### File Structure

```
src/components/modules/sinewaves/
├── ObservatoryModule.tsx   # Entry: Observatory HUD, state, slot content
├── Layout.tsx              # ObservatoryLayout (grid: statusStrip, readouts, visualization, controlStrip)
├── Scene.tsx               # Main 3D visualization container (React Three Fiber Canvas)
├── UnitCircle.tsx         # Interactive unit circle with rotating point
├── SineWave.tsx           # Animated sine wave trail visualization
├── Connector.tsx          # Dashed line connecting circle point to wave (observe stage only)
├── animations.ts          # Boot sequence (consoleBootSequence) and stage transition helpers
├── sinewaves-copy.ts      # Stage prompts and copy (SINEWAVE_COPY)
├── components/            # Module-local UI for Observatory HUD
│   ├── index.ts
│   ├── StatusStrip.tsx    # Progress + stage label
│   ├── PromptReadout.tsx  # Instructional prompt + description
│   ├── FormulaReadout.tsx # Formula display
│   ├── ControlStrip.tsx   # Sliders (amplitude/frequency) + free-explore state
│   ├── ContinueButton.tsx # Continue / advance stage
│   ├── DiagnosisChoices.tsx # Challenge: “What changed?” choices
│   ├── RevealPanel.tsx    # Reveal stage: So What? + Try Another / Explore / Finish
│   └── MatchFeedback.tsx  # Match celebration + continue
└── ARCHITECTURE.md        # This documentation file
```

### Component Hierarchy (Current — Observatory HUD)

```
ObservatoryModule (ObservatoryModule.tsx)
└── ObservatoryLayout (Layout.tsx) — grid: statusStrip | readouts | visualization | controlStrip
    ├── statusStrip   → StatusStrip (progress bar + stage number/label)
    ├── promptReadout → PromptReadout (prompt + description from sinewaves-copy)
    ├── formulaReadout→ FormulaReadout (conditional; formula display)
    ├── visualization → Scene (main 3D area)
    │   └── Canvas (React Three Fiber)
    │       └── UnitCircle, Connector (observe only), SineWave (user + ghost when applicable)
    ├── controlStrip  → ControlStrip (sliders), ContinueButton, DiagnosisChoices,
    │                    RevealPanel, MatchFeedback (all conditional by stage/substage)
    └── children      → (overlays if any)
```

ObservatoryLayout owns the grid and regions; ObservatoryModule decides what to render in each slot. On mount, `consoleBootSequence` in `animations.ts` runs (status strip → progress bar → prompt) then signals ready so the Scene can mount.

### Integration Points

**Entry Point**: `src/components/modules/sinewaves/ObservatoryModule.tsx` (loaded via ModuleLoader from config)

**Module Registration**: `src/config/modules.ts`
```typescript
{
  id: 'sinewaves',
  title: 'Sinewaves',
  component: () => import('@/components/modules/sinewaves/ObservatoryModule'),
}
```

**App Integration**: `src/App.tsx`
- Module is loaded dynamically by `DynamicModule`; fallback is `ModuleLoader` (spinner).
- Receives `onComplete` and `isVisible` props.
- For `activeModuleId === 'sinewaves'`, the app hides the global nav status strip (Observatory HUD has its own StatusStrip).

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

**ObservatoryModule** does not use `subStage` or a reflect phase: it uses match flags (`amplitudeMatched`, `frequencyMatched`, `challengeMatched`) and user continues from MatchFeedback to advance. The flow above is the pedagogical template; implementation is continue-driven after match.

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

**ObservatoryModule** uses two animation entry points from `animations.ts`:

1. **Boot sequence** — On mount, `consoleBootSequence` runs (status strip → progress bar → prompt), then Scene mounts.
2. **Match success** — When the user matches a target, `matchSuccessSequence` runs (viz pulse → feedback text → continue button).

Coordinated stage-transition animations (exit → state update → enter) are not currently used; readouts and control strip update with state. To add them later, use refs and a pattern similar to `stageTransitionSequence` (previously in `animations.ts`).

### Boot Sequence (Observatory)

**Location**: `src/components/modules/sinewaves/animations.ts`

**Function**: `consoleBootSequence(refs, onReadyForScene)` — "power on" entrance for Observatory HUD.

**Refs**: `statusStrip`, `progressBar`, `prompt` (HTML elements).

**Sequence**: Status strip fades in → progress bar draws left-to-right → prompt readout materializes → `onReadyForScene()` called (ObservatoryModule then sets `booted` and mounts Scene). Respects `prefers-reduced-motion` (skips to ready).

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

### 5. Observatory Module (`ObservatoryModule.tsx`)

**Purpose**: Main orchestrator for the Observatory HUD: stage flow, match detection, and slot content.

**Key Responsibilities**:
1. **Stage Management**: Tracks stage (`observe` → `amplitude` → `frequency` → `challenge` → `reveal`) and challenge phase (`observe` | `diagnose` | `match`)
2. **Parameter Control**: Amplitude and frequency state; targets for guided stages and challenge
3. **Match Detection**: Monitors amplitude/frequency vs targets; user advances via MatchFeedback continue
4. **Boot Sequence**: Runs `consoleBootSequence` (animations.ts) on mount, then mounts Scene when ready
5. **UI Orchestration**: Renders StatusStrip, PromptReadout, FormulaReadout, ControlStrip, ContinueButton, DiagnosisChoices, RevealPanel, MatchFeedback by stage

**Module-Local Components Used** (from `components/`):
- `StatusStrip`, `PromptReadout`, `FormulaReadout`, `ControlStrip`, `ContinueButton`, `DiagnosisChoices`, `RevealPanel`, `MatchFeedback`

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

**Progress (ObservatoryModule)**: Local `stageProgress` and `stageNumber` drive StatusStrip; no `updateModuleProgress` call yet.

---

## Example Flow

### Stage 1: Observe

**Goal**: Introduce the relationship between circle and wave visually.

**UI State**:
- StatusStrip: progress, stage label
- PromptReadout: prompt + description (e.g. "Watch where the wave comes from")
- Visualization: UnitCircle (left) + Connector + SineWave (right)
- ControlStrip: ContinueButton

**User Actions**:
- Can drag the circle point (pauses animation)
- Can observe the connector line showing y-value relationship
- Clicks Continue when ready

**Visual Elements**:
- Connector line animates, connecting circle point to wave
- No ghost wave (pure observation)
- Circle radius = 1.0 (default amplitude)

**Transition**: User clicks Continue → `setStage('amplitude')`

---

### Stage 2: Amplitude

**Goal**: Match ghost wave by adjusting amplitude only.

**UI State**:
- PromptReadout: prompt + description (e.g. "Match the ghost wave by adjusting amplitude")
- FormulaReadout: formula display when relevant
- Visualization: UnitCircle + SineWave (user) + SineWave (ghost, opacity 0.5)
- ControlStrip: amplitude slider only

**User Actions**:
- Adjusts amplitude slider (0.5 - 2.0)
- Sees circle radius and wave height change in real-time
- Target: amplitude = 1.5

**Match Detection**: When `Math.abs(amplitude - 1.5) <= AMPLITUDE_MATCH_THRESHOLD`, `amplitudeMatched` is set; MatchFeedback appears with continue.

**Transition**: User clicks continue in MatchFeedback → `setStage('frequency')`

---

### Stage 3: Frequency

**Similar pattern to amplitude stage, but:**
- ControlStrip: amplitude + frequency sliders (amplitude at matched value 1.5)
- Target: frequency = 2.0
- MatchFeedback on match; user continues → challenge setup

**Transition**: User clicks continue in MatchFeedback → challenge initialized, `setStage('challenge')`

---

### Stage 4: Challenge (Observe → Diagnose → Match)

#### Observe Phase

**Goal**: Observe that one parameter changed.

**UI State**:
- PromptReadout: e.g. "Something changed"
- Visualization: User wave (at matched values) + Challenge wave (one param different)
- ControlStrip: ContinueButton

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

**Transition**: User clicks Continue → `setChallengePhase('diagnose')`

#### Diagnose Phase

**Goal**: Identify which parameter changed.

**UI State**:
- PromptReadout: question text
- ControlStrip: DiagnosisChoices ("What changed?" — Amplitude, Frequency, Both)

**User Actions**: Selects answer; selection advances to match phase after short delay.

**Transition**: `setChallengePhase('match')`

#### Match Phase

**Goal**: Match the challenge wave by adjusting the changed parameter.

**UI State**:
- PromptReadout: e.g. "Now match it"
- Visualization: User wave + Challenge wave (ghost)
- ControlStrip: sliders (one locked, one active per challenge param)
- MatchFeedback when threshold met

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
- FormulaReadout: complete formula with discoveries
- PromptReadout: reveal title + description
- ControlStrip: RevealPanel (Try Another, Explore, Finish)

**User Options**:
1. **Try Another**: New challenge → returns to challenge stage
2. **Explore**: Free explore mode — all sliders unlocked, no targets
3. **Finish**: `onComplete({ a: amplitude, f: frequency })` → returns to constellation

**Free Explore Mode**: All sliders unlocked; user experiments freely.

---

## Key Design Patterns

### 1. Discovery-First Learning

**Pattern**: User manipulates → matches target → sees formula

**Implementation**:
- FormulaReadout shows discoveries as they're made
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
- **MatchFeedback**: On match, runs `matchSuccessSequence` then shows continue
- **StatusStrip**: Progress and stage label

### 4. State-Driven UI

**Pattern**: UI elements conditionally render based on stage and challenge phase.

**Implementation** (ObservatoryModule): StatusStrip, PromptReadout, FormulaReadout always rendered (content varies by stage). ControlStrip children: ContinueButton (observe, challenge observe), sliders (amplitude/frequency/challenge), DiagnosisChoices (challenge diagnose), MatchFeedback (when matched), RevealPanel (reveal). Slider visibility and lock state from `stage`, `challengeParam`, `isFreeExplore`.

### 5. Animation Coordination

**Implementation**: Boot — `consoleBootSequence` on mount; Scene mounts after `onReadyForScene`. Match — `matchSuccessSequence` (viz pulse → feedback → continue); respects `prefers-reduced-motion`.

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
// ControlStrip / ObservatoryModule
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

**Location**: `src/components/modules/sinewaves/sinewaves-copy.ts`

**Structure**:
- `SINEWAVE_COPY.stages`: Copy for each stage (observe, amplitude, frequency, challenge, reveal) and challenge sub-phases
- `discoveries`, `matchCelebration`, `behindThis`: Used by celebration/behind-this flows

**Usage (ObservatoryModule)**:
```typescript
import { SINEWAVE_COPY } from './sinewaves-copy'
// Stage content: SINEWAVE_COPY.stages[stage].prompt, .subtext, etc.
```

---

## Integration with Portfolio System

### Progress Tracking

**ObservatoryModule**: Uses local `stageProgress` and `stageNumber` for StatusStrip display. Does not currently call `PortfolioContext.updateModuleProgress`; that can be added if portfolio-wide progress persistence is needed.

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

1. **Stage Transitions**: Could be extracted to reusable hook
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

1. **Abstract stage machine**: Extract to reusable hook for future modules
2. **Module factory**: Create modules from configuration
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
