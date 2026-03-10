# Rigid Motions Polish & Layout Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three NOTES.md bugs (vertex label smearing, auto-match firing, label clutter), standardize status strips across both modules, and add a desktop sidebar layout to rigid-motions.

**Architecture:** Bug fixes are confined to `useRigidMotionsState.ts` (remove live auto-scoring) and scene components (remove SpriteLabel coordinate pairs). Layout changes restructure `InstrumentModule.tsx` (rigid-motions) using a responsive CSS grid with a right sidebar on desktop (≥768px). StatusStrip simplification is isolated to `sinewaves/components/StatusStrip.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, React Three Fiber (R3F), Vitest + @testing-library/react for hook tests.

---

## Task 1: Bug 2 — Remove live auto-scoring from useRigidMotionsState

**Files:**
- Modify: `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts:77-97`
- Create: `src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts`

The problem is in `useRigidMotionsState.ts` lines 77–97. A `useEffect` watches `ghostOffset`, `flipped`, `rotationDegrees`, `rotationDirection` and calls `scoreGuess`, which can set `feedbackState` to `'match'` without the user pressing CHECK. Remove this effect entirely — `feedbackState` must only be set inside `handleCheck` (already does this correctly) and `handleSequenceChange` / `handleCheckSequence`.

### Step 1: Write the failing test

Create `src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts`:

```ts
import { renderHook, act } from '@testing-library/react'
import { useRigidMotionsState } from '../hooks/useRigidMotionsState'

describe('useRigidMotionsState — match gating', () => {
  it('does not set feedbackState to match when ghost is moved to the correct position without pressing CHECK', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    // Move ghost to target position (translate round 0: target vertices require offset [3,1])
    // The exact offset doesn't matter — what matters is feedbackState never becomes 'match' from move alone
    act(() => {
      result.current.handleGhostMove([3, 1])
    })

    expect(result.current.feedbackState).toBe('idle')
  })

  it('does not update feedbackState from idle when ghost moves after no CHECK', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    act(() => {
      result.current.handleGhostMove([1, 2])
    })
    act(() => {
      result.current.handleGhostMove([3, 4])
    })

    expect(result.current.feedbackState).toBe('idle')
  })

  it('sets feedbackState only after handleCheck is called', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    // Before check: idle
    act(() => {
      result.current.handleGhostMove([0, 0])
    })
    expect(result.current.feedbackState).toBe('idle')

    // After check: non-idle (miss/close/match depending on position)
    act(() => {
      result.current.handleCheck()
    })
    expect(result.current.feedbackState).not.toBe('idle')
  })

  it('does not re-score after CHECK when ghost is moved again', () => {
    const { result } = renderHook(() => useRigidMotionsState())

    // Check once (will be miss/close at default offset)
    act(() => {
      result.current.handleCheck()
    })
    const stateAfterCheck = result.current.feedbackState

    // Move ghost — should NOT auto-update feedbackState
    act(() => {
      result.current.handleGhostMove([5, 5])
    })

    expect(result.current.feedbackState).toBe(stateAfterCheck)
  })
})
```

### Step 2: Run the test to confirm it fails

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts
```

Expected: Tests 1, 2, 4 FAIL (the live-scoring effect is still there)

### Step 3: Remove the live auto-scoring useEffect

In `src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts`, delete lines 77–97 (the `liveScoreParams` ref setup and the `useEffect`):

```ts
// DELETE these lines entirely (77–97):
//
//   const liveScoreParams = useRef({ ... })
//   liveScoreParams.current = { ... }
//
//   useEffect(() => {
//     const p = liveScoreParams.current
//     if (p.feedbackState === 'idle') return
//     ...
//     setFeedbackState(scoreGuess(...))
//   }, [ghostOffset, flipped, rotationDegrees, rotationDirection])
```

Also remove the now-unused `useRef` import if `useRef` is no longer used elsewhere in the file. Check: `useRef` is still used for `liveScoreParams` — after deletion, verify no other `useRef` calls remain. If none remain, remove from the import line:

```ts
// Before
import { useState, useCallback, useRef, useEffect } from 'react'
// After (if useRef is now unused)
import { useState, useCallback } from 'react'
```

### Step 4: Run the tests

