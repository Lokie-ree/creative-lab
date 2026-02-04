# Sinewaves Module Final Polish Design (Refined)

Comprehensive refactor addressing responsive layout, code architecture, Tailwind consistency, **and match detection consistency**. This is the "final exam" for the sinewaves module.

## Overview

Four parallel tracks:

1. **Scene Responsive Layout** - Viewport-proportional positioning for 3D elements
2. **ObservatoryModule Cleanup** - Extract constants/utils, reduce duplication, improve readability (no skeleton migration)
3. **Match Detection Consistency** - Single source of truth for thresholds
4. **Tailwind-First Components** - Responsive prefixes, touch targets, consistent syntax

Plus: **Quick Wins (Track 5)** - Lint fixes, missing CSS variables, StatusStrip ARIA.

---

## Track 1: Scene Responsive Layout

### Problem

The Scene component uses hardcoded world-space coordinates that don't adapt to viewport dimensions. Mobile portrait mode has magic numbers that were tuned iteratively without a systematic basis.

Current issues:
- Scale mismatches on tablets and unusual aspect ratios
- Spacing feels cramped or sparse depending on device
- Binary portrait/landscape split with no smooth transitions

### Solution: Viewport-Proportional Positioning

Replace hardcoded constants with calculations derived from R3F viewport dimensions.

### New File: scene-layout.ts

```ts
// src/components/modules/sinewaves/scene-layout.ts
import { useThree } from '@react-three/fiber'

export const SCENE_LAYOUT = {
  landscape: {
    circle: { xRatio: -0.32, yRatio: 0 },
    wave: { xRatio: 0.1, yRatio: 0 },
    scaleFactor: 0.20,
  },
  portrait: {
    circle: { xRatio: 0, yRatio: 0.22 },
    wave: { xRatio: -0.15, yRatio: -0.18 },
    scaleFactor: 0.24,
  },
  scale: { min: 0.5, max: 1.1 },
  ghostOpacity: 0.5,
} as const

interface SceneLayoutResult {
  isPortrait: boolean
  circle: { x: number; y: number }
  wave: { x: number; y: number }
  scale: number
  connector: { startX: number; endX: number } | null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function useSceneLayout(stage: string): SceneLayoutResult {
  const { viewport } = useThree()
  const { width, height } = viewport

  const isPortrait = width <= height
  const config = isPortrait ? SCENE_LAYOUT.portrait : SCENE_LAYOUT.landscape

  const baseDimension = Math.min(width, height)
  const scale = clamp(
    baseDimension * config.scaleFactor,
    SCENE_LAYOUT.scale.min,
    SCENE_LAYOUT.scale.max
  )

  const circle = {
    x: width * config.circle.xRatio,
    y: height * config.circle.yRatio,
  }

  const wave = {
    x: width * config.wave.xRatio,
    y: height * config.wave.yRatio,
  }

  const connector = (!isPortrait && stage === 'observe')
    ? { startX: circle.x, endX: wave.x }
    : null

  return { isPortrait, circle, wave, scale, connector }
}
```

### Scene.tsx Changes

- Remove `CIRCLE_X`, `WAVE_X`, `GHOST_OPACITY` constants
- Remove entire `if (isPortrait) { ... }` branch with magic numbers
- Use `useSceneLayout(stage)` for all positioning
- Pass `scale` to Connector for correct calculations

### Connector.tsx Changes

- Add `scale` prop
- Calculate circle point position accounting for scale:
  ```ts
  const circlePointX = circleX + Math.cos(angle) * scale
  const circlePointY = Math.sin(angle) * amplitude * scale
  ```

---

## Track 2: ObservatoryModule Cleanup

### Problem

ObservatoryModule.tsx is 636 lines with:
- 15+ useState calls scattered throughout
- 10+ handler functions with multi-state updates
- Deeply nested conditional JSX rendering
- Duplicated slider markup (4 instances)

