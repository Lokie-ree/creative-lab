# Sinewaves Module Architecture Documentation

## Overview

The sinewaves module teaches the relationship between the unit circle and sine waves through interactive manipulation before explanation. It uses the instrument HUD design (everything always visible, guide states drive prompts and highlights, mobile-first layout).

**Core Learning Goal**: Discover that amplitude controls wave height and frequency controls oscillation speed through hands-on exploration.

**Doc scope**: This file describes the implementation as built, including uncommitted changes. Keep it updated when changing Layout, InstrumentModule, animations, or module-local components. The stage flow and pedagogy sections describe the intended design; for current wiring (e.g. InstrumentControls, guide states) see `InstrumentModule.tsx` and `guide-state.ts`.

---

## Module Anatomy

### File Structure

```
src/components/modules/sinewaves/
├── InstrumentModule.tsx    # Entry: instrument state, guide states, slot content
├── Layout.tsx              # InstrumentLayout (pure Tailwind responsive grid)
├── guide-state.ts          # Guide states, config, speed multiplier
├── Scene.tsx               # Main 3D visualization (uses useSceneLayout)
├── scene-layout.ts         # Viewport-proportional positioning (useSceneLayout hook)
├── sinewaves-constants.ts  # Stage targets, match thresholds, slider config, challenge ranges
├── challenge-utils.ts      # Challenge target generation with distance validation
├── UnitCircle.tsx          # Interactive unit circle with rotating point
├── SineWave.tsx            # Animated sine wave trail visualization
├── Connector.tsx           # Dashed line connecting circle point to wave (scale-aware)
├── GridLines.tsx           # Grid lines behind wave (optional)
├── animations.ts           # Boot sequence (consoleBootSequence) and stage transition helpers
├── sinewaves-copy.ts       # Stage prompts and copy (SINEWAVE_COPY)
├── components/             # Module-local UI for instrument HUD
│   ├── index.ts
│   ├── StatusStrip.tsx     # Dot nav, SYS:NOM, ESC (44px touch targets, ARIA)
│   ├── PromptReadout.tsx   # Instructional prompt + description
│   ├── FormulaReadout.tsx  # Formula display
│   ├── ControlStrip.tsx    # Wraps InstrumentControls (sliders + buttons)
│   ├── InstrumentControls.tsx # Sliders, continue, speed; content by guide state
│   ├── ParameterSlider.tsx # Reusable slider (uses SLIDER_CONFIG)
│   └── ContinueButton.tsx  # Continue / advance (Tailwind hover:)
└── ARCHITECTURE.md         # This documentation file
```

### Component Hierarchy (Current — Instrument HUD)

```
InstrumentModule (InstrumentModule.tsx)
└── InstrumentLayout (Layout.tsx) — grid: statusStrip | readouts | visualization | controlStrip
    │   Desktop (≥768px): 4 rows. Mobile (<768px): 6 rows (all elements visible, stacked).
    ├── statusStrip   → StatusStrip (dot nav, SYS:NOM, optional onBack, ESC)
    ├── promptReadout → PromptReadout (prompt + description from sinewaves-copy)
    ├── formulaReadout→ FormulaReadout (formula display)
    ├── visualization → Scene (main 3D area)
    │   └── Canvas (React Three Fiber)
    │       └── UnitCircle, Connector, SineWave (user + ghost when applicable), GridLines
    ├── controlStrip  → ControlStrip → InstrumentControls (sliders, ContinueButton by guide state)
    └── children      → (overlays if any)
```

InstrumentLayout owns the grid and regions; InstrumentModule decides what to render in each slot. The layout uses Tailwind grid classes (no observatory-* classes). On mount, `consoleBootSequence` in `animations.ts` runs (status strip → prompt), then calls the callback; InstrumentModule sets `booted`. The Scene is mounted from first render (not conditionally after boot).

### Integration Points

**Entry Point**: `src/components/modules/sinewaves/InstrumentModule.tsx` (loaded via ModuleLoader from config)

**Module Registration**: `src/config/modules.ts`
```typescript
{
  id: 'sinewaves',
  title: 'Sinewaves',
  component: () => import('@/components/modules/sinewaves/InstrumentModule'),
}
```

