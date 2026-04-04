# Dilations Phase 3 Polish & Phase 1/2 Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 8 identified issues across Dilations Phases 1–3: snap precision, live coordinate updates, coordinate rule duplication, miss nudge copy, guidance deduplication, angle marks, camera expansion, and a full SequenceBuilder chip-rail rewrite.

**Architecture:** All changes are confined to `src/components/modules/dilations/`. Each task is independent and commits on its own. Tasks 1–5 are surgical single-file-or-two edits; Tasks 6–8 are more involved but still scoped. Task 8 (chip rail) is the largest and should be done last — all other tasks being committed first keeps diffs small and reviewable.

**Tech Stack:** React 19, TypeScript, React Three Fiber, GSAP, Tailwind CSS 4, Vitest + @testing-library/react

**Spec:** `docs/superpowers/specs/2026-04-04-dilations-phase3-polish-and-phase12-fixes.md`

---

## File Map

| File | Task(s) | What changes |
|------|---------|--------------|
| `components/GhostTriangle.tsx` | 1 | `snap()` resolution 0.5 → 0.25 |
| `DilationsModule.tsx` | 1, 2, 3, 4, 5 | Nudge snap; live coord condition; `isFirstReveal` prop; miss trailing text; remove `guidance` prop |
| `components/CoordinateReadout.tsx` | 3 | Accept + respect `isFirstReveal` prop to suppress rule line |
| `dilations-copy.ts` | 4, 5 | Add `MATCH_COPY` for Phase 3 rounds without earned reveals |
| `utils/types.ts` | 5 | Remove `guidance` from `SimilarityTask` |
| `utils/similarityTasks.ts` | 5 | Remove `guidance` field from task definitions |
| `components/AngleMarks.tsx` | 6 | Add optional `color` prop |
| `rounds/SimilarityRounds.tsx` | 6 | Replace `SideLengthLabels` with `AngleMarks` |
| `DilationsScene.tsx` | 7 | `CameraSetup` + `AxisLabels` accept `worldSize`; `DilationsScene` passes phase-aware value |
| `components/SequenceBuilder.tsx` | 8 | Full rewrite — chip rail + inline editor |
| `__tests__/CoordinateReadout.test.tsx` | 3 | Add `isFirstReveal` suppression test |
| `__tests__/similarityTasks.test.ts` | 5, 7 | Remove `guidance` assertion; update viewport description |
| `__tests__/SequenceBuilder.test.tsx` | 8 | New — tests for chip rail slot state machine |

> **Note:** `SequencePreview.tsx` already shows the per-step intermediate correctly — `composeTriangle(steps, preImage)` is called with only committed steps, so scaffolding is already working. No changes needed there.

---

## Task 1: Snap Precision

**Files:**
- Modify: `src/components/modules/dilations/components/GhostTriangle.tsx:11-13`
- Modify: `src/components/modules/dilations/DilationsModule.tsx:124`

- [ ] **Step 1: Update the `snap` function in `GhostTriangle.tsx`**

  Change lines 11-13 from:
  ```ts
  function snap(v: number): number {
    return Math.round(v * 2) / 2
  }
  ```
  To:
  ```ts
  function snap(v: number): number {
    return Math.round(v * 4) / 4
  }
  ```

- [ ] **Step 2: Update the keyboard nudge snap in `DilationsModule.tsx`**

  Find line ~124 (inside `handleKeyDown`):
  ```ts
  const snapped = { x: Math.round((base.x + dx) * 2) / 2, y: Math.round((base.y + dy) * 2) / 2 }
  ```
  Change to:
  ```ts
  const snapped = { x: Math.round((base.x + dx) * 4) / 4, y: Math.round((base.y + dy) * 4) / 4 }
  ```

- [ ] **Step 3: Verify build passes**
  ```bash
  pnpm build
  ```
  Expected: no TypeScript errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/modules/dilations/components/GhostTriangle.tsx src/components/modules/dilations/DilationsModule.tsx
  git commit -m "fix(dilations): halve drag snap resolution to 0.25 units"
  ```

---

## Task 2: Live Coordinate Update on Drag

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx:189`

- [ ] **Step 1: Fix the condition that gates live coordinate updates**

  Find the `formulaReadout` computation (~line 189) inside the `isCoordinatePhase` branch:
  ```ts
  const predictedVertices =
    roundState === 'prediction' && nudgePosition != null
      ? ghostVerticesToWorld(CANONICAL_TRIANGLE, config.scaleFactor, nudgePosition)
      : undefined
  ```
  Change to:
  ```ts
  const predictedVertices =
    (roundState === 'active' || roundState === 'prediction') && nudgePosition != null
      ? ghostVerticesToWorld(CANONICAL_TRIANGLE, config.scaleFactor, nudgePosition)
      : undefined
  ```

- [ ] **Step 2: Verify build passes**
  ```bash
  pnpm build
  ```

- [ ] **Step 3: Manual verify**

  Run `pnpm dev`, navigate to Dilations → Phase 2 (coord-k2). Drag the ghost triangle. The formula strip should show updating `A'(x, y)` coordinates while dragging, not only after drop.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx
  git commit -m "fix(dilations): live coordinate readout during active drag in Phase 2"
  ```

---

## Task 3: Coordinate Rule Suppression During First Reveal

**Files:**
- Modify: `src/components/modules/dilations/components/CoordinateReadout.tsx`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`
- Modify: `src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx`

