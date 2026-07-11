# Staleness Signals — Creative Lab Docs

A catalog of signals that indicate a doc is stale, should be archived, or can be pruned.
Use this during a staleness audit to triage the full corpus.

---

## Signal 1: Status Mismatch

A doc's stated status contradicts the actual codebase state.

**How to detect:**
- Read the module status in `docs/design/README.md` and CLAUDE.md.
- Check `src/config/modules.ts` for the registered modules.
- Check whether the module folder exists and has real implementation files.

**Examples of mismatches:**
- Doc says "DESIGNED, NOT STARTED" but `src/components/modules/<name>/` has component files.
- Doc says "Placeholder/coming-soon" but the module is registered and has guide states.
- Doc says "In progress" but all plan checkboxes are `[x]`.
- CLAUDE.md says "Complete" but `docs/design/README.md` still says "Implemented."

**Fix:** Update the lower-authority doc to match the higher-authority one. See authority hierarchy in SKILL.md.

---

## Signal 2: Orphaned Plan

A `docs/superpowers/plans/` file where all tasks are checked `[x]` but no `## Status: Complete` header exists.

**How to detect:**
- Grep for `- [ ]` in each plan file. If zero results, the plan is fully complete.
- Check for a `## Status: Complete` header at the top.

**Fix:** Add `## Status: Complete` as the first heading. Do not delete the file.

---

## Signal 3: Duplicate Source-of-Truth

The same fact (module status, design token, file path, guide state list) stated in two or more docs. One will drift.

**How to detect:**
- Look for module status tables in both CLAUDE.md and `docs/design/README.md`.
- Look for design token values in both CLAUDE.md and `docs/design/README.md`.
- Look for outstanding work lists in both CLAUDE.md and `docs/MARCH_AUDIT.md`.

**Fix:** Designate one doc as authoritative (see hierarchy). Make the other doc reference it: "See CLAUDE.md § Outstanding Work for the canonical list." Remove the duplicate content.

---

## Signal 4: Dead Reference

A doc links to a file path that no longer exists, or references a component/hook that has been renamed or deleted.

**How to detect:**
- Scan docs for markdown links `[text](path)` and verify the paths exist.
- Common culprits: plans that reference files before they were created, specs that reference mockup files that were moved.

**Fix:** Update the link to the correct path, or note "file removed in [commit]" if the reference is historical.

---

## Signal 5: Date Gap

A doc's "Last updated" date is significantly behind the git log for files it describes.

**How to detect:**
- Run `git log --oneline --since="2 weeks ago" -- src/components/modules/<name>/` to see recent activity.
- Compare against the doc's "Last updated" date.
- A gap of more than one sprint (roughly 1–2 weeks of active work) is a staleness signal.

**Exceptions:** Completed/archived docs are expected to have old dates. Only flag docs that are supposed to be actively maintained (CLAUDE.md, ARCHITECTURE.md files, docs/design/README.md).

---

## Signal 6: Superseded Spec

A design spec or plan that was written for a feature that has since been redesigned or replaced.

**How to detect:**
- Look for specs in `docs/superpowers/specs/` or `docs/design/` that describe interactions or file structures that no longer match the codebase.
- Check if the spec's described guide states, component names, or file paths still exist.

**Fix:** Add a note at the top: `> **Superseded.** See [newer doc] for the current design.` Move to `docs/archive/` if it creates confusion in its current location.

---

## Signal 7: Outstanding Work Item Already Resolved

An item in CLAUDE.md "Outstanding Work" or `docs/MARCH_AUDIT.md` that has actually been fixed.

**How to detect:**
- For each open item, check the relevant source file to see if the issue still exists.
- Cross-reference with recent git commits: `git log --oneline --all -- <file>`.

**Fix:** Strike through the item in the audit doc, add a "Resolved in [commit/date]" note, and remove it from CLAUDE.md's outstanding work (or move to a "Resolved" section).

---

## Signal 8: Module Folder Missing from doc-map.md

A module exists in `src/config/modules.ts` but has no entry in `references/doc-map.md` (this file's companion).

**How to detect:**
- Read `src/config/modules.ts` to get the full module list.
- Compare against the `docs/modules/` entries in `doc-map.md`.

**Fix:** Add the module to `doc-map.md` and create `docs/modules/<name>/` with at minimum a stub `prd.md`.

---

## Triage Priority

When running a full audit, triage signals in this order:

1. **Status Mismatch** — Highest confusion risk for agents reading CLAUDE.md.
2. **Orphaned Plan** — Quick fix; just add a header.
3. **Outstanding Work Already Resolved** — Keeps CLAUDE.md lean and trustworthy.
4. **Duplicate Source-of-Truth** — Prevents future drift.
5. **Dead Reference** — Prevents broken navigation.
6. **Date Gap** — Prompts a content review.
7. **Superseded Spec** — Lowest urgency; add a note and move on.

---

## Audit Command Reference

Useful shell commands during an audit:

```bash
# Find plan files with unchecked tasks
grep -rl "- \[ \]" docs/superpowers/plans/

# Find plan files with no Status: Complete header
grep -rL "Status: Complete" docs/superpowers/plans/

# Check recent git activity on a module
git log --oneline --since="30 days ago" -- src/components/modules/dilations/

# Find markdown links (to spot-check for dead references)
grep -r "\[.*\](.*\.md)" docs/ --include="*.md"

# Find hardcoded "Last updated" dates in docs
grep -r "Last updated" docs/ CLAUDE.md
```
