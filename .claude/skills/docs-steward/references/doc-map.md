# Doc Map — Creative Lab

Canonical inventory of every documentation file, its role, update trigger, and authority level.
Update this file whenever a doc is added, renamed, archived, or deleted.

**Last updated:** April 14, 2026

---

## Root-level docs

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `CLAUDE.md` | Agent instructions — architecture, commands, design system, current state, outstanding work | After every significant build session | Highest |
| `VISION.md` | Career positioning, audience, guiding principles | When project direction changes | High |
| `README.md` | Human-facing project summary | When project name/purpose changes | Low |

---

## docs/ — Top-level

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `docs/README.md` | Documentation index — foundational docs, pipeline, structure map | When a new doc category is added or the pipeline changes | Medium |
| `docs/philosophy.md` | Discovery-first pedagogy: earned reveal, visual confirmation, understanding before notation | When pedagogical approach changes (rare) | High |
| `docs/product.md` | LSSM standards alignment — maps interactions to ALDs, L3→L5 progression | When ALD mappings or standards change | High |
| `docs/MARCH_AUDIT.md` | Active audit checklist — P0/P1/P2/PED items, ISTE 2026 hardening | After each build session; mark resolved items | Medium |
| `docs/ISTE_VISIBILITY_SPRINT.md` | Sprint spec for ISTE visibility work (March 2026) | Complete — do not update; historical record | Low (archive) |

---

## docs/design/

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `docs/design/README.md` | Design direction, module status table, outstanding work, resolved archive | After each build session; update module status | Medium |
| `docs/design/SINEWAVES-REFACTOR-SPEC.md` | Instrument layout, guide states, responsive grid for sinewaves | Complete — reference only | Low (archive) |
| `docs/design/SINEWAVES-RESIZE-ANIMATIONS-CONTROLS-AUDIT.md` | Open audit items for sinewaves polish | When sinewaves polish items are resolved | Medium |
| `docs/design/VERCEL-REACT-BEST-PRACTICES-AUDIT.md` | React performance audit findings | When performance items are resolved | Medium |

---

## docs/modules/

One folder per module. Each folder follows this structure:

```
docs/modules/<name>/
├── prd.md          — Product requirements (what + why)
├── ux-spec.md      — Interaction design, guide states, ALD progression
└── build-order-prompts.md  — Sequential implementation prompts for subagent-driven dev
```

### docs/modules/dilations/

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `docs/modules/dilations/prd.md` | Dilations module requirements | When scope changes | Medium |
| `docs/modules/dilations/ux-spec.md` | Interaction design, guide states, ALD progression | When UX decisions change during build | Medium |
| `docs/modules/dilations/build-order-prompts.md` | Sequential build prompts (prompts 1–14) | Mark prompts complete as they execute | Medium |

### docs/modules/pythagorean-theorem/

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `docs/modules/pythagorean-theorem/prd.md` | Pythagorean Theorem module requirements | When scope changes | Medium |
| `docs/modules/pythagorean-theorem/ux-spec.md` | Interaction design, guide states, ALD progression | When UX decisions change during build | Medium |
| `docs/modules/pythagorean-theorem/build-order-prompts.md` | Sequential build prompts (prompts 1–13, all 4 phases) | Complete — reference only | Medium |
| `docs/modules/pythagorean-theorem/m1-m2-pattern-audit.md` | Audit of patterns inherited from Rigid Motions and Dilations | Complete — reference only | Low |

---

## docs/professional/

| File | Role | Update trigger | Authority |
|------|------|----------------|-----------|
| `docs/professional/RESUME.md` | Professional resume | When credentials or projects change | High |

---

## docs/superpowers/

AI-generated artifacts. **Never delete.** Mark complete; do not update after completion.

### docs/superpowers/specs/

Design specs produced by AI planning sessions. Read-only after implementation begins.

