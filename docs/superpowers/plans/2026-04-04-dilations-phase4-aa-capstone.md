# Dilations Phase 4: AA Discovery & Capstone — Implementation Plan

## Status: Complete

> Implemented April 2026 on branch `feat/dilations-phase4-aa-capstone`. All 9 tasks complete. 6 QA bugs fixed post-smoke-test. Module fully complete (all 4 phases, 14 rounds).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 4 of the Dilations module — `aa-discover` (progressive angle color reveal, two sub-pairs), `aa-confirm` (productive failure, NOT SIMILAR unlock), and `capstone-final` (3-pair navigator, CelebrationModal) — completing the module.

**Architecture:** New R3F `AngleLabels` component (CanvasTexture, same pattern as `SpriteLabel`); new `AARounds.tsx` scene; new `CapstonePairNavigator` HTML control component; state machine extended with 4 new actions; `DiscoveryTab` gets a `moduleId === 'dilations'` branch. All new components are owned by the dilations module — no cross-module sharing.

**Tech Stack:** React 19, TypeScript, React Three Fiber, Three.js (CanvasTexture for angle labels), GSAP (existing animation infra), Tailwind CSS 4 with `--lab-*` tokens, Vitest (unit tests), existing `pnpm build` for type-check.

**Spec:** `docs/superpowers/specs/2026-04-04-dilations-phase4-aa-capstone-design.md`

---

## File Map

### New files
| Path | Responsibility |
|------|---------------|
| `src/components/modules/dilations/utils/aaTasks.ts` | Triangle coordinates for aa-discover sub-pairs, aa-confirm pair, and 3 capstone pairs |
| `src/components/modules/dilations/components/AngleLabels.tsx` | R3F sprite-based angle degree labels; dim/revealed states; color-matched per vertex |
| `src/components/modules/dilations/rounds/AARounds.tsx` | Phase 4 scene: `AAScene` component for aa-discover and aa-confirm |
| `src/components/modules/dilations/components/CapstonePairNavigator.tsx` | HTML capstone controls: pair progress LEDs, SequenceBuilder, NOT SIMILAR button |
| `src/components/modules/dilations/__tests__/aaTasks.test.ts` | Verify angle constraints on all task triangles |
| `src/components/modules/dilations/__tests__/AngleLabels.test.ts` | Match color computation logic |

### Modified files
| Path | Change |
|------|--------|
| `src/components/modules/dilations/hooks/useDilationsStage.ts` | 3 new state fields + 4 new action types + reducer cases |
| `src/components/modules/dilations/dilations-copy.ts` | Phase 4 ROUND_PROMPTS + EARNED_REVEALS |
| `src/components/modules/dilations/utils/constants.ts` | ROUND_CONFIGS entries for aa-discover, aa-confirm, capstone-final |
| `src/components/modules/dilations/DilationsModule.tsx` | isAAPhase branch, inline NOT SIMILAR for aa-confirm, showCelebration wiring |
| `src/components/celebration/DiscoveryTab.tsx` | `moduleId === 'dilations'` branch: Stats + Key Formulas |

---

## Task 1: Triangle Data (`aaTasks.ts`)

**Files:**
- Create: `src/components/modules/dilations/utils/aaTasks.ts`
- Create: `src/components/modules/dilations/__tests__/aaTasks.test.ts`

- [ ] **Step 1.1: Write failing tests that verify angle constraints**

```ts
// src/components/modules/dilations/__tests__/aaTasks.test.ts
import { describe, it, expect } from 'vitest'
import { triangleAngles } from '../utils/math'
import {
  AA_DISCOVER_SUB_PAIRS,
  AA_CONFIRM_PAIR,
  CAPSTONE_PAIRS,
} from '../utils/aaTasks'

function sortedAngles(t: Parameters<typeof triangleAngles>[0]) {
  return [...triangleAngles(t)].sort((a, b) => a - b)
}

function anglesMatch(a: number[], b: number[], tol = 2) {
  return a.every((v, i) => Math.abs(v - b[i]) <= tol)
}

describe('AA_DISCOVER_SUB_PAIRS', () => {
  it('sub-pair 1: all 3 sorted angles match', () => {
    const s = AA_DISCOVER_SUB_PAIRS[0]
    expect(anglesMatch(sortedAngles(s.preImage), sortedAngles(s.target))).toBe(true)
    expect(s.showMatchCount).toBe(3)
  })

  it('sub-pair 2: triangles are similar, showMatchCount is 2', () => {
    const s = AA_DISCOVER_SUB_PAIRS[1]
    expect(anglesMatch(sortedAngles(s.preImage), sortedAngles(s.target))).toBe(true)
    expect(s.showMatchCount).toBe(2)
  })
})

describe('AA_CONFIRM_PAIR', () => {
  it('no sorted angle pair matches within 2°', () => {
    const preAngles = sortedAngles(AA_CONFIRM_PAIR.preImage)
    const tgtAngles = sortedAngles(AA_CONFIRM_PAIR.target)
    const anyMatch = preAngles.some((v, i) => Math.abs(v - tgtAngles[i]) <= 2)
    expect(anyMatch).toBe(false)
  })
})

describe('CAPSTONE_PAIRS', () => {
  it('pair 1 is similar', () => {
    const p = CAPSTONE_PAIRS[0]
    expect(p.isSimilar).toBe(true)
    expect(anglesMatch(sortedAngles(p.preImage), sortedAngles(p.target))).toBe(true)
    expect(p.maxSteps).toBe(2)
  })

  it('pair 2 is not similar', () => {
    const p = CAPSTONE_PAIRS[1]
    expect(p.isSimilar).toBe(false)
    const preAngles = sortedAngles(p.preImage)
    const tgtAngles = sortedAngles(p.target)
    expect(preAngles.some((v, i) => Math.abs(v - tgtAngles[i]) <= 2)).toBe(false)
    expect(p.maxSteps).toBe(2)
  })

  it('pair 3 is similar', () => {
    const p = CAPSTONE_PAIRS[2]
    expect(p.isSimilar).toBe(true)
    expect(anglesMatch(sortedAngles(p.preImage), sortedAngles(p.target))).toBe(true)
    expect(p.maxSteps).toBe(3)
  })
})
```

- [ ] **Step 1.2: Run tests — expect FAIL (module not found)**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/aaTasks.test.ts
```

- [ ] **Step 1.3: Create `aaTasks.ts` with verified coordinates**

```ts
// src/components/modules/dilations/utils/aaTasks.ts
import type { Triangle } from './types'

export interface AADiscoverSubPair {
  preImage: Triangle
  target: Triangle
  /** Number of angle-pair colors to show (capped — rest render ghost). */
  showMatchCount: 1 | 2 | 3
}

