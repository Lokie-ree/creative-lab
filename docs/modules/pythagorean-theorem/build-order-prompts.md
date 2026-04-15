# Pythagorean Theorem Module — Build Order Prompts

**Module:** M3
**Date:** April 12, 2026

Sequential, self-contained prompts for Claude Code. Each prompt includes full context, requirements, file structure, states to handle, and integration points. Execute in order — each prompt builds on the previous.

**Reference documents (read before starting):**
- `PRE_M3_AUDIT.md` — carry-forward patterns checklist
- `CLAUDE.md` — design system, architecture, visual specs convention
- `src/components/modules/dilations/` — M2 reference implementation (preferred patterns)
- `docs/modules/pythagorean-theorem/prd.md` — PRD
- `docs/modules/pythagorean-theorem/ux-spec.md` — UX spec (6 passes)

---

## Prompt 1: Foundation — Types, Constants, Round Configs, Copy

### Context
You are building the Pythagorean Theorem module (M3), the third module in the Grade 8 geometry arc. M1 (Rigid Motions) and M2 (Dilations) are complete. Use M2 as the reference implementation for all patterns.

### Requirements
Create the foundational data files for the module. No components, no hooks, no scene — just types and data.

### File Structure
```
src/components/modules/pythagorean-theorem/
├── types.ts
├── constants.ts
├── round-configs.ts
└── pythagorean-copy.ts
```

### `types.ts`
```ts
type PhaseId = 'visual-proof' | 'converse' | 'unknown-sides' | 'coord-distance'

type RoundId =
  | 'proof-345' | 'proof-51213' | 'proof-properties'
  | 'converse-6810' | 'converse-569' | 'converse-81517'
  | 'solve-hyp-345' | 'solve-hyp-6810' | 'solve-leg-51213' | 'solve-leg-6810'
  | 'coord-345' | 'coord-51213' | 'coord-6810'

type RoundType = 'predict-area' | 'converse-predict' | 'solve-side' | 'coord-distance' | 'properties-pause'
type RoundState = 'entry' | 'active' | 'checking' | 'reveal' | 'completion'
type FeedbackState = 'idle' | 'correct' | 'incorrect'

interface Vec2 { x: number; y: number }

interface TriangleDef {
  vertices: [Vec2, Vec2, Vec2]    // A, B, C positions in world space
  sides: [number, number, number] // a, b, c side lengths
  areas: [number, number, number] // a², b², c² areas
  isRight: boolean
}

interface RoundConfig {
  id: RoundId
  phase: PhaseId
  type: RoundType
  triangle: TriangleDef
  unknownSide?: 'a' | 'b' | 'c'
  coordPoints?: [Vec2, Vec2]
  answer: number
  converseAnswer?: boolean
}

interface EarnedReveal {
  text: string
  notation?: string
  notationStyle?: 'rule' | 'equation'
}
```

Export `PythagoreanState` and `PythagoreanAction` types (see UX spec Pass 5 for full shape). Export all types for module-internal use.

### `constants.ts`
- `ROUND_SEQUENCE: RoundId[]` — the 13-round ordered sequence
- `PHASE_LABELS: Record<PhaseId, string>` — display names: 'VISUAL PROOF', 'CONVERSE', 'UNKNOWN SIDES', 'COORDINATE DISTANCE'
- Grid/camera constants: define after visual specs are written (Prompt 3). Leave placeholder comments for now: `// TODO: Visual specs — camera, grid, z-layers`
- `DWELL_TIMER_MS = 1400` — properties pause / converse reveal dwell

### `round-configs.ts`
- `ROUND_CONFIGS: Record<RoundId, RoundConfig>` — all 13 round definitions with triangle data
- Triangle vertex positions for each round (position triangles sensibly in world space — exact coordinates will be refined in Prompt 3 visual specs, but define the side lengths and areas now)
- Phase 1: 3-4-5 (areas 9,16,25), 5-12-13 (areas 25,144,169), properties-pause
- Phase 2: 6-8-10 right (areas 36,64,100), 5-6-9 non-right (areas 25,36,81, isRight=false), 8-15-17 right (areas 64,225,289)
- Phase 3: solve-hyp-345 (answer=5), solve-hyp-6810 (answer=10), solve-leg-51213 (answer=12, unknownSide='b'), solve-leg-6810 (answer=8, unknownSide='a')
- Phase 4: coord-345 (points (1,1)→(4,5), answer=5), coord-51213 (points (0,0)→(5,12), answer=13), coord-6810 (points (2,1)→(8,9), answer=10)

