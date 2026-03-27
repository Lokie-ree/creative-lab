## Status: Complete
> Implemented 2026-03-24. Merged as part of PR #47 (dilations prompts 1–4).

# Dilations Prompt 4: Scale Factor Exploration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement rounds `dilate-k2`, `dilate-k2-properties`, and `dilate-k3` — the first three rounds of Phase 1 (Scale Factor Exploration). Delivers all visual scaffolding (RayLines, RatioAnnotations, AngleMarks, ScaleFactorDisplay) and the round orchestration that wires them together into the stage machine.

**Architecture:** Five new components + two modified existing files. Round orchestration lives in `ScaleFactorRounds.tsx` (exports `ScaleFactorScene` for R3F canvas children + `ScaleFactorHUD` for HTML overlay). DilationsCanvas baseline pre-image triangle is removed and replaced by the richer Prompt 3 `PreImageTriangle`. DilationsModule adds phase-conditional rendering.

**Tech Stack:** React 19, TypeScript strict, React Three Fiber, Three.js, GSAP, Tailwind CSS

---

## Key Architectural Decisions

**Round orchestration split: ScaleFactorScene + ScaleFactorHUD.**
`ScaleFactorRounds.tsx` exports two components. `ScaleFactorScene` renders R3F content (inside Canvas) and `ScaleFactorHUD` renders HTML overlay (alongside DilationsHUD). Both receive `state` + `dispatch` as props.

**key={currentRound} for state isolation.**
DilationsModule passes `key={state.currentRound}` to `ScaleFactorScene`. This forces a remount on every round transition — local `usePredictReveal` state resets automatically without manual cleanup.

**dilate-k2-properties auto-progression.**
The properties round has no ghost drag. On mount, it auto-dispatches `SET_ROUND_STATE: 'active'` after 300ms, animations play (~1.2s), then dispatch `COMPLETE_ROUND`. User just observes and clicks Next.

**RayLines GSAP — M1 imperative pattern.**
`RayLines` follows `ImageShape.tsx` exactly: ray geometries in `useRef`, attached in `useEffect`, endpoint buffer attributes updated in `useFrame` from a GSAP-animated `tRef`. Do NOT use `<primitive object={new THREE.Line()}>` inline.

**RatioAnnotations + AngleMarks GSAP — useMemo objects + primitive.**
For `AngleMarks` (arc lines, not loops), use `useMemo`-built `THREE.Line` objects + `<primitive object={arcLine}>`. The `useMemo` prevents per-render recreation. For `RatioAnnotations`, use `SpriteLabel` with `useMemo` opacity ref + GSAP.

**Remove DilationsCanvas inline PreImageTriangle.**
The Prompt 2 baseline `PreImageTriangle` inside `DilationsCanvas.tsx` uses the `<primitive>` anti-pattern and lacks vertex labels. Remove it. `ScaleFactorScene` renders `PreImageTriangle` from `components/` as a Canvas child instead.

**`dilate-k2-properties` uses `scaleFactor: 2` from ROUND_CONFIGS.**
The config already has `scaleFactor: 2` for this round. `ScaleFactorScene` reads `config.scaleFactor` to know the image triangle vertices.

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `src/components/modules/dilations/components/ScaleFactorDisplay.tsx` | **Create** | HTML "k = N" display for HUD |
| `src/components/modules/dilations/components/RayLines.tsx` | **Create** | R3F GSAP dashed rays from origin |
| `src/components/modules/dilations/components/RatioAnnotations.tsx` | **Create** | R3F side-ratio SpriteLabels with GSAP fade |
| `src/components/modules/dilations/components/AngleMarks.tsx` | **Create** | R3F arc marks at vertices with GSAP fade |
| `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx` | **Create** | Round orchestration: ScaleFactorScene + ScaleFactorHUD |
| `src/components/modules/dilations/DilationsCanvas.tsx` | **Modify** | Remove inline PreImageTriangle baseline |
| `src/components/modules/dilations/DilationsModule.tsx` | **Modify** | Add phase routing, render ScaleFactorScene + ScaleFactorHUD |