export interface CapstonePair {
  preImage: Triangle
  target: Triangle
  isSimilar: boolean
  maxSteps: number
}

// ---------------------------------------------------------------------------
// aa-discover — two sub-pairs
// ---------------------------------------------------------------------------
//
// Sub-pair 1: Right isosceles triangles (90°, 45°, 45°) — all 3 pairs colored.
// Sub-pair 2: 3-4-5 right triangles (90°, 53°, 37°) — only 2 pairs colored
//   to demonstrate AA: two matches are sufficient.
// Both pairs are similar (all 3 sorted angles match within ±2°).
// ---------------------------------------------------------------------------

export const AA_DISCOVER_SUB_PAIRS: AADiscoverSubPair[] = [
  {
    // Sub-pair 1: right isosceles, k ≈ 1.5 — all 3 match
    preImage: { a: { x: 1, y: 1 }, b: { x: 5, y: 1 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 13, y: 1 }, c: { x: 7, y: 7 } },
    showMatchCount: 3,
  },
  {
    // Sub-pair 2: 3-4-5 right triangle, k = 2 — only 2 pairs highlighted
    // Demonstrates: two matching angle pairs is enough to conclude similarity.
    preImage: { a: { x: 1, y: 1 }, b: { x: 4, y: 1 }, c: { x: 4, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 13, y: 1 }, c: { x: 13, y: 9 } },
    showMatchCount: 2,
  },
]

// ---------------------------------------------------------------------------
// aa-confirm — one non-similar pair
// ---------------------------------------------------------------------------
// Pre-image: right triangle (90°, 37°, 53°) sorted: [37°, 53°, 90°]
// Target: isosceles triangle (~63°, ~63°, ~54°) — no angle within 2° of pre-image
// ---------------------------------------------------------------------------

export const AA_CONFIRM_PAIR: { preImage: Triangle; target: Triangle } = {
  preImage: { a: { x: 1, y: 2 }, b: { x: 5, y: 2 }, c: { x: 1, y: 5 } },
  target:   { a: { x: 7, y: 1 }, b: { x: 11, y: 1 }, c: { x: 9, y: 5 } },
}

// ---------------------------------------------------------------------------
// capstone-final — 3 pairs
// ---------------------------------------------------------------------------

export const CAPSTONE_PAIRS: CapstonePair[] = [
  {
    // Pair 1 (similar): right isosceles (90°, 45°, 45°)
    // Intended sequence: translate(+2, -1) → dilate(×2)
    // A(1,2)→(3,1)→(6,2), B(4,2)→(6,1)→(12,2), C(1,5)→(3,4)→(6,8)
    preImage: { a: { x: 1, y: 2 }, b: { x: 4, y: 2 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 6, y: 2 }, b: { x: 12, y: 2 }, c: { x: 6, y: 8 } },
    isSimilar: true,
    maxSteps: 2,
  },
  {
    // Pair 2 (NOT similar): contrast pair. Pre-image [37°,53°,90°] vs target [54°,63°,63°]
    preImage: { a: { x: 1, y: 2 }, b: { x: 5, y: 2 }, c: { x: 1, y: 5 } },
    target:   { a: { x: 7, y: 1 }, b: { x: 11, y: 1 }, c: { x: 9, y: 5 } },
    isSimilar: false,
    maxSteps: 2,
  },
  {
    // Pair 3 (similar): 3-4-5 right triangle (90°, 53°, 37°)
    // Intended sequence: rotate(90°CCW) → translate(+10, 0) → dilate(×2)
    // A(2,5)→rotate→(-5,2)→+10,0→(5,2)→×2→(10,4)
    // B(5,5)→rotate→(-5,5)→+10,0→(5,5)→×2→(10,10)
    // C(2,9)→rotate→(-9,2)→+10,0→(1,2)→×2→(2,4)
    preImage: { a: { x: 2, y: 5 }, b: { x: 5, y: 5 }, c: { x: 2, y: 9 } },
    target:   { a: { x: 10, y: 4 }, b: { x: 10, y: 10 }, c: { x: 2, y: 4 } },
    isSimilar: true,
    maxSteps: 3,
  },
]
```

- [ ] **Step 1.4: Run tests — expect PASS**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/aaTasks.test.ts
```

Expected: all 5 tests green. If any fail, adjust the triangle coordinates in `aaTasks.ts` until they pass. The test is the contract — don't change the test.

- [ ] **Step 1.5: Commit**

```bash
git add src/components/modules/dilations/utils/aaTasks.ts \
        src/components/modules/dilations/__tests__/aaTasks.test.ts
git commit -m "feat(dilations): aaTasks — triangle data for Phase 4 rounds"
```

---

## Task 2: State Machine Extensions (`useDilationsStage.ts`)

**Files:**
- Modify: `src/components/modules/dilations/hooks/useDilationsStage.ts`
- Modify: `src/components/modules/dilations/__tests__/useDilationsStage.test.ts`

- [ ] **Step 2.1: Write failing tests for new state fields and actions**

Add to the existing test file:

```ts
// In useDilationsStage.test.ts — add these describe blocks:

describe('Phase 4 state fields', () => {
  it('initial state has anglesRevealed: false', () => {
    const { result } = renderHook(() => useDilationsStage())
    expect(result.current.state.anglesRevealed).toBe(false)
  })

  it('initial state has subPairIndex: 0', () => {
    const { result } = renderHook(() => useDilationsStage())
    expect(result.current.state.subPairIndex).toBe(0)
  })

  it('initial capstonePairIndex is 0', () => {
    const { result } = renderHook(() => useDilationsStage())
    expect(result.current.state.capstonePairIndex).toBe(0)
  })
})

describe('REVEAL_ANGLES', () => {
  it('sets anglesRevealed to true', () => {
    const { result } = renderHook(() => useDilationsStage())
    act(() => { result.current.dispatch({ type: 'REVEAL_ANGLES' }) })
    expect(result.current.state.anglesRevealed).toBe(true)
  })
})

describe('ADVANCE_SUB_PAIR', () => {
  it('increments subPairIndex and resets anglesRevealed', () => {
    const { result } = renderHook(() => useDilationsStage())
    act(() => { result.current.dispatch({ type: 'REVEAL_ANGLES' }) })
    act(() => { result.current.dispatch({ type: 'ADVANCE_SUB_PAIR' }) })
    expect(result.current.state.subPairIndex).toBe(1)
    expect(result.current.state.anglesRevealed).toBe(false)
  })
})

describe('DECLARE_NOT_SIMILAR', () => {
  it('sets roundState to completion regardless of prior state', () => {
    const { result } = renderHook(() => useDilationsStage())
    // state starts at 'entry'
    act(() => { result.current.dispatch({ type: 'DECLARE_NOT_SIMILAR' }) })
    expect(result.current.state.roundState).toBe('completion')
  })
})

describe('COMPLETE_CAPSTONE_PAIR', () => {
  it('records result and increments capstonePairIndex', () => {
    const { result } = renderHook(() => useDilationsStage())
    act(() => {
      result.current.dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'similar' })
    })
    expect(result.current.state.capstonePairResults[0]).toBe('similar')
    expect(result.current.state.capstonePairIndex).toBe(1)
    expect(result.current.state.anglesRevealed).toBe(false)
  })

  it('sets roundState completion when all 3 pairs done', () => {
    const { result } = renderHook(() => useDilationsStage())
    act(() => { result.current.dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'similar' }) })
    act(() => { result.current.dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'not-similar' }) })
    act(() => { result.current.dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'similar' }) })
    expect(result.current.state.roundState).toBe('completion')
  })
})
```

