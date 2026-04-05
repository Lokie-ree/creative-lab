# ISTE Visibility Sprint

## Status: Complete
> Implemented 2026-03-19. Merged as part of the ISTE hardening sprint (phase labels, synthesis-reveal guide state, 12 beat-indexed earned reveals, coordinate rule notation, congruence language in celebration).

**Goal:** Make the pedagogical architecture legible to an educator observing the app for 3–5 minutes — without requiring the lab guide.

**Constraint:** Copy and small UI changes only. No new phases, no new interactions, no architectural changes.

**Context:** Students are completing the full module and calling it "cool." Technical execution is validated. The gap is that the *why this works* is implicit — an educator watching can't see the standards alignment, the ALD progression, or the congruence punchline without the companion lab guide. At ISTE, the guide is a leave-behind, not a prerequisite.

**Skill references:** `educational-copywriter` for all copy. `philosophy.md` and `product.md` for alignment checks.

---

## The Reveal Sequence

Each transformation type (translate, reflect, rotate) follows a four-beat reveal sequence. Each beat earns one layer. They stack.

```
SPATIAL PREDICT 1 → Properties preserved     (8.G.A.1)
SPATIAL PREDICT 2 → Coordinate rule           (8.G.A.3)
COORD PREDICT 1  → Vertex-level observation   (L3→L4 bridge)
COORD PREDICT 2  → Rule + congruence (≅)      (8.G.A.2)
```

After all three transformation types complete:
```
SYNTHESIS BEAT   → All rigid motions → congruence  (8.G.A.2 summary)
CAPSTONE SETUP   → "Now prove it. Build a sequence."
```

