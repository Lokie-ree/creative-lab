# Pythagorean Theorem Module — Product Requirements Document

**Module:** M3 (third in Grade 8 Geometry arc)
**Standards:** 8.G.B.6, 8.G.B.7, 8.G.B.8
**Date:** April 12, 2026
**Status:** Draft

---

## 1. Learning Target

Students discover that the sum of the areas of the squares on the two shorter sides of a right triangle equals the area of the square on the longest side — and that this relationship holds *only* for right triangles. They move from visual proof (area manipulation) to algebraic notation (a² + b² = c²) to application (finding unknown sides, then distance between coordinate points).

**Core insight the student earns:** The Pythagorean Theorem is not a formula to memorize — it's a spatial relationship you can *see*. The squares are real. The areas add up. The formula is just notation for what you already observed.

---

## 2. Standards Alignment

### 8.G.B.6 — Explain a proof of the Pythagorean Theorem and its converse using the areas of squares

**ALD Progression:**

| Level | Description |
|-------|-------------|
| 2 (Approaching Basic) | Applies the Pythagorean Theorem to determine the hypotenuse of a right triangle in a simple planar case without coordinates |
| 3 (Basic) | Applies the Pythagorean Theorem to determine any side of a right triangle in a simple planar case without coordinates |
| 4 (Mastery) | Applies the Pythagorean Theorem in a simple planar case and to find the distance between two points in a coordinate system |
| 5 (Advanced) | Applies the Pythagorean Theorem in real-world and mathematical problems in two and three dimensions and to find the distance between two points in a coordinate system |

**ALD Target:** Level 3 entry → Level 4 primary → Level 5 stretch (coordinate distance).

**Teacher Companion guidance:** "Students should be provided opportunities to explore the Pythagorean Theorem using models... so that the formula has meaning. Much of the confusion that students have in applying the Pythagorean Theorem is a result of not recognizing that a and b represent the perpendicular sides (legs) and that c is the longest side (hypotenuse) which lies opposite the right angle. Additionally, when asked to solve for a missing side, the squares don't exist; thus, the model helps to give meaning to a², b² and c² as areas of squares."

This is exactly what Creative Lab's discovery-first pedagogy was built for. The student sees the squares, manipulates the squares, watches the areas, and *then* gets the formula. The Teacher Companion is practically writing our spec.

### 8.G.B.7 — Apply the Pythagorean Theorem to determine unknown side lengths

Application phase. Students use the discovered relationship to find missing sides of right triangles — first legs, then hypotenuse, in simple planar cases without coordinates.

### 8.G.B.8 — Apply the Pythagorean Theorem to find the distance between two points in a coordinate system

Coordinate extension. Students construct a right triangle from two points on a coordinate grid, identify the legs (horizontal/vertical distances), and apply the theorem to find the hypotenuse (distance).

**Concurrent standard (background):** 8.EE.A.2 (square roots) — students need to evaluate square roots. This module does not teach square roots but assumes the student can interpret √ notation. The module can scaffold this gently via the reveal system.

---

## 3. Pedagogical Sequence

### Phase 1: Visual Proof — "The squares tell the story" (8.G.B.6)

**What the student does:** Sees a right triangle with literal squares drawn on each side. The squares on the two legs are filled with a grid pattern so the student can count unit squares. The square on the hypotenuse is initially empty/ghosted. The student is prompted to predict: "How many unit squares will fill the square on the longest side?"

**Discovery moment:** The student commits a prediction, then watches the leg squares decompose and rearrange into the hypotenuse square — a visual area proof. The areas add up. The earned reveal is: a² + b² = c² — but labeled with the actual side lengths and areas the student just observed.

**Rounds:**
- Round 1: 3-4-5 right triangle. Classic Pythagorean triple. 9 + 16 = 25. Clean, countable.
- Round 2: 5-12-13 right triangle. Larger numbers, same clean triple. Confirms the pattern.
- Round 3: Properties pause — "You've now seen this twice. What stays true?" Earned reveal: formal statement with a², b², c² notation. One-way visibility flip: `formulaVisible = true`.