### Solution: Readability Refactor (No Skeleton Migration)

**Decision:** Skip skeleton hook migration for this refactor. The skeleton hooks (`useModuleFlow`, `useStageUnlock`, `useChallengeAssist`) are untested in a real module. Sinewaves will serve as the exemplar; skeleton extraction happens after module #2 validates shared patterns.

**Goals:**
1. Extract reusable components
2. Group related state logically
3. Extract helper functions
4. Add documentation
5. Reduce line count through organization, not abstraction

### New File: sinewaves-constants.ts

Extract magic numbers and configuration to a dedicated file:

```ts
// src/components/modules/sinewaves/sinewaves-constants.ts

/** Stage targets for ghost waves (guided stages) */
export const STAGE_TARGETS = {
  amplitude: 1.5,
  frequency: 2.0,
  phase: 0,
} as const

/** Match thresholds (absolute values) */
export const MATCH_THRESHOLDS = {
  amplitude: 0.1,
  frequency: 0.15,
} as const

/** Slider ranges */
export const SLIDER_CONFIG = {
  amplitude: { min: 0.5, max: 2, step: 0.1 },
  frequency: { min: 0.5, max: 3, step: 0.1 },
} as const

/** Challenge target generation ranges */
export const CHALLENGE_RANGES = {
  amplitude: { min: 0.5, max: 2.0 },
  frequency: { min: 1.0, max: 3.0 },
} as const

/** Minimum distance from guided target for challenge (prevents trivial diagnosis) */
export const CHALLENGE_MIN_DISTANCE = 0.4
```

### New File: challenge-utils.ts

Extract challenge generation logic:

```ts
// src/components/modules/sinewaves/challenge-utils.ts
import { STAGE_TARGETS, CHALLENGE_RANGES, CHALLENGE_MIN_DISTANCE } from './sinewaves-constants'

export type ChallengeParam = 'amplitude' | 'frequency'

export interface ChallengeTarget {
  param: ChallengeParam
  value: number
}

/**
 * Generate a challenge target with minimum distance validation.
 * Ensures the target is far enough from the guided stage value
 * to make diagnosis non-trivial.
 */
export function generateChallengeTarget(): ChallengeTarget {
  const param: ChallengeParam = Math.random() > 0.5 ? 'amplitude' : 'frequency'
  const guidedValue = STAGE_TARGETS[param]
  const range = CHALLENGE_RANGES[param]

  let value: number
  let attempts = 0
  const maxAttempts = 10

  do {
    const raw = range.min + Math.random() * (range.max - range.min)
    value = Math.round(raw * 10) / 10
    attempts++
  } while (
    Math.abs(value - guidedValue) < CHALLENGE_MIN_DISTANCE &&
    attempts < maxAttempts
  )

  // Fallback: force valid distance
  if (attempts >= maxAttempts) {
    value = guidedValue + CHALLENGE_MIN_DISTANCE + 0.1
    value = Math.min(value, range.max)
  }

  return { param, value }
}
```

### New Component: ParameterSlider

Extract the duplicated slider pattern:

```tsx
// src/components/modules/sinewaves/components/ParameterSlider.tsx
import { Slider } from '@/components/ui/slider'
import { SLIDER_CONFIG } from '../sinewaves-constants'

interface ParameterSliderProps {
  param: 'amplitude' | 'frequency'
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}

/**
 * Labeled slider for amplitude or frequency parameter.
 * Automatically uses correct min/max/step from SLIDER_CONFIG.
 */
export function ParameterSlider({ param, value, onChange, disabled }: ParameterSliderProps) {
  const config = SLIDER_CONFIG[param]
  const label = param.charAt(0).toUpperCase() + param.slice(1)

  return (
    <div className="w-full">
      <div
        className="mb-2 flex justify-between text-sm"
        style={{
          fontFamily: 'var(--font-data)',
          color: 'var(--lab-text-muted)',
        }}
      >
        <span>{label}</span>
        <span style={{ color: 'var(--lab-accent)' }}>
          {value.toFixed(1)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={config.min}
        max={config.max}
        step={config.step}
        disabled={disabled}
        className="w-full"
        aria-label={label}
      />
    </div>
  )
}
```

