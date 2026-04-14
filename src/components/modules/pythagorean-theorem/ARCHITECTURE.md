# Pythagorean Theorem — Architecture Reference

As-built reference for the Pythagorean Theorem module (M3). Third in the Grade 8 geometry progression: Rigid Motions (M1) → Dilations (M2) → Pythagorean Theorem (M3).

---

## Standards

| Standard | Description |
|---------|-------------|
| **8.G.B.7** | Apply the Pythagorean Theorem to determine unknown side lengths in right triangles |
| **8.G.B.8** | Apply the Pythagorean Theorem to find the distance between two points in a coordinate system |

---

## Phase / Round Sequence

13 rounds across 4 phases. `formulaVisible`, `converseVisible`, and `coordinatesVisible` are one-way — they flip `true` and stay `true` for the rest of the session.

| Round | Phase | Type | Interaction | `formulaVis` | `converseVis` | `coordVis` | Notes |
|-------|-------|------|-------------|--------------|---------------|------------|-------|
| `proof-345` | visual-proof | `predict-area` | numeric input | ✗ | ✗ | ✗ | 3-4-5 triangle; predict c² = 25 |
| `proof-51213` | visual-proof | `predict-area` | numeric input | ✗ | ✗ | ✗ | 5-12-13 triangle; predict c² = 169 |
| `proof-properties` | visual-proof | `properties-pause` | CONTINUE only | ✓ | ✗ | ✗ | Formula strip animates in on COMPLETE_ROUND |
| `converse-6810` | converse | `converse-predict` | toggle + input | ✓ | ✗ | ✗ | Right triangle 6-8-10; answer=100, YES |
| `converse-569` | converse | `converse-predict` | toggle + input | ✓ | ✗ | ✗ | Non-right 5-6-9; answer=81, NO |
| `converse-81517` | converse | `converse-predict` | toggle + input | ✓ | ✓ | ✗ | Right triangle 8-15-17; converse formula unlocks |
| `solve-hyp-345` | unknown-sides | `solve-side` | numeric input | ✓ | ✓ | ✗ | Find hypotenuse; answer=5 |
| `solve-hyp-6810` | unknown-sides | `solve-side` | numeric input | ✓ | ✓ | ✗ | Find hypotenuse; answer=10 |
| `solve-leg-51213` | unknown-sides | `solve-side` | numeric input | ✓ | ✓ | ✗ | Find leg b; answer=12 |
| `solve-leg-6810` | unknown-sides | `solve-side` | numeric input | ✓ | ✓ | ✗ | Find leg b; answer=6 |
| `coord-345` | coord-distance | `coord-distance` | construct + input | ✓ | ✓ | ✓ | Points (1,1)↔(4,5); hidden 3-4-5 |
| `coord-51213` | coord-distance | `coord-distance` | construct + input | ✓ | ✓ | ✓ | Points (0,0)↔(5,12); answer=13 |
| `coord-6810` | coord-distance | `coord-distance` | construct + input | ✓ | ✓ | ✓ | Points (2,1)↔(8,9); distance formula earned |

---

## File Structure