- [ ] **Step 1: Write a failing test for the new prop**

  Add to `__tests__/CoordinateReadout.test.tsx`:
  ```tsx
  it('suppresses rule line when isFirstReveal is true', () => {
    render(
      <CoordinateReadout
        scaleFactor={2}
        roundState="completion"
        isGeneralized={false}
        isFirstReveal={true}
      />
    )
    // coordinate table still shows
    expect(screen.getByText(/A\(1, 1\)/)).toBeTruthy()
    // rule line is suppressed
    expect(screen.queryByText(/\(x, y\)\s*→\s*\(2x, 2y\)/)).toBeNull()
  })
  ```

- [ ] **Step 2: Run the test to confirm it fails**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx
  ```
  Expected: FAIL — `isFirstReveal` prop doesn't exist yet.

- [ ] **Step 3: Add `isFirstReveal` prop to `CoordinateReadout`**

  In `components/CoordinateReadout.tsx`, update the props interface:
  ```ts
  export interface CoordinateReadoutProps {
    scaleFactor: number
    roundState: RoundState
    isGeneralized: boolean
    predictedVertices?: Triangle
    /** When true, suppresses the rule line (PromptReadout shows notation instead). */
    isFirstReveal?: boolean
  }
  ```

  In the after-reveal branch (line ~74), wrap the rule `<div>` with a condition:
  ```tsx
  {!isFirstReveal && (
    <div className={[
      'lab-data-font text-sm font-semibold border-t border-(--lab-border) pt-1.5',
      isGeneralized ? 'text-(--lab-earned)' : 'text-(--lab-accent)',
    ].join(' ')}>
      {coordinateRule(scaleFactor, isGeneralized)}
    </div>
  )}
  ```

- [ ] **Step 4: Run the test to confirm it passes**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx
  ```
  Expected: all tests PASS. Note: the existing test at line 24 (`'shows coordinate rule after reveal'`) implicitly covers the "rule IS shown when `isFirstReveal` is falsy" case — no additional test needed for that path.

- [ ] **Step 5: Pass `isFirstReveal` from `DilationsModule.tsx`**

  Find where `CoordinateReadout` is rendered (~line 195) and add the prop:
  ```tsx
  return (
    <CoordinateReadout
      scaleFactor={config.scaleFactor}
      roundState={roundState}
      isGeneralized={currentRound === 'coord-k-third'}
      predictedVertices={predictedVertices}
      isFirstReveal={isFirstReveal}
    />
  )
  ```

- [ ] **Step 6: Build + run all dilations tests**
  ```bash
  pnpm build
  pnpm vitest run src/components/modules/dilations
  ```
  Expected: clean build, all tests pass.

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/modules/dilations/components/CoordinateReadout.tsx src/components/modules/dilations/DilationsModule.tsx src/components/modules/dilations/__tests__/CoordinateReadout.test.tsx
  git commit -m "fix(dilations): suppress coord rule in formula strip during earned reveal"
  ```

---

## Task 4: Miss Nudge Copy

**Files:**
- Modify: `src/components/modules/dilations/DilationsModule.tsx`

- [ ] **Step 1: Wire `trailingText` into the `PromptReadout` call for the miss state**

  Verify first: `PromptReadout` already has `trailingText?: string` in its props interface (`components/PromptReadout.tsx` line 14) — no changes needed to that file. In `DilationsModule.tsx`, find the `<PromptReadout>` JSX (~line 249) and add:
  ```tsx
  trailingText={
    roundState === 'prediction' && predictionAccuracy === 'miss'
      ? 'Pretty far off — try repositioning before revealing.'
      : undefined
  }
  ```

- [ ] **Step 2: Build**
  ```bash
  pnpm build
  ```

- [ ] **Step 3: Manual verify**

  Run `pnpm dev`, go to Dilations Phase 1 (`dilate-k2`). Drop the ghost far from the target, then check the prompt shows the additional trailing line. Drop it close — trailing line should not appear.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): add re-engagement nudge copy on missed prediction"
  ```

---

## Task 5: Remove Guidance Field + Add Default Match Copy

**Files:**
- Modify: `src/components/modules/dilations/utils/types.ts`
- Modify: `src/components/modules/dilations/utils/similarityTasks.ts`
- Modify: `src/components/modules/dilations/dilations-copy.ts`
- Modify: `src/components/modules/dilations/DilationsModule.tsx`
- Modify: `src/components/modules/dilations/__tests__/similarityTasks.test.ts`

- [ ] **Step 1: Remove `guidance` from `SimilarityTask` type**

  In `utils/types.ts`, find the `SimilarityTask` interface and remove the `guidance?: string` field.

  > If `SimilarityTask` is defined in `utils/similarityTasks.ts` rather than `types.ts`, make the change there instead.

- [ ] **Step 2: Remove `guidance` from task definitions in `similarityTasks.ts`**

  Delete the `guidance:` lines from `SIMILARITY_GUIDED` and `SIMILARITY_RIGID_DILATION`. The type no longer has the field, so TypeScript will flag any leftovers.

