# ISTE Visibility Sprint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the rigid-motions module's pedagogical architecture (phase labels, four-beat layered reveals, synthesis moment, congruence language) so an educator can read the L3→L4→L5 progression without the lab guide.

**Architecture:** Add a `synthesis-reveal` guide state, restructure `EARNED_REVEALS` into beat-indexed `RevealBeat` objects, compute coordinate-rule notation from round data at render time, and thread notation/trailingText through `PromptReadout`. Phase labels derive from `guideState` via a pure `derivePhase()` function.

**Tech Stack:** React 19, TypeScript, Vitest, @testing-library/react, Tailwind CSS 4, JetBrains Mono (`lab-data-font`), Inter Tight (`lab-display-font`).

**Spec:** `docs/superpowers/specs/2026-03-19-iste-visibility-sprint-design.md`

---

## File Map

| File | Role | Task |
|---|---|---|
| `src/components/modules/rigid-motions/types.ts` | Add `'synthesis-reveal'` to `GuideState` | 1 |
| `src/components/modules/rigid-motions/guide-state.ts` | Add synthesis-reveal entry; coord `successesRequired` 1→2; `derivePhase()` | 1 |
| `src/components/modules/rigid-motions/__tests__/guide-state.test.ts` | Update 3 stale assertions; add `derivePhase` tests | 1 |
| `src/components/modules/rigid-motions/rigid-motions-copy.ts` | `RevealBeat` type; `EARNED_REVEALS` restructure; `formatCoordinateRule`; `PHASE_LABELS`; synthesis copy; updated `CAPSTONE_COMPLETION_COPY` + `CAPSTONE_PROMPT_TEXT` | 2 |
| `src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts` | `formatCoordinateRule` unit tests (new file) | 2 |
| `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts` | Beat-keyed `shownReveals` in `handleCheck` | 3 |
| `src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts` | Beat-keyed `shownReveals` tests | 3 |
| `src/components/modules/rigid-motions/components/PromptReadout.tsx` | Add `notation`, `notationStyle`, `trailingText` props | 4 |
| `src/components/modules/rigid-motions/InstrumentModule.tsx` | Phase label; beat selection; synthesis-reveal handling; derived `GUIDE_STATE_TOTAL`; LED guard | 5 |
| `src/components/celebration/DiscoveryTab.tsx` | Congruence block in `RigidMotionsDiscovery` | 6 |

---

## Task 1: Foundation — Types + Guide State

**Files:**
- Modify: `src/components/modules/rigid-motions/types.ts`
- Modify: `src/components/modules/rigid-motions/guide-state.ts`
- Modify: `src/components/modules/rigid-motions/__tests__/guide-state.test.ts`

- [ ] **Step 1: Update failing tests first**

Open `src/components/modules/rigid-motions/__tests__/guide-state.test.ts` and make these three changes:

```ts
// Line 12 — update length assertion
it('has 9 states', () => {
  expect(GUIDE_STATE_SEQUENCE).toHaveLength(9)
})

// Line 33 — update successesRequired for coord predict states
it('coordinate predict states require 2 successes each', () => {
  const coordPredict = [
    'predict-with-coordinates-translate',
    'predict-with-coordinates-reflect',
    'predict-with-coordinates-rotate',
  ] as const
  coordPredict.forEach(state => {
    expect(getGuideStateConfig(state).successesRequired).toBe(2)
  })
})

// Line 57 — update nextGuideState chain (synthesis-reveal inserted before capstone)
expect(nextGuideState('predict-with-coordinates-rotate')).toBe('synthesis-reveal')
expect(nextGuideState('synthesis-reveal')).toBe('capstone')
expect(nextGuideState('capstone')).toBeNull()
```

Also add a new `describe` block at the end of the file for the new additions:

