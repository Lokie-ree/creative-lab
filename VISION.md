# Vision Document

**Author:** Randall LaPoint, Jr.  
**Established:** January 8, 2026  
**Revised:** February 23, 2026  
**Status:** Active

---

## Core Thesis

I need to be in a position that grants higher probability of positive impact on students. That impact can't happen within the walls of a traditional classroom—not in most districts in my state.

I'm not leaving education. I'm building the tools that let me serve students at scale.

One teacher reaches 150 students per year. One well-designed learning experience reaches millions. The STEM Club is where that claim gets tested.

---

## Core Narrative

**"I build interactive experiences that help people understand things they thought were hard."**

This narrative is not positioning. It's a description of what actually happens when a student sits down with one of these modules. The STEM Club makes that literal: real students, real feedback, twice a week.

---

## WHAT

Build the Grade 8 geometry module progression and iterate based on what the STEM Club reveals.

### The Living Laboratory

The IVLA STEM Club is the primary development context. Students encounter these modules as learners first—not as beta testers, not as a portfolio audience. The fact that their feedback directly shapes the next iteration is a structural feature, not a side effect.

What this means in practice:

- **Students are both the audience and the signal.** When something doesn't work pedagogically, it shows up immediately in how students interact. No survey needed.
- **Club members are also learning web development.** React, Vite, React Three Fiber. The codebase they're reading is the same one producing the experiences they're using. This is the "Goggins cookie jar" scenario: every session is a win-win.
- **Real feedback over theoretical design principles.** The sinewaves module worked because a student called it "sick." That's the validation standard. Everything else is hypothesis until a student confirms or refutes it.

### The Module Architecture

The current build target is a confirmed three-module Grade 8 geometry progression:

```
Grade 8 Geometry Progression
  ├── Rigid Motions & Congruence     ← IN PROGRESS
  │     8.G.A.1, 8.G.A.2, 8.G.A.3
  │     translations · reflections · rotations · congruence
  │
  ├── Dilations, Similarity & Right Triangles
  │     8.G.A.3, 8.G.A.4, 8.G.B (bridge to G-SRT)
  │     scale factor · similarity transformations · trig ratios
  │
  └── Pythagorean Theorem
        8.G.B.7, 8.G.B.8
        right triangle relationships · distance in the coordinate plane
```

The scalene triangle introduced in the first module is the shape family that carries forward through all three. Students are not learning new geometric objects between modules—they're discovering new properties of a familiar one.

The broader roadmap (Algebra I, Trigonometry) is organized by major content clusters and will be sequenced after the Grade 8 progression validates the pattern.

### Each Module Embodies the Same Pedagogical Principles

Canonical definitions in [philosophy.md](./docs/philosophy.md) and [product.md](./docs/product.md):

- **Discovery before formula** — Engage with phenomena before formal shorthand.
- **Manipulation before explanation** — Build a mental model through interaction, then definitions.
- **The "earned reveal"** — Understanding precedes notation; symbols follow conceptual grounding.
- **Visual confirmation over multiple choice** — Feedback from construction/manipulation success, not from choosing an answer.

### What Already Exists

- Sinewaves module (complete — instrument refactor + Eurorack design system)
- Vector Transformations module (implemented)
- Module skeleton infrastructure (reusable hooks for future modules)
- Eurorack design system: global tokens, utility classes, design principles
- Documentation framework: philosophy, product alignment, design audits, implementation plans
- Technical foundation (React Three Fiber, GSAP, Tailwind CSS 4, shadcn/ui)

---

## WHY

**Build tools that move students from "I don't get this" to "that's sick."**

Not through claims. Not through case studies. Through direct, repeated interaction with real students who have no obligation to be polite about whether it works.

### The Deeper Why

A focused 12-day sprint produced something a student called "sick." Eight months on other projects felt like a drag. The difference wasn't effort—it was alignment.

When I build interactive learning experiences, my thinking *is* the product. I'm not facilitating access to someone else's ideas; I'm embodying my own philosophy about how understanding develops.