**Existing files consumed (read-only):**
- `src/components/modules/dilations/utils/types.ts` — Vec2, Triangle, RoundId
- `src/components/modules/dilations/utils/constants.ts` — CANONICAL_TRIANGLE, ROUND_CONFIGS, PREDICTION_TOLERANCE
- `src/components/modules/dilations/utils/math.ts` — dilateTriangle, sideLength, triangleSideLengths
- `src/components/modules/dilations/hooks/useDilationsStage.ts` — StageState, StageAction
- `src/components/modules/dilations/hooks/usePredictReveal.ts` — usePredictReveal
- `src/components/modules/dilations/components/PreImageTriangle.tsx` — PreImageTriangle (import, render inside Canvas)
- `src/components/modules/dilations/components/ImageTriangle.tsx` — ImageTriangle
- `src/components/modules/dilations/components/GhostTriangle.tsx` — GhostTriangle
- `src/components/modules/dilations/components/RevealAnimation.tsx` — RevealAnimation
- `src/components/modules/dilations/components/SpriteLabel.tsx` — SpriteLabel (used by RatioAnnotations)
- `src/components/modules/rigid-motions/scene/ImageShape.tsx` — authoritative GSAP+imperative pattern (read, do not import from)

---

## Task 1: ScaleFactorDisplay

**Files:**
- Create: `src/components/modules/dilations/components/ScaleFactorDisplay.tsx`

No unit tests. TypeScript check only.

Simple HTML component. No R3F. Rendered as an absolute-positioned overlay in the canvas area by `ScaleFactorHUD`.

```typescript
// src/components/modules/dilations/components/ScaleFactorDisplay.tsx

export interface ScaleFactorDisplayProps {
  k: number
}

export function ScaleFactorDisplay({ k }: ScaleFactorDisplayProps) {
  // Format: integers as "2", fractions as "½" or "⅓"
  const label =
    k === 0.5   ? '½' :
    k === 0.333 ? '⅓' :
    String(k)

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="lab-silk lab-display-font text-[9px] text-(--lab-text-muted)">
        SCALE FACTOR
      </span>
      <span className="lab-data-font text-2xl font-semibold text-(--lab-accent) leading-none">
        k = {label}
      </span>
    </div>
  )
}
```

- [x] **Step 1: Create `ScaleFactorDisplay.tsx`**

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -20
```

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/ScaleFactorDisplay.tsx
git commit -m "feat(dilations): add ScaleFactorDisplay — k value HUD overlay"
```

---

## Task 2: RayLines

**Files:**
- Create: `src/components/modules/dilations/components/RayLines.tsx`

No unit tests (R3F + GSAP). TypeScript check only.

Three dashed lines from origin through pre-image vertices, extending to image vertices. When `animating=true`, GSAP draws lines from origin outward (0.5s, power2.out). When `visible && !animating`, lines are at full length.

**Pattern:** M1's `ImageShape.tsx` — geometry in `useRef`, attached in `useEffect`, endpoint updated in `useFrame` from GSAP-animated `tRef`. Do NOT use `<primitive object={new THREE.Line()}>` inline.

**Note on `<line>` collision:** `<line>` in R3F JSX resolves to `SVGLineElement` (DOM type conflict). Use `<primitive object={rayLineObj}>` where `rayLineObj` is `useMemo`-built `THREE.Line`. Since objects are created once in `useMemo`, this is safe (no per-render GPU allocation).