```ts
describe('synthesis-reveal guide state', () => {
  it('exists at index 7', () => {
    expect(getGuideStateConfig('synthesis-reveal').index).toBe(7)
  })

  it('has successesRequired: 0', () => {
    expect(getGuideStateConfig('synthesis-reveal').successesRequired).toBe(0)
  })

  it('capstone shifts to index 8', () => {
    expect(getGuideStateConfig('capstone').index).toBe(8)
  })

  it('guideStateToStage returns null', () => {
    expect(guideStateToStage('synthesis-reveal')).toBeNull()
  })

  it('isCoordinateStage returns false', () => {
    expect(isCoordinateStage('synthesis-reveal')).toBe(false)
  })
})

describe('derivePhase', () => {
  it('returns 2 for spatial predict states', () => {
    expect(derivePhase('predict-translate')).toBe(2)
    expect(derivePhase('predict-reflect')).toBe(2)
    expect(derivePhase('predict-rotate')).toBe(2)
  })

  it('returns 3 for coordinate-reveal and coordinate predict states', () => {
    expect(derivePhase('coordinate-reveal')).toBe(3)
    expect(derivePhase('predict-with-coordinates-translate')).toBe(3)
    expect(derivePhase('predict-with-coordinates-reflect')).toBe(3)
    expect(derivePhase('predict-with-coordinates-rotate')).toBe(3)
  })

  it('returns 4 for synthesis-reveal and capstone', () => {
    expect(derivePhase('synthesis-reveal')).toBe(4)
    expect(derivePhase('capstone')).toBe(4)
  })
})
```

Add `derivePhase` to the import at the top of the file.

- [ ] **Step 2: Run tests — verify they fail**

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/guide-state.test.ts
```

Expected: multiple failures (has 8 states, Phase 3 require 1, nextGuideState chain, `synthesis-reveal` not found, `derivePhase` not exported).

- [ ] **Step 3: Add `'synthesis-reveal'` to `GuideState` in `types.ts`**

```ts
export type GuideState =
  | 'predict-translate'
  | 'predict-reflect'
  | 'predict-rotate'
  | 'coordinate-reveal'
  | 'predict-with-coordinates-translate'
  | 'predict-with-coordinates-reflect'
  | 'predict-with-coordinates-rotate'
  | 'synthesis-reveal'   // ← new
  | 'capstone'
```

- [ ] **Step 4: Update `guide-state.ts`**

Four changes in one edit:

**4a — Update `GUIDE_STATE_SEQUENCE`** (coord `successesRequired` 1→2, add synthesis-reveal at index 7, capstone shifts to index 8):

```ts
export const GUIDE_STATE_SEQUENCE: GuideStateConfig[] = [
  { state: 'predict-translate',                  index: 0, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-reflect',                    index: 1, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-rotate',                     index: 2, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'coordinate-reveal',                  index: 3, transformationType: 'translate', successesRequired: 0 },
  { state: 'predict-with-coordinates-translate', index: 4, transformationType: 'translate', successesRequired: 2 },
  { state: 'predict-with-coordinates-reflect',   index: 5, transformationType: 'reflect',   successesRequired: 2 },
  { state: 'predict-with-coordinates-rotate',    index: 6, transformationType: 'rotate',    successesRequired: 2 },
  { state: 'synthesis-reveal',                   index: 7, transformationType: 'translate', successesRequired: 0 },
  { state: 'capstone',                           index: 8, transformationType: 'translate', successesRequired: 3 },
]
```

**4b — Verify `guideStateToStage`** (synthesis-reveal should fall through to `default: return null`):

Open `guide-state.ts` and confirm the switch statement ends with `default: return null`. The current implementation does have this default. If — for any reason — the switch uses TypeScript exhaustive checking without a default (it does not currently), you would need to add an explicit `case 'synthesis-reveal': return null`. Confirm visually before proceeding. No code change is expected.

**4c — Add `derivePhase`** at the bottom of the file (after `isCoordinateStage`):

```ts
/**
 * Maps a guide state to its display phase number (2–4).
 * Phase 01 has no corresponding guide state — the module starts at Phase 02.
 *   Phase 02: spatial predict (indices 0–2)
 *   Phase 03: coordinate-reveal + coordinate predict (indices 3–6)
 *   Phase 04: synthesis-reveal + capstone (indices 7–8)
 */
export function derivePhase(state: GuideState): 2 | 3 | 4 {
  if (state === 'capstone' || state === 'synthesis-reveal') return 4
  const index = getGuideStateConfig(state).index
  return index >= 3 ? 3 : 2
}
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/guide-state.test.ts
```

Expected: all tests pass.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
pnpm build
```

Expected: build succeeds (TypeScript may warn about `synthesis-reveal` not handled in switch statements elsewhere — fix any exhaustive switch errors before committing).

If `handleCheck` in `useRigidMotionsState.ts` has a `guideStateToStage(guideState)` call that may now encounter `synthesis-reveal` — it already returns early when `stage` is null, so no change needed.

