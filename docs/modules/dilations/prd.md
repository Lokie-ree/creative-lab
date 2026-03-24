# Module 02 — Dilations, Similarity & Right Triangles

**PRD v1.0** | Grade 8 Geometry Arc | ISTE LIVE 2026

---

## 1. One-Sentence Problem

> Grade 8 students struggle to understand similarity as a geometric relationship because traditional instruction jumps from "scale factor" to coordinate formulas without letting students observe what dilation actually does to a shape, resulting in rote memorization of (x,y)→(kx,ky) without understanding why angles are preserved or what "similar" means geometrically.

---

## 2. Demo Goal (What Success Looks Like)

**Success:** A student who has completed Module 1 (Rigid Motions) sees the same triangle they already know, discovers that dilation scales distances from a center by a constant factor, earns the coordinate rule through observation, and composes rigid motions with dilations to define similarity — all without being told a formula first.

**The demo clearly communicates:**
- Dilation is not just "make it bigger" — fractional scale factors reduce
- The coordinate rule (x,y)→(kx,ky) is a label for spatial understanding, not a starting point
- Similarity = rigid motion + dilation (bridging M1 and M2)
- AA criterion emerges from angle observation, not from a theorem statement

**Non-Goals:**
- Non-origin centers of dilation (deferred — adds complexity without ALD payoff)
- Protractor tool or angle measurement interaction (angles are computed labels, not student-measured)
- Negative scale factors (out of scope for 8.G.A.3–4)
- Persistent student data or progress tracking

---

## 3. Standards & ALD Design

### 3.1 Standards Alignment

**8.G.A.3** — Describe the effect of dilations on two-dimensional figures using coordinates
- Rigor: Conceptual Understanding
- Constraint: Dilations only use the origin as center
- Shared: Yes — shared with Module 1 (M1 covers translations, reflections, rotations; M2 covers dilations)

**8.G.A.4** — Explain similarity via sequences of rotations, reflections, translations, and dilations; describe the sequence
- Rigor: Conceptual Understanding, Procedural Skill
- Constraint: Origin-centered rotations/dilations, axis-aligned reflections
- Shared: No

**8.G.A.5** — Use informal arguments for angle sum, exterior angles, transversals, and AA criterion for similarity
- Rigor: Conceptual Understanding
- Constraint: AA criterion only (angle sum/exterior angles/transversals out of scope)
- Shared: No

### 3.2 ALD Instruments

**L3 — Entry**
- Descriptor: Describes effect of dilations on figures without coordinates. Identifies similarity.
- Instrument: Predict & Reveal with scale factor slider — no coordinate readout. Student sees angles preserved, shape "grows" from origin. Ray-from-origin lines show each vertex moving along its ray. Student positions ghost triangle at predicted dilated location before reveal animation confirms.

**L4 — Primary Target**
- Descriptor: Describes effect of dilations with coordinates. Explains similarity through transformation sequences.
- Instrument: Coordinate readouts activate. Student sees (x,y) → (kx, ky) pattern across multiple scale factors (integer and fractional). Ratio annotations show distance-from-origin scaling. Similarity = rigid motion + dilation, composed in the SequenceBuilder.

**L5 — Capstone**
- Descriptor: Describes sequences including dilations to justify similarity. Uses AA criterion informally.
- Instrument: Inverse task — two similar figures given, student builds the transformation sequence (rigid + dilation). AA discovery: computed angle labels appear; if two angles match, triangles are similar. Multi-pair capstone challenge with CelebrationModal.

### 3.3 Module Identity & Core Question

- **Module subtitle:** Dilations, Similarity & Right Triangles
- **Core question:** What stays the same when a shape grows?
- **Core answer:** Angles are preserved. Side ratios are preserved. Distances scale by a consistent factor k.

---

## 4. Key Decisions (Pre-Flight)

