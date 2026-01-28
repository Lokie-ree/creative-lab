---
name: ux-to-prompts
description: Convert UX specifications into sequential, self-contained build-order prompts for implementing interactive educational modules. Use after completing the UX spec (prd-to-ux).
---

# UX to Build-Order Prompts
## Implementation Prompt Generator

**Workflow Position:** Step 3 of 3  
**Input:** UX specification file (from `prd-to-ux`)  
**Output:** Build-order prompts file (9 sequential prompts)  
**Next Step:** Use prompts sequentially for implementation

---

**Complete Planning Pipeline:**
```
MVP Idea → PRD (prd-generator) → UX Spec (prd-to-ux) → Build Prompts (this module) → Implementation
```

## Overview

Transform a completed UX specification into a sequence of actionable, self-contained prompts that guide implementation of an interactive educational module.

**Core principle:** Each prompt is complete enough to be used independently with UI generation tools (v0, Bolt, Claude frontend-design) or as implementation guides for manual development.

**Context:** These prompts are for building interactive learning modules using React Three Fiber, GSAP animations, and stage-based pedagogical flows. Reference existing module patterns from `docs/modules/vector-transformations/module-anatomy.md`.

## When to Use

- After completing a UX specification (from `prd-to-ux`)
- Before starting implementation
- When generating prompts for AI-assisted development
- When creating implementation documentation

**Input:** UX specification file (from `prd-to-ux` module)  
**Output:** Build-order prompts file in the same directory

## Output Location

**Write the build-order prompts to a file in the same directory as the UX spec.**

Naming convention:
- If UX spec is `ux-spec.md` → output `build-order-prompts.md`
- If UX spec is `module-name-ux-spec.md` → output `module-name-build-order-prompts.md`

Pattern: `{ux-spec-basename}-build-order-prompts.md` (or just `build-order-prompts.md` if UX spec is `ux-spec.md`)

**Do not output to conversation.** Always write to file so prompts are persistent and can be used sequentially.

## The Build Sequence Pattern

Every module follows a consistent build order optimized for:
1. **Foundation first** - Math utilities, types, design tokens
2. **Visualization core** - Canvas, grid, coordinate systems
3. **Interactive elements** - Controls, sliders, parameter inputs
4. **Feedback systems** - Real-time updates, animations, state changes
5. **Challenge mode** - Target matching, proximity detection
6. **Discovery feedback** - Badges, celebrations, reveals
7. **Polish** - Responsive, accessibility, performance

## Prompt Structure Template

Each prompt must be self-contained with:

```markdown
## Prompt N: [Component/Feature Name]

### Context
[What this builds and why it's needed at this point in the sequence]

### Requirements
[Specific, measurable requirements for this prompt]

### Technical Details
[Implementation specifics: React Three Fiber setup, GSAP animations, component structure]

### Component Structure
[TypeScript interfaces, props, file organization]

### States
[What states this component/element has and how they transition]

### Constraints
[What NOT to do, edge cases, performance considerations]

### Integration Points
[How this connects to previous prompts and what comes next]
```

## Standard Build Sequence

### Phase 1: Foundation (Prompts 1-2)

**Prompt 1: Math Utilities & Types**
- Core mathematical functions
- TypeScript type definitions
- Design tokens (lab color system)
- No UI components yet

**Prompt 2: Canvas & Coordinate System**
- React Three Fiber Canvas setup
- Grid/coordinate system
- Camera configuration
- Base visualization container

### Phase 2: Core Visualization (Prompts 3-4)

**Prompt 3: Primary Visualization Elements**
- Main 3D/2D elements (vectors, waves, graphs, etc.)
- Animation setup (GSAP integration)
- Real-time update mechanism

**Prompt 4: Parameter Controls**
- Slider components (using shared ParameterSlider pattern)
- Control panel layout
- Progressive unlock logic (if applicable)

### Phase 3: Interactive Flow (Prompts 5-6)

**Prompt 5: Challenge Mode**
- Target matching system
- Proximity detection
- Feedback indicators

**Prompt 6: Discovery & Celebration**
- Discovery badge system
- Celebration effects
- Transformation type detection

### Phase 4: Reveal & Polish (Prompts 7-9)

**Prompt 7: Reveal Panel**
- Modal/overlay structure
- Formula/notation display
- Explanation content

**Prompt 8: State Management & Nudges**
- Idle detection
- Tooltip system
- Hint system
- Stage transitions

**Prompt 9: Responsive & Accessibility**
- Mobile layout
- Keyboard navigation
- Screen reader support
- Performance optimization

## Module-Specific Adaptations

### For Modules with Stage Machines