### `pythagorean-copy.ts`
- `PROMPT_TEXT: Record<RoundId, { prompt: string; subtext?: string }>` — round-specific prompts following educational-copywriter voice
- `EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>>` — earned reveals for key rounds
- `PHASE_INTRO: Record<PhaseId, string>` — phase entry copy
- `FEEDBACK: { correct: string[]; incorrect: string }` — progressive feedback strings + miss message
- Follow `educational-copywriter` skill: warm, supportive, never "incorrect" or "wrong." Use "Not quite — try again." for misses.
- No inline strings in any component — all copy lives here.

### Tests
Write unit tests in `__tests__/round-configs.test.ts`:
- All 13 rounds present in `ROUND_SEQUENCE`
- Every `ROUND_SEQUENCE` entry has a matching `ROUND_CONFIGS` entry
- All Phase 1–2 triangles have correct area calculations (side² = area)
- All `answer` values are correct for their round type
- Non-right triangle (`converse-569`) has `isRight: false`
- `converseAnswer` is true for right triangles, false for non-right

### Integration Points
- **Previous:** None — this is the first prompt
- **Next:** Prompt 2 (State Machine) imports types and round configs

---

## Prompt 2: State Machine — Reducer + Hook

### Context
Foundation files from Prompt 1 are complete. Build the state machine that drives the entire module.

### Requirements
Create the reducer and custom hook following M2's `useDilationsStage` pattern.

### File Structure
```
src/components/modules/pythagorean-theorem/
└── hooks/
    └── usePythagoreanState.ts
```

### State Shape
Implement `PythagoreanState` exactly as defined in UX spec Pass 5. Initial state:
```ts
{
  currentRound: 'proof-345',
  roundIndex: 0,
  roundState: 'entry',
  formulaVisible: false,
  converseVisible: false,
  coordinatesVisible: false,
  numericInput: '',
  converseToggle: null,
  constructionConfirmed: false,
  feedbackState: 'idle',
  feedbackMessage: null,
  shownReveals: new Set(),
  showCelebration: false,
}
```

### Actions to Implement
All actions from UX spec Pass 5. Key reducer logic:
- `ADVANCE_ROUND`: increment roundIndex, call `startRound()`, or set `showCelebration` if past final round
- `startRound()`: reset per-round state, apply one-way visibility flag OR gates
- `CHECK_ANSWER`: parse `numericInput`, compare to `ROUND_CONFIGS[currentRound].answer`. For converse rounds, also check `converseToggle === config.converseAnswer`. Correct → `feedbackState='correct'`, `roundState='reveal'`. Incorrect → `feedbackState='incorrect'`, clear `numericInput`, stay in `'active'`.
- `CONFIRM_CONSTRUCTION`: set `constructionConfirmed = true` (Phase 4 only)
- `COMPLETE_ROUND`: set `roundState='completion'`, flip visibility flags for `proof-properties` and `converse-81517`
- `RECORD_REVEAL`: add key to `shownReveals`

### Hook API
`usePythagoreanState()` returns:
```ts
{
  state: PythagoreanState,
  dispatch: React.Dispatch<PythagoreanAction>,
  // Derived state (computed, not stored):
  phase: PhaseId,
  roundConfig: RoundConfig,
  isFirstReveal: boolean,
  earnedReveal: EarnedReveal | undefined,
  isConstructStep: boolean,
  isSolveStep: boolean,
  checkEnabled: boolean,
  isPropertiesPause: boolean,
  isFinalRound: boolean,
  // Convenience handlers:
  handleCheck: () => void,
  handleNext: () => void,        // records reveal, dispatches ADVANCE_ROUND
  handleContinue: () => void,    // for properties pause
  handleConfirmConstruction: () => void,
  handleInputChange: (value: string) => void,
  handleToggleChange: (value: boolean) => void,
}
```

