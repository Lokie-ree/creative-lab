# Dilations, Similarity & Right Triangles Module
## Build-Order Prompts

**Version:** 1.0
**Created:** 2026-03-21
**Based on:** UX Spec v1.0 + PRD Phase & Round Architecture
**Purpose:** Sequential, self-contained prompts for UI generation tools
**Round count:** 14 rounds across 4 phases → 10 build prompts

---

## Overview

Module 2 in the Grade 8 Geometry arc. Students discover dilation properties spatially (Phase 1), earn the coordinate rule (Phase 2), compose rigid motions with dilations to define similarity (Phase 3), and discover the AA criterion (Phase 4). Pedagogy: discovery before formula, earned reveals, visual confirmation.

**Tech Stack:**
- React 19 + TypeScript
- React Three Fiber + drei for 3D visualization
- GSAP for animations
- Tailwind CSS with `--lab-*` design token system
- Stage machine pattern (phase/round progression)

**Round-to-Prompt Map:**

| Prompt | Rounds | Phase | ALD |
|--------|--------|-------|-----|
| 1 | — | Foundation (types, math, tokens) | — |
| 2 | — | Canvas + Stage Machine | — |
| 3 | — | Shared Primitives (from M1) | — |
| 4 | dilate-k2, dilate-k2-properties, dilate-k3 | Scale Factor Exploration | L3 |
| 5 | dilate-k-half, dilate-summary | Fractional Scale Factors | L3 |
| 6 | coord-k2, coord-k-half, coord-k-third | Coordinate Dilation | L4 |
| 7 | similarity-guided, similarity-rigid-dilation, similarity-inverse | Similarity Sequences | L4–L5 |
| 8 | aa-discover, aa-confirm, capstone-final | AA Discovery & Capstone | L5 |
| 9 | — | Polish & Transitions | — |
| 10 | — | Responsive & Accessibility | — |

---

## Prompt 1: Foundation — Math Utilities, Types & Design Tokens

### Rounds Implemented
None — infrastructure prompt.

### Context
Sets up all mathematical functions, TypeScript types, and design tokens that every subsequent prompt depends on. No UI. This module operates on the canonical triangle A(1,1) B(4,2) C(2,4), performing origin-centered dilations with scale factors k ∈ {2, 3, 0.5, 0.333}.

### Requirements

**Mathematical utilities (`src/components/modules/dilations/utils/math.ts`):**
- `dilatePoint(point: Vec2, k: number): Vec2` — origin-centered dilation: `(x, y) → (kx, ky)`
- `dilateTriangle(triangle: Triangle, k: number): Triangle` — apply dilation to all 3 vertices
- `sideLength(a: Vec2, b: Vec2): number` — Euclidean distance between two points
- `triangleSideLengths(t: Triangle): [number, number, number]` — lengths of AB, BC, CA
- `sideRatio(pre: number, image: number): number` — image/pre-image ratio
- `angleDeg(a: Vec2, vertex: Vec2, b: Vec2): number` — angle at vertex in degrees (Math.atan2-based, rounded to nearest integer)
- `triangleAngles(t: Triangle): [number, number, number]` — angles at A, B, C
- `pointsMatch(a: Vec2, b: Vec2, tolerance: number): boolean` — within-tolerance check for prediction accuracy
- `trianglesMatch(a: Triangle, b: Triangle, tolerance: number): boolean` — all 3 vertices match
- `composeTransformations(steps: TransformStep[], point: Vec2): Vec2` — apply a sequence of transformations to a point
- `composeTriangle(steps: TransformStep[], triangle: Triangle): Triangle` — apply sequence to all vertices

**Transformation primitives (extend from M1 if available):**
- `translatePoint(p: Vec2, dx: number, dy: number): Vec2`
- `reflectPoint(p: Vec2, axis: 'x' | 'y'): Vec2`
- `rotatePoint(p: Vec2, angleDeg: number): Vec2` — origin-centered rotation
- These may already exist in M1's math utils. Import and re-export if so.

**Type definitions (`src/components/modules/dilations/utils/types.ts`):**

```typescript
type Vec2 = { x: number; y: number };

type Triangle = { a: Vec2; b: Vec2; c: Vec2 };

type ScaleFactor = 2 | 3 | 0.5 | 0.333;

type RoundId =
  | 'dilate-k2' | 'dilate-k2-properties' | 'dilate-k3'
  | 'dilate-k-half' | 'dilate-summary'
  | 'coord-k2' | 'coord-k-half' | 'coord-k-third'
  | 'similarity-guided' | 'similarity-rigid-dilation' | 'similarity-inverse'
  | 'aa-discover' | 'aa-confirm' | 'capstone-final';

type PhaseId = 'scale-factor' | 'coordinate' | 'similarity' | 'aa-capstone';

type RoundState = 'entry' | 'active' | 'prediction' | 'reveal' | 'completion';

type RoundConfig = {
  id: RoundId;
  phase: PhaseId;
  label: string;
  scaleFactor?: ScaleFactor;
  hasGhostDrag: boolean;       // true for Phase 1-2 prediction rounds
  hasSequenceBuilder: boolean; // true for Phase 3-4
  coordinatesVisible: boolean; // false for Phase 1, true for Phase 2+
  angleLabelsVisible: boolean; // false for Phase 1-3, true for Phase 4
};

type TransformType = 'translate' | 'reflect' | 'rotate' | 'dilate';

type TransformStep = {
  type: TransformType;
  params: TranslateParams | ReflectParams | RotateParams | DilateParams;
};

type TranslateParams = { dx: number; dy: number };
type ReflectParams = { axis: 'x' | 'y' };
type RotateParams = { angleDeg: number };
type DilateParams = { k: number };

type SimilarityPair = {
  preImage: Triangle;
  target: Triangle;
  isSimilar: boolean;
  validSequences?: TransformStep[][];  // multiple valid solutions
};

// Phase 4 capstone pairs
type CapstonePair = SimilarityPair & {
  angleLabels: { a: number; b: number; c: number }[];  // for both triangles
};
```

**Constants (`src/components/modules/dilations/utils/constants.ts`):**

```typescript
const CANONICAL_TRIANGLE: Triangle = {
  a: { x: 1, y: 1 },
  b: { x: 4, y: 2 },
  c: { x: 2, y: 4 },
};

const SCALE_FACTORS: ScaleFactor[] = [2, 3, 0.5, 0.333];

const PREDICTION_TOLERANCE = 0.75; // grid units — how close ghost must be

const ROUND_SEQUENCE: RoundId[] = [
  'dilate-k2', 'dilate-k2-properties', 'dilate-k3',
  'dilate-k-half', 'dilate-summary',
  'coord-k2', 'coord-k-half', 'coord-k-third',
  'similarity-guided', 'similarity-rigid-dilation', 'similarity-inverse',
  'aa-discover', 'aa-confirm', 'capstone-final',
];

const ROUND_CONFIGS: Record<RoundId, RoundConfig> = { /* ... populate from above types ... */ };
```

**Design tokens:** Import from existing `src/lib/labTokens.ts`. No new tokens needed — M2 uses the same `--lab-*` palette as M1.

### Technical Details
- Pure functions only — no React, no side effects
- All coordinates assume origin at (0,0), positive x right, positive y up
- Angles computed via `Math.atan2`, converted to degrees, rounded to nearest integer
- Tolerance-based matching (not exact equality) for prediction checks

