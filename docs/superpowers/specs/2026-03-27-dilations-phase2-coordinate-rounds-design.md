# Dilations Phase 2 — Coordinate Rounds Design

**Date:** 2026-03-27
**Status:** Approved
**Scope:** 3 rounds — `coord-k2`, `coord-k-half`, `coord-k-third`
**Standards:** 8.G.A.3 (coordinate notation for dilations), ALD target L4

---

## Overview

Phase 2 introduces coordinate awareness to the dilation module. Students who mastered *where* dilations land (Phase 1) now discover *the numbers behind it*. The same predict-and-reveal loop is reused; the pedagogical shift is from spatial intuition to algebraic understanding.

By the end of Phase 2, students earn the general coordinate rule: **(x, y) → (kx, ky)**.

---

## Design Decisions

### Coordinate labels: vertex letters in scene, values in formula strip

Scene shows only vertex letters (A, B, C / A', B', C'). Full coordinate values appear in the formula strip as a table (`A(1,1) → A'(2,2)`). This eliminates label collision at all scale factors — particularly k=½ and k=⅓ where the image triangle sits inside or near the pre-image.

### Formula strip evolution

The formula strip becomes the "coordinate workspace" in Phase 2:

- **Before reveal:** Shows `k = N` (scale factor only, same as Phase 1)
- **After reveal:** Transitions to coordinate table + rule
- **coord-k-third:** Generalizes to `(x, y) → (kx, ky)` in amber (earned reveal color)

| Round | Before reveal | After reveal |
|---|---|---|
| coord-k2 | `k = 2` | `A(1,1)→A'(2,2)  B(4,2)→B'(8,4)  C(2,4)→C'(4,8)` + `(x,y)→(2x,2y)` |
| coord-k-half | `k = ½` | `A(1,1)→A'(0.5,0.5)  B(4,2)→B'(2,1)  C(2,4)→C'(1,2)` + `(x,y)→(½x,½y)` |
| coord-k-third | `k = ⅓` | `A(1,1)→A'(0.33,0.33)  B(4,2)→B'(1.33,0.67)  C(2,4)→C'(0.67,1.33)` + `(x,y)→(kx,ky)` in amber |

### Label reveal: simultaneous

All coordinate labels and vertex letters appear at the same time. No staggered animation. Student scans at their own pace.

### Rays: kept in Phase 2

Ray-from-origin dashed lines appear during reveal, same as Phase 1. They reinforce the geometric connection between pre-image and image vertices and visually explain *why* the coordinate rule works.

### Phase transition: no interstitial

No dedicated interstitial screen between Phase 1 and Phase 2. The coord-k2 entry prompt signals the shift, and coordinate labels appearing on the pre-image vertices for the first time *is* the transition moment.

### Interaction: same ghost drag

Reuses the imperative GhostTriangle from PR #51 (useRef + useFrame, zero re-renders during drag). No new interaction patterns.

---

## Round Details

### coord-k2 — "First coordinates"

- **Prompt:** "Now let's look at the coordinates. Where will A', B', and C' land when k = 2?"
- **Scale factor:** k = 2
- **What's new:** Coordinate labels appear on pre-image vertices for the first time (via `coordinatesVisible` context flag flipping to `true`). This is the phase transition moment.
- **Reveal shows:** Image triangle + rays + coordinate table in formula strip with `(x, y) → (2x, 2y)`
- **Earned reveal:** "Every coordinate multiplied by 2."

### coord-k-half — "Fractional coordinates"

- **Prompt:** "k = ½ again — but now predict the exact coordinates."
- **Scale factor:** k = 0.5
- **What's new:** Fractional coordinates (0.5, 0.5) appear in the table. Student connects spatial intuition from Phase 1 with numerical values.
- **Reveal shows:** Image + rays + coordinate table with fractions + `(x, y) → (½x, ½y)`
- **Earned reveal:** "Same rule — multiply by k — even for fractions."

### coord-k-third — "Generalize"

- **Prompt:** "k = ⅓. Can you predict the coordinates before checking?"
- **Scale factor:** k = 0.333
- **What's new:** Formula strip generalizes to `(x, y) → (kx, ky)` in amber. This is the L4 earned reveal — the general coordinate rule.
- **Reveal shows:** Image + rays + coordinate table + generalized rule in amber
- **Earned reveal:** "The pattern: multiply each coordinate by k. (x, y) → (kx, ky)"

---

## Component Architecture

### New files

- **`rounds/CoordinateRounds.tsx`** — Scene component for Phase 2. Reuses the `PredictionRoundScene` pattern from `ScaleFactorRounds.tsx`: PreImageTriangle + GhostTriangle + RevealAnimation + ImageTriangle + RayLines. Parameterized by scale factor. Exports `CoordinateScene` which switches on `currentRound`.

- **`components/CoordinateReadout.tsx`** — Formula strip component for Phase 2. Accepts `scaleFactor`, `preImage`, `image`, `roundState`, and `isGeneralized` props. Before reveal: renders `ScaleFactorDisplay` (k = N). After reveal: renders coordinate table (3 vertex mappings) + coordinate rule. When `isGeneralized` (coord-k-third): rule text in amber `--lab-earned` color.

### Modified files

- **`DilationsModule.tsx`** — Add routing for `phase === 'coordinate'` to render `CoordinateScene`. Wire `CoordinateReadout` into the `formulaReadout` slot when in coordinate phase.

- **`dilations-copy.ts`** — Add `ROUND_PROMPTS` entries for coord-k2, coord-k-half, coord-k-third. Add `EARNED_REVEALS` entries for all three rounds.

- **`PreImageTriangle.tsx`** — Add a `suppressInlineCoords` prop (default `false`). When `true`, the `effectiveShowCoords` block (lines 91–104) is skipped — vertex letters still render, but the `(x, y)` coordinate labels do not. `CoordinateRounds.tsx` passes `suppressInlineCoords={true}` because coordinate values live in the formula strip, not the scene. The existing `coordinatesVisible` context flag remains unchanged (it still gates Phase 2+ features generally).

- **`ImageTriangle.tsx`** — Same `suppressInlineCoords` prop, same behavior. Vertex letters (A', B', C') render; inline coordinate labels suppressed.

### Unchanged (reused as-is)

- `GhostTriangle.tsx` — imperative drag from PR #51
- `RevealAnimation.tsx` — fade-in animation
- `RayLines.tsx` — ray-from-origin dashed lines
- `useDilationsStage.ts` — state machine already handles coordinate rounds
- `DilationsScene.tsx` — canvas, grid, camera all ready
- `SpriteLabel.tsx` — renders vertex letters

---

## Scene Layout

### What's in the scene (completion state)

- Pre-image triangle with vertex letters (A, B, C)
- Image triangle with vertex letters (A', B', C')
- Ray-from-origin dashed lines through each vertex pair
- Coordinate grid + axis labels + origin marker
- Ghost triangle (during active/prediction states only)

### What's NOT in the scene

- No inline coordinate values (those are in the formula strip)
- No ratio annotations (Phase 1 only)
- No angle marks (Phase 4 only)

### Z-layer ordering (inherited from Phase 1)

Pre-image fill (0.02) → ghost (0.05) → image fill (0.07) → labels (0.08–0.09)

---

## State Machine

No changes to `useDilationsStage`. The coordinate rounds are already fully configured in `ROUND_CONFIGS` with `coordinatesVisible: true`, `hasGhostDrag: true`, and correct scale factors. The `coordinatesVisible` flag flips to `true` on entering coord-k2 via the existing one-way OR logic and never resets.

---

## Coordinate Formatting

All coordinate values in the formula strip are displayed as **rounded decimals to 2 decimal places**, not exact fractions. Examples:

- k=2: `A'(2, 2)`, `B'(8, 4)`, `C'(4, 8)` — clean integers
- k=0.5: `A'(0.5, 0.5)`, `B'(2, 1)`, `C'(1, 2)` — clean halves
- k=0.333: `A'(0.33, 0.33)`, `B'(1.33, 0.67)`, `C'(0.67, 1.33)` — rounded

Rationale: Exact rational arithmetic (⅓, 1⅓) would require a fraction library or manual formatting for display only. Rounded decimals are sufficient — students see the pattern `multiply by k` regardless of display precision. The coordinate rule `(x, y) → (⅓x, ⅓y)` uses the fraction symbol in the rule text, but vertex coordinate values are decimal.

Implementation: `(k * coord).toFixed(2).replace(/\.?0+$/, '')` — strips trailing zeros so `2.00` displays as `2` and `0.50` displays as `0.5`.

---

## Implementation Notes

- **CoordinateRounds.tsx** should duplicate the `PredictionRoundScene` pattern from `ScaleFactorRounds.tsx`, not import it. Per project convention: no premature sharing between phases until all are complete.
- **Phase progress LEDs** already work for Phase 2 — the existing `StatusStrip` reads from `ROUND_SEQUENCE` and `currentRound`, which includes the coordinate round IDs. No changes needed.
- **Screen reader announcements** for earned reveals already work via `useAccessibility`. The coordinate table in the formula strip is standard HTML in the `formulaReadout` slot — inherently accessible. No additional ARIA work needed.
- **Prediction tolerance** remains `PREDICTION_TOLERANCE = 0.75`. For k=⅓, the image centroid is at ~(0.78, 0.78). The ghost starts at the pre-image centroid (~2.33, 2.33), so the student must move it significantly toward the origin. 0.75 units of tolerance is adequate — the image is small but the required movement is large enough to demonstrate understanding.
- **Earned reveal copy split:** `text` field contains the prose, `notation` field contains the formula in data font. Example: `{ text: "The pattern: multiply each coordinate by k.", notation: "(x, y) → (kx, ky)", notationStyle: "rule" }`.

---

## What This Design Does NOT Include

- Phase transition interstitial infrastructure (deferred — may be needed for Phase 3)
- Staggered label animation (decided against — simultaneous reveal)
- Inline coordinate values on triangles (moved to formula strip)
- Summary scene label cleanup (deferred polish — tracked in memory)
- Any changes to Phase 1 behavior