```bash
pnpm vitest run src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts
```

Expected: All 4 tests PASS

### Step 5: Run full test suite to check for regressions

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: All existing tests PASS

### Step 6: Commit

```bash
git add src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts \
        src/components/modules/rigid-motions/__tests__/useRigidMotionsState.test.ts
git commit -m "fix: gate match evaluation behind CHECK only — remove live auto-scoring effect"
```

---

## Task 2: Bug 1 & 3 — Remove vertex coordinate labels from R3F scene

**Files:**
- Modify: `src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx`
- Modify: `src/components/modules/rigid-motions/scene/ImageShape.tsx`
- Modify: `src/components/modules/rigid-motions/scene/PreviewGhost.tsx`

There are 5 components that render `SpriteLabel` at vertices. The rule after this task:
- `PreImageTriangle` — keep single-letter labels (A, B, C), never show coordinate pairs
- `GhostTriangle` — remove all labels entirely
- `ImageShape` — remove all labels entirely
- `CapstoneTarget` — remove all labels entirely
- `PreviewGhost` — remove all labels entirely

The `coordinatesActive` prop is no longer used for label text in scene components (it still drives `showFormulaReadout` in `InstrumentModule.tsx` — do not remove it from the hook or InstrumentModule).

### Step 1: Fix PreImageTriangle in RigidMotionsScene.tsx

Find `PreImageTriangle` (around line 164). Change the `SpriteLabel` text and planeWidth — always show only the letter, never the coordinate pair:

```tsx
// Before:
<SpriteLabel
  key={VERTEX_LABELS[idx]}
  text={coordinatesActive ? `${VERTEX_LABELS[idx]}(${v[0]},${v[1]})` : VERTEX_LABELS[idx]}
  position={[lx, ly, 0.03]}
  color="#b8b0a4"
  anchorX="center"
  anchorY="middle"
  planeWidth={coordinatesActive ? 1.6 : 0.55}
/>

// After:
<SpriteLabel
  key={VERTEX_LABELS[idx]}
  text={VERTEX_LABELS[idx]}
  position={[lx, ly, 0.03]}
  color="#b8b0a4"
  anchorX="center"
  anchorY="middle"
  planeWidth={0.55}
/>
```

Also remove the unused `coordinatesActive` prop from `PreImageTriangle`'s props interface and function signature since it's no longer used here. (The prop was `{ coordinatesActive: boolean }`.)

### Step 2: Remove all SpriteLabel instances from GhostTriangle in RigidMotionsScene.tsx

Find `GhostTriangle` (around line 204). Delete the entire `{verts.map(...SpriteLabel...)}` block. Also remove the `coordinatesActive` prop from `GhostTriangleProps` and `GhostTriangle`'s function signature. Remove any `centroid` computation that was only used for label positioning — check if `centroid` is used elsewhere in `GhostTriangle`; if not, remove it.

After the change, `GhostTriangle` should look like:

```tsx
function GhostTriangle({
  ghostOffset,
  guideState,
  flipped,
  rotationDegrees,
  rotationDirection,
  reflectionAxis,
}: Omit<GhostTriangleProps, 'coordinatesActive'>) {
  const verts = useMemo<[number, number][]>(
    () => computeGhostVertices(ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis),
    [ghostOffset, guideState, flipped, rotationDegrees, rotationDirection, reflectionAxis]
  )
  const lineLoopRef = useRef<THREE.LineLoop>(null)

  const { outlineGeometry, shape } = useMemo(() => {
    const pts = [...verts, verts[0]].map(([x, y]) => new THREE.Vector3(x, y, 0.02))
    const geo = new THREE.BufferGeometry().setFromPoints(pts)
    return { outlineGeometry: geo, shape: makeTriangleShape(verts) }
  }, [verts])

  useFrame(() => {
    if (lineLoopRef.current) lineLoopRef.current.computeLineDistances()
  })

  return (
    <group>
      <mesh position={[0, 0, 0.01]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
      </mesh>
      <lineLoop ref={lineLoopRef} geometry={outlineGeometry}>
        <lineDashedMaterial color="#7cc87c" dashSize={0.3} gapSize={0.18} />
      </lineLoop>
    </group>
  )
}
```