- [ ] **Step 7: Commit**

```bash
git add src/components/modules/rigid-motions/types.ts \
        src/components/modules/rigid-motions/guide-state.ts \
        src/components/modules/rigid-motions/__tests__/guide-state.test.ts
git commit -m "feat(rigid-motions): add synthesis-reveal guide state, derivePhase, coord successesRequired 1→2"
```

---

## Task 2: Copy Deck

**Files:**
- Modify: `src/components/modules/rigid-motions/rigid-motions-copy.ts`
- Create: `src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts`

- [ ] **Step 1: Write failing tests for `formatCoordinateRule`**

Create `src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatCoordinateRule } from '../rigid-motions-copy'

describe('formatCoordinateRule', () => {
  it('formats translation with positive offsets', () => {
    expect(formatCoordinateRule({ type: 'translate', dx: 5, dy: 3 })).toBe('(x, y) → (x + 5, y + 3)')
  })

  it('formats translation with negative offsets using minus sign', () => {
    expect(formatCoordinateRule({ type: 'translate', dx: -3, dy: -4 })).toBe('(x, y) → (x − 3, y − 4)')
  })

  it('formats y-axis reflection', () => {
    expect(formatCoordinateRule({ type: 'reflect', axis: 'y' })).toBe('(x, y) → (−x, y)')
  })

  it('formats x-axis reflection', () => {
    expect(formatCoordinateRule({ type: 'reflect', axis: 'x' })).toBe('(x, y) → (x, −y)')
  })

  it('formats 90° clockwise rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 90, direction: 'cw' })).toBe('(x, y) → (y, −x)')
  })

  it('formats 180° rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 180, direction: 'cw' })).toBe('(x, y) → (−x, −y)')
  })

  it('formats 90° counter-clockwise rotation', () => {
    expect(formatCoordinateRule({ type: 'rotate', degrees: 90, direction: 'ccw' })).toBe('(x, y) → (−y, x)')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts
```

Expected: FAIL — `formatCoordinateRule` not exported.

- [ ] **Step 3: Replace `rigid-motions-copy.ts` content**

Make the following changes to `rigid-motions-copy.ts`. Keep all existing exports (`PROMPT_TEXT`, `CLOSE_COPY`, `FEEDBACK_COPY`, `CAPSTONE_EARNED_REVEALS`, `BEHIND_THIS`). Replace/add the rest:

**Add import at the top** (after the existing `import type { FeedbackState, GuideState } from './types'`):

```ts
import type { TransformationParams } from '@/lib/types/transforms'
```

**Add `RevealBeat` type and `EARNED_REVEALS`** (replace the old `EARNED_REVEALS: Record<GuideState, string>`):

```ts
export type RevealBeat = {
  text: string
  notation?: string          // static string — congruence beats only
  notationStyle?: 'congruence'  // 'rule' is set at call site, never stored
  trailingText?: string
}

// Keyed by `${guideState}-${beatIndex}` where beatIndex = stageSuccessCount at render time.
// Beat-1 (spatial stages) notation is computed at render time via formatCoordinateRule —
// those entries have no notation field here.
export const EARNED_REVEALS: Record<string, RevealBeat> = {
  'predict-translate-0': {
    text: "Same distances. Same angles. Sliding the shape preserves everything.",
  },
  'predict-translate-1': {
    text: "Here's the rule for what you just did.",
  },
  'predict-with-coordinates-translate-0': {
    text: "Every vertex shifted by the same amount. Check the x-coordinates — then the y-coordinates.",
  },
  'predict-with-coordinates-translate-1': {
    text: "Translate every vertex the same way — distances and angles stay intact.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Same shape, same size — that's congruence.",
  },
  'predict-reflect-0': {
    text: "Flipped, but same distances. Same angles. The mirror changed orientation, not the triangle.",
  },
  'predict-reflect-1': {
    text: "The axis you crossed? That coordinate flips. The other stays.",
  },
  'predict-with-coordinates-reflect-0': {
    text: "Look at each vertex. One coordinate changed sign. Which one — and why?",
  },
  'predict-with-coordinates-reflect-1': {
    text: "Flip one coordinate — the triangle mirrors, but distances and angles don't change.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Still congruent.",
  },
  'predict-rotate-0': {
    text: "Turned, but same distances. Same angles. Rotation preserves everything.",
  },
  'predict-rotate-1': {
    text: "Here's the pattern in the coordinates.",
  },
  'predict-with-coordinates-rotate-0': {
    text: "Follow each vertex. How did (x, y) become the new coordinates? Look for the pattern.",
  },
  'predict-with-coordinates-rotate-1': {
    text: "Every vertex rotated the same angle around the origin. Distances and angles — preserved.",
    notation: "△ABC ≅ △A′B′C′",
    notationStyle: 'congruence',
    trailingText: "Congruent. Every time.",
  },
}
```