```
src/components/modules/pythagorean-theorem/
├── PythagoreanModule.tsx       # Module orchestrator — wires state, scene, controls
├── Layout.tsx                  # Two-column (landscape) / single-column (portrait) grid
├── types.ts                    # All TypeScript types (PhaseId, RoundId, RoundConfig, …)
├── constants.ts                # ROUND_SEQUENCE, PHASE_LABELS, DWELL_TIMER_MS
├── round-configs.ts            # ROUND_CONFIGS: all 13 RoundConfig objects
├── pythagorean-copy.ts         # PROMPT_TEXT, EARNED_REVEALS, FEEDBACK, PHASE_INTRO
│
├── hooks/
│   └── usePythagoreanState.ts  # useReducer state machine + convenience handlers
│
├── components/
│   ├── ControlStrip.tsx        # HTML controls outside Canvas (CHECK / NEXT / CONFIRM / …)
│   ├── PromptReadout.tsx       # Phase-labeled prompt card with optional notation
│   ├── NumericInput.tsx        # Numeric answer input
│   └── ConverseToggle.tsx      # YES / NO pill radio (Phase 2 only)
│
├── scene/
│   ├── PythagoreanScene.tsx    # R3F Canvas shell; routes to phase-specific scene content
│   ├── SceneContent (inline)   # SceneContent function inside PythagoreanScene.tsx
│   ├── CameraSetup.tsx         # Orthographic frustum fit via useFrame
│   ├── scene-layout.ts         # computeRoundLayout, Z constants, PHASE_LAYOUT
│   ├── scene-geometry.ts       # computeSquareTransform, computeUnitGridLines (pure math)
│   ├── scene-primitives.tsx    # SpriteLabel (CanvasTexture → PlaneGeometry)
│   ├── RightTriangle.tsx       # Triangle fill, outline, right-angle marker, side labels
│   ├── AreaSquare.tsx          # Square fill + grid lines + area label; states: visible/ghosted/hidden
│   ├── AreaEquation.tsx        # Equation below triangle (e.g. "9 + 16 = 25")
│   ├── RevealAnimation.tsx     # GSAP delayedCall — drives entry→reveal→completion transition
│   ├── CoordinateGrid.tsx      # Integer grid [0,12] with axis labels (Phase 4)
│   ├── CoordinatePoints.tsx    # Two endpoint dots + dashed connector + (x,y) labels (Phase 4)
│   ├── ConstructionLines.tsx   # Ghost→accent construction legs + right-angle marker (Phase 4)
│   └── DistanceLabel.tsx       # Amber distance readout at midpoint, fades in on reveal (Phase 4)
│
└── __tests__/
    ├── round-configs.test.ts       # All 13 configs: phase, type, answer, triangle invariants
    ├── scene-geometry.test.ts      # computeSquareTransform, computeUnitGridLines
    ├── scene-layout.test.ts        # computeRoundLayout per round
    └── usePythagoreanState.test.ts # Full state machine: all actions, lifecycle, one-way flags
```

---

## State Architecture

### `PythagoreanState` fields

```ts
{
  currentRound: RoundId         // Active round
  roundIndex: number            // 0–12 (index into ROUND_SEQUENCE)
  roundState: RoundState        // 'entry' | 'active' | 'checking' | 'reveal' | 'completion'
  formulaVisible: boolean       // One-way: flips true after proof-properties, stays true
  converseVisible: boolean      // One-way: flips true after converse-81517, stays true
  coordinatesVisible: boolean   // One-way: flips true on entering coord-distance phase
  numericInput: string          // Raw string from NumericInput (reset on round change)
  converseToggle: boolean|null  // YES/NO pick (Phase 2 only; reset on round change)
  constructionConfirmed: boolean// Phase 4: has student pressed CONFIRM CONSTRUCTION?
  feedbackState: FeedbackState  // 'idle' | 'correct' | 'incorrect'
  feedbackMessage: string|null  // Copy displayed in ControlStrip after CHECK
  shownReveals: Set<RoundId>    // Prevents re-showing earned reveals within a session
  showCelebration: boolean      // Triggers CelebrationModal after round 13 completes
}
```

### `RoundState` lifecycle

**Numeric-input rounds (Phases 1–3):**
```
entry → active → [CHECK_ANSWER] → reveal (correct) → completion
                               → active (incorrect, numericInput cleared)
```

**Properties pause (proof-properties):**
```
entry → [CONTINUE] → completion   (no active state; formula strip appears)
```

**Coordinate-distance rounds (Phase 4):**
```
entry → active (construct) → [CONFIRM_CONSTRUCTION] → active (solve)
     → [CHECK_ANSWER] → reveal → completion
```

- `entry`: CONTINUE button shown; prompt intro displayed
- `active`: Student interaction — numeric input and/or construction
- `reveal`: RevealAnimation.tsx plays; answer confirmed; awaiting NEXT
- `completion`: Round done; NEXT button shown; earned reveal displayed if first time

### Actions