| File | Role | Status |
|------|------|--------|
| `docs/superpowers/specs/2026-03-19-iste-visibility-sprint-design.md` | ISTE sprint design spec | Complete |
| `docs/superpowers/specs/2026-03-26-dilations-layout-refinement-design.md` | Dilations layout refinement spec | Complete |
| `docs/superpowers/specs/2026-03-27-dilations-phase2-coordinate-rounds-design.md` | Dilations Phase 2 coordinate rounds design | Complete |
| `docs/superpowers/specs/2026-03-29-dilations-pre-phase3-solidification-design.md` | Pre-Phase 3 solidification design: 7 polish items + drag audit | Complete |
| `docs/superpowers/specs/2026-04-04-dilations-phase4-aa-capstone-design.md` | Dilations Phase 4 AA Capstone design spec | Complete |

### docs/superpowers/plans/

Implementation plans produced by AI planning sessions. Mark tasks `[x]` as they complete. Add `## Status: Complete` header when fully done.

| File | Role | Status |
|------|------|--------|
| `docs/superpowers/plans/2026-03-19-iste-visibility-sprint.md` | ISTE sprint implementation plan | Complete |
| `docs/superpowers/plans/2026-03-23-dilations-prompt1-foundation.md` | Dilations Phase 1 foundation | Complete |
| `docs/superpowers/plans/2026-03-23-dilations-prompt2-canvas-stage.md` | Dilations canvas stage | Complete |
| `docs/superpowers/plans/2026-03-23-dilations-prompt3-interaction-primitives.md` | Dilations interaction primitives | Complete |
| `docs/superpowers/plans/2026-03-24-dilations-prompt4-scale-factor-rounds.md` | Dilations scale factor rounds | Complete |
| `docs/superpowers/plans/2026-03-26-dilations-layout-refinement.md` | Dilations layout refinement | Complete |
| `docs/superpowers/plans/2026-03-27-dilations-solidification.md` | Dilations solidification (shared components, earned reveals, Phase 1 close) | Complete |
| `docs/superpowers/plans/2026-03-27-dilations-mobile-stabilization.md` | Dilations mobile stabilization (imperative drag, grid, portrait layout) | Complete |
| `docs/superpowers/plans/2026-03-29-dilations-pre-phase3-solidification.md` | Pre-Phase 3 solidification: 7 polish items (drag, copy, UX) + 3 drag quality fixes | Complete |
| `docs/superpowers/plans/2026-04-04-dilations-phase4-aa-capstone.md` | Dilations Phase 4 AA Capstone implementation plan | Complete |

---

## src/ — In-source architecture docs

These live next to the code they describe. They are the highest-authority record for a module's as-built state.

| File | Role | Update trigger |
|------|------|----------------|
| `src/components/modules/sinewaves/ARCHITECTURE.md` | As-built sinewaves documentation | When sinewaves architecture changes |
| `src/components/modules/rigid-motions/ARCHITECTURE.md` | As-built rigid motions documentation (all 4 phases + ISTE sprint) | When rigid motions architecture changes |
| `src/components/modules/dilations/ARCHITECTURE.md` | As-built dilations documentation (all 4 phases complete) | When dilations architecture changes |
| `src/components/modules/pythagorean-theorem/ARCHITECTURE.md` | As-built pythagorean theorem documentation (all 4 phases complete) | When pythagorean theorem architecture changes |
| `src/lib/skeleton/README.md` | Reusable module hooks documentation | When skeleton hooks change |

---

## Naming Conventions

- **Active specs/plans** — No special prefix; live in their folder.
- **Completed plans** — Add `## Status: Complete` at top; leave in place.
- **Archived design specs** — Move to `docs/archive/` (create if needed) when superseded.
- **Superpowers files** — Always date-prefixed (`YYYY-MM-DD-`). Never rename after creation.

---

## Adding a New Module

When a new module is created, add rows to:
1. This doc-map (under `docs/modules/` and `src/` sections)
2. `docs/design/README.md` module status table
3. CLAUDE.md "Modules" list under "Current State"