**Add `SYNTHESIS_REVEAL`, `PHASE_LABELS`, `formatCoordinateRule`**:

```ts
export const SYNTHESIS_REVEAL: RevealBeat = {
  text: "Translations, reflections, rotations. Three different moves — one result.",
  notation: "△ABC ≅ △A′B′C′",
  notationStyle: 'congruence',
  trailingText: "Every rigid motion preserves distances and angles. Every one produces congruence.",
}

export const PHASE_LABELS: Record<2 | 3 | 4, string> = {
  2: 'PHASE 02 · PREDICT & REVEAL',
  3: 'PHASE 03 · COORDINATE LAYER',
  4: 'PHASE 04 · CAPSTONE',
}

/**
 * Returns the coordinate transformation rule as a display string.
 * Called at render time for beat-1 spatial reveals — not stored in EARNED_REVEALS.
 * Uses typographic minus sign (−) not hyphen (-) for readability.
 */
export function formatCoordinateRule(params: TransformationParams): string {
  if (params.type === 'translate') {
    const dx = params.dx >= 0 ? `x + ${params.dx}` : `x − ${Math.abs(params.dx)}`
    const dy = params.dy >= 0 ? `y + ${params.dy}` : `y − ${Math.abs(params.dy)}`
    return `(x, y) → (${dx}, ${dy})`
  }
  if (params.type === 'reflect') {
    return params.axis === 'y' ? '(x, y) → (−x, y)' : '(x, y) → (x, −y)'
  }
  // rotate
  if (params.degrees === 90 && params.direction === 'cw')  return '(x, y) → (y, −x)'
  if (params.degrees === 180)                               return '(x, y) → (−x, −y)'
  if (params.degrees === 90 && params.direction === 'ccw') return '(x, y) → (−y, x)'
  return '(x, y) → (?)'
}
```

**Update `CAPSTONE_COMPLETION_COPY`** (replace existing):

```ts
export const CAPSTONE_COMPLETION_COPY: Record<string, string> = {
  'capstone-1': 'One rigid motion mapped △ABC onto △A″B″C″. Congruence — proved by construction.',
  'capstone-2': 'Two steps, one proof. You built the sequence that shows △ABC ≅ △A″B″C″.',
  'capstone-3': 'You found the order that works. △ABC ≅ △A″B″C″ — rigid motions compose.',
}
```

**Update `CAPSTONE_PROMPT_TEXT['capstone-1']`** (replace first entry):

```ts
export const CAPSTONE_PROMPT_TEXT: Record<CapstoneRoundId, string> = {
  'capstone-1': "You've proved what each move does. Now build a sequence.",
  'capstone-2': 'This one takes two steps. Build your sequence — the order you choose determines the result.',
  'capstone-3': 'Two steps again. If your first attempt misses, try reversing the order.',
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts
```

Expected: all 7 `formatCoordinateRule` tests pass.

- [ ] **Step 5: Run all rigid-motions tests**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: all pass (guide-state tests pass, new copy tests pass, existing hook tests pass).

- [ ] **Step 6: Build check**

```bash
pnpm build
```

Expected: passes. If `InstrumentModule.tsx` shows TypeScript errors about `EARNED_REVEALS[guideState]` (wrong key type), that's expected — it will be fixed in Task 5.

- [ ] **Step 7: Commit**

```bash
git add src/components/modules/rigid-motions/rigid-motions-copy.ts \
        src/components/modules/rigid-motions/__tests__/rigid-motions-copy.test.ts
git commit -m "feat(rigid-motions): layered RevealBeat copy deck, formatCoordinateRule, phase labels, synthesis reveal"
```

---

## Task 3: State Hook — Beat-Keyed `shownReveals`

