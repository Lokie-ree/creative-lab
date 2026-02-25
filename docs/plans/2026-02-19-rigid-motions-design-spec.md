# Rigid Motions Module — Design Specification v2

**Date:** February 19, 2026  
**Status:** Draft — Implementation-ready (supersedes v1, February 12, 2026)  
**Revision:** Shape family simplified to scalene triangle; module roadmap confirmed; implementation details added (component interfaces, match scoring, animations, mockup validation).  
**Standards:** 8.G.A.1, 8.G.A.2, 8.G.A.3  
**Course:** Grade 8 Mathematics  
**ALD Target:** Level 3 entry → Level 4 primary → Level 5 capstone  

**Related documentation:** [philosophy.md](../philosophy.md) (discovery-first pedagogy) · [product.md](../product.md) (LSSM alignment) · [design/README.md](../design/README.md) (Eurorack system) · [mockups/RigidMotions.jsx](../../mockups/RigidMotions.jsx) (module mockup exemplar).

---

## Why This Document Exists

Version 1 of this design was grounded in the sinewaves module pattern and aimed broadly at Geometry course standards. After working through the Grade 8 and Geometry ALDs, the standards alignment in [product.md](../product.md), and grade-level curriculum expectations, the target was sharpened. This version is built from the standards up, with the R3F scene treated as the primary pedagogical instrument rather than a canvas for a UI pattern.

Three decisions made before this spec was written:

1. **Grade 8 scope only.** Rotations are constrained to the origin. Reflections are constrained to the x-axis and y-axis. These are the exact constraints the standard specifies — not simplifications, but the spec.
2. **Dilations are out.** They belong to a subsequent similarity module. Their absence keeps the congruence earned reveal clean.
3. **Level 5 capstone is an inverse task.** The main module asks students to predict the image given a transformation. The capstone asks students to identify the transformation given both figures. Same mathematics, opposite direction of reasoning.

---

## Core Question

> "What stays the same when a shape moves?"

This question drives every design decision. The answer — distances and angle measures are preserved — is the definition of a rigid transformation and the foundation of congruence. Students don't receive this answer. They discover it by repeatedly predicting transformation outputs and observing what the reveal confirms.

---

## Shape Design Rationale

A single shape family is used across the entire module: the **scalene triangle**. This decision was made deliberately against the v1 approach of using multiple shape types (L-shape, arrow, T-shape, Z-shape) at different stages.

**Why a single shape family.** Changing shapes between stages introduces a variable that isn't the learning target. When a student moves from the L-shape to the arrow, some of the cognitive work goes into reading a new shape rather than deepening understanding of the transformation. A consistent shape lets the student focus entirely on what the transformation does, not on parsing a new figure.

**Why triangles specifically.** The Grade 8 cluster leads directly into dilations and similarity, which are almost universally taught through triangle similarity. The Pythagorean Theorem is defined on right triangles. Using triangles in this module means the shape vocabulary carries forward — students aren't learning new geometric objects in the next two modules, they're discovering new properties of a familiar one. The scalene triangle introduced here becomes the triangle that gets dilated in module 2 and whose right-triangle variant is the instrument in module 3.

**Why scalene specifically.** A scalene triangle — no equal sides, no equal angles — is asymmetric in all positions. It cannot be confused with its reflection or rotation by shape alone, which is essential for the predict-reflect and predict-rotate stages. An isosceles triangle can look like its own reflection across a bisecting axis. An equilateral triangle has rotational symmetry that makes 120° rotations identical to the original. Scalene eliminates both problems.

**The one exception.** The capstone uses an irregular quadrilateral as an alternate shape for sequences where the scalene triangle's three-vertex structure would make a two-step sequence ambiguous to identify. This is one shape in one context — not a new shape family, just a tool for a specific capstone scenario.

---

## ALD Alignment

The Grade 8 Congruence & Similarity cluster (8.G.A.1–8.G.A.4) has a clear progression across achievement levels. This module targets three of the four standards in the cluster and is designed to move students across the following ALD boundaries:

| Level | What the student can do | How this module gets them there |
|---|---|---|
| **L3 — Entry** | Describes effect of individual transformations on figures without coordinates. Determines congruence. | Predict & Reveal loop with no coordinate readout. Student reasons spatially. |
| **L4 — Primary target** | Describes effect of transformations on figures **with coordinates**. Determines congruence through one or more transformations. | Coordinate readouts activate mid-module. Student sees how vertex coordinates change and connects that to the transformation rule. |
| **L5 — Capstone** | Describes a **sequence of transformations** to justify congruence of two figures. | Inverse task: two figures given simultaneously, student builds and names the sequence that maps one onto the other. |

**Note on dilations:** The Level 4 ALD includes dilations. This module does not cover them. A student completing this module will have satisfied the rigid transformation portion of Level 4 but will need the subsequent similarity module to fully satisfy the cluster at Level 4.

### ALD performance evidence (quick reference)

| Interaction | ALD level | Evidence produced |
|-------------|-----------|-------------------|
| Predict translation/reflection/rotation without coordinates | L3 | Spatial reasoning only; congruence via transformation |
| Predict with coordinate readouts active | L4 | Connects spatial prediction to coordinate change |
| Build two-step sequence in capstone | L5 | Describes sequence to justify congruence |

---

## The R3F Scene