- [ ] **Step 2.2: Run tests — expect FAIL**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/useDilationsStage.test.ts
```

- [ ] **Step 2.3: Extend `StageState` with new fields**

In `useDilationsStage.ts`, add to the `StageState` interface:

```ts
anglesRevealed: boolean          // current pair/sub-pair has been revealed
subPairIndex: 0 | 1             // aa-discover only; which sub-pair is active
capstonePairIndex: number        // 0, 1, 2
capstonePairResults: ('pending' | 'similar' | 'not-similar')[]
```

Add to the initial state object:
```ts
anglesRevealed: false,
subPairIndex: 0,
capstonePairIndex: 0,
capstonePairResults: ['pending', 'pending', 'pending'],
```

- [ ] **Step 2.4: Add new action types to `StageAction` union**

```ts
| { type: 'REVEAL_ANGLES' }
| { type: 'ADVANCE_SUB_PAIR' }
| { type: 'DECLARE_NOT_SIMILAR' }
| { type: 'COMPLETE_CAPSTONE_PAIR'; result: 'similar' | 'not-similar' }
```

- [ ] **Step 2.5: Add reducer cases**

In the reducer `switch` statement, add:

```ts
case 'REVEAL_ANGLES':
  return { ...state, anglesRevealed: true }

case 'ADVANCE_SUB_PAIR':
  return { ...state, subPairIndex: (state.subPairIndex + 1) as 0 | 1, anglesRevealed: false }

case 'DECLARE_NOT_SIMILAR':
  return { ...state, roundState: 'completion' }

case 'COMPLETE_CAPSTONE_PAIR': {
  const newResults = [...state.capstonePairResults] as StageState['capstonePairResults']
  newResults[state.capstonePairIndex] = action.result
  const newIndex = state.capstonePairIndex + 1
  const allDone = newIndex >= 3
  return {
    ...state,
    capstonePairResults: newResults,
    capstonePairIndex: newIndex,
    anglesRevealed: false,
    roundState: allDone ? 'completion' : state.roundState,
  }
}
```

- [ ] **Step 2.6: Run tests — expect PASS**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/useDilationsStage.test.ts
```

- [ ] **Step 2.7: Commit**

```bash
git add src/components/modules/dilations/hooks/useDilationsStage.ts \
        src/components/modules/dilations/__tests__/useDilationsStage.test.ts
git commit -m "feat(dilations): state machine — Phase 4 fields + 4 new action types"
```

---

## Task 3: Copy & Constants

**Files:**
- Modify: `src/components/modules/dilations/dilations-copy.ts`
- Modify: `src/components/modules/dilations/utils/constants.ts`

- [ ] **Step 3.1: Add Phase 4 copy to `dilations-copy.ts`**

In `ROUND_PROMPTS`, add:
```ts
'aa-discover':    'Look at the angles. What do you notice?',
'aa-confirm':     'Check the angles. Then decide.',
'capstone-final': 'Final challenge. For each pair — are they similar? If so, build the sequence.',
```

In `EARNED_REVEALS`, add:
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

In `PHASE_INTROS`, the `'aa-capstone'` key already exists. Verify it has copy or add:
```ts
'aa-capstone': "There's a shortcut to knowing if two triangles are similar — you only need two angles.",
```

- [ ] **Step 3.2: Add ROUND_CONFIGS entries to `constants.ts`**

The `aa-discover`, `aa-confirm`, and `capstone-final` keys already exist in `ROUND_SEQUENCE` and in the `RoundId` type. Add the config entries for each:

```ts
'aa-discover': {
  label: 'AA Criterion',
  scaleFactor: null,
  hasGhostDrag: false,
  hasSequenceBuilder: false,
  coordinatesVisible: true,   // coordinates stay visible from Phase 2+
  angleLabelsVisible: true,   // Phase 4 first time angle labels appear
},
'aa-confirm': {
  label: 'Confirm Non-Similarity',
  scaleFactor: null,
  hasGhostDrag: false,
  hasSequenceBuilder: true,
  coordinatesVisible: true,
  angleLabelsVisible: true,
},
'capstone-final': {
  label: 'Capstone',
  scaleFactor: null,
  hasGhostDrag: false,
  hasSequenceBuilder: true,
  coordinatesVisible: true,
  angleLabelsVisible: true,
},
```

- [ ] **Step 3.3: Run build to catch type errors**

```bash
pnpm build 2>&1 | tail -20
```

Expected: clean build (or only pre-existing warnings). Fix any type errors before continuing.

- [ ] **Step 3.4: Commit**

```bash
git add src/components/modules/dilations/dilations-copy.ts \
        src/components/modules/dilations/utils/constants.ts
git commit -m "feat(dilations): Phase 4 copy — ROUND_PROMPTS, EARNED_REVEALS, ROUND_CONFIGS"
```

---

## Task 4: `AngleLabels.tsx` (R3F Component)

**Files:**
- Create: `src/components/modules/dilations/components/AngleLabels.tsx`
- Create: `src/components/modules/dilations/__tests__/AngleLabels.test.ts`

This component follows the same CanvasTexture pattern as the existing `SpriteLabel.tsx`. Read that file first before implementing — it is the authoritative pattern reference.

- [ ] **Step 4.1: Write failing tests for the match-color computation helper**

The core logic is a pure function: given two angle arrays and a `showMatchCount`, return per-vertex colors. Test this in isolation.