### ObservatoryModule State Organization

Group related state with comments:

```tsx
export function ObservatoryModule({ onComplete, onBack }: ModuleProps) {
  // ─────────────────────────────────────────────────────────────
  // Boot sequence
  // ─────────────────────────────────────────────────────────────
  const statusStripRef = useRef<HTMLDivElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const vizRef = useRef<HTMLDivElement>(null)
  const controlStripRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const [booted, setBooted] = useState(false)
  const [statusText, setStatusText] = useState('')

  // ─────────────────────────────────────────────────────────────
  // Stage progression
  // ─────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<ViewStage>('observe')

  // ─────────────────────────────────────────────────────────────
  // Wave parameters (user-controlled)
  // ─────────────────────────────────────────────────────────────
  const [amplitude, setAmplitude] = useState(1)
  const [frequency, setFrequency] = useState(1)

  // ─────────────────────────────────────────────────────────────
  // Guided stage targets and match state
  // ─────────────────────────────────────────────────────────────
  const [amplitudeMatched, setAmplitudeMatched] = useState(false)
  const [frequencyMatched, setFrequencyMatched] = useState(false)

  // ─────────────────────────────────────────────────────────────
  // Challenge state
  // ─────────────────────────────────────────────────────────────
  const [challengePhase, setChallengePhase] = useState<ChallengePhase>('observe')
  const [challengeTarget, setChallengeTarget] = useState<ChallengeTarget | null>(null)
  const [diagnosisAnswer, setDiagnosisAnswer] = useState<string | undefined>()
  const [diagnosisWrongAttempts, setDiagnosisWrongAttempts] = useState(0)
  const [challengeMatched, setChallengeMatched] = useState(false)

  // ─────────────────────────────────────────────────────────────
  // Reveal stage
  // ─────────────────────────────────────────────────────────────
  const [isFreeExplore, setIsFreeExplore] = useState(false)

  // ... handlers and render logic
}
```

### Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| ObservatoryModule.tsx | 636 lines | ~450 lines |
| Duplicated slider blocks | 4 | 0 |
| Magic numbers inline | 12+ | 0 |
| New files | 0 | 3 (constants, utils, ParameterSlider) |

---

## Track 3: Match Detection Consistency

### Problem Statement

Match thresholds are defined inline in ObservatoryModule with no single source of truth:

```ts
// Currently scattered in ObservatoryModule.tsx
const AMPLITUDE_MATCH_THRESHOLD = 0.1
const FREQUENCY_MATCH_THRESHOLD = 0.15
```

### Solution

Move to `sinewaves-constants.ts` (created in Track 2) and use consistently:

```ts
// In sinewaves-constants.ts
export const MATCH_THRESHOLDS = {
  amplitude: 0.1,
  frequency: 0.15,
} as const

// In ObservatoryModule.tsx
import { MATCH_THRESHOLDS } from './sinewaves-constants'

const checkAmplitudeMatch = (value: number) => {
  if (Math.abs(value - STAGE_TARGETS.amplitude) <= MATCH_THRESHOLDS.amplitude) {
    setAmplitudeMatched(true)
  }
}
```

### Issues to Address

#### Issue 1: Challenge Target Distance Validation
**Current State:** Random target can land too close to guided value → trivial diagnosis

**Fix:** `generateChallengeTarget()` in `challenge-utils.ts` enforces `CHALLENGE_MIN_DISTANCE = 0.4`

#### Issue 2: Inline Magic Numbers
**Current State:** Thresholds defined at top of ObservatoryModule with no documentation

**Fix:** Move to `sinewaves-constants.ts` with JSDoc comments explaining the values

### Implementation