```typescript
// src/components/modules/dilations/components/RayLines.tsx
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle } from '../utils/types'

const RAY_COLOR = '#3e3a34'  // subtle, darker than ghost
const ORIGIN = { x: 0, y: 0 }

export interface RayLinesProps {
  preImage: Triangle
  image: Triangle
  visible: boolean
  animating: boolean   // true during reveal, false during completion (full length, static)
}

export function RayLines({ preImage: _preImage, image, visible, animating }: RayLinesProps) {
  // ALL hooks first — Rules of Hooks: no early returns before hook calls
  const { a: ia, b: ib, c: ic } = image
  const endpoints = [ia, ib, ic] as const

  // rayGeos holds the THREE.BufferGeometry refs (empty initially, filled in useEffect)
  const rayGeos = useRef([
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
    new THREE.BufferGeometry(),
  ])
  const tRef = useRef({ t: animating ? 0 : 1 })

  // Create THREE.Line objects pointing to the rayGeos refs — no orphaned geometry
  // (rayGeos are the same objects used in useEffect, so geometry assignment is automatic)
  const rayLines = useMemo(() =>
    rayGeos.current.map(geo =>
      new THREE.Line(
        geo,
        new THREE.LineDashedMaterial({ color: RAY_COLOR, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.6 })
      )
    ),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [])

  // Build ray geometries on mount — 2 pts each (origin → endpoint)
  useEffect(() => {
    endpoints.forEach((ep, i) => {
      const pts = [
        new THREE.Vector3(ORIGIN.x, ORIGIN.y, 0),
        new THREE.Vector3(
          ORIGIN.x + (ep.x - ORIGIN.x) * tRef.current.t,
          ORIGIN.y + (ep.y - ORIGIN.y) * tRef.current.t,
          0,
        ),
      ]
      rayGeos.current[i].setFromPoints(pts)
      // computeLineDistances required for LineDashedMaterial to render dashes
      rayLines[i].computeLineDistances()
    })

    return () => {
      rayLines.forEach(l => {
        l.geometry.dispose()
        ;(l.material as THREE.LineDashedMaterial).dispose()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // GSAP animation — runs when animating changes
  useEffect(() => {
    if (!animating) {
      tRef.current.t = 1
      return
    }
    tRef.current.t = 0
    const tween = gsap.to(tRef.current, { t: 1, duration: 0.5, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [animating])

  // useFrame — update ray endpoints from tRef + recompute line distances for dashes
  useFrame(() => {
    const t = tRef.current.t
    endpoints.forEach((ep, i) => {
      const geo = rayGeos.current[i]
      const attr = geo.attributes.position as THREE.BufferAttribute
      if (!attr) return
      attr.setXYZ(1,
        ORIGIN.x + (ep.x - ORIGIN.x) * t,
        ORIGIN.y + (ep.y - ORIGIN.y) * t,
        0,
      )
      attr.needsUpdate = true
      rayLines[i].computeLineDistances()  // required every frame for dashed lines
    })
  })

  // Early return AFTER all hooks
  if (!visible) return null

  return (
    <group>
      {rayLines.map((lineObj, i) => (
        <primitive
          key={i}
          object={lineObj}
          position={[0, 0, 0.015]}
        />
      ))}
    </group>
  )
}
```

**Implementer notes:**
- `_preImage` is accepted but unused (rays go from origin to image vertices, not pre-image). Underscore prefix signals "accepted, not yet used" to avoid TypeScript `noUnusedParameters` error.
- `computeLineDistances()` must be called after every geometry update and once after initial setup — `LineDashedMaterial` won't render dashes without it.
- `rayLines` is created with references to `rayGeos.current` so no orphaned geometries exist.

- [x] **Step 1: Read `src/components/modules/rigid-motions/scene/ImageShape.tsx`** (reference for GSAP+imperative pattern)

- [x] **Step 2: Implement `RayLines.tsx`** (code above, adjust as needed for TypeScript)

- [x] **Step 3: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 4: Commit**

```bash
git add src/components/modules/dilations/components/RayLines.tsx
git commit -m "feat(dilations): add RayLines — GSAP animated dashed rays from origin"
```

---

## Task 3: RatioAnnotations

**Files:**
- Create: `src/components/modules/dilations/components/RatioAnnotations.tsx`

No unit tests. TypeScript check only.

Three SpriteLabel pairs showing side ratios (e.g. "2:1") at the midpoints of each side pair. Each side pair uses a distinct color. GSAP fades labels in when `animating=true`.

**Side midpoints:** midpoint of each pre-image side (not image side) — positioned between the two corresponding sides visually.

**Three side colors:**
- Side AB: `#f5a623` (amber — learning color)
- Side BC: `#7cc87c` (accent green)
- Side CA: `#8a847a` (text-muted)

