# ISTE Visibility Sprint — Design Spec

**Date:** 2026-03-19
**Sprint doc:** `docs/ISTE_VISIBILITY_SPRINT.md`
**Goal:** Make the rigid-motions module's pedagogical architecture legible to an educator observing for 3–5 minutes, without the lab guide.
**Constraint:** Copy and small UI changes only. No new interaction patterns.

---

## What We're Building

Four sprint items — VIS-01 through VIS-04 — that together surface the module's L3→L4→L5 ALD progression and 8.G.A.1/2/3 standards alignment visibly in the UI.

---

## VIS-01 — Phase Label in Status Strip

### What

A static text label in the status strip that updates as the student crosses phase boundaries.

### Phase Mapping

No "explore" guide state exists in the current implementation. The module starts at `predict-translate`. Phase 01 has no corresponding guide state; the label starts at PHASE 02 on load.

| Guide states | Phase label |
|---|---|
| *(none — module starts here)* | PHASE 01 · SPATIAL EXPLORATION *(never shown)* |
| `predict-translate`, `predict-reflect`, `predict-rotate` | `PHASE 02 · PREDICT & REVEAL` |
| `coordinate-reveal`, `predict-with-coordinates-{translate,reflect,rotate}` | `PHASE 03 · COORDINATE LAYER` |
| `synthesis-reveal` *(new)*, `capstone` | `PHASE 04 · CAPSTONE` |

### Implementation

- Add `derivePhase(state: GuideState): 2 | 3 | 4` to `guide-state.ts`
- Add `PHASE_LABELS: Record<2 | 3 | 4, string>` to `rigid-motions-copy.ts`
- Render in `InstrumentModule.tsx` status strip: right of LED dots, lab-silk + lab-display-font, `--lab-text-muted`, 9px, tracking-[0.15em]

### Acceptance

- Label is visible on load (PHASE 02)
- Transitions to PHASE 03 on entering `coordinate-reveal`
- Transitions to PHASE 04 on entering `synthesis-reveal`
- Visible on both desktop and mobile

---

## VIS-02 — Layered Reveal Copy (Four-Beat Structure)

### What

Each transformation type (translate, reflect, rotate) follows a four-beat reveal sequence. Each beat earns one new layer of understanding. They accumulate.

```
Beat 0 — Spatial Predict Round 1: Properties preserved      (8.G.A.1)
Beat 1 — Spatial Predict Round 2: Coordinate rule           (8.G.A.3)
Beat 2 — Coordinate Predict Round 1: Vertex observation     (L3→L4 bridge)
Beat 3 — Coordinate Predict Round 2: Rule + congruence (≅)  (8.G.A.2)
```

### State Machine Change

Coordinate predict stages currently have `successesRequired: 1`. Changing to `successesRequired: 2` in `guide-state.ts` enables beats 2 and 3. Round pools are sufficient: translate has 2 rounds, reflect has 2, rotate has 3. Coordinate stages start at `stageRoundIndex: 1` (existing behavior) and wrap correctly.

### Data Model

```ts
// rigid-motions-copy.ts
export type RevealBeat = {
  text: string             // prose — lab-display-font, --lab-text
  notation?: string        // static notation — lab-data-font (congruence beats only)
  notationStyle?: 'congruence'  // 'rule' omitted — rules are computed, not stored
  trailingText?: string    // prose after notation — lab-display-font, --lab-text
}
```

Beat-1 (coordinate rule) notations are **not** stored in the copy deck. They are computed from `currentRound.params` at render time via:

```ts
// rigid-motions-copy.ts
export function formatCoordinateRule(params: TransformationParams): string
```

This keeps copy deck and math independent. Copy deck owns the prose; round data owns the formula.

### Key Lookup

`EARNED_REVEALS` changes from `Record<GuideState, string>` to `Record<string, RevealBeat>`, keyed by `'${guideState}-${beatIndex}'` where `beatIndex` is `stageSuccessCount` **at render time** (pre-increment). `stageSuccessCount` is React state read during render; `handleNext` increments it after the student advances. So:
- First match in a guide state: `stageSuccessCount === 0` → beat key suffix `-0`
- Second match (after pressing Next once): `stageSuccessCount === 1` → beat key suffix `-1`

`shownReveals` in `useRigidMotionsState.ts` changes key from `guideState` to `${guideState}-${stageSuccessCount}` so each beat is tracked independently. `shownReveals` is in-memory React state (`useState<Set<string>>`); it resets on module unmount and does not persist across sessions. Re-showing a beat after a page refresh is acceptable behavior.