```ts
// src/components/modules/dilations/__tests__/AngleLabels.test.ts
import { describe, it, expect } from 'vitest'
import { computeMatchColors } from '../components/AngleLabels'

const GHOST = '#7a746a'
const COLORS = ['#7cc87c', '#f5a623', '#8ab4f8']

describe('computeMatchColors', () => {
  it('all 3 match → 3 colors on both triangles', () => {
    const preAngles: [number,number,number] = [90, 45, 45]
    const tgtAngles: [number,number,number] = [90, 45, 45]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    // Both triangles get 3 colors (may be in any order matching sorted pairs)
    expect(pre.filter(c => c !== GHOST)).toHaveLength(3)
    expect(tgt.filter(c => c !== GHOST)).toHaveLength(3)
  })

  it('showMatchCount: 2 → only 2 pairs colored, 1 ghost on each', () => {
    const preAngles: [number,number,number] = [90, 53, 37]
    const tgtAngles: [number,number,number] = [90, 53, 37]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 2)
    expect(pre.filter(c => c !== GHOST)).toHaveLength(2)
    expect(tgt.filter(c => c !== GHOST)).toHaveLength(2)
  })

  it('no matches → all ghost', () => {
    const preAngles: [number,number,number] = [90, 37, 53]
    const tgtAngles: [number,number,number] = [63, 63, 54]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    expect(pre).toEqual([GHOST, GHOST, GHOST])
    expect(tgt).toEqual([GHOST, GHOST, GHOST])
  })

  it('matched colors are the same across both triangles for each pair', () => {
    const preAngles: [number,number,number] = [90, 45, 45]
    const tgtAngles: [number,number,number] = [45, 90, 45]
    const [pre, tgt] = computeMatchColors(preAngles, tgtAngles, 3)
    // Each color that appears in pre must appear in tgt at some vertex
    const preColors = pre.filter(c => c !== GHOST)
    const tgtColors = tgt.filter(c => c !== GHOST)
    for (const c of preColors) {
      expect(tgtColors).toContain(c)
    }
  })
})
```

- [ ] **Step 4.2: Run tests — expect FAIL**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/AngleLabels.test.ts
```

- [ ] **Step 4.3: Implement `AngleLabels.tsx`**

```tsx
// src/components/modules/dilations/components/AngleLabels.tsx
//
// Renders computed angle degree values at each vertex of a triangle.
// Labels start dim (revealed=false) and snap to colors (revealed=true).
// Uses CanvasTexture — same pattern as SpriteLabel.tsx.
// Never use drei <Text> or <Html>.

import { useMemo, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { triangleAngles } from '../utils/math'
import type { Triangle } from '../utils/types'

const GHOST = '#7a746a'
const ANGLE_COLORS = ['#7cc87c', '#f5a623', '#8ab4f8'] as const
const DIM_OPACITY = 0.4

// ---------------------------------------------------------------------------
// Color computation (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Returns per-vertex colors for both triangles.
 * Sorts both angle arrays, finds matching pairs within ±2°, assigns shared
 * colors up to showMatchCount. Unmatched vertices get GHOST.
 */
export function computeMatchColors(
  preAngles: [number, number, number],
  tgtAngles: [number, number, number],
  showMatchCount: number,
): [[string, string, string], [string, string, string]] {
  // Sort angles with their original indices
  const sortPre = ([...preAngles] as number[])
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)
  const sortTgt = ([...tgtAngles] as number[])
    .map((v, i) => ({ v, i }))
    .sort((a, b) => a.v - b.v)

  const preColors: [string, string, string] = [GHOST, GHOST, GHOST]
  const tgtColors: [string, string, string] = [GHOST, GHOST, GHOST]

  let colorIdx = 0
  for (let k = 0; k < 3 && colorIdx < showMatchCount; k++) {
    if (Math.abs(sortPre[k].v - sortTgt[k].v) <= 2) {
      const color = ANGLE_COLORS[colorIdx++]
      preColors[sortPre[k].i] = color
      tgtColors[sortTgt[k].i] = color
    }
  }

  return [preColors, tgtColors]
}

// ---------------------------------------------------------------------------
// Sprite builder
// ---------------------------------------------------------------------------

function makeAngleLabelTexture(text: string, color: string, opacity: number): THREE.CanvasTexture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, size, size)
  ctx.globalAlpha = opacity
  ctx.font = 'bold 52px "JetBrains Mono", monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, size / 2, size / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// ---------------------------------------------------------------------------
// SingleAngleLabel — one sprite for one vertex
// ---------------------------------------------------------------------------

function SingleAngleLabel({
  angleDeg,
  color,
  revealed,
  position,
}: {
  angleDeg: number
  color: string
  revealed: boolean
  position: [number, number, number]
}) {
  const { gl } = useThree()
  void gl // ensure context is available

  const texture = useMemo(
    () => makeAngleLabelTexture(
      `${angleDeg}°`,
      color,
      revealed ? 1 : DIM_OPACITY,
    ),
    [angleDeg, color, revealed],
  )

  useEffect(() => () => texture.dispose(), [texture])

  const spriteMaterial = useMemo(
    () => new THREE.SpriteMaterial({ map: texture, transparent: true }),
    [texture],
  )

  useEffect(() => () => spriteMaterial.dispose(), [spriteMaterial])

  return (
    <sprite position={position} scale={[1.2, 1.2, 1]} material={spriteMaterial} />
  )
}

// ---------------------------------------------------------------------------
// AngleLabels — renders all 3 labels for one triangle
// ---------------------------------------------------------------------------

/** Offset multiplier: pushes label slightly outside the triangle at each vertex. */
function labelOffset(vertex: { x: number; y: number }, centroid: { x: number; y: number }, d = 0.8) {
  const dx = vertex.x - centroid.x
  const dy = vertex.y - centroid.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  return [vertex.x + (dx / len) * d, vertex.y + (dy / len) * d, 0.1] as [number, number, number]
}

interface AngleLabelsProps {
  triangle: Triangle
  visible: boolean
  /** false = dim ghost; true = full color per matchColors */
  revealed: boolean
  /** Per-vertex colors. null = all ghost (not yet revealed state) */
  matchColors: [string, string, string] | null
}

export function AngleLabels({ triangle, visible, revealed, matchColors }: AngleLabelsProps) {
  const angles = useMemo(() => triangleAngles(triangle), [triangle])
  const verts = [triangle.a, triangle.b, triangle.c] as const

  const centroid = useMemo(() => ({
    x: (triangle.a.x + triangle.b.x + triangle.c.x) / 3,
    y: (triangle.a.y + triangle.b.y + triangle.c.y) / 3,
  }), [triangle])

  if (!visible) return null

  const colors: [string, string, string] = matchColors ?? [GHOST, GHOST, GHOST]

  return (
    <>
      {verts.map((v, i) => (
        <SingleAngleLabel
          key={i}
          angleDeg={angles[i]}
          color={colors[i]}
          revealed={revealed}
          position={labelOffset(v, centroid)}
        />
      ))}
    </>
  )
}
```

- [ ] **Step 4.4: Run tests — expect PASS**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/AngleLabels.test.ts
```

- [ ] **Step 4.5: Run build to verify no type errors**

```bash
pnpm build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 4.6: Commit**

```bash
git add src/components/modules/dilations/components/AngleLabels.tsx \
        src/components/modules/dilations/__tests__/AngleLabels.test.ts