```typescript
// src/components/modules/dilations/components/RatioAnnotations.tsx
import { useState, useEffect, useMemo } from 'react'
import type { Triangle } from '../utils/types'
import { SpriteLabel } from './SpriteLabel'

const SIDE_COLORS = ['#f5a623', '#7cc87c', '#8a847a'] as const

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

export interface RatioAnnotationsProps {
  preImage: Triangle
  ratio: number       // e.g. 2 for "2:1", 0.5 for "1:2"
  visible: boolean
  animating: boolean  // if true, delay reveal 500ms; if false, show immediately
}

export function RatioAnnotations({ preImage, ratio, visible, animating }: RatioAnnotationsProps) {
  // SpriteLabel has no opacity prop — gate visibility with state + setTimeout
  const [show, setShow] = useState(!animating)

  useEffect(() => {
    if (!visible) { setShow(false); return }
    if (!animating) { setShow(true); return }
    setShow(false)
    const timer = setTimeout(() => setShow(true), 500)  // 0.5s delay after rays settle
    return () => clearTimeout(timer)
  }, [visible, animating])

  const { a, b, c } = preImage
  const sides = useMemo(() => [
    { from: a, to: b, color: SIDE_COLORS[0] },
    { from: b, to: c, color: SIDE_COLORS[1] },
    { from: c, to: a, color: SIDE_COLORS[2] },
  ], [a, b, c])

  // Format ratio label: "2:1" for k=2, "1:2" for k=0.5, "3:1" for k=3
  const ratioLabel =
    ratio >= 1
      ? `${Math.round(ratio)}:1`
      : `1:${Math.round(1 / ratio)}`

  const cx = (a.x + b.x + c.x) / 3
  const cy = (a.y + b.y + c.y) / 3

  if (!visible) return null

  return (
    <>
      {sides.map((side, i) => {
        const mid = midpoint(side.from, side.to)
        // Offset label slightly outward from centroid to avoid overlapping triangle
        const dx = mid.x - cx
        const dy = mid.y - cy
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const labelPos = { x: mid.x + (dx / len) * 0.7, y: mid.y + (dy / len) * 0.7 }

        return (
          <SpriteLabel
            key={i}
            text={ratioLabel}
            position={labelPos}
            zLayer={0.12}
            color={side.color}
            visible={show}
            planeWidth={0.9}
          />
        )
      })}
    </>
  )
}
```

- [x] **Step 1: Implement `RatioAnnotations.tsx`**

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/RatioAnnotations.tsx
git commit -m "feat(dilations): add RatioAnnotations — color-coded side ratio SpriteLabels"
```

---

## Task 4: AngleMarks

**Files:**
- Create: `src/components/modules/dilations/components/AngleMarks.tsx`

No unit tests. TypeScript check only.

Small arc geometry marks at each vertex of each triangle. Visually shows angle preservation. When `animating=true`, fade in with GSAP.

**Arc math:** At vertex V, two sides go to adjacent vertices A and B. Compute atan2 angles of (A-V) and (B-V), then draw N=16 points along the arc at radius R=0.25, from angle1 to angle2, sorted to take the interior (smaller) arc.

**GPU pattern:** One `THREE.Line` per vertex per triangle = 6 total. All built in `useMemo`, passed to `<primitive>`. GSAP fades material opacity.

```typescript
// src/components/modules/dilations/components/AngleMarks.tsx
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import type { Triangle } from '../utils/types'

const ARC_RADIUS = 0.28
const ARC_SEGMENTS = 16
const MARK_COLOR = '#7a746a'  // lab ghost color

function buildArcGeo(vertex: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }): THREE.BufferGeometry {
  const angle1 = Math.atan2(a.y - vertex.y, a.x - vertex.x)
  const angle2 = Math.atan2(b.y - vertex.y, b.x - vertex.x)
  // Normalize to [0, 2π] and take the shorter arc
  let start = angle1
  let end = angle2
  let diff = end - start
  // Normalize diff to (-π, π]
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  end = start + diff

  const pts: THREE.Vector3[] = []
  for (let j = 0; j <= ARC_SEGMENTS; j++) {
    const t = j / ARC_SEGMENTS
    const angle = start + diff * t
    pts.push(new THREE.Vector3(
      vertex.x + Math.cos(angle) * ARC_RADIUS,
      vertex.y + Math.sin(angle) * ARC_RADIUS,
      0,
    ))
  }
  return new THREE.BufferGeometry().setFromPoints(pts)
}