**`successesRequired: 1→2` applies to all three coordinate-predict variants** (`predict-with-coordinates-translate`, `predict-with-coordinates-reflect`, `predict-with-coordinates-rotate`). All three change from `1` to `2`; all three have beat copy for indices 0 and 1. The current value is `1` in `guide-state.ts` for all three — the final implemented value must be `2`.

### Approved Copy Deck

**Translation**

| Key | text | notation | notationStyle | trailingText |
|---|---|---|---|---|
| `predict-translate-0` | Same distances. Same angles. Sliding the shape preserves everything. | — | — | — |
| `predict-translate-1` | Here's the rule for what you just did. | *computed from round* | rule | — |
| `predict-with-coordinates-translate-0` | Every vertex shifted by the same amount. Check the x-coordinates — then the y-coordinates. | — | — | — |
| `predict-with-coordinates-translate-1` | Translate every vertex the same way — distances and angles stay intact. | △ABC ≅ △A′B′C′ | congruence | Same shape, same size — that's congruence. |

**Reflection**

| Key | text | notation | notationStyle | trailingText |
|---|---|---|---|---|
| `predict-reflect-0` | Flipped, but same distances. Same angles. The mirror changed orientation, not the triangle. | — | — | — |
| `predict-reflect-1` | The axis you crossed? That coordinate flips. The other stays. | *computed from round* | rule | — |
| `predict-with-coordinates-reflect-0` | Look at each vertex. One coordinate changed sign. Which one — and why? | — | — | — |
| `predict-with-coordinates-reflect-1` | Flip one coordinate — the triangle mirrors, but distances and angles don't change. | △ABC ≅ △A′B′C′ | congruence | Still congruent. |

**Rotation**

| Key | text | notation | notationStyle | trailingText |
|---|---|---|---|---|
| `predict-rotate-0` | Turned, but same distances. Same angles. Rotation preserves everything. | — | — | — |
| `predict-rotate-1` | Here's the pattern in the coordinates. | *computed from round* | rule | — |
| `predict-with-coordinates-rotate-0` | Follow each vertex. How did (x, y) become the new coordinates? Look for the pattern. | — | — | — |
| `predict-with-coordinates-rotate-1` | Every vertex rotated the same angle around the origin. Distances and angles — preserved. | △ABC ≅ △A′B′C′ | congruence | Congruent. Every time. |

### `formatCoordinateRule` output by round

| Round ID | Output |
|---|---|
| `translate-5-3` | `(x, y) → (x + 5, y + 3)` |
| `translate-n3-n4` | `(x, y) → (x − 3, y − 4)` |
| `reflect-y` | `(x, y) → (−x, y)` |
| `reflect-x` | `(x, y) → (x, −y)` |
| `rotate-90-cw` | `(x, y) → (y, −x)` |
| `rotate-180` | `(x, y) → (−x, −y)` |
| `rotate-90-ccw` | `(x, y) → (−y, x)` |

### PromptReadout Extension

Add optional props to `PromptReadout`:

```ts
interface PromptReadoutProps {
  label: string
  text: string
  amber?: boolean
  notation?: string         // renders in lab-data-font below text
  notationStyle?: 'rule' | 'congruence'  // accent vs earned (amber) color
  trailingText?: string     // renders in lab-display-font below notation
}
```

Rendering:
- `notation` with `notationStyle: 'rule'`: `lab-data-font`, `--lab-accent`
- `notation` with `notationStyle: 'congruence'`: `lab-data-font`, `--lab-earned`
- `trailingText`: `lab-display-font`, `--lab-text`, same size as `text`

### PromptReadout vs RevealBeat `notationStyle`

`RevealBeat.notationStyle` is only ever `'congruence'` (stored beats are only congruence beats). `PromptReadout` props support both `'rule' | 'congruence'`. For beat-1, `InstrumentModule` passes `notationStyle: 'rule'` directly (not from `RevealBeat`) alongside the computed notation string. The `RevealBeat` type therefore omits `'rule'` — it is a call-site concern only.

### InstrumentModule assembly

