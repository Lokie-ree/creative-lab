# Dilations Prompt 2: Canvas + Stage Machine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the R3F canvas shell, stage machine, and HUD overlay for the Dilations module — no round-specific logic yet, just the infrastructure all later prompts plug into.

**Architecture:** `useDilationsStage` is a `useReducer`-based hook that owns all 14-round progression state. `DilationsCanvas` is the R3F `<Canvas>` (grid + origin + static pre-image triangle). `DilationsHUD` is a React DOM overlay (prompt text, phase indicator, navigation buttons). `DilationsModule` wires them together and implements `ModuleProps`.

**Tech Stack:** React 19, TypeScript strict, React Three Fiber (`@react-three/fiber`), Three.js, Tailwind CSS 4, `--lab-*` design tokens, Vitest (jsdom)

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/components/modules/dilations/hooks/useDilationsStage.ts` | **Create** | Stage machine — useReducer, all 14 rounds |
| `src/components/modules/dilations/DilationsCanvas.tsx` | **Create** | R3F canvas, orthographic camera, grid, origin, pre-image triangle |
| `src/components/modules/dilations/DilationsHUD.tsx` | **Create** | HTML overlay: prompt text, nav buttons, phase/round indicator |
| `src/components/modules/dilations/DilationsModule.tsx` | **Update** | Replace placeholder — wire Canvas + HUD + stage machine |
| `src/components/modules/dilations/__tests__/useDilationsStage.test.ts` | **Create** | Stage machine reducer unit tests |

**Existing files consumed (read-only):**
- `src/components/modules/dilations/utils/types.ts` — `Vec2`, `Triangle`, `RoundId`, `PhaseId`, `RoundState`, `RoundConfig`, `TransformStep`
- `src/components/modules/dilations/utils/constants.ts` — `CANONICAL_TRIANGLE`, `ROUND_SEQUENCE`, `ROUND_CONFIGS`
- `src/lib/colors.ts` — `colors` object for `--lab-*` token values
- `src/config/modules.ts` — `ModuleProps` type
- `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` — reference for Canvas/camera/grid patterns (read but do not import from)

---

## Task 1: Stage Machine (`useDilationsStage.ts`)

**Files:**
- Create: `src/components/modules/dilations/hooks/useDilationsStage.ts`
- Test: `src/components/modules/dilations/__tests__/useDilationsStage.test.ts`

The stage machine is the single source of truth for all progression state. It is a plain `useReducer` — no side effects, no R3F, no React DOM.

### Types (define at top of hook file, then export)

```typescript
import { useReducer } from 'react'
import type {
  RoundId, PhaseId, RoundState, TransformStep, Vec2
} from '../utils/types'
import { ROUND_SEQUENCE, ROUND_CONFIGS } from '../utils/constants'

export type StageState = {
  currentRound: RoundId
  roundState: RoundState       // 'entry' | 'active' | 'prediction' | 'reveal' | 'completion'
  phase: PhaseId
  coordinatesVisible: boolean  // flips true at coord-k2, never reverts
  angleLabelsVisible: boolean  // flips true at aa-discover, never reverts
  ghostPosition: Vec2 | null
  sequenceSteps: TransformStep[]
}

export type StageAction =
  | { type: 'START_ROUND'; round: RoundId }
  | { type: 'SET_ROUND_STATE'; state: RoundState }
  | { type: 'SET_GHOST_POSITION'; position: Vec2 }
  | { type: 'COMMIT_PREDICTION' }    // entry/active → prediction
  | { type: 'TRIGGER_REVEAL' }       // prediction → reveal (no-op otherwise)
  | { type: 'COMPLETE_ROUND' }       // reveal → completion
  | { type: 'ADVANCE_ROUND' }        // completion → next round in ROUND_SEQUENCE
  | { type: 'ADD_SEQUENCE_STEP'; step: TransformStep }
  | { type: 'REMOVE_SEQUENCE_STEP'; index: number }
  | { type: 'REORDER_SEQUENCE_STEP'; from: number; to: number }
  | { type: 'CHECK_SEQUENCE' }       // → prediction state for sequence-based rounds
  | { type: 'RESET_SEQUENCE' }
