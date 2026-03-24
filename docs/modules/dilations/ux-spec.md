# UX Specification: Module 02 — Dilations, Similarity & Right Triangles

**Source PRD:** `docs/modules/dilations/prd.md`
**Round count:** 14 rounds across 4 phases

---

## Pass 1: Mental Model

**Primary user intent:** "I want to find out what happens to my triangle when it grows or shrinks from a point."

**Core question framing:** "What stays the same when a shape grows?" primes the student to expect change — they'll watch for what changes and what doesn't. The question implies something *does* stay the same, which creates productive anticipation. By Phase 1's end, students should be able to answer: angles and shape stay the same; only size and distance from the center change.

**Likely misconceptions:**
- **"Dilation = enlargement."** Students will assume dilation always makes things bigger. The k=1/2 round (`dilate-k-half`) exists specifically to break this assumption.
- **"The shape moves somewhere else."** Students may confuse dilation with translation — thinking the triangle slides to a new location rather than scaling from a fixed center. Ray-from-origin lines counter this by showing vertices move *along rays*, not freely.
- **"I need to know the formula first."** Students conditioned by notation-first instruction will look for (x,y)→(kx,ky) before they're ready for it. The absence of coordinates in Phase 1 forces spatial reasoning first.
- **"Similar means same shape and same size."** Students may conflate similarity with congruence (the M1 concept). Phase 3 directly addresses this: congruence is rigid motion only; similarity adds dilation.
- **"Angles change when size changes."** Without experience, students may assume everything scales — angles included. The earned discovery in `dilate-k2-properties` shows this is wrong.

**UX principle to reinforce/correct:** Understanding precedes notation. Every interaction in Phases 1-2 builds spatial intuition *before* coordinates appear. The coordinate rule is a reward for demonstrated understanding, not a prerequisite. The ghost-predict-reveal loop forces the student to commit to a spatial prediction before seeing the answer — this is visual confirmation, not multiple choice.

---

## Pass 2: Information Architecture