```ts
const { successCount, /* existing fields */ } = useRigidMotionsState()

const beatKey = `${guideState}-${successCount}`
const beatFirstMatch = isMatch && !shownReveals.has(beatKey)
const earnedRevealBeat = EARNED_REVEALS[beatKey]  // undefined for capstone — uses existing path

// Beat-1 of SPATIAL stages: coordinate rule computed from round (not stored in copy deck)
// Beat-1 of COORDINATE stages (predict-with-coordinates-*): congruence notation (△ABC ≅ △A′B′C′)
//   comes from EARNED_REVEALS via earnedRevealBeat.notation — NOT from formatCoordinateRule.
// coordinate-reveal is safe from isBeat1 match because successesRequired: 0 means
//   successCount never reaches 1 there. If successesRequired changes for coordinate-reveal,
//   add an explicit `&& guideState !== 'coordinate-reveal'` guard.
const isBeat1 = successCount === 1 && !isCoordinateStage(guideState) && guideState !== 'capstone' && guideState !== 'synthesis-reveal'
const revealNotation = beatFirstMatch
  ? isBeat1 ? formatCoordinateRule(currentRound.params) : earnedRevealBeat?.notation
  : undefined
const revealNotationStyle: 'rule' | 'congruence' | undefined = beatFirstMatch
  ? isBeat1 ? 'rule' : earnedRevealBeat?.notationStyle
  : undefined
const revealTrailingText = beatFirstMatch ? earnedRevealBeat?.trailingText : undefined
```

Capstone earned reveals (`CAPSTONE_EARNED_REVEALS`, keyed by capstone round ID) remain `string` values on the existing path — no beat structure.

### Acceptance

- Each of the 12 beats shows exactly the correct layer
- ≅ appears ONLY in beat-3 (coordinate predict round 2) — never in spatial beats
- Coordinate rule notation is always correct for the active round
- Data font used for notation; prose font for text and trailingText

---

## VIS-03 — Synthesis Beat + Capstone Setup

### What

After all three transformation types complete (all coordinate predict rounds done), show a synthesis moment before the capstone. Pattern mirrors `coordinate-reveal`: passive state, `successesRequired: 0`, student presses CONTINUE to advance.

### New Guide State

Add `'synthesis-reveal'` to `GuideState` type and `GUIDE_STATE_SEQUENCE`:

```ts
{ state: 'synthesis-reveal', index: 7, transformationType: 'translate', successesRequired: 0 }
// capstone moves from index 7 to index 8
```

`GUIDE_STATE_TOTAL` in `InstrumentModule.tsx` becomes `GUIDE_STATE_SEQUENCE.length` (removes hardcoded `8`). **Implementer must grep for all `.index` usage and `GUIDE_STATE_TOTAL` references** to ensure no other consumers rely on the old count of 8.

### Transition mechanism

`nextGuideState()` in `guide-state.ts` handles the transition automatically — it reads the next entry in `GUIDE_STATE_SEQUENCE` by index. When `predict-with-coordinates-rotate` completes (2 successes), `nextGuideState()` returns `'synthesis-reveal'`. `synthesis-reveal` has `successesRequired: 0`, so when `handleNext` is called (student presses CONTINUE), `newSuccessCount >= 0` is immediately true, `stageComplete = true`, and `nextGuideState()` returns `'capstone'`. This is identical to how `coordinate-reveal` already works — no new mechanism needed.

`guideStateToStage('synthesis-reveal')` returns `null` (same as `'capstone'` — no active round stage). This value is used by `FormulaReadout` visibility gate and `handleCheck` stage guard; both treat `null` as "no active stage" and correctly skip processing.

### Copy

Synthesis prompt (shown as `promptText` when `guideState === 'synthesis-reveal'`):

| Part | Value |
|---|---|
| `text` | Translations, reflections, rotations. Three different moves — one result. |
| `notation` | △ABC ≅ △A′B′C′ |
| `notationStyle` | congruence |
| `trailingText` | Every rigid motion preserves distances and angles. Every one produces congruence. |

Capstone setup — update `CAPSTONE_PROMPT_TEXT['capstone-1']`:
> "You've proved what each move does. Now build a sequence."

### InstrumentModule handling

