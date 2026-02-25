# Documentation Archive

Completed implementation plans, resolved audits, and superseded design documents.

These documents are kept for historical reference but are no longer active. For current documentation, see [docs/README.md](../README.md).

---

## Sinewaves Module — Complete

The sinewaves module has been fully implemented and is in production. These documents capture the design and implementation process:

### Implementation Plans (Completed)

- **[2026-02-05-sinewaves-instrument-refactor.md](./2026-02-05-sinewaves-instrument-refactor.md)** — Instrument HUD refactor from staged tutorial to always-visible controls
- **[2026-02-10-sinewaves-eurorack-reskin.md](./2026-02-10-sinewaves-eurorack-reskin.md)** — Eurorack design system application and bug fixes

### Design Audits (Resolved)

- **[SINEWAVES-FRONTEND-DESIGN-AUDIT.md](./SINEWAVES-FRONTEND-DESIGN-AUDIT.md)** — AI slop audit that led to Eurorack direction (superseded by design/README.md)
- **[SINEWAVES-MATCH-PROXIMITY-AUDIT.md](./SINEWAVES-MATCH-PROXIMITY-AUDIT.md)** — Ghost wave sync and snap-to-target fixes (resolved)
- **[HERO-TO-MODULE-JOURNEY-AUDIT.md](./HERO-TO-MODULE-JOURNEY-AUDIT.md)** — Hero → Course Hub → Constellation cohesion (all items resolved; see Resolved table in doc)

### Current Reference (Sinewaves)

For the sinewaves module as built, see:
- **Implementation:** `src/components/modules/sinewaves/ARCHITECTURE.md`
- **Design direction:** `docs/design/README.md`

---

## Infrastructure — Implemented

- **[2026-01-27-module-skeleton-infrastructure.md](./2026-01-27-module-skeleton-infrastructure.md)** — Module skeleton (hooks, types, flow). Implemented in `src/lib/skeleton/`; this plan is the spec for verification and future changes. Not yet consumed by any module; Rigid Motions is the first intended consumer.

For current skeleton usage and API, see `src/lib/skeleton/README.md`.

---

## Why Archive?

Completed documents are archived to:
1. Keep active docs focused on current work
2. Preserve implementation history for future reference
3. Prevent confusion between "what was planned" and "what was built"

When a module is complete, its implementation plan moves here and its ARCHITECTURE.md becomes the source of truth.

### Meta

- **[DOCUMENTATION-CLEANUP-2026-02-20.md](./DOCUMENTATION-CLEANUP-2026-02-20.md)** — Feb 2026 doc reorganization and rigid motions spec enhancement (voice shift, archive creation, mockup workflow).
