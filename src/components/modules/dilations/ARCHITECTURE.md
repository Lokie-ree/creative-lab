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
| `aa-discover` | aa-capstone | observe | ✓ | ✓ | Angle labels appear; 2 sub-pairs, REVEAL MATCHES button |
| `aa-confirm` | aa-capstone | sequence builder + NOT SIMILAR | ✓ | ✓ | One non-similar pair; student proves via angles OR sequence |
| `capstone-final` | aa-capstone | sequence builder + NOT SIMILAR | ✓ | ✓ | 3 pairs (2 similar, 1 not); CapstonePairNavigator |

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
  // Phase 4 fields:
  anglesRevealed: boolean       // Whether REVEAL MATCHES has been pressed in current round
  subPairIndex: 0 | 1          // aa-discover sub-pair index (resets to 0 on round change)
  capstonePairIndex: number     // capstone-final active pair (0–2)
  capstonePairResults: ('pending' | 'similar' | 'not-similar')[]  // 3-element result array
}
```

### `RoundState` lifecycle

**Ghost-drag rounds (Phase 1–2):**
```
entry → active → prediction → reveal → completion
                     ↑ (ghost drop commits to prediction)
```

**Sequence-builder rounds (Phase 3–4):**
```
entry → active → completion
                     ↑ (CHECK validates sequence; miss stays in active)
```

**AA-discover (Phase 4):**
```
entry → active (REVEAL MATCHES → anglesRevealed=true → dwell 2.5s → CONTINUE)
     sub-pair 0 → sub-pair 1 → ADVANCE_ROUND → completion