export interface AngleMarksProps {
  triangles: Triangle[]
  visible: boolean
  animating: boolean
}

export function AngleMarks({ triangles, visible, animating }: AngleMarksProps) {
  const opacityRef = useRef({ v: animating ? 0 : 1 })

  // Build all arc line objects in useMemo — not recreated per render
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
          color: MARK_COLOR,
          transparent: true,
          opacity: opacityRef.current.v,
        })
        lines.push(new THREE.Line(geo, mat))
      }
    }
    return lines
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triangles])

  // GSAP fade-in
  useEffect(() => {
    if (!visible) return
    if (!animating) {
      opacityRef.current.v = 1
      return
    }
    opacityRef.current.v = 0
    const tween = gsap.to(opacityRef.current, {
      v: 1,
      duration: 0.5,
      ease: 'power2.out',
      delay: 0.3,
    })
    return () => { tween.kill() }
  }, [visible, animating])

  // useFrame — write opacity to materials
  useFrame(() => {
    const v = opacityRef.current.v
    markLines.forEach(line => {
      (line.material as THREE.LineBasicMaterial).opacity = v
    })
  })

  // Dispose previous set when markLines rebuilds (triangles changed) or on unmount
  useEffect(() => {
    return () => {
      markLines.forEach(line => {
        line.geometry.dispose()
        ;(line.material as THREE.LineBasicMaterial).dispose()
      })
    }
  }, [markLines])

  if (!visible) return null

  return (
    <group>
      {markLines.map((lineObj, i) => (
        <primitive
          key={i}
          object={lineObj}
          position={[0, 0, 0.07]}
        />
      ))}
    </group>
  )
}
```

**Implementer notes:**
- `triangles` is an array, could be 1 or 2 triangles (pre-image only, or pre-image + image)
- `computeLineDistances()` is NOT needed for `LineBasicMaterial` (only for `LineDashedMaterial`)
- Opacity is driven via `markLines` array in `useFrame` — no refs needed

- [x] **Step 1: Implement `AngleMarks.tsx`**

- [x] **Step 2: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 3: Commit**

```bash
git add src/components/modules/dilations/components/AngleMarks.tsx
git commit -m "feat(dilations): add AngleMarks — arc geometry vertex marks with GSAP fade"
```

---

## Task 5: ScaleFactorRounds

**Files:**
- Create: `src/components/modules/dilations/rounds/ScaleFactorRounds.tsx`

No unit tests (R3F + orchestration). TypeScript check only.

Exports two components:
1. `ScaleFactorScene` — R3F content rendered as `DilationsCanvas` children
2. `ScaleFactorHUD` — HTML overlay rendered alongside `DilationsHUD`

### ScaleFactorHUD

Simple: shows `ScaleFactorDisplay` when the round has a scale factor, positioned top-left.

```typescript
export function ScaleFactorHUD({ state }: { state: StageState }) {
  const config = ROUND_CONFIGS[state.currentRound]
  if (config.scaleFactor == null) return null

  return (
    <div className="absolute top-12 left-3 pointer-events-none">
      <ScaleFactorDisplay k={config.scaleFactor} />
    </div>
  )
}
```

### ScaleFactorScene

Handles three rounds: `dilate-k2`, `dilate-k2-properties`, `dilate-k3`.

**For `dilate-k2` and `dilate-k3` (prediction rounds):**
- Uses `usePredictReveal` to track ghost state
- `roundState === 'entry'` or `'active'`: PreImageTriangle + GhostTriangle (enabled)
- `roundState === 'prediction'`: PreImageTriangle + GhostTriangle (enabled, repositionable)
- `roundState === 'reveal'`: PreImageTriangle + GhostTriangle (disabled) + RevealAnimation (showRays=true)
- `roundState === 'completion'`: PreImageTriangle + ImageTriangle + RayLines (static)
- Ghost drop → dispatch `COMMIT_PREDICTION` (transitions to prediction)
- RevealAnimation.onComplete → dispatch `COMPLETE_ROUND` (transitions to completion)

**For `dilate-k2-properties` (observation round):**
- On mount: `useEffect` dispatches `SET_ROUND_STATE: 'active'` after 300ms
- When active: PreImageTriangle + ImageTriangle(k=2) + RatioAnnotations(animating) + AngleMarks(animating)
- When annotations complete (~1.2s): dispatch `COMPLETE_ROUND`
- `roundState === 'completion'`: all above static + Next button in HUD

```typescript
// src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
import { useCallback, useEffect, useMemo } from 'react'
import type { StageState, StageAction } from '../hooks/useDilationsStage'
import { usePredictReveal } from '../hooks/usePredictReveal'
import { PreImageTriangle } from '../components/PreImageTriangle'
import { ImageTriangle } from '../components/ImageTriangle'
import { GhostTriangle } from '../components/GhostTriangle'
import { RevealAnimation } from '../components/RevealAnimation'
import { RayLines } from '../components/RayLines'
import { RatioAnnotations } from '../components/RatioAnnotations'
import { AngleMarks } from '../components/AngleMarks'
import { ScaleFactorDisplay } from '../components/ScaleFactorDisplay'
import { CANONICAL_TRIANGLE, ROUND_CONFIGS, PREDICTION_TOLERANCE } from '../utils/constants'
import { dilateTriangle } from '../utils/math'
import type { Vec2 } from '../utils/types'