#### Parameter Values
- Scale factors: k = 2, k = 3, k = ½, k = ⅓
- k = 2 and k = 3 establish the enlargement pattern
- k = ½ is the "surprise" — dilation doesn't always mean bigger
- k = ⅓ confirms the fractional coordinate rule generalizes
- Center of dilation: origin only (simplifies coordinate rule to multiplication)

#### Scope
- **In scope:** Origin-centered dilations, coordinate rule (x,y)→(kx,ky), similarity via rigid motion + dilation, AA criterion (observational)
- **Out of scope:** Non-origin centers, negative scale factors, protractor/measurement tools, formal AA proof

#### Session Estimate
3–4 sessions (60 min each, STEM Club format)
- Session 1: Phase 1 (Scale Factor Intuition — all 5 rounds)
- Session 2: Phase 2 (Coordinate Dilation — 3 rounds)
- Session 3: Phase 3 (Similarity — 3 rounds)
- Session 4: Phase 4 (AA Discovery & Capstone — 3 rounds)

#### Shape / Instrument
Same scalene triangle from Module 1: **A(1,1) B(4,2) C(2,4)**. Students recognize it immediately. Now it grows. Continuity with M1 means the triangle is familiar — students can focus on what's new (scaling) instead of re-orienting to a new shape.

#### Deferred Items
- **Non-origin centers:** Pedagogically valuable but adds UI complexity (draggable center point) without advancing the core ALD progression. Could be a future extension.
- **Negative scale factors:** Not addressed by 8.G.A.3. Would introduce 180° rotation composition — interesting but out of scope.
- **Angle measurement interaction:** Protractor tool considered for Phase 4 but rejected. AA discovery is about observation ("the angles match"), not measurement skill. Computed labels serve the insight without scope creep.

---

## 5. Phase & Round Architecture

### Phase 1: Scale Factor Intuition

**ALD target:** L3

**Description:** The familiar scalene triangle sits at the origin. A slider controls scale factor k. The student predicts where the dilated image lands by positioning the ghost, then reveals. No coordinates visible — pure spatial reasoning about "bigger" and "smaller" from a fixed center. Each scale factor variant gets its own sub-arc: spatial discovery first (what happens?), then earned property observation (what stayed the same?).

**Reuse from previous modules:** Ghost triangle, predict/reveal loop, GSAP reveal animation, SpriteLabel, guide state machine pattern

**New work:** Scale factor slider component, origin-anchored dilation logic, proportional ghost sizing, ray-from-origin visual scaffolding, ratio annotation engine

**Design insight:** Lesson from M1 notebook — each transformation variant should follow a spatial → earned notation sub-arc. In M1 this emerged retroactively; in M2 it's designed from the start.

#### Rounds

**dilate-k2** — k = 2 — Enlargement
- Description: Triangle doubles in size from origin. Student drags ghost to predicted position. Reveal shows the image landing exactly twice as far from the origin on every vertex.
- Visual scaffolding: Ray-from-origin lines appear during reveal — dashed lines from (0,0) through each pre-image vertex, extending to the image vertex. Visual proof that dilation moves points along rays.

**dilate-k2-properties** — k = 2 — Earned Discovery
- Description: After successful prediction, student observes: angles unchanged, sides exactly doubled. SpriteLabels show side length ratios (image/pre-image = 2 for each side). The earned reveal: "The shape grew but the angles didn't change."
- Visual scaffolding: Color-coded ratio annotations — each side pair gets a matching color showing the 2:1 ratio. Angle marks appear on both triangles to show preservation.

**dilate-k3** — k = 3 — Confirm Pattern
- Description: Scale factor increases to 3. Same predict/reveal loop. Student now expects the image to be 3x as far from origin. Confirmation strengthens the spatial model.
- Visual scaffolding: Ray-from-origin lines extend further. Ratio annotations now show 3:1.