- [ ] **Step 3: Add `MATCH_COPY` to `dilations-copy.ts`**

  Add a constant for the default match copy used in rounds without an earned reveal:
  ```ts
  export const DEFAULT_SIMILARITY_MATCH_COPY =
    'A sequence of rigid motions and a dilation maps the pre-image onto the target.'
  ```
  Export it alongside `EARNED_REVEALS`.

- [ ] **Step 4: Remove `guidance` prop from `SequenceBuilder` call in `DilationsModule.tsx`**

  Find (~line 338):
  ```tsx
  guidance={roundState === 'active' ? currentTask.guidance : undefined}
  ```
  Delete this line entirely. The `guidance` prop will be removed from `SequenceBuilderProps` in Task 8, but for now removing it from the call site eliminates the TypeScript error after removing the field from the type.

  If `SequenceBuilderProps` still has `guidance?: string`, it will go unused — no error. It will be cleaned up entirely in Task 8. **Do not re-add it** when working on subsequent tasks.

- [ ] **Step 5: Update the stale viewport assertion in `similarityTasks.test.ts`**

  Find the test `'all targets have integer coordinates within viewport [-2, 14]'` and update its description to reflect the new range:
  ```ts
  it('all targets have integer coordinates within Phase 1/2 viewport range', () => {
  ```
  The assertion values (`>= -2`, `<= 14`) remain valid for targets — only the description was inaccurate.

- [ ] **Step 6: Run all dilations tests**
  ```bash
  pnpm vitest run src/components/modules/dilations
  pnpm build
  ```
  Expected: all tests pass, clean build.

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/modules/dilations/utils/types.ts src/components/modules/dilations/utils/similarityTasks.ts src/components/modules/dilations/dilations-copy.ts src/components/modules/dilations/DilationsModule.tsx src/components/modules/dilations/__tests__/similarityTasks.test.ts
  git commit -m "refactor(dilations): remove guidance duplication, add default match copy"
  ```

---

## Task 6: Angle Marks in Phase 3

**Files:**
- Modify: `src/components/modules/dilations/components/AngleMarks.tsx`
- Modify: `src/components/modules/dilations/rounds/SimilarityRounds.tsx`

- [ ] **Step 1: Add optional `color` prop to `AngleMarks`**

  In `AngleMarks.tsx`, the `MARK_COLOR` constant is hardcoded to `'#7a746a'`. Add a prop:

  ```ts
  export interface AngleMarksProps {
    triangles: readonly Triangle[]
    visible: boolean
    animating: boolean
    /** Override arc color. Defaults to '#7a746a' (lab-ghost). */
    color?: string
  }
  ```

  Inside the `useMemo` that builds `markLines`, replace the hardcoded `MARK_COLOR` with `color ?? MARK_COLOR`:
  ```ts
  /* eslint-disable react-hooks/refs -- reads initial ref value for Three.js material opacity */
  const markLines = useMemo(() => {
    const lines: THREE.Line[] = []
    for (const tri of triangles) {
      const { a, b, c } = tri
      const vertices = [
        { v: a, adj1: b, adj2: c },
        { v: b, adj1: a, adj2: c },
        { v: c, adj1: a, adj2: b },
      ]
      for (const { v, adj1, adj2 } of vertices) {
        const geo = buildArcGeo(v, adj1, adj2)
        const mat = new THREE.LineBasicMaterial({
          color: color ?? MARK_COLOR,
          transparent: true,
          opacity: opacityRef.current.v,
        })
        lines.push(new THREE.Line(geo, mat))
      }
    }
    return lines
  }, [triangles, color])
  /* eslint-enable react-hooks/refs */
  ```

  > **Important:** The existing `/* eslint-disable react-hooks/refs */` suppression block (lines 47–69 of the original file) must be preserved. The `opacityRef.current.v` read inside `useMemo` intentionally captures the initial value — do not remove the suppression comment or the reasoning comment. The dependency array is `[triangles, color]`.

- [ ] **Step 2: Replace `SideLengthLabels` with `AngleMarks` in `SimilarityRounds.tsx`**

  In `SimilarityScene`:
  - Remove imports: `SpriteLabel`, and the `midpoint`, `offsetFromCentroid`, `formatLength`, `SideLengthLabels` helpers — delete all of them.
  - Add import: `import { AngleMarks } from '../components/AngleMarks'`
  - Replace the two `<SideLengthLabels>` with:
    ```tsx
    {/* Angle marks — static (not animating), show immediately */}
    <AngleMarks
      triangles={[task.preImage]}
      visible={true}
      animating={false}
      color="#b8b0a4"
    />
    <AngleMarks
      triangles={[task.target]}
      visible={true}
      animating={false}
      color="#7cc87c"
    />
    ```

- [ ] **Step 3: Build**
  ```bash
  pnpm build
  ```
  Expected: no errors. TypeScript will catch any leftover `SideLengthLabels` references.

- [ ] **Step 4: Manual verify**

  Run `pnpm dev`, navigate to Dilations Phase 3 (`similarity-guided`). Both triangles should show angle arc marks — pre-image in cream, target in phosphor green. No side-length numbers visible.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/modules/dilations/components/AngleMarks.tsx src/components/modules/dilations/rounds/SimilarityRounds.tsx
  git commit -m "feat(dilations): show angle marks instead of side lengths in Phase 3"
  ```

