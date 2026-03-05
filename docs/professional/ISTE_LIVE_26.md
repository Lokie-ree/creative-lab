# Executive Summary
## Rigid Motions Module · Road to ISTE Live 2026

**Prepared by:** Randall LaPoint, Jr. · IVLA STEM Club · March 2026

---

## Strategic Context

This document transitions the Rigid Motions module from a student-first development context to a dual-purpose instrument: one that continues to deliver measurable learning value to STEM Club students while becoming conference-ready for ISTE Live 2026.

> **The goal at ISTE Live 26 is not a formal presentation.** It is a QR code in the exhibit hall and a stranger on their own device who understands what to do within 30 seconds and finds it compelling enough to finish.

This shifts the audit and refinement lens without abandoning pedagogy. Every remaining build decision carries two questions: does it deepen the learning experience, and does it survive a cold start on an unfamiliar device in a noisy room?

ISTE Live 27 is the target for a formal presentation. 2026 is about planting a flag, collecting signal, and demonstrating that this kind of tool exists and works.

---

## Where We Are

Phases 1 and 2 are complete. The module has a fully functional predict-and-reveal loop across all three transformation types — translation, reflection, and rotation — with match scoring, GSAP reveal animations, constraint elements, and a guide state machine. 123 tests cover the load-bearing math and state logic.

| Phase | Scope | Demo Value | Status |
|---|---|---|---|
| Phase 1 | Draggable ghost triangle, coordinate grid, R3F scene | Foundation | ✅ Complete |
| Phase 2 | Full predict/reveal loop: translate, reflect, rotate. Scoring, animations, constraint elements. | Core interaction proven | ✅ Complete |
| Phase 3 | Coordinate label layer, FormulaReadout, coordinate-reveal guide state | Connects geometry to algebra | Pending |
| Phase 4 | Capstone: SequenceBuilder, PreviewGhost, multi-step transformation | The showstopper moment | Pending |
| Audit | Cold-start usability, cross-device polish, onboarding clarity | Conference-ready | Pending |

Two polish items are scoped and deferred to the audit phase: grid snap accessibility and a minor viewport reframe on Android orientation change. Neither blocks Phase 3 or 4 implementation.

---

## Phase 3: Coordinate Layer

### What It Builds

Phase 3 activates the coordinate label infrastructure already present in the codebase. Students have been predicting transformations by spatial reasoning alone. Phase 3 introduces the algebraic notation that describes what they have already been doing.

- `coordinatesActive` flag enables vertex coordinate labels on the pre-image and image triangles
- `FormulaReadout` displays the transformation rule in coordinate notation — `(x, y) → (x+4, y+2)` — after a successful reveal
- `coordinate-reveal` guide state delivers a focused moment where the notation is earned, not front-loaded
- `predict-with-coordinates` guide state: students repeat prediction tasks with coordinate labels visible, connecting spatial intuition to symbolic representation

### Why It Matters Pedagogically

Grade 8 standard 8.G.A.3 requires students to describe transformations using coordinates. Phase 2 builds the spatial intuition. Phase 3 delivers the formal connection. The sequence — manipulate first, symbolize second — is the core pedagogical principle of the entire module.

### Why It Matters for the Demo

A conference attendee who makes it through Phase 3 has watched notation emerge from understanding, not precede it. That is the moment that distinguishes this from every other transformation tool they have seen. The `FormulaReadout` is not a label — it is a reveal.

---

## Phase 4: Capstone

### What It Builds

Phase 4 inverts the interaction model. Instead of predicting where a transformation lands, students are shown two figures and must identify the sequence of transformations that maps one onto the other. This is the 8.G.A.2 capstone: congruence through transformation composition.

- `SequenceBuilder`: a step-by-step control strip where students select and order transformation operations
- `PreviewGhost`: real-time preview of the sequence result as students build it, before committing
- `capstone-utils.ts`: valid 1–2 step sequence generation from the established round definitions
- Inverse interaction: the target image is fixed; the student's task is to construct the path, not predict the destination

### The ISTE Moment

The capstone is the reason someone in the exhibit hall pulls over a colleague. A student — or a teacher, or a conference attendee — who successfully identifies a two-step transformation sequence has demonstrated Level 5 ALD performance. They have not answered a multiple choice question. They have constructed an argument in the language of geometry.

> Design Phase 4 with this scenario in mind: a stranger completes the sequence builder, sees the ghost land exactly on the target, and says "wait, that actually worked." That reaction is the product.

---

## Audit and Refinement

The audit phase follows Phase 4 completion. Its purpose is conference hardening, not feature completion. The bar is not "does every edge case work" — it is "does a stranger succeed on their first attempt."

| Area | What We Are Evaluating | Pass Condition |
|---|---|---|
| Cold Start | Is the first interaction self-evident without instruction? | User drags ghost within 15 seconds without prompting |
| Onboarding | Does the first screen communicate the interaction model? | No explanatory text required to begin |
| Mobile | Does the experience hold on any phone pulled from a pocket? | No clipping, no layout breaks, portrait and landscape |
| Orientation | Android and iOS rotation both stable | Content fully visible immediately after rotation |
| Snap (Polish) | Does integer snap improve accessibility without hurting fluidity? | Ghost lands cleanly on grid intersections during drag |
| Capstone Entry | Is the transition from Phase 3 to capstone earned and clear? | Student understands task change without re-reading |
| Performance | Acceptable load on a mid-range Android device | Interactive within 3 seconds on 4G |
| STEM Club | Do students engage without teacher facilitation? | At least one "that's sick" equivalent per session |

The resize and snap items identified during Phase 2 testing are scoped here, not earlier. Adding polish before the full interaction model exists is a sequencing error — the audit is where polish decisions have full context.

---

## Demo Strategy

ISTE Live 2026 is an exhibit hall, not a stage. The demo format is a QR code. The audience is self-selected educators who stop because something caught their eye. The interaction must be the pitch.

- **No instructions** — the first screen must communicate the task through visual design alone
- **No required account** — any device, any browser, immediate access
- **Full progression available** — a teacher who wants to go deep can reach the capstone in one session
- **Designed for interruption** — a 2-minute partial session should still leave a strong impression

Every person who completes the module at the conference is a research participant. Their behavior — where they hesitate, where they accelerate, whether they reach the capstone — is the data that shapes ISTE Live 27.

> **ISTE Live 26:** plant the flag, collect the signal.
> **ISTE Live 27:** formalize the presentation, share the findings.

---

## Timeline

| Milestone | Target |
|---|---|
| Runway | 3–4 months to ISTE Live 26 |
| Phase 3 | Month 1–2 |
| Phase 4 | Month 2–3 |
| Audit / Refinement | Month 3–4 |
| Conference | ISTE Live 26 |

The sequencing principle remains: establish a clean, testable substrate before extending. Phase 3 must be fully functional and student-tested before Phase 4 begins. The capstone interaction depends on the coordinate layer being solid — a student who cannot read transformation notation cannot construct a sequence.

STEM Club sessions continue throughout. Students testing Phase 3 are providing direct signal on the coordinate reveal. Students reaching Phase 4 are the first real validation of the capstone design.

---

*The module is not a portfolio piece that happens to teach. It is a learning instrument that happens to be conference-ready. Build accordingly.*