git commit -m "feat(dilations): AngleLabels R3F component — CanvasTexture angle labels with match colors"
```

---

## Task 5: `AARounds.tsx` (Phase 4 Scene)

**Files:**
- Create: `src/components/modules/dilations/rounds/AARounds.tsx`

No new tests for this component — it's a pure rendering concern. Visual verification via dev server.

- [ ] **Step 5.1: Create `AARounds.tsx`**

```tsx
// src/components/modules/dilations/rounds/AARounds.tsx
//
// Phase 4 scene: renders two triangles side by side with AngleLabels.
// Used by both aa-discover and aa-confirm.
// No ghost drag. Angle labels start dim; revealed state supplied by parent.

import { useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { AngleLabels, computeMatchColors } from '../components/AngleLabels'
import { triangleAngles } from '../utils/math'
import type { Triangle } from '../utils/types'

interface AASceneProps {
  preImage: Triangle
  target: Triangle
  revealed: boolean
  showMatchCount: number
}

export function AAScene({ preImage, target, revealed, showMatchCount }: AASceneProps) {
  const [preColors, tgtColors] = useMemo(() => {
    if (!revealed) return [null, null] as const
    const preAngles = triangleAngles(preImage) as [number, number, number]
    const tgtAngles = triangleAngles(target) as [number, number, number]
    return computeMatchColors(preAngles, tgtAngles, showMatchCount)
  }, [revealed, preImage, target, showMatchCount])

  return (
    <>
      {/* Pre-image — left side. suppressInlineCoords: no vertex coordinate labels */}
      <PreImageTriangle vertices={preImage} suppressInlineCoords />

      {/* Target — right side, accent fill */}
      <ImageTriangle vertices={target} visible={true} suppressInlineCoords />

      {/* Angle labels — pre-image */}
      <AngleLabels
        triangle={preImage}
        visible={true}
        revealed={revealed}
        matchColors={preColors}
      />

      {/* Angle labels — target */}
      <AngleLabels
        triangle={target}
        visible={true}
        revealed={revealed}
        matchColors={tgtColors}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// AADiscoverScene — aa-discover specific: manages sub-pair
// ---------------------------------------------------------------------------

interface AADiscoverSceneProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  subPairs: import('../utils/aaTasks').AADiscoverSubPair[]
}

export function AADiscoverScene({ state, subPairs }: AADiscoverSceneProps) {
  const pair = subPairs[state.subPairIndex]
  if (!pair) return null
  return (
    <AAScene
      preImage={pair.preImage}
      target={pair.target}
      revealed={state.anglesRevealed}
      showMatchCount={pair.showMatchCount}
    />
  )
}

// ---------------------------------------------------------------------------
// AAConfirmScene — aa-confirm specific
// ---------------------------------------------------------------------------

interface AAConfirmSceneProps {
  state: StageState
  preImage: Triangle
  target: Triangle
}

export function AAConfirmScene({ state, preImage, target }: AAConfirmSceneProps) {
  return (
    <AAScene
      preImage={preImage}
      target={target}
      revealed={state.anglesRevealed}
      showMatchCount={3}
    />
  )
}
```

- [ ] **Step 5.2: Run build**

```bash
pnpm build 2>&1 | grep -E "error|Error" | head -20
```

- [ ] **Step 5.3: Commit**

```bash
git add src/components/modules/dilations/rounds/AARounds.tsx
git commit -m "feat(dilations): AARounds scene — AAScene, AADiscoverScene, AAConfirmScene"
```

---

## Task 6: `CapstonePairNavigator.tsx`

**Files:**
- Create: `src/components/modules/dilations/components/CapstonePairNavigator.tsx`

- [ ] **Step 6.1: Create `CapstonePairNavigator.tsx`**

```tsx
// src/components/modules/dilations/components/CapstonePairNavigator.tsx
//
// HTML capstone controls (outside Canvas):
//   - Pair progress indicator (PAIR N / 3 + LED dots)
//   - Per-pair result chips
//   - SequenceBuilder (reused from Phase 3)
//   - NOT SIMILAR button (unlocks after anglesRevealed + no matches)
//   - NEXT PAIR / FINISH button

import { useState, useEffect, useMemo } from 'react'
import type { Dispatch } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { SequenceBuilder } from './SequenceBuilder'
import type { TransformStep } from '../utils/types'
import { triangleAngles } from '../utils/math'
import { computeMatchColors } from './AngleLabels'
import type { CapstonePair } from '../utils/aaTasks'

interface CapstonePairNavigatorProps {
  state: StageState
  dispatch: Dispatch<StageAction>
  pairs: CapstonePair[]
  onRevealAngles: () => void
  onDeclareNotSimilar: () => void
  onAllComplete: () => void
}

export function CapstonePairNavigator({
  state,
  dispatch,
  pairs,
  onRevealAngles,
  onDeclareNotSimilar,
  onAllComplete,
}: CapstonePairNavigatorProps) {
  const { capstonePairIndex, capstonePairResults, anglesRevealed, sequenceSteps } = state
  const currentPair = pairs[capstonePairIndex]
  const [similarityFeedback, setSimilarityFeedback] = useState<'idle' | 'match' | 'miss'>('idle')

  // Reset feedback when pair changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSimilarityFeedback('idle')
  }, [capstonePairIndex])
  /* eslint-enable react-hooks/set-state-in-effect */

  // Compute whether angles match (for NOT SIMILAR unlock)
  const hasAngleMatches = useMemo(() => {
    if (!currentPair || !anglesRevealed) return true // locked until revealed
    const preA = triangleAngles(currentPair.preImage) as [number, number, number]
    const tgtA = triangleAngles(currentPair.target) as [number, number, number]
    const [preColors] = computeMatchColors(preA, tgtA, 3)
    return preColors.some(c => c !== '#7a746a')
  }, [currentPair, anglesRevealed])

  const notSimilarDisabled = !anglesRevealed || hasAngleMatches

  const currentResult = capstonePairResults[capstonePairIndex]
  const pairDone = currentResult !== 'pending'
  const allDone = capstonePairIndex >= pairs.length

  function handleAddStep(step: TransformStep) {
    dispatch({ type: 'ADD_SEQUENCE_STEP', step })
  }
  function handleUpdateStep(index: number, step: TransformStep) {
    dispatch({ type: 'UPDATE_SEQUENCE_STEP', index, step })
    setSimilarityFeedback('idle')
  }
  function handleRemoveStep(index: number) {
    dispatch({ type: 'REMOVE_SEQUENCE_STEP', index })
    setSimilarityFeedback('idle')
  }
  function handleResetSequence() {
    dispatch({ type: 'RESET_SEQUENCE' })
    setSimilarityFeedback('idle')
  }

  function handleCheck() {
    if (!currentPair) return
    const { composeTriangle, trianglesMatch } = require('../utils/math')
    const composed = composeTriangle(sequenceSteps, currentPair.preImage)
    const { PREDICTION_TOLERANCE } = require('../utils/constants')
    if (trianglesMatch(composed, currentPair.target, PREDICTION_TOLERANCE)) {
      setSimilarityFeedback('match')
      dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'similar' })
    } else {
      setSimilarityFeedback('miss')
    }
  }

  function handleNext() {
    if (capstonePairIndex + 1 >= pairs.length) {
      onAllComplete()
    }
    // capstonePairIndex is already incremented by COMPLETE_CAPSTONE_PAIR/DECLARE_NOT_SIMILAR
    dispatch({ type: 'RESET_SEQUENCE' })
    setSimilarityFeedback('idle')
  }

  if (!currentPair || allDone) return null

  return (
    <div className="flex flex-col bg-(--lab-bg)">
      {/* Pair progress header */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-(--lab-border)">
        <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-text-muted)">
          PAIR {capstonePairIndex + 1} / {pairs.length}
        </span>
        <div className="flex items-center gap-1.5">
          {pairs.map((_, i) => {
            const res = capstonePairResults[i]
            return (
              <span
                key={i}
                className={[
                  'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                  res === 'similar'     ? 'bg-(--lab-success) border-(--lab-led-completed-border)' :
                  res === 'not-similar' ? 'bg-(--lab-success) border-(--lab-led-completed-border)' :
                  i === capstonePairIndex ? 'bg-(--lab-accent) border-(--lab-accent-muted)' :
                                            'bg-transparent border-(--lab-ghost)/40',
                ].join(' ')}
              />
            )
          })}
        </div>

        {/* REVEAL MATCHES button — always available until revealed */}
        {!anglesRevealed && (
          <button
            type="button"
            onClick={onRevealAngles}
            className="ml-auto min-h-[36px] px-2.5 border border-(--lab-earned) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-earned) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            REVEAL MATCHES
          </button>
        )}
      </div>

      {/* Sequence builder (always available) */}
      {!pairDone && (
        <SequenceBuilder
          steps={sequenceSteps}
          maxSteps={currentPair.maxSteps}
          kLocked={true}
          lockedK={2}
          feedbackState={similarityFeedback}
          onAddStep={handleAddStep}
          onUpdateStep={handleUpdateStep}
          onRemoveStep={handleRemoveStep}
          onCheckSequence={handleCheck}
          onNext={handleNext}
          onReset={handleResetSequence}
        />
      )}

      {/* NOT SIMILAR button — sibling to SequenceBuilder */}
      {!pairDone && similarityFeedback !== 'match' && (
        <div className="flex items-center px-2.5 py-1.5 border-t border-(--lab-border)">
          <button
            type="button"
            onClick={() => {
              onDeclareNotSimilar()
              dispatch({ type: 'COMPLETE_CAPSTONE_PAIR', result: 'not-similar' })
            }}
            disabled={notSimilarDisabled}
            className="min-h-[44px] px-3 border border-(--lab-ghost) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-text-muted) hover:border-(--lab-text) hover:text-(--lab-text) disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none transition-colors duration-150"
          >
            NOT SIMILAR
          </button>
          {!anglesRevealed && (
            <span className="ml-2 lab-display-font text-[10px] text-(--lab-text-muted)">
              Reveal angles first
            </span>
          )}
        </div>
      )}

      {/* Pair result + NEXT PAIR after completion */}
      {pairDone && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-(--lab-border)">
          <span className="lab-silk lab-display-font text-[9px] text-(--lab-accent)">
            {currentResult === 'similar' ? 'Sequence verified ✓' : 'Not similar ✓'}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-3 bg-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-bg) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            {capstonePairIndex + 1 >= pairs.length ? 'FINISH' : 'NEXT PAIR'}
          </button>
        </div>
      )}
    </div>
  )
}
```

> **Note on `require` in `handleCheck`:** Replace the dynamic `require()` calls with top-level imports. They are written inline above for readability — move `composeTriangle`, `trianglesMatch`, and `PREDICTION_TOLERANCE` to the module's top-level imports.

- [ ] **Step 6.2: Fix imports — move `composeTriangle`, `trianglesMatch`, `PREDICTION_TOLERANCE` to top-level imports**

```ts
import { triangleAngles, composeTriangle, trianglesMatch } from '../utils/math'
import { PREDICTION_TOLERANCE } from '../utils/constants'
```

Remove the `require()` calls from `handleCheck`.

- [ ] **Step 6.3: Run build**

```bash
pnpm build 2>&1 | grep -E "error|Error" | head -20
```

Fix any type errors. Common issue: `capstonePairResults` type may need the union `('pending' | 'similar' | 'not-similar')[]` — ensure this is in `StageState`.

- [ ] **Step 6.4: Commit**

```bash
git add src/components/modules/dilations/components/CapstonePairNavigator.tsx
git commit -m "feat(dilations): CapstonePairNavigator — pair progress, NOT SIMILAR, sequence controls"
```

---

## Task 7: `DilationsModule.tsx` Wiring

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

This task wires everything together. Read the full current `DilationsModule.tsx` before making changes.

- [ ] **Step 7.1: Add Phase 4 imports**

```ts
import { AADiscoverScene, AAConfirmScene } from './rounds/AARounds'
import { CapstonePairNavigator } from './components/CapstonePairNavigator'
import { AA_DISCOVER_SUB_PAIRS, AA_CONFIRM_PAIR, CAPSTONE_PAIRS } from './utils/aaTasks'
```

- [ ] **Step 7.2: Add `isAAPhase` flag and phase detection**

After the existing `isSimilarityPhase` line:

```ts
const isAAPhase = phase === 'aa-capstone'
const isAADiscover  = isAAPhase && currentRound === 'aa-discover'
const isAAConfirm   = isAAPhase && currentRound === 'aa-confirm'
const isCapstone    = isAAPhase && currentRound === 'capstone-final'
```

- [ ] **Step 7.3: Add `showCelebration` state and `onComplete` wiring**

```ts
const [showCelebration, setShowCelebration] = useState(false)
```

Add a `useEffect` that fires when Phase 4 capstone completes:

```ts
useEffect(() => {
  if (isCapstone && roundState === 'completion') {
    setShowCelebration(true)
  }
}, [isCapstone, roundState])
```

- [ ] **Step 7.4: Add Phase 4 callbacks**

```ts
const handleRevealAngles = useCallback(() => {
  dispatch({ type: 'REVEAL_ANGLES' })
}, [dispatch])

