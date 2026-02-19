# Sinewaves Module Architecture Documentation

## Overview

The sinewaves module teaches the relationship between the unit circle and sine waves through interactive manipulation before explanation. It uses the instrument HUD design (everything always visible, guide states drive prompts and highlights, mobile-first layout).

**Core Learning Goal**: Discover that amplitude controls wave height and frequency controls oscillation speed through hands-on exploration.

**Doc scope**: This file describes the implementation as built. Keep it updated when changing Layout, InstrumentModule, animations, or module-local components. Design spec: `docs/design/SINEWAVES-REFACTOR-SPEC.md`. Implementation plan: `docs/plans/2026-02-05-sinewaves-instrument-refactor.md`. Current wiring: `InstrumentModule.tsx`, `guide-state.ts`.

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

### Guide States (instrument refactor)

The module uses a 5-state **guide** model; the instrument is always fully visible. Only prompts, formula highlights, and ghost/connector visibility change per state. No separate "diagnose" phase or MatchFeedback component—match triggers a wave glow and auto-advance.

```typescript
type GuideState = 'watch' | 'match-amplitude' | 'match-frequency' | 'challenge' | 'free'
```

Defined in `guide-state.ts` with `getGuideStateConfig(state, challengeParam)` for prompt, showGhost, showConnector, and which parameter to highlight.

### Guide Flow

```
watch ──> match-amplitude ──> match-frequency ──> challenge ──> free
  │              │                    │                │          │
  │   (user can  │    (user can       │    (user can   │          │
  │    drag to   │     drag any       │     drag any   │          │
  │    skip)     │     slider)        │     slider)    │          │
  └──────────────┴────────────────────┴────────────────┘          │
                                                                  │
                                              "Try Another" ──> challenge
                                              "Complete" ──> onComplete()
```

- **watch**: Prompt "Watch how the circle drives the wave"; connector visible; no ghost. Continue or any slider drag → match-amplitude.
- **match-amplitude** / **match-frequency**: Ghost appears; match within threshold → wave glows ~800ms → auto-advance (no separate modal).
- **challenge**: One random parameter changed; match → glow → advance to free.
- **free**: "So what" prompt; Try Another (new challenge) or Complete (onComplete).

### State Management

**Primary state**: `guideState: GuideState` (from `guide-state.ts`). No `challengePhase` or `subStage`.

**Wave parameters**: `amplitude`, `frequency` (phase always 0). Targets: `STAGE_TARGETS` in sinewaves-constants (amplitude 1.5, frequency 2.0); challenge uses `challengeParam` + `challengeTargetValue` from `generateChallengeTarget()`.

**UI state**: `booted` (after consoleBootSequence), `matchGlow` (briefly true on match, then auto-advance). No statusText, diagnosisAnswer, or showContinue derived from multiple phases—Continue appears only in watch and free (action buttons).

**Challenge state**: `challengeParam`, `challengeTargetValue`; ghost mirrors user's non-challenge parameter (see docs/design/SINEWAVES-MATCH-PROXIMITY-AUDIT.md for sync details).

### Transitions

- **Match-driven**: When value within threshold, `checkMatch` sets `matchGlow`, then after 800ms clears glow and calls `advanceGuideState()`. No MatchFeedback component; no user Continue for parameter/challenge matches.
- **Manual**: Continue (watch → match-amplitude); free state: Try Another → challenge, Complete → onComplete(). Dot nav: back to earlier guide state only (no skip-ahead).

### Animation System

1. **Boot** — `consoleBootSequence(refs, onReadyForScene)` on mount; then `booted` set so status strip and prompt fade in. No progress bar; StatusStrip uses dots.
2. **Match** — Wave glow via `matchSuccess={true}` on Scene (SineWave uses `glow` prop). A structured `matchSuccessSequence` exists in animations.ts but is not currently wired; overlay is static (see docs/design/SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md).
3. **Stage transition** — Removed; no `stageTransition`. Controls and readouts are always visible.