- `synthesis-reveal` treated like `coordinate-reveal`: shows `PromptReadout` with synthesis copy, no live ghost, no formula readout
- Phase label shows `PHASE 04 · CAPSTONE` when in `synthesis-reveal`
- `promptLabel` for `synthesis-reveal`: `'Synthesis'`
- **LED strip:** Hidden during `synthesis-reveal` (same as capstone). The `guideState !== 'capstone'` guard on the LED block becomes `guideState !== 'capstone' && guideState !== 'synthesis-reveal'`. `GUIDE_STATE_TOTAL` (derived from `GUIDE_STATE_SEQUENCE.length` = 9) is used only for the LED progress indicator, which is suppressed in both passive terminal states.
- **`shownReveals` safety:** `synthesis-reveal` has `guideStateToStage` returning `null`, so `handleCheck` returns early and never calls `setShownReveals`. No beat key is ever added for `synthesis-reveal`. Safe for the same reason as `coordinate-reveal` — `successesRequired: 0` means the check path is never reached.

### Acceptance

- Synthesis moment appears exactly once, after all rotation coordinate rounds complete
- Uses ≅ in data-font amber
- Capstone setup copy frames the task as a challenge
- CONTINUE advances to capstone

---

## VIS-04 — Capstone Celebration

### What

Update the capstone celebration modal to explicitly name congruence.

### Changes

**`CAPSTONE_COMPLETION_COPY`** in `rigid-motions-copy.ts`:

| Key | New value |
|---|---|
| `capstone-1` | One rigid motion mapped △ABC onto △A″B″C″. Congruence — proved by construction. |
| `capstone-2` | Two steps, one proof. You built the sequence that shows △ABC ≅ △A″B″C″. |
| `capstone-3` | You found the order that works. △ABC ≅ △A″B″C″ — rigid motions compose. |

**`RigidMotionsDiscovery`** in `DiscoveryTab.tsx` — add a congruence block after the sequence chips, before `completionCopy`. **Render condition:** unconditional within `RigidMotionsDiscovery`. The modal only opens after all 3 capstone rounds complete (`showCelebration` set only when `capstoneRoundIndex === CAPSTONE_ROUNDS.length - 1` and result is `'match'`), so `RigidMotionsDiscovery` is always a full-completion state.

```tsx
<p className="text-center text-sm lab-display-font text-(--lab-earned)">
  You proved △ABC ≅ △A″B″C″ by describing a sequence of rigid motions.
</p>
```

**PED-02 pre-verification (done):** `capstone-1/2/3` IDs are consistent across `capstone-utils.ts` (source of truth), `rigid-motions-copy.ts` (`CAPSTONE_COMPLETION_COPY`), and `DiscoveryTab.tsx` (roundId derivation). VIS-04 copy changes are not no-ops.

### Acceptance

- Celebration uses the word "congruent" / ≅ symbol
- Connects congruence to the sequence the student built
- Amber color on congruence statement

---

## File Touch List

| File | Change |
|---|---|
| `types.ts` | Add `'synthesis-reveal'` to `GuideState` union |
| `guide-state.ts` | Add synthesis-reveal entry; coord `successesRequired` 1→2; add `derivePhase()`; update `guideStateToStage` for synthesis-reveal |
| `rigid-motions-copy.ts` | `RevealBeat` type; `formatCoordinateRule()`; `EARNED_REVEALS` restructure; `PHASE_LABELS`; synthesis copy; update `CAPSTONE_COMPLETION_COPY`; update `CAPSTONE_PROMPT_TEXT['capstone-1']` |
| `hooks/useRigidMotionsState.ts` | Beat-keyed `shownReveals` (`${guideState}-${stageSuccessCount}`); add `stageSuccessCount` to `handleCheck` dependencies |
| `components/PromptReadout.tsx` | Add `notation`, `notationStyle`, `trailingText` props and rendering |
| `InstrumentModule.tsx` | Phase label in status strip; synthesis-reveal handling; beat-indexed reveal selection; derived `GUIDE_STATE_TOTAL` |
| `celebration/DiscoveryTab.tsx` | Congruence block in `RigidMotionsDiscovery` |

**7 files total. All within rigid-motions module or celebration component. No new dependencies.**

---

## Order of Implementation

1. **VIS-02** — Largest change; touches copy, state hook, PromptReadout
2. **VIS-03** — Depends on VIS-02 copy being in place; adds synthesis-reveal state
3. **VIS-01** — Independent; adds phase label (can be done alongside VIS-02/03)
4. **VIS-04** — Independent; celebration copy

---

## What This Sprint Does NOT Include

- No new interaction mechanics or round types
- No free-explore guide state restoration (separate decision)
- No journaling or written-response layer
- No PED-04 commitment-before-feedback changes
- No lab guide integration