The scene is the instrument. Everything else — the ControlStrip, the FormulaReadout, the earned reveals — is in service of what the scene makes visible. The design principle aligns with grade-level practice: students often learn this content by folding paper over axes, pinning paper at the origin to rotate it, and sliding paper by hand. Each physical action makes a geometric constraint tangible. The scene replaces those physical manipulatives with digital equivalents that are more precise, more readable, and — critically — able to show coordinate values.

### Permanent scene elements

**The coordinate grid** is always visible, always labeled. Major gridlines every unit, axis labels on both x and y axes in `lab-data-font`. The origin is visually distinct — slightly brighter intersection, small dot. The grid is not a backdrop. It is the measurement instrument students are learning to read.

**The pre-image shape** is always visible once a stage begins. Rendered in solid `--lab-text` (`#b8b0a4`). Vertices labeled A, B, C in `lab-data-font`. Coordinate labels (e.g., `A (1, 1)`) appear at each vertex — initially small and muted, becoming prominent when the coordinate layer activates at the Level 4 transition. This is the shape students are working with. The term "pre-image" is introduced as an earned reveal, not upfront.

### Transformation constraint elements

These are the elements that make geometric constraints physically visible. They are the direct digital equivalents of the paper-folding and pencil-pinning exercises.

**Translation vector** — visible during predict-translate stage. As the student drags the ghost shape, a vector arrow renders from the pre-image centroid to the ghost centroid, live-updating with direction and grid-unit magnitude. Styled in `--lab-ghost` dashed, with an arrowhead. The vector makes the displacement constraint visible: every point moves by the same amount in the same direction.

**Reflection axis** — visible during predict-reflect stage. Always either the x-axis or y-axis, styled with a slightly elevated stroke weight in `--lab-ghost`. When the student places the ghost, perpendicular distance tick marks render from each pre-image vertex to the axis and from each ghost vertex to the axis, showing the equidistance property. If the ghost is placed at the wrong distance from the axis, the tick mark pairs are visibly unequal lengths — the student can see the error without being told.

**Rotation arc** — visible during predict-rotate stage. When the student sets the rotation angle, arc segments render from each pre-image vertex, sweeping the correct angular distance around the origin to their rotated positions. The arcs share a common center (origin), making the constant-radius property impossible to miss. Each point on the shape travels the same arc length. This is what the pencil-pinned-to-the-origin exercise is teaching — the scene makes it visible without the physical constraint.

### The ghost shape

The ghost is the student's prediction. It is the interactive element in the main module.

- Rendered in `--lab-accent` (`#7cc87c`) at 50% opacity with dashed outline
- Snaps to grid intersections on drag
- Vertex labels update to A′, B′, C′ (prime notation); reading "A prime" is required vocabulary and is introduced at the coordinate reveal
- Coordinate labels at each vertex update live as the ghost moves — initially hidden, visible once the coordinate layer activates
- Position is set by dragging on the canvas
- Reflection (flip) and rotation are set via ControlStrip controls, not canvas manipulation

### The image shape (post-reveal)

After CHECK with a successful match:

- The source shape animates along the transformation path to the correct position (~600ms)
- The animated shape settles as a solid `--lab-accent` shape, pulsing once on arrival
- Both the pre-image and image remain visible simultaneously — this is deliberate. The student should see both figures at rest together before advancing. This is the visual that underpins the congruence determination at Level 4.
- Vertex labels on the image use prime notation: A′, B′, C′

After CHECK with a miss:

- The source shape animates to the *correct* position, not the ghost position
- A dashed line connects each misplaced ghost vertex to its correct landing position
- The ghost remains visible alongside the correct image so the student can compare
- No score, no penalty — the gap is information, not judgment

---

## Interaction Model: Predict & Reveal

The student proves understanding by predicting, not by watching. Every geometry tool shows what a transformation does. This one asks the student to show what it does.

**The loop:**

1. **Present** — Pre-image shape on coordinate grid. Prompt in PromptReadout describes the transformation in plain language: `TRANSLATE · 4 RIGHT, 2 UP`. No formal notation. No coordinate rules yet.
2. **Predict** — Ghost copy appears over the pre-image. Student drags it to their predicted position. Reflection and rotation set via ControlStrip. Ghost snaps to grid intersections. Transformation constraint element activates (vector, axis ticks, or arcs) as they interact.
3. **Check** — Student taps CHECK. Reveal animation plays from the pre-image along the transformation path.
4. **Feedback** — Three outcomes:
   - **Match** (within threshold): Image settles on ghost, both pulse green. Earned insight fires. Stage advances.
   - **Close** (position correct, orientation wrong, or vice versa): "Check the orientation" or "Check the position." Ghost stays. Try again.
   - **Miss** (significant error): Image animates to correct position. Gap lines render. Nudge offered. Try again.
5. **Retry** — Reposition ghost, resubmit. No penalty. The instrument is patient.

---

## Guide States

Six states. The watch state was removed from v1 — per [philosophy.md](../philosophy.md), the student engages with the challenge first rather than watching a demonstration. The coordinate layer activates as a mid-module reveal rather than being present from the start.

```
predict-translate → predict-reflect → predict-rotate → [coordinate reveal] → predict-with-coordinates → capstone
```