// ─── ScaleFactorHUD ──────────────────────────────────────────────────────────

export function ScaleFactorHUD({ state }: { state: StageState }) {
  const config = ROUND_CONFIGS[state.currentRound]
  if (config.scaleFactor == null) return null

  return (
    <div className="absolute top-12 left-3 pointer-events-none">
      <ScaleFactorDisplay k={config.scaleFactor} />
    </div>
  )
}

// ─── PredictionRoundScene (dilate-k2, dilate-k3) ─────────────────────────────

function PredictionRoundScene({
  scale,
  roundState,
  dispatch,
}: {
  scale: number
  roundState: string
  dispatch: React.Dispatch<StageAction>
}) {
  const targetTriangle = useMemo(
    () => dilateTriangle(CANONICAL_TRIANGLE, scale),
    [scale]
  )

  // accuracy from usePredictReveal is intentionally unused here —
  // accuracy feedback (exact/close/miss) is deferred to a future prompt.
  const { placeGhost, commitPrediction } = usePredictReveal(targetTriangle, PREDICTION_TOLERANCE)

  const handleGhostDrop = useCallback((pos: Vec2) => {
    placeGhost(pos)
    commitPrediction()
    dispatch({ type: 'COMMIT_PREDICTION' })
  }, [placeGhost, commitPrediction, dispatch])

  const handleRevealComplete = useCallback(() => {
    dispatch({ type: 'COMPLETE_ROUND' })
  }, [dispatch])

  // Ghost: visible in all states except completion; disabled only during reveal
  const showGhost = roundState !== 'completion'
  const ghostDisabled = roundState === 'reveal'
  const showReveal = roundState === 'reveal'
  const showImage = roundState === 'completion'
  const showRays = roundState === 'completion'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      {showGhost && (
        <GhostTriangle
          vertices={CANONICAL_TRIANGLE}
          scale={scale}
          onDrop={handleGhostDrop}
          disabled={ghostDisabled}
        />
      )}
      {showReveal && (
        <RevealAnimation
          targetTriangle={targetTriangle}
          onComplete={handleRevealComplete}
          showRays={true}
          rayOrigin={{ x: 0, y: 0 }}
        />
      )}
      {showImage && (
        <ImageTriangle vertices={targetTriangle} visible={true} />
      )}
      {showRays && (
        <RayLines
          preImage={CANONICAL_TRIANGLE}
          image={targetTriangle}
          visible={true}
          animating={false}
        />
      )}
    </>
  )
}

// ─── PropertiesRoundScene (dilate-k2-properties) ──────────────────────────────