**App Integration**: `src/App.tsx`
- Module is loaded dynamically by `DynamicModule`; fallback is `ModuleLoader` (spinner).
- Receives `onComplete`, optional `isVisible`, and optional `onBack` (ModuleProps).
- For `activeModuleId === 'sinewaves'`, the app hides the global nav status strip (instrument HUD has its own StatusStrip).

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
  └─> [Continue] ─> amplitude
          └─> [match: amplitude within threshold] ─> MatchFeedback ─> [Continue] ─> frequency
                  └─> [match: frequency within threshold] ─> MatchFeedback ─> [Continue] ─> challenge
                          └─> observe phase ─> [Continue] ─> diagnose
                                  └─> [correct choice] ─> match phase
                                          └─> [match: active param within threshold] ─> MatchFeedback ─> [Continue] ─> reveal
                                                  └─> [user choice]
                                                      ├─> Try Another (new challenge)
                                                      ├─> Explore (free explore; both sliders)
                                                      └─> Finish (onComplete)
```

### State Management

**Primary State**:
- `stage`: Current stage (Stage type)
- `challengePhase`: Challenge-specific phase (ChallengePhase type). InstrumentModule does not use `subStage`; flow is continue-driven via match flags.

**Wave Parameters**:
- `amplitude`: Current amplitude value (0.5 - 2.0)
- `frequency`: Current frequency value (0.5 - 3.0)
- `phase`: Always 0 (removed from v2)

**Guided targets** (fixed; not persisted as "discoveries"):
- `amplitudeTarget`, `frequencyTarget`: 1.5 and 2.0 — targets for amplitude/frequency stages
- Match flags (`amplitudeMatched`, `frequencyMatched`) drive progression; FormulaReadout uses current `amplitude`/`frequency` for display. A `discoveries` object could be added for locked-slider labels if desired.

**UI State**:
- `booted`: After consoleBootSequence completes; used to fade in status strip and prompt
- `statusText`: Optional status flash after stage transition (from sinewaves-copy.stageTransitions)
- `diagnosisAnswer`, `diagnosisWrongAttempts`: Diagnosis phase selection and hint escalation
- `showContinue`: Derived from stage content; show continue in observe and challenge observe

**Challenge State**:
- `challengeParam`: Which parameter changed ('amplitude' | 'frequency')
- `challengeTargetValue`: Single target value for the active parameter (random in range, rounded)
- No separate `challengeWave` object; effective targets are derived from `challengeParam` + `challengeTargetValue` and fixed amplitude/frequency for the locked param

**InstrumentModule** does not use `subStage` or a reflect phase: it uses match flags (`amplitudeMatched`, `frequencyMatched`, `challengeMatched`) and user continues from MatchFeedback to advance. The flow above is the pedagogical template; implementation is continue-driven after match.

### Stage Transitions

**Match-driven (no timers)**:
1. **Parameter stages**: When amplitude/frequency enters threshold, `amplitudeMatched`/`frequencyMatched` is set; MatchFeedback is shown (and runs `matchSuccessSequence`). User clicks Continue to advance.
2. **Challenge match phase**: When the active parameter enters threshold, `challengeMatched` is set; MatchFeedback is shown. User clicks Continue → `stageTransition` → `setStage('reveal')`.

**Manual Transitions**:
- Continue (observe → amplitude; challenge observe → diagnose)
- MatchFeedback continue (amplitude → frequency, frequency → challenge, challenge match → reveal)
- Diagnosis correct choice (diagnose → match)
- Reveal: Try Another, Explore, Finish (and "Back to Results" from free explore)
- Dot nav: back to a previous stage (no skip-ahead)

### Transition Animation System

**InstrumentModule** uses three animation entry points from `animations.ts`:

1. **Boot sequence** — On mount, `consoleBootSequence` runs (status strip → optional progress bar → prompt), then `onReadyForScene()` sets `booted`.
2. **Match success** — When MatchFeedback is shown, it runs `matchSuccessSequence` (viz pulse → value highlight → feedback text → continue button). MatchFeedback receives optional `visualizationRef` for the pulse.
3. **Stage transition** — `stageTransition(refs, callbacks)` runs on stage changes: control strip fades out → `onFadeOutComplete()` (state update) → hint and control strip fade in. Used for observe→amplitude, amplitude→frequency, frequency→challenge, and dot-nav back.

Readouts and control strip update with state; no separate exit/enter animation for readouts.

### Boot Sequence (Instrument)

**Location**: `src/components/modules/sinewaves/animations.ts`

**Function**: `consoleBootSequence(refs, onReadyForScene)` — "power on" entrance for the instrument HUD.

**Refs**: `statusStrip`, `progressBar`, `prompt` (HTML elements). `progressBar` may be `null` (InstrumentModule uses dot nav in StatusStrip instead of a progress bar).

**Sequence**: Status strip fades in → if present, progress bar draws left-to-right → prompt readout materializes → `onReadyForScene()` called (InstrumentModule then sets `booted`). Respects `prefers-reduced-motion` (skips to ready).

---

## Component Patterns

### 1. Scene Component (`Scene.tsx`)

**Purpose**: Wrapper around React Three Fiber Canvas that conditionally renders to prevent WebGL context conflicts. Uses viewport-proportional positioning via `useSceneLayout` hook.

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
  isVisible?: boolean  // When false, Canvas is not mounted (avoids WebGL conflicts)
  matchSuccess?: boolean  // When true, user's SineWave shows glow (earned reveal)
}
```