| State | What happens | Coordinate layer | Shapes |
|---|---|---|---|
| **predict-translate** | Predict position after translation. No orientation change — easiest entry. Translation vector visible as student drags. | Hidden | Scalene triangle (default) |
| **predict-reflect** | Predict position after reflection over x or y axis. Orientation reverses. Axis ticks show equidistance. | Hidden | Scalene triangle |
| **predict-rotate** | Predict position after rotation (90°, 180°, 270°) about origin. Rotation arcs visible. | Hidden | Scalene triangle |
| **coordinate reveal** | Earned reveal moment. FormulaReadout surfaces the coordinate rule for the transformation the student just mastered. Coordinates activate on both shapes. Not a new interaction — a formalization of what was already understood. | **Activates** | — |
| **predict-with-coordinates** | Predict & Reveal loop continues, now with coordinate readouts live on both shapes. Student connects spatial prediction to coordinate change. Composed sequences introduced (e.g., reflect then translate). | Active | Scalene triangle |
| **capstone** | Inverse task. Both pre-image and image shown simultaneously. Student identifies and names the sequence. See Capstone section below. | Active | Scalene triangle (primary) · irregular quadrilateral (alternate) |

**Stage unlock:** 2 successful predictions per stage before advancing. No streak requirement — 2 total, not 2 consecutive.

**Regression:** If a student misses 3 times in a row on predict-with-coordinates or capstone, the constraint element (ticks, arcs, or vector) becomes more prominent — not a mode change, just a visual emphasis increase. The instrument helps, it doesn't lock.

---

## The Coordinate Reveal

This is the Level 3 → Level 4 boundary moment. It happens after the student has successfully predicted at least one of each transformation type without coordinates.

The FormulaReadout surfaces the coordinate rule in `lab-data-font`, styled like an earned instrument readout:

| After mastering... | Coordinate rule revealed |
|---|---|
| Translations | `(x, y) → (x + a, y + b)` with the student's actual values substituted |
| Reflections over y-axis | `(x, y) → (−x, y)` |
| Reflections over x-axis | `(x, y) → (x, −y)` |
| Rotations 90° CW | `(x, y) → (y, −x)` |
| Rotations 180° | `(x, y) → (−x, −y)` |
| Rotations 270° CW | `(x, y) → (−y, x)` |

The framing in the FormulaReadout copy: *"What you just did — here's the rule."* The coordinate notation is a label for something the student already demonstrated understanding of spatially. Not a new concept introduced — a formalization of an existing one.

After this reveal, the coordinate labels activate on both shapes in the scene. A at (1, 1) and A′ at (5, 1) are now visible and readable. The student sees their spatial reasoning confirmed in coordinate language.

---

## Earned Reveal Arc

| After mastering... | Student discovers... |
|---|---|
| Translations | Every point moves the same direction and distance. The shape doesn't change — only its position. |
| Reflections | Every point is the same distance from the axis as its image. Distances and angles are preserved — but left and right swap. |
| Rotations | Every point sweeps the same arc around the origin. Distances and angles are preserved — orientation is preserved too. |
| Coordinate reveal | The coordinate rule for each transformation. Notation as a label for understood behavior. |
| All three rigid motions | *"These three motions — translations, reflections, rotations — never distort a shape. When one figure can be mapped onto another by any sequence of these motions, the figures are congruent."* The word "congruent" is earned here. |
| Pre-image / Image | The terms "pre-image" and "image" are introduced as precise vocabulary for what the student has been calling "the original shape" and "the ghost." |

---

## The Capstone Task (Level 5)

The capstone is the inverse of the Predict & Reveal loop. The student is no longer told what transformation to perform and asked to predict the image. Instead, they are shown both the pre-image and the image simultaneously and asked to identify and describe the sequence that maps one onto the other.

This is the ALD Level 5 task: *"describes a sequence of transformations to justify congruence of two figures."*

### Scene state

Both the pre-image and image are rendered simultaneously on the grid, fully labeled, with coordinate readouts active. No ghost shape. No dragging. The student reads the coordinate plane as evidence.

The pre-image is in `--lab-text`. The image is in `--lab-accent` at full opacity, styled distinctly from the ghost — this is a confirmed figure, not a prediction. Both sets of vertex coordinates are readable.

### Interaction

The ControlStrip becomes a sequence builder. Two transformation slots are visible:

```
STEP 1: [type selector] [parameters]
STEP 2: [type selector] [parameters]  ← unlocks after Step 1 is set
```

Type selector options: TRANSLATE / REFLECT / ROTATE

Parameters appear based on type:
- TRANSLATE: direction and magnitude inputs (grid units)
- REFLECT: axis selector (X-AXIS / Y-AXIS)
- ROTATE: degree selector (90° / 180° / 270°) + direction (CW / CCW)

### Live preview

As the student sets Step 1, a **preview ghost** renders on the scene showing the intermediate position — where the pre-image would be after Step 1 alone. This ghost is styled differently from the prediction ghost in the main module: slightly dimmer, with an "intermediate" label. It updates in real time as parameters change.

When Step 2 is set, the preview ghost updates to show the cumulative result — the position after both steps. The student can see whether their sequence is tracking toward the image before submitting.

This live preview is the pedagogical heart of the capstone. It externalizes the student's reasoning step by step and makes the two-step sequence feel tractable rather than abstract.

### FormulaReadout as sequence artifact

As the student builds the sequence, the FormulaReadout renders their description as structured text in `lab-data-font`:

```
REFLECT · OVER Y-AXIS
THEN TRANSLATE · 3 RIGHT, 2 UP
```

This is the "description" the ALD is asking for. It is not free text — it is a structured artifact built from the student's control interactions. When CHECK is hit, the reveal animation plays the sequence they described step by step, confirming whether it maps the pre-image onto the image.

### Feedback

- **Match:** Sequence is confirmed. Both figures pulse. The FormulaReadout sequence persists as the final earned artifact. The congruence statement fires: *"These two figures are congruent. You just described why."*
- **Miss:** The preview ghost and the image are both visible. The gap between them is the evidence. A nudge points to which step is off: *"Step 1 looks right — check Step 2."*