This sequence means:
- ≅ does NOT appear in the spatial predict reveals (too early — student hasn't connected to coordinates yet)
- ≅ DOES appear at the end of each transformation type's coordinate round (earned through four beats)
- The synthesis beat ties all three together before the capstone

---

## Sprint Items

### VIS-01: Phase Label in Status Area

**What:** Add a visible phase indicator to the module UI that updates as students cross phase boundaries.

**Why:** An educator watching over a student's shoulder can't see that the module is intentionally structured. Phase labels make the L3→L4→L5 progression legible to observers.

**Copy:**
- `PHASE 01 · SPATIAL EXPLORATION`
- `PHASE 02 · PREDICT & REVEAL`
- `PHASE 03 · COORDINATE LAYER`
- `PHASE 04 · CAPSTONE`

**Design:** Lab-silk treatment, `--lab-text-muted` color, positioned in the existing status strip or header area. Should feel like a Eurorack panel label — not a progress bar, not a banner. Subtle enough that students aren't distracted; visible enough that an observer reads it.

**Files likely touched:**
- Status strip or header component in `src/components/modules/rigid-motions/`
- `useRigidMotionsState.ts` (phase derivation — may already be inferrable from current stage)

**Acceptance:** Phase label updates when crossing from predict rounds → coordinate rounds → capstone. Visible on both desktop and mobile.

---

### VIS-02: Layered Reveal Copy (Properties → Rule → Observation → Congruence)

**What:** Restructure the earned reveal copy so each round in the four-beat sequence reveals one new layer of understanding.

**Why:** The current reveals give the coordinate rule but don't land the 8.G.A.1 preservation punchline, the vertex-level coordinate observation, or the ≅ connection. This four-beat structure makes each reveal earn exactly one new idea, and they accumulate.

#### Translation Sequence

**Spatial Predict Round 1 — Properties preserved:**
- Copy direction: "Same distances. Same angles. Same shape, same size. Sliding preserves everything."
- Standard: 8.G.A.1 — properties of translations verified experimentally
- No coordinate rule yet. No ≅. The student earned the spatial insight.

**Spatial Predict Round 2 — Coordinate rule earned:**
- Copy direction: "(x, y) → (x + h, y + k)" + "Here's the rule for what you just did."
- Standard: 8.G.A.3 — describing translations using coordinates
- The formula is a label for a known idea.

**Coordinate Predict Round 1 — Vertex-level observation:**
- Copy direction: "Notice how each vertex shifted. The x-coordinates changed by ___, the y-coordinates by ___."
- Purpose: Bridge spatial → algebraic. The student predicted with coordinates; the reveal makes the pattern explicit at the vertex level.
- This is the L3→L4 boundary crossing.

**Coordinate Predict Round 2 — Rule + congruence:**
- Copy direction: "Sliding every vertex the same distance keeps all distances and angles intact."
- Then, in data font: `△ABC ≅ △A′B′C′`
- Then: "Same shape, same size — that's congruence."
- Standard: 8.G.A.2 — congruence defined through rigid motions
- ≅ appears HERE — earned through four beats.

#### Reflection Sequence

**Spatial Predict Round 1 — Properties preserved:**
- Copy direction: "Flipped, but same distances. Same angles. The mirror changed orientation, not the triangle."

**Spatial Predict Round 2 — Coordinate rule earned:**
- Copy direction (x-axis): "(x, y) → (x, −y)" / (y-axis): "(x, y) → (−x, y)"
- "The axis you cross? That coordinate flips. The other stays."

**Coordinate Predict Round 1 — Vertex-level observation:**
- Copy direction: "Look at each vertex. Which coordinate changed? Which stayed the same?"
- Purpose: Students see the sign flip at the vertex level.

**Coordinate Predict Round 2 — Rule + congruence:**
- Copy direction: "Flipping one coordinate mirrors the figure — but distances and angles? Unchanged."
- Data font: `△ABC ≅ △A′B′C′`
- "Still congruent."

#### Rotation Sequence

**Spatial Predict Round 1 — Properties preserved:**
- Copy direction: "Turned, but same distances. Same angles. Rotation preserves everything."

**Spatial Predict Round 2 — Coordinate rule earned:**
- Copy direction (90° CCW): "(x, y) → (−y, x)" / (180°): "(x, y) → (−x, −y)"
- "Here's the pattern in the coordinates."

**Coordinate Predict Round 1 — Vertex-level observation:**
- Copy direction: "Follow each vertex. How did (x, y) become the new coordinates?"

**Coordinate Predict Round 2 — Rule + congruence:**
- Copy direction: "Every vertex rotated the same angle around the origin. Distances and angles — preserved."
- Data font: `△ABC ≅ △A′B′C′`
- "Congruent. Every time."

#### Design Notes

- Preservation copy (Round 1): uses `--lab-text` color, warm prose voice
- Coordinate rule (Round 2): uses `--font-data` (JetBrains Mono), `--lab-accent` color
- Vertex observation (Round 3): uses `--lab-text` color, slightly more specific/technical than Round 1
- Congruence statement (Round 4): `△ABC ≅ △A′B′C′` in `--font-data`, `--lab-earned` (amber) for the ≅ symbol; supporting prose in `--lab-text`

**Files likely touched:**
- `rigid-motions-copy.ts` (all reveal strings)
- `FormulaReadout` or reveal display component (may need to support multi-line reveals with mixed font treatments)
- Round configuration in `round-generator.ts` (verify round IDs align with copy keys — this also addresses PED-02)

**Acceptance:**
- Each of the four beats per transformation type shows the correct layer
- ≅ appears ONLY in the fourth beat of each transformation type (not in spatial rounds)
- Copy reads as a natural accumulation when experienced in sequence
- Data font used for coordinate rules and ≅ notation; prose font for everything else

---

### VIS-03: Synthesis Beat + Capstone Setup

**What:** After all three transformation types are complete (all 12 predict rounds done), show a synthesis moment before the capstone begins.

**Why:** The student has now seen ≅ three times — once per transformation type. The synthesis beat ties the bow: all three rigid motions produce congruent figures. Then the capstone setup reframes the task as "prove it."

**Copy direction:**

Synthesis:
- "Translations, reflections, and rotations. Three different moves — one result."
- Data font: `△ABC ≅ △A′B′C′` (one final time)
- "Every rigid motion preserves distances and angles. Every one produces congruence."

Capstone setup:
- "Now build a sequence. Two transformations, one proof."
- Or: "You've mastered each move. Now combine them."

**Design:** This could be a transition screen between the coordinate rounds and the capstone — similar to the Phase 3 coordinate-reveal transition that already exists. Or it could be the entry prompt for the capstone stage with enriched copy. Evaluate which pattern fits the existing flow better.

**Tone:** The synthesis is authoritative — naming the Big Idea. The capstone setup is a challenge invitation. Together they should feel like the moment before the final boss in a game: here's everything you've learned, now use it.

**Files likely touched:**
- `rigid-motions-copy.ts` (new copy keys)
- `useRigidMotionsState.ts` (if a new transition state is needed between coordinate rounds and capstone)
- Possibly a new transition component, or reuse the existing coordinate-reveal transition pattern

**Acceptance:**
- Synthesis moment appears exactly once, after all rotation rounds complete and before capstone begins
- Uses the word "congruence" and shows ≅
- Capstone setup copy frames the task as a challenge, not an instruction
- Transition feels earned and climactic, not interstitial

---

### VIS-04: Capstone Celebration — Congruence Justification

**What:** Update the capstone celebration modal to explicitly state that the student justified congruence by describing a sequence of rigid motions.

**Why:** The capstone page in the lab guide asks "Why are the original and final triangles congruent?" The celebration modal is the natural place to answer that question — at the moment of triumph. This surfaces 8.G.A.2 in student language.

**Copy direction** (draft):
- `"You proved △ABC ≅ △A″B″C″ by describing a sequence of rigid motions."`
- Or: `"You built a sequence that maps one triangle to the other. Same distances, same angles — congruent."`

**Tone:** Celebratory but precise. The student just did something at Level 5. Name it.

**Files likely touched:**
- `CelebrationModal` or `DiscoveryTab` in `src/components/celebration/`
- `rigid-motions-copy.ts` (if `CAPSTONE_COMPLETION_COPY` is the source)

**Acceptance:** Capstone celebration explicitly uses the word "congruent" and connects it to the sequence the student built. Feels like a reward, not a lecture.

---

## Implementation Notes

### Order of operations
1. **VIS-02** (layered reveal copy — largest item, touches copy file and reveal component)
2. **VIS-03** (synthesis + capstone setup — depends on VIS-02 copy being in place)
3. **VIS-01** (phase labels — independent, can be done in parallel)
4. **VIS-04** (capstone celebration — independent)

### What this sprint does NOT include
- No new interaction mechanics or round types (the four-beat sequence uses the existing spatial + coordinate predict rounds)
- No journaling or written-response layer inside the app
- No changes to Phase 1 exploration gameplay
- No lab guide integration into the app itself
- No PED-04 commitment-before-feedback changes (deferred until three modules exist)

### Relationship to existing backlog
- **PED-02 (completion copy alignment):** VIS-02 requires verifying copy keys match round IDs from `round-generator.ts` and `capstone-utils.ts`. Address PED-02 as part of VIS-02 implementation.
- **PED-03 (earned reveal pacing):** VIS-02 completely replaces the generic reveal copy with the layered sequence. Mark PED-03 as resolved after this sprint.
- **ALD alignment audit:** VIS-01 phase labels + VIS-02 layered reveals together make the L3→L4→L5 boundaries explicit and auditable. Mark as substantially addressed.
- **PED-01 (capstone entry copy):** VIS-03's capstone setup copy addresses the entry prompt. The "post-miss hint for non-commutativity" portion of PED-01 remains separate.
- **Coordinate-reveal passive gap:** The four-beat sequence (especially coordinate predict rounds 1+2) directly addresses this — students predict with coordinates before earning ≅. Mark as resolved.

### ISTE exhibit hall test
After this sprint, an educator walking up should be able to:
1. See the phase label and understand this is structured, not freeform
2. Watch a predict/reveal cycle and see the feedback loop
3. See the earned reveal land properties first, then coordinate rule — layered, not dumped
4. See ≅ appear after the coordinate rounds — earned, not given
5. Hear the synthesis: "All rigid motions produce congruence"
6. Watch the capstone celebration name congruence explicitly

That's the "3-minute legibility" bar.