| Action | Effect |
|--------|--------|
| `ADVANCE_ROUND` | Moves to next round in `ROUND_SEQUENCE`; calls `startRound()`; triggers celebration on last round |
| `START_ROUND` | Jump to a specific round (dev/test use) |
| `SET_ROUND_STATE` | Direct state transition (used by `handleContinue`) |
| `SET_NUMERIC_INPUT` | Stores raw input string |
| `SET_CONVERSE_TOGGLE` | Stores YES/NO selection (Phase 2) |
| `CONFIRM_CONSTRUCTION` | Sets `constructionConfirmed = true` (Phase 4, `active` only) |
| `CHECK_ANSWER` | Validates input; `→ reveal` (correct) or `→ active` (incorrect, input cleared) |
| `COMPLETE_ROUND` | `→ completion`; flips one-way visibility flags if current round is a milestone |
| `RECORD_REVEAL` | Adds `currentRound` to `shownReveals` (called before `ADVANCE_ROUND` to prevent batching race) |

### One-way visibility flags

Visibility flags are OR-gated in `startRound()` — once true, never set back to false:

| Flag | Flips `true` when | Mechanism |
|------|------------------|-----------|
| `formulaVisible` | `COMPLETE_ROUND` during `proof-properties` | Reducer `COMPLETE_ROUND` case |
| `converseVisible` | `COMPLETE_ROUND` during `converse-81517` | Reducer `COMPLETE_ROUND` case |
| `coordinatesVisible` | Entering any `coord-distance` round | `startRound()` checks `phase === 'coord-distance'` |

### `startRound()` helper

Resets per-round fields (`numericInput`, `converseToggle`, `constructionConfirmed`, `feedbackState`, `feedbackMessage`) while preserving all one-way flags. Called by both `ADVANCE_ROUND` and `START_ROUND`.

---

## Scene Architecture

### Camera

`CameraSetup` runs in `useFrame`. Orthographic camera with dynamic frustum:

- **Fit constraint:** shorter viewport dimension maps to `worldSize` world units
  ```
  zoom = Math.min(viewport.width, viewport.height) / worldSize
  ```
- **Phase 1–3** (visual-proof / converse / unknown-sides):
  - `worldSize` = `Math.ceil(figureSpan + 4)` per round (analytic: `a + b + max(a,b) + 4`)
  - `center` = `(a/2, b/2)` — midpoint between right-angle and hyp midpoint
  - Non-right triangle (converse-569): rough estimate `ceil(maxSide × 3 + 4)`
- **Phase 4** (coord-distance): `worldSize = 16`, `center = (6, 6)` — fixed for all coord rounds

### Z-layer ordering

| Z value | Element |
|---------|---------|
| 0.00 | Grid lines (Phase 4 CoordinateGrid) |
| 0.01 | Triangle fill (RightTriangle) |
| 0.02 | Triangle outline, right-angle marker |
| 0.03 | Square fills (AreaSquare) |
| 0.04 | Square outlines, unit-grid lines inside squares |
| 0.05 | Area labels, side-length labels (SpriteLabel) |
| 0.06 | Coordinate point dots, construction lines, leg labels (Phase 4) |
| 0.07 | Distance label (Phase 4, after reveal) |

### Triangle Configurations (round-configs.ts)

All triangles are positioned with right angle at A = (0, 0), B = (a, 0), C = (0, b). This keeps the analytic square layout valid for `computeRoundLayout`.

**Phase 1–3 triangles** (right triangles only, except `converse-569`):

| Round | Sides (a, b, c) | isRight | Notes |
|-------|----------------|---------|-------|
| proof-345 | 3, 4, 5 | ✓ | a²=9, b²=16, c²=25 |
| proof-51213 | 5, 12, 13 | ✓ | a²=25, b²=144, c²=169 |
| proof-properties | 3, 4, 5 | ✓ | Same as proof-345; backdrop for formula reveal |
| converse-6810 | 6, 8, 10 | ✓ | 2× the 3-4-5 |
| converse-569 | 5, 6, 9 | ✗ | Non-right; area check fails (25+36≠81) |
| converse-81517 | 8, 15, 17 | ✓ | Converse formula unlocks here |
| solve-hyp-345 | 3, 4, ? | ✓ | unknownSide='c', answer=5 |
| solve-hyp-6810 | 6, 8, ? | ✓ | unknownSide='c', answer=10 |
| solve-leg-51213 | 5, ?, 13 | ✓ | unknownSide='b', answer=12 |
| solve-leg-6810 | 8, ?, 10 | ✓ | unknownSide='b', answer=6 |

