---
name: module-planning-pipeline
description: Use when turning an MVP idea into a PRD, a PRD into a UX spec, or a UX spec into sequential build-order prompts for React Three Fiber interactive educational modules. Trigger this skill whenever the user mentions module planning, phase design, round decomposition, lab guide authoring, ALD instrument design, or build-order prompts for the Grade 8 Geometry arc. Also use when the user says "plan module 2", "plan module 3", "plan dilations", "plan pythagorean", or references the planning pipeline.
---

# Module Planning Pipeline

MVP idea → PRD → UX spec (6 passes) → build-order prompts. Each step writes to file for the next. Align with `docs/philosophy.md` (earned reveal, visual confirmation) and `docs/product.md` (LSSM, ALDs). Stack: React 19, TypeScript, R3F, GSAP, Tailwind, stage machine.

**Exemplar:** `docs/modules/dilations/` (prd.md → ux-spec.md → build-order-prompts.md) is the reference planning run — a complete, shipped pipeline execution. `docs/modules/pythagorean-theorem/` is the most recent run. When in doubt about what a planning artifact should contain, read the dilations set.

## When to Use

- Rough MVP idea → need PRD.
- PRD in hand → need UX spec before design/build.
- UX spec done → need sequential, self-contained build prompts.
- Planning a new module in the Grade 8 Geometry progression.
- Decomposing phases into interaction rounds.

**When not:** One-off screens, non-educational UIs, non-R3F modules.

## Planning Sequence

The planning process follows this sequence, which was validated during Module 2 planning. Each step produces input for the next:

```
Standards alignment → ALD instrument design → Key decisions (pre-flight)
    → Phase architecture → Round decomposition → Visual scaffolding
        → UX spec (6 passes) → Build-order prompts
```

