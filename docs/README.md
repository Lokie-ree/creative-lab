# Documentation

Planning, designing, and building interactive learning modules that help students discover mathematical relationships through manipulation before formal notation.

---

## Foundational documents (read first)

These two documents define the **pedagogy** and **standards alignment** that every module must satisfy.

| Document | Purpose |
|----------|---------|
| [**philosophy.md**](./philosophy.md) | Discovery-first pedagogy: earned reveal, visual confirmation, understanding before notation. Students manipulate, observe patterns, then receive formalization as confirmation. |
| [**product.md**](./product.md) | LSSM standards alignment: maps discovery-first interactions to Achievement Level Descriptors (ALDs) and demonstrates how modules move students from Level 3 (Basic) to Level 5 (Advanced). |

**Use these when:**

- Designing a new module or feature
- Evaluating whether an interaction satisfies rigor requirements
- Making tradeoffs between complexity and clarity

---

## Module planning pipeline

New modules follow this design process:

```
Design Spec → Mockups → Validation → Implementation → Architecture Doc
```

1. **Design Spec** — Standards-grounded design (pedagogy, ALD progression, interactions); see `docs/professional/ModulePlanning.jsx` for the M2/M3 planning artifact
2. **Validation** — Verify spec satisfies ALD requirements and reuse matrix before building
3. **Implementation** — Build components following the rigid-motions file structure as reference
4. **Architecture Doc** — Document as-built implementation for future reference

The `module-planning-pipeline` skill guides this process.

---

## Documentation structure

| Path | Purpose |
|------|---------|
| [**design/**](./design/) | Design specs and audits for active work. Sinewaves polish and performance audit live here. |
| [**professional/**](./professional/) | Resume, ISTE storyboards, and module planning artifacts. |

---

## Root-level references

- [**VISION.md**](../VISION.md) — Career positioning, audience, guiding principles.
- [**CLAUDE.md**](../CLAUDE.md) — AI agent instructions: architecture, commands, design system.
- [**Sinewaves ARCHITECTURE.md**](../src/components/modules/sinewaves/ARCHITECTURE.md) — Reference implementation for completed module.
- [**Rigid Motions ARCHITECTURE.md**](../src/components/modules/rigid-motions/ARCHITECTURE.md) — As-built documentation for rigid motions (all 4 phases complete).
- [**Module skeleton**](../src/lib/skeleton/README.md) — Reusable hooks for future modules.
- [**Rigid Motions ARCHITECTURE.md**](../src/components/modules/rigid-motions/ARCHITECTURE.md) — Reference implementation for the completed module; use as the pattern for M2.