**All user-visible concepts:**
- Pre-image triangle (A, B, C)
- Image triangle (A', B', C')
- Ghost triangle (draggable prediction)
- Origin / center of dilation
- Scale factor (k)
- Scale factor slider
- Ray-from-origin lines
- Side length ratios (image/pre-image)
- Angle marks / preservation
- Coordinate labels (vertex positions)
- FormulaReadout ((x,y)→(kx,ky))
- SequenceBuilder (transformation composer)
- Rigid motion steps (translate, reflect, rotate — from M1)
- Dilation step (new in SequenceBuilder)
- Preview ghost (SequenceBuilder output)
- Side length annotations
- Computed angle labels (degree measures)
- AA criterion statement
- Similarity definition
- CelebrationModal / DiscoveryTab

**Grouped structure:**

### Core Geometry Objects
- **Pre-image triangle:** Primary. Introduced: `dilate-k2`. Visible through: all rounds. The anchor — always present.
- **Image triangle:** Primary. Introduced: `dilate-k2` (during reveal). Visible through: all prediction/reveal rounds. Disappears at round start, reappears at reveal.
- **Ghost triangle:** Primary. Introduced: `dilate-k2`. Visible through: all prediction rounds in Phase 1-2. Replaced by SequenceBuilder preview in Phase 3-4. Rationale: The ghost IS the student's prediction — the primary interaction object.
- **Origin marker:** Secondary. Introduced: `dilate-k2`. Visible through: all Phase 1-2 rounds. Implied in Phase 3-4 (origin is still relevant but not visually emphasized). Rationale: The center of dilation needs to be visible but shouldn't compete with the triangle.

### Scale Factor System
- **Scale factor value (k):** Primary. Introduced: `dilate-k2` (system-set k=2). Visible through: all Phase 1-2 rounds. Becomes a parameter within SequenceBuilder in Phase 3-4.
- **Scale factor slider:** Primary. Introduced: `dilate-k2` (display only, showing k=2). Interactive in later rounds. Visible through: Phase 1-2. Replaced by SequenceBuilder controls in Phase 3-4. Rationale: The slider makes scale factor tangible — not a number in a box but a physical control.
- **Ray-from-origin lines:** Secondary. Introduced: `dilate-k2` (during reveal). Visible through: Phase 1 rounds (reveal states). Not visible in Phase 2+ (concept internalized). Rationale: Scaffolding that proves dilation moves points along rays. Removed once the spatial model is established.

### Ratio & Property Annotations
- **Side length ratios:** Secondary. Introduced: `dilate-k2-properties`. Visible through: `dilate-k2-properties`, `dilate-k3`, `dilate-k-half`, `dilate-summary`. Rationale: Evidence for the core answer — "distances scale by k."
- **Angle marks:** Secondary. Introduced: `dilate-k2-properties`. Visible through: Phase 1 property rounds, Phase 3-4 (on both triangles). Rationale: Evidence that angles are preserved.
- **Side length annotations (absolute):** Secondary. Introduced: `similarity-guided`. Visible through: Phase 3-4 rounds. Distinct from ratios — shows actual lengths, not ratios. Rationale: Students need to see different sizes but matching ratios in similarity tasks.

### Coordinate System
- **Coordinate labels:** Hidden → Primary. Introduced: `coord-k2` (the earned reveal). Visible through: all Phase 2+ rounds. Hidden in all Phase 1 rounds. Rationale: This is the core earned reveal — coordinates appear only after spatial understanding is demonstrated.
- **FormulaReadout:** Hidden → Primary. Introduced: `coord-k2`. Visible through: Phase 2 rounds. Referenced but not central in Phase 3-4. Rationale: The formula is the label for spatial understanding. It appears as confirmation.

### Composition & Similarity
- **SequenceBuilder:** Hidden → Primary. Introduced: `similarity-guided`. Visible through: all Phase 3-4 rounds. Rationale: Reused from M1 capstone, now extended with dilation. Replaces the ghost-drag interaction.
- **Rigid motion steps:** Secondary. Introduced: `similarity-guided` (carried from M1). Visible through: Phase 3-4 rounds within SequenceBuilder. Rationale: Students already know these from M1 — they're tools in the toolkit, not new concepts.
- **Dilation step:** Primary. Introduced: `similarity-guided`. Visible through: Phase 3-4 rounds within SequenceBuilder. Rationale: The new step type that makes similarity possible.
- **Preview ghost (sequence output):** Primary. Introduced: `similarity-guided`. Visible through: Phase 3-4 rounds. Replaces the draggable ghost — now shows the result of the composed sequence. Rationale: Students see their sequence applied in real-time.
- **Similarity definition:** Hidden → Primary. Introduced: `similarity-inverse` (earned reveal). Visible through: `similarity-inverse`, Phase 4 rounds. Rationale: The definition appears only after the student has demonstrated it.

### AA Criterion
- **Computed angle labels:** Hidden → Primary. Introduced: `aa-discover`. Visible through: all Phase 4 rounds. Rationale: New visual element — degree measures appear at vertices. Progressive reveal within the module.
- **AA criterion statement:** Hidden → Primary. Introduced: `aa-discover` (earned reveal). Visible through: `aa-confirm`, `capstone-final`. Rationale: The statement is earned by observation, not stated upfront.

### Celebration
- **CelebrationModal / DiscoveryTab:** Hidden. Introduced: `capstone-final` (on completion). Visible: only in `capstone-final` completion state. Rationale: End-of-module reward summarizing the full journey.

---

## Pass 3: Affordances

| Action | Visual/Interaction Signal | Rounds Active |
|--------|---------------------------|---------------|
| Drag ghost to predicted position | Ghost triangle has distinct opacity/outline, follows pointer, snaps to grid | `dilate-k2`, `dilate-k3`, `dilate-k-half`, `coord-k2`, `coord-k-half`, `coord-k-third` |
| Commit prediction (release ghost) | Ghost settles, "Reveal" button activates | All prediction rounds in Phase 1-2 |
| Trigger reveal animation | "Reveal" button pulses/highlights after ghost placed | All prediction rounds in Phase 1-2 |
| Observe ray-from-origin lines | Dashed lines animate from origin through vertices during reveal | `dilate-k2`, `dilate-k3`, `dilate-k-half` (reveal states) |
| Read ratio annotations | Color-coded labels appear adjacent to side pairs | `dilate-k2-properties`, `dilate-k3`, `dilate-k-half`, `dilate-summary` |
| Read angle preservation marks | Arc marks at vertices of both triangles | `dilate-k2-properties` through `dilate-summary`, Phase 3-4 |
| Read coordinate labels | Labels at vertices showing (x,y) values | All Phase 2+ rounds |
| Read FormulaReadout | Formula display area shows (x,y)→(kx,ky) with substituted values | Phase 2 rounds |
| Advance to next round | "Next" button or auto-advance after completion | All rounds (student-initiated) |
| Select transformation step in SequenceBuilder | Clickable step cards (Translate, Reflect, Rotate, Dilate) | `similarity-guided`, `similarity-rigid-dilation`, `similarity-inverse`, Phase 4 rounds |
| Configure dilation parameters in SequenceBuilder | Scale factor input within dilation step card | Phase 3-4 rounds |
| Execute sequence (preview) | "Apply" or live preview — ghost updates as steps are added | Phase 3-4 rounds |
| Validate sequence | "Check" button — confirms mapping or shows mismatch | Phase 3-4 rounds |
| Compare angle labels across triangles | Degree labels at vertices, color-matched for equal angles | `aa-discover`, `aa-confirm`, `capstone-final` |
| Select similar/not-similar for triangle pairs | Toggle or tap on triangle pair | `capstone-final` |
| Dismiss CelebrationModal | Close button or "Done" | `capstone-final` (completion) |

**Affordance rules:**
- If the student sees a ghost triangle, they should assume they can drag it
- If the student sees a "Reveal" button, they should assume their prediction is committed and the answer is coming
- If the student sees the SequenceBuilder panel, they should assume they need to compose transformation steps (not drag a ghost)
- If the student sees color-matched angle labels on two triangles, they should assume matching colors = equal angles
- Read-only elements (ray lines, ratio annotations, coordinate labels, FormulaReadout) never look interactive — no hover effects, no pointer cursor

**Round-dependent affordances:**
- **Ghost drag disappears in Phase 3.** The primary interaction shifts from spatial prediction (drag ghost) to compositional reasoning (build sequence). This is a major affordance shift — the SequenceBuilder replaces the ghost as the primary input mechanism.
- **Coordinate labels appear in Phase 2.** Before `coord-k2`, no coordinates are visible anywhere. Their sudden appearance IS the earned reveal — the affordance change signals a new layer of information.
- **Angle labels appear in Phase 4.** Before `aa-discover`, no degree measures are shown. Their appearance signals the final conceptual layer.
- **Scale factor slider transitions from display-only to interactive.** In early rounds, k is system-set (student sees "k = 2" but doesn't control it). By Phase 2, the slider becomes interactive for exploration.

---

## Pass 4: Cognitive Load

**Friction points:**

| Moment | Round | Type | Simplification |
|--------|-------|------|----------------|
| First ghost drag — where should I put it? | `dilate-k2` | Uncertainty | Prompt text: "The triangle will double in size. Where do you think it will land?" Origin marker emphasized. Grid visible for spatial reference. |
| Ghost sizing — does the ghost change size? | `dilate-k2` | Uncertainty | Ghost is pre-sized to the correct scale. Student only positions it, not resizes. Reduces to one degree of freedom (position). |
| k=1/2 surprises — the image is smaller? | `dilate-k-half` | Uncertainty | Brief prompt before drag: "This time k = 1/2. What do you think that means?" Gives student a beat to form hypothesis before acting. |
| Coordinate overload — too many numbers | `coord-k2` | Choice | Coordinates appear one vertex at a time (A first, then B, then C) during reveal. Not all at once. |
| FormulaReadout abstraction | `coord-k-third` | Uncertainty | Formula generalizes from specific (2x, 2y) to general (kx, ky) only after two concrete examples. Student has seen the pattern before the abstraction. |
| SequenceBuilder is new in Phase 3 | `similarity-guided` | Uncertainty | First similarity round is guided — student is told "try translate then dilate." Free exploration comes in later rounds. |
| Multiple valid sequences exist | `similarity-guided` | Choice | Accept any valid sequence. Don't require a specific order. Success = the figures align, regardless of path. |
| AA requires comparing two triangles simultaneously | `aa-discover` | Choice | Color-match equal angles automatically. Student observes the pattern rather than manually comparing. |
| Multi-pair capstone is complex | `capstone-final` | Choice | Present pairs one at a time, not all simultaneously. Student works through sequentially. |

**Round transitions:**

| From → To | Trigger | Student experience |
|-----------|---------|-------------------|
| `dilate-k2` → `dilate-k2-properties` | Successful reveal | Seamless — same scene, annotations appear. "Now look at what stayed the same." |
| `dilate-k2-properties` → `dilate-k3` | Student clicks "Next" | New k value announced. Ghost resets. "Let's try k = 3." |
| `dilate-k3` → `dilate-k-half` | Student clicks "Next" | Tone shift — "Now here's something different. k = 1/2." |
| `dilate-k-half` → `dilate-summary` | Successful reveal | Summary appears — all three results shown together. Pause state. |
| `dilate-summary` → `coord-k2` | Student clicks "Next" | **Major transition:** coordinates appear for the first time. "Now let's see the numbers behind what you just did." |
| `coord-k2` → `coord-k-half` | Successful reveal + Next | Same pattern, new k. Student is now in coordinate mode. |
| `coord-k-half` → `coord-k-third` | Successful reveal + Next | "One more to confirm the pattern." |
| `coord-k-third` → `similarity-guided` | Student clicks "Next" | **Major transition:** scene changes from single triangle + dilation to two triangles + SequenceBuilder. "These two triangles look alike but aren't the same size. Can you map one to the other?" |
| `similarity-guided` → `similarity-rigid-dilation` | Valid sequence built | "Now try this pair — translation alone won't work." |
| `similarity-rigid-dilation` → `similarity-inverse` | Valid sequence built | "Your turn — figure out the full sequence." |
| `similarity-inverse` → `aa-discover` | Valid sequence built + Next | **Major transition:** angle labels appear. "There's a shortcut to knowing if two triangles are similar..." |
| `aa-discover` → `aa-confirm` | Student observes AA pattern | "Does it always work? Let's check a pair that ISN'T similar." |
| `aa-confirm` → `capstone-final` | Student observes non-similarity | "Final challenge — put it all together." |

**Defaults introduced:**
- **Ghost is pre-sized:** Student doesn't choose the ghost's scale — it matches the target scale factor. Reduces interaction to positioning only. Rationale: sizing AND positioning simultaneously is too many degrees of freedom for the first encounter.
- **Scale factor is system-set in Phase 1:** Student doesn't choose k — the system presents k=2, then k=3, then k=1/2 in sequence. Rationale: the progression is pedagogically designed; student choice would skip the surprise of k<1.
- **First similarity round is guided:** "Try translate then dilate" instruction provided. Rationale: SequenceBuilder is a new interaction mode; scaffolding the first attempt prevents blank-canvas paralysis.
- **Angle matching is color-coded:** Equal angles get the same color automatically. Rationale: manual comparison across two triangles is cognitively expensive and isn't the learning target — the observation of "two is enough" is.

---

## Pass 5: State Design

### Phase 1: Scale Factor Intuition

#### Round: dilate-k2 — k = 2 — Enlargement

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Pre-image triangle at origin. Ghost triangle (semi-transparent, same size). Prompt: "k = 2. Where will it land?" Origin marked. Grid visible. | "I need to predict where the triangle goes when it doubles." | Drag ghost triangle |
| Active | Ghost follows pointer. Grid provides spatial reference. Origin stays marked. | "I'm placing my prediction." | Position ghost, adjust position |
| Prediction | Ghost settles at dropped position. "Reveal" button appears/activates. | "I've committed to my guess." | Click Reveal, or reposition ghost |
| Reveal | GSAP animation: image triangle appears at correct position. Ray-from-origin dashed lines animate from origin through each pre-image vertex to image vertex. Ghost fades or stays for comparison. | "The image landed along rays from the origin. Each vertex is twice as far." | Observe, then advance |
| Completion | Both triangles visible. Rays visible. Ready to advance. | "Dilation moves points along rays from the center, scaling distance by k." | Click Next |

**Visual scaffolding notes:** Ray-from-origin lines are the key reveal element — dashed lines from (0,0) through each pre-image vertex extending to the image vertex.

#### Round: dilate-k2-properties — k = 2 — Earned Discovery

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Both triangles from previous round still visible. Prompt: "What stayed the same?" | "Something is preserved — I should look for it." | Observe |
| Active | Color-coded ratio annotations animate in: each side pair shows 2:1 ratio in matching color. Angle marks appear at all vertices of both triangles. | "The sides doubled but the angles didn't change." | Observe annotations |
| Completion | Earned reveal text: "The shape grew but the angles didn't change." All annotations visible. | "Dilation preserves angles and scales sides by k." | Click Next |

**Visual scaffolding notes:** Color-coded ratio annotations (each side pair in matching color showing 2:1). Angle marks on both triangles showing preservation.

#### Round: dilate-k3 — k = 3 — Confirm Pattern

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Pre-image triangle. Ghost. Prompt: "k = 3 this time." | "Same thing but bigger — 3x instead of 2x." | Drag ghost |
| Active | Ghost follows pointer. | "I'm predicting 3x distance from origin." | Position ghost |
| Prediction | Ghost placed. Reveal button active. | "I think I know the pattern now." | Click Reveal |
| Reveal | Image at 3x distance. Rays extend further. Ratio annotations: 3:1. | "Confirmed — each vertex is k times as far along its ray." | Observe, advance |
| Completion | Pattern strengthened. | "k controls how much farther from the origin." | Click Next |

**Visual scaffolding notes:** Ray-from-origin lines extend further than k=2. Ratio annotations show 3:1.

#### Round: dilate-k-half — k = 1/2 — The Surprise

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Pre-image triangle. Ghost (now smaller than pre-image). Prompt: "k = 1/2. What do you think that means?" | "Wait — the ghost is smaller? Dilation can shrink?" | Pause to think, then drag ghost |
| Active | Smaller ghost follows pointer. | "I need to place this closer to the origin..." | Position ghost |
| Prediction | Ghost placed (between origin and pre-image). Reveal button active. | "I think it goes halfway." | Click Reveal |
| Reveal | Image lands between origin and pre-image. Rays show vertices landing at half-distance. Ratio: 1:2. | "Dilation with k < 1 shrinks the figure toward the center." | Observe, advance |
| Completion | Mental model updated: dilation ≠ enlargement. | "k > 1 enlarges, k < 1 reduces. The center is the anchor." | Click Next |

**Visual scaffolding notes:** Ray-from-origin lines show image vertices between origin and pre-image. Ratio annotations show 1:2.

#### Round: dilate-summary — Scale Factor Summary

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | All three results displayed: k=2, k=3, k=1/2 images together (or in sequence). Pattern statement: "k > 1 enlarges, 0 < k < 1 reduces. Angles always preserved." | "That's the complete picture of what k does." | Read, absorb |
| Completion | Summary visible. Ready for Phase 2. | "I understand dilation spatially. I can predict where a dilated image lands." | Click Next (advances to Phase 2) |

**Visual scaffolding notes:** No new visuals. Summary state using existing annotations.

---

### Phase 2: Coordinate Dilation

#### Round: coord-k2 — k = 2 with Coordinates

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | **Coordinates appear for the first time.** Pre-image triangle with vertex labels: A(1,1), B(4,2), C(2,4). Ghost. Prompt: "Now let's see the numbers. k = 2 again." | "Oh — coordinates! Now I can see the actual positions." | Drag ghost |
| Active | Ghost follows pointer. Coordinate labels visible on pre-image. | "I already know where this goes from Phase 1. But now I can see the numbers." | Position ghost |
| Prediction | Ghost placed. Reveal button active. | "I predict A' is at (2,2) because 1×2 = 2." | Click Reveal |
| Reveal | Image appears: A(1,1)→A'(2,2), B(4,2)→B'(8,4), C(2,4)→C'(4,8). FormulaReadout: (x,y)→(2x, 2y). Coordinates appear one vertex at a time. | "Every coordinate was multiplied by 2. That's what dilation does in numbers." | Observe formula, advance |
| Completion | FormulaReadout persists. Both labeled triangles visible. | "The coordinate rule is: multiply each coordinate by k." | Click Next |

**Visual scaffolding notes:** Vertex labels show pre-image and image coordinates. FormulaReadout substitutes actual values.

#### Round: coord-k-half — k = 1/2 with Coordinates

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Pre-image with coordinates. Ghost (smaller). Prompt: "k = 1/2 with coordinates." | "This should give me fractions..." | Drag ghost |
| Active | Ghost follows pointer. | "A should go to (0.5, 0.5)." | Position ghost |
| Prediction | Ghost placed. | "Let me check." | Click Reveal |
| Reveal | A(1,1)→A'(0.5, 0.5), B(4,2)→B'(2,1), C(2,4)→C'(1,2). FormulaReadout: (x,y)→(1/2 x, 1/2 y). | "Same rule — multiply by k — even when k is a fraction." | Observe, advance |
| Completion | Pattern confirmed for fractional k. | "The rule works for any positive k." | Click Next |

**Visual scaffolding notes:** FormulaReadout shows fractional multiplication. Coordinate labels update with slider.

#### Round: coord-k-third — k = 1/3 — Confirm Pattern

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Pre-image with coordinates. Prompt: "k = 1/3. Can you predict the coordinates before checking?" | "I should be able to calculate this now." | Think, then drag ghost |
| Active | Ghost follows pointer. Student may mentally compute coordinates first. | "A goes to (1/3, 1/3), B to (4/3, 2/3), C to (2/3, 4/3)." | Position ghost |
| Prediction | Ghost placed. | "I'm confident in the pattern." | Click Reveal |
| Reveal | Coordinates confirmed. FormulaReadout generalizes: (x,y) → (kx, ky). | "The rule is (x,y) → (kx, ky) for any positive k. I earned this formula." | Observe, advance |
| Completion | Generalized formula displayed. L4 earned. | "I can describe dilations with coordinates." | Click Next (advances to Phase 3) |

**Visual scaffolding notes:** FormulaReadout generalizes to (x,y) → (kx, ky). The rule is the label for spatial understanding.

---

### Phase 3: Similarity = Rigid Motion + Dilation

#### Round: similarity-guided — Guided Similarity

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | **Scene change:** Two triangles visible — pre-image and a similar (not congruent) image. Different sizes, same angles. SequenceBuilder panel appears. Side length annotations visible. Prompt: "These look alike but aren't the same size. Try: translate, then dilate." | "I need to map one onto the other using transformations. Translation alone won't work because they're different sizes." | Select transformation steps in SequenceBuilder |
| Active | Student adds "Translate" step, configures it. Preview ghost shows intermediate result. Then adds "Dilate" step with k value. Preview updates. | "I'm building a sequence: move it, then scale it." | Add/configure/reorder steps, observe preview |
| Prediction | Sequence built. Preview ghost aligns (or nearly aligns) with target. "Check" button available. | "I think this sequence maps one to the other." | Click Check |
| Reveal | If correct: smooth animation showing the full sequence applied. Both figures align. If incorrect: mismatch highlighted, student can adjust. | "Translation + dilation = the figures overlap perfectly." | Observe, adjust if needed, advance |
| Completion | First similarity task done. | "A rigid motion + dilation can map similar figures onto each other." | Click Next |

**Visual scaffolding notes:** Both triangles with side length annotations. Angles marked as congruent. SequenceBuilder shows step cards.

#### Round: similarity-rigid-dilation — Rigid + Dilation

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | New pair: image requires reflection or rotation + dilation. Prompt: "Translation won't work this time. What else from Module 1 can you use?" | "I need to try other rigid motions — reflect or rotate — before (or after) dilating." | Select steps in SequenceBuilder |
| Active | Student experiments with rigid motion + dilation combinations. Preview updates live. | "Similarity can involve ANY rigid motion, not just translation." | Build sequence, observe preview |
| Prediction | Sequence ready. | "Reflect then dilate should work." | Click Check |
| Reveal | Sequence animated. Figures align. | "Similarity = any rigid motion + dilation." | Observe, advance |
| Completion | Broadened understanding of similarity. | "The type of rigid motion doesn't matter — what matters is that a sequence exists." | Click Next |

**Visual scaffolding notes:** SequenceBuilder shows dilation alongside rigid motion options. Preview ghost updates as sequence is built.

#### Round: similarity-inverse — Inverse Similarity Task

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Two similar figures. No guidance. Prompt: "Your turn. Find the sequence." | "I need to figure out the full mapping on my own." | Analyze figures, build sequence |
| Active | Student independently identifies the needed rigid motion and scale factor. | "I can decompose a similarity relationship into rigid motion + dilation." | Build sequence freely |
| Prediction | Sequence built. | "This should work." | Click Check |
| Reveal | Success: animation + earned reveal text: "If you can find a rigid motion + dilation mapping one figure to the other, they are similar." Definition of similarity appears. | "Similar means: there exists a sequence of rigid motions + dilation mapping one to the other. That's exactly what I just did." | Observe definition, advance |
| Completion | Similarity defined through construction. L4-L5 boundary reached. | "I can determine and justify similarity by building transformation sequences." | Click Next (advances to Phase 4) |

**Visual scaffolding notes:** Success state highlights the similarity definition.

---

### Phase 4: AA Discovery & Capstone

#### Round: aa-discover — Angle Comparison

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | **New visual element:** computed angle labels appear at vertices of two similar triangles. Matching angles color-coded. Prompt: "Look at the angles. What do you notice?" | "The angles are labeled with degree measures. Some colors match between the two triangles." | Observe angle labels |
| Active | First pair: all three angle pairs match (same colors). Student observes. Then second pair shown: only two angles match — but triangles are still similar. | "Wait — only two angles matched, but they're still similar?" | Compare angles, observe |
| Completion | Earned reveal: "Two matching angles is enough. If two angles match, the triangles must be similar." AA criterion stated. | "I don't need all three — two matching angles guarantees similarity." | Advance |

**Visual scaffolding notes:** Angle labels at each vertex (e.g., 34, 72, 74). Matching angles in same color across both triangles.

#### Round: aa-confirm — AA Confirmation

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Two non-similar triangles with angle labels. One or zero angle pairs match (distinct colors). Prompt: "Are these similar?" | "The angles don't match — this should NOT be similar." | Observe, attempt SequenceBuilder |
| Active | Student may try to build a sequence. SequenceBuilder cannot find a valid mapping — no sequence works. | "I can't map one to the other. The angles don't match, and no sequence works." | Attempt sequence (fails), observe |
| Completion | Confirmation: AA is necessary, not coincidence. Non-similar ≠ buildable sequence. | "AA works both ways — matching angles = similar, non-matching = not similar." | Advance |

**Visual scaffolding notes:** Non-matching angles in distinct colors. SequenceBuilder fails to produce a valid mapping.

#### Round: capstone-final — Capstone Challenge

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Entry | Multiple triangle pairs presented (one at a time). Angle labels visible on all. Prompt: "Final challenge. For each pair: are they similar? If so, build the sequence." | "I need to use AA to identify similar pairs, then prove similarity by building the sequence." | Examine pair, decide, build sequence |
| Active | For each pair: student checks angles (AA), determines similarity, and for similar pairs builds the transformation sequence in SequenceBuilder. | "I'm combining everything: angle observation + sequence building." | AA check, sequence building, pair navigation |
| Prediction | Sequence built for a similar pair (or "not similar" selected for non-similar pair). | "I've analyzed this pair." | Submit answer / Check sequence |
| Reveal | For each pair: confirmation of similarity determination + sequence validation. | "I got it right — my AA check predicted whether the sequence would work." | Advance to next pair, or finish |
| Completion | All pairs completed. **CelebrationModal** appears with DiscoveryTab: scale factors → coordinate rule → similarity definition → AA criterion. Full journey summarized. | "I earned every concept: spatial intuition → coordinates → similarity → AA. The whole arc connects." | Dismiss modal |

**Visual scaffolding notes:** CelebrationModal with DiscoveryTab showing the full journey.

---

## Pass 6: Flow Integrity

**Flow risks:**

| Risk | Round(s) | Mitigation |
|------|----------|------------|
| Student doesn't understand what "ghost" means | `dilate-k2` | Brief onboarding tooltip on first ghost appearance: "Drag the faded triangle to where you think the image will land." Carried from M1 — most students already know. |
| k=1/2 surprise causes confusion, not insight | `dilate-k-half` | Pre-round prompt ("k = 1/2. What do you think that means?") gives students a beat. Ghost is visibly smaller than pre-image — the visual itself is a hint. |
| Phase 1→2 transition feels arbitrary | `dilate-summary` → `coord-k2` | Summary round names the spatial pattern explicitly before coordinates appear. Transition text: "You've mastered where dilations land. Now let's see the numbers behind it." |
| SequenceBuilder is a new interaction mode | `similarity-guided` | First round is guided ("try translate then dilate"). Prevents blank-canvas paralysis. SequenceBuilder reused from M1 — students who did M1 capstone already know it. |
| Phase 3 requires M1 knowledge | `similarity-guided` | Rigid motion steps in SequenceBuilder are labeled clearly. Brief reminder tooltip: "Remember these from Module 1?" If student hasn't done M1, the steps are still learnable in context. |
| AA observation is too passive | `aa-discover` | Color-matching makes the pattern visually obvious. The "only two needed" sub-round forces a surprise that re-engages. |
| Capstone is overwhelming | `capstone-final` | Pairs presented one at a time. Each pair is self-contained: AA check → sequence build → confirm. No need to track all pairs simultaneously. |
| Student gets stuck on any prediction round | All Phase 1-2 prediction rounds | Reveal always comes — there's no failure gate. Wrong predictions produce useful feedback (the gap between guess and reality). Idle timeout triggers a nudge prompt. |

**Round sequence validation:**
- **Phase 1** rounds: `dilate-k2` → `dilate-k2-properties` → `dilate-k3` → `dilate-k-half` → `dilate-summary` → **ALD L3 demonstrated?** Yes — student has predicted dilation outcomes for multiple scale factors, observed angle preservation and distance scaling, and articulated the k>1 / k<1 pattern. This matches L3: "Describes effect of dilations on figures without coordinates."
- **Phase 2** rounds: `coord-k2` → `coord-k-half` → `coord-k-third` → **ALD L4 demonstrated?** Yes — student has connected spatial dilation to coordinate rule (x,y)→(kx,ky) across integer and fractional scale factors. This matches L4: "Describes effect of dilations with coordinates."
- **Phase 3** rounds: `similarity-guided` → `similarity-rigid-dilation` → `similarity-inverse` → **ALD L4-L5 demonstrated?** Yes — student has composed rigid motions with dilations to map similar figures and articulated the definition of similarity through construction. Bridges L4 and L5.
- **Phase 4** rounds: `aa-discover` → `aa-confirm` → `capstone-final` → **ALD L5 demonstrated?** Yes — student has discovered AA criterion through observation, confirmed it against non-similar pairs, and applied the full toolkit (AA + sequence building) in a multi-pair capstone. This matches L5: "Describes sequences including dilations to justify similarity. Uses AA criterion informally."

**Visibility decisions:**

Must be visible:
- Pre-image triangle (always)
- Ghost / preview ghost (during prediction/building)
- Origin marker (Phase 1-2)
- Scale factor value (Phase 1-2, within SequenceBuilder in Phase 3-4)
- Current round prompt / instruction text
- Reveal button (during prediction)
- SequenceBuilder panel (Phase 3-4)
- Angle labels (Phase 4)

Can be implied:
- Grid (present but not emphasized — spatial reference)
- Round/phase progress indicator (small, non-intrusive — student should focus on the math, not the progress bar)
- "Next" button (appears naturally after round completion)
- Origin in Phase 3-4 (still conceptually relevant but the scene has shifted to two-triangle comparison)

**UX constraints:**
- No coordinates visible in any Phase 1 round — the earned reveal must be clean
- No angle labels visible before Phase 4 — progressive reveal
- Ghost drag is the ONLY prediction mechanism in Phase 1-2. SequenceBuilder is the ONLY mechanism in Phase 3-4. Never both simultaneously.
- Reveal animation must complete before "Next" becomes available — student should see the full feedback
- FormulaReadout never appears before coordinates — it depends on the coordinate reveal having already occurred
- CelebrationModal only appears once, at the very end of `capstone-final`

---

## Visual Specifications

### Canvas / Visualization Layout

**React Three Fiber scene structure:**
- **Primary canvas:** Occupies main content area. Orthographic camera looking down the z-axis (2D view of coordinate plane).
- **Grid plane:** Subtle grid lines at unit intervals. Origin marked with a distinct dot/crosshair.
- **Pre-image triangle:** Solid fill, distinct color (from lab design tokens). Always visible.
- **Image triangle:** Appears during reveal. Solid fill, contrasting color. Semi-transparent briefly during animation, then solid.
- **Ghost triangle:** Same shape as target image. Semi-transparent, dashed outline. Follows pointer during drag. Distinct from both pre-image and image.
- **HUD overlay (HTML):** Prompt text, FormulaReadout, round navigation, SequenceBuilder panel — rendered as HTML overlay on top of the R3F canvas, not inside the 3D scene.

**Two-triangle layout (Phase 3-4):** Pre-image on left half of canvas, target image on right half. Enough separation for both to be clearly visible with their annotations. SequenceBuilder panel docked to the side or bottom.

### Component Specifications

**Scale factor slider:**
- Horizontal slider with k-value label above.
- Phase 1: Display-only (shows current k, not interactive).
- Phase 2: Interactive (student can adjust, but rounds still guide specific k values).
- Snaps to specific values in guided rounds; continuous in exploration.

**Ray-from-origin lines:**
- Dashed lines, thin stroke. Animate from origin outward during reveal (GSAP timeline).
- One ray per vertex — 3 rays total.
- Color: subtle, not competing with triangle colors. Use lab token `--lab-text-dim` or similar.
- Appear during reveal, persist through completion, removed on next round entry.

**Ratio annotation engine:**
- Color-coded labels positioned at midpoint of each side.
- Each side pair (pre-image + image) shares a color.
- Format: "2:1" or "1:2" (image:pre-image ratio).
- Animate in after ray lines settle.

**Computed angle labels:**
- Positioned at each vertex, slightly offset.
- Rounded to nearest degree.
- Color-matched: equal angles across two triangles share a color. Non-matching angles get neutral/distinct colors.
- Small arc marks at vertices reinforce the angle location.

**FormulaReadout:**
- HTML overlay, positioned below or beside the canvas.
- Phase 2 early rounds: shows specific substitution, e.g., "(1,1) → (2,2)" and "(x,y) → (2x, 2y)".
- Phase 2 final round: generalizes to "(x,y) → (kx, ky)".
- Uses monospace font for coordinate values.

**SequenceBuilder (extended from M1):**
- Panel with step cards: Translate, Reflect, Rotate, **Dilate** (new).
- Each card is clickable to add to the sequence.
- Added steps appear in a vertical sequence list with configuration controls.
- Dilation step: scale factor input (slider or number input within the card).
- Live preview: ghost updates after each step is configured.
- "Check" button validates the full sequence.
- Reorder via drag. Remove via X button on each step.

**CelebrationModal:**
- Full-screen overlay with DiscoveryTab.
- DiscoveryTab: 4 sections mapping to the 4 phases — "Scale Factor Intuition" → "Coordinate Rule" → "Similarity" → "AA Criterion".
- Each section shows a key visual from that phase + the earned reveal statement.
- Close/Done button.

### Interaction Specifications

**Ghost drag:**
- Pointer down on ghost → drag starts. Ghost follows pointer position mapped to grid coordinates.
- Ghost snaps to nearest 0.5 grid unit (provides structure without over-constraining).
- Drop: ghost stays at last position. "Reveal" button activates.
- Re-drag: student can reposition before clicking Reveal.

**Reveal animation (GSAP):**
- Duration: ~1.5s total.
- Sequence: (1) Image triangle fades in at correct position. (2) Ray-from-origin lines animate outward (~0.5s). (3) Ghost fades out or shifts to show comparison. (4) Annotations animate in (ratios, angle marks).
- Easing: power2.out for spatial elements. Slight bounce on image landing.

**SequenceBuilder interaction:**
- Click step card → step added to sequence list.
- Configure: each step type has inline controls (translate: dx/dy inputs; reflect: axis selector; rotate: angle; dilate: k slider).
- Live preview: after each step configuration change, preview ghost updates via composed transformation.
- Check: button validates sequence. If figures align within tolerance → success animation. If not → mismatch highlighted (preview ghost shown alongside target, gap visible).

**Round navigation:**
- "Next" button appears after round completion.
- Phase transitions get a brief interstitial text (1-2 sentences framing the next phase).
- No "Back" button within a phase (rounds are sequential and build on each other). Phase-level navigation may exist for review.

### Stage Machine Configuration

**Phase 1 stage flow per round:**
```
ENTRY → ACTIVE (dragging) → PREDICTION (ghost placed) → REVEAL (animation) → COMPLETION → [Next]
```
Exception: `dilate-k2-properties` and `dilate-summary` skip ACTIVE/PREDICTION/REVEAL (observation and summary rounds):
```
ENTRY → ACTIVE (observing annotations) → COMPLETION → [Next]
```

**Phase 2 stage flow:** Same as Phase 1 prediction rounds.

**Phase 3-4 stage flow per round:**
```
ENTRY → ACTIVE (building sequence) → PREDICTION (sequence submitted) → REVEAL (validation animation) → COMPLETION → [Next]
```
Exception: `aa-discover` and `aa-confirm` are observation rounds:
```
ENTRY → ACTIVE (observing angle labels) → COMPLETION → [Next]
```
Exception: `capstone-final` loops through multiple pairs:
```
ENTRY → [per pair: ACTIVE → PREDICTION → REVEAL] → COMPLETION (CelebrationModal)
```

### Responsive Considerations

- **Desktop (primary):** Side-by-side canvas + controls. SequenceBuilder docked to right.
- **Tablet:** Canvas full-width, controls below. SequenceBuilder as collapsible bottom panel.
- **Mobile:** Not a primary target (R3F + drag interactions are desktop-first), but canvas scales down. Touch drag supported.

### Per-Round Visual Scaffolding Summary

| Round | Key Visual Elements |
|-------|-------------------|
| `dilate-k2` | Pre-image, ghost, origin marker, grid. Reveal: image + ray-from-origin lines |
| `dilate-k2-properties` | Both triangles + color-coded ratio annotations + angle marks |
| `dilate-k3` | Same as dilate-k2 but rays extend 3x. Ratio: 3:1 |
| `dilate-k-half` | Smaller ghost. Rays show half-distance. Ratio: 1:2 |
| `dilate-summary` | All three images shown together. Pattern text overlay |
| `coord-k2` | **Coordinates appear.** Vertex labels: pre-image and image coords. FormulaReadout: (x,y)→(2x,2y) |
| `coord-k-half` | FormulaReadout: (x,y)→(1/2 x, 1/2 y). Fractional coordinate labels |
| `coord-k-third` | FormulaReadout generalizes: (x,y)→(kx,ky) |
| `similarity-guided` | Two triangles, side length annotations, angle marks, SequenceBuilder panel |
| `similarity-rigid-dilation` | SequenceBuilder with all rigid motion + dilation options. Live preview ghost |
| `similarity-inverse` | Same as above, no guidance text. Success: similarity definition overlay |
| `aa-discover` | Computed angle labels at all vertices. Color-matched equal angles |
| `aa-confirm` | Angle labels in distinct/non-matching colors. SequenceBuilder fails |
| `capstone-final` | Multi-pair layout (sequential). All tools available. CelebrationModal on completion |
