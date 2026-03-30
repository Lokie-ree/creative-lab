# Dilations & Similarity — Architecture Reference

As-built reference for the Dilations module (M2). Follows Rigid Motions (M1) as the grade 8 geometry progression second module.

---

## Standards

| Standard | Description |
|---------|-------------|
| **8.G.A.3** | Describe the effect of dilations on 2D figures using coordinates |
| **8.G.A.4** | Understand that a 2D figure is similar to another if obtainable by a sequence of rotations, reflections, translations, and dilations |
| **8.G.A.5** | Use informal arguments to establish facts about the AA criterion for triangle similarity |

---

## Phase / Round Sequence

14 rounds across 4 phases. `coordinatesVisible` and `angleLabelsVisible` are one-way — they flip `true` and stay `true` for the rest of the session.

| Round | Phase | Interaction | `coordsVis` | `anglesVis` | Notes |
|-------|-------|-------------|-------------|-------------|-------|
| `dilate-k2` | scale-factor | ghost drag | ✗ | ✗ | First prediction — ghost starts at pre-image centroid |
| `dilate-k2-properties` | scale-factor | observe | ✗ | ✗ | CONTINUE required; auto-completes after 1.4s |
| `dilate-k3` | scale-factor | ghost drag | ✗ | ✗ | Confirm the pattern |
| `dilate-k-half` | scale-factor | ghost drag | ✗ | ✗ | k < 1: shrinks toward origin |
| `dilate-summary` | scale-factor | observe | ✗ | ✗ | Shows all 3 images; auto-completes 600ms after CONTINUE |
| `coord-k2` | coordinate | ghost drag | ✓ | ✗ | Coordinates revealed; (x,y)→(2x,2y) |
| `coord-k-half` | coordinate | ghost drag | ✓ | ✗ | |
| `coord-k-third` | coordinate | ghost drag | ✓ | ✗ | Generalize to non-integer k |
| `similarity-guided` | similarity | sequence builder | ✓ | ✗ | Rigid motion + dilation |
| `similarity-rigid-dilation` | similarity | sequence builder | ✓ | ✗ | |
| `similarity-inverse` | similarity | sequence builder | ✓ | ✗ | |
| `aa-discover` | aa-capstone | observe | ✓ | ✓ | Angle labels appear |
| `aa-confirm` | aa-capstone | sequence builder | ✓ | ✓ | |
| `capstone-final` | aa-capstone | sequence builder | ✓ | ✓ | |

---

## State Architecture

### `StageState` fields

```ts
{
  currentRound: RoundId         // Which round is active
  roundState: RoundState        // 'entry' | 'active' | 'prediction' | 'reveal' | 'completion'
  phase: PhaseId                // Derived from ROUND_CONFIGS[currentRound].phase
  coordinatesVisible: boolean   // One-way flip — never resets to false
  angleLabelsVisible: boolean   // One-way flip — never resets to false
  ghostPosition: Vec2 | null    // Last committed ghost drop position
  sequenceSteps: TransformStep[] // Phase 3–4 sequence builder
}
```

### `RoundState` lifecycle

```
entry → active → prediction → reveal → completion
                     ↑ (ghost-drag commits to prediction)
                     ↑ (sequence builder CHECK → prediction)
```

- `entry`: CONTINUE button shown; phase intro copy displayed
- `active`: Student interacts (ghost drag, annotations animating)
- `prediction`: Ghost dropped / sequence submitted; REVEAL button shown (ghost-drag rounds)
- `reveal`: RevealAnimation plays; no controls shown
- `completion`: Round done; NEXT button shown; earned reveal displayed

### Actions

| Action | Effect |
|--------|--------|
| `ADVANCE_ROUND` | Moves to next round in `ROUND_SEQUENCE`; calls `startRound()` |
| `START_ROUND` | Jump to a specific round |
| `SET_ROUND_STATE` | Direct state transition |
| `COMMIT_PREDICTION` | `active → prediction` |
| `TRIGGER_REVEAL` | `prediction → reveal` |
| `COMPLETE_ROUND` | `* → completion` |
| `SET_GHOST_POSITION` | Stores position; if in `entry`, transitions to `active` |
| `ADD/REMOVE/REORDER_SEQUENCE_STEP` | Sequence builder mutations |
| `CHECK_SEQUENCE` | `active → prediction` |
| `RESET_SEQUENCE` | Clears `sequenceSteps` |

---

## Scene Architecture

### Camera

`CameraSetup` runs in `useFrame`. Orthographic camera with dynamic frustum:

- **World range:** x ∈ [-2, 14], y ∈ [-2, 14] (accommodates k=3 dilation of canonical triangle)
- **Fit constraint:** shorter viewport dimension maps to `WORLD_SIZE` (16 world units)
- **Center:** (6, 6) — geometric center of the grid

### Z-layer ordering

| z value | Element |
|---------|---------|
| 0 | Grid lines, axis lines |
| 0.01 | Origin marker |
| 0.02 | PreImage fill |
| 0.03 | PreImage outline |
| 0.04–0.05 | Axis labels (SpriteLabel) |
| 0.05 | Ghost fill |
| 0.06 | Ghost outline |
| 0.07–0.09 | Image fill / outline |
| 0.08–0.09 | Vertex labels, coordinate labels, angle labels |

