# Documentation

This folder holds the documentation for planning, designing, and building interactive learning modules.

---

## Foundational documents (read first)

These two documents define the **pedagogy** and **product alignment** that every module must satisfy. All planning and development docs assume and extend them.

| Document | Purpose |
|----------|---------|
| [**philosophy.md**](./philosophy.md) | Mastery through discovery: earned reveal, visual confirmation, understanding-before-notation. Design North Star for every module. |
| [**alignment-product.md**](./alignment-product.md) | LSSM alignment: how discovery-first design maps to state rigor (Conceptual Understanding, Procedural Fluency, Application) and to Algebra I / Geometry standards. |

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

| Step | Document | Description |
|------|----------|-------------|
| 1 | [modules/prd-generator.md](./modules/prd-generator.md) | Turn a rough MVP idea into a demo-grade PRD (sections 1–7). |
| 2 | [modules/prd-to-ux.md](./modules/prd-to-ux.md) | Turn the PRD into a UX specification (6 passes, then visual specs). |
| 3 | [modules/ux-to-prompts.md](./modules/ux-to-prompts.md) | Turn the UX spec into sequential, self-contained build-order prompts. |

Generated artifacts (PRDs, UX specs, build-order prompts) live in the module’s directory, e.g. `docs/modules/<module-name>/`.

---

## Other docs

| Path | Purpose |
|------|---------|
| [design/](./design/) | Design critiques, HUD direction, refactor specs (e.g. SINEWAVES-REFACTOR-SPEC.md). |
| [plans/](./plans/) | Implementation plans and sprint notes (e.g. sinewaves polish, instrument refactor). |
| [professional/](./professional/) | Resume and professional materials. |

---

## Root-level references

- [**PORTFOLIO_VISION.md**](../PORTFOLIO_VISION.md) — Career thesis, audience, guiding principles. References the same pedagogy as [philosophy.md](./philosophy.md).
- [**AGENT.md**](../AGENT.md) — Instructions for AI agents; points here and to foundational docs.
- [**CLAUDE.md**](../CLAUDE.md) — Architecture, commands, design system; points here and to foundational docs.
