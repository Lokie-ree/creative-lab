# Dilations — Pre-Phase 3 Solidification Design

**Date:** 2026-03-29
**Scope:** Phases 1 & 2 polish before Phase 3 build begins
**Branch:** `feat/dilations-pre-phase3-solidification`

---

## Background

Phases 1 and 2 of the Dilations module are live. Manual testing surfaced four bugs and three UX gaps worth closing before extending the build. This spec covers all seven items.

---

## Items

### 1. Silent retry on module load failure

**Problem:** On a fresh browser session, the dilations chunk occasionally fails to load (transient network/CDN cold-start). `DynamicModule` in `App.tsx` has no retry logic — a single failure sets permanent error state requiring a full page reload.

**Fix:** In `App.tsx` `DynamicModule`, catch the first failure and retry the import once. Only call `setError` if the retry also rejects. No UI change — transparent to the user. Preserve the existing `startTransition` wrapper on the success path.

```
moduleConfig.component()
  .catch(() => moduleConfig.component())   // retry once
  .then(module => {
    startTransition(() => {
      setLoadedModule(() => module.default)
      setError(null)
    })
  })
  .catch(err => setError(...))
```

**Files:** `src/App.tsx`

---

### 2. Remove coordinate-rule notation from Phase 1 earned reveals

**Problem:** Phase 1 earned reveals for `dilate-k2`, `dilate-k3`, and `dilate-k-half` include `notation: '(x, y) → (kx, ky)'` and `notationStyle: 'rule'`. This surfaces the algebraic coordinate rule in Phase 1 — it should be discovered for the first time in Phase 2.

**Fix:** Remove `notation` and `notationStyle` from the three Phase 1 entries in `EARNED_REVEALS`. Keep the discovery text unchanged.

**Files:** `src/components/modules/dilations/dilations-copy.ts`

---

### 3. Status strip + prompt label cleanup

**Problem:** The status strip right edge renders `PHASE_LABELS[phase]` ("PHASE 1 — Scale Factor"). The prompt label during `entry` state also renders `PHASE_LABELS[phase]`. These are identical — the phase number is already communicated by the LED dots, so "PHASE N —" is redundant in the strip, and repeating the full label in the prompt adds no information.

**Fix:**

- Add `PHASE_NAMES` map to `dilations-copy.ts`:
  ```ts
  export const PHASE_NAMES: Record<PhaseId, string> = {
    'scale-factor': 'Scale Factor',
    'coordinate':   'Coordinate Rule',
    'similarity':   'Similarity',
    'aa-capstone':  'AA Criterion',
  }
  ```
- Status strip right edge: replace `PHASE_LABELS[phase]` with `PHASE_NAMES[phase]`
- Prompt label during `entry` state: replace `PHASE_LABELS[phase]` with `'Dilations'` (neutral module name — non-redundant, provides orientation without repeating what the strip already shows)

**Files:** `src/components/modules/dilations/dilations-copy.ts`, `src/components/modules/dilations/DilationsModule.tsx`

---

### 4. Delta-based drag in GhostTriangle

**Problem:** `GhostTriangle` sets `centerPosRef.current = snappedWorldPosition` on every `pointermove`. This is an absolute-position assignment — the ghost centroid teleports to wherever the cursor is on pointerdown, then tracks the cursor absolutely. M1 (`DragPlane` in `RigidMotionsScene.tsx`) uses a delta pattern: on pointerdown it records `dragStartWorld` and `centerAtDragStart`, then computes `newCenter = centerAtDragStart + (currentWorld − dragStartWorld)` on move. The shape stays under the finger from wherever it is grabbed.

**Fix:** Replicate M1's delta pattern in `GhostTriangle.tsx`:

- On `pointerdown`: capture `dragStartWorld` (world coordinates of the initial touch) and `centerAtDragStart` (snapshot of the current *rendered* position — `externalPosition ?? centerPosRef.current`, not just `centerPosRef.current`). This matters because a keyboard nudge updates `externalPosition` without writing back to `centerPosRef`; computing the delta from the wrong base would cause the ghost to jump on the first drag after a nudge.
- On `pointermove`: `delta = currentWorld − dragStartWorld`; `newCenter = { x: centerAtDragStart.x + delta.x, y: centerAtDragStart.y + delta.y }`; snap; assign to `centerPosRef.current`
- Store `dragStartWorld` and `centerAtDragStart` in refs (not state) to avoid re-renders