```

- `entry`: CONTINUE button shown; phase intro copy displayed
- `active`: Student interacts (ghost drag or sequence builder)
- `prediction`: Ghost dropped; REVEAL button shown (ghost-drag rounds only)
- `reveal`: RevealAnimation plays; no controls shown (ghost-drag rounds only)
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
| `ADD/UPDATE/REMOVE/REORDER_SEQUENCE_STEP` | Sequence builder mutations |
| `CHECK_SEQUENCE` | `active → prediction` |
| `RESET_SEQUENCE` | Clears `sequenceSteps` |
| `REVEAL_ANGLES` | Sets `anglesRevealed = true` (Phase 4) |
| `ADVANCE_SUB_PAIR` | Increments `subPairIndex`; resets `anglesRevealed` (aa-discover) |
| `DECLARE_NOT_SIMILAR` | `* → completion` (aa-confirm NOT SIMILAR path) |
| `COMPLETE_CAPSTONE_PAIR` | Records result in `capstonePairResults`; increments `capstonePairIndex`; if all 3 done → `completion` |

---

## Scene Architecture

### Camera

`CameraSetup` runs in `useFrame`. Orthographic camera with dynamic frustum:

- **World range:** x ∈ [-2, 14], y ∈ [-2, 14] (accommodates k=3 dilation of canonical triangle)
- **Fit constraint:** shorter viewport dimension maps to `WORLD_SIZE` (16 world units for Phases 1–2; 20 for Phases 3–4 via `worldSize` prop on `DilationsScene`)
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
| 0.1 | AngleLabel sprites (slightly above vertex labels) |

### Canonical Triangle (Phases 1–3)

```
A(1,1)  B(4,2)  C(2,4)
```
Same scalene triangle as M1 (Rigid Motions). Centroid: (7/3, 7/3) ≈ (2.33, 2.33).

### Phase 4 Triangle Data (`utils/aaTasks.ts`)

Phase 4 uses fixed triangle pairs defined in `aaTasks.ts` — not the canonical triangle.

**aa-discover sub-pairs** (`AA_DISCOVER_SUB_PAIRS`):
- Sub-pair 1: Right isosceles (90°, 45°, 45°), k ≈ 1.5 — all 3 angle pairs colored
- Sub-pair 2: 3-4-5 right triangle (90°, 53°, 37°), k = 2 — only 2 pairs highlighted to demonstrate AA sufficiency

**aa-confirm pair** (`AA_CONFIRM_PAIR`):
- Pre-image: right triangle [37°, 53°, 90°]; Target: isosceles [54°, 63°, 63°]
- No angle matches within ±2° — demonstrates that angle mismatch = not similar

**capstone pairs** (`CAPSTONE_PAIRS`):
- Pair 1 (similar): right isosceles; intended sequence: translate(+2,−1) → dilate(×2); `maxSteps=2`
- Pair 2 (NOT similar): contrast pair; [37°,53°,90°] vs [54°,63°,63°]; `maxSteps=2`
- Pair 3 (similar): 3-4-5 right triangle; intended sequence: rotate(90°CCW) → translate(+6,0) → dilate(×2); `maxSteps=3`

---

## Interaction Patterns

### Ghost drag (Phase 1–2)

1. **Scene-level capture plane** — `GhostTriangle` renders a 200×200 invisible mesh as a scene sibling (not a child of the ghost group) at z=−0.2. This means any tap on the canvas starts a drag — the student does not need to hit the ghost outline.
2. **Delta-based drag** — `handlePointerDown` snapshots `dragStartWorld` + `centerAtDragStart` (= `externalPosition ?? centerPosRef.current`). `handleMove` computes `newCenter = baseline + delta` with no snapping (60fps smooth) and fires `onPositionChange` for live coord readout. `handleUp` applies snap(0.25) on commit.
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

Chip rail design — compact horizontal chips with inline step editor.

- **Chips:** Each step renders as a compact chip (e.g. `T +1,+1` → `Dil ×2`). Tapping a chip opens an inline editor below the rail.
- **Editor:** Shows transform type grid/sliders for that step. DONE closes the editor (explicit commit — matches module's action-then-advance pattern).
- **Capacity:** Variable length, capped at `maxSteps` per round (2 for most; 3 for `similarity-inverse` and capstone pair 3).
- **No drag-to-reorder:** Students clear and rebuild — non-commutativity is discovered by trying different orderings.
- **`kLocked` prop:** Dilate step shows a read-only k=2 display when locked (Phase 3 always dilates by 2; Phase 4 capstone also uses `kLocked=true`).
- **CHECK / RESET / NEXT:** CHECK validates the composed sequence against the target triangle (centroid distance ≤ tolerance). Miss stays in `active`; match transitions to `completion`.

### AA Discover Controls (Phase 4 — `aa-discover`)

Inline button strip in the `controls` slot (not a separate component):
- **REVEAL MATCHES** button (amber border): dispatches `REVEAL_ANGLES`; hidden after reveal
- **CONTINUE →** button: appears 2500ms after `anglesRevealed = true` (dwell timer in `DilationsModule`)
  - Sub-pair 0: dispatches `ADVANCE_SUB_PAIR`
  - Sub-pair 1: dispatches `ADVANCE_ROUND`

### CapstonePairNavigator (Phase 4 — `capstone-final`)

Dedicated HTML component `CapstonePairNavigator.tsx`. Owns:
- **Pair progress header:** "PAIR N / 3" label + 3 LED dots (green when done, accent when active, ghost when upcoming)
- **REVEAL MATCHES button:** amber border; unlocks angle color-matching; hidden after reveal
- **SequenceBuilder** (reused): `kLocked=true`; `maxSteps` from current pair's `CapstonePair.maxSteps`
- **NOT SIMILAR button:** disabled until `anglesRevealed && !hasAngleMatches` — uses `computeMatchColors` to check if any angle pairs share a color
- **Feedback state:** `'idle' | 'match' | 'miss'` — local to navigator, reset on pair change
- **NEXT PAIR / FINISH button:** appears after pair is resolved; dispatches `COMPLETE_CAPSTONE_PAIR`; last pair triggers `onAllComplete` → `CelebrationModal`

### AngleLabels (Phase 4 R3F component)

`AngleLabels.tsx` — CanvasTexture sprites (same pattern as `SpriteLabel.tsx`, never drei `<Text>`).

- Renders one `SingleAngleLabel` sprite per vertex, positioned inside the triangle via centroid-direction offset (d=0.7 world units toward centroid).
- `revealed=false`: labels render at `DIM_OPACITY = 0.4` in `GHOST` color
- `revealed=true`: labels render at full opacity in `matchColors` per-vertex colors
- `computeMatchColors(preAngles, tgtAngles, showMatchCount)` (exported for testing):
  - Sorts both angle arrays, matches pairs within ±2° tolerance
  - Assigns `ANGLE_COLORS` (`#7cc87c` green, `#f5a623` amber, `#8ab4f8` blue) for up to `showMatchCount` matches
  - Unmatched or uncapped vertices stay `GHOST`
  - Returns `[[string,string,string], [string,string,string]]` — one array per triangle