```

### Reducer rules

- `ADVANCE_ROUND`: find `currentRound` index in `ROUND_SEQUENCE`, move to `index + 1`. If already last, stay (no wrap). Call `START_ROUND` logic for the new round.
- `START_ROUND`: set `currentRound`, `roundState: 'entry'`, `phase` from `ROUND_CONFIGS[round].phase`, update `coordinatesVisible` (if `ROUND_CONFIGS[round].coordinatesVisible` is true, set true and never go back), same for `angleLabelsVisible`, reset `ghostPosition: null`, reset `sequenceSteps: []`.
- `TRIGGER_REVEAL`: only transitions to `'reveal'` when `roundState === 'prediction'`. Otherwise no-op (return state unchanged).
- `COMPLETE_ROUND`: `roundState → 'completion'`.
- `COMMIT_PREDICTION`: `roundState → 'prediction'`.
- `CHECK_SEQUENCE`: `roundState → 'prediction'` (sequence-builder equivalent of COMMIT_PREDICTION).
- `SET_GHOST_POSITION`: update `ghostPosition`, set `roundState: 'active'` if it was `'entry'`.
- `SET_ROUND_STATE`: direct override.
- `ADD_SEQUENCE_STEP`: append to `sequenceSteps`.
- `REMOVE_SEQUENCE_STEP`: remove at index.
- `REORDER_SEQUENCE_STEP`: move item from `from` index to `to` index.
- `RESET_SEQUENCE`: `sequenceSteps: []`.

### Initial state

```typescript
const initialState: StageState = {
  currentRound: 'dilate-k2',
  roundState: 'entry',
  phase: 'scale-factor',
  coordinatesVisible: false,
  angleLabelsVisible: false,
  ghostPosition: null,
  sequenceSteps: [],
}
```

### Hook export

```typescript
export function useDilationsStage() {
  const [state, dispatch] = useReducer(stageReducer, initialState)
  return { state, dispatch }
}
```

Export the reducer separately as `stageReducer` so tests can call it directly without React.

- [ ] **Step 1: Write failing tests** — create `src/components/modules/dilations/__tests__/useDilationsStage.test.ts`

```typescript
// src/components/modules/dilations/__tests__/useDilationsStage.test.ts
import { describe, it, expect } from 'vitest'
import { stageReducer } from '../hooks/useDilationsStage'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { ROUND_SEQUENCE } from '../utils/constants'

const initialState: StageState = {
  currentRound: 'dilate-k2',
  roundState: 'entry',
  phase: 'scale-factor',
  coordinatesVisible: false,
  angleLabelsVisible: false,
  ghostPosition: null,
  sequenceSteps: [],
}

function dispatch(state: StageState, action: StageAction): StageState {
  return stageReducer(state, action)
}