### Critical Patterns
- **Record reveal in `handleNext`, not `handleCheck`** — prevents React batching from hiding reveals (M1 lesson #10, M2 carries forward)
- **`startRound()` uses OR gate for visibility flags** — `formulaVisible = prev.formulaVisible || roundId === 'proof-properties'`
- **`converseVisible` flips in `COMPLETE_ROUND` for `converse-81517`**, not in `startRound`. The OR gate in `startRound` is a safety net.
- **`CHECK_ANSWER` clears `numericInput` on incorrect** — forces re-engagement

### Tests
Write unit tests in `__tests__/usePythagoreanState.test.ts`:
- Initial state matches expected defaults
- `ADVANCE_ROUND` increments `roundIndex` and resets per-round state
- `ADVANCE_ROUND` past final round sets `showCelebration`
- `CHECK_ANSWER` with correct answer → `feedbackState='correct'`, `roundState='reveal'`
- `CHECK_ANSWER` with incorrect answer → `feedbackState='incorrect'`, `numericInput` cleared, `roundState` stays `'active'`
- Phase 2 `CHECK_ANSWER` requires both toggle and numeric correct
- `CONFIRM_CONSTRUCTION` sets flag, doesn't change `roundState`
- Visibility flags flip at correct rounds and never revert
- `startRound()` resets input, toggle, constructionConfirmed, feedback
- `RECORD_REVEAL` adds to `shownReveals` set
- `shownReveals` persists across rounds (not reset in `startRound`)

### Integration Points
- **Previous:** Prompt 1 (types, configs, copy)
- **Next:** Prompt 3 (Visual Specs + Scene Foundation) uses state to drive scene

---

## Prompt 3: Visual Specs + Scene Foundation

### Context
Types, configs, and state machine are complete. Before writing any scene code, write the visual specs block (CLAUDE.md convention — this is mandatory).

### Requirements

**Part A: Write the visual specs block** in a comment at the top of `Scene.tsx` or in a separate `VISUAL_SPECS.md` alongside the module files. Cover:

1. **Container fill:** Visualization slot uses `flex-1` to fill available height. On mobile portrait, visualization gets ~60% of viewport height (status strip + prompt + formula readout + controls take the rest). On desktop, visualization takes left column of a 2-column layout.

2. **Camera / world size:** Orthographic camera. World size depends on phase:
   - Phases 1–3: Must accommodate the largest triangle (8-15-17) plus its squares. The square on the hypotenuse (side 17) is 17×17 units. With the triangle and padding, the world range needs ~25–30 units on the longer axis. Center point at approximately the centroid of the triangle + squares arrangement.
   - Phase 4: Coordinate grid. World range x ∈ [-1, 14], y ∈ [-1, 14] to accommodate the largest point spread ((0,0)→(5,12)). Center at (6, 6).
   - Dynamic `worldSize` prop (M2 pattern): switches at Phase 4 entry.

3. **Grid / axis bounds:**
   - Phases 1–3: No coordinate grid. Unit squares inside the area-squares serve as the grid.
   - Phase 4: Numbered coordinate grid, range [0, 13] on both axes. Axis labels via SpriteLabel.

4. **Z-layer map:**
   | z | Layer |
   |---|-------|
   | 0 | Grid lines (Phase 4 only) |
   | 0.01 | Triangle fill |
   | 0.02 | Triangle outline, right-angle marker |
   | 0.03 | Square fills (area squares on triangle sides) |
   | 0.04 | Square outlines, unit grid lines inside squares |
   | 0.05 | Area labels (SpriteLabel), side length labels |
   | 0.06 | Coordinate point dots, leg labels (Phase 4) |
   | 0.07 | Distance label (Phase 4, after reveal) |

**Part B: Create the scene foundation files:**

### File Structure
```
src/components/modules/pythagorean-theorem/
└── scene/
    ├── PythagoreanScene.tsx     # R3F Canvas shell + CameraSetup + ContextRecovery
    ├── scene-layout.ts          # usePythagoreanLayout — camera zoom from viewport
    ├── scene-primitives.tsx     # SpriteLabel (import from M1/M2 or copy — DO NOT use drei Text)
    └── CameraSetup.tsx          # Orthographic camera, useFrame frustum updates
```

### `PythagoreanScene.tsx`
- R3F `<Canvas>` with orthographic camera
- `ContextRecovery` component (webglcontextlost/restored)
- `CameraSetup` with dynamic `worldSize` prop
- `touchAction: 'none'` on Canvas element
- Accept props from module orchestrator: `phase`, `roundConfig`, `roundState`, `feedbackState`, `constructionConfirmed`, visibility flags
- Render nothing inside Canvas yet — just the shell. Scene content comes in subsequent prompts.

### `CameraSetup.tsx`
- Orthographic camera zoom + frustum planes updated in `useFrame` (not `useEffect`)
- Deadband to avoid unnecessary `updateProjectionMatrix` calls (M1 pattern: `> 0.001` for zoom, `> 0.5px` for frustum)
- `worldSize` prop drives zoom: `zoom = shorterViewportDimension / worldSize`
- Camera position: `[centerX, centerY, 10]` — facing along -Z

### `scene-layout.ts`
- `usePythagoreanLayout(phase: PhaseId)` — returns `{ worldSize, center }` based on current phase
- Phases 1–3: larger world size to accommodate biggest squares
- Phase 4: coordinate grid world size

### Tests
- `scene-layout.test.ts`: verify `worldSize` and `center` values for each phase
- No visual tests yet — those come with Playwright in QA

### Integration Points
- **Previous:** Prompt 2 (state machine provides props)
- **Next:** Prompt 4 (Phase 1 scene content renders inside this shell)

---

## Prompt 4: Phase 1 Scene Content — Triangle + Squares

### Context
Scene shell is rendering an empty Canvas with correct camera. Build the visual content for Phase 1.

### Requirements
Render the right triangle with squares on each side. This is the core visualization that persists (with modifications) through Phases 1–3.

### File Structure
```
src/components/modules/pythagorean-theorem/
└── scene/
    ├── RightTriangle.tsx        # Triangle mesh + outline + right-angle marker + vertex labels
    ├── AreaSquare.tsx           # Square on a triangle side: fill, outline, unit grid, area label
    ├── AreaEquation.tsx         # "9 + 16 = 25" — SpriteLabel equation below the figure
    └── scene-geometry.ts       # Pure math: compute square positions/rotations from triangle vertices
```

### `RightTriangle.tsx`
- Triangle rendered as `BufferGeometry` mesh (fill) + polyline (outline)
- Right-angle marker: small square indicator at the 90° vertex
- Vertex labels: SpriteLabel "A", "B", "C" at offset positions
- Side length labels: SpriteLabel showing numeric length on each side (positioned at midpoint, offset outward)
- Unknown side ("?") label for Phase 3 rounds with `unknownSide` defined
- Props: `triangle: TriangleDef`, `unknownSide?: 'a'|'b'|'c'`, `showLabels: boolean`

### `AreaSquare.tsx`
- Square positioned on a triangle side, rotated to align with that side
- Fill: semi-transparent, `--lab-accent` tint for leg squares, `--lab-ghost` for hypotenuse (before reveal)
- Unit grid lines inside the square (visible subdivisions showing individual unit squares)
- Area count label: SpriteLabel centered on the square (e.g., "9", "16", "25")
- States: `'visible'` (grid + label shown), `'ghosted'` (outline only, no grid, no label), `'hidden'`
- GSAP animation support: expose ref for reveal animation (grid lines + label fade in)
- Props: `side: number` (length), `area: number`, `position/rotation` (from scene-geometry), `state: 'visible'|'ghosted'|'hidden'`, `color: string`

### `scene-geometry.ts`
- `computeSquareTransform(vertexA: Vec2, vertexB: Vec2, outward: 'left'|'right')` — returns position + rotation to place a square on the side AB, extending outward from the triangle
- `computeSideMidpoint(vertexA: Vec2, vertexB: Vec2)` — midpoint for side labels
- `computeRightAngleMarker(vertices: [Vec2, Vec2, Vec2], rightAngleIndex: number)` — position + rotation for the right-angle square indicator

### Critical Constraint
**All geometry created in `useMemo`, disposed in `useEffect` cleanup. No `new THREE.X()` inline in JSX.** (PRE_M3_AUDIT carry-forward)

### Tests
- `scene-geometry.test.ts`: verify square positions for 3-4-5 triangle, midpoint calculations, right-angle marker placement

### Integration Points
- **Previous:** Prompt 3 (scene shell renders these components)
- **Next:** Prompt 5 (module orchestrator + controls wire up the state machine to the scene)

---

## Prompt 5: Module Orchestrator + Controls (Phase 1 Playable)

### Context
Scene content renders. State machine drives state. Wire them together so Phase 1 is fully playable: student sees triangle + squares, enters a prediction, presses CHECK, sees reveal animation, reads earned reveal, presses NEXT, advances.

### Requirements
Build the module orchestrator and control panel. After this prompt, Phase 1 should be end-to-end playable.

### File Structure
```
src/components/modules/pythagorean-theorem/
├── PythagoreanModule.tsx        # Module orchestrator (Layout + state + scene + controls)
├── components/
│   ├── PromptReadout.tsx        # Phase label + round prompt text
│   ├── NumericInput.tsx         # Eurorack-styled numeric input
│   └── ControlStrip.tsx         # CHECK/NEXT/CONTINUE/CONFIRM/FINISH buttons
└── scene/
    └── RevealAnimation.tsx      # Phase 1 reveal: leg squares decompose into hypotenuse
```

### `PythagoreanModule.tsx`
- Uses `usePythagoreanState()` hook
- Renders `ModuleLayout` with all 5 slots:
  - `statusStrip`: back chevron + LED progress dots (13 dots, 4 phase groups)
  - `prompt`: `PromptReadout` with phase label + round prompt from copy
  - `formulaReadout`: FormulaReadout (hidden until `formulaVisible`, content grows as flags flip)
  - `visualization`: `PythagoreanScene` with all state-derived props
  - `controls`: `ControlStrip` with input + buttons
- `onComplete` callback fires on celebration
- Implements `ModuleProps` interface
- Register in `src/config/modules.ts` and add lazy-load import

### `NumericInput.tsx`
- Eurorack-styled: `--lab-bg` background, `--lab-accent` focus border, `--lab-data-font`
- `inputMode="numeric"` + `pattern="[0-9]*"`
- `min-h-[48px]`, full width on mobile
- `aria-label` prop for accessibility
- `value` and `onChange` controlled by parent
- Enter key triggers `onSubmit` callback (wired to CHECK)

### `ControlStrip.tsx`
- Renders the appropriate button(s) based on current state:
  - `active` + prediction rounds → NumericInput + CHECK
  - `active` + converse rounds → YES/NO toggle + NumericInput + CHECK
  - `active` + Phase 4 construct step → CONFIRM
  - `active` + Phase 4 solve step → NumericInput + CHECK
  - `completion` → NEXT (or FINISH on final round)
  - `entry` + properties pause → CONTINUE (after dwell timer)
  - `reveal` → nothing (animation playing)
- All buttons: `--lab-accent` bg, 44px min touch target, `min-w-[120px]`
- CHECK disabled state derived from `checkEnabled`
- CONTINUE appears after `DWELL_TIMER_MS` via `useState` + `useEffect` timer

### `RevealAnimation.tsx` (Phase 1 only — other phase animations added later)
- GSAP timeline triggered when `roundState === 'reveal'` and phase is `'visual-proof'`
- Animation: hypotenuse AreaSquare transitions from `'ghosted'` → `'visible'` (grid lines draw in, area label fades in)
- For the signature moment: unit squares from leg squares animate (translate) into the hypotenuse square, then settle into grid positions. This is the jaw-drop animation. Choreography:
  1. Leg square unit cells highlight sequentially (0.5s total)
  2. Units float from leg squares to hypotenuse square (1.0s, eased)
  3. Units settle into grid positions in hypotenuse (0.3s)
  4. Hypotenuse area label fades in (0.3s)
  5. Timeline calls `COMPLETE_ROUND` on finish
- Keep the animation clean and performant — don't animate 169 individual unit squares for the 5-12-13 round. Instead, animate the fill as a group (clip mask or opacity wipe) with a few representative units moving as particles. The *feeling* of decomposition matters more than literal 1:1 unit transfer.

### `useAccessibility` integration
- Import from `src/lib/skeleton/useAccessibility.ts`
- Announce on correct: "Correct! [earned reveal text]"
- Announce on incorrect: "Not quite — try again."
- Haptic on correct: 80ms vibrate
- Announce phase transitions: "Phase: [phase label]"

### Tests
- Integration test: render `PythagoreanModule`, simulate Phase 1 Round 1 flow (enter "25", press CHECK, verify reveal, press NEXT)
- ControlStrip: verify correct buttons render for each roundState
- NumericInput: verify disabled CHECK on empty, enabled on input

### Verification
After this prompt, manually verify:
- [ ] Module appears in Constellation view
- [ ] Phase 1 Round 1 loads with 3-4-5 triangle + squares
- [ ] Typing "25" and pressing CHECK triggers reveal animation
- [ ] Earned reveal appears after animation
- [ ] NEXT advances to Round 2
- [ ] Round 3 (properties pause) shows CONTINUE after dwell
- [ ] FormulaReadout appears after Round 3
- [ ] LED dots update correctly

### Integration Points
- **Previous:** Prompts 1–4 (all foundations)
- **Next:** Prompt 6 (Phase 2 adds YES/NO toggle + non-right triangle handling)

---

## Prompt 6: Phase 2 — Converse Rounds

### Context
Phase 1 is playable. Add Phase 2: converse rounds with YES/NO toggle and non-right triangle support.

### Requirements

### New Components
```
src/components/modules/pythagorean-theorem/
├── components/
│   └── ConverseToggle.tsx      # YES/NO pill toggle (radio group)
└── scene/
    └── NonRightTriangle.tsx    # Triangle without right-angle marker, potentially obtuse
```

### `ConverseToggle.tsx`
- Two pill-shaped buttons: "YES" / "NO"
- `--lab-surface` default, `--lab-accent` when selected
- `role="radiogroup"` with `aria-checked` per option
- 44px min height per pill
- `value: boolean | null`, `onChange: (value: boolean) => void`

### Scene Updates
- `RightTriangle.tsx`: accept `isRight` prop — omit right-angle marker when false
- `AreaSquare.tsx`: flash animation on reveal — `--lab-accent` flash for match (right triangle), `--lab-earned` (amber) flash for mismatch (non-right)
- `AreaEquation.tsx`: show "=" for matching sums, "≠" for non-matching

### `ControlStrip.tsx` Updates
- When phase is `'converse'` and roundState is `'active'`: render ConverseToggle above NumericInput, both required for CHECK
- `checkEnabled` logic already handles this (UX spec Pass 5)

### Reveal Animation (Phase 2)
- Right triangle: squares flash green briefly (GSAP opacity pulse), equation shows "="
- Non-right triangle: squares flash amber, equation shows "≠"
- Simpler than Phase 1 — no unit decomposition. Flash + equation is sufficient.
- `COMPLETE_ROUND` fires after animation

### Converse Reveal
- On `converse-81517` completion, `converseVisible` flips true
- FormulaReadout updates to include converse statement

### Tests
- Phase 2 flow: correct YES + correct area → reveal
- Phase 2 flow: wrong toggle (YES for non-right) → incorrect, input clears
- Phase 2 flow: right toggle but wrong area → incorrect
- `converseVisible` flips after `converse-81517` completion
- Non-right triangle renders without right-angle marker

### Verification
- [ ] Phase 2 Round 1 (6-8-10): YES + 100 → correct, green flash
- [ ] Phase 2 Round 2 (5-6-9): NO + 81 → correct, amber flash, "≠"
- [ ] Phase 2 Round 2: YES + anything → incorrect
- [ ] Phase 2 Round 3 (8-15-17): completes, converse appears in FormulaReadout
- [ ] Transition from Phase 1 → Phase 2 is smooth (scene cross-fade)

### Integration Points
- **Previous:** Prompt 5 (Phase 1 playable)
- **Next:** Prompt 7 (Phase 3 — unknown side solving)

---

## Prompt 7: Phase 3 — Unknown Side Lengths

### Context
Phases 1–2 are playable. Add Phase 3: student solves for missing sides using the earned formula.

### Requirements

### Scene Updates
- `RightTriangle.tsx`: when `unknownSide` is defined, render "?" label on that side instead of the length
- `AreaSquare.tsx`: the square on the unknown side renders in `'ghosted'` state (outline only, no grid, no area label) until reveal
- On reveal: unknown square transitions to `'visible'`, "?" label replaced with actual length

### Reveal Animation (Phase 3)
- Unknown square fills: grid lines draw in (GSAP drawSVG-style or opacity stagger), area label fades in
- Side length label animates from "?" to the correct value (crossfade or scale-up)
- Simpler than Phase 1 — no decomposition. Just the unknown becoming known.

### `ControlStrip.tsx` Updates
- Phase 3 uses the same NumericInput + CHECK as Phase 1, no toggle
- Prompt text changes per round (from copy file)
- Optional scaffolding line: "The areas of the known squares are __ and __." (from round config)

### Tests
- Solve for hypotenuse: enter 5 for 3-4-5 → correct
- Solve for hypotenuse: enter 10 for 6-8-10 → correct
- Solve for leg: enter 12 for 5-?-13 → correct
- Solve for leg: enter wrong value → incorrect, retry
- Unknown square transitions from ghosted to visible on reveal
- "?" label replaced with length on reveal

### Verification
- [ ] Phase 3 Round 1: familiar 3-4-5, but now solving for c. Enter 5 → correct.
- [ ] Phase 3 Round 3: solving for a leg (5-?-13). Enter 12 → correct.
- [ ] Squares remain visible as scaffolding throughout Phase 3
- [ ] FormulaReadout unchanged from Phase 2 exit (no new formula in Phase 3)

### Integration Points
- **Previous:** Prompt 6 (Phase 2 complete)
- **Next:** Prompt 8 (Phase 4 — coordinate distance)

---

## Prompt 8: Phase 4 — Coordinate Distance

### Context
Phases 1–3 are playable. Add Phase 4: coordinate grid, point plotting, construction confirm, distance solving.

### Requirements

### New Scene Components
```
src/components/modules/pythagorean-theorem/
└── scene/
    ├── CoordinateGrid.tsx       # Numbered grid for Phase 4
    ├── CoordinatePoints.tsx     # Two plotted points with coordinate labels
    ├── ConstructionLines.tsx    # Horizontal/vertical decomposition lines + right-angle marker
    └── DistanceLabel.tsx        # Hypotenuse distance label (after reveal)
```

### `CoordinateGrid.tsx`
- Rendered only when `coordinatesVisible === true`
- Grid range: [0, 13] on both axes (accommodates all Phase 4 point pairs)
- Axis lines, grid lines, origin dot
- Axis number labels via SpriteLabel (not drei Text)
- Follow M2's CoordinateGrid patterns but build fresh (three data points before extracting to shared)

### `CoordinatePoints.tsx`
- Two dots at the coordinate positions, `--lab-accent` fill
- Coordinate labels: SpriteLabel showing "(x, y)" next to each point
- Dashed line connecting the two points (the hypotenuse-to-be), `--lab-ghost` color

### `ConstructionLines.tsx`
- Before `constructionConfirmed`:
  - Dashed horizontal line from one point
  - Dashed vertical line from the other point
  - Open circle at their intersection (the right-angle vertex)
  - All in `--lab-ghost`
- After `constructionConfirmed`:
  - Lines become solid, `--lab-accent`
  - Right-angle marker appears at intersection
  - Leg length labels appear on horizontal and vertical segments
  - GSAP transition: dashed→solid (opacity crossfade, 0.4s)

### Camera Transition
- `worldSize` switches at Phase 4 entry (dynamic prop, M2 pattern)
- Scene content cross-fades: Phase 3 triangle/squares fade out, coordinate grid fades in
- Camera center shifts to (6, 6) for coordinate grid

### Reveal Animation (Phase 4)
- Distance label fades in on the connecting line (hypotenuse)
- Equation appears: "3² + 4² = 5² → distance = 5"
- Clean and simple — the construction already did the visual heavy lifting

### Final Round → Celebration
- `coord-6810` completion: FINISH button instead of NEXT
- FINISH triggers `showCelebration = true`
- Distance formula `d = √((x₂−x₁)² + (y₂−y₁)²)` appears as the capstone earned reveal
- `onComplete({ phases: 4, rounds: 13 })` fires to App.tsx → CelebrationModal

### `ControlStrip.tsx` Updates
- Phase 4, `isConstructStep`: show CONFIRM button only
- Phase 4, `isSolveStep`: show NumericInput + CHECK
- Final round completion: FINISH instead of NEXT

### CelebrationModal Integration
- Add pythagorean-theorem branch to `DiscoveryTab` in celebration components
- Show: "You discovered the Pythagorean Theorem by seeing squares, testing the converse, solving for unknowns, and finding distances."
- Display the distance formula as the capstone formula

### Tests
- Construction confirm: `constructionConfirmed` flag transitions correctly
- Coordinate distance: enter 5 for (1,1)→(4,5) → correct
- Final round FINISH triggers celebration
- `coordinatesVisible` flips at Phase 4 entry
- Camera/worldSize transitions at Phase 4

### Verification
- [ ] Phase 4 entry: coordinate grid appears, triangle/squares from Phase 3 gone
- [ ] Round 1: two points visible, dashed construction lines shown
- [ ] CONFIRM: lines solidify, leg labels appear, input + CHECK appear
- [ ] Enter 5 → correct, distance label appears
- [ ] Final round FINISH → CelebrationModal with distance formula
- [ ] Full 13-round playthrough works end-to-end

### Integration Points
- **Previous:** Prompt 7 (Phases 1–3 complete)
- **Next:** Prompt 9 (Polish + QA)

---

## Prompt 9: Polish, Accessibility, and QA

### Context
All 4 phases are playable end-to-end. Polish the experience and verify quality.

### Requirements

### FormulaReadout Polish
- Verify the progressive build: empty → a² + b² = c² → + converse → + distance formula
- Animation on each new formula addition: fade + slide in (M2 pattern)
- Ensure FormulaReadout doesn't cause layout shift when it appears

### LED Progress Dots
- 13 dots in 4 groups (3 + 3 + 4 + 3) with phase dividers
- States: ghost (upcoming), accent (active), `--lab-success` green (complete)
- Verify dot state updates correctly across all 13 rounds

### Accessibility Audit
- Screen reader: test full flow with VoiceOver / TalkBack
- All announcements fire: phase transitions, correct/incorrect, earned reveals
- Focus management: after CHECK → reveal (no focus needed) → completion → NEXT button gets focus
- Keyboard: Enter triggers active button, Tab order is logical, Escape exits

### Cross-Phase Transitions
- Phase 1→2: scene cross-fade, converse toggle appears smoothly
- Phase 2→3: toggle disappears, prompt changes
- Phase 3→4: triangle/squares fade out, coordinate grid fades in, camera transitions
- No jarring cuts or layout jumps

### Responsive Layout
- Test on 375×667 (iPhone SE), 390×844 (iPhone 14), 768×1024 (iPad), 1440×900 (desktop)
- Verify area labels don't overlap on small viewports
- Verify numeric input is comfortable to use on mobile
- Verify touch targets meet 44px minimum everywhere

### Performance
- Profile GSAP animations — no dropped frames
- Verify geometry disposal (no WebGL memory leaks across 13 rounds)
- Bundle size: pythagorean-theorem chunk should lazy-load

### Architecture Documentation
Write `src/components/modules/pythagorean-theorem/ARCHITECTURE.md`:
- Follow M2's ARCHITECTURE.md structure
- Document: file structure, phase/round sequence, state architecture, scene architecture (camera, z-layers), interaction patterns, animation patterns, earned reveal system, celebration threading, lessons learned

### Verification Checklist
- [ ] Full 13-round playthrough — all correct answers
- [ ] Full playthrough with intentional incorrect answers — retry flow works
- [ ] Properties pause dwell timer works
- [ ] All earned reveals display once and only once
- [ ] FormulaReadout builds progressively
- [ ] CelebrationModal shows with correct content
- [ ] Responsive: mobile portrait, landscape, tablet, desktop
- [ ] Accessibility: keyboard-only navigation works
- [ ] Accessibility: screen reader announcements fire
- [ ] No console errors or WebGL warnings
- [ ] Module lazy-loads from Constellation view
- [ ] Back chevron / Escape exits cleanly at any point
- [ ] LED dots accurate across all 13 rounds

### Integration Points
- **Previous:** Prompt 8 (all phases complete)
- **Next:** STEM Club testing → feedback → iteration