---

## Task 7: Camera Expansion for Phase 3

**Files:**
- Modify: `src/components/modules/dilations/DilationsScene.tsx`

The `CameraSetup` function and `AxisLabels` component are both defined inside `DilationsScene.tsx`. The `DilationsScene` component will derive axis labels from `worldSize`.

- [ ] **Step 1: Update `CameraSetup` to accept `worldSize` and remove dead constants**

  The current file declares `WORLD_MIN`, `WORLD_MAX`, `WORLD_SIZE`, `WORLD_CENTER_X`, `WORLD_CENTER_Y` at the top. These are only used by `CameraSetup`. After the rewrite, they are orphaned — delete all five. `CoordinateGrid` uses only `GRID_DRAW_MIN` and `GRID_DRAW_MAX`, which are separate and stay unchanged.

  Change `CameraSetup` from a no-props function to one that accepts `worldSize`:
  ```tsx
  function CameraSetup({ worldSize }: { worldSize: number }) {
    const { camera, size } = useThree()
    // center: (5,5) for worldSize=20 [-5,15], (6,6) for worldSize=16 [-2,14]
    const worldCenter = worldSize === 20 ? 5 : 6
    useFrame(() => {
      if (!(camera instanceof THREE.OrthographicCamera)) return
      const scale = Math.min(size.width, size.height) / worldSize
      const worldW = size.width / scale
      const worldH = size.height / scale
      const left   = worldCenter - worldW / 2
      const right  = worldCenter + worldW / 2
      const top    = worldCenter + worldH / 2
      const bottom = worldCenter - worldH / 2
      const changed =
        Math.abs(camera.left - left) > 0.01 ||
        Math.abs(camera.right - right) > 0.01 ||
        Math.abs(camera.top - top) > 0.01 ||
        Math.abs(camera.bottom - bottom) > 0.01
      if (changed) {
        camera.zoom = 1
        camera.left = left; camera.right = right
        camera.top = top; camera.bottom = bottom
        camera.updateProjectionMatrix()
      }
    })
    return null
  }
  ```

- [ ] **Step 2: Update `AxisLabels` to accept `axisIntegers`**

  Change `AxisLabels` to accept the label set as a prop instead of using the module-level constant. Use a slightly wider `planeWidth` for negative integers (the `-` sign makes them wider than single digits):
  ```tsx
  function AxisLabels({ integers }: { integers: readonly number[] }) {
    return (
      <>
        {integers.map(n => (
          <SpriteLabel key={`x-${n}`} text={String(n)} position={{ x: n, y: -0.6 }} zLayer={0.05} color="#7a746a" planeWidth={n < 0 ? 0.7 : 0.55} />
        ))}
        {integers.map(n => (
          <SpriteLabel key={`y-${n}`} text={String(n)} position={{ x: -0.6, y: n }} zLayer={0.05} color="#7a746a" planeWidth={n < 0 ? 0.7 : 0.55} />
        ))}
        <SpriteLabel text="0" position={{ x: -0.5, y: -0.5 }} zLayer={0.05} color="#7a746a" planeWidth={0.45} />
      </>
    )
  }
  ```
  Delete the old `const AXIS_LABEL_INTEGERS = [2, 4, 6, 8, 10, 12]` constant.

- [ ] **Step 3: Add `worldSize` prop to `DilationsScene` and wire everything together**

  Update `DilationsSceneProps`:
  ```ts
  export interface DilationsSceneProps {
    coordinatesVisible: boolean
    angleLabelsVisible: boolean
    worldSize?: number    // defaults to 16
    children?: React.ReactNode
    onContextLost?: () => void
    onContextRestored?: () => void
  }
  ```

  In the `DilationsScene` function body, derive the axis label set:
  ```tsx
  const ws = worldSize ?? 16
  const axisIntegers: readonly number[] = ws === 20
    ? [-4, -2, 0, 2, 4, 6, 8, 10, 12, 14]
    : [2, 4, 6, 8, 10, 12]
  ```

  Pass props into the Canvas:
  ```tsx
  <CameraSetup worldSize={ws} />
  <AxisLabels integers={axisIntegers} />
  ```

- [ ] **Step 4: Pass `worldSize={20}` from `DilationsModule.tsx` for Phase 3**

  In `DilationsModule.tsx`, find the `<DilationsScene>` JSX and add:
  ```tsx
  worldSize={isSimilarityPhase ? 20 : 16}
  ```

- [ ] **Step 5: Build**
  ```bash
  pnpm build
  ```