### Phase 2: Converse & Non-Right Triangles — "Does it always work?" (8.G.B.6 converse)

**What the student does:** Given triangles (some right, some not), the student sees squares on all three sides and is prompted: "Do the two smaller areas add up to the largest?" The student commits a prediction (yes/no + predicted area), then the actual areas are revealed.

**Discovery moment:** For non-right triangles, the areas *don't* add up. The earned reveal is the converse: "If a² + b² = c², the triangle is a right triangle. If not, it isn't."

**Rounds:**
- Round 1: 6-8-10 right triangle (scaled 3-4-5). a² + b² = c². Confirms.
- Round 2: 5-6-9 non-right triangle. 25 + 36 ≠ 81. Breaks the pattern.
- Round 3: 8-15-17 right triangle. Confirms again — the relationship distinguishes right triangles.

### Phase 3: Unknown Side Lengths — "Use what you know" (8.G.B.7)

**What the student does:** Given a right triangle with two known sides and one unknown, the student uses the proven relationship to find the missing side. The squares are still visible as scaffolding. The student enters a numeric prediction for the unknown side length.

**Discovery moment:** The student realizes the formula works both ways — find the hypotenuse given legs, or find a leg given the hypotenuse and the other leg. The earned reveal confirms the algebraic rearrangement.

**Rounds:**
- Round 1: Find hypotenuse. Legs = 3, 4. → c = 5. (Familiar triple, new question.)
- Round 2: Find hypotenuse. Legs = 6, 8. → c = 10.
- Round 3: Find a leg. Hypotenuse = 13, one leg = 5. → other leg = 12. (Introduces solving for a leg.)
- Round 4: Find a leg. Hypotenuse = 10, one leg = 6. → other leg = 8. (Confirms the rearrangement.)

### Phase 4: Coordinate Distance — "The hidden right triangle" (8.G.B.8)

**What the student does:** Two points on a coordinate grid. The student is prompted to find the distance between them. The grid makes horizontal and vertical distances countable. The student constructs/identifies the right triangle formed by the horizontal leg, vertical leg, and the line segment connecting the two points.

**Discovery moment:** The distance between two points IS the hypotenuse of a right triangle whose legs are the horizontal and vertical distances. The earned reveal is the distance formula as a special case of Pythagorean Theorem.

**Rounds:**
- Round 1: Points at (1, 1) and (4, 5). Horizontal = 3, Vertical = 4. Distance = 5. (The 3-4-5 triple one more time — the student should recognize it.)
- Round 2: Points at (0, 0) and (5, 12). Horizontal = 5, Vertical = 12. Distance = 13. (Clean triple.)
- Round 3: Points at (2, 1) and (8, 9). Horizontal = 6, Vertical = 8. Distance = 10. (Confirms the pattern.)

**Capstone:** The final earned reveal connects back through the entire arc: "You started by seeing squares on the sides of a triangle. Now you're finding the distance between any two points on a grid — using the same relationship."

---

## 4. Stage Flow

```
Phase 1: PREDICT → REVEAL → OBSERVE (repeat × 3 rounds)
Phase 2: PREDICT → REVEAL → OBSERVE (repeat × 3 rounds)
Phase 3: SOLVE → CHECK → OBSERVE (repeat × 4 rounds)
Phase 4: CONSTRUCT → SOLVE → CHECK (repeat × 3 rounds)
```

**Deviation from reference flow (Observe → Manipulate → Discover → Celebrate):**

This module does not have a free-manipulation phase like M1/M2's ghost-drag interaction. The Pythagorean Theorem is an *observation-and-prediction* concept — you see the relationship, predict it, and then apply it. The manipulation is the prediction itself (committing a number), not dragging geometry.