function PropertiesRoundScene({
  roundState,
  dispatch,
}: {
  roundState: string
  dispatch: React.Dispatch<StageAction>
}) {
  const imageTriangle = useMemo(
    () => dilateTriangle(CANONICAL_TRIANGLE, 2),
    []
  )
  // Memoize to prevent new array reference per render (would invalidate AngleMarks useMemo)
  const triangles = useMemo(
    () => [CANONICAL_TRIANGLE, imageTriangle] as const,
    [imageTriangle]
  )

  // Auto-progress: entry → active after short delay
  useEffect(() => {
    if (roundState !== 'entry') return
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_ROUND_STATE', state: 'active' })
    }, 300)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  // Auto-complete: active → completion after annotations animate in (~1.4s total)
  useEffect(() => {
    if (roundState !== 'active') return
    const timer = setTimeout(() => {
      dispatch({ type: 'COMPLETE_ROUND' })
    }, 1400)
    return () => clearTimeout(timer)
  }, [roundState, dispatch])

  const showAnnotations = roundState === 'active' || roundState === 'completion'
  const animating = roundState === 'active'

  return (
    <>
      <PreImageTriangle vertices={CANONICAL_TRIANGLE} />
      <ImageTriangle vertices={imageTriangle} visible={true} />
      {showAnnotations && (
        <>
          <RayLines
            preImage={CANONICAL_TRIANGLE}
            image={imageTriangle}
            visible={true}
            animating={false}
          />
          <RatioAnnotations
            preImage={CANONICAL_TRIANGLE}
            ratio={2}
            visible={true}
            animating={animating}
          />
          <AngleMarks
            triangles={triangles}
            visible={true}
            animating={animating}
          />
        </>
      )}
    </>
  )
}

// ─── ScaleFactorScene ─────────────────────────────────────────────────────────

export function ScaleFactorScene({
  state,
  dispatch,
}: {
  state: StageState
  dispatch: React.Dispatch<StageAction>
}) {
  const { currentRound, roundState } = state
  const config = ROUND_CONFIGS[currentRound]

  if (currentRound === 'dilate-k2-properties') {
    return <PropertiesRoundScene roundState={roundState} dispatch={dispatch} />
  }

  // Prediction rounds: dilate-k2, dilate-k3
  const scale = config.scaleFactor ?? 2
  return (
    <PredictionRoundScene
      scale={scale}
      roundState={roundState}
      dispatch={dispatch}
    />
  )
}
```

- [x] **Step 1: Create `src/components/modules/dilations/rounds/` directory structure** (create the file — the directory is created automatically)

- [x] **Step 2: Implement `ScaleFactorRounds.tsx`** (code above, use simplified ghost visibility logic)

- [x] **Step 3: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 4: Commit**

```bash
git add src/components/modules/dilations/rounds/ScaleFactorRounds.tsx
git commit -m "feat(dilations): add ScaleFactorRounds — dilate-k2/k2-properties/k3 orchestration"
```

---

## Task 6: Wire DilationsCanvas + DilationsModule

**Files modified:**
- `src/components/modules/dilations/DilationsCanvas.tsx`
- `src/components/modules/dilations/DilationsModule.tsx`

### DilationsCanvas changes

Remove the inline `PreImageTriangle` function and its `<PreImageTriangle />` render. It uses the `<primitive>` anti-pattern and lacks labels. The rich `PreImageTriangle` from `components/` is now rendered as a Canvas child by the round components.

Keep everything else: `CameraSetup`, `CoordinateGrid`, `children` pass-through.

```typescript
// DilationsCanvas.tsx — remove the inline PreImageTriangle entirely
// Before:
//   function PreImageTriangle() { ... }  ← DELETE THIS WHOLE FUNCTION
// In the Canvas JSX:
//   <PreImageTriangle />  ← DELETE THIS LINE
// Children are already passed through: {children}
```

The diff is purely subtractive — remove the function and the `<PreImageTriangle />` call. Nothing else changes.

### DilationsModule changes

Add phase-conditional rendering of `ScaleFactorScene` (as Canvas children) and `ScaleFactorHUD` (as HTML overlay sibling).

```typescript
// src/components/modules/dilations/DilationsModule.tsx
import type { ModuleProps } from '@/config/modules'
import { useDilationsStage } from './hooks/useDilationsStage'
import { DilationsCanvas } from './DilationsCanvas'
import { DilationsHUD } from './DilationsHUD'
import { ScaleFactorScene, ScaleFactorHUD } from './rounds/ScaleFactorRounds'