- [ ] **Step 6: Manual verify**

  Run `pnpm dev`, navigate to `similarity-rigid-dilation`. Add a Reflect(y-axis) step. The intermediate ghost (B'(−4, 2)) should be fully visible on screen with axis labels at −4 and −2 showing. Navigate back to Phase 1 — camera and labels should be unchanged.

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/modules/dilations/DilationsScene.tsx src/components/modules/dilations/DilationsModule.tsx
  git commit -m "feat(dilations): expand Phase 3 camera to 20x20 to show reflected/rotated intermediates"
  ```

---

## Task 8: SequenceBuilder Chip Rail Rewrite

**Files:**
- Rewrite: `src/components/modules/dilations/components/SequenceBuilder.tsx`
- Create: `src/components/modules/dilations/__tests__/SequenceBuilder.test.tsx`

This is a complete rewrite of `SequenceBuilder.tsx`. Read the spec section "Phase 3 — SequenceBuilder Redesign" before starting.

### Key behavioral rules to implement correctly

1. **Draft vs committed:** `SlotState` with `type: null` is a local draft. `onAddStep` fires only when type is first selected. Committed steps update via `onUpdateStep`. SequencePreview receives only committed steps (that's handled externally — just call the right callbacks).
2. **Type change resets params:** When `slot.type` changes to a different type, reset the entire `SlotState` to `DEFAULT_SLOT` merged with the new type.
3. **RESET → one empty draft:** `setSlots([{ ...DEFAULT_SLOT }])`, `setActiveSlotIndex(null)`, call `onReset()`.
4. **`+` button:** Only show when `slots.length < maxSteps` AND `slots[slots.length - 1].type !== null`.
5. **`feedbackState === 'match'`:** Close editor (`setActiveSlotIndex(null)`), all chips show accent color.
6. **180° rotate grayed cell:** `pointer-events: none`, `opacity-30`, `(same)` label at 7px. Tapping it does nothing.
7. **DONE button:** The inline editor has a `DONE` button in the header (top-right). Clicking it calls `setActiveIndex(null)` to close the editor. Tapping the same chip again also toggles it closed. Both paths are supported — DONE is required for mobile UX (non-obvious toggle on touch).
8. **`DEFAULT_SLOT.direction`:** Changed from `'cw'` (old component) to `'ccw'` (new component). This is intentional — the 3×2 grid's top-left cell is `90°↺` (CCW), so `'ccw'` pre-selects the natural first option after a type change. Document this in code with a comment.

### Chip value display format

| Type | Display |
|------|---------|
| translate | `T +1,+1` or `T −3,+0` |
| reflect | `Ref Y` or `Ref X` |
| rotate | `Rot 90°↺` / `Rot 90°↻` / `Rot 180°` / `Rot 270°↺` / `Rot 270°↻` |
| dilate | `Dil ×{lockedK}` |
| null (draft) | `—` in ghost color |

### Rotate 3×2 grid layout

```
[90°↺]  [180°]      [270°↺]
[90°↻]  [(same)]    [270°↻]
```
The center-bottom cell `(same)` is `pointer-events-none opacity-30`.

- [ ] **Step 1: Write failing tests**

  Create `__tests__/SequenceBuilder.test.tsx`:
  ```tsx
  import { describe, it, expect, vi } from 'vitest'
  import { render, screen, fireEvent } from '@testing-library/react'
  import { SequenceBuilder } from '../components/SequenceBuilder'

  const noop = () => {}

  function defaultProps(overrides = {}) {
    return {
      steps: [],
      maxSteps: 3,
      kLocked: true,
      lockedK: 2,
      feedbackState: 'idle' as const,
      onAddStep: noop,
      onUpdateStep: noop,
      onRemoveStep: noop,
      onCheckSequence: noop,
      onNext: noop,
      onReset: noop,
      ...overrides,
    }
  }

  describe('SequenceBuilder chip rail', () => {
    it('initializes with one empty draft chip showing "—"', () => {
      render(<SequenceBuilder {...defaultProps()} />)
      expect(screen.getByText('—')).toBeTruthy()
    })

    it('shows STEP 1 label on the first chip', () => {
      render(<SequenceBuilder {...defaultProps()} />)
      expect(screen.getByText('STEP 1')).toBeTruthy()
    })

    it('shows CHECK button when steps array is empty', () => {
      render(<SequenceBuilder {...defaultProps()} />)
      expect(screen.getByText('CHECK')).toBeTruthy()
    })

    it('shows NEXT button and hides CHECK when feedbackState is match', () => {
      render(<SequenceBuilder {...defaultProps({ feedbackState: 'match' })} />)
      expect(screen.getByText('NEXT')).toBeTruthy()
      expect(screen.queryByText('CHECK')).toBeNull()
    })

    it('shows RESET button in idle state', () => {
      render(<SequenceBuilder {...defaultProps()} />)
      expect(screen.getByText('RESET')).toBeTruthy()
    })

    it('hides RESET button in match state', () => {
      render(<SequenceBuilder {...defaultProps({ feedbackState: 'match' })} />)
      expect(screen.queryByText('RESET')).toBeNull()
    })

    it('shows amber hint strip in miss state', () => {
      render(<SequenceBuilder {...defaultProps({ feedbackState: 'miss' })} />)
      expect(screen.getByText(/Tap any step/)).toBeTruthy()
    })

    it('calls onReset and resets to one empty chip when RESET is clicked', () => {
      const onReset = vi.fn()
      render(<SequenceBuilder {...defaultProps({ onReset })} />)
      fireEvent.click(screen.getByText('RESET'))
      expect(onReset).toHaveBeenCalledOnce()
      expect(screen.getByText('—')).toBeTruthy()
    })

    it('calls onCheckSequence when CHECK is clicked', () => {
      const onCheckSequence = vi.fn()
      render(<SequenceBuilder {...defaultProps({ onCheckSequence })} />)
      fireEvent.click(screen.getByText('CHECK'))
      expect(onCheckSequence).toHaveBeenCalledOnce()
    })

    it('does not show + button when last slot has no type', () => {
      render(<SequenceBuilder {...defaultProps()} />)
      expect(screen.queryByText('+')).toBeNull()
    })
  })
  ```

- [ ] **Step 2: Run tests to confirm they fail**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/SequenceBuilder.test.tsx
  ```
  Expected: FAIL (component doesn't match new API yet).

- [ ] **Step 3: Rewrite `SequenceBuilder.tsx`**

  The component structure:

  ```tsx
  // src/components/modules/dilations/components/SequenceBuilder.tsx

  import { useState, useEffect } from 'react'
  import type { TransformStep, TransformType } from '../utils/types'

  type SlotState = {
    type: TransformType | null
    dx: number; dy: number
    axis: 'x' | 'y'
    angleDeg: 90 | 180 | 270
    direction: 'cw' | 'ccw'
  }

  const DEFAULT_SLOT: SlotState = {
    type: null, dx: 0, dy: 0, axis: 'y', angleDeg: 90, direction: 'ccw',
  }

  export interface SequenceBuilderProps {
    steps: TransformStep[]
    maxSteps: number
    kLocked: boolean
    lockedK: number
    feedbackState: 'idle' | 'match' | 'miss'
    onAddStep: (step: TransformStep) => void
    onUpdateStep: (index: number, step: TransformStep) => void
    onRemoveStep: (index: number) => void
    onCheckSequence: () => void
    onNext: () => void
    onReset: () => void
  }

  // --- helpers ---

  function slotToStep(slot: SlotState, lockedK: number): TransformStep | null {
    if (!slot.type) return null
    switch (slot.type) {
      case 'translate': return { type: 'translate', params: { dx: slot.dx, dy: slot.dy } }
      case 'reflect':   return { type: 'reflect', params: { axis: slot.axis } }
      case 'rotate':    return { type: 'rotate', params: { angleDeg: slot.direction === 'cw' ? -slot.angleDeg : slot.angleDeg } }
      case 'dilate':    return { type: 'dilate', params: { k: lockedK } }
    }
  }

  function chipValue(slot: SlotState, lockedK: number): string {
    if (!slot.type) return '—'
    switch (slot.type) {
      case 'translate': {
        const dx = `${slot.dx >= 0 ? '+' : ''}${slot.dx}`
        const dy = `${slot.dy >= 0 ? '+' : ''}${slot.dy}`
        return `T ${dx},${dy}`
      }
      case 'reflect': return `Ref ${slot.axis.toUpperCase()}`
      case 'rotate':  return `Rot ${slot.angleDeg}°${slot.direction === 'ccw' ? '↺' : '↻'}`
      case 'dilate':  return `Dil ×${lockedK}`
    }
  }

  // --- sub-components ---

  function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
    return (
      <div className="flex flex-col gap-1">
        <span className="lab-silk lab-display-font text-[7px] tracking-[0.2em] text-(--lab-text-muted)">{label}</span>
        <div className="flex items-center">
          <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
            className="w-[26px] h-[26px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 focus:outline-none">−</button>
          <span className="w-[26px] text-center lab-data-font text-xs text-(--lab-text)">{value >= 0 ? `+${value}` : value}</span>
          <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
            className="w-[26px] h-[26px] flex items-center justify-center border border-(--lab-border) lab-data-font text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent) disabled:opacity-30 focus:outline-none">+</button>
        </div>
      </div>
    )
  }

  function InlineEditor({ index, slot, lockedK, onChange }: { index: number; slot: SlotState; lockedK: number; onChange: (s: SlotState) => void }) {
    const types: { key: TransformType; label: string }[] = [
      { key: 'translate', label: 'T' },
      { key: 'reflect',   label: 'Ref' },
      { key: 'rotate',    label: 'Rot' },
      { key: 'dilate',    label: 'Dil' },
    ]

    function setType(t: TransformType) {
      // Reset to defaults for the new type
      onChange({ ...DEFAULT_SLOT, type: t })
    }

    return (
      <div className="px-3 py-2 bg-(--lab-surface) border-b border-(--lab-border)">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-accent)">
            EDITING STEP {index + 1}
          </span>
        </div>

        {/* Type row */}
        <div className="flex gap-1 mb-2">
          {types.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setType(key)}
              className={['flex-1 min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.1em] focus:outline-none transition-colors duration-150',
                slot.type === key
                  ? 'border-(--lab-accent) text-(--lab-accent) bg-(rgba(124,200,124,0.06))'
                  : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent) hover:text-(--lab-accent)',
              ].join(' ')}>
              {label}
            </button>
          ))}
        </div>

        {/* Params */}
        {slot.type === 'translate' && (
          <div className="flex gap-3">
            <Stepper label="DX" value={slot.dx} min={-6} max={6} onChange={v => onChange({ ...slot, dx: v })} />
            <Stepper label="DY" value={slot.dy} min={-6} max={6} onChange={v => onChange({ ...slot, dy: v })} />
          </div>
        )}

        {slot.type === 'reflect' && (
          <div className="flex gap-1">
            {(['y', 'x'] as const).map(axis => (
              <button key={axis} type="button" onClick={() => onChange({ ...slot, axis })}
                className={['flex-1 min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.1em] focus:outline-none transition-colors duration-150',
                  slot.axis === axis ? 'border-(--lab-accent) text-(--lab-accent)' : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent)',
                ].join(' ')}>
                {axis.toUpperCase()}-AXIS
              </button>
            ))}
          </div>
        )}

        {slot.type === 'rotate' && (
          // 3×2 combined grid
          <div className="grid grid-cols-3 gap-1">
            {([
              { deg: 90,  dir: 'ccw', label: '90°↺' },
              { deg: 180, dir: 'ccw', label: '180°' },
              { deg: 270, dir: 'ccw', label: '270°↺' },
              { deg: 90,  dir: 'cw',  label: '90°↻' },
              null, // grayed 180° CW cell
              { deg: 270, dir: 'cw',  label: '270°↻' },
            ] as const).map((cell, i) => {
              if (!cell) {
                return (
                  <div key={i} className="min-h-[28px] flex items-center justify-center border border-(--lab-border) opacity-30 pointer-events-none">
                    <span className="lab-silk lab-display-font text-[7px] text-(--lab-text-muted)">(same)</span>
                  </div>
                )
              }
              const isActive = slot.angleDeg === cell.deg && slot.direction === cell.dir
              return (
                <button key={i} type="button"
                  onClick={() => onChange({ ...slot, angleDeg: cell.deg as 90|180|270, direction: cell.dir as 'cw'|'ccw' })}
                  className={['min-h-[28px] border lab-silk lab-display-font text-[8px] tracking-[0.08em] focus:outline-none transition-colors duration-150',
                    isActive ? 'border-(--lab-accent) text-(--lab-accent)' : 'border-(--lab-border) text-(--lab-text-muted) hover:border-(--lab-accent)',
                  ].join(' ')}>
                  {cell.label}
                </button>
              )
            })}
          </div>
        )}

        {slot.type === 'dilate' && (
          <div className="flex items-center gap-2 py-1">
            <span className="lab-silk lab-display-font text-[8px] tracking-[0.15em] text-(--lab-text-muted)">k =</span>
            <span className="lab-data-font text-sm text-(--lab-text-muted) opacity-50">{lockedK}</span>
            <span className="lab-silk lab-display-font text-[7px] tracking-[0.15em] text-(--lab-text-muted) opacity-50 ml-1">· fixed for this task</span>
          </div>
        )}
      </div>
    )
  }

  // --- main component ---

  export function SequenceBuilder({
    steps, maxSteps, kLocked: _kLocked, lockedK,
    feedbackState, onAddStep, onUpdateStep, onRemoveStep,
    onCheckSequence, onNext, onReset,
  }: SequenceBuilderProps) {
    const [slots, setSlots] = useState<SlotState[]>([{ ...DEFAULT_SLOT }])
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    // Close editor on match
    useEffect(() => {
      if (feedbackState === 'match') setActiveIndex(null)
    }, [feedbackState])

    function handleSlotChange(index: number, newSlot: SlotState) {
      const prevSlot = slots[index]
      const updated = slots.map((s, i) => i === index ? newSlot : s)
      setSlots(updated)

      const step = slotToStep(newSlot, lockedK)
      if (!step) return

      if (prevSlot.type === null) {
        // First type selection — promote draft to committed
        onAddStep(step)
      } else {
        onUpdateStep(index, step)
      }
    }

    function handleRemoveSlot(index: number) {
      const newSlots = slots.length > 1
        ? slots.filter((_, i) => i !== index)
        : [{ ...DEFAULT_SLOT }]
      setSlots(newSlots)
      setActiveIndex(null)
      onRemoveStep(index)
    }

    function handleReset() {
      setSlots([{ ...DEFAULT_SLOT }])
      setActiveIndex(null)
      onReset()
    }

    function handleAddSlot() {
      setSlots(prev => [...prev, { ...DEFAULT_SLOT }])
      setActiveIndex(slots.length) // open editor for the new slot
    }

    const lastSlotCommitted = slots[slots.length - 1]?.type !== null
    const canAdd = slots.length < maxSteps && lastSlotCommitted

    return (
      <div className="flex flex-col bg-(--lab-bg)">
        {/* Chip rail */}
        <div className="flex items-center gap-0 px-2.5 py-1.5 border-b border-(--lab-border) overflow-x-auto">
          {slots.map((slot, i) => {
            const isActive = activeIndex === i
            const isMatch = feedbackState === 'match' && slot.type !== null
            return (
              <div key={i} className="contents">
                {i > 0 && (
                  <span className="px-1.5 lab-silk lab-display-font text-[9px] text-(--lab-text-muted) flex-shrink-0">→</span>
                )}
                <button
                  type="button"
                  onClick={() => setActiveIndex(isActive ? null : i)}
                  className={[
                    'flex flex-col items-start px-2.5 py-1 border flex-shrink-0 transition-colors duration-150 focus:outline-none',
                    isMatch  ? 'border-(--lab-accent) bg-(rgba(124,200,124,0.08))' :
                    isActive ? 'border-(--lab-accent) bg-(rgba(124,200,124,0.06))' :
                               'border-(--lab-border) bg-(--lab-surface)',
                  ].join(' ')}
                >
                  <span className="lab-silk lab-display-font text-[7px] tracking-[0.2em] text-(--lab-text-muted) mb-0.5">
                    STEP {i + 1}
                  </span>
                  <span className={['lab-data-font text-[11px] whitespace-nowrap',
                    slot.type === null ? 'text-(--lab-ghost) italic' :
                    isMatch           ? 'text-(--lab-accent)' :
                                        'text-(--lab-accent)',
                  ].join(' ')}>
                    {chipValue(slot, lockedK)}
                  </span>
                </button>
              </div>
            )
          })}

          {canAdd && (
            <button
              type="button"
              onClick={handleAddSlot}
              className="w-8 h-8 ml-1.5 flex items-center justify-center border border-dashed border-(--lab-border) text-(--lab-text-muted) text-base hover:border-(--lab-accent) hover:text-(--lab-accent) focus:outline-none flex-shrink-0 transition-colors duration-150"
            >+</button>
          )}
        </div>

        {/* Inline editor */}
        {activeIndex !== null && feedbackState !== 'match' && (
          <InlineEditor
            index={activeIndex}
            slot={slots[activeIndex]}
            lockedK={lockedK}
            onChange={newSlot => handleSlotChange(activeIndex, newSlot)}
          />
        )}

        {/* Amber hint strip on miss */}
        {feedbackState === 'miss' && (
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-(--lab-border) bg-(--lab-surface)">
            <div className="w-1.5 h-1.5 rounded-full bg-(--lab-earned) flex-shrink-0" />
            <span className="lab-display-font text-[10px] text-(--lab-earned)">
              Tap any step to adjust its parameters.
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          {feedbackState !== 'match' && (
            <button type="button" onClick={handleReset}
              className="min-h-[30px] px-2.5 border border-(--lab-danger) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-danger) hover:opacity-70 focus:outline-none transition-opacity duration-150">
              RESET
            </button>
          )}
          <div className="flex-1" />
          {feedbackState === 'match' ? (
            <button type="button" onClick={onNext}
              className="min-h-[30px] px-3 bg-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-bg) hover:opacity-80 focus:outline-none transition-opacity duration-150">
              NEXT
            </button>
          ) : (
            <button type="button" onClick={onCheckSequence} disabled={steps.length === 0}
              className="min-h-[30px] px-3 border border-(--lab-accent) lab-silk lab-display-font text-[8px] tracking-[0.1em] text-(--lab-accent) hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none transition-opacity duration-150">
              CHECK
            </button>
          )}
        </div>
      </div>
    )
  }
  ```

  > **Note:** The `guidance` prop has been intentionally removed from `SequenceBuilderProps`. It was removed from the `DilationsModule.tsx` call site in Task 5.

- [ ] **Step 4: Run the failing tests**
  ```bash
  pnpm vitest run src/components/modules/dilations/__tests__/SequenceBuilder.test.tsx
  ```
  Expected: all tests PASS.

- [ ] **Step 5: Run full dilations test suite + build**
  ```bash
  pnpm vitest run src/components/modules/dilations
  pnpm build
  ```
  Expected: all tests pass, no TypeScript errors.

- [ ] **Step 6: Manual verify all three feedback states**

  Run `pnpm dev`, navigate to Dilations Phase 3 (`similarity-guided`):
  - **Idle:** one draft chip `[STEP 1 —]`, CHECK disabled, no amber strip
  - Tap chip → inline editor opens below rail with type selector
  - Select **T**, set DX=1 DY=1 → chip updates to `[STEP 1 T +1,+1]`, SequencePreview ghost updates in scene
  - Click `+` → second draft chip appears, tap it → editor switches to Step 2
  - Select **Dil** → chip shows `[STEP 2 Dil ×2]`, CHECK becomes enabled
  - Press **CHECK** with wrong sequence → amber prompt "Not quite", amber hint strip appears, border unchanged
  - Set correct sequence (T +1,+1 → Dil ×2) → press **CHECK** → chips turn green, prompt flips amber "Discovered", NEXT appears, RESET gone

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/modules/dilations/components/SequenceBuilder.tsx src/components/modules/dilations/__tests__/SequenceBuilder.test.tsx
  git commit -m "feat(dilations): chip rail SequenceBuilder — compact inline editor for Phase 3"
  ```

---

## Final Verification

- [ ] **Run full dilations test suite**
  ```bash
  pnpm vitest run src/components/modules/dilations
  ```
  Expected: all tests pass.

- [ ] **Production build**
  ```bash
  pnpm build
  ```
  Expected: clean build, no TypeScript errors.

- [ ] **Smoke-test all three phases**

  Run `pnpm dev` and verify:
  - Phase 1: drag ghost, snap feels fine at 0.25 units; "Good try" + trailing nudge copy on a distant drop
  - Phase 2: coordinates update live while dragging; formula strip hides rule during earned reveal amber moment
  - Phase 3: angle marks visible, camera shows reflections/rotations without clipping, chip rail works across all three similarity tasks