**Key Features**:
- Conditionally renders Canvas based on `isVisible` (prevents WebGL conflicts during transitions)
- Responsive layout via `useSceneLayout(stage)` hook from scene-layout.ts
- Shows ghost/target wave when `stage !== 'observe'`
- Shows connector line only in 'observe' stage
- Passes stage-specific ghost parameters to child components

**Layout System** (from `scene-layout.ts`):
```typescript
// Viewport-proportional positioning replaces hardcoded constants
const { isPortrait, circle, wave, scale, connector } = useSceneLayout(stage)
// Returns positions calculated from viewport dimensions:
// - circle.x, circle.y: Unit circle center position
// - wave.x: Sine wave horizontal offset
// - scale: Component scaling (clamped to min/max)
// - connector: { circleX, waveX } for Connector component
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
- Draggable interaction: when `draggable={true}` (Scene does not currently pass this in observe stage):
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
  glow?: boolean        // Match success: line uses learning.primary (amber)
}
```

**Key Features**:
- Trail system: maintains last 200 points (`MAX_POINTS`), shifts array on each frame
- Live point calculation: `y = amplitude * sin(frequency * t + phase)`
- X positions distributed across `WAVE_WIDTH` (4 units)
- Exposes `getCurrentY()` via ref for Connector component
- Optional live dot at current position (shown when `showLiveDot={true}`)
- When `glow={true}`, line color switches to `colors.learning.primary` for match celebration

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
  scale: number      // Circle scale factor for correct point calculation
  isPaused?: boolean
  color?: string
  opacity?: number
}
```

**Key Features**:
- Animated dashed line using `THREE.LineDashedMaterial`
- Scale-aware: uses `scale` prop for correct circle point calculation
- Updates both endpoints each frame:
  - Circle point: `(circleX + cos(angle) * scale, sin(angle) * scale)`
  - Wave point: `(waveX, amplitude * sin(angle))`
- Dot at wave point emphasizes the y-value connection
- Only rendered in 'observe' stage

### 5. Instrument Module (`InstrumentModule.tsx`)

**Purpose**: Main orchestrator for the instrument HUD: guide state flow, match detection, and slot content.

**Key Responsibilities**:
1. **Stage Management**: Tracks stage (`observe` → `amplitude` → `frequency` → `challenge` → `reveal`) and challenge phase (`observe` | `diagnose` | `match`)
2. **Parameter Control**: Amplitude and frequency state; targets for guided stages and challenge
3. **Match Detection**: Monitors amplitude/frequency vs targets; user advances via MatchFeedback continue
4. **Boot Sequence**: Runs `consoleBootSequence` (animations.ts) on mount, then mounts Scene when ready
5. **UI Orchestration**: Renders StatusStrip, PromptReadout, FormulaReadout, ControlStrip, ContinueButton, DiagnosisChoices, RevealPanel, MatchFeedback by stage

**Module-Local Components Used** (from `components/`):
- `StatusStrip`, `PromptReadout`, `FormulaReadout`, `ControlStrip`, `ContinueButton`, `DiagnosisChoices`, `RevealPanel`, `MatchFeedback`

**Match Detection Logic** (in module, called from slider onChange):
- Imports thresholds from `sinewaves-constants.ts`: `MATCH_THRESHOLDS.amplitude` (0.1), `MATCH_THRESHOLDS.frequency` (0.15)
- Amplitude stage: `Math.abs(value - STAGE_TARGETS.amplitude) <= MATCH_THRESHOLDS.amplitude` → `setAmplitudeMatched(true)`.
- Frequency stage: same with `STAGE_TARGETS.frequency` and `MATCH_THRESHOLDS.frequency`.
- Challenge match phase: same threshold for the single active param vs `challengeTargetValue` → `setChallengeMatched(true)`.

**Progress (InstrumentModule)**: Local `stageProgress` (0–100) and `stageNumber`/`TOTAL_STAGES` drive StatusStrip. StatusStrip shows progress dots (one per stage), optional `onBack`, `onStageSelect` (dot-nav back, no skip-ahead), and `statusText` (transition flash from stageTransitions). No `updateModuleProgress` call yet.

**StatusStrip (components/)**  
Props: `currentStage`, `totalStages`, `progress?`, `onBack?`, `onStageSelect?`, `statusText?`, `title?`, `className`. Renders: back button (if onBack), progress dots (clickable when onStageSelect and index ≤ currentStage), optional stage title, optional status flash. Uses `STAGE_LABELS` for aria-labels.

**ControlStrip (components/)**
Props: `ref`, `children`, `hint?`, `hintRef?`, `formula?`, `className`. Renders hint line above children when `hint` is set; `hintRef` is used by `stageTransition` for fade-in. `formula` slot renders FormulaReadout on mobile only (hidden on `md+` where it shows in readouts row). InstrumentModule passes `controlHint` from SINEWAVE_COPY.controlStripHints (or content.description in diagnose).

---

## Example Flow

### Stage 1: Observe

**Goal**: Introduce the relationship between circle and wave visually.

**UI State**:
- StatusStrip: dots (stage 1 of 5), optional onBack; no statusText until after transition
- PromptReadout: prompt + description (e.g. "Watch where the wave comes from")
- Visualization: UnitCircle (left) + Connector + SineWave (right)
- ControlStrip: hint from controlStripHints.observe, ContinueButton

**User Actions**:
- Observe the connector line showing y-value relationship
- Clicks Continue when ready (UnitCircle supports `draggable` but Scene does not currently pass it)

**Visual Elements**:
- Connector line animates, connecting circle point to wave
- No ghost wave (pure observation)
- Circle radius = 1.0 (default amplitude)

**Transition**: User clicks Continue → `runStageTransition` → `setStage('amplitude')`, `setStatusText(observeToAmplitude.status)`

---

### Stage 2: Amplitude

**Goal**: Match ghost wave by adjusting amplitude only.

**UI State**:
- PromptReadout: prompt + description (e.g. "Match the ghost wave by adjusting amplitude")
- FormulaReadout: visible with amplitude highlighted in accent color
- Visualization: UnitCircle + SineWave (user) + SineWave (ghost, opacity 0.5)
- ControlStrip: amplitude slider only (uses ParameterSlider component)

**User Actions**:
- Adjusts amplitude slider (0.5 - 2.0 via SLIDER_CONFIG)
- Sees circle radius and wave height change in real-time
- Formula updates live: `y = [A] sin(2.0 t)` with A highlighted
- Target: amplitude = STAGE_TARGETS.amplitude (1.5)

**Match Detection**: When `Math.abs(amplitude - STAGE_TARGETS.amplitude) <= MATCH_THRESHOLDS.amplitude`, `amplitudeMatched` is set; MatchFeedback appears with continue.

**Transition**: User clicks continue in MatchFeedback → `setStage('frequency')`

---

### Stage 3: Frequency

**Similar pattern to amplitude stage, but:**
- FormulaReadout: frequency highlighted in accent color
- ControlStrip: frequency slider only via ParameterSlider (amplitude remains at matched 1.5 and is not shown)
- Target: frequency = STAGE_TARGETS.frequency (2.0)
- MatchFeedback on match; user continues → challenge initialized via `generateChallengeTarget()`

**Transition**: User clicks continue in MatchFeedback → `runStageTransition` → challenge params generated, `setStage('challenge')`

---

### Stage 4: Challenge (Observe → Diagnose → Match)

#### Observe Phase

**Goal**: Observe that one parameter changed.

**UI State**:
- PromptReadout: e.g. "Something changed"
- Visualization: User wave (at matched values) + Challenge wave (one param different)
- ControlStrip: ContinueButton

**Challenge Setup** (on entering challenge from frequency stage):
```typescript
import { generateChallengeTarget } from './challenge-utils'