### Boot Sequence (Instrument)

**Location**: `src/components/modules/sinewaves/animations.ts`

**Function**: `consoleBootSequence(refs, onReadyForScene)` — "power on" entrance for the instrument HUD.

**Refs**: `statusStrip`, `progressBar`, `prompt` (HTML elements). `progressBar` may be `null` (InstrumentModule uses dot nav in StatusStrip instead of a progress bar).

**Sequence**: Status strip fades in → if present, progress bar draws left-to-right → prompt readout materializes → `onReadyForScene()` called (InstrumentModule then sets `booted`). Respects `prefers-reduced-motion` (skips to ready).

---

## Component Patterns

### 1. Scene Component (`Scene.tsx`)

**Purpose**: Wrapper around React Three Fiber Canvas that conditionally renders to prevent WebGL context conflicts. Uses viewport-proportional positioning via `useSceneLayout` hook.

**Props** (see Scene.tsx): amplitude, frequency, phase, target (ghost a/f/p), stage (for layout), isPaused, onPauseChange, stageTargets, isVisible, matchSuccess (wave glow), showGhost, showConnector (override visibility), speedMultiplier (0.5 / 1 / 2).

**Key Features**:
- Conditionally renders Canvas based on `isVisible` (prevents WebGL conflicts)
- Responsive layout via `useSceneLayout(stage)` from scene-layout.ts; mobile hides unit circle (useIsMobileViewport)
- Ghost and connector visibility driven by InstrumentModule via showGhost, showConnector (from guide state config)
- GridLines behind wave area (optional)

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
1. **Guide state**: Tracks `GuideState` (watch → match-amplitude → match-frequency → challenge → free); no challenge sub-phases
2. **Parameter control**: Amplitude and frequency state; targets from STAGE_TARGETS and challenge from generateChallengeTarget()
3. **Match detection**: checkMatch(param, value) on slider change; on match sets matchGlow, then after 800ms advances guide state (no separate modal)
4. **Boot sequence**: Runs consoleBootSequence on mount; then sets booted so StatusStrip and PromptReadout fade in
5. **UI orchestration**: Renders StatusStrip, PromptReadout, FormulaReadout, ControlStrip (sliders + InstrumentControls + action buttons: Continue in watch, Try Another / Complete in free)

**Module-Local Components Used** (from `components/`):
- `StatusStrip`, `PromptReadout`, `FormulaReadout`, `ControlStrip`, `ParameterSlider`, `InstrumentControls`, `ContinueButton`. No DiagnosisChoices, RevealPanel, or MatchFeedback (removed in instrument refactor).

**Match detection**: Thresholds from sinewaves-constants (MATCH_THRESHOLDS). On match: setMatchGlow(true), setTimeout 800ms then advanceGuideState(). Optionally snap matched parameter to target so ghost and user wave sync (see SINEWAVES-MATCH-PROXIMITY-AUDIT.md).

**StatusStrip**: Props include currentStage (1-based index), totalStages (5), onBack, onStageSelect (dot-nav). Desktop: [←] SINEWAVES ●●●○○ SYS:NOM [ESC]; mobile: [←] ●●●○○ SYS:NOM. No statusText or progress bar.

**ControlStrip**: Slots for amplitudeSlider, frequencySlider, instrumentControls (TRACE/RESET/SPEED), actionButtons (Continue, Try Another, Complete). No hint or formula slot; readouts live in Layout.

---

## Example Flow

- **watch**: Prompt "Watch how the circle drives the wave"; connector visible; no ghost. Continue or any slider drag → match-amplitude.
- **match-amplitude**: Ghost with target amplitude (1.5), same frequency; amplitude highlighted in formula. Both sliders visible. Match within MATCH_THRESHOLDS.amplitude → wave glow → auto-advance to match-frequency.
- **match-frequency**: Ghost with target frequency (2.0); frequency highlighted. Match → glow → auto-advance to challenge.
- **challenge**: generateChallengeTarget() picks one param and value; ghost shows target for that param only (other mirrors user). Match → glow → advance to free.
- **free**: Prompt "Every sine wave is circular motion in disguise." Action buttons: Try Another (new challenge) or Complete (onComplete). No ghost; connector visible again.