---

## Animation Patterns

All animation is GSAP + `useFrame` imperative, matching M1's pattern:

- **RevealAnimation:** Animates image triangle from ghost position to target using GSAP timeline
- **RayLines:** Dashed lines from origin through pre-image vertices to image vertices; GSAP `drawLength` on reveal
- **AngleMarks:** Arc indicators at each vertex; GSAP opacity on reveal
- **RatioAnnotations:** Distance ratio labels; GSAP opacity on reveal

Phase 4 (AA rounds) uses no GSAP animations — the two-triangle side-by-side layout is static; angle labels snap to color instantly on `REVEAL_ANGLES`.

Geometry created once in `useMemo`, attached in `useEffect`, mutated by GSAP/`useFrame`. Never `new THREE.X()` inline in JSX (creates new GPU object every render).

---

## Earned Reveal System

Mirrors M1's pattern:

- `EARNED_REVEALS: Partial<Record<RoundId, EarnedReveal>>` — one entry per round across all phases
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

## Celebration Modal

`CelebrationModal` (shared component) triggered when `capstone-final` round reaches `completion`. Passes `{ phases: 4, rounds: 14 }` as the completion values. Includes a dilations-specific `DiscoveryTab` branch (stats, coordinate rule, AA criterion).

Two trigger paths:
1. `useEffect` watching `isCapstone && roundState === 'completion'`
2. `CapstonePairNavigator`'s `onAllComplete` callback (fires when all 3 pairs are resolved)

---

## Scene Visibility Context

`DilationsSceneCtx` (React context) propagates `coordinatesVisible` and `angleLabelsVisible` to all children inside `<DilationsScene>`.

- `PreImageTriangle` and `ImageTriangle` consume the context as a fallback; explicit `showCoordinates` / `showAngles` props take priority
- Avoids prop-drilling through each scene round component

---

## Key Constraints

- **One-way visibility flags:** `coordinatesVisible` and `angleLabelsVisible` only flip `true` in `startRound()`. They represent permanent unlock milestones.
- **Ghost snap resolution:** 0.25 world units on drop. Prevents off-grid predictions.
- **`CANONICAL_TRIANGLE`:** A(1,1) B(4,2) C(2,4) — hardcoded, never changes. All dilated images derived from this (Phases 1–3 only; Phase 4 uses `aaTasks.ts` pairs).
- **No `<primitive object={new THREE.X()}>` in JSX:** All geometries created outside render, in `useMemo` or `useRef`. Dispose in `useEffect` cleanup.
- **No drei `<Text>` or `<Html>`:** SpriteLabel (CanvasTexture → PlaneGeometry) pattern used for all in-scene text, including `AngleLabels`.
- **NOT SIMILAR gate:** Button only unlocks when `anglesRevealed && !hasAngleMatches`. `hasAngleMatches` is computed via `computeMatchColors` — if any vertex color is non-ghost, angles match and the button stays disabled.

---

## Build Order

Rounds are implemented in phase order. Reference: `docs/modules/dilations/build-order-prompts.md`

- **Phase 1 (scale-factor):** ✓ Complete — PRs #47–#49
- **Phase 2 (coordinate):** ✓ Complete — PRs #51–#52; solidification + drag polish PRs #53–#54
- **Phase 3 (similarity):** ✓ Complete — PR #56 (similarity sequences), PR #58 (polish: chip rail SequenceBuilder, angle marks, camera expansion, snap precision, live coord drag, earned reveals)
- **Phase 4 (aa-capstone):** ✓ Complete — branch `feat/dilations-phase4-aa-capstone` (10 commits: state machine, copy, aaTasks, AngleLabels, AARounds, CapstonePairNavigator, DilationsModule Phase 4 integration, DiscoveryTab dilations branch, 6 QA fixes)