**Files:**
- Modify: `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts`
- Modify: `src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `useRigidMotionsState.test.ts`:

```ts
describe('useRigidMotionsState — beat-keyed shownReveals', () => {
  it('shownReveals is initially empty', () => {
    const { result } = renderHook(() => useRigidMotionsState())
    expect(result.current.shownReveals.size).toBe(0)
  })

  it('does not add a beat key before CHECK is called', () => {
    const { result } = renderHook(() => useRigidMotionsState())
    // Beat key would be 'predict-translate-0' on first match
    expect(result.current.shownReveals.has('predict-translate-0')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test — verify they pass already** (these are state-only assertions; run to confirm baseline)

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts
```

Expected: existing tests pass, new tests pass (shownReveals is empty at start).

- [ ] **Step 3: Update `handleCheck` in `useRigidMotionsState.ts`**

Find the `setShownReveals` call inside `handleCheck` and change the key from `guideState` to `${guideState}-${stageSuccessCount}`:

```ts
// Before:
if (result === 'match') {
  setShownReveals(prev => {
    if (prev.has(guideState)) return prev
    const next = new Set(prev)
    next.add(guideState)
    return next
  })
}

// After:
if (result === 'match') {
  setShownReveals(prev => {
    const beatKey = `${guideState}-${stageSuccessCount}`
    if (prev.has(beatKey)) return prev
    const next = new Set(prev)
    next.add(beatKey)
    return next
  })
}
```

Also add `stageSuccessCount` to the `useCallback` dependency array for `handleCheck`:

```ts
}, [guideState, ghostOffset, flipped, rotationDegrees, rotationDirection, currentRound, stageSuccessCount])
```

- [ ] **Step 4: Run all tests**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: all pass.

- [ ] **Step 5: Build check**

```bash
pnpm build
```

Expected: passes (the `shownReveals` type remains `Set<string>` — no type signature change needed).

- [ ] **Step 6: Commit**

```bash
git add src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts \
        src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts
git commit -m "feat(rigid-motions): beat-keyed shownReveals for per-round earned reveal tracking"
```

---

## Task 4: PromptReadout — Notation Props

**Files:**
- Modify: `src/components/modules/rigid-motions/components/PromptReadout.tsx`

No unit test for this component — verified visually via the running app and by TypeScript compile.

- [ ] **Step 1: Extend `PromptReadout.tsx`**

Replace the entire file with:

```tsx
// src/components/modules/rigid-motions/components/PromptReadout.tsx
import { useRef, useEffect } from 'react'
import { fadeInReadout } from '@/lib/animation/presets'

interface PromptReadoutProps {
  label: string
  text: string
  amber?: boolean
  /** Notation line — renders in lab-data-font below text */
  notation?: string
  /** Color for notation: 'rule' = accent green, 'congruence' = earned amber */
  notationStyle?: 'rule' | 'congruence'
  /** Prose line rendered below notation in lab-display-font */
  trailingText?: string
}

/**
 * Prompt label + text with optional notation and trailing text.
 * Used in both mobile (above-scene) and desktop (bottom-panel left) positions.
 * Each instance manages its own ref and animation.
 */
export function PromptReadout({
  label,
  text,
  amber = false,
  notation,
  notationStyle,
  trailingText,
}: PromptReadoutProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) fadeInReadout(ref.current)
  }, [text])

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className="px-5 py-1.5 md:px-4 md:py-3"
    >
      <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
        {label}
      </div>
      <p className={[
        'text-sm font-medium lab-display-font',
        amber ? 'text-(--lab-earned)' : 'text-(--lab-text)',
      ].join(' ')}>
        {text}
      </p>
      {notation && (
        <p className={[
          'text-sm font-medium lab-data-font mt-1',
          notationStyle === 'congruence' ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
        ].join(' ')}>
          {notation}
        </p>
      )}
      {trailingText && (
        <p className="text-sm font-medium lab-display-font text-(--lab-text) mt-0.5">
          {trailingText}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: passes. TypeScript will verify any consumers pass the correct prop types.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/rigid-motions/components/PromptReadout.tsx
git commit -m "feat(rigid-motions): extend PromptReadout with notation, notationStyle, trailingText props"
```

---

## Task 5: InstrumentModule — Wire Everything

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

This task wires VIS-01 (phase label), VIS-02 (beat selection), and VIS-03 (synthesis-reveal handling) into the orchestrator component.

- [ ] **Step 1: Update imports**

Add to the import from `./rigid-motions-copy`:

```ts
import {
  PROMPT_TEXT,
  CLOSE_COPY,
  EARNED_REVEALS,
  type RevealBeat,
  SYNTHESIS_REVEAL,
  PHASE_LABELS,
  formatCoordinateRule,
  CAPSTONE_EARNED_REVEALS,
  CAPSTONE_PROMPT_TEXT,
  type CapstoneRoundId,
} from './rigid-motions-copy'
```

Add to the import from `./guide-state`:

```ts
import { isCoordinateStage, getGuideStateConfig, derivePhase, GUIDE_STATE_SEQUENCE } from './guide-state'
```

- [ ] **Step 2: Update `GUIDE_STATE_TOTAL` and destructure `successCount`**

Replace the hardcoded constant and add `successCount` to destructuring:

```ts
// Replace: const GUIDE_STATE_TOTAL = 8
const GUIDE_STATE_TOTAL = GUIDE_STATE_SEQUENCE.length  // 9

// Add successCount to destructuring from useRigidMotionsState:
const {
  // ... existing fields ...
  successCount,   // ← add this
  shownReveals,
} = useRigidMotionsState()
```

- [ ] **Step 3: Replace reveal key logic**

Replace the existing `revealKey`, `firstMatch`, `repeatMatch`, `earnedRevealText` block with the beat-indexed version.

**Note on naming:** The spec pseudocode uses separate `beatFirstMatch` and `beatKey` variables and handles the capstone path in a separate branch. This plan uses a unified `revealKey` that selects between `beatKey` (non-capstone) and `capstoneRound.id` (capstone). The resulting `firstMatch` is equivalent in behavior to the spec's `beatFirstMatch` for non-capstone states, and to the existing capstone firstMatch logic for capstone. The unified approach is simpler and removes the separate branch.

```ts
// Earn reveal key — beat-indexed for non-capstone, round-id for capstone
const beatKey = `${guideState}-${successCount}`
const revealKey = guideState === 'capstone' ? capstoneRound.id : beatKey
const firstMatch  = isMatch && !shownReveals.has(revealKey)
const repeatMatch = isMatch &&  shownReveals.has(revealKey)

// Capstone reveal is still a plain string (no beat structure)
const capstoneRevealText = guideState === 'capstone'
  ? CAPSTONE_EARNED_REVEALS[capstoneRound.id as CapstoneRoundId]
  : undefined

// Non-capstone beat reveal (RevealBeat object)
const earnedRevealBeat: RevealBeat | undefined =
  guideState !== 'capstone' && guideState !== 'synthesis-reveal'
    ? EARNED_REVEALS[beatKey]
    : undefined

// Beat-1 spatial stages: notation computed from round (not stored in copy deck)
// Beat-1 coordinate stages (isCoordinateStage): notation is △ABC ≅ from earnedRevealBeat.notation
// Safety: coordinate-reveal never reaches isBeat1 because successesRequired: 0
const isBeat1 = successCount === 1
  && !isCoordinateStage(guideState)
  && guideState !== 'capstone'
  && guideState !== 'synthesis-reveal'

// Notation and trailing text passed to PromptReadout
const revealNotation = firstMatch
  ? isBeat1
    ? formatCoordinateRule(currentRound.params)
    : earnedRevealBeat?.notation
  : undefined
const revealNotationStyle: 'rule' | 'congruence' | undefined = firstMatch
  ? isBeat1 ? 'rule' : earnedRevealBeat?.notationStyle
  : undefined
const revealTrailingText = firstMatch ? earnedRevealBeat?.trailingText : undefined
```

- [ ] **Step 4: Update `promptText` computation**

```ts
const promptText = (() => {
  if (guideState === 'synthesis-reveal')
    return SYNTHESIS_REVEAL.text
  if (guideState === 'capstone' && feedbackState === 'idle')
    return CAPSTONE_PROMPT_TEXT[capstoneRound.id as CapstoneRoundId]
  if (firstMatch) {
    // earnedRevealBeat is undefined for capstone; capstoneRevealText covers that path.
    // If both are undefined (unrecognized round ID), falls through to 'Make your prediction.' — acceptable.
    const text = earnedRevealBeat?.text ?? capstoneRevealText
    if (text) return text
  }
  if (repeatMatch)  return 'Match.'
  if (isMiss)       return 'Not quite — adjust your position.'
  if (isClose)      return CLOSE_COPY[guideState] ?? 'Getting closer.'
  return PROMPT_TEXT[currentRound.id] ?? 'Make your prediction.'
})()
```

- [ ] **Step 5: Update `promptLabel`**

```ts
const promptLabel =
  guideState === 'capstone'          ? 'Build' :
  guideState === 'synthesis-reveal'  ? 'Synthesis' :
  guideState === 'coordinate-reveal' ? 'Reveal' :
  isCoordinateStage(guideState)      ? 'Coordinate Rule' :
  firstMatch                         ? 'Discovered' :
  isMiss || isClose                  ? 'Hint' :
  'Predict'
```

- [ ] **Step 6: Update `liveGhostVertices` (add synthesis-reveal guard)**

```ts
// No live ghost in coordinate-reveal, synthesis-reveal, or capstone
const liveGhostVertices =
  (guideState === 'coordinate-reveal' || guideState === 'synthesis-reveal' || guideState === 'capstone')
    ? undefined
    : computeGhostVertices(ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis) as [number, number][]
```

- [ ] **Step 7: Update LED guard in status strip**

```tsx
// Before: guideState !== 'capstone'
// After: hide LEDs during both passive terminal states
{guideState !== 'capstone' && guideState !== 'synthesis-reveal' ? (
  <div
    className="flex flex-1 items-center justify-center gap-1"
    aria-label={`Step ${currentGuideIndex + 1} of ${GUIDE_STATE_TOTAL}`}
  >
    {Array.from({ length: GUIDE_STATE_TOTAL }, (_, i) => (
      <span
        key={i}
        className={[
          'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
          i < currentGuideIndex
            ? 'bg-(--lab-success) border-(--lab-led-completed-border)'
            : i === currentGuideIndex
              ? 'bg-(--lab-accent) border-(--lab-accent-muted)'
              : 'bg-transparent border-(--lab-ghost)/40',
        ].join(' ')}
      />
    ))}
  </div>
) : (
  <div className="flex-1" aria-hidden />
)}
```

- [ ] **Step 8: Add phase label — replace invisible spacer in status strip**

Replace the `<span ... invisible ...>` spacer with the visible phase label:

```tsx
{/* Right: phase label (replaces invisible spacer) */}
<span className="shrink-0 lab-silk lab-display-font text-[9px] tracking-[0.15em] text-(--lab-text-muted)">
  {PHASE_LABELS[derivePhase(guideState)]}
</span>
```

- [ ] **Step 9: Update `PromptReadout` call to pass notation props**

Find the `<PromptReadout` JSX (appears in two places in Layout — mobile and desktop). For synthesis-reveal, notation/trailingText come from `SYNTHESIS_REVEAL`; for normal reveals they come from `revealNotation`/etc.

```tsx
// Notation for synthesis-reveal is always shown; for reveals only on firstMatch
const displayNotation       = guideState === 'synthesis-reveal' ? SYNTHESIS_REVEAL.notation      : revealNotation
const displayNotationStyle  = guideState === 'synthesis-reveal' ? SYNTHESIS_REVEAL.notationStyle : revealNotationStyle
const displayTrailingText   = guideState === 'synthesis-reveal' ? SYNTHESIS_REVEAL.trailingText  : revealTrailingText

// ...

prompt={
  <PromptReadout
    label={promptLabel}
    text={promptText}
    amber={firstMatch}
    notation={displayNotation}
    notationStyle={displayNotationStyle}
    trailingText={displayTrailingText}
  />
}
```

Note: `PromptReadout` appears once as the `prompt` prop to `ModuleLayout`, which renders it in up to three positions (mobile top, landscape panel, desktop inline). All positions receive the same `prompt` node — one update covers all.

- [ ] **Step 10: Update `currentGuideIndex` for synthesis-reveal**

`synthesis-reveal` has a valid index (7) in `GUIDE_STATE_SEQUENCE`, so we can simply widen the capstone-only exclusion. The LED block is already hidden during `synthesis-reveal` (Step 7 guard), so the value is never rendered for that state — but using the real index is cleaner than returning -1.

```ts
// Only capstone has no LED position; synthesis-reveal uses its real index (7)
const currentGuideIndex = guideState !== 'capstone'
  ? getGuideStateConfig(guideState).index
  : -1
```

- [ ] **Step 11: Build check**

```bash
pnpm build
```

Expected: clean build. Fix any TypeScript errors before continuing.

- [ ] **Step 12: Run all rigid-motions tests**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: all pass.

- [ ] **Step 13: Commit**

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat(rigid-motions): VIS-01/02/03 — phase labels, beat reveals, synthesis-reveal state"
```

---

## Task 6: DiscoveryTab — Congruence Block (VIS-04)

**Files:**
- Modify: `src/components/celebration/DiscoveryTab.tsx`

- [ ] **Step 1: Add congruence block in `RigidMotionsDiscovery`**

In `DiscoveryTab.tsx`, locate the `RigidMotionsDiscovery` component. Add the congruence block between the sequence chips and the `completionCopy` paragraph:

```tsx
{/* Congruence statement — renders unconditionally (modal only shows on full completion) */}
<p className="text-center text-sm lab-display-font text-(--lab-earned)">
  You proved △ABC ≅ △A″B″C″ by describing a sequence of rigid motions.
</p>

{/* Completion summary */}
<p className="text-center text-[var(--lab-text-muted)] text-sm">{completionCopy}</p>
```

The full updated `RigidMotionsDiscovery` component body (sequence section):

```tsx
{/* Sequence chips */}
<div className="flex items-center justify-center gap-2 flex-wrap">
  {completedSequence.map((params, i) => (
    <span key={i} className="contents">
      {i > 0 && <ArrowRight size={12} aria-hidden="true" className="text-(--lab-text-muted) shrink-0" />}
      <TransformChip params={params} />
    </span>
  ))}
</div>

{/* Congruence statement */}
<p className="text-center text-sm lab-display-font text-(--lab-earned)">
  You proved △ABC ≅ △A″B″C″ by describing a sequence of rigid motions.
</p>

{/* Completion summary */}
<p className="text-center text-[var(--lab-text-muted)] text-sm">{completionCopy}</p>
```

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: clean build.

- [ ] **Step 3: Run full test suite**

```bash
pnpm vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Lint check**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/celebration/DiscoveryTab.tsx
git commit -m "feat(celebration): VIS-04 — congruence justification in capstone celebration"
```

---

## Final Verification

- [ ] **Run full build + test suite one final time**

```bash
pnpm build && pnpm vitest run
```

Expected: clean build, all tests pass.

- [ ] **Smoke test in browser** (start dev server, run through the module)

```bash
pnpm dev
```

Walkthrough checklist:
1. Load rigid-motions module → status strip shows `PHASE 02 · PREDICT & REVEAL`
2. Complete first spatial predict round (beat 0) → earned reveal shows properties text only, no notation
3. Complete second spatial predict round (beat 1) → earned reveal shows coordinate rule in accent green
4. Press CONTINUE through coordinate-reveal → status strip shows `PHASE 03 · COORDINATE LAYER`
5. Complete first coordinate predict round (beat 2) → earned reveal shows vertex observation text only
6. Complete second coordinate predict round (beat 3) → earned reveal shows congruence text + `△ABC ≅ △A′B′C′` in amber + trailing line
7. After all three transformation types → synthesis-reveal state appears with `PHASE 04 · CAPSTONE` label; synthesis copy shows with ≅
8. Press CONTINUE → capstone loads
9. Complete all 3 capstone rounds → celebration modal opens; DiscoveryTab shows congruence statement in amber

- [ ] **Create PR**

```bash
git push origin <feature-branch>
gh pr create --title "feat: ISTE visibility sprint (VIS-01–04)" --body "$(cat <<'EOF'
## Summary
- VIS-01: Phase label in status strip (PHASE 02/03/04), derived from guide state
- VIS-02: Four-beat layered reveal copy per transformation type; coordinate rules computed from round data
- VIS-03: synthesis-reveal guide state between coordinate rounds and capstone
- VIS-04: Congruence language in capstone celebration modal

## Spec
docs/superpowers/specs/2026-03-19-iste-visibility-sprint-design.md

## Test plan
- [ ] All Vitest tests pass (`pnpm vitest run`)
- [ ] Clean TypeScript build (`pnpm build`)
- [ ] Smoke walk: beat reveals accumulate correctly, phase labels update, synthesis moment fires once, celebration shows ≅

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
