# Documentation

This folder holds the documentation for planning, designing, and building interactive learning modules.

---

## Foundational documents (read first)

These two documents define the **pedagogy** and **product alignment** that every module must satisfy. All planning and development docs assume and extend them.

| Document | Purpose |
|----------|---------|
| [**philosophy.md**](./philosophy.md) | Mastery through discovery: earned reveal, visual confirmation, understanding-before-notation. Design North Star for every module. |
| [**product.md**](./product.md) | LSSM alignment: how discovery-first design maps to state rigor (Conceptual Understanding, Procedural Fluency, Application) and to Algebra I / Geometry standards. |

**Single source:** Pedagogy is defined in philosophy.md; product.md maps those principles to LSSM and does not redefine them.

**Use them when:**

- Defining or reviewing a new module idea
- Writing or reviewing a PRD, UX spec, or build-order prompts
- Making design tradeoffs (e.g., when to show notation, how to assess)

---

## Module planning pipeline

Planning and developing a new module follows a fixed pipeline. Each step consumes the output of the previous one and must stay aligned with the foundational docs.

```
MVP idea → PRD → UX spec → Build-order prompts → Implementation
```

The pipeline is implemented as the `module-planning-pipeline` Claude Code skill. Generated artifacts (PRDs, UX specs, build-order prompts) live in the module's directory, e.g. `docs/modules/<module-name>/`.

---

## Other docs

| Path | Purpose |
|------|---------|
| [design/](./design/) | Design specs and audits. Specs (e.g. SINEWAVES-REFACTOR-SPEC.md) define what to build; audits (e.g. SINEWAVES-FRONTEND-DESIGN-AUDIT.md) assess current state. |
| [plans/](./plans/) | Implementation plans: task-by-task execution (e.g. 2026-02-05-sinewaves-instrument-refactor.md). Use after a design spec is approved. |
| [professional/](./professional/) | Resume and professional materials. |

---

## Root-level references

- [**PORTFOLIO_VISION.md**](../PORTFOLIO_VISION.md) — Career thesis, audience, guiding principles. References the same pedagogy as [philosophy.md](./philosophy.md).
- [**AGENT.md**](../AGENT.md) — AI agent instructions: architecture, commands, design system, current state, guidelines; points here and to foundational docs.