### Capstone scope

Sequences are capped at two steps. One-step sequences are valid. The capstone generates targets that are achievable with a single reflection, single rotation, or a two-step combination (reflect + translate, rotate + translate). Reflect + rotate and rotate + reflect sequences are excluded — they require arbitrary-center transformations to feel intuitive, which exceeds Grade 8 scope.

---

## Controls

The canvas handles position (drag). The panel handles transformation type and orientation. These are never mixed.

| Control | Component | Purpose | Visible in |
|---|---|---|---|
| **CHECK** | `button` | Submit prediction or sequence | All states |
| **RESET** | `button` (`--lab-danger`) | Reset ghost to starting position | All predict states |
| **SPEED** | `toggle-group` (0.5× / 1× / 2×) | Reveal animation speed | All predict states |
| **FLIP** | `toggle` | Mirror ghost for reflections | predict-reflect, predict-with-coordinates, capstone |
| **ROTATION** | `toggle-group` (90° / 180° / 270°) | Set ghost rotation | predict-rotate, predict-with-coordinates, capstone |
| **SEQUENCE BUILDER** | Two-slot step builder | Type + parameters for each step | capstone only |

**Context-sensitive visibility rules:**
- predict-translate: CHECK, RESET, SPEED only
- predict-reflect: FLIP, CHECK, RESET, SPEED
- predict-rotate: ROTATION, CHECK, RESET, SPEED
- predict-with-coordinates: FLIP + ROTATION both visible (composed sequences)
- capstone: SEQUENCE BUILDER replaces all prediction controls

---

## Visual Design

Follows the Eurorack instrument pattern established by sinewaves. No new design tokens.

**Layout (same 4-row grid):**

```
StatusStrip    — RIGID MOTIONS · 6 state dots · SYS:NOM · ESC
PromptReadout  — Transformation prompt / capstone instruction
R3F Canvas     — Coordinate grid · pre-image · ghost · constraint elements
ControlStrip   — Context-sensitive controls + sequence builder
FormulaReadout — Earned reveals · coordinate rules · sequence artifact
```

**Color roles:**
- Pre-image shape: `--lab-text` (`#b8b0a4`) — solid
- Ghost / prediction: `--lab-accent` (`#7cc87c`) — 50% opacity, dashed outline
- Confirmed image: `--lab-accent` (`#7cc87c`) — full opacity, solid
- Intermediate preview ghost (capstone): `--lab-accent` at 30% opacity, dotted outline
- Constraint elements (vector, axis ticks, arcs): `--lab-ghost` (`#7a746a`) — dashed
- Coordinate labels: `lab-data-font`, `--lab-ghost` muted → `--lab-text` active
- Grid: major lines `--lab-ghost`, minor lines darker, axis lines `--lab-text`

**Primary shape — scalene triangle:**

The default shape used across all stages except the capstone alternate. Designed to satisfy three constraints: asymmetric from every transformation angle, integer coordinates throughout, and positioned in Quadrant I with room for all transformed images to land within the visible canvas.

```
Default pre-image vertices:
  A (1, 1)  — bottom-left
  B (4, 2)  — bottom-right
  C (2, 4)  — top
```

Angle profile: approximately 40°, 65°, 75° — no two angles within 20° of each other. No two sides within 20% of each other in length. In all transformed positions (90° rotation, 180° rotation, 270° rotation, x-axis reflection, y-axis reflection) the orientation is unambiguous — a student cannot confuse the pre-image with its image by shape alone.

Quadrant I placement ensures: translation targets land in any quadrant without clipping, y-axis reflection lands cleanly in Quadrant II, x-axis reflection lands cleanly in Quadrant IV, 90° CW rotation lands in Quadrant IV, 180° rotation lands in Quadrant III, 270° CW rotation lands in Quadrant II. All transformed positions are visible within a −6 to 6 grid window on both axes.

**Capstone alternate — irregular quadrilateral:**

Used in capstone only, on rotation where the scalene triangle's rotational symmetry could make a two-step sequence ambiguous. Four vertices, none parallel, no right angles. Integer coordinates, fits within the same −6 to 6 window.

```
Alternate capstone vertices:
  A (1, 1)
  B (3, 0)
  C (4, 3)
  D (1, 3)
```

**Vertex labeling:**
- Pre-image: A, B, C in `lab-data-font`
- Ghost / image: A′, B′, C′ — prime notation, same font
- Capstone image: same prime notation, full opacity
- Capstone alternate quadrilateral: A, B, C, D and A′, B′, C′, D′

---

## Architecture