The STEM Club makes this concrete. Twice a week, there's a room full of students who will tell me—through their behavior if not their words—whether the instrument is working.

This is the work that pulls me forward rather than requiring me to push.

---

## WHO

### Primary: STEM Club Students

They encounter the modules as learners. If a student sits down with the Rigid Motions module and, ten minutes later, can describe why two figures are congruent in terms they built themselves—the module has done its job.

The validation standard: observable understanding, not self-reported satisfaction. A student who says "I get it now" after building a two-step transformation sequence has demonstrated Level 5 ALD performance. That's the target.

The dual role matters: these students are also learning React and R3F. The codebase is pedagogically transparent—they can see how the tool they're using was built. This is the laboratory design working at full capacity.

### Secondary: Future Teachers and Adopters

Teachers in Louisiana and beyond who encounter these modules as classroom supplements or independent study tools.

They need to trust two things: that the standards alignment is real (see [product.md](./docs/product.md)), and that the module works without requiring them to explain it first. A tool that needs a teacher's introduction before it makes sense has already failed the design test.

The scope document in each module's design spec—what is and isn't covered, which grade level, which standards—is written as much for teachers as for developers.

### Tertiary: Myself

A body of work that reflects who I'm becoming, not just who I've been. Something that energizes me to maintain, share, and discuss. A forcing function that demands the next module get built.

Proof of what I'm capable of when direction and energy align.

---

## Strategic Positioning

### What I Am

A mathematician who spent 15 years learning how students learn, then returned to development to build the tools that scale those insights.

An interactive learning experience designer whose technical skills are supporting evidence, not the headline.

Someone at the rare intersection of mathematical depth, classroom-tested pedagogical knowledge, and technical execution capability—using a live student population to validate every design decision in real time.

### What I Am Not

"A teacher who learned to code."

A generalist developer competing on breadth of technical skills.

Someone who builds educational tools without deep understanding of how learning actually works, or who validates those tools through theoretical frameworks rather than actual students.

---

## The Outcomes This Enables

Every module built and validated by the STEM Club strengthens the whole. Validated tools can be shared with teachers, adopted by other clubs, and extended into new content clusters. The living laboratory doesn't just produce feedback—it produces credibility that no portfolio alone can replicate.

Whether this leads to broader adoption, consulting opportunities, or independent distribution, the work demonstrates what I'm capable of when direction and energy align. The STEM Club is where that alignment is proven, not claimed.

---

## Guiding Principles

### Students First

When design decisions feel unclear, ask: "What serves the student encountering this?" That question cuts through ambiguity faster than any other.

### Show, Don't Tell

Every claim about pedagogical effectiveness should be demonstrable through student behavior, not through design documentation. If I say a module produces Level 4 ALD performance, a STEM Club session should be able to show it.

### Energy Over Obligation

The work that matters most should pull me forward. If building feels like grinding through obligation, pause and check alignment. The Sinewaves module took 12 days and felt alive. That's the standard.

### Depth Over Breadth

One validated module at 100% demonstrates more than three modules at 70%. The STEM Club enforces this—a module that doesn't fully work will show its gaps in the room, not just in a code review.

---

## What This Document Is

A single source of truth for direction when decisions feel murky.

A reference point for evaluating whether new ideas align with the vision.

**Aligned with:** [philosophy.md](./docs/philosophy.md) (pedagogy) and [product.md](./docs/product.md) (LSSM/product alignment).

A reminder of the clarity that emerged from sitting with hard questions.

A commitment to the path forward.

---

## What This Document Is Not

A project plan. The HOW lives in the module design specs.

A constraint on evolution. This vision can grow as the laboratory produces new information.

A finished product. It's a living document that stays true to core principles while adapting to what the students reveal.

---

*"Direction isn't just knowing what to build—it's knowing why you're building it and who it's for."*

*The STEM Club is the answer to both questions. Build accordingly.*