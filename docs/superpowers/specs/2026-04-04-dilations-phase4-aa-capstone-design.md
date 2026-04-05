# Dilations Phase 4: AA Discovery & Capstone — Design Spec

**Date:** 2026-04-04  
**Module:** Dilations & Similarity (M2, Grade 8 Geometry)  
**Phase:** 4 — AA Criterion  
**Rounds:** `aa-discover`, `aa-confirm`, `capstone-final`  
**ALD Target:** L5 (advanced)  
**Status:** Approved for implementation

---

## Overview

Phase 4 completes the Dilations module. Students have already mastered scale factor (Phase 1), the coordinate rule (Phase 2), and composing transformation sequences to connect similar figures (Phase 3). Phase 4 introduces the AA Similarity Criterion — the insight that knowing two pairs of angles match is sufficient to conclude similarity.

This phase introduces the first computed angle labels in the module, a two-pair observation structure inside `aa-discover`, a deliberate "productive failure" in `aa-confirm`, a 3-pair capstone, and the full `CelebrationModal` with Dilations-specific `DiscoveryTab` content.

---

## Design Decisions (locked 2026-04-04)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scene layout for two-triangle comparison | Side by side (horizontally separated) | Clean label separation; consistent with M1 pre-image / image convention |
| Sub-pair transition trigger in aa-discover | CONTINUE button delayed 2–3s after angle colors snap in | Forced dwell ensures observation; student advances on their own terms |
| Angle label initial state | Dim/ghost (degree values visible but unstyled) | Progressive reveal — student sees values before meaning |
| Angle color reveal mechanic | Student taps REVEAL MATCHES → colors snap in simultaneously | Mini earned-reveal; student forms hypothesis before confirmation |
| Unmatched angle treatment | Ghost color (`--lab-ghost`, #7a746a) — no red | "No wrong answers" pedagogy; absence of color signals non-match |
| NOT SIMILAR unlock gate | After angle reveal, when system detects no matches | Evidence-first — student must observe before concluding |
| DiscoveryTab layout | Stats + Key Formulas (C) | Celebrates the math milestones, not just the progression |
| Capstone pair count | 3 pairs | Enough for variety; not exhausting |
| Capstone pair mix | Similar → Not Similar → Similar (harder) | Satisfying arc: confirm → contrast → confirm advanced |

---

## Scene Architecture

### New R3F Component: `AngleLabels.tsx`

Renders computed angle degree values at each vertex of a triangle in the R3F scene. Distinct from the existing `AngleMarks.tsx` (which draws arc marks without numbers — used in Phase 3).

```
Props:
  triangle: Triangle           — vertices to compute angles for
  visible: boolean             — whether labels are shown at all
  revealed: boolean            — false = dim/ghost, true = colors applied
  matchColors: [string, string, string] | null
                               — null = all ghost; otherwise per-vertex color
  vertexNames: ['A'|'B'|'C', ...] — for positioning offset direction
```

**Implementation pattern:** Same CanvasTexture approach as `SpriteLabel.tsx` (M2). Never use drei `<Text>` or `<Html>`. Each label is a sprite positioned slightly outside the triangle at its vertex. Color applied to canvas text before texture is drawn.

**Angle computation:** Use existing `triangleAngles(t: Triangle)` from `utils/math.ts`. Returns `[number, number, number]` (degrees at A, B, C). `triangleAngles` already returns integers (via `angleDeg` which applies `Math.round` internally) — do not add a second rounding step at display time.

**Color matching logic:** Sort both triangles' angle arrays with index tracking. Match pairs within ±2° tolerance. Assign colors from a 3-color palette:
```
ANGLE_COLORS = ['#7cc87c', '#f5a623', '#8ab4f8']  // green, amber, blue
```
Non-matching angles: `'#7a746a'` (lab-ghost). This palette gives 3 visually distinct colors that all work on the dark background.

**Dim state:** When `revealed === false`, all labels render at 40% opacity (ghost effect) using the ghost color regardless of matchColors.

---

### New R3F Scene: `AARounds.tsx`

Handles both `aa-discover` and `aa-confirm` scene rendering.

```tsx
function AAScene({ preImage, target, revealed, matchColors })
// Renders:
//   PreImageTriangle (left, ghost stroke)
//   ImageTriangle (right, accent fill)
//   AngleLabels on pre-image
//   AngleLabels on target
```

**Positioning:** `worldSize=20`, `worldCenter=5` (same as Phase 3). Triangle vertex coordinates in `aaTasks.ts` must be designed to keep both triangles within the visible frustum (approximately x: −5 to 15, y: −5 to 15 at 1:1 aspect). Place both triangles entirely in positive coordinate space — pre-image in roughly x: 0–4, target in roughly x: 7–12 — so neither sits at the frustum edge. The ~3-unit gap between them provides visual separation for angle labels. No group-level offset is needed; triangle coordinates encode the positions directly.

No ghost drag in Phase 4. No GhostTriangle, no capture plane.

---

## Round Designs

### `aa-discover`

**ALD:** L5 — Analyze and prove  
**Concept:** Two matching angles is sufficient for similarity.

#### Data: Two Sub-Pairs

Sub-pair 1: All 3 angles match. Both triangles are similar.  
Sub-pair 2: Only 2 angles match. Triangles are still similar. This is the key insight.

Exact coordinates defined in `aaTasks.ts` (new file). Constraints:
- Both triangles fit within 20-unit world
- Triangles are visually distinct in size (k ≈ 1.5–2×)
- Positioned side by side with ~3 units separation
- No overlap with angle label text

#### State Machine

`subPairIndex` (0|1) and `anglesRevealed` live in `StageState` (need to persist across renders and sync to `DilationsModule`). `continueVisible` is **local component state inside `AARounds.tsx`** — it's a pure UI timer concern and doesn't need to survive a re-render or be visible to the module. A `useEffect` on `anglesRevealed` starts a 2.5s timeout that sets local `continueVisible` to true.

**`ADVANCE_SUB_PAIR` reducer transition:**
```
ADVANCE_SUB_PAIR: { subPairIndex: prev + 1, anglesRevealed: false }
// continueVisible resets automatically because AARounds remounts or effect re-fires
```

| State | Student Sees | Student Can Do |
|-------|-------------|----------------|
| Entry (sub-pair 1) | Two triangles, dim angle labels, REVEAL MATCHES button | Observe, tap REVEAL MATCHES |
| After REVEAL (sub-pair 1) | Colors snap in — all 3 angle pairs share a color | Wait 2.5s → CONTINUE appears |
| After CONTINUE (sub-pair 2) | New pair, dim labels, REVEAL MATCHES again | Tap REVEAL MATCHES |
| After REVEAL (sub-pair 2) | 2 colors + 1 ghost — third angle pair doesn't match | Wait 2.5s → CONTINUE appears |
| After CONTINUE (completion) | Round completes → `roundState = 'completion'` | Click NEXT |

#### Prompt Copy

- Entry sub-pair 1: "Look at the angles. What do you notice?"
- After reveal sub-pair 1: "All three angle pairs match. What does that tell you?"
- Entry sub-pair 2: "What about this pair? Do all three need to match?"
- After reveal sub-pair 2: "Only two pairs match — and they're still similar."

#### Earned Reveal (completion)

```
'aa-discover': {
  text: 'Two matching angles is enough. If two pairs of angles are equal, the triangles must be similar.',
  notation: '∠A = ∠A′  and  ∠B = ∠B′  →  △ABC ∼ △A′B′C′',
  notationStyle: 'rule',
}
```

---

### `aa-confirm`

**ALD:** L5 — Verify and rule out  
**Concept:** AA works both ways — non-matching angles = not similar.

#### Data

One pair of NON-similar triangles. All three angle pairs are different (no accidental matches). SequenceBuilder available. No valid sequence exists.

#### Interaction Flow

1. Student sees two triangles with dim angle labels
2. SequenceBuilder is available (same as Phase 3) — attempts will fail
3. REVEAL MATCHES button always available
4. Student taps REVEAL MATCHES → all angles render ghost/gray (no color — no matches)
5. After reveal with zero matches detected: NOT SIMILAR button unlocks
6. Student presses NOT SIMILAR → round completes

**CHECK behavior when SequenceBuilder is used:** Normal miss feedback (`setSimilarityFeedback('miss')`). The student can try as many times as they want. No special messaging beyond the standard miss state.

**NOT SIMILAR button placement:** Rendered as a **sibling below the SequenceBuilder** in `DilationsModule`'s controls area — not inside `SequenceBuilder.tsx`. The `SequenceBuilder` prop interface is not modified. `DilationsModule` renders:

```tsx
// controls for aa-confirm:
<div className="flex flex-col">
  <SequenceBuilder ... />
  <NotSimilarButton
    disabled={!state.anglesRevealed || hasMatches}
    onClick={handleDeclareNotSimilar}
  />
</div>
```

`NotSimilarButton` is a small inline component (not a separate file) — a single button with ghost styling, 44px touch target, unlocks when `anglesRevealed && matchCount === 0`.

**aa-confirm completion controls:** When `roundState === 'completion'` (after NOT SIMILAR is pressed), the SequenceBuilder and NOT SIMILAR button are hidden. `ControlStrip` renders instead, showing the standard NEXT button. Same pattern as Phase 3 — `DilationsModule` already toggles between SequenceBuilder and ControlStrip based on phase + roundState.

#### Prompt Copy

- Entry: "Are these similar? Use the angles or the sequence builder to check."
- After reveal with no matches: "No angle pairs match."
- Completion: "AA works both ways. Non-matching angles = not similar."

#### Earned Reveal (completion)

```
'aa-confirm': {
  text: 'AA works both ways. If no two angle pairs match, no sequence of transformations can map one onto the other.',
}
```

---

### `capstone-final`

**ALD:** L5 — Synthesize across all phases  
**Concept:** Full module integration — AA check + sequence building.

#### Data: 3 Pairs

```
Pair 1 (Similar): translate + dilate
  isSimilar: true
  maxSteps: 2

Pair 2 (Not Similar): angles differ, no valid sequence
  isSimilar: false
  maxSteps: 0  // SequenceBuilder still available; won't succeed

Pair 3 (Similar): reflect or rotate + dilate (more complex)
  isSimilar: true
  maxSteps: 3
```

Exact triangle coordinates defined in `aaTasks.ts`. Constraints: fit within 20-unit world, distinct from Phase 3 task triangles, each pair visually distinguishable.

#### Component: `CapstonePairNavigator.tsx`

HTML component (outside Canvas). Renders:
- Pair progress indicator: "PAIR 1 / 3" with 3 LED dots (pending / current / done)
- Per-pair result chips: — (pending), ✓ (correct), × (not similar declared)
- SequenceBuilder (reused from Phase 3) for all pairs
- **NOT SIMILAR button:** Owned by `CapstonePairNavigator` (not inline in `DilationsModule`). Ghost/disabled until `anglesRevealed && matchCount === 0`. Rendered as a sibling below SequenceBuilder inside the navigator's flex column.
- NEXT PAIR / FINISH button after each pair is resolved

**NOT SIMILAR button ownership summary:**
- `aa-confirm`: Inline in `DilationsModule` controls area (simple round, no pair tracking needed)
- `capstone-final`: Owned by `CapstonePairNavigator` (it manages pair state and needs to co-locate the button with pair context)

Both implementations disable the button until `anglesRevealed === true && matchCount === 0`. The logic is the same; the containing component differs because the capstone navigator owns pair-level state that the confirm round doesn't need.

#### Per-Pair Flow

```
1. Pair appears (dim angle labels, SequenceBuilder, NOT SIMILAR disabled)
2. Student taps REVEAL MATCHES
3a. Matches found → SequenceBuilder active, NOT SIMILAR stays disabled
    → Student builds sequence → CHECK → on match → NEXT PAIR unlocks
3b. No matches → NOT SIMILAR unlocks
    → Student presses NOT SIMILAR → pair confirmed → NEXT PAIR unlocks
4. On NEXT PAIR: advance to next pair (repeat from 1)
5. After pair 3 resolved: CelebrationModal fires
```

#### Prompt Copy

- Entry: "Final challenge. For each pair — are they similar? If so, build the sequence."
- Per pair active (similar): "Angles match. Build the sequence that maps the pre-image onto the target."
- Per pair active (not similar, post-reveal): "No match. Declare it."
- All pairs complete: → CelebrationModal

---

## CelebrationModal — Dilations Branch

Add `moduleId === 'dilations'` branch to `DiscoveryTab.tsx`.

### Layout: Stats + Key Formulas

```
┌─────────────────────────────────────────────┐
│  ✓  (check icon, accent border)             │
│  You Proved It                              │
│  Through exploration, not explanation       │
│                                             │
│  [  4  ] [ 14 ] [  2  ]                    │
│  Phases   Rounds  Angles needed             │
│                                             │
│  ─────────────────────────────────────────  │
│  The coordinate rule you found              │
│      (x, y) → (kx, ky)              [acc]  │
│                                             │
│  ─────────────────────────────────────────  │
│  The criterion you proved                   │
│  ∠A = ∠A′ and ∠B = ∠B′ → △ ∼ △    [amb]  │
└─────────────────────────────────────────────┘
```

Stats row: `lab-data-font`, large numerals in accent green.  
Formulas: `lab-data-font`, coordinate rule in accent, AA criterion in amber (`--lab-earned`).

### BehindThisTab

Existing generic content is sufficient — no module-specific branch needed.

### GoDeeperTab

Existing generic content is sufficient.

---

## State Machine Extensions

Extend `useDilationsStage` and `StageAction` types:

### New State Fields

```ts
// In StageState:
subPairIndex: 0 | 1          // aa-discover only
anglesRevealed: boolean       // current pair/sub-pair has been revealed
capstonePairIndex: number     // 0, 1, 2 (capstone-final only)
capstonePairResults: ('pending' | 'similar' | 'not-similar')[]
```

### New Actions

```ts
| { type: 'REVEAL_ANGLES' }
  // → anglesRevealed: true

| { type: 'ADVANCE_SUB_PAIR' }
  // → subPairIndex: prev + 1, anglesRevealed: false

| { type: 'DECLARE_NOT_SIMILAR' }
  // → roundState: 'completion'   ← must set regardless of prior roundState
  //   (may be called from 'active' or 'prediction' — not just 'entry')

| { type: 'COMPLETE_CAPSTONE_PAIR'; result: 'similar' | 'not-similar' }
  // → capstonePairResults[capstonePairIndex]: result
  //   capstonePairIndex: prev + 1
  //   anglesRevealed: false
  //   If all 3 pairs complete → roundState: 'completion'

// RESET_PAIR_STATE removed — COMPLETE_CAPSTONE_PAIR already sets anglesRevealed: false on advance.
// No separate reset action is needed.
```

### `onComplete` Wiring

`DilationsModule` holds local `const [showCelebration, setShowCelebration] = useState(false)`.  
When `capstone-final` reaches `roundState === 'completion'` (all pairs done), `DilationsModule` sets `showCelebration = true`.  
`CelebrationModal` renders with `show={showCelebration}` and `moduleId="dilations"`.  
On modal dismiss (`onDismiss`): call `props.onComplete({ phases: 4, rounds: 14 })`.  
`App.tsx`'s `handleModuleComplete` receives this and transitions back to the module list.  
The "2 Angles needed" stat in `DiscoveryTab` is **hardcoded** in the dilations branch — it is a pedagogical constant, not a computed value from `onComplete`.

### Round ID and Phase ID Updates

`aa-discover`, `aa-confirm`, `capstone-final` are already in the `RoundId` union type and `ROUND_SEQUENCE` array. `aa-capstone` phase is already in `PhaseId`. No new type additions needed.

---

## New Files

| File | Purpose |
|------|---------|
| `components/AngleLabels.tsx` | R3F angle degree labels (sprite-based, color-matchable) |
| `rounds/AARounds.tsx` | Phase 4 scene: AAScene for aa-discover + aa-confirm |
| `components/CapstonePairNavigator.tsx` | HTML capstone pair tracker + controls |
| `utils/aaTasks.ts` | Sub-pair data + capstone pair constants |

### Modified Files

| File | Change |
|------|--------|
| `hooks/useDilationsStage.ts` | New state fields + 5 new action types |
| `dilations-copy.ts` | Earned reveals + round prompts for aa-discover, aa-confirm |
| `utils/constants.ts` | ROUND_CONFIGS entries for aa-discover, aa-confirm, capstone-final |
| `DilationsModule.tsx` | Phase 4 branch (isAAPhase flag), wires CapstonePairNavigator, fires CelebrationModal |
| `src/components/celebration/DiscoveryTab.tsx` | `moduleId === 'dilations'` branch |

---

## Copy Summary

### ROUND_PROMPTS additions

```ts
'aa-discover':   'Look at the angles. What do you notice?',
'aa-confirm':    'Are these similar? Use the angles or the sequence builder to check.',
'capstone-final': 'Final challenge. For each pair — are they similar? If so, build the sequence.',
```

### EARNED_REVEALS additions

```ts
'aa-discover': {
  text: 'Two matching angles is enough. If two pairs of angles are equal, the triangles must be similar.',
  notation: '∠A = ∠A′  and  ∠B = ∠B′  →  △ABC ∼ △A′B′C′',
  notationStyle: 'rule',
},
'aa-confirm': {
  text: 'AA works both ways. If no two angle pairs match, no sequence of transformations can map one onto the other.',
},
```

---

## Implementation Constraints

- `AngleLabels` must use CanvasTexture (no drei `<Text>`, no `<Html>`)
- `AngleLabels` geometry must be disposed in `useEffect` cleanup
- `anglesRevealed` resets to `false` on sub-pair advance and capstone pair advance
- `CelebrationModal` fires exactly once — on `capstone-final` completion only
- Module calls `onComplete({ phases: 4, rounds: 14 })` when `CelebrationModal` is dismissed
- Angle color matching uses ±2° tolerance (same floating-point reasoning as `trianglesMatch`)
- NOT SIMILAR button: ghost + `disabled` until `anglesRevealed === true && matchColors.every(c => c === GHOST_COLOR)`
- All buttons meet 44px minimum touch target
- `AngleLabels` color change (dim → match colors) works via `useMemo([color])` re-run causing texture recreation (canvas redraw + GPU upload for all 6 labels simultaneously). This is correct behavior with the CanvasTexture pattern. Do NOT attempt to lerp/animate the color — implement as an instant snap. The "snap in simultaneously" UX is intentional and consistent with this limitation.
- `AngleLabels` takes `visible` as an explicit prop (passed from `AARounds.tsx` which owns the round logic). Do not read from `DilationsSceneCtx.angleLabelsVisible` — that context flag is for generic visibility, but `AngleLabels` in Phase 4 is always explicitly controlled by the round component.
- `aaTasks.ts` triangle coordinates must be hand-verified: compute `triangleAngles()` for each pair and confirm the "only 2 match" sub-pair has a third angle pair that differs by more than 2°. The `aa-confirm` non-similar pair must have zero angle pairs within 2°.

---

## Teacher Guide Note

The Phase Cards layout (A) from the DiscoveryTab brainstorm is the right format for teacher-facing module guides — one card per phase showing the ALD level, key formula, and teaching strategy. Defer to when module guide docs are designed.
