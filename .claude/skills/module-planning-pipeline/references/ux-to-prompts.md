---
name: ux-to-prompts
description: Convert UX specifications into sequential, self-contained build-order prompts for implementing interactive educational modules. Round-mapped — each prompt implements one or more rounds from the Phase & Round Architecture. Use after completing the UX spec (prd-to-ux).
---

# UX to Build-Order Prompts
## Implementation Prompt Generator

**Workflow Position:** Step 3 of 3
**Input:** UX specification file (from `prd-to-ux`) + PRD (for round IDs and architecture reuse)
**Output:** Build-order prompts file
**Next Step:** Use prompts sequentially for implementation

---

**Foundational alignment:** Build-order prompts must preserve the pedagogy in `docs/philosophy.md` and `docs/product.md`. Each prompt should reinforce: discovery before formula, manipulation before explanation, earned reveal (notation only after conceptual grounding), and visual confirmation (success via manipulation/construction, not multiple choice). When the module targets LSSM standards, prompts should reference the relevant rigor component and content cluster.

**Round-mapped prompts:** The PRD contains a Phase & Round Architecture section with specific interaction rounds, each with an ID. The UX spec maps states, affordances, and visual scaffolding to these round IDs. Build prompts should reference round IDs so there's a traceable chain from PRD → UX spec → build prompt → implementation.

---

**Complete Planning Pipeline:**
```
MVP Idea → PRD (prd-generator) → UX Spec (prd-to-ux) → Build Prompts (this module) → Implementation
```

## Overview

Transform a completed UX specification into a sequence of actionable, self-contained prompts that guide implementation of an interactive educational module.

**Core principle:** Each prompt is complete enough to be used independently with UI generation tools (v0, Bolt, Claude frontend-design) or as implementation guides for manual development.

**Context:** These prompts are for building interactive learning modules using React Three Fiber, GSAP animations, and stage-based pedagogical flows. Pedagogy and product alignment are defined in `docs/philosophy.md` and `docs/product.md`. Reference existing module patterns in the codebase for product/technical framing.

## When to Use

- After completing a UX specification (from `prd-to-ux`)
- Before starting implementation
- When generating prompts for AI-assisted development
- When creating implementation documentation

**Input:** UX specification file (from `prd-to-ux` module) + PRD (for round structure and reuse info)
**Output:** Build-order prompts file in the same directory

## Output Location

**Write the build-order prompts to a file in the same directory as the UX spec.**

Naming convention:
- If UX spec is `ux-spec.md` → output `build-order-prompts.md`
- If UX spec is `module-name-ux-spec.md` → output `module-name-build-order-prompts.md`

**Do not output to conversation.** Always write to file so prompts are persistent and can be used sequentially.

## The Build Sequence Pattern

The build sequence has two layers: a **reference foundation** that most modules need, and a **round-mapped body** that's driven by the PRD's Phase & Round Architecture.

**The grouping below is a reference shape — adapt it to the module.** (M3 merged copy into Prompt 1 and collapsed the tail into a single QA prompt; that was fine.) What must survive **any** regrouping:

1. Every prompt names its round IDs **and the standard + ALD level those rounds serve**
2. Numeric round parameters (knowns, unknowns, answers) copied **verbatim** from UX spec Pass 5, each answer re-derivable from its listed knowns
3. A copy schema that can express **every distinct prompt string** in the UX spec, including sub-step prompts
4. Celebration integration covers **both** `DiscoveryTab` and `BehindThisTab`, with copy imported from the module's `-copy.ts` (not inline JSX)
5. The final QA prompt includes the copy-wiring audit (see Fixed Tail)

Dropping the ceremony is allowed; dropping these five is how pedagogy leaks (all five leaked in the M3 build).

### Reference Foundation (Prompts 1–3)

These prompts are consistent across modules. They set up the infrastructure that rounds plug into.

**Prompt 1: Math Utilities, Types & Design Tokens**
- Core mathematical functions for this module
- TypeScript type definitions (including Round, Phase, State types)
- Design tokens (lab color system)
- No UI components yet