### Canonical Triangle

```
A(1,1)  B(4,2)  C(2,4)
```
Same scalene triangle as M1 (Rigid Motions). Centroid: (7/3, 7/3) ≈ (2.33, 2.33).

---

## Interaction Patterns

### Ghost drag (Phase 1–2)

1. **Scene-level capture plane** — `GhostTriangle` renders a 200×200 invisible mesh as a scene sibling (not a child of the ghost group) at z=−0.2. This means any tap on the canvas starts a drag — the student does not need to hit the ghost outline.
2. **Delta-based drag** — `handlePointerDown` snapshots `dragStartWorld` + `centerAtDragStart` (= `externalPosition ?? centerPosRef.current`). `handleMove` computes `newCenter = baseline + delta` with no snapping (60fps smooth). `handleUp` applies snap(0.5) on commit.
3. Ghost starts at `(0, −0.5)` — offset from pre-image, hidden during `entry` state.
4. `onPositionChange` callback syncs external `nudgePosition` state in `DilationsModule`
5. `externalPosition` prop overrides internal position (keyboard nudge); used as baseline for subsequent drag
6. On `onDrop`: calls `COMMIT_PREDICTION` dispatch → `active → prediction`
7. `disabled` omits the capture plane entirely (no pointer capture during reveal/completion)
8. `touchAction: 'none'` on the Canvas element eliminates mobile scroll disambiguation delay

### Keyboard nudge

- Arrow keys: 0.5-unit increments; Shift+Arrow: 0.25-unit increments
- Active only during `roundState === 'active' || 'prediction'` in ghost-drag rounds
- `nudgePosition` resets to `null` on round change

### SequenceBuilder (Phase 3–4)

Not yet built. `hasSequenceBuilder: true` rounds will use a drag-to-compose interface.

---

## Animation Patterns

All animation is GSAP + `useFrame` imperative, matching M1's pattern:

- **RevealAnimation:** Animates image triangle from ghost position to target using GSAP timeline
- **RayLines:** Dashed lines from origin through pre-image vertices to image vertices; GSAP `drawLength` on reveal
- **AngleMarks:** Arc indicators at each vertex; GSAP opacity on reveal
- **RatioAnnotations:** Distance ratio labels; GSAP opacity on reveal

Geometry created once in `useMemo`, attached in `useEffect`, mutated by GSAP/`useFrame`. Never `new THREE.X()` inline in JSX (creates new GPU object every render).

---

## Earned Reveal System

Mirrors M1's pattern:

- `EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>>` — one entry per Phase 1 round
- `revealKey = currentRound` — one reveal per round (not beat-indexed within a round)
- `shownReveals: Set<string>` — persists across rounds in the session; never re-shows
- `isFirstReveal = roundState === 'completion' && !!earnedReveal && !shownReveals.has(revealKey)`
- On first reveal: amber prompt, `notation` display, match flash border (AnimatePresence), screen reader announcement, haptic (80ms vibrate)
- `handleAdvance` records the reveal key before dispatching `ADVANCE_ROUND`

### EarnedReveal shape

```ts
interface EarnedReveal {
  text: string
  notation?: string             // e.g. '(x, y) → (2x, 2y)'
  notationStyle?: 'rule' | 'congruence'
}
```

---

## Scene Visibility Context

`DilationsSceneCtx` (React context) propagates `coordinatesVisible` and `angleLabelsVisible` to all children inside `<DilationsScene>`.

- `PreImageTriangle` and `ImageTriangle` consume the context as a fallback; explicit `showCoordinates` / `showAngles` props take priority
- Avoids prop-drilling through each scene round component

---

## Key Constraints

- **One-way visibility flags:** `coordinatesVisible` and `angleLabelsVisible` only flip `true` in `startRound()`. They represent permanent unlock milestones.
- **Ghost snap resolution:** 0.5 world units (fine: 0.25 with Shift). Prevents off-grid predictions.
- **`CANONICAL_TRIANGLE`:** A(1,1) B(4,2) C(2,4) — hardcoded, never changes. All dilated images derived from this.
- **No `<primitive object={new THREE.X()}>` in JSX:** All geometries created outside render, in `useMemo` or `useRef`. Dispose in `useEffect` cleanup.
- **No drei `<Text>` or `<Html>`:** SpriteLabel (CanvasTexture → PlaneGeometry) pattern used for all in-scene text.

---

## Build Order

Rounds are implemented in phase order. Reference: `docs/modules/dilations/build-order-prompts.md`

- **Phase 1 (scale-factor):** ✓ Complete — PRs #47–#49
- **Phase 2 (coordinate):** ✓ Complete — PRs #51–#52; solidification + drag polish PRs #53–#54
- **Phase 3 (similarity):** Next — `similarity-guided`, `similarity-rigid-dilation`, `similarity-inverse`. Requires `SequenceBuilder.tsx` (HTML), `SequencePreview.tsx` (R3F), `similarityTasks.ts`
- **Phase 4 (aa-capstone):** Depends on Phase 3 infrastructure