**dilate-k-half** — k = 1/2 — The Surprise
- Description: First fractional scale factor. The triangle shrinks — the image is closer to the origin than the pre-image. This is the key surprise: dilation doesn't always mean "bigger." Students who assumed dilation = enlargement must update their mental model.
- Visual scaffolding: Ray-from-origin lines show image vertices landing between origin and pre-image. Ratio annotations show 1:2.

**dilate-summary** — Scale Factor Summary
- Description: Pause state. All three scale factors displayed together: k=2, k=3, k=1/2. The pattern is named: k > 1 enlarges, 0 < k < 1 reduces. Angles always preserved. This is the L3 earned answer.
- Visual scaffolding: No new visuals — summary state using existing annotations from previous rounds.

---

### Phase 2: Coordinate Dilation

**ALD target:** L4

**Description:** coordinatesActive flips on — the earned reveal. Student sees vertex labels update as scale factor changes: A(1,1)→A'(2,2) at k=2. FormulaReadout shows (x,y)→(kx,ky). The pattern clicks: every coordinate multiplied by the same factor. Students repeat with k=1/2 and k=1/3 to confirm the rule holds for reduction.

**Reuse from previous modules:** coordinatesActive flag, FormulaReadout component, SpriteLabel with coordinates, predict/reveal loop

**New work:** Dilation-specific formula display, scale factor in readout, k-value annotation, coordinate substitution verification

**Design insight:** M1 coordinate reveal was a single pause state. M2 earns the rule through at least two scale factor variants — integer and fractional — so the student sees the multiplication pattern, not just one example.

#### Rounds

**coord-k2** — k = 2 with Coordinates
- Description: Coordinates now visible. Student predicts image position, then reveal shows A(1,1)→A'(2,2), B(4,2)→B'(8,4), C(2,4)→C'(4,8). FormulaReadout: (x,y)→(2x, 2y).
- Visual scaffolding: Vertex labels show both pre-image and image coordinates. FormulaReadout substitutes actual values.

**coord-k-half** — k = 1/2 with Coordinates
- Description: Fractional coordinates appear: A(1,1)→A'(0.5, 0.5). The multiplication rule still holds — every coordinate multiplied by 1/2. FormulaReadout: (x,y)→(1/2 x, 1/2 y).
- Visual scaffolding: FormulaReadout shows fractional multiplication. Coordinate labels update in real-time with slider.

**coord-k-third** — k = 1/3 — Confirm Pattern
- Description: One more fractional scale factor to lock in the generalization. Student should now predict coordinates before checking. The earned reveal: (x,y)→(kx, ky) works for any positive k.
- Visual scaffolding: FormulaReadout generalizes: (x,y) → (kx, ky). The rule is the label for the spatial understanding they already built.

---

### Phase 3: Similarity = Rigid Motion + Dilation

**ALD target:** L4–L5

**Description:** Two figures that are similar but not in a simple dilation relationship (the image is dilated AND translated/reflected/rotated from the pre-image). Student must compose a rigid motion from Module 1 with a dilation to map one onto the other. The earned reveal: "similar" means there exists such a sequence. This is the 8.G.A.4 payoff — students use the SequenceBuilder from M1's capstone, now extended with dilation as a selectable step.

**Reuse from previous modules:** SequenceBuilder pattern from M1 capstone, transformation selection UI, rigid motion transforms from M1

**New work:** Dilation as a selectable transformation step in SequenceBuilder, combined sequence validation (rigid + dilation), similarity determination logic, target figure generation for similarity tasks

**Design insight:** This phase bridges M1 and M2. The SequenceBuilder already exists; dilation is added as a new step type. The conceptual leap is understanding that similarity is the dilation analog of congruence.

#### Rounds

**similarity-guided** — Guided Similarity
- Description: Pre-image and a similar (not congruent) image shown. The image is a dilation + translation of the pre-image. Student uses SequenceBuilder to find: translate then dilate (or dilate then translate). Multiple valid sequences exist.
- Visual scaffolding: Both triangles visible with side length annotations. Angles marked as congruent. Student can see it's not congruent (different size) but angles match.