All stages: StatusStrip (dots, back, ESC), PromptReadout, FormulaReadout, both sliders, InstrumentControls (TRACE/RESET/SPEED) always visible. Design spec: docs/design/SINEWAVES-REFACTOR-SPEC.md.

---

## Key Design Patterns

### 1. Discovery-First Learning

**Pattern**: User manipulates → sees formula update → matches target

**Implementation**:
- FormulaReadout always visible (all guide states)
- Active parameter is highlighted with accent color (`--lab-accent`, phosphor green)
- Formula shows current values: `y = 1.5 sin(2.0 t)` with active param highlighted

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
- **Ghost wave**: Shows target visually (no numbers needed); challenge stage mirrors user's non-challenge param
- **Match**: Wave glow (amber) for ~800ms then auto-advance; no separate modal
- **StatusStrip**: Progress dots (1–5), back, ESC

### 4. State-Driven UI

**Pattern**: Content varies by guide state; layout and controls do not.

**Implementation**: StatusStrip, PromptReadout, FormulaReadout, both sliders, InstrumentControls always rendered. Only prompt text, formula highlights, ghost/connector visibility, and action buttons (Continue in watch, Try Another / Complete in free) change by `guideState`. No DiagnosisChoices, RevealPanel, or MatchFeedback.

### 5. Animation Coordination

**Implementation**: Boot — `consoleBootSequence` on mount; then `booted` set (Scene mounted from first render). Match — wave glow via Scene `matchSuccess` prop (SineWave `glow`); optional future use of `matchSuccessSequence` (see SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md). No stageTransition; controls always visible. Respects `prefers-reduced-motion`.

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
Guide state index 1–5; TOTAL_GUIDE_STATES = 5. See guide-state.ts GUIDE_STATE_TO_INDEX, INDEX_TO_GUIDE_STATE.

---

## Copy & Content

**Guide prompts**: In `guide-state.ts` — `GUIDE_STATE_PROMPTS` (watch, match-amplitude, match-frequency, challenge, free) and "so what" for free.

**Location**: `src/components/modules/sinewaves/sinewaves-copy.ts` — simplified post-refactor: match celebration strings, behindThis for celebration modal. No stage subphases, controlStripHints, or stageTransitions.

---

## Integration with Portfolio System

### Progress Tracking

**InstrumentModule**: StatusStrip uses current guide state index (1–5) and total 5. No PortfolioContext.updateModuleProgress yet.

### Completion Flow

1. User clicks "Complete" in free state
2. `onComplete({ a: amplitude, f: frequency })` called
3. App receives completion → shows CelebrationModal
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

1. **Match detection**: Centralized in sinewaves-constants.ts; snap-to-target on match (see SINEWAVES-MATCH-PROXIMITY-AUDIT) for ghost/user sync
2. **Celebration**: matchSuccessSequence in animations.ts not wired; overlay is static (see SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT)
3. **Copy**: Guide prompts in guide-state.ts; sinewaves-copy.ts for celebrations and behindThis

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

## Reusable Infrastructure

A module skeleton with reusable hooks lives in `src/lib/skeleton/` (useModuleFlow, useStageUnlock, useChallengeAssist, useAccessibility, useErrorRecovery, useModuleAnalytics). Sinewaves uses its own InstrumentModule and guide-state flow; migration to skeleton is optional. See [skeleton README](../../../lib/skeleton/README.md).

---

*This documentation serves as the reference implementation for future modules. Subsequent modules should follow similar patterns while adapting to their specific learning goals and interactions.*
