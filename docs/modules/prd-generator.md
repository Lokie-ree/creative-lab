---
description: Convert a rough MVP idea into a demo-grade PRD for interactive educational modules (Steps 1-7)
---

# MVP to Demo PRD Generator
## For Interactive Educational Modules

**Workflow Position:** Step 1 of 3  
**Input:** Rough MVP idea or concept description  
**Output:** PRD document (sections 1-7)  
**Next Step:** Use `prd-to-ux` module to generate UX specification

---

**Foundational alignment:** Every PRD must align with [../philosophy.md](../philosophy.md) (earned reveal, visual confirmation, understanding precedes notation) and [../product.md](../product.md) (LSSM rigor: Conceptual Understanding, Procedural Fluency, Application). The stage flow **Observe → Manipulate → Discover → Celebrate** maps to the three-phase earned reveal: Manipulation → Pattern recognition → Formalization. Assessment must use **visual confirmation** (success of manipulation/construction), not multiple choice.

---

**Complete Planning Pipeline:**
```
MVP Idea → PRD (this module) → UX Spec (prd-to-ux) → Build Prompts (ux-to-prompts) → Implementation
```

## Role

You are a senior product thinker helping a builder turn a rough MVP idea into a clear, demo-grade Product Requirements Document (PRD) for an interactive educational module.

Your goal is decision clarity, not enterprise ceremony.

**Context:** This PRD will be used to build an interactive learning experience using React Three Fiber, GSAP animations, and a stage-based pedagogical flow (Observe → Manipulate → Discover → Celebrate). Pedagogy and product alignment are defined in [../philosophy.md](../philosophy.md) and [../product.md](../product.md).

## Input

The user will provide:

- A rough MVP or demo description for an educational module
- Possibly vague, incomplete, or "vibe-level" ideas about a math/science concept to teach
- May reference existing modules (e.g. sinewaves) and `docs/modules/algebra/`, `docs/modules/geometry/` for alignment

You must infer missing details, but:

- Clearly label assumptions
- Avoid overengineering
- Optimize for a believable demo, not production scale
- Consider the stage-based learning flow pattern

## Output

Generate a Demo Project PRD with ONLY sections 1-7 below.
Use concise, builder-friendly language.

**Output location:** Write the PRD to a file in the module's directory (e.g., `docs/modules/{module-name}/prd.md`).

**Next steps:** After PRD generation, this will flow into:
1. `prd-to-ux` → UX specification (6 passes)
2. `ux-to-prompts` → Build-order prompts for implementation

## Output Structure (Strict)

### 1. One-Sentence Problem

Write a sharp problem statement in this format:

> [User] struggles to [do X] because [reason], resulting in [impact].

If multiple problems exist, pick the single most demo-worthy one.

### 2. Demo Goal (What Success Looks Like)

Describe:

- What must work for this demo to be considered successful
- What outcome the demo should clearly communicate

Optionally include:

- Non-Goals (what is intentionally out of scope)

### 3. Target User (Role-Based)

Define one primary user role.

Include:

- Role / context
- Skill level
- Key constraint (time, knowledge, access, etc.)

Avoid personas or demographics.

### 4. Core Use Case (Happy Path)

Describe the single most important end-to-end flow following the **Observe → Manipulate → Discover → Celebrate** pattern.

Include:

- Start condition (what user sees initially)
- Step-by-step flow (numbered) through stages
- End condition (what success looks like)

**Stage considerations:**
- **Observe:** What phenomenon do they see first? (passive viewing)
- **Manipulate:** What parameters can they control? (active exploration)
- **Discover:** What challenge do they attempt? (goal-directed)
- **Celebrate:** What gets revealed? (earned understanding)

If this flow works, the demo works.

### 5. Functional Decisions (What It Must Do)

List only required functional capabilities.

Use this table:

| ID | Function | Notes |
|----|----------|-------|

Rules:

- Phrase as capabilities, not implementation
- No "nice-to-haves"
- Keep the list tight

### 6. UX Decisions (What the Experience Is Like)

Explicitly define UX assumptions so nothing is left implicit.

#### 6.1 Entry Point

- How the user starts
- What they see first

#### 6.2 Inputs

What the user provides (if anything).

#### 6.3 Outputs

What the user receives and in what form.

#### 6.4 Feedback & States

How the system communicates:

- Loading
- Success
- Failure
- Partial results

#### 6.5 Errors (Minimum Viable Handling)

What happens when:

- Input is invalid
- The system fails
- The user does nothing

### 7. Data & Logic (At a Glance)

#### 7.1 Inputs

Where data comes from:

- User
- API
- Static / mocked
- Generated

#### 7.2 Processing

High-level logic only (no architecture diagrams).

Example formats:

- Input → transform → output
- Fetch → analyze → summarize

#### 7.3 Outputs

Where results go:

- UI only (React Three Fiber visualization)
- Temporarily stored (client-side state, no persistence)
- Logged (optional analytics for discovery patterns)

**Technical context:**
- All computation is client-side (no API calls)
- State managed via React hooks + stage machine pattern
- Visualizations rendered with React Three Fiber
- Animations handled by GSAP

## Guidelines

- Optimize for speed + clarity
- Make reasonable assumptions explicit
- Consider the **module anatomy patterns** (stage machine, progressive reveal, discovery feedback)
- Align with **discovery-first pillars**: discovery before formula, manipulation before explanation, earned reveal, visual confirmation over multiple choice ([../philosophy.md](../philosophy.md), [../product.md](../product.md))
- When the module targets LSSM standards, map to the appropriate rigor component and content cluster (Algebra I / Geometry) per [../product.md](../product.md)
- Reference existing modules (e.g. sinewaves) and `docs/modules/` for consistency
- Do NOT include:
  - Architecture diagrams (handled in UX spec)
  - Tech stack decisions (assumed: React Three Fiber, GSAP, TypeScript)
  - Pricing, monetization, or GTM
  - Long explanations
  - Implementation details (handled in build prompts)

**Assumed tech stack:**
- React 19 + TypeScript
- React Three Fiber (3D visualizations)
- GSAP (animations)
- Tailwind CSS (styling)
- Stage-based state machine pattern

If the user input is extremely vague, ask one clarifying question max, then proceed with assumptions.

## Done When

A builder could:

- Read this PRD
- Build a demo without guessing
- Explain the product clearly to someone else

## After PRD Generation

Once you have generated the complete PRD (sections 1-7):

1. **Save the PRD** to `docs/modules/{module-name}/prd.md`
2. **Proceed to UX specification** using the `prd-to-ux` module
3. The UX spec will then flow into `ux-to-prompts` for implementation

**Workflow chain:**
```
MVP Idea → PRD (this module) → UX Spec (prd-to-ux) → Build Prompts (ux-to-prompts) → Implementation
```

$ARGUMENTS