**similarity-rigid-dilation** — Rigid + Dilation
- Description: Image requires a reflection or rotation combined with a dilation. Student discovers that similarity can involve any rigid motion plus a dilation — not just translation.
- Visual scaffolding: SequenceBuilder now shows dilation step alongside rigid motion options. Preview ghost updates as sequence is built.

**similarity-inverse** — Inverse Similarity Task
- Description: Given two similar figures, student identifies the full sequence. This is the same inverse pattern from M1's capstone, now with dilation in the toolkit. The earned reveal: if you can find a rigid motion + dilation mapping one to the other, they are similar.
- Visual scaffolding: Success state highlights the definition — Similar = exists a sequence of rigid motions + dilation mapping one figure to the other.

---

### Phase 4: AA Discovery & Capstone

**ALD target:** L5

**Description:** Lightweight angle measurement — computed angle labels appear on triangles (not a protractor tool). Student compares angles across similar triangle pairs and discovers: if two angles match, the triangles must be similar (AA criterion). This is 8.G.A.5's "informal argument" — observation-driven, not proof-driven. Capstone: inverse similarity task with multiple triangle pairs, culminating in CelebrationModal.

**Reuse from previous modules:** Inverse task pattern from M1 capstone, CelebrationModal, SequenceBuilder, predict/reveal loop

**New work:** Computed angle labels (Math.atan2-based, displayed as rounded degrees), AA criterion discovery flow, multi-pair comparison UI

**Design insight:** AA stays lightweight — computed angle readouts that appear automatically, not a new protractor interaction mode. The insight is the observation ("only the angles needed to match"), not a measurement skill. This keeps Phase 4 focused and avoids scope creep into a new instrument.

#### Rounds

**aa-discover** — Angle Comparison
- Description: Two similar triangles shown with computed angle labels. Student observes: all three angle pairs match. Then a second pair where only two angles match — but the triangles are still similar. The earned reveal: two matching angles is sufficient.
- Visual scaffolding: Angle labels appear at each vertex (e.g., 34deg, 72deg, 74deg). Matching angles highlighted in the same color across both triangles.

**aa-confirm** — AA Confirmation
- Description: Non-similar triangles shown — student sees that one or zero angle pairs match and the sequence cannot be built. Confirms: AA is necessary, not just coincidence.
- Visual scaffolding: Non-matching angles in distinct colors. SequenceBuilder fails to find a valid mapping.

**capstone-final** — Capstone Challenge
- Description: Multi-pair challenge — given several triangle pairs, determine which are similar (AA check) and build the transformation sequence for similar pairs. CelebrationModal on completion.
- Visual scaffolding: CelebrationModal with DiscoveryTab showing the full journey: scale factors → coordinate rule → similarity definition → AA criterion.

---

## 6. Architecture Reuse

### Components Consumed
- **Ghost triangle** — Draggable prediction shape (M1). Extended with proportional sizing for dilation.
- **Predict/reveal loop** — Core interaction pattern (M1). Unchanged.
- **GSAP reveal animation** — Animated overlay showing correct position (M1). Extended with scaling.
- **SpriteLabel** — Text labels in 3D scene (M1). Used for coordinates and ratio annotations.
- **FormulaReadout** — Coordinate rule display (M1). Adapted for dilation formula.
- **coordinatesActive flag** — State toggle for earned reveal (M1). Same pattern.
- **SequenceBuilder** — Multi-step transformation composer (M1 capstone). Extended with dilation step.
- **CelebrationModal** — End-of-module celebration (M1). Reused with M2-specific DiscoveryTab content.
- **Guide state machine pattern** — Stage-based navigation (M1). Same architecture.