**Prompt 2: Canvas, Coordinate System & Stage Machine**
- React Three Fiber Canvas setup
- Grid/coordinate system
- Camera configuration
- Stage machine scaffold (phase/round progression engine)
- Base visualization container

**Prompt 3: Shared Interaction Primitives**
- Components reused from previous modules (from the PRD's Technical Constraints & Key Decisions section)
- Ghost/preview system, predict/reveal loop, SpriteLabel, etc.
- Integration with stage machine

### Round-Mapped Body (Prompts 4–N)

This is where the prompt structure adapts to the module's round count. The mapping strategy:

**Grouping rules:**
- Rounds within the same phase that share visual scaffolding and interaction patterns → group into one prompt
- Rounds that introduce new components or interaction types → separate prompt
- The capstone round always gets its own prompt (it integrates everything) — **including celebration: branches in both `DiscoveryTab` and `BehindThisTab`**, with copy imported from the module's `-copy.ts`, not written inline in the celebration components

**For each prompt in the body:**
1. Name the prompt after the rounds it implements
2. List the round IDs at the top
3. Reference the UX spec's state table for those rounds (Pass 5)
4. Reference the visual scaffolding from the PRD
5. Specify which components from Prompt 3 this round consumes
6. Specify what new components this round introduces

### Fixed Tail (Final 2 Prompts)

**Prompt N-1: Polish & Transitions**
- Round transition animations
- Idle detection and hint system
- Stage machine refinement
- Performance optimization

**Prompt N: Responsive & Accessibility** (may merge with N-1 into one QA prompt)
- Mobile layout
- Keyboard navigation
- Screen reader support
- **Copy-wiring audit:** every export of the module's `-copy.ts` is imported and rendered somewhere; delete or wire dead copy. (M3 shipped `PHASE_INTRO` defined, documented, and never rendered — nothing caught it.)
- **Standards sync:** the architecture doc's standards table matches the PRD's verbatim

## Prompt Structure Template

Each prompt must be self-contained with:

```markdown
## Prompt N: [Feature Name]

### Rounds Implemented
[List of round IDs this prompt implements, e.g., dilate-k2, dilate-k2-properties, dilate-k3]

### Context
[What this builds and why it's needed at this point in the sequence. Reference the phase and its ALD target.]

### Requirements
[Specific, measurable requirements for this prompt]

### Visual Scaffolding
[From the PRD — what visual elements appear in these rounds and why. Expand with concrete specs from the UX spec's visual specifications section.]

### Technical Details
[Implementation specifics: React Three Fiber setup, GSAP animations, component structure]

### Component Structure
[TypeScript interfaces, props, file organization]

### States Per Round
[From UX spec Pass 5 — entry, active, prediction, reveal, completion states for each round. Include copy-per-state: every distinct prompt string from the UX spec's IA/Affordances/State passes maps to a named field in the copy schema; rounds with sub-steps key their copy on sub-step. If the schema can't hold a string the UX spec wrote, fix the schema — don't drop the string.]

### Constraints
[What NOT to do, edge cases, performance considerations]

### Integration Points
- **Consumes from previous prompts:** [Components, utilities, types]
- **Produces for later prompts:** [New components, state changes, exports]
- **Round transitions:** [How these rounds connect to the next prompt's rounds]
```

## Example: Mapping Module 2 (Dilations) Rounds to Prompts

This example shows how Module 2's rounds map to build prompts (shipped artifacts: `docs/modules/dilations/`):

```
Prompt 1: Foundation (types, math, tokens)
Prompt 2: Canvas + Stage Machine
Prompt 3: Shared Primitives (ghost, predict/reveal, SpriteLabel — from M1)

Prompt 4: Scale Factor Exploration
  → Rounds: dilate-k2, dilate-k2-properties, dilate-k3
  → New: scale factor slider, origin-anchored dilation, ray-from-origin lines
  → ALD: L3

Prompt 5: Fractional Scale Factors
  → Rounds: dilate-k-half, dilate-summary
  → Reuses: slider, dilation logic from Prompt 4
  → New: ratio annotations for k<1
  → ALD: L3 (completes)

Prompt 6: Coordinate Dilation
  → Rounds: coord-k2, coord-k-half, coord-k-third
  → New: coordinatesActive flag, FormulaReadout for (x,y)→(kx,ky)
  → ALD: L4

Prompt 7: Similarity Sequences
  → Rounds: similarity-guided, similarity-rigid-dilation, similarity-inverse
  → Reuses: SequenceBuilder from M1 capstone
  → New: dilation as SequenceBuilder step, similarity validation
  → ALD: L4–L5

Prompt 8: AA Discovery & Capstone
  → Rounds: aa-discover, aa-confirm, capstone-final
  → New: computed angle labels, AA criterion flow, CelebrationModal integration
  → ALD: L5

Prompt 9: Polish & Transitions
Prompt 10: Responsive & Accessibility
```

This is illustrative. The actual grouping depends on the specific module's round structure and complexity.

## Module-Specific Adaptations

### For Modules Reusing Significant M1 Infrastructure

If the PRD's Technical Constraints & Key Decisions section lists many consumed components, Prompt 3 (Shared Primitives) may need splitting:
- Prompt 3a: Interaction primitives (predict/reveal, ghost, scoring)
- Prompt 3b: Display primitives (SpriteLabel, FormulaReadout, coordinate system)

### For Modules with Complex Round Transitions

If the UX spec's Pass 4 (Cognitive Load) identifies complex round transitions, add a dedicated prompt after the round-mapped body:
- **Prompt N-2: Round Transitions & Flow** — transition animations, gating logic, progress indicators

### For Modules Introducing Many New Components

If a single phase introduces 3+ new component types, split into multiple prompts even if the rounds share a phase:
- Group by component type, not by round sequence
- Each prompt should still list the round IDs it serves

## Reference Existing Patterns

When generating prompts, reference:

1. **Existing module patterns** in the codebase
   - Stage machine patterns
   - Component library patterns
   - Feedback loop architecture

2. **Foundational pedagogy and alignment**
   - `docs/philosophy.md` — earned reveal, visual confirmation, understanding precedes notation
   - `docs/product.md` — LSSM rigor, content clusters, ALDs

3. **Planning artifacts**
   - `docs/modules/dilations/` (prd.md, ux-spec.md, build-order-prompts.md) — reference for round structure, reuse tracking, design insights

4. **Tech Stack Assumptions**
   - React Three Fiber for 3D
   - GSAP for animations
   - Tailwind + lab color system
   - TypeScript throughout

## Prompt Quality Checklist

Each prompt should:

- [ ] List the round IDs it implements
- [ ] Name the standard + ALD level those rounds serve (also in the round-to-prompt map)
- [ ] Numeric round parameters (knowns, unknowns, answers) copied verbatim from UX spec Pass 5; each answer re-derivable from its listed knowns
- [ ] Copy schema covers every distinct prompt string from the UX spec, including sub-step prompts
- [ ] Capstone prompt covers both `DiscoveryTab` and `BehindThisTab`, copy sourced from the module's `-copy.ts`
- [ ] Be self-contained (can be used independently)
- [ ] Include complete TypeScript interfaces
- [ ] Specify file structure and organization
- [ ] Reference previous prompts for context
- [ ] Include integration points with next prompts
- [ ] Define states per round (from UX spec Pass 5)
- [ ] Include visual scaffolding specs (from PRD + UX spec)
- [ ] Include accessibility requirements
- [ ] Specify responsive behavior
- [ ] Include performance considerations
- [ ] Reference reused components from previous modules

## Output Template

```markdown
# [Module Name] Module
## Build-Order Prompts

**Version:** 1.0
**Created:** [Date]
**Based on:** UX Spec v1.0 + PRD Phase & Round Architecture
**Purpose:** Sequential, self-contained prompts for UI generation tools
**Round count:** [N rounds across M phases → P build prompts]

---

## Overview

[Brief description of the module and its learning goal]

**Tech Stack:**
- React Three Fiber + drei for 3D visualization
- GSAP for animations
- Tailwind CSS with lab color system
- TypeScript

**Round-to-Prompt Map:**

| Prompt | Rounds | Phase | ALD |
|--------|--------|-------|-----|
| 1 | — | Foundation | — |
| 2 | — | Canvas + Stage Machine | — |
| 3 | — | Shared Primitives | — |
| 4 | [round-ids] | [Phase title] | [ALD level] |
| 5 | [round-ids] | [Phase title] | [ALD level] |
| ... | ... | ... | ... |
| N-1 | — | Polish & Transitions | — |
| N | — | Responsive & Accessibility | — |

---

## Prompt 1: Foundation
[Full prompt content following template]

---

## Prompt 2: Canvas & Stage Machine
[Full prompt content following template]

---

[... continue for all prompts ...]

---

## Implementation File Structure

```
/src/components/modules/[module-name]/
├── Module.tsx                      # Main orchestrator
├── [Component1].tsx                # From Prompt N
├── [Component2].tsx                # From Prompt N
└── utils/
    ├── [math-utils].ts             # From Prompt 1
    ├── [types].ts                  # From Prompt 1
    └── [colors].ts                 # From Prompt 1
```

---

## Quality Checklist

[Module-specific checklist based on PRD and UX spec requirements]

---

## Next Steps After Build

1. **User testing:** [Guidance]
2. **Refinement:** [Guidance]
3. **Documentation:** [Guidance]
4. **Integration:** [Guidance]

---

*These prompts can be used sequentially with UI generation tools or as implementation guides for manual development.*
```

## Integration with Workflow

**Complete workflow chain:**

```
MVP Idea
  ↓
PRD (prd-generator.md) — Phase & Round Architecture, ALD instruments, key decisions
  ↓
UX Spec (prd-to-ux.md) — 6 passes, round-aware state design
  ↓
Build Prompts (this module) — Round-mapped, self-contained
  ↓
Implementation
```

**After generating prompts:**
1. Verify the round-to-prompt map covers all round IDs from the PRD
2. Ensure each prompt references previous work
3. Verify integration points are clear and use round IDs
4. Add module-specific quality checklist
5. Proceed to implementation (use prompts sequentially)

## Red Flags - STOP and Review UX Spec

If you find yourself:

- **Guessing at implementation details** → UX spec may be missing Pass 5 (State Design per round)
- **Unclear about component structure** → UX spec may need Pass 2 (IA mapped to rounds)
- **Unsure about interactions** → UX spec may need Pass 3 (Affordances with round-active columns)
- **Confused about flow** → UX spec may need Pass 6 (Flow Integrity with round sequence validation)
- **Can't find a round ID** → the PRD's Phase & Round Architecture may be missing round decomposition

**Solution:** Return to UX spec or PRD, complete missing sections, then regenerate prompts.

## Common Mistakes

**Skipping foundation prompts:** "I'll add types later" → Types inform everything, do them first.

**Merging unrelated rounds into one prompt:** Each prompt should implement rounds that share infrastructure. If two rounds need completely different components, they're separate prompts.

**Missing round IDs:** "This prompt builds Phase 2" → Reference specific round IDs. They're the traceable chain from PRD to implementation.

**Missing integration points:** "This component exists in isolation" → Always show how it connects to previous and next work, including round transitions.

**Vague technical details:** "Use React Three Fiber" → Specify camera setup, coordinate system, animation hooks.

**Ignoring reuse:** "I'll build this from scratch" → Check the PRD's Technical Constraints & Key Decisions section for consumed components first.

**Inventing or inverting round parameters:** "answer=8, unknownSide='a'" when side a is 6 → self-contradictory prompts force the implementer to guess, and the guess silently diverges from the PRD (this happened in M3's `solve-leg-6810`). Copy parameters verbatim and sanity-check each answer against its knowns.

## Done When

A developer could:
- Take any single prompt
- Know exactly which rounds it implements
- Implement it without referring to other prompts
- Understand how it fits into the overall module
- Know what file structure to create
- Have clear TypeScript types to work with
- See integration points with previous/next prompts
- Trace the implementation back to the PRD's round IDs

---

*This module completes the planning pipeline: PRD → UX Spec → Build Prompts → Implementation.*