Challenge match uses the same thresholds as guided stages (no normalization needed since we're not using skeleton):

```ts
// In ObservatoryModule - challenge match detection
const checkChallengeMatch = (param: ChallengeParam, value: number) => {
  if (stage === 'challenge' && challengePhase === 'match' && !challengeMatched) {
    const threshold = MATCH_THRESHOLDS[param]
    if (Math.abs(value - challengeTarget.value) <= threshold) {
      setChallengeMatched(true)
    }
  }
}
```

### Verification Matrix

| Stage | Match Window | Config Source | Verified |
|-------|--------------|---------------|----------|
| Amplitude (guided) | ±0.1 | `MATCH_THRESHOLDS.amplitude` | ✅ |
| Frequency (guided) | ±0.15 | `MATCH_THRESHOLDS.frequency` | ✅ |
| Challenge (amplitude) | ±0.1 | `MATCH_THRESHOLDS.amplitude` | ✅ Same source |
| Challenge (frequency) | ±0.15 | `MATCH_THRESHOLDS.frequency` | ✅ Same source |

**Benefit:** Single source of truth. Guided and challenge stages use identical thresholds.

---

## Track 4: Tailwind-First Components

### Design System Mapping

```
// Spacing: Tailwind scale
var(--space-2) → p-2, gap-2, m-2
var(--space-3) → p-3, gap-3, m-3
var(--space-4) → p-4, gap-4, m-4
var(--space-6) → p-6, gap-6, m-6

// Colors: CSS variables via arbitrary syntax
var(--lab-bg)         → bg-[var(--lab-bg)]
var(--lab-text)       → text-[var(--lab-text)]
var(--lab-accent)     → text-[var(--lab-accent)], border-[var(--lab-accent)]
var(--lab-surface)    → bg-[var(--lab-surface)]
var(--lab-text-muted) → text-[var(--lab-text-muted)]
var(--lab-earned)     → text-[var(--lab-earned)]
var(--lab-border)     → border-[var(--lab-border)]

// Fonts: CSS variables
var(--font-display) → font-[family-name:var(--font-display)]
var(--font-body)    → font-[family-name:var(--font-body)]
var(--font-data)    → font-[family-name:var(--font-data)]
```

### Component Refactors

#### Layout.tsx

**Before:** Inline `<style>` with `@media` queries

**After:**
```tsx
<div className={cn(
  "relative grid min-h-screen w-screen overflow-hidden",
  "grid-rows-[2.5rem_1fr_auto] gap-2 p-2",
  "bg-[var(--lab-bg)] font-[family-name:var(--font-body)]",
  "md:grid-rows-[3rem_auto_1fr_auto] md:gap-4 md:p-4"
)}>
```

#### StatusStrip.tsx

- Responsive dot spacing: `gap-2 sm:gap-3`
- Responsive title: `text-xs sm:text-sm md:text-base`
- Clamped width: `max-w-[80px] sm:max-w-[120px] md:max-w-[200px]`

#### ControlStrip.tsx

- Add `formula` prop for mobile inline formula
- Responsive gap: `gap-2 sm:gap-3`
- Mobile formula: `<div className="w-full md:hidden">{formula}</div>`

#### PromptReadout.tsx

- Responsive padding: `p-3 sm:p-4`
- Responsive text: `text-sm sm:text-base lg:text-lg`

#### FormulaReadout.tsx

- Responsive padding: `p-3 sm:p-4`
- Responsive formula text: `text-base sm:text-lg md:text-xl`
- Responsive label: `text-[10px] sm:text-xs`

#### MatchFeedback.tsx

- Responsive gap: `gap-2 sm:gap-3 md:gap-4`
- Responsive text: `text-xs sm:text-sm`, `text-sm sm:text-base`

#### DiagnosisChoices.tsx

- Touch targets: `min-h-[44px] sm:min-h-[40px]`
- Responsive gap: `gap-1.5 sm:gap-2`
- Add `hint` and `showHint` props

#### RevealPanel.tsx

- Responsive padding: `p-4 sm:p-6`
- Touch targets: `min-h-[44px] sm:min-h-[40px]`
- Responsive text throughout

#### ContinueButton.tsx

- Remove `onMouseEnter/onMouseLeave` handlers
- Use Tailwind: `hover:bg-[rgba(34,211,238,0.1)]`
- Touch target: `min-h-[44px] sm:min-h-[40px]`

---

## FormulaReadout Reinstatement

### Current Behavior

FormulaReadout only shows in reveal stage.

### New Behavior

| Stage | FormulaReadout | Display |
|-------|----------------|---------|
| observe | Hidden | User watches, no parameters yet |
| amplitude | Visible | `y = [A] sin(1.0t)` with A updating live |
| frequency | Visible | `y = 1.5 sin([f]t)` with f updating live |
| challenge | Visible | Current values, highlights matched param |
| reveal | Visible | Full formula with discovered values |

### Mobile Placement

On mobile, FormulaReadout appears inline within ControlStrip:

```
┌─────────────────────────────┐
│         StatusStrip         │
├─────────────────────────────┤
│       Visualization         │
├─────────────────────────────┤
│    y = [1.2] sin(1.0t)      │  ← Formula inline
│    "Match the wave height"   │  ← Hint
│    ═══════●═══════════       │  ← Slider
└─────────────────────────────┘
```

### Implementation

```tsx
// In ObservatoryModule render
const showFormula = stage !== 'observe'

// Desktop: Layout's formulaReadout slot
// Mobile: ControlStrip's formula prop
<Layout
  formulaReadout={showFormula ? <FormulaReadout ... /> : null}
  controlStrip={
    <ControlStrip
      hint={controlHint}
      formula={showFormula ? <FormulaReadout ... /> : null}
    >
      {renderControls()}
    </ControlStrip>
  }
/>
```

---

## Files Summary

### New Files

| File | Purpose |
|------|---------|
| `sinewaves/scene-layout.ts` | Layout constants + useSceneLayout hook |
| `sinewaves/sinewaves-constants.ts` | Stage targets, thresholds, slider config |
| `sinewaves/challenge-utils.ts` | Challenge target generation with distance validation |
| `sinewaves/components/ParameterSlider.tsx` | Extracted slider component |

### Modified Files (Quick Wins - Track 5)

| File | Changes |
|------|---------|
| `src/index.css` | Add `--lab-earned` variable, token mapping comments |
| `src/components/ui/button.tsx` | Add eslint-disable for react-refresh rule |
| `src/components/uitripled/native-profile-notch-shadcnui.tsx` | Fix unused `size` variable |
| `sinewaves/components/StatusStrip.tsx` | Fix ARIA, touch targets, Tailwind syntax consistency |

### Modified Files (Main Refactor)

| File | Changes |
|------|---------|
| `Layout.tsx` | Remove `<style>`, pure Tailwind responsive |
| `StatusStrip.tsx` | Tailwind classes, responsive sizing |
| `ControlStrip.tsx` | Add formula slot, Tailwind |
| `PromptReadout.tsx` | Tailwind classes |
| `FormulaReadout.tsx` | Tailwind classes |
| `MatchFeedback.tsx` | Tailwind, responsive gap |
| `DiagnosisChoices.tsx` | Tailwind, touch targets, hint support |
| `RevealPanel.tsx` | Tailwind, responsive padding |
| `ContinueButton.tsx` | Remove JS hover, Tailwind hover |
| `Scene.tsx` | Use useSceneLayout, simplified |
| `ObservatoryModule.tsx` | Import constants/utils, group state, use ParameterSlider |
| `sinewaves-copy.ts` | Add getStageCopy() helper (optional) |

### Estimated Line Counts

| File | Before | After |
|------|--------|-------|
| ObservatoryModule.tsx | 636 | ~450 |
| Scene.tsx | 193 | ~90 |
| Layout.tsx | 94 | ~60 |
| New files (constants, utils, ParameterSlider) | 0 | ~120 |
| Other components | ~650 | ~500 |
| **Net change** | ~1,573 | ~1,220 |

---

## Success Criteria

### Quick Wins (Track 5)
- [ ] `pnpm lint` passes with no errors
- [ ] `--lab-earned` CSS variable defined and renders correctly in RevealPanel/MatchFeedback
- [ ] Token mapping documented in index.css comments
- [ ] ParameterSlider component extracted before ObservatoryModule refactor
- [ ] StatusStrip uses valid ARIA (no buttons inside progressbar)
- [ ] StatusStrip dot touch targets are 44px minimum (via pseudo-element)
- [ ] StatusStrip uses consistent Tailwind 4 syntax for CSS variables

### Scene Layout
- [ ] Circle and wave scale smoothly from 320px to 1920px viewport
- [ ] No clipping at any viewport size
- [ ] Portrait: circle above, wave below, no overlap with controls
- [ ] Landscape: circle left, wave right, connector visible in observe
- [ ] Spacing feels balanced at all breakpoints

### Component Responsiveness
- [ ] All components use Tailwind responsive prefixes (no inline @media)
- [ ] No JS-based hover handlers (use hover: variants)
- [ ] Touch targets minimum 44px on mobile
- [ ] Text scales: text-xs → sm:text-sm → md:text-base
- [ ] Spacing scales: gap-2 → sm:gap-3 → md:gap-4

### FormulaReadout Integration
- [ ] Visible during amplitude, frequency, challenge stages
- [ ] Desktop: appears in readouts row
- [ ] Mobile: appears inline in ControlStrip
- [ ] Live updates as user adjusts sliders
- [ ] Highlights active parameter with accent color

### ObservatoryModule Cleanup
- [ ] Constants extracted to `sinewaves-constants.ts`
- [ ] Challenge logic extracted to `challenge-utils.ts`
- [ ] ParameterSlider component extracts slider duplication
- [ ] State grouped with section comments
- [ ] Component under 450 lines (down from 636)
- [ ] All existing behaviors preserved

### Match Detection Consistency
- [ ] Amplitude guided stage: match at 1.4, 1.5, 1.6 (±0.1)
- [ ] Frequency guided stage: match at 1.85, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15 (±0.15)
- [ ] Challenge amplitude: same ±0.1 window (uses `MATCH_THRESHOLDS.amplitude`)
- [ ] Challenge frequency: same ±0.15 window (uses `MATCH_THRESHOLDS.frequency`)
- [ ] Challenge targets always at least 0.4 away from guided values
- [ ] Single source of truth: all thresholds from `sinewaves-constants.ts`

### Regression Tests
- [ ] `pnpm lint` passes (no errors)
- [ ] `pnpm build` succeeds (TypeScript + Vite)
- [ ] All 5 stages work: observe → amplitude → frequency → challenge → reveal
- [ ] Match detection triggers at correct thresholds (test edge cases: exactly at threshold)
- [ ] Challenge diagnosis: correct/wrong handling, hints after 2 wrong
- [ ] Dot navigation: back to previous stages only
- [ ] Animations: boot sequence, match success, stage transitions
- [ ] Mobile: controls always visible, no scrolling needed
- [ ] Desktop: full layout with readouts visible
- [ ] Frequency stage: 2.0 ± 0.15 all trigger match
- [ ] Frequency challenge: consistent behavior with guided stage
- [ ] Challenge targets: none fall within minimumDistance of current value
- [ ] RevealPanel accent bar and title render in amber (--lab-earned)

---

## Track 5: Quick Wins & Cleanup

Low-risk fixes that should be addressed before or alongside the main refactor.

### 5.1 Missing `--lab-earned` CSS Variable

**Problem:** `RevealPanel.tsx` and `MatchFeedback.tsx` use `var(--lab-earned)` but it's not defined in `index.css`.

**Fix:** Add to `:root` in `src/index.css`:
```css
/* Semantic colors */
--lab-earned: #f5a623;  /* Same as --lab-accent-warm / learning.primary */
```

### 5.2 Fix Lint Errors

Two lint errors currently fail `pnpm lint`:

**button.tsx:64** - Fast refresh violation (exports component + constant)
```tsx
// Before: exports Button and buttonVariants together
export { Button, buttonVariants }

// Fix: Add disable comment (buttonVariants is intentionally co-exported for CVA pattern)
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
```

**uitripled/native-profile-notch-shadcnui.tsx:55** - Unused `size` variable
- These are landing page components reserved for future use
- Fix the unused variable or prefix with underscore: `const _size = ...`

### 5.3 Sync Design Token Documentation

**Problem:** `colors.ts` and `index.css` have divergent naming:
- `colors.ts`: `learning.primary` (#f5a623)
- `index.css`: `--lab-accent-warm` (#f5a623)
- Missing: `--lab-earned` (same value, semantic name for success states)

**Fix:** Add comment block to `index.css` mapping JS tokens to CSS variables:
```css
/* Token mapping (see src/lib/colors.ts):
 * colors.learning.primary  → --lab-accent-warm, --lab-earned
 * colors.accent.primary    → --lab-accent
 * colors.ghost             → --lab-ghost
 */
```

### 5.4 Extract Reusable ParameterSlider Earlier

ObservatoryModule has 4 near-identical slider blocks (amplitude, frequency, challenge, free explore). Extract `ParameterSlider.tsx` as part of Track 4 component refactor, not after.

**Current duplication:**
```tsx
// Lines 430-456, 466-493, 516-547, 576-623 all follow this pattern:
<div className="w-full">
  <div className="mb-2 flex justify-between text-sm" style={{...}}>
    <span>{label}</span>
    <span style={{ color: 'var(--lab-accent)' }}>{value.toFixed(1)}</span>
  </div>
  <Slider value={[value]} onValueChange={...} min={...} max={...} step={0.1} />
</div>
```

### 5.5 StatusStrip Button Conflicts

**Problem:** Three issues with progress dot buttons:

1. **Invalid ARIA**: Buttons inside `role="progressbar"` container — progressbar shouldn't contain interactive children
2. **Touch targets**: Dots are `h-2 w-2` (8px) — violates 44px minimum for mobile
3. **Mixed Tailwind syntax**: Uses both `bg-(--lab-accent)` and `focus:ring-[var(--lab-accent)]`

**Fix:**

```tsx
// Before: role="progressbar" with button children (invalid)
<div role="progressbar" aria-valuenow={currentStage} ...>
  {dots.map(i => <button className="h-2 w-2 ..." />)}
</div>

// After: Use navigation semantics with proper touch targets
<nav aria-label={`Module progress: stage ${currentStage} of ${totalStages}`}>
  <ol className="flex items-center gap-3" role="list">
    {dots.map(i => (
      <li key={i}>
        <button
          className={cn(
            // Visual dot stays small
            "relative h-2 w-2 rounded-full",
            // Touch target is 44px (invisible, centered on dot)
            "before:absolute before:-inset-4 before:content-['']",
            // Consistent Tailwind 4 syntax
            isCompleted ? "bg-(--lab-accent)" : "bg-(--lab-border)",
            isCurrent && "ring-2 ring-(--lab-accent) ring-offset-2 ring-offset-(--lab-bg)",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent)"
          )}
          aria-label={`${STAGE_LABELS[i]}, ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
          aria-current={isCurrent ? 'step' : undefined}
          disabled={!clickable}
        />
      </li>
    ))}
  </ol>