describe('stageReducer', () => {
  describe('ADVANCE_ROUND', () => {
    it('moves to the next round in ROUND_SEQUENCE', () => {
      const next = dispatch(initialState, { type: 'ADVANCE_ROUND' })
      expect(next.currentRound).toBe(ROUND_SEQUENCE[1])
    })

    it('resets roundState to entry on advance', () => {
      const withCompletion = { ...initialState, roundState: 'completion' as const }
      const next = dispatch(withCompletion, { type: 'ADVANCE_ROUND' })
      expect(next.roundState).toBe('entry')
    })

    it('stays on last round when already at end', () => {
      const lastRound = ROUND_SEQUENCE[ROUND_SEQUENCE.length - 1]
      const atEnd = { ...initialState, currentRound: lastRound }
      const next = dispatch(atEnd, { type: 'ADVANCE_ROUND' })
      expect(next.currentRound).toBe(lastRound)
    })

    it('resets ghostPosition and sequenceSteps on advance', () => {
      const withData: StageState = {
        ...initialState,
        ghostPosition: { x: 3, y: 4 },
        sequenceSteps: [{ type: 'dilate', params: { k: 2 } }],
      }
      const next = dispatch(withData, { type: 'ADVANCE_ROUND' })
      expect(next.ghostPosition).toBeNull()
      expect(next.sequenceSteps).toHaveLength(0)
    })
  })

  describe('coordinatesVisible — one-way flip', () => {
    it('flips to true when entering coord-k2', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      expect(s.coordinatesVisible).toBe(true)
    })

    it('stays true when advancing one round past coord-k2', () => {
      const atCoord = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      const next = dispatch(atCoord, { type: 'ADVANCE_ROUND' })
      expect(next.coordinatesVisible).toBe(true)
    })

    it('stays true across multiple advances through similarity phase', () => {
      // Start at coord-k2, advance through coord-k-half, coord-k-third, similarity-guided
      let s = dispatch(initialState, { type: 'START_ROUND', round: 'coord-k2' })
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // coord-k-half
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // coord-k-third
      s = dispatch(s, { type: 'ADVANCE_ROUND' }) // similarity-guided
      expect(s.coordinatesVisible).toBe(true)
      expect(s.currentRound).toBe('similarity-guided')
    })

    it('is false during scale-factor phase', () => {
      expect(initialState.coordinatesVisible).toBe(false)
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'dilate-k3' })
      expect(s.coordinatesVisible).toBe(false)
    })
  })

  describe('angleLabelsVisible — one-way flip', () => {
    it('flips to true when entering aa-discover', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'aa-discover' })
      expect(s.angleLabelsVisible).toBe(true)
    })

    it('is false before aa phase', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'similarity-guided' })
      expect(s.angleLabelsVisible).toBe(false)
    })
  })

  describe('TRIGGER_REVEAL', () => {
    it('transitions to reveal when in prediction state', () => {
      const inPrediction = { ...initialState, roundState: 'prediction' as const }
      const next = dispatch(inPrediction, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('reveal')
    })

    it('is a no-op when not in prediction state', () => {
      const inActive = { ...initialState, roundState: 'active' as const }
      const next = dispatch(inActive, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('active')
    })

    it('is a no-op in entry state', () => {
      const next = dispatch(initialState, { type: 'TRIGGER_REVEAL' })
      expect(next.roundState).toBe('entry')
    })
  })

  describe('COMPLETE_ROUND', () => {
    it('sets roundState to completion', () => {
      const next = dispatch(initialState, { type: 'COMPLETE_ROUND' })
      expect(next.roundState).toBe('completion')
    })
  })

  describe('COMMIT_PREDICTION', () => {
    it('sets roundState to prediction', () => {
      const next = dispatch(initialState, { type: 'COMMIT_PREDICTION' })
      expect(next.roundState).toBe('prediction')
    })
  })

  describe('SET_GHOST_POSITION', () => {
    it('sets ghostPosition', () => {
      const next = dispatch(initialState, { type: 'SET_GHOST_POSITION', position: { x: 2, y: 3 } })
      expect(next.ghostPosition).toEqual({ x: 2, y: 3 })
    })

    it('transitions entry → active', () => {
      const next = dispatch(initialState, { type: 'SET_GHOST_POSITION', position: { x: 2, y: 3 } })
      expect(next.roundState).toBe('active')
    })

    it('does not reset roundState if already past active', () => {
      const inPrediction = { ...initialState, roundState: 'prediction' as const }
      const next = dispatch(inPrediction, { type: 'SET_GHOST_POSITION', position: { x: 1, y: 1 } })
      expect(next.roundState).toBe('prediction')
    })
  })

  describe('sequence steps', () => {
    it('ADD_SEQUENCE_STEP appends a step', () => {
      const step = { type: 'dilate' as const, params: { k: 2 } }
      const next = dispatch(initialState, { type: 'ADD_SEQUENCE_STEP', step })
      expect(next.sequenceSteps).toHaveLength(1)
      expect(next.sequenceSteps[0]).toEqual(step)
    })

    it('REMOVE_SEQUENCE_STEP removes at index', () => {
      const step1 = { type: 'dilate' as const, params: { k: 2 } }
      const step2 = { type: 'translate' as const, params: { dx: 1, dy: 0 } }
      const s = { ...initialState, sequenceSteps: [step1, step2] }
      const next = dispatch(s, { type: 'REMOVE_SEQUENCE_STEP', index: 0 })
      expect(next.sequenceSteps).toHaveLength(1)
      expect(next.sequenceSteps[0]).toEqual(step2)
    })

    it('REORDER_SEQUENCE_STEP moves step from index to index', () => {
      const step1 = { type: 'dilate' as const, params: { k: 2 } }
      const step2 = { type: 'translate' as const, params: { dx: 1, dy: 0 } }
      const s = { ...initialState, sequenceSteps: [step1, step2] }
      const next = dispatch(s, { type: 'REORDER_SEQUENCE_STEP', from: 0, to: 1 })
      expect(next.sequenceSteps[0]).toEqual(step2)
      expect(next.sequenceSteps[1]).toEqual(step1)
    })

    it('RESET_SEQUENCE empties sequenceSteps', () => {
      const step = { type: 'dilate' as const, params: { k: 2 } }
      const s = { ...initialState, sequenceSteps: [step] }
      const next = dispatch(s, { type: 'RESET_SEQUENCE' })
      expect(next.sequenceSteps).toHaveLength(0)
    })
  })

  describe('phase tracking', () => {
    it('phase updates on START_ROUND', () => {
      const s = dispatch(initialState, { type: 'START_ROUND', round: 'similarity-guided' })
      expect(s.phase).toBe('similarity')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/useDilationsStage.test.ts
```

Expected: FAIL — `stageReducer` is not defined.

- [ ] **Step 3: Implement `useDilationsStage.ts`**

Create `src/components/modules/dilations/hooks/useDilationsStage.ts`:

```typescript
// src/components/modules/dilations/hooks/useDilationsStage.ts
import { useReducer } from 'react'
import type { RoundId, PhaseId, RoundState, TransformStep, Vec2 } from '../utils/types'
import { ROUND_SEQUENCE, ROUND_CONFIGS } from '../utils/constants'

export type StageState = {
  currentRound: RoundId
  roundState: RoundState
  phase: PhaseId
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  ghostPosition: Vec2 | null
  sequenceSteps: TransformStep[]
}

export type StageAction =
  | { type: 'START_ROUND'; round: RoundId }
  | { type: 'SET_ROUND_STATE'; state: RoundState }
  | { type: 'SET_GHOST_POSITION'; position: Vec2 }
  | { type: 'COMMIT_PREDICTION' }
  | { type: 'TRIGGER_REVEAL' }
  | { type: 'COMPLETE_ROUND' }
  | { type: 'ADVANCE_ROUND' }
  | { type: 'ADD_SEQUENCE_STEP'; step: TransformStep }
  | { type: 'REMOVE_SEQUENCE_STEP'; index: number }
  | { type: 'REORDER_SEQUENCE_STEP'; from: number; to: number }
  | { type: 'CHECK_SEQUENCE' }
  | { type: 'RESET_SEQUENCE' }

const initialState: StageState = {
  currentRound: 'dilate-k2',
  roundState: 'entry',
  phase: 'scale-factor',
  coordinatesVisible: false,
  angleLabelsVisible: false,
  ghostPosition: null,
  sequenceSteps: [],
}

function startRound(state: StageState, round: RoundId): StageState {
  const config = ROUND_CONFIGS[round]
  return {
    ...state,
    currentRound: round,
    roundState: 'entry',
    phase: config.phase,
    coordinatesVisible: state.coordinatesVisible || config.coordinatesVisible,
    angleLabelsVisible: state.angleLabelsVisible || config.angleLabelsVisible,
    ghostPosition: null,
    sequenceSteps: [],
  }
}

export function stageReducer(state: StageState, action: StageAction): StageState {
  switch (action.type) {
    case 'START_ROUND':
      return startRound(state, action.round)

    case 'ADVANCE_ROUND': {
      const idx = ROUND_SEQUENCE.indexOf(state.currentRound)
      if (idx < 0 || idx >= ROUND_SEQUENCE.length - 1) return state
      return startRound(state, ROUND_SEQUENCE[idx + 1])
    }

    case 'SET_ROUND_STATE':
      return { ...state, roundState: action.state }

    case 'COMMIT_PREDICTION':
      return { ...state, roundState: 'prediction' }

    case 'CHECK_SEQUENCE':
      return { ...state, roundState: 'prediction' }

    case 'TRIGGER_REVEAL':
      if (state.roundState !== 'prediction') return state
      return { ...state, roundState: 'reveal' }

    case 'COMPLETE_ROUND':
      return { ...state, roundState: 'completion' }

    case 'SET_GHOST_POSITION':
      return {
        ...state,
        ghostPosition: action.position,
        roundState: state.roundState === 'entry' ? 'active' : state.roundState,
      }

    case 'ADD_SEQUENCE_STEP':
      return { ...state, sequenceSteps: [...state.sequenceSteps, action.step] }

    case 'REMOVE_SEQUENCE_STEP':
      return {
        ...state,
        sequenceSteps: state.sequenceSteps.filter((_, i) => i !== action.index),
      }

    case 'REORDER_SEQUENCE_STEP': {
      const steps = [...state.sequenceSteps]
      const [moved] = steps.splice(action.from, 1)
      steps.splice(action.to, 0, moved)
      return { ...state, sequenceSteps: steps }
    }

    case 'RESET_SEQUENCE':
      return { ...state, sequenceSteps: [] }
  }
}

export function useDilationsStage() {
  const [state, dispatch] = useReducer(stageReducer, initialState)
  return { state, dispatch }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run src/components/modules/dilations/__tests__/useDilationsStage.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/modules/dilations/hooks/useDilationsStage.ts \
        src/components/modules/dilations/__tests__/useDilationsStage.test.ts
git commit -m "feat(dilations): add useDilationsStage — useReducer stage machine with 14-round progression"
```

---

## Task 2: R3F Canvas (`DilationsCanvas.tsx`)

**Files:**
- Create: `src/components/modules/dilations/DilationsCanvas.tsx`

The canvas renders the coordinate plane and the static pre-image triangle. No interactivity yet — just the visual shell.

### Camera Setup

Dilations use a fixed world range: x ∈ [-2, 14], y ∈ [-2, 14] (16×16 units). The center of this range is (6, 6). The camera must show the full range regardless of canvas size.

Strategy: compute `zoom = Math.min(width, height) / 16`, then set `left/right/top/bottom` based on container size with origin at world (6, 6). This means world position (6, 6) maps to the canvas center, and the full 16×16 grid fits at minimum dimension.

Reference: see `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx` for the same `CameraSetup` pattern using `useThree` + `useFrame`.

### Grid

Use `THREE.BufferGeometry` with `lineSegments` (same pattern as M1's `CoordinateGrid`). Two geometries:
- **Grid lines:** x = -2 to 14, y = -2 to 14, unit intervals. Color `#28251f` opacity 0.35.
- **Axes:** x=0 and y=0. Color `#3e3a34` opacity 0.55.

### Origin marker

- Small filled circle at (0, 0, 0.01): `<circleGeometry args={[0.12, 16]} />`, color `#7cc87c` (lab accent, since origin is a reference point).

### Pre-image triangle

A static `<mesh>` with `<shapeGeometry>` for the filled triangle and a `<line>` for the outline.

Build `THREE.Shape` from `CANONICAL_TRIANGLE`: `a={1,1}`, `b={4,2}`, `c={2,4}`.

Pre-image fill color: `#b8b0a4` (lab text / `--lab-text`) at opacity 0.15 (subtle).
Pre-image stroke color: `#b8b0a4` at opacity 0.6.

### Props

```typescript
export interface DilationsCanvasProps {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  children?: React.ReactNode  // for future round-specific components
}
```

### Full component

```typescript
// src/components/modules/dilations/DilationsCanvas.tsx
import { useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { CANONICAL_TRIANGLE } from './utils/constants'

// World range: x ∈ [-2, 14], y ∈ [-2, 14]
const WORLD_MIN = -2
const WORLD_MAX = 14
const WORLD_SIZE = WORLD_MAX - WORLD_MIN  // 16
const WORLD_CENTER_X = (WORLD_MIN + WORLD_MAX) / 2  // 6
const WORLD_CENTER_Y = (WORLD_MIN + WORLD_MAX) / 2  // 6

function CameraSetup() {
  const { camera, size } = useThree()
  useFrame(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const zoom = Math.min(size.width, size.height) / WORLD_SIZE
    const halfW = size.width / 2 / zoom
    const halfH = size.height / 2 / zoom
    const changed =
      Math.abs(camera.zoom - zoom) > 0.001 ||
      Math.abs(camera.left - (WORLD_CENTER_X - halfW)) > 0.01
    if (changed) {
      camera.zoom = zoom
      camera.left = WORLD_CENTER_X - halfW
      camera.right = WORLD_CENTER_X + halfW
      camera.top = WORLD_CENTER_Y + halfH
      camera.bottom = WORLD_CENTER_Y - halfH
      camera.updateProjectionMatrix()
    }
  })
  return null
}

function CoordinateGrid() {
  const { gridGeometry, axisGeometry } = useMemo(() => {
    const gridPts: THREE.Vector3[] = []
    const axisPts: THREE.Vector3[] = []
    for (let i = WORLD_MIN; i <= WORLD_MAX; i++) {
      const isAxis = i === 0
      const target = isAxis ? axisPts : gridPts
      target.push(new THREE.Vector3(i, WORLD_MIN, 0), new THREE.Vector3(i, WORLD_MAX, 0))
      target.push(new THREE.Vector3(WORLD_MIN, i, 0), new THREE.Vector3(WORLD_MAX, i, 0))
    }
    return {
      gridGeometry: new THREE.BufferGeometry().setFromPoints(gridPts),
      axisGeometry: new THREE.BufferGeometry().setFromPoints(axisPts),
    }
  }, [])

  return (
    <group>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#28251f" transparent opacity={0.35} />
      </lineSegments>
      <lineSegments geometry={axisGeometry}>
        <lineBasicMaterial color="#3e3a34" transparent opacity={0.55} />
      </lineSegments>
      {/* Origin marker */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[0.12, 16]} />
        <meshBasicMaterial color="#7cc87c" />
      </mesh>
    </group>
  )
}

function PreImageTriangle() {
  const { fillGeometry, outlinePoints } = useMemo(() => {
    const { a, b, c } = CANONICAL_TRIANGLE
    const shape = new THREE.Shape()
    shape.moveTo(a.x, a.y)
    shape.lineTo(b.x, b.y)
    shape.lineTo(c.x, c.y)
    shape.closePath()
    const outPts = [
      new THREE.Vector3(a.x, a.y, 0),
      new THREE.Vector3(b.x, b.y, 0),
      new THREE.Vector3(c.x, c.y, 0),
      new THREE.Vector3(a.x, a.y, 0),
    ]
    return {
      fillGeometry: new THREE.ShapeGeometry(shape),
      outlinePoints: outPts,
    }
  }, [])

  const outlineGeometry = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(outlinePoints),
    [outlinePoints],
  )

  return (
    <group>
      <mesh geometry={fillGeometry} position={[0, 0, 0.02]}>
        <meshBasicMaterial color="#b8b0a4" transparent opacity={0.15} />
      </mesh>
      <line geometry={outlineGeometry} position={[0, 0, 0.03]}>
        <lineBasicMaterial color="#b8b0a4" transparent opacity={0.6} />
      </line>
    </group>
  )
}

export interface DilationsCanvasProps {
  coordinatesVisible: boolean
  angleLabelsVisible: boolean
  children?: React.ReactNode
}

export function DilationsCanvas({ children }: DilationsCanvasProps) {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 10] }}
      dpr={[1, 1.5]}
      gl={{ powerPreference: 'high-performance', antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <CameraSetup />
      <CoordinateGrid />
      <PreImageTriangle />
      {children}
    </Canvas>
  )
}
```

**No unit tests for canvas** — R3F components require a WebGL context, not testable in jsdom. Verify visually in the browser.

- [ ] **Step 1: Implement `DilationsCanvas.tsx`** (code above)

- [ ] **Step 2: TypeScript check (not full build)**

```bash
pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

Expected: No errors from `DilationsCanvas.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/DilationsCanvas.tsx
git commit -m "feat(dilations): add DilationsCanvas — R3F orthographic canvas with grid and pre-image triangle"
```

---

## Task 3: HUD Overlay (`DilationsHUD.tsx`)

**Files:**
- Create: `src/components/modules/dilations/DilationsHUD.tsx`

The HUD is React DOM rendered outside the Canvas. It reads stage state and dispatches actions. All buttons are currently disabled/placeholder until round components are wired in later prompts.

### Button visibility rules

| Button | Visible when |
|--------|-------------|
| Reveal | `roundState === 'prediction'` AND `ROUND_CONFIGS[currentRound].hasGhostDrag` |
| Check  | `roundState === 'prediction'` AND `ROUND_CONFIGS[currentRound].hasSequenceBuilder` |
| Next   | `roundState === 'completion'` |
| (all)  | Disabled during `'reveal'` state |

### Phase label map

```typescript
const PHASE_LABELS: Record<PhaseId, string> = {
  'scale-factor': 'PHASE 1 — Scale Factor',
  'coordinate':   'PHASE 2 — Coordinate Rule',
  'similarity':   'PHASE 3 — Similarity',
  'aa-capstone':  'PHASE 4 — AA Criterion',
}
```

### Placeholder prompts

```typescript
const ROUND_PROMPTS: Record<RoundId, string> = {
  'dilate-k2':             'Where will the image triangle appear when k = 2?',
  'dilate-k2-properties':  'What properties are preserved by dilation?',
  'dilate-k3':             'Predict the image for k = 3.',
  'dilate-k-half':         'What happens when k is less than 1?',
  'dilate-summary':        'What have you discovered about scale factors?',
  'coord-k2':              'Predict the coordinates of the image vertices for k = 2.',
  'coord-k-half':          'Predict the coordinates for k = ½.',
  'coord-k-third':         'Can you predict the rule for any scale factor?',
  'similarity-guided':     'Build a sequence of transformations to map △ABC onto the target.',
  'similarity-rigid-dilation': 'Combine a rigid motion with a dilation to reach the target.',
  'similarity-inverse':    'Find a similarity transformation in reverse.',
  'aa-discover':           'Two triangles share two angle measures. What can you conclude?',
  'aa-confirm':            'Confirm: two angle pairs → similarity.',
  'capstone-final':        'Use what you know to complete the capstone challenge.',
}
```

### Phase interstitial text

The spec requires "Phase transitions show a brief interstitial text (1-2 sentences)." Implement as a simple overlay in the HUD: detect phase change by comparing the current `phase` to the previous render's phase using `useRef`. When a phase transition occurs, show a centered overlay with the transition text for 2 seconds, then auto-dismiss.

```typescript
const PHASE_INTROS: Record<PhaseId, string> = {
  'scale-factor': '',  // first phase — no interstitial on entry
  'coordinate':   'Now let\'s look at the coordinates. What happens to (x, y) when you dilate by k?',
  'similarity':   'Similar figures have the same shape but different sizes. Can a sequence of transformations connect them?',
  'aa-capstone':  'Two angles are enough to determine similarity. Let\'s see why.',
}
```

Show the interstitial overlay when `phase` changes to a new value (not on initial render). After 2000ms, hide automatically. Implement in `DilationsHUD` using `useState(showInterstitial)` + `useEffect` that watches `phase` and sets a timeout.

The interstitial overlay: centered, `bg-(--lab-surface)/95`, text `text-(--lab-text)`, `pointer-events-auto` so it can be dismissed by tapping.

### Layout

```
┌─────────────────────────────────────┐
│ [Phase label — top-left]  [Round — top-right] │
│                                     │
│  [Interstitial overlay — centered, auto-dismiss 2s]  │
│  [Prompt text — bottom area]        │
│  [Reveal / Check / Next — bottom-right] │
└─────────────────────────────────────┘
```

Positioned `absolute inset-0 pointer-events-none` over the canvas. Interactive elements have `pointer-events-auto`.

Design tokens:
- Background for HUD panels: `bg-(--lab-surface)/80 backdrop-blur-sm`
- Text: `text-(--lab-text)` / `text-(--lab-text-muted)`
- Buttons: follow `lab-silk lab-display-font` pattern, accent color for active

- [ ] **Step 1: Implement `DilationsHUD.tsx`**

```typescript
// src/components/modules/dilations/DilationsHUD.tsx
import { useState, useEffect, useRef } from 'react'
import type { StageState, StageAction } from './hooks/useDilationsStage'
import type { PhaseId, RoundId } from './utils/types'
import { ROUND_CONFIGS } from './utils/constants'

const PHASE_LABELS: Record<PhaseId, string> = {
  'scale-factor': 'PHASE 1 — Scale Factor',
  'coordinate':   'PHASE 2 — Coordinate Rule',
  'similarity':   'PHASE 3 — Similarity',
  'aa-capstone':  'PHASE 4 — AA Criterion',
}

// Empty string = no interstitial on first phase entry
const PHASE_INTROS: Record<PhaseId, string> = {
  'scale-factor': '',
  'coordinate':   "Now let's look at the coordinates. What happens to (x, y) when you dilate by k?",
  'similarity':   'Similar figures have the same shape but different sizes. Can a sequence of transformations connect them?',
  'aa-capstone':  'Two angles are enough to determine similarity. Let\'s see why.',
}

const ROUND_PROMPTS: Record<RoundId, string> = {
  'dilate-k2':                 'Where will the image triangle appear when k = 2?',
  'dilate-k2-properties':      'What properties are preserved by dilation?',
  'dilate-k3':                 'Predict the image for k = 3.',
  'dilate-k-half':             'What happens when k is less than 1?',
  'dilate-summary':            'What have you discovered about scale factors?',
  'coord-k2':                  'Predict the coordinates of the image vertices for k = 2.',
  'coord-k-half':              'Predict the coordinates for k = ½.',
  'coord-k-third':             'Can you predict the rule for any scale factor?',
  'similarity-guided':         'Build a sequence of transformations to map △ABC onto the target.',
  'similarity-rigid-dilation': 'Combine a rigid motion with a dilation to reach the target.',
  'similarity-inverse':        'Find a similarity transformation in reverse.',
  'aa-discover':               'Two triangles share two angle measures. What can you conclude?',
  'aa-confirm':                'Confirm: two angle pairs → similarity.',
  'capstone-final':            'Use what you know to complete the capstone challenge.',
}

export interface DilationsHUDProps {
  state: StageState
  dispatch: React.Dispatch<StageAction>
}

export function DilationsHUD({ state, dispatch }: DilationsHUDProps) {
  const { currentRound, roundState, phase } = state
  const config = ROUND_CONFIGS[currentRound]
  const prompt = ROUND_PROMPTS[currentRound]

  const inReveal = roundState === 'reveal'
  const showReveal = roundState === 'prediction' && config.hasGhostDrag
  const showCheck  = roundState === 'prediction' && config.hasSequenceBuilder
  const showNext   = roundState === 'completion'

  // Phase interstitial: show 1-2 sentences when phase changes, auto-dismiss after 2s
  const [interstitialText, setInterstitialText] = useState<string | null>(null)
  const prevPhaseRef = useRef<PhaseId>(phase)
  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase
      const text = PHASE_INTROS[phase]
      if (text) {
        setInterstitialText(text)
        const timer = setTimeout(() => setInterstitialText(null), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [phase])

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
      {/* Top bar */}
      <div className="flex items-start justify-between">
        <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
          {PHASE_LABELS[phase]}
        </span>
        <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
          {config.label}
        </span>
      </div>

      {/* Phase interstitial overlay */}
      {interstitialText && (
        <div
          className="pointer-events-auto absolute inset-0 flex items-center justify-center"
          onClick={() => setInterstitialText(null)}
        >
          <div className="bg-(--lab-surface)/95 px-6 py-4 max-w-xs text-center">
            <p className="lab-display-font text-sm text-(--lab-text)">{interstitialText}</p>
          </div>
        </div>
      )}

      {/* Bottom area */}
      <div className="flex items-end justify-between gap-3">
        {/* Prompt text */}
        <p className="lab-display-font text-sm text-(--lab-text) max-w-[60%]">
          {prompt}
        </p>

        {/* Navigation buttons */}
        <div className="pointer-events-auto flex gap-2">
          {showReveal && (
            <button
              disabled={inReveal}
              onClick={() => dispatch({ type: 'TRIGGER_REVEAL' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-3 min-h-[44px] min-w-[44px] border border-(--lab-accent) text-(--lab-accent) disabled:opacity-40 transition-opacity duration-150"
            >
              REVEAL
            </button>
          )}
          {showCheck && (
            <button
              disabled={inReveal}
              onClick={() => dispatch({ type: 'CHECK_SEQUENCE' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-3 min-h-[44px] min-w-[44px] border border-(--lab-accent) text-(--lab-accent) disabled:opacity-40 transition-opacity duration-150"
            >
              CHECK
            </button>
          )}
          {showNext && (
            <button
              onClick={() => dispatch({ type: 'ADVANCE_ROUND' })}
              className="lab-silk lab-display-font text-[10px] tracking-[0.1em] px-4 min-h-[44px] bg-(--lab-accent) text-(--lab-bg) transition-opacity duration-150"
            >
              NEXT
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/DilationsHUD.tsx
git commit -m "feat(dilations): add DilationsHUD — HTML overlay with prompt text and navigation buttons"
```

---

## Task 4: Module Orchestrator (`DilationsModule.tsx`)

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

Replace the placeholder with the real orchestrator that wires canvas + HUD + stage machine together.

### Layout

Use `h-dvh` outer container. Canvas takes remaining space. HUD is `absolute inset-0` over the canvas.

```typescript
// src/components/modules/dilations/DilationsModule.tsx
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsCanvas } from './DilationsCanvas'
import { DilationsHUD } from './DilationsHUD'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()

  return (
    <div className="flex h-dvh flex-col bg-(--lab-bg)">
      {/* Back button */}
      {onBack && (
        <div className="shrink-0 flex items-center px-3 h-10">
          <button
            onClick={onBack}
            className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted) hover:text-(--lab-text) transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center"
          >
            ← BACK
          </button>
        </div>
      )}

      {/* Canvas + HUD */}
      <div className="relative flex-1 min-h-0">
        <DilationsCanvas
          coordinatesVisible={state.coordinatesVisible}
          angleLabelsVisible={state.angleLabelsVisible}
        />
        <DilationsHUD state={state} dispatch={dispatch} />
      </div>
    </div>
  )
}
```

Note: `onComplete` is part of `ModuleProps` but is not yet called — completion handling comes in a later prompt when the capstone is built.

- [ ] **Step 1: Update `DilationsModule.tsx`** (code above)

- [ ] **Step 2: TypeScript check**

```bash
pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/modules/dilations/DilationsModule.tsx
git commit -m "feat(dilations): wire DilationsModule — canvas + HUD + stage machine orchestrator"
```

---

## Task 5: Final Verification

- [ ] **Step 1: Run all dilations tests**

```bash
pnpm vitest run src/components/modules/dilations
```

Expected: All tests pass (32 math tests + stage machine tests).

- [ ] **Step 2: Run M1 tests (ensure no regressions)**

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: All M1 tests still pass.

- [ ] **Step 3: Full build**

```bash
pnpm build
```

Expected: No TypeScript errors, no build failures.

- [ ] **Step 4: Commit if clean**

If all clean, no additional commit needed (previous task commits cover the work). If any cleanup fixes are needed, commit them:

```bash
git add <fixed files>
git commit -m "fix(dilations): resolve build issues from Prompt 2 integration"
```
