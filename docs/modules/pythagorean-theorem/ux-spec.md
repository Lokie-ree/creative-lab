# Pythagorean Theorem Module — UX Spec

**Module:** M3
**Date:** April 12, 2026
**Status:** In progress (6-pass)

---

## Pass 1: Mental Model

What the student *believes to be true* at each phase boundary. This is not about what's on screen — it's about the conceptual state inside the student's head.

---

### Before Module Entry

The student knows what a right triangle is. They know what area means. They may have heard "a² + b² = c²" but do not understand *why* it's true or what the letters refer to geometrically. They likely think of it as an arbitrary formula to memorize.

They have completed Rigid Motions (M1) and Dilations (M2), so they are comfortable with coordinate grids, triangle vertices, and the earned-reveal interaction pattern. They trust that the module will show them something, not quiz them.

---

### Phase 1 Entry → Phase 1 Exit

**Entry belief:** "There are squares drawn on the sides of a triangle. I can count the small squares inside them. I don't know why they're there."

**Round 1 (3-4-5):** The student counts 9 squares on one leg, 16 on the other. They're asked to predict how many will fill the hypotenuse square. They guess — maybe 25, maybe not. The reveal shows the leg-square units rearranging into the hypotenuse square. 9 + 16 = 25. "Huh, it added up."

**Round 2 (5-12-13):** Same setup, bigger numbers. 25 + 144 = 169. "It added up again. Is this always true?"

**Round 3 (Properties pause):** No prediction. The module surfaces the pattern explicitly. Earned reveal: a² + b² = c².

**Exit belief:** "When you draw squares on the sides of a right triangle, the two smaller areas always add up to the biggest one. That's what a² + b² = c² means — it's about actual areas of actual squares."

**Critical shift:** The formula has *geometric meaning*. a² isn't "a times a" in the abstract — it's the area of a real square you can see and count.

---

### Phase 2 Entry → Phase 2 Exit

**Entry belief:** "a² + b² = c² works for right triangles. The squares add up."

**Round 1 (6-8-10, right):** 36 + 64 = 100. Confirmed. "Still works."

**Round 2 (5-6-9, non-right):** 25 + 36 = 61, but the biggest square has area 81. It doesn't add up. "Wait — this one doesn't work. What's different?" The student notices the triangle doesn't have a right angle.

**Round 3 (8-15-17, right):** 64 + 225 = 289. Confirmed again. "So it only works when there's a right angle."

**Exit belief:** "The area relationship is specific to right triangles. If the squares add up, it's a right triangle. If they don't, it isn't. The formula is a *test* for right triangles, not just a description."

**Critical shift:** The converse. The student now holds the theorem in both directions — the forward statement (right triangle → areas add up) and the backward test (areas add up → right triangle).

---

### Phase 3 Entry → Phase 3 Exit

**Entry belief:** "a² + b² = c² tells me about areas. I can verify it by counting squares."

**Round 1 (find hypotenuse, 3-4-5):** "I know 9 + 16 = 25, and √25 = 5. The longest side is 5." This is the familiar triple from Phase 1 — the student recognizes it. The squares are still visible as scaffolding.

**Round 2 (find hypotenuse, 6-8-10):** 36 + 64 = 100, √100 = 10. Confidence building.

**Round 3 (find a leg, 5-?-13):** "The hypotenuse square is 169. One leg square is 25. So the other is 169 − 25 = 144, and √144 = 12." This is the inversion — the student rearranges the formula for the first time.

**Round 4 (find a leg, 6-?-10):** Confirms the rearrangement. 100 − 36 = 64, √64 = 8.

**Exit belief:** "I can use the relationship to find ANY missing side, not just the hypotenuse. The formula works both ways. If I know two sides, I can always find the third."

**Critical shift:** From observation tool to computation tool. The student moves from "I can see this" to "I can use this to find things I can't see."

---

### Phase 4 Entry → Phase 4 Exit

**Entry belief:** "a² + b² = c² lets me find missing sides of right triangles."

**Round 1 (points at (1,1) and (4,5)):** The student sees two points on a grid. The prompt asks for the distance. The grid reveals: horizontal distance = 3, vertical distance = 4. "Wait — 3 and 4. That's the 3-4-5 triangle." The right triangle is visible between the two points. Distance = 5.

**Round 2 ((0,0) and (5,12)):** 5 and 12. The student recognizes 5-12-13. Distance = 13.

**Round 3 ((2,1) and (8,9)):** 6 and 8. Recognizes 6-8-10. Distance = 10.

**Exit belief:** "The distance between any two points on a grid is the hypotenuse of a right triangle. The legs are just the horizontal and vertical differences. I've been using the same relationship this entire time — from counting squares to finding distances."

**Critical shift:** Abstraction. The physical squares are gone. The right triangle is *implied* by the coordinate system. The student is now applying the theorem without the visual scaffolding that built their understanding. The concept has transferred from concrete to abstract.

---

### Celebration

**What the student holds in their mind at completion:**