export default function DilationsModule({ onBack }: ModuleProps) {
  const { state, dispatch } = useDilationsStage()
  const { phase, currentRound } = state

  const isScaleFactorPhase = phase === 'scale-factor'

  return (
    <div className="flex h-dvh flex-col bg-(--lab-bg)">
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

      <div className="relative flex-1 min-h-0">
        <DilationsCanvas
          coordinatesVisible={state.coordinatesVisible}
          angleLabelsVisible={state.angleLabelsVisible}
        >
          {/* key=currentRound forces remount on round change, resetting local hook state */}
          {isScaleFactorPhase && (
            <ScaleFactorScene
              key={currentRound}
              state={state}
              dispatch={dispatch}
            />
          )}
        </DilationsCanvas>

        <DilationsHUD state={state} dispatch={dispatch} />

        {isScaleFactorPhase && (
          <ScaleFactorHUD state={state} />
        )}
      </div>
    </div>
  )
}
```

- [x] **Step 1: Read current `DilationsCanvas.tsx`** and remove the inline `PreImageTriangle` function + its render call

- [x] **Step 2: Rewrite `DilationsModule.tsx`** per the spec above

- [x] **Step 3: TypeScript check**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm exec tsc --noEmit --project tsconfig.app.json 2>&1 | head -30
```

- [x] **Step 4: Commit**

```bash
git add src/components/modules/dilations/DilationsCanvas.tsx \
        src/components/modules/dilations/DilationsModule.tsx
git commit -m "feat(dilations): wire ScaleFactorRounds into module — remove canvas baseline triangle"
```

---

## Task 7: Verification

**Full build + tests.**

- [x] **Step 1: Run all dilations tests**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm vitest run src/components/modules/dilations 2>&1 | tail -20
```

Expected: All tests pass (65+ from Prompts 1–3; no new tests in Prompt 4).

- [x] **Step 2: Run full production build**

```bash
cd "C:\Users\rplap\OneDrive\Desktop\personal\creative-lab" && pnpm build 2>&1 | tail -30
```

Expected: `tsc -b` + Vite build succeed with zero errors.

- [x] **Step 3: Final commit if any fixes applied**

If TypeScript errors were found and fixed in Steps 1–2, commit them now:

```bash
git add -p
git commit -m "fix(dilations): prompt4 build fixes"
```

---

## Architectural Notes for Reviewers

**Ghost visibility during prediction state:**
When `roundState === 'prediction'`, the ghost should remain visible and repositionable (student can change their mind before clicking REVEAL). Only `ghostDisabled=true` (not removed) during `reveal` so the ghost visually persists beneath the reveal animation. Removed entirely during `completion`.

**Scene state reset between rounds:**
`key={currentRound}` on `ScaleFactorScene` ensures `usePredictReveal` state resets on every round transition. This is simpler and more reliable than manual `reset()` calls.

**dilate-k2 → dilate-k2-properties continuity:**
The spec says "Both triangles from previous round persist." This is handled by `PropertiesRoundScene` always rendering `ImageTriangle` at k=2. The `key` prop change causes a fresh mount, but `PropertiesRoundScene` immediately shows both triangles from the start — no visual discontinuity (they appear instantly, same positions).

**dilate-k2-properties timing:**
- 300ms: `entry` → `active` (annotations start animating in)
- 300ms + 1100ms = 1400ms: `active` → `completion` (annotations settled, Next button appears)
- Total duration before Next is available: ~1.4s

**RatioAnnotations label format:**
- k=2: "2:1", k=3: "3:1", k=0.5: "1:2", k=0.333: "1:3"
- Formula: `ratio >= 1 ? "${Math.round(ratio)}:1" : "1:${Math.round(1/ratio)}"`
