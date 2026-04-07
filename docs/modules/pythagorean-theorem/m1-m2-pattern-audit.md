# M1/M2 Pattern Audit — Reference for M3

Distilled from a full audit of Rigid Motions (M1) and Dilations (M2) after Phase 4 completion. Use this as the starting checklist when speccing the Pythagorean Theorem module.

---

## Carry Forward As-Is (Proven, No Changes)

- `ModuleLayout` slot contract: `statusStrip | prompt | formulaReadout | visualization | controls`
- `SpriteLabel` CanvasTexture pattern — **never drei `<Text>`** (exhausts WebGL context with StrictMode double-mount)
- `useReducer` + `startRound()` reset helper (M2 pattern preferred over M1's flat setState)
- One-way visibility flags via OR gate in `startRound()` — once true, never reverts in session
- Earned reveal system — record reveal key in `handleAdvance`, not `handleCheck` (avoids React batching hiding reveals)
- Copy in a dedicated `-copy.ts` file — no inline strings in components
- `useAccessibility` — announce assertive on match/discover, 80ms haptic, 44px touch targets
- GSAP + `useFrame` for reveal animation; instant snap for interaction-driven color/label changes
- Orthographic camera with frustum computed in `useFrame` (not `useEffect`)
- All geometry created in `useMemo`, disposed in `useEffect` cleanup; no inline `new THREE.X()` in JSX

---

## Values to Carry Forward (Defaults — Adjust If Needed)

| Constant | Value | Notes |
|----------|-------|-------|
| Prediction tolerance | `0.75` world units (centroid distance) | M2 loosened from M1's 0.5 |
| Snap resolution | `0.25` world units on drop | Fine enough for precision, coarse enough to feel responsive |
| Angle match tolerance | `±2°` | For any angle-comparison logic |
| Haptic duration | `80ms` | `navigator.vibrate?.(80)` |
| Ghost start position | Offset from pre-image toward Q4 | Requires diagonal sweep for prediction |
| Touch targets | `min-h-[44px] min-w-[44px]` | iOS minimum |
| Canvas touch | `touchAction: 'none'` | Eliminates 300ms scroll delay |

---

## Key Architectural Decision for M3 Spec

**Successess-required vs. one-per-round:**
- M1 uses `successesRequired` per guide state — student needs N correct answers before advancing
- M2 dropped this — one completion per round, simpler
- Pythagorean Theorem likely wants M2's simpler model, but decide this consciously before spec — depends on whether any concept needs repetition to lock in

---

## The Critical New Convention (Visual Specs First)

Before implementing any layout, camera, or container work, write a spec block covering:

- **Container fill** — how visualization expands across viewport sizes
- **Camera / world size** — orthographic frustum, world-unit range, center point
- **Grid / axis bounds** — what coordinates are visible at each breakpoint
- **Z-layer map** — which elements occupy which depth layers

M1 camera took 3 rounds to stabilize. M2 ghost triangle introduced a regression fixed in QA. Both traced to missing upfront visual constraints. This is now in `CLAUDE.md § Visual Specs Convention`.

---

## What Changed M1 → M2 (Already Proven Improvements)

| Area | M1 | M2 |
|------|----|----|
| State architecture | Flat `setState` | `useReducer` with explicit action types |
| Camera scaling | Fixed world frustum | Dynamic `worldSize` prop (16→20 on phase change) |
| Phase 4 animation | GSAP reveal | Static layout, instant color snap on interaction |
| Copy structure | Beat-indexed (`${guideState}-${beatIndex}`) | Round-indexed (`currentRound`) — simpler |
| Visibility propagation | Prop drilling | `DilationsSceneCtx` context |
| Angle matching | N/A | `computeMatchColors` — exports for unit testing |

---

## Reference Files

- M1 ARCHITECTURE: `src/components/modules/rigid-motions/ARCHITECTURE.md`
- M2 ARCHITECTURE: `src/components/modules/dilations/ARCHITECTURE.md`
- M2 copy pattern: `src/components/modules/dilations/dilations-copy.ts`
- M2 state machine: `src/components/modules/dilations/hooks/useDilationsStage.ts`
- Shared types: `src/lib/types/transforms.ts`
- Accessibility hook: `src/lib/skeleton/useAccessibility.ts`
