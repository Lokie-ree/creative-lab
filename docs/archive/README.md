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

### Current Reference

For the sinewaves module as built, see:
- **Implementation:** `src/components/modules/sinewaves/ARCHITECTURE.md`
- **Design direction:** `docs/design/README.md`

---

## Why Archive?

Completed documents are archived to:
1. Keep active docs focused on current work
2. Preserve implementation history for future reference
3. Prevent confusion between "what was planned" and "what was built"

When a module is complete, its implementation plan moves here and its ARCHITECTURE.md becomes the source of truth.