**Phase 4 coord pairs** (point coordinates, triangle is hidden):

| Round | p1 | p2 | Legs | answer |
|-------|----|----|------|--------|
| coord-345 | (1,1) | (4,5) | 3, 4 | 5 |
| coord-51213 | (0,0) | (5,12) | 5, 12 | 13 |
| coord-6810 | (2,1) | (8,9) | 6, 8 | 10 |

### AreaSquare states

`AreaSquareState = 'visible' | 'ghosted' | 'hidden'`

| Phase/Type | Leg squares | Hyp square |
|------------|-------------|------------|
| `predict-area` (Phase 1) | `visible` | `ghosted` until reveal, then `visible` |
| `properties-pause` (Phase 1 round 3) | `visible` | `visible` |
| `converse-predict` (Phase 2) | `visible` | `visible` |
| `solve-side` (Phase 3) | `visible` (known); `ghosted` (unknown) | same logic |
| `coord-distance` (Phase 4) | `hidden` | `hidden` |

---

## Interaction Patterns

### Numeric input (Phases 1–3)

- `NumericInput` (HTML `<input type="number">`) outside the Canvas
- CHECK button disabled until `numericInput !== ''` (Phase 2 also requires `converseToggle !== null`)
- Incorrect: clears `numericInput`, stays in `active`, shows "Not quite — try again."
- Correct: → `reveal` state; RevealAnimation fires; feedback message from `FEEDBACK.correct[]` (cycles)

### Converse toggle (Phase 2)

- `ConverseToggle` — YES/NO pill radio group (`role="radiogroup"`, `role="radio"`, `aria-checked`)
- Renders above `NumericInput` when `phase === 'converse'`
- Both toggle AND numeric input must be filled for CHECK to enable
- Validation: `converseToggle === config.converseAnswer && parsed === config.answer`

### Phase 4 — two-step interaction

1. **CONFIRM CONSTRUCTION** button (first step):
   - Active when `roundState === 'active' && !constructionConfirmed`
   - Dispatches `CONFIRM_CONSTRUCTION` → GSAP crossfade from ghost to accent construction lines
   - Right-angle marker and leg-length labels appear
2. **CHECK** (second step):
   - Active when `roundState === 'active' && constructionConfirmed && numericInput !== ''`
   - Identical validation logic to other phases

### Properties pause (proof-properties)

- CONTINUE button shown instead of input; pressing it dispatches `COMPLETE_ROUND`
- No numeric input, no CHECK — the round is a passive observation moment
- Formula strip animates in immediately via `grid-template-rows: 0fr → 1fr` CSS transition

---

## Animation Patterns

All in-scene animation is GSAP + imperative Three.js. No `useFrame` polling — transitions are one-shot timelines.

### RevealAnimation (`RevealAnimation.tsx`)

`gsap.delayedCall` fires after a phase-specific dwell:

| Phase | Dwell | Notes |
|-------|-------|-------|
| `visual-proof` | 1.5 s | Longer — student should see the hyp square fill |
| `converse` | 1.0 s | Flash already plays instantly; shorter dwell is fine |
| `unknown-sides` | 1.2 s | Ghost square fades in; dwell allows it to settle |
| `coord-distance` | 1.0 s | Distance label fades in; short dwell |

Dispatches `SET_ROUND_STATE → 'completion'` after dwell. Cleanup kills the `delayedCall` on unmount.

### AreaSquare animations

- **Flash** (`flashTrigger` prop): fires when Phase 2 `roundState` enters `reveal`. GSAP timeline: opacity spike + color shift (green for right triangle, amber for non-right), returns to original. Both `opacity` and `material.color.r/g/b` animated simultaneously.
- **Fade-in** (`fadeInOnReveal` prop): fires on `squareState: ghosted → visible` transition. Detected via `prevSquareStateRef` (avoids re-firing on other re-renders). Fill opacity: `0 → 0.12` (0.7s). Grid lines: callback ref pattern — starts `opacity: 0 → 0.25` (0.7s, delay 0.15s) on mount.