This sequence matters because phases can't be designed until ALDs are defined (the phase exists to move students through ALD levels), and rounds can't be designed until key decisions are resolved (parameter values, scope boundaries, session estimates constrain what's possible within a phase).

## Core Vocabulary

These terms have specific meanings in this pipeline:

| Term | Definition |
|------|-----------|
| **Phase** | A major pedagogical stage within a module (e.g., "Scale Factor Intuition"). Each phase targets one or more ALD levels and contains multiple rounds. |
| **Round** | A specific interaction within a phase (e.g., "k = 2 — Enlargement"). Has an ID, label, description, and visual scaffolding spec. Rounds are the atomic unit of interaction design. |
| **Visual scaffolding** | Per-round specification of what visual elements appear and why they matter pedagogically (e.g., "Ray-from-origin lines appear during reveal"). Required for every round. |
| **Design insight** | Cross-module learning — what was learned from a previous module that changes how this one is designed. Required for every phase in any module after the first in a progression. |
| **ALD instrument** | The specific interaction that demonstrates student performance at a given achievement level. Not what the student *knows*, but what the student *does*. |
| **Key decisions** | Module-level constraints that must be resolved before phase design: parameter values, scope boundaries, session estimate, deferred items. |
| **Reuse matrix** | Component-level tracking of what's reused vs. new across all modules in the progression. Lives in the planning artifact, referenced (not duplicated) by the PRD. |
| **Earned reveal** | The intentional delay of formal notation until students have built conceptual grounding through interaction. Notation appears as confirmation ("here's the rule for what you just discovered"), not prerequisite. The central pedagogical principle — see `docs/philosophy.md`. |
| **Core question / answer** | Every module poses a question the student earns the answer to (e.g., "What stays the same when a shape grows?" → "Angles preserved, side ratios preserved, distances scale by k"). Defined in the PRD's Learning Target section. |
| **Standard** | An LSSM content standard targeted by the module, with fields: code (e.g., 8.G.A.3), text, rigor components, scope constraints, and whether it's shared with another module. Defined in the PRD's Standards Alignment section. |

## Steps & Outputs

| Step | Input | Output |
|------|--------|--------|
| 1 | MVP idea + standards | `docs/modules/{module-name}/prd.md` |
| 2 | PRD | `docs/modules/{module-name}/ux-spec.md` |
| 3 | UX spec | `docs/modules/{module-name}/build-order-prompts.md` |

**Rules:**
- Output to file only.
- Step 1: Resolve key decisions before phase design. Decompose every phase into rounds. Force a visual scaffolding answer for every round.
- Step 2: Complete all 6 passes (Mental Model → IA → Affordances → Cognitive Load → State Design → Flow Integrity) before visual specs. IA maps to the round structure. State design enumerates states per round.
- Step 3: Each prompt maps to one or more rounds. Self-contained — context, requirements, technical details, states, integration points. Integration points reference round IDs. **Each prompt names the standard and ALD level its rounds serve** — the ALD thread must survive past the PRD. Numeric round parameters (knowns, unknowns, answers) are copied verbatim from UX spec Pass 5, and each answer must be re-derivable from its listed knowns. The final documentation prompt copies the PRD's standards table verbatim into the module's ARCHITECTURE.md.

## Stage Flow

Modules use a stage-based flow, but the specific stages depend on the module's pedagogy. The reference flow is **Observe → Manipulate → Discover → Celebrate**, but this is a starting point, not a constraint.

When planning a module, derive the stage flow from the learning target and ALD progression, not from the reference pattern. Document the chosen flow explicitly in the PRD's Stage Flow section and justify any deviation from the reference.

Within each phase, the M2 planning process revealed a consistent sub-arc: **spatial discovery first** (what happens?), then **earned property observation** (what stayed the same?). In Module 1 this pattern emerged retroactively; in Module 2 it was designed from the start. The PRD template encodes this as the expected round structure.

## References

- **Step 1:** `references/prd-generator.md` — PRD section templates (Learning Target → Technical Constraints), including Phase & Round Architecture.
- **Step 2:** `references/prd-to-ux.md` — 6 passes + visual specs, round-aware.
- **Step 3:** `references/ux-to-prompts.md` — round-mapped build sequence, prompt template.

Use `docs/modules/dilations/` (prd.md, ux-spec.md, build-order-prompts.md) as the reference planning artifacts.

## Common Mistakes

| Mistake | Fix |
|--------|-----|
| PRD/UX/prompts in conversation | Write to file paths above. |
| Visuals before 6 passes | Complete passes, then visuals. |
| Merging passes | One pass at a time. |
| Prompts without integration points | Include previous/next + round IDs + file structure. |
| Vague prompts | Specify camera, coords, animation hooks, file layout. |
| Forcing Observe → Manipulate → Discover → Celebrate | Derive stage flow from the learning target. Document and justify the chosen flow. |
| Phases without rounds | Every phase must decompose into specific interaction rounds with IDs, labels, descriptions, and visual scaffolding. |
| Missing design insights | Required for every phase in modules after the first in the progression. Forces cross-module learning. |
| Skipping key decisions | Resolve parameter values, scope, session estimate before phase design. These are module-level constraints that unlock everything downstream. |
| Duplicating the reuse matrix | The PRD references the reuse matrix in the planning artifact. It specifies which components this module consumes and introduces, not the full matrix. |
| Rounds without visual scaffolding | Every round must answer "what visual elements appear and why?" — even if the answer is "no new visuals; same as previous round." |
| ALD thread dropped after the PRD | Each build prompt names its standard + ALD level; the architecture doc copies the PRD standards table. (M3: ALDs vanished at the prompts handoff and 8.G.B.6 fell out of the as-built docs.) |
| Copy schema frozen before all interactions are known | The copy schema must be able to express every distinct prompt string in the UX spec, including sub-step prompts. (M3: `Record<RoundId, {prompt, subtext}>` was defined in Prompt 1 and structurally could not hold Phase 4's construct-step question — it silently disappeared.) |