</nav>
```

**Note:** The `before:` pseudo-element creates an invisible 44px touch target while keeping the visual dot at 8px.

---

## Git Strategy

**Single PR with commits per track.** Changes are interdependent; splitting into separate PRs would create awkward intermediate states.

Commit sequence:
1. `fix: quick wins - lint errors, CSS variables, StatusStrip ARIA`
2. `refactor: scene responsive layout with useSceneLayout hook`
3. `refactor: extract sinewaves constants and challenge utils`
4. `refactor: Tailwind-first components with ParameterSlider extraction`
5. `refactor: ObservatoryModule cleanup - use extracted modules`
6. `feat: FormulaReadout visible during parameter stages`
7. `docs: update ARCHITECTURE.md for new file structure`

**ARCHITECTURE.md:** Update after refactor is complete and tested, not during.

---

## Implementation Order

0. **Quick wins (Track 5)** - Fix lint errors, add `--lab-earned` CSS variable, StatusStrip ARIA fix
1. **Scene layout (Track 1)** - Create scene-layout.ts, refactor Scene.tsx
2. **Constants extraction (Track 2)** - Create sinewaves-constants.ts, challenge-utils.ts
3. **Component Tailwind refactor (Track 4)** - All UI components, extract ParameterSlider
4. **ObservatoryModule cleanup (Track 2)** - Use new constants/utils, group state, reduce lines
5. **Match detection (Track 3)** - Verify single source of truth, test edge cases
6. **FormulaReadout integration** - Add to stage flow
7. **Testing** - All breakpoints, all stages, all threshold edge cases
8. **Documentation** - Update ARCHITECTURE.md to reflect new file structure

---

## Testing Protocol for Match Detection

### Manual Test Cases

**Amplitude Guided Stage:**
1. Set slider to 1.4 → should match
2. Set slider to 1.3 → should NOT match
3. Set slider to 1.6 → should match
4. Set slider to 1.7 → should NOT match

**Frequency Guided Stage:**
1. Set slider to 1.85 → should match
2. Set slider to 1.84 → should NOT match (edge case)
3. Set slider to 2.15 → should match
4. Set slider to 2.16 → should NOT match (edge case)

**Challenge Match Phase:**
1. Generate 10 amplitude challenges → verify all targets >= 0.4 away from 1.5
2. Generate 10 frequency challenges → verify all targets >= 0.4 away from 2.0
3. For amplitude challenge at target=1.2: test 1.1, 1.2, 1.3 → match behavior consistent with guided
4. For frequency challenge at target=2.5: test 2.35, 2.5, 2.65 → match behavior consistent with guided

### Unit Test Additions

```ts
describe('Match detection consistency', () => {
  it('proximity function produces equivalent windows to raw thresholds', () => {
    // Amplitude: threshold 0.1, range 1.5
    expect(proximityFn({ amplitude: 1.5, frequency: 2.0 }, { param: 'amplitude', value: 1.4 })).toBeGreaterThanOrEqual(0.94)
    expect(proximityFn({ amplitude: 1.5, frequency: 2.0 }, { param: 'amplitude', value: 1.3 })).toBeLessThan(0.94)
    
    // Frequency: threshold 0.15, range 2.5
    expect(proximityFn({ amplitude: 1.5, frequency: 2.0 }, { param: 'frequency', value: 1.85 })).toBeGreaterThanOrEqual(0.94)
    expect(proximityFn({ amplitude: 1.5, frequency: 2.0 }, { param: 'frequency', value: 1.84 })).toBeLessThan(0.94)
  })
  
  it('challenge targets respect minimum distance', () => {
    for (let i = 0; i < 100; i++) {
      const target = SINEWAVES_CONFIG.challenge.generateTarget()
      const currentValue = target.param === 'amplitude' ? 1.5 : 2.0
      expect(Math.abs(target.value - currentValue)).toBeGreaterThanOrEqual(0.4)
    }
  })
})
```

---

*This refined design addresses all identified match detection issues and provides clear verification criteria. Implementation should proceed in the order specified, with threshold alignment happening first to prevent compounding issues during refactor.*