const handleDeclareNotSimilar = useCallback(() => {
  dispatch({ type: 'DECLARE_NOT_SIMILAR' })
}, [dispatch])

const handleAdvanceSubPair = useCallback(() => {
  dispatch({ type: 'ADVANCE_SUB_PAIR' })
}, [dispatch])
```

- [ ] **Step 7.5: Add `aa-discover` sub-pair internal state in the scene**

The `CONTINUE` button for `aa-discover` sub-pair transitions lives inside `AADiscoverScene`'s parent context. Add a `continueVisible` local state in `DilationsModule` (or inside an `AADiscoverControls` wrapper below) triggered by a `useEffect` on `state.anglesRevealed`.

Add below the other `useState` declarations:

```ts
const [aaContinueVisible, setAAContinueVisible] = useState(false)

useEffect(() => {
  setAAContinueVisible(false) // reset when anglesRevealed changes
  if (state.anglesRevealed && isAADiscover) {
    const timer = setTimeout(() => setAAContinueVisible(true), 2500)
    return () => clearTimeout(timer)
  }
}, [state.anglesRevealed, isAADiscover])
```

- [ ] **Step 7.6: Wire scene rendering for Phase 4**

In the `DilationsScene` children, add the Phase 4 scene alongside existing phases:

```tsx
{isAAPhase && isAADiscover && (
  <AADiscoverScene
    key={`${currentRound}-${state.subPairIndex}`}
    state={state}
    dispatch={dispatch}
    subPairs={AA_DISCOVER_SUB_PAIRS}
  />
)}
{isAAPhase && isAAConfirm && (
  <AAConfirmScene
    state={state}
    preImage={AA_CONFIRM_PAIR.preImage}
    target={AA_CONFIRM_PAIR.target}
  />
)}
{isAAPhase && isCapstone && (
  /* SequencePreview reused for capstone pair preview */
  <AADiscoverScene
    key={`capstone-${state.capstonePairIndex}`}
    state={state}
    dispatch={dispatch}
    subPairs={CAPSTONE_PAIRS.map(p => ({
      preImage: p.preImage,
      target: p.target,
      showMatchCount: 3,
    }))}
  />
)}
```

> **Note:** The capstone scene reuses `AADiscoverScene` passing current pair data — it renders two triangles side by side with angle labels. The `subPairIndex` in state effectively becomes `capstonePairIndex` for the capstone's pair navigation. This works because `AADiscoverScene` reads `state.subPairIndex` — for the capstone, use a separate wrapper or pass the current pair index. Simplest approach: create a thin `AACapstonePairScene` wrapper that passes `CAPSTONE_PAIRS[state.capstonePairIndex]` to `AAScene` directly:

```tsx
// In AARounds.tsx, add:
export function AACapstonePairScene({ state, pairs }: { state: StageState; pairs: CapstonePair[] }) {
  const pair = pairs[state.capstonePairIndex]
  if (!pair) return null
  return (
    <AAScene
      preImage={pair.preImage}
      target={pair.target}
      revealed={state.anglesRevealed}
      showMatchCount={3}
    />
  )
}
```

Update the capstone branch in `DilationsModule` to use `AACapstonePairScene`.

- [ ] **Step 7.7: Wire controls for Phase 4**

In the `controls` prop of `ModuleLayout`, extend the existing ternary:

```tsx
controls={
  isSimilarityPhase && currentTask && roundState !== 'entry' ? (
    <SequenceBuilder ... />
  ) : isAAPhase && isAADiscover ? (
    /* aa-discover controls: REVEAL MATCHES + delayed CONTINUE */
    <div className="flex flex-col bg-(--lab-bg)">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-(--lab-border)">
        {!state.anglesRevealed && (
          <button
            type="button"
            onClick={handleRevealAngles}
            className="min-h-[44px] px-3 border border-(--lab-earned) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-earned) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            REVEAL MATCHES
          </button>
        )}
        {state.anglesRevealed && aaContinueVisible && state.subPairIndex === 0 && (
          <button
            type="button"
            onClick={handleAdvanceSubPair}
            className="ml-auto min-h-[44px] px-3 border border-(--lab-border) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-text) hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none transition-colors duration-150"
          >
            CONTINUE →
          </button>
        )}
        {state.anglesRevealed && aaContinueVisible && state.subPairIndex === 1 && roundState !== 'completion' && (
          <button
            type="button"
            onClick={handleAdvance}
            className="ml-auto min-h-[44px] px-3 border border-(--lab-border) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-text) hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none transition-colors duration-150"
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  ) : isAAPhase && isAAConfirm && roundState !== 'completion' ? (
    /* aa-confirm controls: SequenceBuilder + inline NOT SIMILAR */
    <div className="flex flex-col bg-(--lab-bg)">
      {!state.anglesRevealed && (
        <div className="flex items-center px-3 py-2 border-b border-(--lab-border)">
          <button
            type="button"
            onClick={handleRevealAngles}
            className="min-h-[44px] px-3 border border-(--lab-earned) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-earned) hover:opacity-80 focus:outline-none transition-opacity duration-150"
          >
            REVEAL MATCHES
          </button>
        </div>
      )}
      <SequenceBuilder
        steps={state.sequenceSteps}
        maxSteps={2}
        kLocked={true}
        lockedK={2}
        feedbackState={similarityFeedback}
        onAddStep={handleAddStep}
        onUpdateStep={handleUpdateStep}
        onRemoveStep={handleRemoveStep}
        onCheckSequence={handleCheckSimilarity}
        onNext={handleAdvance}
        onReset={handleResetSequence}
      />
      {/* NOT SIMILAR — unlocks after reveal with no matches */}
      <div className="flex items-center px-2.5 py-1.5 border-t border-(--lab-border)">
        <button
          type="button"
          onClick={handleDeclareNotSimilar}
          disabled={!state.anglesRevealed}
          className="min-h-[44px] px-3 border border-(--lab-ghost) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-text-muted) hover:border-(--lab-text) hover:text-(--lab-text) disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none transition-colors duration-150"
        >
          NOT SIMILAR
        </button>
      </div>
    </div>
  ) : isAAPhase && isCapstone ? (
    <CapstonePairNavigator
      state={state}
      dispatch={dispatch}
      pairs={CAPSTONE_PAIRS}
      onRevealAngles={handleRevealAngles}
      onDeclareNotSimilar={handleDeclareNotSimilar}
      onAllComplete={() => setShowCelebration(true)}
    />
  ) : (
    <ControlStrip state={state} dispatch={dispatch} onAdvance={handleAdvance} />
  )
}
```

- [ ] **Step 7.8: Add `worldSize` for Phase 4 and `CelebrationModal`**

In the `DilationsScene` props, extend the worldSize ternary:

```tsx
worldSize={isSimilarityPhase || isAAPhase ? 20 : 16}
```

Add `CelebrationModal` import and render below `SimilarityDefinition`:

```tsx
import { CelebrationModal } from '@/components/celebration/CelebrationModal'

// In the JSX, add after SimilarityDefinition:
<CelebrationModal
  show={showCelebration}
  values={{ phases: 4, rounds: 14 }}
  moduleId="dilations"
  onDismiss={() => {
    setShowCelebration(false)
    props.onComplete({ phases: 4, rounds: 14 })
  }}
  onNewChallenge={() => {
    setShowCelebration(false)
  }}
  onNextModule={() => {
    setShowCelebration(false)
    props.onBack()
  }}
  onOpenProcess={() => {}}
/>
```

> `props.onComplete` is the `ModuleProps.onComplete` callback. Check `ModuleProps` in `src/config/modules.ts` for the exact signature and adjust `values` parameter accordingly.

- [ ] **Step 7.9: Run build — fix all type errors**

```bash
pnpm build 2>&1 | tail -30
```

This step will surface missing imports, wrong prop types, unused variables (TypeScript strict mode). Fix each error before moving on.

- [ ] **Step 7.10: Commit**

```bash
git add src/components/modules/dilations/DilationsModule.tsx \
        src/components/modules/dilations/rounds/AARounds.tsx
git commit -m "feat(dilations): DilationsModule — Phase 4 branch, AA scenes, capstone, CelebrationModal"
```

---

## Task 8: `DiscoveryTab` Dilations Branch

**Files:**
- Modify: `src/components/celebration/DiscoveryTab.tsx`

- [ ] **Step 8.1: Add the dilations branch**

In `DiscoveryTab.tsx`, after the `if (moduleId === 'rigid-motions')` block, add:

```tsx
if (moduleId === 'dilations') {
  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 border border-(--lab-accent-muted) bg-(--lab-accent)/10 mb-4">
          <CheckCircle className="w-8 h-8 text-(--lab-accent)" />
        </div>
        <h3 className="lab-display-font text-xl font-semibold text-(--lab-text) mb-1">
          You Proved It
        </h3>
        <p className="text-(--lab-text-muted) text-sm">
          Through exploration, not explanation
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { value: '4', label: 'Phases' },
          { value: '14', label: 'Rounds' },
          // "2 Angles needed" is a pedagogical constant — hardcoded here intentionally.
          // If ROUND_SEQUENCE changes length, update the "14" above and add a comment.
          { value: '2', label: 'Angles needed' },
        ].map(({ value, label }) => (
          <div key={label}>
            <div className="lab-data-font text-3xl font-semibold text-(--lab-accent) mb-1">
              {value}
            </div>
            <div className="lab-silk lab-display-font text-(--lab-text-muted)">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Coordinate rule */}
      <div className="border-t border-(--lab-border) pt-4">
        <p className="lab-silk lab-display-font text-(--lab-text-muted) mb-2">
          The coordinate rule you found
        </p>
        <p className="lab-data-font text-lg sm:text-xl text-(--lab-accent) text-center">
          (x, y) → (kx, ky)
        </p>
      </div>

      {/* AA criterion */}
      <div className="border-t border-(--lab-border) pt-4">
        <p className="lab-silk lab-display-font text-(--lab-text-muted) mb-2">
          The criterion you proved
        </p>
        <p className="lab-data-font text-sm sm:text-base text-(--lab-earned) text-center">
          ∠A = ∠A′ and ∠B = ∠B′ → △ ∼ △
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 8.2: Run build**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 8.3: Commit**

```bash
git add src/components/celebration/DiscoveryTab.tsx
git commit -m "feat(dilations): DiscoveryTab dilations branch — stats + coordinate rule + AA criterion"
```

---

## Task 9: Integration & Build Verification

- [ ] **Step 9.1: Run all Dilations tests**

```bash
pnpm vitest run src/components/modules/dilations
```

Expected: all tests pass. If any fail, fix before proceeding.

- [ ] **Step 9.2: Full production build**

```bash
pnpm build
```

Expected: clean build, no TypeScript errors, standard chunk size warnings acceptable.

- [ ] **Step 9.3: Smoke test in dev server**

```bash
pnpm dev
```

Navigate to the Dilations module. Advance through Phases 1–3 (can use existing rounds, these are unchanged). Then verify Phase 4 manually:

**aa-discover:**
- [ ] Two triangles appear side by side with dim angle labels
- [ ] REVEAL MATCHES button available
- [ ] Tap REVEAL MATCHES → colors snap in on both triangles simultaneously (sub-pair 1: all 3 colored)
- [ ] CONTINUE button hidden for ~2.5s, then fades in
- [ ] CONTINUE → sub-pair 2 appears, labels dim again
- [ ] Tap REVEAL MATCHES → 2 colored pairs, 1 ghost
- [ ] CONTINUE after dwell → completion → earned reveal in PromptReadout

**aa-confirm:**
- [ ] Two non-similar triangles side by side, dim labels
- [ ] SequenceBuilder available; NOT SIMILAR button disabled
- [ ] Build a sequence and CHECK → miss feedback
- [ ] REVEAL MATCHES → all labels turn ghost (no colors)
- [ ] NOT SIMILAR unlocks
- [ ] Press NOT SIMILAR → completion → earned reveal

**capstone-final:**
- [ ] Pair 1 / 3 shown, dim labels, SequenceBuilder available
- [ ] REVEAL MATCHES → 3 colored pairs (similar)
- [ ] Build sequence (translate + dilate), CHECK → match → NEXT PAIR
- [ ] Pair 2 / 3: REVEAL MATCHES → all ghost → NOT SIMILAR unlocks → press
- [ ] Pair 3 / 3: reveal → 3 colored → build 3-step sequence → CHECK → match → FINISH
- [ ] CelebrationModal appears with "Your Discovery" tab showing stats + formulas

- [ ] **Step 9.4: Final commit**

```bash
git add -A
git commit -m "feat(dilations): Phase 4 AA Capstone — complete implementation"
```

---

## Completion Checklist

- [ ] All 5 `aaTasks.test.ts` tests pass (angle constraints verified)
- [ ] All `AngleLabels.test.ts` tests pass (match color logic)
- [ ] All `useDilationsStage.test.ts` tests pass (state machine extensions)
- [ ] `pnpm build` clean
- [ ] aa-discover: sub-pair 1 (3 colors) → sub-pair 2 (2 colors) → earned reveal
- [ ] aa-confirm: NOT SIMILAR unlocks after reveal, ControlStrip on completion
- [ ] capstone-final: all 3 pairs complete, CelebrationModal fires once, `onComplete` called on dismiss
- [ ] DiscoveryTab dilations branch renders stats + formulas correctly
- [ ] No hardcoded colors outside `--lab-*` tokens
- [ ] No `<Text>`, `<Html>`, or inline `new THREE.X()` in JSX