// Uses challenge-utils.ts with distance validation
const { param, value } = generateChallengeTarget()
// Ensures target is at least CHALLENGE_MIN_DISTANCE (0.4) away from guided values
// - Amplitude range: 0.5–2.0 (but not near 1.5)
// - Frequency range: 1.0–3.0 (but not near 2.0)
setChallengeParam(param)
setChallengeTargetValue(value)
setChallengePhase('observe')
// Other param stays at guided stage value (STAGE_TARGETS.amplitude=1.5, STAGE_TARGETS.frequency=2.0)
```

**Transition**: User clicks Continue → `setChallengePhase('diagnose')`

#### Diagnose Phase

**Goal**: Identify which parameter changed.

**UI State**:
- PromptReadout: question text
- ControlStrip: DiagnosisChoices ("What changed?" — Amplitude, Frequency, Both)

**User Actions**: Selects answer. Correct choice → `setChallengePhase('match')`. Wrong choice → `diagnosisWrongAttempts` incremented; after 2 wrong attempts, hint (height vs speed) is shown from copy.

**Transition**: Correct diagnosis → match phase (single active slider).

#### Match Phase

**Goal**: Match the challenge wave by adjusting the changed parameter.

**UI State**:
- PromptReadout: e.g. "Now match it"
- Visualization: User wave + Challenge wave (ghost)
- ControlStrip: sliders (one locked, one active per challenge param)
- MatchFeedback when threshold met

**Match Detection** (single active parameter):
```typescript
// Only the parameter that changed is adjusted; the other stays at guided value
// Thresholds from sinewaves-constants.ts
const threshold = MATCH_THRESHOLDS[challengeParam]
const value = challengeParam === 'amplitude' ? amplitude : frequency
if (Math.abs(value - challengeTargetValue) <= threshold) {
  setChallengeMatched(true)
}
```

**Transition**: User sees MatchFeedback, clicks continue → `runStageTransition` → `setStage('reveal')`

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

**Pattern**: User manipulates → sees formula update → matches target

**Implementation**:
- FormulaReadout visible during amplitude, frequency, and challenge stages (not observe)
- Active parameter is highlighted with accent color (`--lab-accent`)
- Formula shows current values: `y = 1.5 sin(2.0 t)` with active param in cyan
- On mobile, FormulaReadout appears inline in ControlStrip via `formula` prop

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

**Implementation** (InstrumentModule): StatusStrip, PromptReadout, FormulaReadout always rendered (content varies by stage). ControlStrip children: ContinueButton (observe, challenge observe; "Back to Results" in free explore), sliders (amplitude stage: amplitude only; frequency stage: frequency only; challenge match: one slider per `challengeParam`; free explore: both), DiagnosisChoices (challenge diagnose), MatchFeedback (when matched), RevealPanel (reveal). Visibility from `stage`, `challengePhase`, `challengeParam`, match flags, `isFreeExplore`.

### 5. Animation Coordination

**Implementation**: Boot — `consoleBootSequence` on mount; `onReadyForScene` sets `booted` (Scene is mounted from first render). Match — MatchFeedback runs `matchSuccessSequence` (viz pulse → value highlight → feedback → continue); optional `visualizationRef` for pulse. Stage changes — `stageTransition` (control strip fade out/in). All respect `prefers-reduced-motion`.

### 6. Responsive Layout

**Pattern**: Different layouts for desktop vs mobile

**Implementation**:
- Desktop: Side-by-side (circle left, wave right)
- Mobile: Stacked (circle top, wave bottom)
- Uses `useThree().viewport` to detect orientation
- Scales components appropriately

---

## Constants & Configuration

**Location**: `src/components/modules/sinewaves/sinewaves-constants.ts`

All magic numbers are centralized in `sinewaves-constants.ts` as the single source of truth.

### Stage Targets (guided stages)
```typescript
export const STAGE_TARGETS = {
  amplitude: 1.5,
  frequency: 2.0,
  phase: 0,
} as const
```

### Match Thresholds
```typescript
export const MATCH_THRESHOLDS = {
  amplitude: 0.1,
  frequency: 0.15,
} as const
// Challenge uses the same threshold for the single active parameter
```

### Challenge Target Ranges
```typescript
export const CHALLENGE_RANGES = {
  amplitude: { min: 0.5, max: 2.0 },
  frequency: { min: 1.0, max: 3.0 },
} as const
export const CHALLENGE_MIN_DISTANCE = 0.4  // Minimum distance from guided value
```
Challenge targets are generated via `generateChallengeTarget()` in `challenge-utils.ts`, which ensures the random target is at least `CHALLENGE_MIN_DISTANCE` away from the guided stage value.

### Slider Ranges
```typescript
export const SLIDER_CONFIG = {
  amplitude: { min: 0.5, max: 2, step: 0.1 },
  frequency: { min: 0.5, max: 3, step: 0.1 },
} as const
```
Used by `ParameterSlider` component for automatic min/max/step.

### Scene Layout (scene-layout.ts)
```typescript
export const SCENE_LAYOUT = {
  landscape: { circle: { xRatio: -0.32, yRatio: 0 }, wave: { xRatio: 0.1, yRatio: 0 }, scaleFactor: 0.20 },
  portrait:  { circle: { xRatio: 0, yRatio: 0.22 }, wave: { xRatio: -0.15, yRatio: -0.18 }, scaleFactor: 0.24 },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const
```

### Progress (StatusStrip)
```typescript
stageProgress: Record<ViewStage, number> = {
  observe: 5, amplitude: 25, frequency: 50, challenge: 75, reveal: 100
}
stageNumber: observe 1 … reveal 5. TOTAL_STAGES = 5
```

---

## Copy & Content

**Location**: `src/components/modules/sinewaves/sinewaves-copy.ts`

**Structure**:
- `SINEWAVE_COPY.stages`: Copy for each stage (observe, amplitude, frequency, challenge, reveal) and challenge sub-phases
- `discoveries`, `matchCelebration`, `behindThis`: Used by celebration/behind-this flows

**Usage (InstrumentModule)**:
```typescript
import { SINEWAVE_COPY } from './sinewaves-copy'
// Stage content: SINEWAVE_COPY.stages[stage].prompt, .subtext (as description)
// stages.challenge.diagnose: question, choices, wrongFeedback, hintHeight, hintSpeed (hint after 2 wrong)
// controlStripHints: observe, amplitude, frequency, challengeObserve, challengeMatch (hint in ControlStrip)
// stageTransitions: status flash and hint per transition (e.g. observeToAmplitude.status, .hint)
// matchCelebration: amplitude, frequency, challengeAmplitude, challengeFrequency (MatchFeedback message)
```

---

## Integration with Portfolio System

### Progress Tracking

**InstrumentModule**: Uses local `stageProgress` and `stageNumber` for StatusStrip display. Does not currently call `PortfolioContext.updateModuleProgress`; that can be added if portfolio-wide progress persistence is needed.

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
2. **Match Detection**: Now centralized in `sinewaves-constants.ts`; could be extracted to reusable hook
3. **Question System**: Hardcoded questions - could be config-driven
4. **Copy Management**: Centralized copy is good, but stage-specific logic is scattered

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

*This documentation serves as the reference implementation for future modules. Subsequent modules (to be chosen from Algebra I and Geometry major content clusters) should follow similar patterns while adapting to their specific learning goals and interactions.*
