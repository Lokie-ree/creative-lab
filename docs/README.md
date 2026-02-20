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
Design Spec → Static Mockups → Validation → Implementation → Architecture Doc
```

1. **Design Spec** — Standards-grounded design (pedagogy, ALD progression, interactions)
2. **Static Mockups** — HTML/CSS prototypes validating visual design and layout
3. **Validation** — Verify mockups satisfy spec requirements
4. **Implementation** — Build components matching validated mockups
5. **Architecture Doc** — Document as-built implementation for future reference

The `module-planning-pipeline` skill guides this process.

---

## Documentation structure

| Path | Purpose |
|------|---------|
| [**design/**](./design/) | Design specs, audits, and current direction. Start with [design/README.md](./design/README.md) for Eurorack design system and module status. |
| [**plans/**](./plans/) | Active design specs for modules in development (e.g., rigid motions). |
| [**archive/**](./archive/) | Completed implementation plans and resolved audits. Historical reference only. |
| [**professional/**](./professional/) | Resume and career materials. |

---

## Root-level references

- [**PORTFOLIO_VISION.md**](../PORTFOLIO_VISION.md) — Career positioning, audience, guiding principles.
- [**AGENT.md**](../AGENT.md) — AI agent instructions: architecture, commands, design system.
- [**Sinewaves ARCHITECTURE.md**](../src/components/modules/sinewaves/ARCHITECTURE.md) — Reference implementation for completed module.
- [**Module skeleton**](../src/lib/skeleton/README.md) — Reusable hooks for future modules.
- [**Mockups**](../mockups/) — Static HTML prototypes for design validation.