Also update the `GhostTriangleProps` interface to remove `coordinatesActive`, and update the call site in `Visualization` to not pass `coordinatesActive`.

### Step 3: Remove all SpriteLabel instances from CapstoneTarget in RigidMotionsScene.tsx

Find `CapstoneTarget` (around line 342). Delete the `{vertices.map(...SpriteLabel...)}` block and the `centroid` computation. Remove `coordinatesActive` from `CapstoneTargetProps` and its function signature. Update the call site in `Visualization` to not pass `coordinatesActive`.

### Step 4: Remove all SpriteLabel instances from ImageShape.tsx

Open `src/components/modules/rigid-motions/scene/ImageShape.tsx`. Delete the `{vertices.map(...SpriteLabel...)}` block (lines 131–144). Remove the `centroid` useMemo (line 116) and the `SpriteLabel` import if it's now unused. Remove `coordinatesActive` from `ImageShapeProps` and function signature. Update the call site in `Visualization` (RigidMotionsScene.tsx) to not pass `coordinatesActive`.

After the change, the `return` in `ImageShape` should be:

```tsx
return (
  <group>
    <mesh ref={meshRef}>
      <meshBasicMaterial color="#7cc87c" transparent opacity={0.18} />
    </mesh>
    <lineLoop ref={outlineRef}>
      <lineBasicMaterial color="#7cc87c" />
    </lineLoop>
  </group>
)
```

### Step 5: Remove all SpriteLabel instances from PreviewGhost.tsx

Open `src/components/modules/rigid-motions/scene/PreviewGhost.tsx`. Delete the `{verts.map(...SpriteLabel...)}` block and the `centroid` computation. Remove `coordinatesActive` from `PreviewGhostProps` and function signature. Remove the unused `SpriteLabel`, `vertexLabelOffset`, `GHOST_VERTEX_LABELS` imports if no longer needed. Update the call site in `Visualization` to not pass `coordinatesActive`.

After the change, `PreviewGhost` return should be:

```tsx
return (
  <group>
    <mesh position={[0, 0, 0.01]}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial color="#7cc87c" transparent opacity={0.12} />
    </mesh>
    <lineLoop ref={lineLoopRef} geometry={outlineGeometry}>
      <lineDashedMaterial color="#7cc87c" dashSize={0.3} gapSize={0.18} />
    </lineLoop>
  </group>
)
```

### Step 6: Build check

```bash
pnpm build
```

Expected: No TypeScript errors. If there are unused import errors, remove the imports flagged.

### Step 7: Commit

```bash
git add src/components/modules/rigid-motions/scene/RigidMotionsScene.tsx \
        src/components/modules/rigid-motions/scene/ImageShape.tsx \
        src/components/modules/rigid-motions/scene/PreviewGhost.tsx
git commit -m "fix: remove vertex coordinate labels from R3F scene — keep only source triangle A/B/C"
```

---

## Task 3: Status strip — sinewaves

**Files:**
- Modify: `src/components/modules/sinewaves/components/StatusStrip.tsx`
- Modify: `src/components/modules/sinewaves/InstrumentModule.tsx`

Remove back chevron, ESC button, and SYS:NOM from StatusStrip. Add an invisible right spacer to keep LEDs centered. The floating EscapeHatch LAB button is the navigation affordance.

### Step 1: Rewrite StatusStrip

Replace `src/components/modules/sinewaves/components/StatusStrip.tsx` with:

```tsx
// src/components/modules/sinewaves/components/StatusStrip.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface StatusStripProps {
  currentStage: number
  totalStages: number
  onStageSelect?: (index: number) => void
  className?: string
}

const STAGE_LABELS = ['Watch', 'Amplitude', 'Frequency', 'Challenge', 'Free']

/**
 * Eurorack status strip — progress LEDs centered, title desktop-only.
 *
 * Desktop: SINEWAVES  ●●●○○  [spacer]
 * Mobile:             ●●●○○
 */
export const StatusStrip = forwardRef<HTMLDivElement, StatusStripProps>(
  function StatusStrip({ currentStage, totalStages, onStageSelect, className = '' }, ref) {
    const canNavigateToStage = (index: number) => {
      if (!onStageSelect) return false
      return index + 1 <= currentStage
    }

    return (
      <div ref={ref} className={cn('flex w-full items-center', className)}>
        {/* Left: title (desktop only) */}
        <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
          Sinewaves
        </span>

        {/* Center: progress LEDs */}
        <nav
          className="flex flex-1 items-center justify-center"
          aria-label={`Module progress: stage ${currentStage} of ${totalStages}`}
        >
          <ol className="flex items-center" role="list">
            {Array.from({ length: totalStages }, (_, i) => {
              const oneBased = i + 1
              const isCompleted = oneBased < currentStage
              const isCurrent = oneBased === currentStage
              const clickable = canNavigateToStage(i)
              const stageLabel = STAGE_LABELS[i] ?? 'Stage'
              const stageStatus = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'
              return (
                <li key={i}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && onStageSelect?.(i)}
                    className={cn(
                      'flex h-11 w-4 items-center justify-center transition-colors duration-150',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-(--lab-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--lab-bg)',
                      clickable ? 'cursor-pointer' : 'cursor-default',
                    )}
                    aria-label={`${stageLabel}, ${stageStatus}`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    <span
                      className={cn(
                        'h-[7px] w-[7px] rounded-full border transition-colors duration-150',
                        isCompleted && 'bg-(--lab-success) border-(--lab-led-completed-border)',
                        isCurrent && 'bg-(--lab-accent) border-(--lab-accent-muted)',
                        !isCompleted && !isCurrent && 'bg-(--lab-border) border-(--lab-led-upcoming-border)'
                      )}
                    />
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        {/* Right: invisible spacer matching title width (desktop only) */}
        <span
          className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
          aria-hidden
        >
          Sinewaves
        </span>
      </div>
    )
  }
)
```

### Step 2: Clean up sinewaves InstrumentModule

In `src/components/modules/sinewaves/InstrumentModule.tsx`:
- Remove `onBack` from the `InstrumentModuleProps` interface
- Remove `onBack` from the function signature destructuring
- Remove `onBack={onBack}` from the `<StatusStrip>` usage

```ts
// Before
interface InstrumentModuleProps {
  onComplete: (values: Record<string, number>) => void
  onBack?: () => void
}
export function InstrumentModule({ onComplete, onBack }: InstrumentModuleProps) {

// After
interface InstrumentModuleProps {
  onComplete: (values: Record<string, number>) => void
}
export function InstrumentModule({ onComplete }: InstrumentModuleProps) {
```

And in the StatusStrip usage, remove the `onBack` prop:
```tsx
// Before
<StatusStrip
  ref={statusStripRef}
  currentStage={GUIDE_STATE_TO_INDEX[guideState] + 1}
  totalStages={TOTAL_GUIDE_STATES}
  onBack={onBack}
  onStageSelect={handleStageSelect}
  className={booted ? '' : 'opacity-0'}
/>

// After
<StatusStrip
  ref={statusStripRef}
  currentStage={GUIDE_STATE_TO_INDEX[guideState] + 1}
  totalStages={TOTAL_GUIDE_STATES}
  onStageSelect={handleStageSelect}
  className={booted ? '' : 'opacity-0'}
/>
```

### Step 3: Build check

```bash
pnpm build
```

Expected: No TypeScript errors.

### Step 4: Commit

```bash
git add src/components/modules/sinewaves/components/StatusStrip.tsx \
        src/components/modules/sinewaves/InstrumentModule.tsx
git commit -m "refactor: remove back/ESC/SYS:NOM from sinewaves StatusStrip — center LEDs"
```

---

## Task 4: Status strip — rigid-motions

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

The rigid-motions status strip is inlined in `InstrumentModule.tsx` (lines 143–173). Refactor to: title desktop-only on the left, LEDs flex-centered, invisible spacer on the right.

### Step 1: Rewrite the status strip header

Find the `<header>` element (line 147). Replace with:

```tsx
{/* ── ROW 1: STATUS STRIP ─────────────────────────────── */}
{/* Left pad (pl-20) clears the floating EscapeHatch LAB button (~72px) on mobile */}
<header className="flex items-center border-b border-(--lab-border) pl-20 pr-5 md:pl-6 md:pr-6">
  {/* Left: title (desktop only) */}
  <span className="hidden shrink-0 lab-silk lab-display-font font-bold text-(--lab-text) md:block">
    Rigid Motions
  </span>

  {/* Center: progress LEDs */}
  {guideState !== 'capstone' ? (
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
                : 'bg-(--lab-border) border-(--lab-led-upcoming-border)',
          ].join(' ')}
        />
      ))}
    </div>
  ) : (
    <div className="flex-1" aria-hidden />
  )}

  {/* Right: invisible spacer matching title width (desktop only) */}
  <span
    className="hidden shrink-0 lab-silk lab-display-font font-bold md:block invisible"
    aria-hidden
  >
    Rigid Motions
  </span>
</header>
```

### Step 2: Build check

```bash
pnpm build
```

Expected: No TypeScript errors.

### Step 3: Commit

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "refactor: center LED dots in rigid-motions status strip, title desktop-only"
```

---

## Task 5: Desktop sidebar layout — rigid-motions

**Files:**
- Modify: `src/components/modules/rigid-motions/InstrumentModule.tsx`

Add a responsive sidebar layout. On mobile (default): unchanged 5-row vertical stack. On desktop (md+): 2-column grid — scene fills the left column, right sidebar contains prompt + formula + controls.

The approach: keep mobile rows as-is with `md:hidden`, add a desktop-only `<aside>` for the sidebar. Prompt and controls JSX are rendered twice (once in the mobile rows, once in the sidebar) — only the visible one matters at each breakpoint. The `promptRef` needs to target the visible element: use two refs (mobile + desktop) and animate both.

### Step 1: Add a second prompt ref for the desktop sidebar

In `InstrumentModule.tsx`, rename the existing `promptRef` to `promptRefMobile` and add `promptRefDesktop`:

```ts
// Before
const promptRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (promptRef.current) fadeInReadout(promptRef.current)
}, [promptText])

// After
const promptRefMobile = useRef<HTMLDivElement>(null)
const promptRefDesktop = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (promptRefMobile.current) fadeInReadout(promptRefMobile.current)
  if (promptRefDesktop.current) fadeInReadout(promptRefDesktop.current)
}, [promptText])
```

### Step 2: Rewrite the outer layout grid

Change the outer `<div>` className:

```tsx
// Before
<div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[2.5rem_auto_auto_1fr_auto]">

// After
<div className="grid h-dvh w-screen overflow-hidden bg-(--lab-bg) grid-rows-[2.5rem_auto_auto_1fr_auto] md:grid-rows-[2.5rem_1fr] md:grid-cols-[1fr_280px]">
```

### Step 3: Make the status strip span full width on desktop

Add `md:col-span-2` to the `<header>`:

```tsx
<header className="flex items-center border-b border-(--lab-border) pl-20 pr-5 md:pl-6 md:pr-6 md:col-span-2">
```

### Step 4: Hide mobile prompt and formula rows on desktop

Wrap the mobile prompt row (ROW 2) and mobile formula row (ROW 3) with `md:hidden`:

```tsx
{/* ── ROW 2: PROMPT (mobile only) ────────────────────── */}
{guideState !== 'capstone' ? (
  <div
    ref={promptRefMobile}
    className="border-b border-(--lab-border) bg-(--lab-surface) px-5 py-1.5 md:hidden md:px-6"
    role="status"
    aria-live="polite"
  >
    <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
      {promptLabel}
    </div>
    <p className={[
      'text-sm font-medium lab-display-font',
      firstMatch ? 'text-(--lab-earned)' : 'text-(--lab-text)',
    ].join(' ')}>
      {promptText}
    </p>
  </div>
) : <div aria-hidden className="md:hidden" />}

{/* ── ROW 3: FORMULA READOUT (mobile only, phases 3+) ─ */}
{showFormulaReadout && (
  <div className="md:hidden">
    <FormulaReadout
      round={currentRound}
      ghostVertices={liveGhostVertices}
      feedbackState={feedbackState}
    />
  </div>
)}
{!showFormulaReadout && <div aria-hidden className="md:hidden" />}
```

### Step 5: Let the scene fill the left column on desktop

The `<main>` element needs no `md:col-span` change — it naturally sits at col 1 row 2 in the 2-column grid. Just ensure it has no conflicting sizing:

```tsx
{/* ── ROW 4: VISUALIZATION ────────────────────────────── */}
<main className="relative min-h-0 min-w-0 overflow-hidden">
  {/* unchanged */}