If the UX spec defines stages (Observe → Manipulate → Discover → Celebrate):

**Add Prompt 2.5: Stage Manager**
- Stage definitions (declarative config)
- Stage transition logic
- UI visibility rules per stage
- Reference `module-anatomy.md` for patterns

### For Modules with Progressive Reveal

If complexity unlocks gradually:

**Enhance Prompt 4** with:
- Unlock condition tracking
- Progressive reveal animations
- State management for unlock triggers

### For Modules with Multiple Visualizations

If multiple 3D elements need coordination:

**Split Prompt 3** into:
- Prompt 3a: Primary visualization
- Prompt 3b: Secondary visualization
- Prompt 3c: Connection/relationship visualization

## Reference Existing Patterns

When generating prompts, reference:

1. **Module Anatomy** (`docs/modules/vector-transformations/module-anatomy.md`)
   - Stage machine patterns
   - Component library patterns
   - Feedback loop architecture

2. **Existing Build Prompts** (`docs/modules/vector-transformations/build-order-prompts.md`)
   - Use as template for structure
   - Adapt for module-specific needs

3. **Tech Stack Assumptions**
   - React Three Fiber for 3D
   - GSAP for animations
   - Tailwind + lab color system
   - TypeScript throughout

## Prompt Quality Checklist

Each prompt should:

- [ ] Be self-contained (can be used independently)
- [ ] Include complete TypeScript interfaces
- [ ] Specify file structure and organization
- [ ] Reference previous prompts for context
- [ ] Include integration points with next prompts
- [ ] Define states and transitions clearly
- [ ] Include accessibility requirements
- [ ] Specify responsive behavior
- [ ] Include performance considerations
- [ ] Reference shared patterns from module-anatomy

## Example: Vector Transformations Reference

See `docs/modules/vector-transformations/build-order-prompts.md` for a complete example of:
- 9 sequential prompts
- Self-contained structure
- Technical detail level
- Integration between prompts
- Quality checklist at end

## Output Template

```markdown
# [Module Name] Module
## Build-Order Prompts

**Version:** 1.0  
**Created:** [Date]  
**Based on:** UX Spec v1.0  
**Purpose:** Sequential, self-contained prompts for UI generation tools

---

## Overview

[Brief description of the module and its learning goal]

**Tech Stack:**
- React Three Fiber + drei for 3D visualization
- GSAP for animations
- Tailwind CSS with lab color system
- TypeScript

---

## Build Sequence

1. **Foundation** - [Description]
2. **Layout Shell** - [Description]
3. **Visualization Components** - [Description]
4. **Controls** - [Description]
5. **Challenge Mode** - [Description]
6. **Discovery Feedback** - [Description]
7. **Reveal Panel** - [Description]
8. **State Refinement** - [Description]
9. **Polish** - [Description]

---

## Prompt 1: [Name]
[Full prompt content following template]

---

## Prompt 2: [Name]
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
PRD (prd-generator.md)
  ↓
UX Spec (prd-to-ux.md) ← You are here
  ↓
Build Prompts (ux-to-prompts.md) ← Generate this
  ↓
Implementation
```

**After generating prompts:**
1. Review prompts for completeness
2. Ensure each prompt references previous work
3. Verify integration points are clear
4. Add module-specific quality checklist
5. Proceed to implementation (use prompts sequentially)

## Red Flags - STOP and Review UX Spec

If you find yourself:

- **Guessing at implementation details** → UX spec may be missing Pass 5 (State Design)
- **Unclear about component structure** → UX spec may need Pass 2 (Information Architecture)
- **Unsure about interactions** → UX spec may need Pass 3 (Affordances)
- **Confused about flow** → UX spec may need Pass 6 (Flow Integrity)

**Solution:** Return to UX spec, complete missing passes, then regenerate prompts.

## Common Mistakes

**Skipping foundation prompts:** "I'll add types later" → Types inform everything, do them first.

**Merging unrelated prompts:** "I'll do controls and challenge mode together" → Each prompt should be independently implementable.

**Missing integration points:** "This component exists in isolation" → Always show how it connects to previous and next work.

**Vague technical details:** "Use React Three Fiber" → Specify camera setup, coordinate system, animation hooks.

**Ignoring existing patterns:** "I'll invent my own stage system" → Reference module-anatomy.md patterns.

## Done When

A developer could:
- Take any single prompt
- Implement it without referring to other prompts
- Understand how it fits into the overall module
- Know what file structure to create
- Have clear TypeScript types to work with
- See integration points with previous/next prompts

---

*This module completes the planning pipeline: PRD → UX Spec → Build Prompts → Implementation.*
