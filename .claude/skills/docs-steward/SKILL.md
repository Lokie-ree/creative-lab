---
name: docs-steward
description: "Use when auditing, pruning, updating, or restructuring project documentation — 'update the docs', 'is CLAUDE.md current?', 'prune stale docs', 'the docs are out of sync', 'archive this spec', 'what docs need updating?', 'CLAUDE.md is getting chunky', 'run the docs steward' — and as the documentation-sync pass of a session close: after an implementation lands or before a PR is opened, run this to update status fields, check off plan tasks, and sync CLAUDE.md's Current State. This skill owns only the docs slice of a wrap-up; branch, commit, push, and PR mechanics belong to the ship skill."
---

# Docs Steward

Maintain the creative-lab documentation corpus so it stays accurate, lean, and self-improving as the project evolves. The goal is a corpus that any agent or human can trust on first read — no stale status fields, no zombie specs, no duplicated source-of-truth.

---

## Doc Map

Load `references/doc-map.md` to understand the full documentation structure, the role of each file, and the authority hierarchy before making any changes.

---

## When to Run This Skill

Run this skill in any of these situations:

1. **Post-implementation** — After a build session completes, update status fields, archive completed plans, and sync CLAUDE.md's "Current State" section.
2. **Pre-PR** — Before creating any pull request, verify docs reflect the work being merged: plan tasks checked, CLAUDE.md current state updated, no stale outstanding items.
3. **Pre-planning** — Before writing a new spec or plan, verify no existing doc already covers the ground.
4. **Explicit audit request** — User says "audit the docs", "prune stale docs", or "what's out of date?"
5. **CLAUDE.md trimming** — User says "CLAUDE.md is getting chunky" or similar. Run workflow 6 below.
6. **New module added** — Register it in the doc map, create its module folder under `docs/modules/`, and update CLAUDE.md.
7. **Spec → implementation transition** — Move spec from active to archived; create or update the module's `ARCHITECTURE.md`.

---

## Core Workflows

### 1. Post-Implementation Sync

After a build session, run this checklist in order:

**a. CLAUDE.md — Current State section**
- Update the "Last updated" date.
- Update the module's status line (e.g., "Implemented" → "Complete").
- Move any resolved items from "Outstanding Work" to the appropriate resolved/archived section.
- Add new outstanding items discovered during the build.
- Verify the module list in `src/config/modules.ts` matches what CLAUDE.md describes.

**b. Module ARCHITECTURE.md**
- If a new module reached a stable milestone, create or update `src/components/modules/<name>/ARCHITECTURE.md`.
- Document: file structure, guide states, key hooks, pedagogy flow, and any non-obvious decisions.
- Use `src/components/modules/rigid-motions/ARCHITECTURE.md` as the reference pattern.

**c. Superpowers plans**
- Mark completed tasks in the plan file with `[x]` checkboxes.
- If the plan is fully complete, add a `## Status: Complete` header at the top.
- Do NOT delete plan files — they are historical record.

**d. docs/design/README.md**
- Update the module status table (Sinewaves, Vector Transformations, Rigid Motions, Dilations, etc.).
- Move items from "Outstanding work" to "Resolved" once confirmed fixed.

**e. docs/MARCH_AUDIT.md (or equivalent active audit)**
- Mark resolved items with a strikethrough or resolved tag.
- Update the "Last updated" date.

---

### 2. Pre-PR Doc Sync

Before creating a pull request:

1. Run `git log --oneline -20` to understand what this branch adds/changes.
2. For each plan file touched by this branch, verify uncompleted tasks match what's actually left — mark any tasks completed by this branch with `[x]`.
3. Update CLAUDE.md "Current State" to reflect the work being merged (module status, last-updated date).
4. Scan CLAUDE.md "Outstanding Work" for items resolved by this PR — strike through or remove them.
5. If the PR introduces a new module milestone, check whether an `ARCHITECTURE.md` needs creating or updating.
6. Report what was updated before asking the user to proceed with the PR.

---

### 3. CLAUDE.md Trimming

When CLAUDE.md is getting long or the user says it's chunky:

1. Scan "Outstanding Work" for:
   - Items marked `~~strikethrough~~` — remove the entire line.
   - Items tagged "Resolved" — remove the entire line.
   - Items where the fix is confirmed in git log — propose removing.
2. Scan "Current State > Modules" — each module gets **one status line**. If a module description has grown into a paragraph, condense to one line and point to its `ARCHITECTURE.md`.
3. Scan "Related Documentation" table — remove rows for files that no longer exist.
4. Check for any section that repeats information already in an `ARCHITECTURE.md` — replace with a reference link.
5. Propose all changes as a structured diff before writing anything:

```
📝  Proposed CLAUDE.md changes:

REMOVE from "Outstanding Work":
  - PED-02: ... (marked Resolved March 2026)
  - ~~RM-03~~ (strikethrough — already done)

UPDATE "Current State > Dilations":
  BEFORE: "Prompts 1–4 complete (254 tests, merged PR #47). Now in layout refinement phase."
  AFTER:  "Solidification in progress — plan at docs/superpowers/plans/2026-03-27-dilations-solidification.md"

REMOVE from "Related Documentation":
  - Row pointing to docs/design/OLD-SPEC.md (file no longer exists)
```

Then ask: **"Apply these changes to CLAUDE.md? (yes / show full proposed file / skip)"**

---

### 4. Staleness Audit

Load `references/staleness-signals.md` for the full signal catalog. Always begin with:

```bash
git log --oneline -30
git log --oneline --since="60 days ago"
```

Quick summary:

- **Status mismatch** — A doc says "DESIGNED, NOT STARTED" but the module is now implemented.
- **Orphaned plan** — A `docs/superpowers/plans/` file with all tasks checked but no "Status: Complete" header.
- **Duplicate source-of-truth** — The same fact stated in both CLAUDE.md and a design doc; one will drift.
- **Dead references** — A doc links to a file path that no longer exists.
- **Date gap** — A doc's "Last updated" is more than one major sprint behind the git log.

To run a staleness audit:
1. Read `references/doc-map.md` to get the full file list.
2. For each doc, check its "Last updated" date against recent git commits.
3. Spot-check status fields against the actual codebase state.
4. Report findings grouped by: (a) needs immediate update, (b) should be archived, (c) can be pruned.

---

### 5. Pruning

Pruning removes noise without losing history.

**Safe to delete:**
- Duplicate content that is fully superseded by another doc with a more recent date.
- Placeholder files with no content beyond "Coming Soon."

**Archive instead of delete:**
- Completed design specs that informed an implementation (move to `docs/archive/` or add `## Status: Complete` + stop updating).
- Superseded plans (keep in `docs/superpowers/plans/` with a complete header — never delete).

**Never delete:**
- `CLAUDE.md` — single source of truth for agents.
- `docs/philosophy.md`, `docs/product.md` — foundational pedagogy.
- `VISION.md` — career positioning.
- Any `ARCHITECTURE.md` — as-built record.
- Any `docs/superpowers/` file — historical record of AI-assisted work.

---

### 6. New Module Registration

When a new module is added to the project:

1. Add an entry to `src/config/modules.ts`.
2. Create `docs/modules/<name>/` with at minimum a `prd.md`.
3. Add the module to the status table in `docs/design/README.md`.
4. Add a one-line entry under "Modules" in CLAUDE.md's "Current State" section.
5. Update `docs/README.md` if the module changes the planning pipeline or adds a new doc category.

---

### 7. CLAUDE.md as Living Document

CLAUDE.md is the agent-facing source of truth. Keep it accurate by following these rules:

- **"Current State" section** — Update after every significant build session. Date it.
- **"Outstanding Work" section** — Add items as they're discovered; strike through or remove when resolved. Never let it become a graveyard of stale items.
- **Module list** — Each module gets one status line. Status vocabulary: `Placeholder` → `Implemented` → `Complete`.
- **Design system** — Only update when tokens, fonts, or utility classes actually change.
- **No duplication** — If a fact lives in an `ARCHITECTURE.md`, CLAUDE.md should reference it, not repeat it.

---

## Authority Hierarchy

When two docs conflict, the more specific and more recently updated doc wins — with one exception: CLAUDE.md's "Current State" section is always authoritative for module status. Resolve conflicts by updating the lower-authority doc to match, not by editing CLAUDE.md to match a stale spec.

| Authority | Document |
|-----------|----------|
| Highest | `CLAUDE.md` (agent instructions, current state) |
| High | `ARCHITECTURE.md` files (as-built truth per module) |
| Medium | `docs/design/README.md` (design direction + status) |
| Medium | `docs/modules/<name>/` (module-specific specs) |
| Low | `docs/superpowers/plans/` (historical, read-only after completion) |
| Low | `docs/superpowers/specs/` (historical, read-only after completion) |

---

## Closing Summary

After any steward run, close with a concise summary:

```
✅  Docs steward complete.
    Updated: CLAUDE.md (Dilations status, removed 2 resolved items)
    Archived: docs/superpowers/specs/2026-03-19-iste-visibility-sprint-design.md
    Plans marked complete: 2026-03-26-dilations-layout-refinement.md
    No files deleted.
```

If nothing needed changing: `✅  Docs are already current — nothing to update.`

---

## Output Format

When reporting a doc audit, use this structure:

```
## Doc Audit — [date]

### Needs Update
- [file] — [what's stale and what it should say]

### Should Archive
- [file] — [reason]

### Can Prune
- [file] — [reason, confirm with user before deleting]

### Already Current
- [file list]
```

Always confirm with the user before deleting any file.