Phase 4 introduces a light construction element (identifying/confirming the right triangle on the coordinate grid), which is the closest analog to manipulation. But the core loop is predict → verify → formalize.

This is a legitimate departure from M1/M2. The earned reveal system, one-way visibility flags, and stage machine all still apply. The interaction modality shifts from drag-to-predict to enter-value-to-predict.

**Justification:** The Teacher Companion emphasizes that students need to see the model (squares on sides) and count areas to build meaning. The interactive's job is to make the model dynamic and the prediction loop tight — not to make the student drag things around for the sake of dragging.

---

## 5. What Is NOT In This Module

- **Three-dimensional applications** (Level 5 ALD stretch). The diagonal of a rectangular prism is a powerful extension but adds 3D complexity that is out of scope for M3. The module targets Level 4 as its ceiling.
- **Irrational number instruction.** The module uses clean Pythagorean triples to keep the focus on the geometric relationship, not arithmetic. √2 and non-integer answers are deferred.
- **Proof by rearrangement animation.** The visual proof (Phase 1) shows squares decomposing and filling — it does not animate the classical "four triangles in a square" proof. The area-counting model is closer to the Teacher Companion's recommended approach.
- **Real-world word problems.** The ALD mentions ladders against walls, tree heights, etc. These are better served by worksheet follow-up than by an interactive module. The module builds the understanding that makes those problems solvable.
- **Free-form triangle drawing.** The student does not construct their own triangles. All triangles are pre-defined to ensure clean Pythagorean triples and pedagogically sequenced discovery.

---

## 6. Success Criteria

| Criterion | Measurement |
|-----------|-------------|
| Student can predict hypotenuse area from leg areas | Phase 1, Round 2+ accuracy |
| Student can distinguish right from non-right triangles using area sums | Phase 2 accuracy |
| Student can find an unknown side given two known sides | Phase 3 accuracy |
| Student can identify the right triangle between two coordinate points and compute distance | Phase 4 completion |
| Formula earned, not given | a² + b² = c² appears only after Phase 1 predictions are verified |
| Connection across phases | Phase 4 earned reveal explicitly ties coordinate distance back to area squares |

---

## 7. Technical Constraints & Patterns (from PRE_M3_AUDIT)

### Carry Forward
- `useReducer` + `startRound()` reset (M2 pattern)
- Round-indexed copy in a dedicated `-copy.ts` file (M2 pattern)
- `SpriteLabel` CanvasTexture — never drei `<Text>`
- One-way visibility flags via OR gate in `startRound()`
- Earned reveal system — record key in `handleAdvance`, not `handleCheck`
- GSAP + `useFrame` for reveal animations
- Orthographic camera with frustum computed in `useFrame`
- All geometry in `useMemo`, disposed in `useEffect` cleanup
- `useAccessibility` — announce on match, 80ms haptic, 44px touch targets
- `touchAction: 'none'` on Canvas
- Visual specs block before first pixel (container fill, camera, grid bounds, z-layers)

### New Decisions for M3
- **Interaction model:** Numeric input prediction (not ghost drag). This is new for the arc. The input component lives outside Canvas (HTML controls, not 3D).
- **Square visualization:** Squares on triangle sides are the core visual. These are R3F geometry — filled rectangles with grid lines, area labels, and animated decomposition in Phase 1.
- **Successess-required vs. one-per-round:** M2's simpler one-per-round model. No concept in M3 requires repetition-to-lock-in within a single round.
- **Coordinate grid reuse:** Phase 4 needs a coordinate grid. M1 and M2 both have `CoordinateGrid` components. Evaluate whether M2's is extractable to shared, or whether M3 builds its own (likely the latter — three data points before refactoring).
- **Area animation:** Phase 1's decompose-and-fill animation is the signature moment. This needs careful GSAP choreography. Spec the animation in the UX pass, not here.