Flat file structure. No barrel exports. Layout and instrument pattern follow the sinewaves module; see [sinewaves ARCHITECTURE.md](../../../src/components/modules/sinewaves/ARCHITECTURE.md) for the reference implementation. After implementation, add an `ARCHITECTURE.md` in this module per the [documentation pipeline](../README.md#module-planning-pipeline).

```
src/components/modules/rigid-motions/
  InstrumentModule.tsx          — State orchestration, guide progression
  Layout.tsx                    — InstrumentLayout (Eurorack panel)
  Scene.tsx                     — R3F Canvas root

  scene/
    GridLines.tsx               — Coordinate grid with axis labels
    PreImageShape.tsx           — Source polygon with vertex labels + coordinates
    GhostShape.tsx              — Draggable prediction shape (prime labels)
    ImageShape.tsx              — Post-reveal confirmed image
    PreviewGhost.tsx            — Capstone live-preview intermediate shape
    TranslationVector.tsx       — Displacement vector arrow (translate stage)
    ReflectionAxisTicks.tsx     — Equidistance tick marks (reflect stage)
    RotationArcs.tsx            — Vertex sweep arcs (rotate stage)

  guide-state.ts                — 6 states + config + transition logic
  rigid-motions-constants.ts    — Thresholds, angle snaps, stage unlock counts
  rigid-motions-copy.ts         — All prompts, earned reveals, nudges, capstone copy
  shape-library.ts              — Scalene triangle + irregular quadrilateral definitions with named vertex coordinates
  transform-math.ts             — Apply transforms to point arrays (translate, reflect, rotate)
  match-scoring.ts              — Position centroid + orientation angle scoring
  coordinate-rules.ts           — Coordinate rule strings for each transformation type
  capstone-utils.ts             — Target generation for capstone (valid 1-2 step sequences)
  use-proximity.ts              — Live proximity scoring hook
  scene-layout.ts               — Viewport-aware shape + grid positioning

  StatusStrip.tsx               — 6 state dots, title, SYS:NOM, ESC
  PromptReadout.tsx             — Transformation prompt display
  ControlStrip.tsx              — Context-sensitive controls
  SequenceBuilder.tsx           — Capstone two-slot step builder
  FormulaReadout.tsx            — Earned reveals + sequence artifact
  types.ts                      — TransformationType, Shape, GuideState, SequenceStep
  animations.ts                 — GSAP sequences for reveal, arc sweep, pulse
```

**Key architectural notes:**

The scene folder is new relative to v1. Constraint elements (TranslationVector, ReflectionAxisTicks, RotationArcs) are separate R3F components mounted conditionally based on guide state — they are not part of GhostShape or PreImageShape. This keeps each concern isolated and makes the constraint elements straightforward to animate independently.

PreviewGhost is capstone-only. It receives the current sequence step array from SequenceBuilder and applies transform-math to the pre-image points to compute its position. It updates on every SequenceBuilder change — no debounce needed since transform-math operations on 3–4 point arrays are trivial.

The coordinate layer activation is a UI state flag in InstrumentModule (`coordinatesActive: boolean`) that gates coordinate label rendering in both PreImageShape and GhostShape/ImageShape. It flips to true once at the coordinate reveal moment and never reverts.

---

## Vocabulary Arc

Grade-level expectations emphasize vocabulary learned "with increasing precision." This module introduces terms only after the student has built the concept — never before.

| Term | Introduced when |
|---|---|
| Translation, reflection, rotation | Prompt language from the first interaction — plain description before the term |
| Pre-image / image | After first successful match — "what you've been calling the original shape is called the pre-image" |
| A′, B′, C′ / "A prime" | At the coordinate reveal, when prime notation first appears on vertex labels |
| Line of reflection | At the reflect earned reveal — the axis is named after the student has worked with it |
| Center of rotation | At the rotate earned reveal — the origin is named as the center after arcs have shown its role |
| Clockwise / counterclockwise | At the rotate earned reveal — directional language introduced with the arc visual |
| Rigid transformation | After all three motion types mastered — umbrella term earned by having used all three |
| Congruent / ≅ | Final earned reveal — after rigid transformation is established |

---

## What This Module Does Not Cover

Being explicit about scope boundaries matters for teacher adoption and honest positioning.

- **Dilations** — not covered; belong to a subsequent similarity module
- **Rotations about arbitrary centers** — not covered; Grade 8 standard constrains to origin only
- **Reflections over arbitrary lines** — not covered; Grade 8 standard constrains to x and y axes
- **Formal proof of congruence** — not covered; belongs to Geometry course proof layer (separate module)
- **Triangle congruence criteria (ASA, SAS, SSS)** — not covered; belong to Geometry course
- **Three-step or longer transformation sequences** — not covered in capstone; two-step maximum

---

## Follow-Up Modules

This module is the first in a confirmed three-module Grade 8 geometry progression, designed to cover a solid portion of the major content standards:

1. **Rigid Motions & Congruence (this module)** — translations, reflections, rotations, congruence; 8.G.A.1, 8.G.A.2, 8.G.A.3
2. **Dilations, Similarity & Right Triangles** — dilations, scale factor, similarity transformations, trigonometric ratios; 8.G.A.3, 8.G.A.4, 8.G.B (bridge to Geometry G-SRT)
3. **Pythagorean Theorem** — right triangle relationships, distance in the coordinate plane; 8.G.B.7, 8.G.B.8

The scalene triangle introduced in this module is the shape family that carries forward through all three. In module 2 it gets dilated. In module 3 its right-triangle variant is the instrument. The shape vocabulary is consistent across the progression — students are not learning new geometric objects, they are discovering new properties of a familiar one.

---

## Component Interfaces

TypeScript interfaces define the contract between components. These are implementation-ready specifications.

### Core Types

```typescript
// Guide state progression
type GuideState = 
  | 'predict-translate' 
  | 'predict-reflect' 
  | 'predict-rotate' 
  | 'coordinate-reveal' 
  | 'predict-with-coordinates' 
  | 'capstone'

// Transformation types
type TransformationType = 'translate' | 'reflect' | 'rotate'
type ReflectionAxis = 'x' | 'y'
type RotationDegrees = 90 | 180 | 270
type RotationDirection = 'cw' | 'ccw'

// Geometric primitives
interface Point {
  x: number
  y: number
}

interface Shape {
  vertices: Point[]
  labels: string[] // ['A', 'B', 'C'] or ['A', 'B', 'C', 'D']
}

// Transformation parameters
interface TranslationParams {
  type: 'translate'
  dx: number
  dy: number
}

interface ReflectionParams {
  type: 'reflect'
  axis: ReflectionAxis
}

interface RotationParams {
  type: 'rotate'
  degrees: RotationDegrees
  direction: RotationDirection
}

type TransformationParams = TranslationParams | ReflectionParams | RotationParams

// Capstone sequence
interface SequenceStep {
  id: string
  params: TransformationParams
}
```

### Scene Component Props

```typescript
// Main scene orchestrator
interface SceneProps {
  preImage: Shape
  ghostPosition: Point[] // Dragged position
  guideState: GuideState
  onGhostDrag: (position: Point[]) => void
  onGhostFlip: () => void
  onGhostRotate: (degrees: RotationDegrees) => void
  coordinatesActive: boolean
  speedMultiplier: 0.5 | 1 | 2
}

// Pre-image shape (always visible)
interface PreImageShapeProps {
  shape: Shape
  coordinatesActive: boolean
  color: string // --lab-text
}

// Ghost shape (prediction)
interface GhostShapeProps {
  vertices: Point[]
  labels: string[] // ['A′', 'B′', 'C′']
  coordinatesActive: boolean
  color: string // --lab-accent
  opacity: number // 0.5
  onDrag: (vertices: Point[]) => void
}

// Image shape (post-reveal)
interface ImageShapeProps {
  vertices: Point[]
  labels: string[]
  coordinatesActive: boolean
  color: string // --lab-accent full opacity
  animateFrom: Point[] // Start position for reveal animation
}

// Translation vector
interface TranslationVectorProps {
  from: Point // Pre-image centroid
  to: Point // Ghost centroid
  color: string // --lab-ghost
  visible: boolean
}

// Reflection axis ticks
interface ReflectionAxisTicksProps {
  axis: ReflectionAxis
  preImageVertices: Point[]
  ghostVertices: Point[]
  color: string // --lab-ghost
  visible: boolean
}

// Rotation arcs
interface RotationArcsProps {
  preImageVertices: Point[]
  degrees: RotationDegrees
  direction: RotationDirection
  color: string // --lab-ghost
  visible: boolean
}

// Capstone preview ghost
interface PreviewGhostProps {
  preImage: Shape
  sequence: SequenceStep[]
  color: string // --lab-accent at 30% opacity
  style: 'dotted' // Distinct from prediction ghost
}
```

---

## Match Scoring Algorithm

Match detection determines when the student's prediction is correct. The algorithm uses separate thresholds for position and orientation.

### Position Scoring

```typescript
function checkPositionMatch(
  ghostVertices: Point[],
  targetVertices: Point[]
): { match: boolean; distance: number } {
  // Calculate centroids
  const ghostCentroid = calculateCentroid(ghostVertices)
  const targetCentroid = calculateCentroid(targetVertices)
  
  // Euclidean distance
  const distance = Math.sqrt(
    Math.pow(ghostCentroid.x - targetCentroid.x, 2) +
    Math.pow(ghostCentroid.y - targetCentroid.y, 2)
  )
  
  const POSITION_THRESHOLD = 0.3 // Grid units
  return {
    match: distance <= POSITION_THRESHOLD,
    distance
  }
}
```

### Orientation Scoring

```typescript
function checkOrientationMatch(
  ghostVertices: Point[],
  targetVertices: Point[]
): { match: boolean; angleDiff: number } {
  // Use longest edge to determine orientation
  const ghostAngle = calculateLongestEdgeAngle(ghostVertices)
  const targetAngle = calculateLongestEdgeAngle(targetVertices)
  
  // Angular difference (handle wrap-around)
  let angleDiff = Math.abs(ghostAngle - targetAngle)
  if (angleDiff > 180) angleDiff = 360 - angleDiff
  
  const ORIENTATION_THRESHOLD = 5 // Degrees
  return {
    match: angleDiff <= ORIENTATION_THRESHOLD,
    angleDiff
  }
}
```

### Combined Match Detection

```typescript
function checkMatch(
  ghostVertices: Point[],
  targetVertices: Point[]
): MatchResult {
  const position = checkPositionMatch(ghostVertices, targetVertices)
  const orientation = checkOrientationMatch(ghostVertices, targetVertices)
  
  if (position.match && orientation.match) {
    return { type: 'match' }
  } else if (position.match && !orientation.match) {
    return { type: 'close', hint: 'Check the orientation' }
  } else if (!position.match && orientation.match) {
    return { type: 'close', hint: 'Check the position' }
  } else {
    return { 
      type: 'miss',
      showGapLines: true,
      distance: position.distance
    }
  }
}
```

### Thresholds Rationale

- **Position: 0.3 grid units** — Allows for minor dragging imprecision while requiring intentional placement
- **Orientation: 5 degrees** — Tight enough to require correct reflection/rotation, loose enough for snap-to-grid constraints

---

## Animation Specifications

All animations use GSAP with `prefers-reduced-motion` support. Durations are calibrated for clarity without feeling sluggish.

### Reveal Animation (Match Success)

```typescript
// Animate pre-image along transformation path to correct position
const revealSequence = gsap.timeline()

// Step 1: Pre-image shape animates to correct position
revealSequence.to(preImageVertices, {
  duration: 0.6,
  ease: 'power2.inOut',
  // Transform vertices along the geometric path
  onUpdate: (progress) => {
    // For translation: linear interpolation
    // For reflection: arc over axis
    // For rotation: circular arc around origin
  }
})

// Step 2: Arrival pulse (both shapes)
revealSequence.to([preImageShape, imageShape], {
  duration: 0.2,
  ease: 'power2.out',
  scale: 1.05,
  yoyo: true,
  repeat: 1
}, '-=0.1')
```

### Gap Lines (Miss Feedback)

```typescript
// Render dashed lines from ghost vertices to correct positions
const gapLines = ghostVertices.map((ghostVertex, i) => {
  const targetVertex = targetVertices[i]
  return gsap.fromTo(gapLine, 
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      duration: 0.3,
      ease: 'power1.out',
      delay: i * 0.05 // Stagger
    }
  )
})
```

### Coordinate Reveal

```typescript
// Fade in coordinate labels and FormulaReadout rules
gsap.to(coordinateLabels, {
  duration: 0.4,
  opacity: 1,
  ease: 'power2.out',
  stagger: 0.05
})

gsap.to(formulaReadout, {
  duration: 0.6,
  opacity: 1,
  y: 0,
  ease: 'power2.out'
}, '-=0.2')
```

### Capstone Preview Ghost

```typescript
// Update preview ghost position on sequence change (no animation)
// Instant update — student needs immediate feedback
function updatePreviewGhost(sequence: SequenceStep[]) {
  const transformedVertices = applySequence(preImage.vertices, sequence)
  setPreviewGhostVertices(transformedVertices)
  // No tween — instant update
}
```

### Animation Timing Summary

| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Reveal path animation | 600ms | power2.inOut | CHECK with match |
| Arrival pulse | 200ms (×2) | power2.out | Shape settles |
| Gap line render | 300ms | power1.out | CHECK with miss |
| Gap line stagger | 50ms | — | Per vertex |
| Coordinate fade-in | 400ms | power2.out | Coordinate reveal |
| Formula slide-up | 600ms | power2.out | Coordinate reveal |
| Preview ghost update | 0ms | — | Sequence change |

---

## Coordinate System Mapping

The module uses mathematical coordinates (origin at center, y-up) but renders in SVG/Canvas coordinates (origin at top-left, y-down). All transformations are computed in math coordinates and converted for rendering.

### Conversion Functions

```typescript
// Math coords → SVG coords
function mathToSVG(point: Point, canvasSize: number): Point {
  const scale = canvasSize / 14 // -7 to 7 grid → canvas size
  const center = canvasSize / 2
  return {
    x: center + point.x * scale,
    y: center - point.y * scale // Y inverted
  }
}

// SVG coords → Math coords
function svgToMath(point: Point, canvasSize: number): Point {
  const scale = canvasSize / 14
  const center = canvasSize / 2
  return {
    x: (point.x - center) / scale,
    y: (center - point.y) / scale // Y inverted
  }
}
```

### Grid Coordinate Range

- **Visible range:** −6 to 6 on both axes (13 units total)
- **Canvas size:** 400×400px (mockup) or responsive
- **Grid major lines:** Every 1 unit (30px at 400px canvas)
- **Grid minor lines:** Every 0.5 units (15px)
- **Snap-to-grid:** Ghost vertices snap to 0.5-unit increments

### Default Shape Placement

```typescript
// Scalene triangle in Quadrant I
const DEFAULT_PRE_IMAGE: Shape = {
  vertices: [
    { x: 1, y: 1 },  // A
    { x: 4, y: 2 },  // B
    { x: 2, y: 4 }   // C
  ],
  labels: ['A', 'B', 'C']
}

// Capstone alternate (irregular quadrilateral)
const CAPSTONE_ALTERNATE: Shape = {
  vertices: [
    { x: 1, y: 1 },  // A
    { x: 3, y: 0 },  // B
    { x: 4, y: 3 },  // C
    { x: 1, y: 3 }   // D
  ],
  labels: ['A', 'B', 'C', 'D']
}
```

---

## Capstone Target Generation

The capstone generates valid 1-2 step transformation sequences that map the pre-image to a target position. The algorithm ensures the target is achievable and unambiguous.

### Valid Sequence Types

```typescript
type CapstoneSequenceType =
  | 'single-translate'
  | 'single-reflect'
  | 'single-rotate'
  | 'reflect-then-translate'
  | 'rotate-then-translate'

// Excluded: reflect + rotate, rotate + reflect
// Reason: Require arbitrary-center transformations to feel intuitive
```

### Generation Algorithm

```typescript
function generateCapstoneTarget(): {
  targetVertices: Point[]
  correctSequence: SequenceStep[]
  sequenceType: CapstoneSequenceType
} {
  const sequenceType = randomChoice([
    'single-translate',
    'single-reflect',
    'single-rotate',
    'reflect-then-translate',
    'rotate-then-translate'
  ])
  
  let sequence: SequenceStep[]
  
  switch (sequenceType) {
    case 'single-translate':
      sequence = [generateTranslation()]
      break
    case 'single-reflect':
      sequence = [generateReflection()]
      break
    case 'single-rotate':
      sequence = [generateRotation()]
      break
    case 'reflect-then-translate':
      sequence = [generateReflection(), generateTranslation()]
      break
    case 'rotate-then-translate':
      sequence = [generateRotation(), generateTranslation()]
      break
  }
  
  const targetVertices = applySequence(DEFAULT_PRE_IMAGE.vertices, sequence)
  
  // Validate: target must be fully visible within −6 to 6 range
  if (!isFullyVisible(targetVertices)) {
    return generateCapstoneTarget() // Retry
  }
  
  return { targetVertices, correctSequence: sequence, sequenceType }
}
```

### Parameter Constraints

```typescript
function generateTranslation(): TranslationParams {
  return {
    type: 'translate',
    dx: randomInt(-5, 5), // Exclude 0
    dy: randomInt(-5, 5)
  }
}

function generateReflection(): ReflectionParams {
  return {
    type: 'reflect',
    axis: randomChoice(['x', 'y'])
  }
}

function generateRotation(): RotationParams {
  return {
    type: 'rotate',
    degrees: randomChoice([90, 180, 270]),
    direction: 'cw' // Grade 8 standard uses CW
  }
}
```

### Ambiguity Prevention

For sequences where the scalene triangle's rotational symmetry could create ambiguity, use the irregular quadrilateral:

```typescript
function selectShapeForSequence(sequenceType: CapstoneSequenceType): Shape {
  // Use quadrilateral for rotate + translate to avoid ambiguity
  if (sequenceType === 'rotate-then-translate') {
    return CAPSTONE_ALTERNATE
  }
  return DEFAULT_PRE_IMAGE
}
```

---

## Mockup Validation

The module mockup [mockups/RigidMotions.jsx](../../mockups/RigidMotions.jsx) demonstrates all guide states and viewports. It was validated against this spec before implementation begins. See [mockups/README.md](../../mockups/README.md) for the mockup format and structure.

### Validation Checklist

- [x] **All guide states render correctly**
  - Predict-translate with translation vector
  - Predict-reflect with axis ticks
  - Predict-rotate with rotation arcs
  - Coordinate reveal with formula readout
  - Predict-with-coordinates with composed sequence
  - Capstone with sequence builder

- [x] **Constraint elements are geometrically accurate**
  - Translation vector points from pre-image centroid to ghost centroid
  - Reflection ticks show equidistance from axis
  - Rotation arcs sweep correct angular distance around origin

- [x] **Coordinate labels positioned correctly**
  - Labels appear at vertices with `(x, y)` format
  - Prime notation (A′, B′, C′) on image/ghost
  - Labels hidden until coordinate reveal, then persist

- [x] **Sequence builder in capstone is usable**
  - Two-slot structure: STEP 1 and STEP 2
  - Type selector (TRANSLATE / REFLECT / ROTATE)
  - Parameters appear based on type selection
  - FormulaReadout shows structured sequence description

- [x] **Mobile layout maintains readability**
  - Status strip: dots + SYS:NOM only (title and ESC hidden)
  - Readouts: stacked (prompt then formula)
  - Canvas: full-width square
  - Controls: 44px minimum touch targets

- [x] **Color tokens match Eurorack design system**
  - `--lab-bg`, `--lab-surface`, `--lab-accent`, `--lab-text`, `--lab-ghost` all correct
  - Typography: Inter Tight (UI) + JetBrains Mono (data)
  - Scored dividers between sections

### Implementation Notes from Mockups

1. **Translation vector:** SVG `<line>` with `marker-end="url(#arrow)"` for arrowhead
2. **Reflection ticks:** Perpendicular dashed lines from vertices to axis
3. **Rotation arcs:** SVG `<path>` with arc commands (`A rx ry x-axis-rotation large-arc-flag sweep-flag x y`)
4. **Grid pattern:** Nested SVG patterns (minor 30px + major 150px at 400px canvas)
5. **Coordinate labels:** `<text>` elements with JetBrains Mono, positioned near vertices
6. **Sequence builder:** HTML `<select>` dropdowns with `min-height: 44px` on mobile

### Differences from Sinewaves

| Aspect | Sinewaves | Rigid Motions | Rationale |
|--------|-----------|---------------|-----------|
| **Controls** | Continuous sliders | Discrete toggles | Transformations are discrete operations |
| **Ghost visibility** | Always in match states | Predict states only | Capstone shows both figures simultaneously |
| **Constraint elements** | Connector line | Vector, ticks, arcs | Each transformation has distinct geometric constraint |
| **Coordinate layer** | Always visible | Earned reveal | Coordinates are Level 4 ALD boundary |
| **Animation path** | Continuous wave | Geometric transformation | Shape follows transformation path (arc, line, etc.) |

---

## Open Questions for Implementation

Two items are resolved at the design level but will need implementation decisions:

**Grid bounds and shape placement:** The scene needs to fit a shape, its image, and constraint elements legibly at all viewport sizes. The sinewaves module had one shape centered in the canvas. This module will sometimes need to show two shapes (post-reveal, capstone) simultaneously. The `scene-layout.ts` file will need to calculate shape placement such that both figures are visible without scrolling, across mobile and desktop viewports. This is a non-trivial layout problem worth prototyping early.

**Rotation arc rendering in R3F:** The arcs for the rotation stage are geometric — each arc is a partial circle at the radius of each vertex from the origin. R3F doesn't have a native arc primitive. These will likely be rendered as `Line` components using a computed array of points along the arc. With three vertices on the scalene triangle, three arcs render simultaneously. The point-count needs to be high enough to look smooth without affecting performance on mobile. Worth testing at 32 points per arc before committing.

---

## Next Steps

Per the [documentation pipeline](../README.md#module-planning-pipeline): this spec and the validated mockups are the inputs for implementation. After the module is built, add `ARCHITECTURE.md` in `src/components/modules/rigid-motions/` to document the as-built implementation.