Applies to both Phase 1 and Phase 2 since both scenes use `GhostTriangle`.

**Files:** `src/components/modules/dilations/components/GhostTriangle.tsx`

---

### 5. Accuracy feedback on prediction commit

**Problem:** `usePredictReveal` computes `Accuracy` (`exact` / `close` / `miss`) on `COMMIT` but the value is discarded at the call site. The prompt shows no differentiation between a perfect placement and a far-off one — the student gets the same REVEAL button and neutral label regardless of how well they predicted.

**Fix:**

1. **Bubble accuracy up from scenes to module:**
   - Add `onAccuracy?: (a: Accuracy) => void` to `PredictionRoundScene` (Phase 1) and `CoordinatePredictionScene` (Phase 2)
   - Call `onAccuracy(accuracy)` in `handleGhostDrop` after `commitPrediction()` (accuracy is returned from `usePredictReveal` as `state.accuracy` after commit — or pass it directly since `COMMIT` computes it synchronously via the reducer, accessed via the hook's returned `accuracy` field)
   - Propagate the callback through `ScaleFactorScene` and `CoordinateScene` props

2. **Store and display in DilationsModule:**
   - `const [predictionAccuracy, setPredictionAccuracy] = useState<Accuracy | null>(null)`
   - Reset to `null` in the round-advance handler (`handleAdvance`) and on round change via `useEffect`
   - Prompt label during `prediction` roundState:
     - `exact` → `'Exact!'`
     - `close` → `'Close!'`
     - `miss` → `'Good try'`
   - Amber styling applies to `exact` and `close` (same as earned reveals — warm encouragement)

**Note on accuracy access:** `usePredictReveal` returns `accuracy` from state, but state updates are async via `useReducer`. The cleanest approach is to compute accuracy at the call site and pass it directly to `onAccuracy` rather than reading it from the hook's returned state after dispatch.

Export a named `computeAccuracy` helper from `usePredictReveal.ts`:
```ts
export function computeAccuracy(ghostPos: Vec2, targetCentroid: Vec2, tolerance: number): Accuracy {
  const d = Math.sqrt((ghostPos.x - targetCentroid.x) ** 2 + (ghostPos.y - targetCentroid.y) ** 2)
  return d <= tolerance * 0.5 ? 'exact' : d <= tolerance ? 'close' : 'miss'
}
```
`handleGhostDrop` in both scene components calls `computeAccuracy` directly (passing the dropped position, target centroid, and tolerance) and passes the result to `onAccuracy`. The `dist` function in `usePredictReveal.ts` can be inlined into `computeAccuracy` or kept private.

**Reset effect:** `predictionAccuracy` resets to `null` on round change via `useEffect([currentRound])`. Use the same pattern as the nudge position reset (lines 43–47 of `DilationsModule.tsx`) including the `/* eslint-disable react-hooks/set-state-in-effect */` suppression comment for consistency.

**Files:** `src/components/modules/dilations/hooks/usePredictReveal.ts`, `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`, `src/components/modules/dilations/rounds/CoordinateRounds.tsx`, `src/components/modules/dilations/DilationsModule.tsx`

---

### 6. Ghost initial position

**Problem:** `GhostTriangle` initializes `centerPosRef` to `triangleCentroid(vertices)` (the pre-image centroid, ≈ 2.33, 2.33). The ghost is the scaled triangle centered at this point, so for k=2 a large ghost overlays the pre-image during the `entry` reading state. This is visually confusing — the student hasn't started predicting yet.

**Fix:**

- **Hide ghost during `entry` state** in both `PredictionRoundScene` and `CoordinatePredictionScene`: change `showGhost = roundState !== 'completion'` to `showGhost = roundState !== 'completion' && roundState !== 'entry'`. The pre-image is shown cleanly during entry while the student reads the prompt.
- **Initialize `centerPosRef` to `{ x: 0, y: -0.5 }`**: near the origin (the dilation center), clearly below and left of the pre-image (which spans roughly x: 1–4, y: 1–4). When the ghost appears after CONTINUE, it starts at an unambiguous neutral position the student must drag away from.
- **Update keyboard nudge fallback in `DilationsModule.tsx`**: the nudge base position fallback on line 65 is currently `{ x: 7/3, y: 7/3 }` (the old centroid default). Change it to `{ x: 0, y: -0.5 }` to match the ghost's new initial position and keep the two defaults consistent.

**Files:** `src/components/modules/dilations/components/GhostTriangle.tsx`, `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`, `src/components/modules/dilations/rounds/CoordinateRounds.tsx`, `src/components/modules/dilations/DilationsModule.tsx`

---

### 7. Phase 2 — predicted coordinates in formula strip

**Problem:** In Phase 2, after the student drops the ghost and is in `prediction` state, the formula strip shows only `k = N` (same as during `active` state). The student has no feedback on what coordinates their predicted placement corresponds to — they can't see whether their spatial intuition matches their algebraic prediction.

**Fix:** Show predicted vertex coordinates in the formula strip during `prediction` state in Phase 2.

**Data flow:**
- `nudgePosition` in `DilationsModule` already holds the dropped centroid (set via `handleGhostPositionChange`, which fires on drop)
- Compute predicted vertices: `dilate CANONICAL_TRIANGLE by k → center at origin → translate to nudgePosition`
  - This mirrors `GhostTriangle`'s internal `scaledShape` + group position logic
  - Implement a `ghostVerticesToWorld(vertices: Triangle, k: number, centroid: Vec2): Triangle` utility in `math.ts`. This requires the `translateTriangle` helper that currently lives private inside `GhostTriangle.tsx` — move it to `math.ts` first.
- Pass predicted vertices to `CoordinateReadout` as a new optional prop: `predictedVertices?: Triangle`

**CoordinateReadout changes:**
- Add `predictedVertices?: Triangle` prop
- New display state when `!isAfterReveal && predictedVertices != null` (i.e., `prediction` state):
  - Show a coordinate row in `--lab-ghost` color with label "PREDICTED"
  - Format: `A'(x, y)  B'(x, y)  C'(x, y)` — same layout as the post-reveal row, ghost-colored
- Pre-reveal with no prediction (active state): keep showing `ScaleFactorDisplay` as before
- After reveal: keep existing behavior (actual coordinates in accent + rule)

**DilationsModule changes:**
- `formulaReadout` for `isCoordinatePhase`: when `roundState === 'prediction' && nudgePosition != null`, compute and pass `predictedVertices`

**Files:** `src/components/modules/dilations/components/CoordinateReadout.tsx`, `src/components/modules/dilations/utils/math.ts`, `src/components/modules/dilations/DilationsModule.tsx`

---

## File Change Summary

| File | Items |
|------|-------|
| `src/App.tsx` | 1 |
| `src/components/modules/dilations/dilations-copy.ts` | 2, 3 |
| `src/components/modules/dilations/DilationsModule.tsx` | 3, 5, 6, 7 |
| `src/components/modules/dilations/components/GhostTriangle.tsx` | 4, 6 |
| `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx` | 5, 6 |
| `src/components/modules/dilations/rounds/CoordinateRounds.tsx` | 5, 6 |
| `src/components/modules/dilations/components/CoordinateReadout.tsx` | 7 |
| `src/components/modules/dilations/utils/math.ts` | 7 |
| `src/components/modules/dilations/hooks/usePredictReveal.ts` | 5 (minor — export accuracy computation helper) |

---

## Out of Scope

- ControlStrip polish (deferred until Phases 3 & 4 are built)
- Viewport resize / orientation change handling (not observed as a real issue)
- Per-vertex color-coded accuracy (future enhancement)
- Commit-before-feedback gate (deferred — generalized pattern clearer after 3 modules)