### ConstructionLines GSAP crossfade

When `constructionConfirmed` flips `true`: four material refs (ghostH, ghostV, accentH, accentV) animated in a single `gsap.timeline`:
- Ghost lines: `opacity: 0.45 → 0` (0.4s)
- Accent lines: `opacity: 0 → 1` (0.4s)

When `constructionConfirmed` flips `false` (round advance within Phase 4): opacities reset **immediately** (no tween) to initial values (ghost=0.45, accent=0). This prevents stale material state across rounds.

### DistanceLabel

Canvas texture sprite at `midpoint + perpendicular-left offset (0.65 world units)`. GSAP fade-in: `opacity: 0 → 1` (0.5s) on mount.

### FormulaReadout (HTML, PythagoreanModule.tsx)

`grid-template-rows: 0fr → 1fr` CSS transition (300ms ease-out) instead of height animation. Inner `<div>` has `overflow-hidden min-h-0` to allow collapse to zero. Two nested grids for the converse formula line — same pattern.

---

## Earned Reveal System

Mirrors M2's pattern:

- `EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>>` — 10 of 13 rounds have earned reveals
- `isFirstReveal = roundState === 'completion' && !!earnedReveal && !shownReveals.has(currentRound)`
- `handleNext` records the reveal key **before** dispatching `ADVANCE_ROUND` to prevent React batching from skipping the reveal state check
- `shownReveals` persists across rounds in the session; never re-shows an earned reveal

### EarnedReveal shape

```ts
interface EarnedReveal {
  text: string
  notation?: string               // e.g. 'a² + b² = c²', 'd = √((x₂−x₁)²+(y₂−y₁)²)'
  notationStyle?: 'rule' | 'equation'
}
```

### Reveal display

When `showEarnedReveal` is true (computed in `PythagoreanModule.tsx`):
- `promptLabel` → `'DISCOVERED'`
- `promptText` → `earnedReveal.text`
- `amber` → `true` (PromptReadout renders in amber/warm tone)
- `notation` → `earnedReveal.notation` (rendered in `PromptReadout` if present)

---

## Celebration Modal

`CelebrationModal` triggered when `ADVANCE_ROUND` is dispatched on the last round (roundIndex 12). The reducer sets `showCelebration: true` instead of advancing.

- `values={{ phases: 4, rounds: 13 }}`
- `moduleId="pythagorean-theorem"` routes `DiscoveryTab` to the M3 branch
- `DiscoveryTab` (M3 branch) shows: "You Discovered It" header, 4 phases / 13 rounds stats, `a² + b² = c²` theorem, distance formula `d = √((x₂−x₁)²+(y₂−y₁)²)`
- `onDismiss` calls `onComplete({ phases: 4, rounds: 13 })`

---

## Screen Reader / Accessibility

- **Phase transitions:** `announce(PHASE_LABELS[phase], 'polite')` in `useEffect` on `phase` change
- **Correct feedback:** `announce(earnedReveal.text ?? feedbackMessage ?? 'Correct!', 'assertive')` + `navigator.vibrate(80)`
- **Incorrect feedback:** `announce(feedbackMessage, 'polite')`
- **Status dots:** `aria-label="Round N of 13"` on the dot container; dots themselves `aria-hidden`
- **Converse toggle:** `role="radiogroup"` / `role="radio"` / `aria-checked` on each pill
- **FormulaReadout:** `aria-hidden={!formulaVisible}` on the outer grid container

---

## Key Constraints

- **No `<primitive object={new THREE.X()}>` in JSX.** All geometries in `useMemo`; disposed in `useEffect` cleanup.
- **No drei `<Text>` or `<Html>`.** SpriteLabel (CanvasTexture → PlaneGeometry) pattern for all in-scene text.
- **No `<line>` in JSX** — resolves to `SVGLineElement`. Use `<lineSegments>` or `<lineLoop>` for Three.js lines.
- **One-way visibility flags.** `formulaVisible`, `converseVisible`, `coordinatesVisible` never revert to `false` within a session.
- **Construction state reset.** `constructionConfirmed` resets to `false` in `startRound()` on every round advance. ConstructionLines resets material opacities synchronously in the `else` branch of its `useEffect` — GSAP-animated materials do not carry over between rounds.
- **Answer validation.** All answers are integers (Pythagorean triples). `parseInt(numericInput, 10) === config.answer`. Phase 2 additionally requires `converseToggle === config.converseAnswer`.
- **`RECORD_REVEAL` before `ADVANCE_ROUND`.** React may batch the two dispatches; recording first ensures `shownReveals` is updated before the round changes.