</main>
```

### Step 6: Hide mobile control strip footer on desktop

```tsx
{/* ── ROW 5: CONTROL STRIP (mobile only) ─────────────── */}
<footer className="flex flex-col items-center border-t border-(--lab-border) px-5 py-2 md:hidden md:px-6 md:py-2.5">
  <ControlStrip
    {/* ...all props unchanged... */}
  />
</footer>
```

### Step 7: Add the desktop-only right sidebar

After the `</footer>`, add:

```tsx
{/* ── DESKTOP SIDEBAR (right column, rows 2) ─────────── */}
<aside className="hidden md:flex md:flex-col md:row-start-2 md:col-start-2 border-l border-(--lab-border) overflow-y-auto">
  {/* TODO: verify SequenceBuilder fits on short viewports (13" laptop ~768px tall).
      overflow-y-auto ensures the sidebar scrolls rather than silently clips content. */}

  {/* Prompt */}
  {guideState !== 'capstone' ? (
    <div
      ref={promptRefDesktop}
      className="border-b border-(--lab-border) bg-(--lab-surface) px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <div className="mb-0.5 lab-silk lab-display-font text-[8px] tracking-[0.2em] font-bold text-(--lab-text-muted)">
        {promptLabel}
      </div>
      <p className={[
        'text-sm font-medium lab-display-font',
        firstMatch ? 'text-(--lab-earned)' : 'text-(--lab-text)',
      ].join(' ')}>
        {promptText}
      </p>
    </div>
  ) : null}

  {/* Formula readout (phases 3+ only) */}
  {showFormulaReadout && (
    <FormulaReadout
      round={currentRound}
      ghostVertices={liveGhostVertices}
      feedbackState={feedbackState}
    />
  )}

  {/* Controls — fills remaining sidebar height */}
  <div className="flex flex-1 flex-col items-center justify-center border-t border-(--lab-border) px-4 py-3">
    <ControlStrip
      guideState={guideState}
      feedbackState={feedbackState}
      flipped={flipped}
      rotationDegrees={rotationDegrees}
      rotationDirection={rotationDirection}
      onCheck={handleCheck}
      onNext={handleNext}
      onReset={handleReset}
      onFlip={handleFlip}
      onRotation={handleRotation}
      capstoneSequence={capstoneSequence}
      onSequenceChange={handleSequenceChange}
      onCheckSequence={handleCheckSequence}
      onCapstoneNext={handleCapstoneNext}
    />
  </div>
</aside>
```

### Step 8: Build check

```bash
pnpm build
```

Expected: No TypeScript errors. Fix any unused variable warnings.

### Step 9: Run full test suite

```bash
pnpm vitest run src/components/modules/rigid-motions
```

Expected: All tests PASS

### Step 10: Commit

```bash
git add src/components/modules/rigid-motions/InstrumentModule.tsx
git commit -m "feat: add desktop sidebar layout to rigid-motions — scene left, controls right"
```

---

## Final Verification

After all tasks are complete:

```bash
pnpm build
pnpm vitest run src/components/modules/rigid-motions
```

Then manually verify in the browser (`pnpm dev`):

- [ ] Sinewaves status strip: no back chevron, no ESC, no SYS:NOM, LEDs centered
- [ ] Rigid-motions status strip: title desktop-only, LEDs centered
- [ ] Rigid-motions on mobile: unchanged vertical stack
- [ ] Rigid-motions on desktop (≥768px): scene fills left, sidebar on right
- [ ] Sequence builder (capstone) is visible and usable in sidebar on desktop
- [ ] Dragging ghost triangle produces no label smearing (no labels on ghost)
- [ ] Source triangle shows only A, B, C (no coordinate pairs)
- [ ] Pressing CHECK is the only action that changes feedbackState
- [ ] Moving ghost after no CHECK: feedbackState stays 'idle'
- [ ] Moving ghost after a CHECK: feedbackState stays at the checked result
- [ ] FormulaReadout still shows full coordinate mappings in sidebar on desktop
- [ ] All three transformation stages (translate, reflect, rotate) work correctly
- [ ] Capstone phase works correctly

```bash
git log --oneline -5
```