### Components Introduced
- **Scale factor slider** — Controls k value. Used in Phase 1 and 2.
- **Ray-from-origin lines** — Dashed lines from origin through vertices. Visual proof of dilation along rays. Phase 1.
- **Ratio annotation engine** — Color-coded side length ratio display. Phase 1-2.
- **Computed angle labels** — Math.atan2-based angle readouts at vertices. Phase 4.
- **AA criterion discovery flow** — Multi-pair angle comparison UI. Phase 4.
- **Dilation step (SequenceBuilder)** — New transformation type in existing builder. Phase 3-4.

### Reuse Matrix Reference
Full cross-module reuse matrix lives in `src/components/planning/DilationsModulePlanning.tsx` (Reuse Matrix tab).

---

## 7. UX Decisions

### 7.1 Entry Point
Student navigates to Module 2 from the module selector. The familiar triangle A(1,1) B(4,2) C(2,4) appears at the origin — immediate recognition from M1. A scale factor slider appears (new element). No coordinates visible initially.

### 7.2 Inputs
- **Ghost positioning:** Student drags ghost triangle to predicted dilation position
- **Scale factor slider:** Student adjusts k value (in later rounds; initially set by the system)
- **SequenceBuilder selections:** Student composes transformation sequences (Phase 3-4)
- **AA pair selection:** Student identifies which triangle pairs are similar (Phase 4)

### 7.3 Outputs
- **Visual confirmation:** Reveal animation shows correct dilation overlaying student's prediction
- **Ray-from-origin lines:** Visual proof that dilation moves points along rays from center
- **Ratio annotations:** Side length ratios showing consistent scale factor
- **Coordinate readouts:** Vertex labels showing (x,y) → (kx,ky) pattern (Phase 2+)
- **FormulaReadout:** Generalized coordinate rule display
- **Angle labels:** Computed degree measures at vertices (Phase 4)
- **CelebrationModal:** End-of-module summary of discoveries

### 7.4 Feedback & States
- **Loading:** Minimal — all computation is client-side. Scene renders immediately.
- **Success:** Ghost overlaps with reveal position within tolerance → green flash + SpriteLabel confirmation. SequenceBuilder valid sequence → smooth animation to target.
- **Partial:** Ghost close but not exact → guided nudge ("look at how far each vertex is from the origin").
- **Failure:** No explicit failure state. Incorrect predictions get a reveal that shows the correct position — the gap between prediction and reality IS the feedback.

### 7.5 Errors (Minimum Viable Handling)
- **Invalid input:** Ghost can't be placed outside the grid bounds. Slider constrained to valid k values.
- **System fails:** Not applicable — all client-side. If WebGL context lost, standard R3F fallback.
- **User does nothing:** Idle state prompts after timeout ("Try dragging the ghost triangle to where you think it will land").

---

## 8. Data & Logic

### 8.1 Inputs
- **Static:** Canonical triangle vertices A(1,1) B(4,2) C(2,4), scale factor values [2, 3, 0.5, 0.333]
- **User:** Ghost position (drag), scale factor selection (slider), transformation sequence (SequenceBuilder), similarity pair selections
- **Generated:** Dilation image coordinates (vertex * k), angle measures (Math.atan2), side lengths (Euclidean distance), ratio values

### 8.2 Processing
- `vertex → vertex * k` — Origin-centered dilation (multiply each coordinate by scale factor)
- `ghost position → distance from correct → tolerance check` — Prediction accuracy
- `transformation sequence → composition → final image → match check` — SequenceBuilder validation
- `angle pairs → match count → AA determination` — Similarity criterion check

### 8.3 Outputs
- **UI only:** All visualizations rendered in React Three Fiber canvas
- **Temporarily stored:** Current stage, round progress, scale factor selection, sequence state (React hooks + stage machine)
- **No persistence:** No server calls, no saved progress, no analytics

**Technical context:**
- All computation client-side
- State: React hooks + stage machine pattern (same as M1)
- Visualization: React Three Fiber
- Animation: GSAP
- Coordinate math: Plain TypeScript utility functions