### Component Structure
```
src/components/modules/dilations/
├── utils/
│   ├── math.ts        # All math functions
│   ├── types.ts       # All type definitions
│   └── constants.ts   # Canonical triangle, scale factors, round configs
```

### Constraints
- No UI code in this prompt
- No React imports
- All math must be deterministic (no random)
- Use the canonical triangle A(1,1) B(4,2) C(2,4) — same as M1
- Scale factors are exactly [2, 3, 0.5, 0.333] — no others

### Integration Points
- **Consumes from previous prompts:** `src/lib/labTokens.ts` (design tokens)
- **Produces for later prompts:** All types, math functions, constants used by every subsequent prompt
- **Round transitions:** N/A — infrastructure only

---

## Prompt 2: Canvas, Coordinate System & Stage Machine

### Rounds Implemented
None — infrastructure prompt. But the stage machine scaffolds progression through all 14 rounds.

### Context
Sets up the R3F canvas, grid/coordinate system, camera, and the stage machine that drives round-by-round progression. This is the shell that all round-specific components plug into. The stage machine must support the two distinct interaction modes: ghost-drag (Phase 1-2) and SequenceBuilder (Phase 3-4).

### Requirements

**R3F Canvas (`DilationsCanvas.tsx`):**
- Orthographic camera looking down z-axis (2D view of coordinate plane)
- Camera bounds: x ∈ [-2, 14], y ∈ [-2, 14] (accommodates k=3 dilation of the canonical triangle: max vertex C(2,4) → C'(6,12))
- Subtle grid lines at unit intervals
- Origin marker: small filled circle + crosshair at (0,0)
- Grid color: use `labTokens.border` or `--lab-border`
- Origin marker color: use `labTokens.accent` or `--lab-accent`

**Stage machine (`useDilationsStage.ts` — custom hook):**

```typescript
type StageState = {
  currentRound: RoundId;
  roundState: RoundState;  // entry | active | prediction | reveal | completion
  phase: PhaseId;
  coordinatesVisible: boolean;
  angleLabelsVisible: boolean;
  ghostPosition: Vec2 | null;
  sequenceSteps: TransformStep[];
};

// Actions
type StageAction =
  | { type: 'START_ROUND'; round: RoundId }
  | { type: 'SET_ROUND_STATE'; state: RoundState }
  | { type: 'SET_GHOST_POSITION'; position: Vec2 }
  | { type: 'COMMIT_PREDICTION' }
  | { type: 'TRIGGER_REVEAL' }
  | { type: 'COMPLETE_ROUND' }
  | { type: 'ADVANCE_ROUND' }  // moves to next round in ROUND_SEQUENCE
  | { type: 'ADD_SEQUENCE_STEP'; step: TransformStep }
  | { type: 'REMOVE_SEQUENCE_STEP'; index: number }
  | { type: 'REORDER_SEQUENCE_STEP'; from: number; to: number }
  | { type: 'CHECK_SEQUENCE' }
  | { type: 'RESET_SEQUENCE' };
```

- `coordinatesVisible` flips to `true` when `currentRound` enters `coord-k2` (Phase 2). Never flips back.
- `angleLabelsVisible` flips to `true` when `currentRound` enters `aa-discover` (Phase 4). Never flips back.
- Round progression follows `ROUND_SEQUENCE` array. `ADVANCE_ROUND` moves to the next index.
- `TRIGGER_REVEAL` is only valid when `roundState === 'prediction'`.

**Main module component (`DilationsModule.tsx`):**
- Wraps `DilationsCanvas` + HUD overlay (HTML)
- Reads stage state, passes relevant props to child components
- HUD includes: prompt text area, round navigation (Next button), phase indicator
- Prompt text is round-specific (defined per `RoundConfig`)
- "Next" button visible only in `completion` state
- Phase transitions show a brief interstitial text (1-2 sentences)

**HUD overlay (`DilationsHUD.tsx`):**
- Positioned over the canvas (absolute/fixed)
- Contains: prompt text (top), navigation (bottom-right), phase/round indicator (top-right, small)
- Prompt text updates per round from a `ROUND_PROMPTS` map
- "Reveal" button: visible in `prediction` state (Phase 1-2 rounds with ghost drag)
- "Next" button: visible in `completion` state
- "Check" button: visible in `prediction` state (Phase 3-4 rounds with SequenceBuilder)

### Technical Details
- Use `@react-three/fiber` Canvas with `orthographic` prop
- Use `@react-three/drei` for `OrthographicCamera`, `Grid` (or custom grid)
- Stage machine implemented as `useReducer` — not `useState` chains
- HUD is React DOM rendered outside the Canvas (not in R3F scene)
- Grid rendered as R3F `<Line>` segments or a custom grid mesh

### Component Structure
```
src/components/modules/dilations/
├── DilationsModule.tsx     # Main orchestrator
├── DilationsCanvas.tsx     # R3F Canvas + camera + grid
├── DilationsHUD.tsx        # HTML overlay (prompts, navigation)
├── hooks/
│   └── useDilationsStage.ts  # Stage machine (useReducer)
```

### Constraints
- No round-specific rendering logic yet — just the shell
- Canvas should render the grid + origin + pre-image triangle (static) as a baseline
- HUD should show placeholder prompt text and disabled navigation buttons
- Stage machine must handle all 14 rounds even though round-specific components come later
- Do NOT render coordinates or angle labels in this prompt — those are gated by stage state

### Integration Points
- **Consumes from Prompt 1:** Types (`RoundId`, `RoundState`, `PhaseId`, `StageState`), constants (`ROUND_SEQUENCE`, `ROUND_CONFIGS`, `CANONICAL_TRIANGLE`), `labTokens`
- **Produces for later prompts:** `DilationsCanvas` (child components render inside it), `useDilationsStage` (all prompts read stage state), `DilationsHUD` (later prompts add buttons/displays)
- **Round transitions:** Stage machine's `ADVANCE_ROUND` action drives all transitions. Later prompts define what renders per round.

---

## Prompt 3: Shared Interaction Primitives

### Rounds Implemented
None directly — but these primitives are consumed by Prompts 4–8.

### Context
Module 2 reuses significant infrastructure from Module 1: ghost triangle, predict/reveal loop, GSAP reveal animation, SpriteLabel. This prompt adapts those primitives for dilation (adding proportional ghost sizing, scaling animations). If M1 components exist in the codebase, import and extend. If not, build minimal versions.

### Requirements

**Ghost triangle (`GhostTriangle.tsx`):**
- Renders a semi-transparent triangle that follows pointer during drag
- Props: `vertices: Triangle`, `scale: number` (for proportional sizing — ghost matches target scale), `onDrop: (position: Vec2) => void`, `disabled: boolean`
- Visual: semi-transparent fill (opacity ~0.3), dashed outline stroke
- Drag behavior: pointer down starts drag, triangle center follows pointer mapped to grid coords, snaps to nearest 0.5 grid unit, pointer up fires `onDrop`
- Must work within R3F canvas (use `@react-three/fiber` pointer events or drei `useDrag`)

**Predict/reveal controller (`usePredictReveal.ts`):**
- Custom hook managing the predict → reveal cycle
- Input: `targetTriangle: Triangle`, `tolerance: number`
- State: `ghostPosition`, `isPredicted`, `isRevealed`, `accuracy: 'exact' | 'close' | 'miss'`
- Actions: `placeGhost(pos)`, `commitPrediction()`, `triggerReveal()`, `reset()`
- Accuracy check: compares ghost-placed triangle to target triangle using `trianglesMatch` from Prompt 1
- Integrates with stage machine: `commitPrediction` → sets roundState to `prediction`, `triggerReveal` → sets roundState to `reveal`

**Reveal animation (`RevealAnimation.tsx`):**
- GSAP-powered animation showing the correct image triangle appearing
- Props: `targetTriangle: Triangle`, `onComplete: () => void`, `showRays: boolean`, `rayOrigin: Vec2`
- Animation sequence (total ~1.5s):
  1. Image triangle fades in at correct position (0.3s, power2.out)
  2. If `showRays`: ray-from-origin dashed lines animate from origin outward through each vertex (0.5s)
  3. Ghost fades out (0.3s)
  4. Calls `onComplete` when done
- Image triangle: solid fill, distinct color from pre-image

**SpriteLabel (`SpriteLabel.tsx`):**
- Text label rendered in R3F scene (using drei `<Html>` or `<Text>`)
- Props: `position: Vec2`, `text: string`, `color?: string`, `visible?: boolean`
- Used for: vertex labels (A, B, C / A', B', C'), coordinate labels (Phase 2+), ratio annotations, angle labels (Phase 4)
- Must support dynamic text updates (coordinates change with scale factor)

**Pre-image triangle (`PreImageTriangle.tsx`):**
- Static rendering of the canonical triangle A(1,1) B(4,2) C(2,4)
- Props: `vertices: Triangle`, `showCoordinates: boolean`, `showAngles: boolean`, `coordinateLabels?: string[]`, `angleLabels?: number[]`
- Solid fill, labeled vertices (SpriteLabel)
- Coordinate labels: hidden by default, shown when `coordinatesVisible` in stage state
- Angle labels: hidden by default, shown when `angleLabelsVisible` in stage state

**Image triangle (`ImageTriangle.tsx`):**
- Renders the dilated/transformed image
- Props: `vertices: Triangle`, `showCoordinates: boolean`, `showAngles: boolean`, `visible: boolean`, `opacity?: number`
- Same structure as PreImageTriangle but with image-specific styling (different color)
- `visible` controlled by stage state (appears during reveal)

### Technical Details
- Ghost drag uses R3F pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp` on a plane)
- GSAP animations: use `gsap.to()` with refs to R3F mesh positions/opacity. Import GSAP in component.
- SpriteLabel: prefer drei `<Html>` for crisp text, or `<Text>` from drei for in-scene text
- Snap to grid: `Math.round(value * 2) / 2` for 0.5 increments

### Component Structure
```
src/components/modules/dilations/
├── components/
│   ├── GhostTriangle.tsx
│   ├── RevealAnimation.tsx
│   ├── SpriteLabel.tsx
│   ├── PreImageTriangle.tsx
│   └── ImageTriangle.tsx
├── hooks/
│   ├── useDilationsStage.ts   # (from Prompt 2)
│   └── usePredictReveal.ts
```

### Constraints
- Ghost triangle must NOT be interactive when `disabled` (during reveal, completion, or SequenceBuilder rounds)
- Reveal animation must complete before stage machine transitions to `completion` — no skipping
- SpriteLabel must handle overlapping positions gracefully (offset if two labels would collide)
- No round-specific logic in these primitives — they're parameterized and controlled by the stage machine

### Integration Points
- **Consumes from Prompt 1:** `Triangle`, `Vec2`, `pointsMatch`, `trianglesMatch`, `dilateTriangle`, `labTokens`
- **Consumes from Prompt 2:** `useDilationsStage` (stage state for visibility flags), `DilationsCanvas` (components render inside it)
- **Produces for Prompts 4–8:** `GhostTriangle`, `usePredictReveal`, `RevealAnimation`, `SpriteLabel`, `PreImageTriangle`, `ImageTriangle`
- **Round transitions:** `usePredictReveal.triggerReveal()` → `RevealAnimation.onComplete()` → stage machine `COMPLETE_ROUND`

---

## Prompt 4: Scale Factor Exploration (Phase 1, Part 1)

### Rounds Implemented
`dilate-k2`, `dilate-k2-properties`, `dilate-k3`

### Context
First three rounds of Phase 1: Scale Factor Intuition. ALD target: L3. Students predict dilation positions spatially (no coordinates), then observe preserved properties. This is the entry point for the module — students see the familiar M1 triangle and discover what dilation does. The sub-arc pattern: spatial discovery (`dilate-k2`) → earned property observation (`dilate-k2-properties`) → confirmation (`dilate-k3`).

### Requirements

**Scale factor display (`ScaleFactorDisplay.tsx`):**
- Shows current k value prominently: "k = 2"
- Phase 1: display-only (not interactive)
- Positioned in HUD overlay (not in R3F scene)
- Updates per round

**Ray-from-origin lines (`RayLines.tsx`):**
- Renders dashed lines from origin (0,0) through each pre-image vertex, extending to the image vertex
- Props: `preImage: Triangle`, `image: Triangle`, `visible: boolean`, `animating: boolean`
- 3 rays total (one per vertex pair)
- GSAP animation: rays grow outward from origin (draw-on effect, 0.5s)
- Color: `labTokens.textDim` (subtle, not competing with triangles)
- Dashed: `dashSize: 0.15, gapSize: 0.1`

**Ratio annotations (`RatioAnnotations.tsx`):**
- Color-coded labels at midpoint of each side pair
- Props: `preImage: Triangle`, `image: Triangle`, `ratio: number`, `visible: boolean`
- 3 annotation pairs (one per side)
- Each pair shares a color (use 3 distinct colors from lab palette)
- Format: "2:1" for k=2, "3:1" for k=3
- GSAP: fade in after ray lines settle

**Angle marks (`AngleMarks.tsx`):**
- Small arc marks at each vertex of both triangles
- Props: `triangles: Triangle[]`, `visible: boolean`
- Drawn as small arc segments at each vertex
- Same color for corresponding angles across pre-image and image
- Shows that angles are preserved despite size change

**Round orchestration:**

For `dilate-k2`:
- Entry: Pre-image at origin. Ghost (2x size). ScaleFactorDisplay: "k = 2". Prompt: "The triangle will double in size from the origin. Where will it land?"
- Active: Ghost follows pointer. Student drags to predicted position.
- Prediction: Ghost placed. Reveal button appears.
- Reveal: RevealAnimation with `showRays: true`. Image appears at dilateTriangle(CANONICAL, 2). Rays animate. Ghost fades.
- Completion: Both triangles + rays visible. Next button.

For `dilate-k2-properties`:
- Entry: Both triangles from previous round persist. Prompt: "What stayed the same?"
- Active: Ratio annotations animate in (2:1 for each side). Angle marks appear on both triangles. Earned reveal text: "The shape grew but the angles didn't change."
- Completion: All annotations visible. Next button.

For `dilate-k3`:
- Entry: Scene resets. Ghost (3x size). ScaleFactorDisplay: "k = 3". Prompt: "Now k = 3. Where will it land?"
- Active/Prediction/Reveal: Same pattern as dilate-k2 but with k=3. Rays extend further. Ratio: 3:1.
- Completion: Pattern strengthened. Next button.

### Visual Scaffolding
- `dilate-k2`: Ray-from-origin dashed lines during reveal — visual proof dilation moves points along rays
- `dilate-k2-properties`: Color-coded 2:1 ratio annotations + angle marks on both triangles
- `dilate-k3`: Rays extend further (3x). Ratio annotations: 3:1

### Technical Details
- Ghost triangle size: `GhostTriangle` receives `scale` prop matching the round's k value. The ghost is pre-sized — student only positions it.
- Ray lines: R3F `<Line>` from drei, with dashed material. GSAP animates the `dashOffset` or clips the line geometry to create draw-on effect.
- Ratio annotations: `SpriteLabel` positioned at side midpoints. Colors: pick 3 from lab palette (e.g., `labTokens.accent`, `labTokens.info`, `labTokens.warning`).
- Angle marks: small arc geometry at each vertex. Use `THREE.BufferGeometry` with arc points.
- Round reset between dilate-k2-properties → dilate-k3: clear image, rays, annotations. Reset ghost.

### States Per Round

**dilate-k2:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image + ghost (2x) + origin + "k=2" | Drag ghost |
| Active | Ghost follows pointer | Position ghost |
| Prediction | Ghost placed, Reveal button | Click Reveal or reposition |
| Reveal | Image appears + rays animate | Observe |
| Completion | Both triangles + rays | Click Next |

**dilate-k2-properties:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Both triangles from k=2 | Observe |
| Active | Ratio annotations + angle marks animate in | Observe |
| Completion | All annotations + earned reveal text | Click Next |

**dilate-k3:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image + ghost (3x) + "k=3" | Drag ghost |
| Active | Ghost follows pointer | Position ghost |
| Prediction | Ghost placed, Reveal button | Click Reveal or reposition |
| Reveal | Image at 3x + rays + ratio 3:1 | Observe |
| Completion | Pattern confirmed | Click Next |

### Constraints
- No coordinates visible in any of these rounds — `coordinatesVisible` is false
- No angle labels (degree values) — those come in Phase 4. Angle marks here are visual indicators only (arcs, not numbers)
- Ghost is pre-sized to the target scale — student does NOT resize it
- Ratio annotations appear only in property/summary rounds, not during initial prediction

### Integration Points
- **Consumes from Prompt 1:** `dilateTriangle`, `CANONICAL_TRIANGLE`, `Triangle`, `Vec2`, `sideRatio`, `labTokens`
- **Consumes from Prompt 2:** `useDilationsStage`, `DilationsCanvas`, `DilationsHUD`
- **Consumes from Prompt 3:** `GhostTriangle`, `usePredictReveal`, `RevealAnimation`, `SpriteLabel`, `PreImageTriangle`, `ImageTriangle`
- **Produces for Prompt 5:** `ScaleFactorDisplay`, `RayLines`, `RatioAnnotations`, `AngleMarks` (reused for k=½)
- **Round transitions:** `dilate-k2` → `dilate-k2-properties` (seamless, same scene), `dilate-k2-properties` → `dilate-k3` (scene reset), `dilate-k3` → Prompt 5's `dilate-k-half`

---

## Prompt 5: Fractional Scale Factors (Phase 1, Part 2)

### Rounds Implemented
`dilate-k-half`, `dilate-summary`

### Context
Completes Phase 1. ALD target: L3 (completes). The k=½ round is the key surprise — dilation doesn't always enlarge. The summary round consolidates all scale factor observations into the L3 earned answer. After this prompt, students can describe the effect of dilations spatially.

### Requirements

**Round orchestration:**

For `dilate-k-half`:
- Entry: Pre-image at origin. Ghost is **smaller** than pre-image (½ size). ScaleFactorDisplay: "k = ½". Prompt: "k = ½. What do you think that means?"
- Active: Smaller ghost follows pointer. Student must place it between origin and pre-image.
- Prediction: Ghost placed. Reveal button.
- Reveal: Image lands between origin and pre-image. Rays show half-distance. RevealAnimation with `showRays: true`. Ratio annotations: 1:2.
- Completion: Mental model updated. "Dilation with k < 1 shrinks toward the center."

For `dilate-summary`:
- Entry: Summary state. All three images displayed together: k=2 (faded), k=3 (faded), k=½ (faded). Alternatively, cycle through them. Pattern text: "k > 1 enlarges. 0 < k < 1 reduces. Angles always preserved."
- Completion: L3 earned answer complete. Next advances to Phase 2 (coord-k2). Phase transition interstitial: "You've mastered where dilations land. Now let's see the numbers behind it."

**Summary visualization (`DilationSummary.tsx`):**
- Shows pre-image + all three dilated images simultaneously (or in quick succession)
- Each image at reduced opacity to avoid visual noise
- Pattern text overlay: "k > 1 enlarges. 0 < k < 1 reduces. Angles always preserved."
- This is a read-only display — no interaction

### Visual Scaffolding
- `dilate-k-half`: Rays show image vertices between origin and pre-image. Ratio: 1:2.
- `dilate-summary`: No new visuals. Summary state using existing triangles at reduced opacity.

### Technical Details
- Ghost at k=½: `GhostTriangle` with `scale: 0.5`. Ghost is visibly smaller than the pre-image — this is the first visual hint that something is different.
- Summary visualization: render 3 `ImageTriangle` instances at opacity 0.3, one for each k value. Pre-image at full opacity.
- Phase transition: after `dilate-summary` completion, `ADVANCE_ROUND` moves to `coord-k2`. Stage machine flips `coordinatesVisible` to `true`.

### States Per Round

**dilate-k-half:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image + smaller ghost + "k = ½" prompt | Pause, think, then drag |
| Active | Smaller ghost follows pointer | Position ghost (closer to origin) |
| Prediction | Ghost placed between origin and pre-image | Click Reveal |
| Reveal | Image at half-distance + rays + ratio 1:2 | Observe |
| Completion | "Dilation can shrink too" | Click Next |

**dilate-summary:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | All three images + pattern text | Read, absorb |
| Completion | L3 complete. Phase transition text. | Click Next → Phase 2 |

### Constraints
- k=½ ghost MUST be visibly smaller than the pre-image — this is the pedagogical surprise
- Summary round has no prediction or reveal — it's a pause state
- Phase transition interstitial must appear before coord-k2 starts

### Integration Points
- **Consumes from Prompt 1:** `dilateTriangle`, `CANONICAL_TRIANGLE`, scale factor constants
- **Consumes from Prompt 4:** `ScaleFactorDisplay`, `RayLines`, `RatioAnnotations`, `AngleMarks`
- **Consumes from Prompt 3:** `GhostTriangle`, `usePredictReveal`, `RevealAnimation`, `PreImageTriangle`, `ImageTriangle`
- **Produces for Prompt 6:** Phase transition trigger (`coordinatesVisible` flips on)
- **Round transitions:** `dilate-k-half` → `dilate-summary` (scene transition to summary view), `dilate-summary` → `coord-k2` (Phase 1→2 transition with interstitial)

---

## Prompt 6: Coordinate Dilation (Phase 2)

### Rounds Implemented
`coord-k2`, `coord-k-half`, `coord-k-third`

### Context
Phase 2: Coordinate Dilation. ALD target: L4. The earned reveal — coordinates appear for the first time. Students see the coordinate rule emerge across multiple scale factors. FormulaReadout shows (x,y)→(kx,ky) with substituted values, then generalizes. This is where spatial understanding becomes algebraic understanding.

### Requirements

**FormulaReadout (`FormulaReadout.tsx`):**
- HTML overlay component (not in R3F scene) — positioned below or beside canvas
- Props: `scaleFactor: number`, `preImage: Triangle`, `image: Triangle`, `generalized: boolean`
- Specific mode: "(1,1) → (2,2)   (4,2) → (8,4)   (2,4) → (4,8)" and "(x,y) → (2x, 2y)"
- Generalized mode: "(x,y) → (kx, ky)" — appears in `coord-k-third`
- Monospace font for coordinate values
- Animate in: fade + slight slide up (GSAP, 0.3s)

**Coordinate labels on triangles:**
- `PreImageTriangle` and `ImageTriangle` now render with `showCoordinates: true`
- Format: "A(1,1)", "A'(2,2)"
- During reveal in `coord-k2`: coordinates appear one vertex at a time (A first, then B, then C — staggered 0.3s each)
- This staggered reveal prevents coordinate overload (identified in UX spec Pass 4)

**Round orchestration:**

For `coord-k2`:
- Entry: **Coordinates appear.** Pre-image with labels A(1,1), B(4,2), C(2,4). Ghost (2x). ScaleFactorDisplay: "k = 2". Prompt: "Now let's see the numbers. k = 2 again."
- Active/Prediction: Student drags ghost (already knows where from Phase 1).
- Reveal: Image appears with staggered coordinate labels. FormulaReadout: "(x,y) → (2x, 2y)" with substituted values.
- Completion: "Every coordinate multiplied by 2." Next button.

For `coord-k-half`:
- Entry: Pre-image with coordinates. Ghost (½ size). Prompt: "k = ½ with coordinates."
- Active/Prediction/Reveal: Same loop. FormulaReadout: "(x,y) → (½x, ½y)". Fractional coordinates: A'(0.5, 0.5).
- Completion: "Same rule — multiply by k — even for fractions." Next button.

For `coord-k-third`:
- Entry: Pre-image with coordinates. Ghost (⅓ size). Prompt: "k = ⅓. Can you predict the coordinates before checking?"
- Active/Prediction/Reveal: Same loop. FormulaReadout **generalizes**: "(x,y) → (kx, ky)".
- Completion: Earned reveal — the general formula. L4 demonstrated. Phase transition text: "You can describe dilations with coordinates. Now let's see what 'similar' really means."

### Visual Scaffolding
- `coord-k2`: Vertex labels show pre-image and image coords. FormulaReadout substitutes actual values.
- `coord-k-half`: FormulaReadout shows fractional multiplication.
- `coord-k-third`: FormulaReadout generalizes to (x,y) → (kx, ky).

### Technical Details
- FormulaReadout is HTML overlay (React DOM), not R3F. Use `labTokens.text` for color, monospace font.
- Staggered coordinate reveal: GSAP timeline with 0.3s stagger on SpriteLabel opacity.
- No rays in Phase 2 — that scaffolding has been internalized. Only coordinates + FormulaReadout are new.
- Ghost drag still active in Phase 2 rounds — students predict with coordinate awareness.

### States Per Round

**coord-k2:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image WITH coordinates + ghost + "k=2" | Drag ghost |
| Active | Ghost follows pointer. Coordinates visible. | Position ghost |
| Prediction | Ghost placed. Reveal button. | Click Reveal |
| Reveal | Image + staggered coord labels + FormulaReadout "(x,y)→(2x,2y)" | Observe |
| Completion | Both triangles with full coordinates + formula | Click Next |

**coord-k-half:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image + coords + smaller ghost + "k=½" | Drag ghost |
| Reveal | Fractional coords + FormulaReadout "(x,y)→(½x,½y)" | Observe |
| Completion | Fractional rule confirmed | Click Next |

**coord-k-third:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Pre-image + coords + "k=⅓. Predict the coordinates." | Think, then drag |
| Reveal | FormulaReadout generalizes: "(x,y) → (kx, ky)" | Observe |
| Completion | General formula earned. L4 complete. Phase transition. | Click Next → Phase 3 |

### Constraints
- Coordinates MUST appear at the start of `coord-k2` — not earlier. This is the earned reveal.
- FormulaReadout generalizes ONLY in `coord-k-third` — specific substitutions in earlier rounds
- No ray-from-origin lines in Phase 2 — that scaffolding is removed
- Staggered coordinate reveal in `coord-k2` only (subsequent rounds show all at once — the novelty has passed)

### Integration Points
- **Consumes from Prompt 1:** `dilateTriangle`, `CANONICAL_TRIANGLE`, types
- **Consumes from Prompt 2:** Stage machine (now `coordinatesVisible === true`)
- **Consumes from Prompt 3:** `GhostTriangle`, `usePredictReveal`, `RevealAnimation`, `PreImageTriangle`, `ImageTriangle` (now with `showCoordinates: true`), `SpriteLabel`
- **Produces for Prompt 7:** `FormulaReadout` (may be referenced in similarity context), coordinate-aware triangles
- **Round transitions:** `coord-k-third` → `similarity-guided` (Phase 2→3 transition: scene changes from single triangle + dilation to two triangles + SequenceBuilder)

---

## Prompt 7: Similarity Sequences (Phase 3)

### Rounds Implemented
`similarity-guided`, `similarity-rigid-dilation`, `similarity-inverse`

### Context
Phase 3: Similarity = Rigid Motion + Dilation. ALD target: L4–L5. The major interaction shift — ghost drag is replaced by the SequenceBuilder. Students compose rigid motions (from M1) with dilations to map similar figures onto each other. The earned reveal: "similar" means there exists such a sequence. This bridges M1 and M2.

### Requirements

**SequenceBuilder (`SequenceBuilder.tsx`):**
- Panel component (HTML overlay, docked to right side of canvas on desktop)
- Shows available transformation step cards: Translate, Reflect, Rotate, **Dilate** (new)
- Each card is clickable to add to the sequence
- Added steps appear in a vertical list with:
  - Step label (e.g., "1. Translate")
  - Configuration controls inline:
    - Translate: dx, dy number inputs
    - Reflect: axis selector (x / y)
    - Rotate: angle input (degrees)
    - Dilate: k slider or number input
  - Remove button (X)
  - Drag handle for reorder
- Live preview: after each step configuration change, compute `composeTriangle(steps, preImage)` and update a preview ghost in the canvas
- "Check" button at bottom: validates if composed result matches target within tolerance
- "Reset" button: clears all steps

**Preview ghost for SequenceBuilder (`SequencePreview.tsx`):**
- Renders in R3F canvas — shows the result of the current sequence applied to the pre-image
- Updates in real-time as steps are configured
- Semi-transparent, dashed outline (similar to Phase 1-2 ghost but not draggable)
- When sequence is valid: preview aligns with target (visual confirmation before Check)

**Similarity task data (`src/components/modules/dilations/utils/similarityTasks.ts`):**
- Pre-defined similar/non-similar triangle pairs for each round
- `similarity-guided`: pair where translate + dilate works (simplest case)
- `similarity-rigid-dilation`: pair requiring reflect/rotate + dilate
- `similarity-inverse`: pair with no guidance — student must determine the full sequence
- Each pair includes `validSequences` — multiple correct answers
- Pairs use the canonical triangle as pre-image, with transformed targets

**Similarity definition overlay:**
- Appears in `similarity-inverse` completion state
- Text: "Two figures are similar if there exists a sequence of rigid motions and a dilation that maps one onto the other."
- Styled as an earned reveal — distinct background, key text highlighted

**Round orchestration:**

For `similarity-guided`:
- Entry: **Scene change.** Two triangles: pre-image (left) and similar target (right, different size). Side length annotations on both. Angle marks showing congruent angles. SequenceBuilder panel appears. Prompt: "These look alike but aren't the same size. Try: translate, then dilate."
- Active: Student adds Translate step, configures dx/dy. Preview updates. Adds Dilate step, configures k. Preview aligns with target.
- Prediction: Sequence built. Check button available.
- Reveal: If correct — smooth GSAP animation showing sequence applied step-by-step. Pre-image transforms through each step until it overlaps target. If incorrect — mismatch highlighted (preview and target shown side by side, gap visible). Student can adjust.
- Completion: "Rigid motion + dilation = figures overlap." Next.

For `similarity-rigid-dilation`:
- Entry: New pair requiring reflection/rotation + dilation. Prompt: "Translation won't work this time. What else from Module 1 can you use?"
- Active/Prediction/Reveal: Same SequenceBuilder loop. Student discovers non-translation rigid motions + dilation.
- Completion: "Similarity can involve ANY rigid motion, not just translation." Next.

For `similarity-inverse`:
- Entry: New pair. No guidance text. Prompt: "Your turn. Find the sequence."
- Active/Prediction/Reveal: Student works independently.
- Completion: Success → similarity definition overlay appears. Earned reveal: the formal definition of similarity. Phase transition text: "There's a shortcut to knowing if two triangles are similar..."

### Visual Scaffolding
- `similarity-guided`: Both triangles with side length annotations + angle marks. SequenceBuilder panel.
- `similarity-rigid-dilation`: SequenceBuilder with all options. Live preview ghost.
- `similarity-inverse`: Success state highlights similarity definition.

### Technical Details
- SequenceBuilder is HTML (React DOM), not R3F. Positioned as an overlay panel.
- Preview ghost is R3F — computed by `composeTriangle(steps, preImage)` on every step change.
- Sequence validation: `trianglesMatch(composed, target, PREDICTION_TOLERANCE)`.
- Multiple valid sequences: any sequence that maps pre-image to target within tolerance is accepted.
- Step-by-step reveal animation: GSAP timeline, 0.5s per step. Pre-image clone animates through each transformation.
- Two-triangle layout: pre-image at x ∈ [0, 6], target at x ∈ [8, 14] (adjust camera bounds if needed).

### States Per Round

**similarity-guided:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Two triangles + annotations + SequenceBuilder + guided prompt | Add steps to SequenceBuilder |
| Active | Steps being configured, preview updates | Configure, reorder, remove steps |
| Prediction | Sequence complete, Check button | Click Check |
| Reveal | Step-by-step animation (or mismatch) | Observe (or adjust) |
| Completion | Figures aligned | Click Next |

**similarity-rigid-dilation:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | New pair + "translation won't work" prompt | Build sequence |
| Active/Prediction/Reveal | Same as above | Same |
| Completion | Broadened understanding | Click Next |

**similarity-inverse:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | New pair + "Your turn" | Build sequence independently |
| Active/Prediction/Reveal | Same as above, no guidance | Same |
| Completion | Similarity definition overlay | Click Next → Phase 4 |

### Constraints
- Ghost drag is DISABLED in all Phase 3 rounds — SequenceBuilder is the only interaction
- SequenceBuilder must accept multiple valid sequences — don't require a specific order
- Preview ghost updates on every step configuration change (debounce at 100ms for performance)
- Side length annotations use absolute lengths, not ratios (distinct from Phase 1)
- Coordinate labels remain visible (from Phase 2) but are not emphasized

### Integration Points
- **Consumes from Prompt 1:** `composeTransformations`, `composeTriangle`, `trianglesMatch`, all transform primitives, `TransformStep` types
- **Consumes from Prompt 2:** Stage machine, canvas, HUD
- **Consumes from Prompt 3:** `PreImageTriangle`, `ImageTriangle`, `SpriteLabel`, `AngleMarks`
- **Produces for Prompt 8:** `SequenceBuilder` (reused in AA/capstone rounds), `SequencePreview`, similarity task pattern
- **Round transitions:** `similarity-inverse` → `aa-discover` (Phase 3→4: angle labels appear, scene shifts to angle comparison)

---

## Prompt 8: AA Discovery & Capstone (Phase 4)

### Rounds Implemented
`aa-discover`, `aa-confirm`, `capstone-final`

### Context
Phase 4: AA Discovery & Capstone. ALD target: L5. Computed angle labels appear for the first time. Students discover the AA criterion through observation, confirm it against non-similar pairs, then complete a multi-pair capstone integrating all Module 2 concepts. CelebrationModal on completion.

### Requirements

**Computed angle labels (`AngleLabels.tsx`):**
- Renders degree measures at each vertex of a triangle
- Props: `triangle: Triangle`, `offsetDirection?: 'outside'`, `matchColors?: Map<number, string>` (maps degree value to color for cross-triangle matching)
- Computed via `triangleAngles()` from Prompt 1
- Positioned slightly outside the triangle at each vertex
- Color-matching: equal angles across two triangles share a color. Non-matching angles get neutral color.
- GSAP: fade in when first shown (Phase 4 entry)

**AA comparison view (`AAComparisonView.tsx`):**
- Shows two triangles side by side with angle labels
- Color-matches equal angles across both triangles
- Props: `triangle1: Triangle`, `triangle2: Triangle`, `highlightMatches: boolean`
- When `highlightMatches`: compute angle sets, find matches, assign shared colors
- Matching threshold: angles within 1° are considered equal (floating-point tolerance)

**AA criterion statement:**
- Earned reveal text appearing in `aa-discover` completion
- "Two matching angles is enough. If two pairs of angles are equal, the triangles are similar."
- Styled as earned reveal — same treatment as similarity definition in Prompt 7

**Capstone pair navigator (`CapstonePairNavigator.tsx`):**
- Manages multiple triangle pairs, presented one at a time
- Props: `pairs: CapstonePair[]`, `onAllComplete: () => void`
- For each pair: angle labels visible, SequenceBuilder available
- Student workflow per pair:
  1. Observe angle labels → determine if similar (AA check)
  2. If similar: build transformation sequence → Check
  3. If not similar: select "Not Similar" → confirmed
- Tracks completion per pair. Advances to next pair on success.
- Calls `onAllComplete` when all pairs done

**CelebrationModal (`CelebrationModal.tsx`):**
- Full-screen overlay triggered on capstone completion
- DiscoveryTab: 4 sections summarizing the full module journey:
  1. "Scale Factor Intuition" — visual of k=2 dilation + "k controls distance from center"
  2. "Coordinate Rule" — FormulaReadout showing (x,y)→(kx,ky)
  3. "Similarity" — two aligned triangles + definition
  4. "AA Criterion" — color-matched angle labels + "Two matching angles = similar"
- Close/Done button
- Celebratory animation (confetti or radial burst — keep lightweight)

**Capstone task data:**
- 3–4 triangle pairs for the capstone:
  - Pair 1: Similar (easy — translate + dilate). AA: 2+ angles match.
  - Pair 2: Similar (harder — reflect + dilate). AA: 2 angles match.
  - Pair 3: Not similar. AA: 0 or 1 angle match. SequenceBuilder will fail.
  - Pair 4 (optional): Similar with non-obvious sequence. Stretch.

**Round orchestration:**

For `aa-discover`:
- Entry: **Angle labels appear for the first time.** Two similar triangles with computed angle labels at each vertex. Matching angles color-coded. Prompt: "Look at the angles. What do you notice?"
- Active: Student observes all three angle pairs match. Then a second sub-pair shown where only two angles match but triangles are still similar.
- Completion: Earned reveal: "Two matching angles is enough." AA criterion stated.

For `aa-confirm`:
- Entry: Two non-similar triangles with angle labels. Non-matching angles in distinct/neutral colors. Prompt: "Are these similar?"
- Active: Student may attempt SequenceBuilder — it cannot produce a valid mapping. Angles don't match.
- Completion: "AA works both ways. Non-matching angles = not similar."

For `capstone-final`:
- Entry: Capstone challenge. First pair presented with angle labels + SequenceBuilder. Prompt: "Final challenge. For each pair: are they similar? If so, build the sequence."
- Active: Student works through pairs sequentially (CapstonePairNavigator).
- Per pair: AA check → sequence build (if similar) → validate. Or "Not Similar" selection.
- Completion: All pairs done → CelebrationModal with DiscoveryTab.

### Visual Scaffolding
- `aa-discover`: Angle labels at vertices. Matching angles in same color across triangles.
- `aa-confirm`: Non-matching angles in distinct colors. SequenceBuilder fails.
- `capstone-final`: CelebrationModal with DiscoveryTab showing the full module journey.

### Technical Details
- Angle computation: `triangleAngles()` returns 3 angles in degrees. Use `angleDeg()` from Prompt 1.
- Color matching: sort both triangles' angles, find pairs within 1° threshold, assign colors from a palette of 3 distinct colors. Non-matches get `labTokens.textDim`.
- CelebrationModal: HTML overlay (React DOM). DiscoveryTab uses a simple tab/accordion UI.
- Capstone pairs: defined as `CapstonePair[]` in constants. Each includes pre-computed angle labels.
- `aa-discover` has a sub-pair transition: first pair (3 matching angles) → second pair (2 matching). This is within a single round — use internal state, not a new round.

### States Per Round

**aa-discover:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Two similar triangles + angle labels (color-matched) | Observe |
| Active | First pair: all 3 match. Then second pair: only 2 match, still similar. | Observe pattern |
| Completion | AA criterion earned reveal text | Click Next |

**aa-confirm:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | Non-similar triangles + mismatched angle labels | Observe, attempt SequenceBuilder |
| Active | SequenceBuilder cannot find valid mapping | Try and fail (productively) |
| Completion | "Non-matching angles = not similar" | Click Next |

**capstone-final:**
| State | User Sees | User Can Do |
|-------|-----------|-------------|
| Entry | First pair + angle labels + SequenceBuilder | AA check, build sequence |
| Active (per pair) | Current pair, tools available | Work through pair |
| Reveal (per pair) | Confirmation or mismatch per pair | Advance to next pair |
| Completion | CelebrationModal | Dismiss |

### Constraints
- Angle labels appear ONLY starting at `aa-discover` — never before Phase 4
- Color matching must be automatic — students observe, not manually compare
- CelebrationModal appears exactly once, at capstone completion
- Capstone pairs are presented ONE AT A TIME (not all simultaneously — reduces cognitive load)
- SequenceBuilder in `aa-confirm` must be usable but will fail — don't block the attempt

### Integration Points
- **Consumes from Prompt 1:** `triangleAngles`, `angleDeg`, `composeTriangle`, `trianglesMatch`, types
- **Consumes from Prompt 7:** `SequenceBuilder`, `SequencePreview`, similarity validation pattern
- **Consumes from Prompt 3:** `PreImageTriangle`, `ImageTriangle`, `SpriteLabel`
- **Produces:** Module completion. No subsequent round-mapped prompts.
- **Round transitions:** `capstone-final` completion → CelebrationModal → module complete

---

## Prompt 9: Polish & Transitions

### Rounds Implemented
None — cross-cutting polish across all 14 rounds.

### Context
Refines the transitions between rounds and phases, adds idle detection/hint system, and polishes animations. The UX spec identified 13 round transitions and 3 major phase transitions that need smooth handling.

### Requirements

**Phase transition interstitials:**
- Phase 1→2 (`dilate-summary` → `coord-k2`): "You've mastered where dilations land. Now let's see the numbers behind it." Coordinates icon or visual hint.
- Phase 2→3 (`coord-k-third` → `similarity-guided`): "You can describe dilations with coordinates. Now let's see what 'similar' really means." Scene morphs from single triangle to two-triangle layout.
- Phase 3→4 (`similarity-inverse` → `aa-discover`): "There's a shortcut to knowing if two triangles are similar..." Angle icon or protractor hint.
- Implementation: overlay card (HTML), 2-3 seconds display, auto-dismiss or click-to-advance.

**Idle detection and hint system:**
- If student takes no action for 15 seconds in an `active` state → show contextual hint
- Hints per round type:
  - Ghost drag rounds: "Try dragging the faded triangle to where you think it will land."
  - SequenceBuilder rounds: "Try adding a transformation step from the panel on the right."
  - Observation rounds: "Look at the numbers. What pattern do you notice?"
- Hint appears as subtle text below the prompt, fades in with GSAP
- Dismisses automatically when student takes any action

**Round transition animations:**
- Within-phase transitions: 0.3s crossfade. Old round elements fade out, new round elements fade in.
- Ghost reset: when advancing to a new prediction round, ghost reappears at default position (centered on pre-image)
- Scene reset: between rounds that change the triangle configuration, 0.5s transition with old triangles fading out, new appearing

**Reveal animation polish:**
- Ensure all reveal animations have consistent timing (1.5s total)
- Add slight scale bounce on image triangle landing (overshoot 1.05x, settle to 1.0x, 0.3s)
- Ray-from-origin draw-on: animate `strokeDashoffset` for growing-line effect
- Staggered coordinate labels in `coord-k2`: 0.3s between each vertex

**Performance optimization:**
- Dispose of GSAP timelines when components unmount (`useEffect` cleanup)
- Memoize `composeTriangle` results in SequenceBuilder (recalculate only when steps change)
- Use `React.memo` on static triangle renderers (PreImageTriangle when coordinates haven't changed)
- Limit R3F re-renders: use refs for animated properties, not state

### Technical Details
- Phase interstitials: absolutely positioned div over canvas, z-index above HUD
- Idle detection: `useRef` for timeout, reset on any pointer/keyboard event within the canvas
- GSAP cleanup: `tl.kill()` in `useEffect` return function
- React.memo: apply to `PreImageTriangle`, `ImageTriangle`, `SpriteLabel` with appropriate dependency checks

### Constraints
- Interstitials must not block more than 3 seconds (don't frustrate impatient students)
- Hints should never appear during reveal animations (distracting)
- Performance: target 60fps on mid-range devices. Profile GSAP timelines if frame drops occur.

### Integration Points
- **Touches all previous prompts:** Adds animations/transitions between all rounds
- **No new components:** Enhances existing components from Prompts 2–8
- **Round transitions:** All 13 transitions from UX spec Pass 4 are handled here

---

## Prompt 10: Responsive & Accessibility

### Rounds Implemented
None — cross-cutting.

### Context
Ensures the module works across screen sizes and is accessible. Desktop is the primary target (R3F + drag), but tablet should work. Accessibility ensures keyboard navigation and screen reader support for all interactive elements.

### Requirements

**Responsive layout:**
- **Desktop (≥1024px):** Canvas occupies ~70% width, SequenceBuilder/controls docked right (30%). HUD overlays on canvas.
- **Tablet (768–1023px):** Canvas full width. SequenceBuilder as collapsible bottom panel (slide up from bottom). HUD overlays simplified.
- **Mobile (<768px):** Canvas full width, reduced grid density. Touch drag supported for ghost. SequenceBuilder as full-screen modal when active. Not primary target but functional.

**Canvas scaling:**
- Orthographic camera bounds scale with container size
- Grid density reduces on smaller screens (every 2 units instead of every 1)
- SpriteLabel font size adjusts for readability at small sizes

**Touch support:**
- Ghost drag: touch events (`onTouchStart`, `onTouchMove`, `onTouchEnd`) mirror pointer events
- SequenceBuilder: touch-friendly hit targets (minimum 44px)
- Slider: native HTML range input works with touch

**Keyboard navigation:**
- Tab order: prompt text → primary action (ghost/SequenceBuilder) → Reveal/Check button → Next button
- Ghost positioning: arrow keys move ghost by 0.5 grid units when focused
- SequenceBuilder: Enter to add step, Tab between configuration inputs, Delete to remove step
- Escape: dismiss modals (CelebrationModal, interstitials)

**Screen reader support:**
- ARIA labels on all interactive elements
- Ghost triangle: `aria-label="Prediction triangle. Use arrow keys to position."`
- Reveal button: `aria-label="Reveal the correct answer"`
- SequenceBuilder steps: `role="list"`, each step `role="listitem"` with descriptive label
- Round prompts: `aria-live="polite"` region so prompt changes are announced
- Reveal results: announce accuracy ("Your prediction was close" / "Exact match")

**Reduced motion:**
- Respect `prefers-reduced-motion`: skip GSAP animations, use instant state changes
- Reveal: image appears instantly instead of animating
- Ray lines: appear instantly instead of draw-on effect
- Phase interstitials: no animation, just appear/disappear

### Technical Details
- Responsive: CSS Container Queries or media queries in Tailwind
- Touch: R3F pointer events handle touch automatically on most devices. Add explicit touch handlers if needed.
- Keyboard: `useEffect` for keydown listeners on canvas container. Use `tabIndex={0}` on canvas wrapper.
- ARIA: add to HTML overlay components (HUD, SequenceBuilder). R3F scene elements use drei `<Html>` for accessible labels.
- Reduced motion: `const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches` — pass to GSAP components as a prop to skip animations.

### Constraints
- Do not degrade the desktop experience for mobile compatibility
- Touch drag must feel as responsive as pointer drag (no lag)
- Keyboard ghost positioning must snap to the same 0.5 grid as pointer
- Screen reader announcements should not interrupt reveal animations on sighted mode

### Integration Points
- **Touches all previous prompts:** Adds responsive/accessibility layer to all components
- **No new components:** Enhances existing components from Prompts 2–9

---

## Implementation File Structure

```
src/components/modules/dilations/
├── DilationsModule.tsx              # Main orchestrator (Prompt 2)
├── DilationsCanvas.tsx              # R3F Canvas + camera + grid (Prompt 2)
├── DilationsHUD.tsx                 # HTML overlay - prompts, nav (Prompt 2)
├── components/
│   ├── GhostTriangle.tsx            # Draggable prediction (Prompt 3)
│   ├── RevealAnimation.tsx          # GSAP reveal (Prompt 3)
│   ├── SpriteLabel.tsx              # Text labels in scene (Prompt 3)
│   ├── PreImageTriangle.tsx         # Static pre-image (Prompt 3)
│   ├── ImageTriangle.tsx            # Dilated/transformed image (Prompt 3)
│   ├── ScaleFactorDisplay.tsx       # k value display (Prompt 4)
│   ├── RayLines.tsx                 # Origin-to-vertex rays (Prompt 4)
│   ├── RatioAnnotations.tsx         # Side ratio labels (Prompt 4)
│   ├── AngleMarks.tsx               # Arc marks at vertices (Prompt 4)
│   ├── DilationSummary.tsx          # Phase 1 summary view (Prompt 5)
│   ├── FormulaReadout.tsx           # (x,y)→(kx,ky) display (Prompt 6)
│   ├── SequenceBuilder.tsx          # Transformation composer (Prompt 7)
│   ├── SequencePreview.tsx          # Live preview ghost (Prompt 7)
│   ├── AngleLabels.tsx              # Computed degree labels (Prompt 8)
│   ├── AAComparisonView.tsx         # Angle comparison view (Prompt 8)
│   ├── CapstonePairNavigator.tsx    # Multi-pair manager (Prompt 8)
│   └── CelebrationModal.tsx         # End-of-module modal (Prompt 8)
├── hooks/
│   ├── useDilationsStage.ts         # Stage machine (Prompt 2)
│   └── usePredictReveal.ts          # Predict/reveal cycle (Prompt 3)
└── utils/
    ├── math.ts                      # Math functions (Prompt 1)
    ├── types.ts                     # Type definitions (Prompt 1)
    ├── constants.ts                 # Constants + round configs (Prompt 1)
    └── similarityTasks.ts           # Pre-defined task data (Prompt 7)
```

---

## Quality Checklist

- [ ] All 14 round IDs traceable from PRD → UX spec → build prompt → file structure
- [ ] No coordinates visible in Phase 1 rounds
- [ ] No angle labels visible before Phase 4
- [ ] Ghost drag disabled in Phase 3-4 (SequenceBuilder only)
- [ ] FormulaReadout generalizes only in coord-k-third
- [ ] k=½ ghost is visibly smaller than pre-image
- [ ] SequenceBuilder accepts multiple valid sequences
- [ ] AA color-matching is automatic
- [ ] CelebrationModal appears exactly once at capstone completion
- [ ] Phase transitions have interstitial text
- [ ] Idle hints appear after 15s in active states
- [ ] All GSAP timelines cleaned up on unmount
- [ ] Keyboard navigation works for all interactive elements
- [ ] prefers-reduced-motion respected
- [ ] Canonical triangle A(1,1) B(4,2) C(2,4) used consistently

---

## Next Steps After Build

1. **User testing:** Run with STEM Club students (target: 2 sessions). Observe where students stall, what language they use, which reveals land. Document against specific sessions.
2. **Refinement:** Adjust prediction tolerance, hint timing, transition pacing based on observed behavior. Expect k=½ surprise round to need tuning.
3. **Integration:** Add Module 2 to the module selector alongside Module 1. Ensure SequenceBuilder from M1 capstone is properly shared/extended.
4. **Planning artifact update:** Update `src/components/planning/DilationsModulePlanning.tsx` with any design changes from testing.

---

*These prompts can be used sequentially with UI generation tools (v0, Bolt, Claude) or as implementation guides for manual development. Each prompt is self-contained — a developer can take any single prompt and implement it without referring to others, while integration points ensure the pieces connect.*