1. The Pythagorean Theorem is about real areas of real squares — not an arbitrary formula.
2. It works only for right triangles (and that's how you test for them).
3. It lets you find any missing side.
4. The distance between two coordinate points is just the hypotenuse of a hidden right triangle.

These four beliefs map directly to the four phases. Each phase added exactly one conceptual layer. Nothing was front-loaded. The formula appeared after the understanding, not before.

---

### Mental Model Risk Register

| Risk | Phase | Mitigation |
|------|-------|------------|
| Student memorizes "add the two smaller numbers" without connecting to area | Phase 1 | The squares are *literal geometry*, not abstract numbers. Area labels appear on the squares, not in a formula strip. |
| Student doesn't notice the non-right triangle in Phase 2 | Phase 2 | The mismatch is the moment. The earned reveal names it explicitly. The triangle's non-right angle should be visually distinct (no right-angle marker). |
| Student struggles with √ in Phase 3 | Phase 3 | All values are perfect squares with clean integer roots. The module never asks for √2 or any irrational result. If needed, the area squares remain visible to connect "area 144" → "side 12." |
| Student doesn't see the hidden right triangle in Phase 4 | Phase 4 | The construction step explicitly has the student identify the horizontal and vertical legs before computing distance. The right triangle is drawn on screen (dashed lines), not left to imagination. |
| Student arrives thinking "I already know a² + b² = c²" | Phase 1 entry | The module doesn't ask "do you know the formula." It asks "how many squares will fit?" — reframing the known formula as a spatial prediction they haven't made before. |

---

## Pass 2: Information Architecture

What is visible on screen at each phase, what is hidden, and what unlocks permanently. This pass defines the *information layering* — not the layout (that's visuals, after all 6 passes).

---

### Screen Regions (ModuleLayout Slot Contract)

Carrying forward from M1/M2:

| Slot | Content |
|------|---------|
| `statusStrip` | Back chevron + module title (desktop) + LED progress dots |
| `prompt` | Phase label + round prompt text |
| `formulaReadout` | Earned formula display (hidden until unlocked) |
| `visualization` | R3F Canvas — triangle, squares, coordinate grid |
| `controls` | Prediction input, CHECK/NEXT/CONTINUE buttons |

---

### Information Layers & Visibility Flags

Three one-way visibility flags (M2 pattern — once true, never reverts):

| Flag | Flips true at | Effect |
|------|--------------|--------|
| `formulaVisible` | Phase 1, Round 3 (properties pause) | FormulaReadout slot becomes active; shows a² + b² = c² |
| `converseVisible` | Phase 2, Round 3 completion | FormulaReadout appends converse statement |
| `coordinatesVisible` | Phase 4, Round 1 entry | Coordinate axis labels and point labels appear on grid |

**Why three flags, not one:** Each flag represents a *conceptual unlock*, not a UI toggle. The formula doesn't appear until the student has seen the relationship twice. The converse doesn't appear until the non-right triangle has broken the pattern. Coordinates don't appear until they're needed. This is the earned-reveal philosophy applied to persistent UI.

---

### Phase-by-Phase: What's On Screen

#### Phase 1: Visual Proof

**Always visible:**
- Right triangle (white fill, vertex labels A, B, C)
- Square on side a (leg) — grid-lined, with area count label (e.g., "9")
- Square on side b (leg) — grid-lined, with area count label (e.g., "16")
- Square on side c (hypotenuse) — outlined but empty/ghosted until reveal
- Right-angle marker at the 90° vertex

**Visible during round:**
- Prompt: "How many unit squares will fill the largest square?"
- Prediction input (numeric)
- CHECK button (enabled after input)

**Visible after reveal:**
- Hypotenuse square fills with grid — area label appears (e.g., "25")
- Area equation below triangle: "9 + 16 = 25" (concrete, not symbolic)
- Earned reveal copy (round-specific)
- NEXT button

**Unlocked at Phase 1 exit (Round 3):**
- `formulaVisible = true`
- FormulaReadout shows: a² + b² = c²
- Area equation shifts from concrete ("9 + 16 = 25") to annotated ("a² + b² = c² → 9 + 16 = 25") for subsequent phases

**Hidden:**
- Coordinate grid (no axes, no numbered grid lines — just unit squares inside the squares on the triangle sides)
- Converse language
- Distance formula

---

#### Phase 2: Converse & Non-Right Triangles

**Always visible:**
- Triangle (may or may not be right — right-angle marker present only if it's a right triangle)
- Squares on all three sides with grid + area labels
- FormulaReadout: a² + b² = c² (earned in Phase 1)

**Visible during round:**
- Prompt: "Do the two smaller areas add up to the largest?"
- Two-part prediction: YES/NO toggle + numeric input for predicted largest area
- CHECK button

**Visible after reveal:**
- Area equation showing the actual sum vs. the actual largest area
- Match: "25 + 36 = 61 ≠ 81 — The areas don't add up." (for non-right)
- Match: "64 + 225 = 289 = 289 — The areas add up." (for right)
- Visual feedback: squares flash green (match) or amber (mismatch)
- Earned reveal copy
- NEXT button

**Unlocked at Phase 2 exit (Round 3):**
- `converseVisible = true`
- FormulaReadout appends: "If a² + b² = c², then it's a right triangle."

**Hidden:**
- Coordinate grid
- Side-length solving UI
- Distance formula

---

#### Phase 3: Unknown Side Lengths

**Always visible:**
- Right triangle with right-angle marker
- Squares on all three sides
- Two sides labeled with known lengths (the third is marked "?")
- Known squares show grid + area label
- Unknown square outlined/ghosted (same treatment as Phase 1 hypotenuse before reveal)
- FormulaReadout: a² + b² = c² (+ converse)

**Visible during round:**
- Prompt: "Find the missing side length." (Rounds 1–2: hypotenuse. Rounds 3–4: leg.)
- Numeric input for the missing side length
- CHECK button
- Optional scaffolding line in prompt: "The areas of the known squares are __ and __."

**Visible after check:**
- Unknown square fills with grid — area label appears
- Area equation with all three values
- Side length confirmed next to the "?" label
- Earned reveal copy
- NEXT button

**Unlocked:** Nothing new — this phase uses the tools earned in Phases 1–2.

**Hidden:**
- Coordinate grid
- Distance formula
- YES/NO toggle (Phase 2 only)

---

#### Phase 4: Coordinate Distance

**Always visible:**
- Coordinate grid with numbered axes (one-way flip: `coordinatesVisible = true`)
- Two points plotted on grid (labeled with coordinates)
- FormulaReadout: a² + b² = c² (+ converse)

**Visible during round — Step 1 (Construct):**
- Prompt: "What right triangle connects these two points?"
- Dashed horizontal line from point A extending right/left
- Dashed vertical line from point B extending up/down
- The right-angle vertex (intersection) highlighted on confirm
- CONFIRM button (locks the construction)

**Visible during round — Step 2 (Solve):**
- Right triangle now solid (legs labeled with lengths derived from coordinate differences)
- Prompt: "What is the distance between the two points?"
- Numeric input for the distance
- CHECK button

**Visible after check:**
- Distance label on the hypotenuse segment
- Area equation: "3² + 4² = 5² → distance = 5"
- Earned reveal copy
- NEXT button (or FINISH on final round)

**Unlocked at Phase 4 exit:**
- Celebration modal
- Final earned reveal ties the full arc together

---

### LED Progress Dots

Following M1/M2 pattern: one dot per round, grouped by phase.

| Phase | Rounds | Dots |
|-------|--------|------|
| Phase 1 | 3 | ●●● |
| Phase 2 | 3 | ●●● |
| Phase 3 | 4 | ●●●● |
| Phase 4 | 3 | ●●● |
| **Total** | **13** | |

Dot states: ghost (upcoming), accent (active), green (complete). Phase dividers between groups.

---

### FormulaReadout Progression

The FormulaReadout slot is the persistent earned-formula display. It builds up across phases:

| After | Content |
|-------|---------|
| Phase 1, Round 3 | `a² + b² = c²` |
| Phase 2, Round 3 | `a² + b² = c²` — and the converse |
| Phase 3 | Same (no new formula — application of existing) |
| Phase 4, Round 3 | `d = √((x₂−x₁)² + (y₂−y₁)²)` — distance formula as the capstone reveal |

The distance formula in Phase 4 is the *final* earned formula. It appears only after the student has computed coordinate distances three times using the Pythagorean Theorem manually. The formula is notation for what they already did.

---

### Information That Never Appears

- Abstract proof notation (∀, ∃, QED)
- The word "theorem" in prompts (it appears only in the earned reveal and FormulaReadout)
- Side labels "a, b, c" before Phase 1 Round 3 — sides are labeled with actual lengths until the formula unlocks
- Coordinate labels before Phase 4
- Any formula before the student has observed the relationship it describes

---

## Pass 3: Affordances

What can the student interact with, how do they know they can interact with it, and what feedback do they get? This pass catalogs every touchable/typable element and its signifiers.

---

### Interaction Inventory

M3 has a narrower interaction surface than M1/M2. No ghost drag, no sequence builder, no flip/rotation controls. The core interactions are:

1. **Numeric input** (Phases 1–4)
2. **YES/NO toggle** (Phase 2 only)
3. **Construction confirm** (Phase 4, Step 1)
4. **Buttons** (CHECK, NEXT, CONTINUE, FINISH)

This is deliberate. The cognitive work is in *observing and computing*, not in manipulating geometry. The interaction surface stays minimal so the student's attention stays on the math.

---

### 1. Numeric Input

**Where:** Controls slot (outside Canvas — HTML, not R3F).

**Appearance:**
- Eurorack-styled input field: `--lab-bg` background, `--lab-accent` border on focus, `--lab-text` value, `--lab-data-font` (monospace)
- Placeholder text shows the unit context: "squares" (Phase 1), "units" (Phases 3–4)
- Large tap target: `min-h-[48px]`, full width of controls area on mobile
- Numeric keyboard on mobile: `inputMode="numeric"` + `pattern="[0-9]*"`

**Signifiers:**
- Blinking cursor on focus
- Border shifts from `--lab-ghost` (unfocused) to `--lab-accent` (focused)
- Prompt text directly above input: "How many unit squares?" / "What is the missing side length?" / "What is the distance?"

**Feedback:**
- Input accepts integers only (all answers in M3 are integers — Pythagorean triples)
- No real-time validation while typing — validation happens on CHECK
- Empty input: CHECK button stays disabled
- Non-numeric input: prevented by `inputMode` and `pattern`

**Commit model:** Value is committed on CHECK press, not on blur or Enter. This matches M1/M2's pattern — the student makes a deliberate choice to submit. However, Enter key also triggers CHECK as a keyboard affordance.

---

### 2. YES/NO Toggle

**Where:** Controls slot, Phase 2 only. Above the numeric input.

**Appearance:**
- Two pill-shaped buttons side by side: "YES" and "NO"
- Eurorack styling: `--lab-surface` default, `--lab-accent` when selected, `--lab-text` label
- 44px minimum height per pill
- Only one can be selected (radio behavior)

**Signifiers:**
- Neither selected on round entry — both in default state
- Selected pill gets `--lab-accent` background + `--lab-text` foreground
- Deselected pill returns to default

**Feedback:**
- Selection is instant (no animation needed — it's a binary choice)
- CHECK button enables only when BOTH the toggle has a selection AND the numeric input has a value
- The toggle answers "Do the areas add up?" and the input answers "What is the largest area?"

**Why a toggle, not just the number?** The prediction has two parts: (1) does the relationship hold, and (2) what's the actual value. The toggle forces the student to commit to a *belief* about the relationship before entering a number. This is the converse discovery — the "no" option exists so the student can predict that the areas won't add up for non-right triangles.

---

### 3. Construction Confirm (Phase 4, Step 1)

**Where:** Visualization (Canvas) + Controls slot.

**What it is:** In Phase 4, before solving for distance, the student confirms the right triangle formed between two coordinate points. This is a guided construction, not free-form.

**Appearance in Canvas:**
- Two points rendered as dots (`--lab-accent` fill, labeled with coordinates)
- Dashed line connecting the two points (the hypotenuse-to-be) in `--lab-ghost`
- On entry: dashed horizontal and vertical guide lines extending from each point, forming the potential right-angle vertex at their intersection
- The intersection point rendered as a small open circle in `--lab-ghost`

**Interaction:**
- The construction is *automatic* — the student doesn't draw the lines. The module shows the horizontal/vertical decomposition.
- The student reviews and presses CONFIRM in the controls slot
- CONFIRM is a deliberate pause, not a quiz. The student is meant to *see* the right triangle before computing. The module is saying: "Look — here's the right triangle hiding between these two points."

**Feedback on CONFIRM:**
- Dashed lines become solid (`--lab-accent`)
- Right-angle marker appears at the intersection vertex
- Leg lengths appear as labels on the horizontal and vertical segments
- Prompt transitions from "What right triangle connects these two points?" to "What is the distance between the two points?"
- Controls transition from CONFIRM button to numeric input + CHECK

**Why not make the student draw the triangle?** Three reasons: (1) Drawing on a grid is a motor skill test, not a math skill test. (2) The pedagogical goal is recognition — "oh, THAT'S a right triangle" — not construction. (3) Free-form drawing in R3F adds significant interaction complexity for no pedagogical gain. The construction confirm is a recognition check with zero motor overhead.

---

### 4. Buttons

All buttons follow M1/M2 Eurorack styling: `--lab-accent` background, `--lab-bg` text, 44px minimum touch target, `min-w-[120px]`.

| Button | When Visible | Enabled When | Action |
|--------|-------------|-------------|--------|
| CHECK | After prediction input | Input is non-empty (+ toggle selected in Phase 2) | Commits prediction, triggers reveal |
| NEXT | After round completion reveal | Always (when visible) | Advances to next round, records earned reveal key |
| CONTINUE | Phase transition pauses (Round 3 properties, Phase 2 Round 3 converse) | After dwell timer (similar to M2's 1.4s pattern) | Advances past observation pause |
| CONFIRM | Phase 4, Step 1 | Always (when visible) | Locks construction, transitions to solve step |
| FINISH | Phase 4, final round, after check | Always (when visible) | Triggers celebration modal |

**Button state rules:**
- Only one primary action button visible at a time (never CHECK and NEXT simultaneously)
- Disabled buttons show `--lab-ghost` color, enabled show `--lab-accent`
- CONTINUE uses same dwell-timer pattern as M2 to prevent tap-through — student must look at the reveal for at least 1.4s

---

### 5. Scene Affordances (Non-Interactive)

The R3F Canvas is **not interactive** in M3. No drag, no tap-on-shape, no pointer events on geometry. The Canvas is a visualization surface only. All interaction happens in the HTML controls slot.

This is a departure from M1 (drag ghost) and M2 (drag ghost + tap chips). It's correct for M3 because:
- The prediction is a number, not a position
- The visual proof animation is something to watch, not something to control
- Phase 4's construction confirm is a recognition task, not a spatial task

**Exception:** If we later decide the Phase 4 construction should be interactive (student taps the intersection point to confirm it), that's a Canvas interaction. Flagging now for the State Design pass. Current spec: CONFIRM button in HTML controls, no Canvas interaction.

---

### Affordance Summary by Phase

| Phase | Canvas Interactive? | Controls |
|-------|-------------------|----------|
| Phase 1 | No | Numeric input → CHECK → NEXT |
| Phase 2 | No | YES/NO toggle + Numeric input → CHECK → NEXT |
| Phase 3 | No | Numeric input → CHECK → NEXT |
| Phase 4 | No (guided viz only) | CONFIRM → Numeric input → CHECK → NEXT/FINISH |

---

### Accessibility Affordances

Carrying forward from M2's `useAccessibility`:
- Screen reader announcements (`role="status"`, `aria-live="assertive"`) on: check result, earned reveal, phase transition
- Haptic feedback (80ms vibrate) on: correct prediction
- All interactive elements meet 44px minimum touch target
- Numeric input: `aria-label` describes what value is expected
- YES/NO toggle: `role="radiogroup"` with `aria-checked` per option
- LED dots: `aria-label="Round N of M, phase P"` (not interactive — status only)
- Focus management: after CHECK, focus moves to earned reveal or NEXT button. After NEXT, focus moves to prompt or input for next round.

---

## Pass 4: Cognitive Load

At any moment, the student is holding some number of things in working memory. This pass audits each phase to ensure we stay within bounds — roughly 3–4 active items at a time — and identifies where the module offloads cognition to the screen vs. demanding it from the student.

---

### Cognitive Load Principle

The module's job is to put the *relationship* in working memory, not the *data*. Side lengths, area values, and coordinates should always be visible on screen. The student's brain should be occupied with "how do these numbers relate?" — never with "wait, what was that number?"

---

### Phase 1: Visual Proof

**On screen (offloaded):**
- Triangle with labeled sides
- Squares with visible grid lines
- Area count labels on each square (e.g., "9", "16")

**In working memory:**
- "The two smaller areas might add up to the bigger one" (the hypothesis being tested)
- The sum: 9 + 16 = ? (simple arithmetic)

**Load: 2 items.** This is intentionally low. Phase 1 is about *seeing*, not computing. The grid lines let the student count instead of calculate. The cognitive work is forming the hypothesis, not crunching numbers.

**Risk:** Near zero. The only computation is addition of two visible numbers. Even a struggling student can count grid squares.

---

### Phase 2: Converse & Non-Right Triangles

**On screen (offloaded):**
- Triangle (with or without right-angle marker)
- Squares on all three sides with area labels
- FormulaReadout: a² + b² = c² (earned in Phase 1)

**In working memory:**
- "Does this triangle have a right angle?" (visual check — right-angle marker present or absent)
- "Do the areas add up?" (the prediction)
- The sum vs. the largest area (e.g., 25 + 36 = 61 vs. 81)

**Load: 3 items.** The new element is the *conditional* — sometimes the relationship holds, sometimes it doesn't. The student now holds the hypothesis AND its negation simultaneously.

**Risk: Moderate.** The non-right triangle round (Round 2) is the highest-load moment in Phase 2. The student must notice the missing right-angle marker, predict that the areas won't add up, and compute both the sum and the largest area. Mitigation: the area labels are always visible, so the arithmetic is simple comparison, not memory retrieval. The YES/NO toggle externalizes the conditional — the student commits to "no" before doing the math, which reduces load during computation.

---

### Phase 3: Unknown Side Lengths

**On screen (offloaded):**
- Right triangle with right-angle marker
- Two known side lengths + their squares with area labels
- Unknown side marked "?" + its square ghosted
- FormulaReadout: a² + b² = c²

**In working memory:**
- Which side is unknown (hypotenuse vs. leg)
- The relationship: a² + b² = c²
- The computation: either sum two areas and take √, or subtract and take √

**Load: 3 items.** But the *type* of cognition shifts. Phases 1–2 were observation + prediction. Phase 3 is formula application. The student is now doing algebra (even if simple), which uses a different cognitive channel than visual pattern recognition.

**Risk: Moderate.** The hardest moment is Round 3, where the student must *rearrange* the formula to solve for a leg instead of the hypotenuse. They go from a² + b² = c² to a² = c² − b². Mitigation: the squares are still visible on screen. The student can see that the hypotenuse square (area 169) minus one leg square (area 25) leaves room for the other leg square (area 144). The visual scaffolding makes the rearrangement concrete rather than algebraic.

**Key design decision:** Do NOT remove the squares in Phase 3. They are the scaffolding that keeps the cognitive load manageable during formula application. The squares disappear only in Phase 4, after the student has practiced with them present.

---

### Phase 4: Coordinate Distance

**Step 1 — Construction Confirm:**

**On screen (offloaded):**
- Coordinate grid with numbered axes
- Two labeled points
- Dashed guide lines showing the horizontal/vertical decomposition
- Intersection point visible

**In working memory:**
- "The horizontal and vertical distances form the legs of a right triangle"
- "The line between the two points is the hypotenuse"

**Load: 2 items.** The construction step is low-load by design. The module draws the triangle; the student just confirms they see it.

**Step 2 — Solve:**

**On screen (offloaded):**
- Right triangle with solid legs, labeled with lengths
- Coordinate points with labels
- FormulaReadout: a² + b² = c²

**In working memory:**
- The two leg lengths (now visible — but the student must connect them to the Pythagorean relationship)
- The computation: square both, add, take √
- "The answer is the distance between the points"

**Load: 3 items.** Comparable to Phase 3 — the student is applying the formula. The new cognitive element is the *context transfer*: "I'm not finding a side of a triangle anymore, I'm finding a distance." But because Step 1 explicitly constructed the triangle, the transfer is supported.

**Risk: Moderate.** The highest-load moment is Round 1 of Phase 4 — the first time the student encounters coordinate distance. They're holding the new context (coordinates) + the old tool (Pythagorean Theorem) + the computation. Mitigation: Round 1 uses the 3-4-5 triple, which the student has seen three times already. The numbers are familiar; only the context is new. One new thing at a time.

---

### Cross-Phase Cognitive Load Curve

```
Load
 4 |
   |          ■                ■
 3 |    ■  ■  ■  ■     ■ ■ ■  ■  ■ ■ ■
   |    ■  ■  ■  ■     ■ ■ ■  ■  ■ ■ ■
 2 | ■  ■  ■           ■      ■
   | ■  ■  ■           ■      ■
 1 | ■                  ■
   |_______________________________________
     P1  P1  P1   P2   P3     P4
     R1  R2  R3  R1-3  R1-4  R1-3
```

The curve rises gradually: low in Phase 1 (counting), moderate in Phase 2 (conditional reasoning), sustained moderate in Phase 3 (formula application), and moderate with a context shift in Phase 4 (coordinate transfer). No single moment exceeds 3–4 items.

**The deliberate dip:** Phase 4 Step 1 (construction confirm) is a load reset. After the sustained computation of Phase 3, the student gets a visual recognition task before re-engaging the formula. This prevents fatigue at the hardest conceptual transition.

---

### Load Offloading Strategies

| Strategy | Implementation |
|----------|---------------|
| **All numbers visible** | Area labels, side lengths, and coordinate values are always on screen. The student never needs to remember a number. |
| **Squares as scaffolding** | The area squares make a² concrete. The student sees "area 9" not "3 squared." The squaring operation is offloaded to geometry. |
| **Familiar triples** | Reusing 3-4-5 across phases means the student recognizes the numbers. Recognition is cheaper than computation. |
| **One new thing per phase** | Phase 1: the relationship. Phase 2: the converse. Phase 3: solving for unknowns. Phase 4: coordinates. Never two new concepts in the same phase. |
| **YES/NO toggle externalizes the conditional** | In Phase 2, the student commits to a belief (yes/no) before computing. This splits one complex judgment into two simpler ones. |
| **Construction confirm as a load reset** | Phase 4 Step 1 is visual recognition, not computation. It gives the student a breath before the final computation rounds. |
| **FormulaReadout as external memory** | The earned formula is always visible once unlocked. The student doesn't need to recall a² + b² = c² — it's on screen. |

---

### Red Flags to Watch in Testing

| Signal | Indicates | Response |
|--------|-----------|----------|
| Student enters random numbers in Phase 1 | Not engaging with the visual — counting squares isn't landing | Consider adding a pulse/highlight to the grid lines in the leg squares to draw attention to countability |
| Student always selects YES in Phase 2 | Not noticing the absent right-angle marker | Make the non-right triangle's angles more obviously acute/obtuse; consider a brief prompt: "Look closely at the angles" |
| Student consistently misses Round 3–4 in Phase 3 | Formula rearrangement is too abstract | Add a transient scaffolding label: "hypotenuse area − leg area = ?" to bridge the subtraction step |
| Student stalls at Phase 4 Step 2 | Context transfer failed — they see coordinates but not the Pythagorean connection | The construction confirm should be doing this work. If it's not enough, add leg labels that read "3 units (horizontal)" / "4 units (vertical)" to emphasize that these are the legs |

---

## Pass 5: State Design

The state machine: every field, every action, every transition. Follows M2's `useReducer` + `startRound()` pattern.

---

### Round Definitions

13 rounds, each with a unique `RoundId`. Grouped by phase.

```ts
type PhaseId = 'visual-proof' | 'converse' | 'unknown-sides' | 'coord-distance'

type RoundId =
  // Phase 1: Visual Proof
  | 'proof-345'            // 3-4-5 triple, predict hypotenuse area
  | 'proof-51213'          // 5-12-13 triple, predict hypotenuse area
  | 'proof-properties'     // Properties pause — earned reveal: a² + b² = c²
  // Phase 2: Converse
  | 'converse-6810'        // 6-8-10 right triangle, confirm relationship
  | 'converse-569'         // 5-6-9 non-right triangle, relationship breaks
  | 'converse-81517'       // 8-15-17 right triangle, confirm again
  // Phase 3: Unknown Sides
  | 'solve-hyp-345'        // Find hypotenuse, legs 3 & 4
  | 'solve-hyp-6810'       // Find hypotenuse, legs 6 & 8
  | 'solve-leg-51213'      // Find leg, hypotenuse 13 & leg 5
  | 'solve-leg-6810'       // Find leg, hypotenuse 10 & leg 6
  // Phase 4: Coordinate Distance
  | 'coord-345'            // Points (1,1)→(4,5), distance 5
  | 'coord-51213'          // Points (0,0)→(5,12), distance 13
  | 'coord-6810'           // Points (2,1)→(8,9), distance 10

const ROUND_SEQUENCE: RoundId[] = [
  'proof-345', 'proof-51213', 'proof-properties',
  'converse-6810', 'converse-569', 'converse-81517',
  'solve-hyp-345', 'solve-hyp-6810', 'solve-leg-51213', 'solve-leg-6810',
  'coord-345', 'coord-51213', 'coord-6810',
]
```

### Round Configuration

```ts
interface RoundConfig {
  id: RoundId
  phase: PhaseId
  type: 'predict-area' | 'converse-predict' | 'solve-side' | 'coord-distance' | 'properties-pause'
  triangle: TriangleDef           // vertices, side lengths, areas, isRight
  unknownSide?: 'a' | 'b' | 'c'  // Phase 3 only: which side to solve for
  coordPoints?: [Vec2, Vec2]      // Phase 4 only: the two coordinate points
  answer: number                  // correct numeric answer
  converseAnswer?: boolean        // Phase 2 only: does the relationship hold?
}
```

---

### State Shape

```ts
interface PythagoreanState {
  // Round tracking
  currentRound: RoundId
  roundIndex: number               // index into ROUND_SEQUENCE (0–12)
  roundState: RoundState

  // Visibility flags (one-way, never revert)
  formulaVisible: boolean
  converseVisible: boolean
  coordinatesVisible: boolean

  // Student input
  numericInput: string             // raw input string (parsed on CHECK)
  converseToggle: boolean | null   // Phase 2: YES/NO selection, null = no selection

  // Phase 4 construction
  constructionConfirmed: boolean   // Phase 4: has student confirmed the right triangle

  // Feedback
  feedbackState: FeedbackState
  feedbackMessage: string | null   // "That's it!" / "Not quite — try again."

  // Earned reveals
  shownReveals: Set<string>        // round IDs already revealed

  // Completion
  showCelebration: boolean
}
```

### Round State Lifecycle

```ts
type RoundState = 'entry' | 'active' | 'checking' | 'reveal' | 'completion'
type FeedbackState = 'idle' | 'correct' | 'incorrect'
```

**Prediction rounds (Phase 1 predict-area, Phase 3 solve-side):**
```
entry → active → checking → reveal → completion
                     ↑ (CHECK pressed, answer evaluated)
                     ↓ incorrect: feedbackState='incorrect', stays in 'active'
                     ↓ correct: feedbackState='correct', → 'reveal'
```

**Converse rounds (Phase 2):**
```
entry → active → checking → reveal → completion
                     ↑ (CHECK pressed, both toggle + numeric evaluated)
                     ↓ incorrect: stays in 'active'
                     ↓ correct: → 'reveal'
```

**Properties pause (Phase 1, Round 3) and converse reveal (implicit in Phase 2, Round 3):**
```
entry → completion
         ↑ (CONTINUE pressed after dwell timer)
```

**Coordinate distance (Phase 4):**
```
entry → active(construct) → active(solve) → checking → reveal → completion
              ↑ CONFIRM pressed          ↑ CHECK pressed
              ↓ constructionConfirmed     ↓ incorrect: stays in active(solve)
                = true                    ↓ correct: → 'reveal'
```

Phase 4 reuses `roundState = 'active'` for both sub-steps. The `constructionConfirmed` flag distinguishes construct vs. solve within the active state. This avoids adding a new RoundState value for a single phase.

---

### Actions

```ts
type PythagoreanAction =
  // Round lifecycle
  | { type: 'ADVANCE_ROUND' }                    // move to next round in sequence
  | { type: 'START_ROUND'; round: RoundId }       // jump to specific round
  | { type: 'SET_ROUND_STATE'; state: RoundState } // direct transition

  // Student input
  | { type: 'SET_NUMERIC_INPUT'; value: string }
  | { type: 'SET_CONVERSE_TOGGLE'; value: boolean }

  // Phase 4 construction
  | { type: 'CONFIRM_CONSTRUCTION' }

  // Evaluation
  | { type: 'CHECK_ANSWER' }                      // evaluate current input against answer
  | { type: 'COMPLETE_ROUND' }                    // → completion (after reveal animation)

  // Earned reveals
  | { type: 'RECORD_REVEAL'; key: string }        // record that a reveal has been shown
```

---

### Reducer Logic (Key Transitions)

#### `ADVANCE_ROUND`
```
1. Record current reveal key if not already recorded
2. Increment roundIndex
3. If roundIndex >= ROUND_SEQUENCE.length → set showCelebration = true, return
4. Call startRound(ROUND_SEQUENCE[roundIndex])
```

#### `startRound(roundId)` (reset helper, M2 pattern)
```
1. Set currentRound = roundId
2. Set roundState = 'entry'
3. Set feedbackState = 'idle'
4. Set feedbackMessage = null
5. Clear numericInput = ''
6. Clear converseToggle = null
7. Clear constructionConfirmed = false
8. Apply one-way visibility flags:
   - formulaVisible = formulaVisible || roundId === 'proof-properties'
   - converseVisible = converseVisible || roundId === 'converse-81517' (flips on Phase 2 final round completion, but checked here as safety)
   - coordinatesVisible = coordinatesVisible || phase === 'coord-distance'
```

Note: `converseVisible` actually flips in `COMPLETE_ROUND` for `converse-81517`, not in `startRound`. The OR gate in `startRound` is a safety net — if the student somehow reaches a later round without the flag, it still flips. This matches M2's defensive pattern.

#### `CHECK_ANSWER`
```
1. Parse numericInput as integer
2. Get current round config
3. Evaluate:
   - predict-area / solve-side: parsed === config.answer
   - converse-predict: converseToggle === config.converseAnswer AND parsed === config.answer
   - coord-distance: parsed === config.answer (construction already confirmed)
4. If correct:
   - feedbackState = 'correct'
   - feedbackMessage = progressive feedback string
   - roundState = 'reveal'
   - trigger reveal animation (GSAP timeline for area fill / side confirmation)
5. If incorrect:
   - feedbackState = 'incorrect'
   - feedbackMessage = 'Not quite — try again.'
   - roundState stays 'active'
   - clear numericInput (let student re-enter)
```

#### `CONFIRM_CONSTRUCTION` (Phase 4 only)
```
1. Assert current phase is 'coord-distance'
2. Assert roundState === 'active' and constructionConfirmed === false
3. Set constructionConfirmed = true
4. Trigger construction animation (dashed → solid, leg labels appear)
   (roundState stays 'active' — sub-step transition, not state transition)
```

#### `COMPLETE_ROUND`
```
1. Set roundState = 'completion'
2. If currentRound === 'proof-properties': formulaVisible = true
3. If currentRound === 'converse-81517': converseVisible = true
4. feedbackState = 'idle' (reset for next round)
```

---

### Derived State (Computed in Component, Not in Reducer)

```ts
// Current phase
const phase = ROUND_CONFIGS[state.currentRound].phase

// Current round config
const roundConfig = ROUND_CONFIGS[state.currentRound]

// Is this the first time seeing this round's earned reveal?
const earnedReveal = EARNED_REVEALS[state.currentRound]
const isFirstReveal = state.roundState === 'completion'
  && !!earnedReveal
  && !state.shownReveals.has(state.currentRound)

// Phase 4: which sub-step?
const isConstructStep = phase === 'coord-distance'
  && state.roundState === 'active'
  && !state.constructionConfirmed

const isSolveStep = phase === 'coord-distance'
  && state.roundState === 'active'
  && state.constructionConfirmed

// CHECK enabled?
const checkEnabled =
  phase === 'converse'
    ? state.numericInput !== '' && state.converseToggle !== null
    : state.numericInput !== ''

// Is properties pause?
const isPropertiesPause = state.currentRound === 'proof-properties'
  && state.roundState === 'entry'

// Is final round?
const isFinalRound = state.roundIndex === ROUND_SEQUENCE.length - 1
```

---

### Reveal Animation Triggers

Reveal animations are GSAP timelines triggered by `roundState` transitioning to `'reveal'`. The animation type depends on the round:

| Round type | Animation |
|-----------|-----------|
| `predict-area` | Leg square units decompose and flow into hypotenuse square; hypotenuse grid + area label fade in |
| `converse-predict` (right) | All squares flash `--lab-accent` briefly; equation appears with "=" |
| `converse-predict` (non-right) | Squares flash `--lab-earned` (amber); equation appears with "≠" |
| `solve-side` | Unknown square fills with grid; side length label replaces "?" |
| `coord-distance` | Distance label fades in on hypotenuse segment; equation appears |
| `properties-pause` | FormulaReadout animates in (fade + slide, M2 pattern) |

All animations call `COMPLETE_ROUND` on timeline completion. The student cannot interact during the reveal — controls are hidden.

---

### State vs. M2 Comparison

| Aspect | M2 (Dilations) | M3 (Pythagorean) |
|--------|----------------|-------------------|
| State manager | `useReducer` | `useReducer` (same) |
| Round count | 14 | 13 |
| RoundState values | 5: entry, active, prediction, reveal, completion | 5: entry, active, checking, reveal, completion |
| Visibility flags | 2: coordinatesVisible, angleLabelsVisible | 3: formulaVisible, converseVisible, coordinatesVisible |
| Input type | Ghost position (Vec2) | Numeric string + boolean toggle |
| Canvas interaction | Drag + chip tap | None |
| Construction sub-step | N/A | Phase 4: constructionConfirmed boolean |
| Feedback | Match/miss via centroid distance | Correct/incorrect via exact integer comparison |
| Sequence builder | Yes (Phase 3–4) | No |

The state shape is simpler than M2. Fewer interactive elements = fewer state fields. The reducer has fewer actions. This is the right complexity for a module whose cognitive work is in observation and computation, not spatial manipulation.

---

## Pass 6: Flow Integrity

Every way the student could get stuck, confused, or break the flow. Edge cases, error recovery, dead ends, and the paths between them.

---

### Entry & Exit

**Module entry:** Student arrives from Constellation screen. `startRound('proof-345')` initializes state. All visibility flags false. FormulaReadout slot empty. Scene renders Phase 1 Round 1 triangle with squares.

**Module exit (normal):** After `coord-6810` completion, `ADVANCE_ROUND` detects `roundIndex >= ROUND_SEQUENCE.length`, sets `showCelebration = true`. `CelebrationModal` renders. `onComplete({ phases: 4, rounds: 13 })` fires up to App.tsx.

**Module exit (abandon):** Back chevron or Escape key at any point. No save state — restarting the module begins from `proof-345`. This matches M1/M2 behavior. No partial progress persistence.

**Risk:** A student who abandons at Phase 3 loses all progress. Acceptable for a 13-round module that takes ~10–15 minutes. If STEM Club testing shows students consistently abandoning mid-module, revisit this — but don't build persistence infrastructure preemptively.

---

### Input Validation Edge Cases

#### Numeric Input

| Input | Handling |
|-------|----------|
| Empty string | CHECK disabled. Cannot submit. |
| Leading zeros ("007") | Parse with `parseInt` — treated as 7. Acceptable. |
| Negative numbers ("-5") | `inputMode="numeric"` + `pattern="[0-9]*"` prevents minus sign on mobile. Desktop: `parseInt` yields `-5`, which will never match a correct answer (all answers are positive integers). Normal incorrect flow. |
| Decimal ("5.5") | Pattern restricts to digits on mobile. Desktop: `parseInt("5.5")` yields `5`. If 5 is the answer, it matches. If not, normal incorrect flow. Acceptable — we don't penalize sloppy typing. |
| Very large numbers ("99999") | Parsed normally. Will not match any answer. Normal incorrect flow. No overflow risk — all answers ≤ 17. |
| Non-numeric ("abc") | `parseInt("abc")` yields `NaN`. `NaN !== answer` → incorrect. Feedback: "Not quite — try again." No crash. |
| Pasted content | Same parsing. Non-numeric → NaN → incorrect. Acceptable. |

**Design decision:** No input masking or real-time rejection beyond `inputMode`/`pattern`. The CHECK button is the validation gate. This keeps the input simple and avoids fighting browser behavior across devices.

#### YES/NO Toggle (Phase 2)

| State | Handling |
|-------|----------|
| Neither selected | CHECK disabled. Cannot submit. |
| Toggle selected, input empty | CHECK disabled. Both required. |
| Toggle selected, input filled | CHECK enabled. |
| Student changes toggle after initial selection | Allowed. No penalty. The toggle is a radio group — selecting YES deselects NO and vice versa. |

---

### Incorrect Answer Paths

**Behavior on incorrect:** `feedbackState = 'incorrect'`, feedback message appears ("Not quite — try again."), `numericInput` clears, student re-enters. No limit on attempts.

**Unlimited retries — why?** This matches M1/M2's philosophy. The module is not a quiz. The student is discovering, not being tested. An attempt limit would punish exploration. A struggling student who tries 5 times and finally sees "9 + 16 = 25" has still earned the reveal.

**Phase 2 incorrect — partial credit?** No. Both the toggle AND the number must be correct. If the student selects YES but enters 61 (the actual sum) for the non-right triangle round, that's incorrect — the relationship doesn't hold, so YES is wrong regardless of the number. The feedback doesn't specify which part was wrong: "Not quite — try again." This forces the student to reconsider both their belief and their computation.

**Why not tell them which part was wrong?** The educational copywriter principle: hints invite closer observation, they don't diagnose. "Not quite" prompts re-examination. "Your YES/NO was wrong" shortcircuits the discovery.

---

### Phase Transition Boundaries

| Transition | Trigger | What Happens |
|-----------|---------|--------------|
| Phase 1 → Phase 2 | NEXT on `proof-properties` completion | `formulaVisible` already true. `startRound('converse-6810')`. Scene transitions to Phase 2 triangle. |
| Phase 2 → Phase 3 | NEXT on `converse-81517` completion | `converseVisible` flips true in `COMPLETE_ROUND`. `startRound('solve-hyp-345')`. YES/NO toggle disappears from controls. |
| Phase 3 → Phase 4 | NEXT on `solve-leg-6810` completion | `startRound('coord-345')`. `coordinatesVisible` flips true. Scene transitions to coordinate grid with points. Squares on triangle sides no longer rendered. |
| Phase 4 → Celebration | FINISH on `coord-6810` completion | `showCelebration = true`. |

**Phase transition animations:** Scene content cross-fades between phases. The triangle + squares from the previous round fade out (GSAP opacity 0, 300ms), then the new round's geometry fades in (GSAP opacity 0→1, 300ms). No jarring cuts. This is handled in the scene layer, not the reducer.

**Phase label updates:** The `prompt` slot shows a phase label that changes at each boundary: "VISUAL PROOF" → "CONVERSE" → "UNKNOWN SIDES" → "COORDINATE DISTANCE". These follow M1's `PHASE_LABELS` pattern.

---

### Properties Pause Flow (Phase 1, Round 3)

This round has no prediction. It's a passive reveal — the module surfaces the formula.

```
entry: 
  - Prompt: "You've seen this twice. Every time, the two smaller areas added up to the largest."
  - Scene shows all three rounds' triangles side by side (or a summary view with equations)
  - FormulaReadout animates in: a² + b² = c²
  - CONTINUE button appears after 1.4s dwell timer
  
completion (on CONTINUE):
  - Records reveal key
  - ADVANCE_ROUND → Phase 2
```

**Why the dwell timer?** Same rationale as M2's observation pauses. The student must sit with the formula for at least 1.4 seconds before advancing. Prevents tap-through without reading.

**Edge case — student navigates away during dwell:** Back chevron still active. Student can abandon. No special handling needed.

---

### Phase 4 Construction Sub-Step Edge Cases

| Scenario | Handling |
|----------|----------|
| Student presses CONFIRM immediately without looking | Allowed. The construction is visual scaffolding, not a quiz. The module draws the right triangle — CONFIRM acknowledges it. Rushing past it just means less scaffolding for the solve step. |
| Student presses back during construction | Normal abandon flow. No special handling. |
| Screen resize during construction | `constructionConfirmed` persists. Dashed/solid line state is derived from the flag, not from animation state. Resize causes camera recompute (useFrame), geometry re-renders correctly. |

---

### Reveal Animation Interruption

**What if the student presses back during a reveal animation?**

The reveal animation (GSAP timeline) runs for ~800ms–1.2s depending on the type. During this time, controls are hidden. The back chevron is the only interactive element.

If the student presses back:
1. GSAP timeline is killed (`timeline.kill()` in useEffect cleanup)
2. Module unmounts normally
3. No partial state persists

**What if the browser loses focus during reveal?**

GSAP timelines pause when the tab is backgrounded (GSAP's default `requestAnimationFrame` behavior). When the tab regains focus, the animation resumes from where it paused. No special handling needed.

---

### WebGL Context Loss

Carrying forward from M1's `ContextRecovery` component:
- `webglcontextlost`: Prevent default, show a "Reconnecting..." overlay
- `webglcontextrestored`: Force re-render, clear overlay
- All geometry is in `useMemo` with `useEffect` cleanup — reconstruction after context restore is automatic

M3 has less WebGL complexity than M1/M2 (no draggable geometry, no pointer events on Canvas), so context loss is less likely but still handled.

---

### Device & Viewport Edge Cases

| Scenario | Handling |
|----------|----------|
| Portrait phone | Single-column layout. Visualization slot gets primary vertical space. Controls slot at bottom. Prompt above visualization. Formula readout between prompt and visualization. |
| Landscape phone | Two-column if width permits, otherwise single-column. Same slot order. |
| Tablet | Comfortable single-column or two-column. No special handling beyond responsive layout. |
| Desktop | Two-column: visualization left, prompt + controls right. FormulaReadout below visualization. |
| Device rotation mid-round | Camera frustum recomputes in `useFrame`. Layout CSS handles slot repositioning. `roundState` and all input state preserved — no re-render issues. |
| Very small viewport (<320px width) | Area labels on squares may overlap. Mitigation: label font size scales with viewport (SpriteLabel already handles this). If overlap persists, labels shift to outside-square positions. Flag for visual spec. |

---

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Enter | Triggers CHECK (when enabled) or NEXT/CONTINUE/FINISH (when visible) |
| Escape | Back navigation (module exit) |
| Tab | Standard focus order: input → toggle (Phase 2) → CHECK/NEXT/CONTINUE |
| 0–9 | Numeric input (when input focused) |

**No arrow key interaction.** M1/M2 used arrow keys for ghost nudge. M3 has no draggable elements, so arrow keys follow default browser behavior (scroll, input cursor movement).

---

### Dead End Audit

A dead end is any state where no action is available to the student (no buttons, no input, no way forward).

| Potential Dead End | Can It Happen? | Prevention |
|-------------------|---------------|------------|
| Round with no controls visible | Only if `roundState` is not mapped to a control set | Every `roundState` value maps to a specific control configuration in the component. `entry` → CONTINUE (for pause rounds) or auto-transition to `active`. `active` → input + CHECK. `reveal` → no controls (animation playing). `completion` → NEXT/FINISH. No unmapped states. |
| Phase 4 active with constructionConfirmed stuck false | Only if CONFIRM button fails to render | CONFIRM renders whenever `isConstructStep` is true (derived state). As long as the derivation is correct, the button appears. |
| CHECK disabled forever | Only if input validation logic has a bug | CHECK enabled = `numericInput !== ''` (+ toggle for Phase 2). Straightforward boolean. Unit test this. |
| Properties pause with CONTINUE never appearing | Only if dwell timer fails | Timer is a `setTimeout` in `useEffect`. If it fires, CONTINUE appears. If the effect cleanup runs first (unmount), no dead end — module is exiting. |
| Final round FINISH never appearing | Only if `isFinalRound` derivation is wrong | `isFinalRound = roundIndex === ROUND_SEQUENCE.length - 1`. Unit test the sequence length. |

**Verdict:** No dead ends in the design. Every state has a forward path. The simplicity of the interaction model (no chip rail, no drag, no sub-pairs) means there are far fewer states to audit than M1 or M2.

---

### Error Recovery Summary

| Error | Recovery |
|-------|----------|
| Wrong answer | Unlimited retries, input clears, encouraging feedback |
| WebGL context lost | ContextRecovery component, auto-restore |
| Browser tab backgrounded | GSAP pauses/resumes automatically |
| Device rotation | Camera recomputes, layout re-flows, state preserved |
| Module abandon | Back chevron / Escape, no partial save, restart from beginning |
| JavaScript error in reducer | React error boundary at module level catches, shows recovery UI (existing pattern) |

---

### Flow Integrity Checklist

- [ ] Every `roundState` value maps to a control configuration
- [ ] Every phase transition flips the correct visibility flags
- [ ] `startRound()` resets all per-round state (input, toggle, construction, feedback)
- [ ] `ADVANCE_ROUND` handles end-of-sequence → celebration
- [ ] Dwell timer cleanup runs on unmount
- [ ] GSAP timeline cleanup runs on unmount
- [ ] All 13 rounds appear in `ROUND_SEQUENCE` in correct order
- [ ] `EARNED_REVEALS` has an entry for every round that should show a reveal
- [ ] `ROUND_CONFIGS` has an entry for every `RoundId`
- [ ] Numeric parsing handles NaN gracefully
- [ ] Focus management: after CHECK → NEXT or input; after NEXT → prompt or input