---

## Lessons Learned (M3 vs M1/M2)

1. **ConstructionLines opacity reset.** GSAP-tweened `LineBasicMaterial.opacity` does not reset automatically when the component re-renders with new geometry. When `constructionConfirmed` flips `false` (round advance), the `useEffect` must immediately write opacity values synchronously — not via a GSAP tween — to avoid the accent lines appearing visible at the start of the next round.

2. **FormulaReadout height animation.** `return null` / conditional render causes layout shift and destroys CSS transition state. `grid-template-rows: 0fr → 1fr` with `overflow-hidden min-h-0` animates height from zero without layout shift and without animating `height` directly (which triggers expensive reflow).

3. **Callback ref for mount-time GSAP.** For elements that should animate on mount (AreaSquare grid lines fading in on `ghosted → visible`), the callback ref pattern (`ref={(node) => { if (node) gsap.to(...) }}`) is simpler than `useImperativeHandle` + a separate `useEffect`. The callback fires synchronously when the element mounts.

4. **Dashed lines without drei.** Phase 4 uses `buildDashedConnector()` — a pure function that generates paired LineSegments geometry with manual dash segments — instead of Three.js `LineDashedMaterial` (which requires `computeLineDistances()` and has known issues in R3F) or drei helpers.

5. **`prevSquareStateRef` for transition detection.** Detecting `squareState: ghosted → visible` in a `useEffect` requires storing the previous value in a `useRef`. Without it, the effect fires on every render where `squareState === 'visible'`, re-triggering the fade-in animation unexpectedly.

6. **Phase 2 flash color.** The converse flash animation communicates the triangle classification (right vs non-right) by color: green for `isRight`, amber for non-right. Both `material.opacity` and `material.color.r/g/b` are animated simultaneously in the same GSAP timeline to avoid a one-frame desync between color and opacity.

---

## Build Order

Rounds implemented in phase order. Reference: `docs/modules/pythagorean-theorem/build-order-prompts.md`

- **Prompt 1** (Types, config, state machine): ✓ Complete — `types.ts`, `constants.ts`, `round-configs.ts`, `usePythagoreanState.ts`, tests
- **Prompt 2** (Module shell + layout): ✓ Complete — `PythagoreanModule.tsx`, `Layout.tsx`, `ControlStrip.tsx`, `PromptReadout.tsx`, `NumericInput.tsx`
- **Prompt 3** (Camera + scene shell): ✓ Complete — `PythagoreanScene.tsx`, `CameraSetup.tsx`, `scene-layout.ts`, `scene-primitives.tsx`
- **Prompt 4** (Phase 1 — RightTriangle + AreaSquare): ✓ Complete — `RightTriangle.tsx`, `AreaSquare.tsx`, `scene-geometry.ts`, `AreaEquation.tsx`
- **Prompt 5** (Phase 1 — RevealAnimation + reveal wire-up): ✓ Complete — `RevealAnimation.tsx`, earned reveal system
- **Prompt 6** (Phase 2 — Converse): ✓ Complete — `ConverseToggle.tsx`, flash animation, ControlStrip Phase 2 branch
- **Prompt 7** (Phase 3 — Unknown Sides): ✓ Complete — `sideRevealed` prop, `fadeInOnReveal` animation, `unknownSide` label system
- **Prompt 8** (Phase 4 — Coordinate Distance): ✓ Complete — `CoordinateGrid.tsx`, `CoordinatePoints.tsx`, `ConstructionLines.tsx`, `DistanceLabel.tsx`, `DiscoveryTab` M3 branch
- **Prompt 9** (Polish + QA + ARCHITECTURE.md): ✓ Complete — opacity reset fix, FormulaReadout animation, `pnpm build` clean, 424/424 tests pass
