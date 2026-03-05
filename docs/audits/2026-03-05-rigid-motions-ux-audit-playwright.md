# Rigid Motions Module — UX Audit (Playwright MCP)

**Date:** March 5, 2026  
**Scope:** Full user journey for Phases 1–4 (design spec v1.2)  
**Tool:** cursor-ide-browser MCP (snapshot, click, navigate, screenshot)  
**App:** `pnpm dev` @ http://localhost:5173

---

## Summary

- **Navigation (Hero → Course Hub → Constellation → Module):** ✅ Works as designed; transitions are clear.
- **Module entry:** ✅ Rigid Motions loads and shows Phase 2 predict state with prompt, grid, ghost, and controls.
- **Prompt copy:** ❌ **Bug** — Round IDs in `round-generator.ts` do not match keys in `PROMPT_TEXT`; users see fallback “Make your prediction.” for translate rounds.
- **Lab dropdown (Escape Hatch):** ❌ **Bug** — Click on “Lab” is intercepted by the fixed `Navigation` overlay; “Back to Start” / “Skip to End” could not be exercised in this audit.
- **In-canvas interaction (drag/check):** Not automated; 3D canvas and ghost are not exposed in the accessibility snapshot, so the full predict → check → next loop was not driven by Playwright.

---

## 1. Navigation flow (tested)

| Step | Action | Result |
|------|--------|--------|
| 1 | Open http://localhost:5173 | Hero: “IVLA STEM Club”, “Enter the Lab →” |
| 2 | Click “Enter the Lab →” | Course Hub: Advanced Math, Geometry (0/1), CS (disabled), Back |
| 3 | Click “△ Geometry 0 / 1 modules” | Constellation: “Geometry”, “Select a module”, “Geometry Rigid Motions” |
| 4 | Click “Geometry Rigid Motions” | Module loads; Rigid Motions header, prompt, controls (Check, Reset, 0.5× / 1× / 2×) |

Observations:

- No console errors during navigation.
- Lazy-loaded module appears after a short delay; no visible loading state in the snapshot (ModuleLoader may be brief).
- Constellation correctly shows one module for Geometry.

---

## 2. Module first paint (Phase 2 predict-translate)

- **Header:** “Rigid Motions” (status strip).
- **Prompt row:** “PREDICT” label and body text (see Copy bug below).
- **Controls:** Check, Reset, 0.5×, 1×, 2× visible; no FLIP or ROTATION (correct for translate).
- **Screenshot:** Coordinate grid, solid pre-image triangle (A, B, C), dashed green ghost (A′, B′, C′) with arrow from B to B′; controls at bottom. Layout and design tokens (faceplate, phosphor green) match the design system.

---

## 3. Copy bug: PROMPT_TEXT vs round IDs

**Issue:** `rigid-motions-copy.ts` defines prompts for:

- `translate-4-2`, `translate-n3-n5`
- `reflect-y`, `reflect-x`
- `rotate-90-cw`

`round-generator.ts` defines rounds with IDs:

- `translate-5-3`, `translate-n3-n4`
- `reflect-y`, `reflect-x`
- `rotate-90-cw`

So translate rounds use IDs `translate-5-3` and `translate-n3-n4`, which are **not** in `PROMPT_TEXT`. The UI falls back to the default `"Make your prediction."` for both translate rounds.

**Recommendation:** Align copy with round IDs. Either:

- Add entries to `PROMPT_TEXT`: `'translate-5-3'` and `'translate-n3-n4'` with the correct “TRANSLATE · …” strings for (5 right, 3 up) and (3 left, 4 down), or  
- Rename rounds in `round-generator.ts` to match existing keys (e.g. `translate-4-2` / `translate-n3-n5`) and adjust `targetVertices` if the spec uses different deltas.

---

## 4. Lab dropdown (Escape Hatch) — click intercepted

**Issue:** Click on the “Lab” button (Escape Hatch) fails with “Click target intercepted by: &lt;nav class=\"fixed top-0 left-0\"&gt;”. The global `Navigation` bar is fixed and spans the top; it sits above or overlaps the Lab trigger in the stacking order, so the Lab dropdown could not be opened in the audit.

**Recommendation:** Ensure the Escape Hatch (Lab) is clickable:

- Give the Escape Hatch container a higher `z-index` than the Navigation bar (e.g. so the Lab trigger is above the nav), or  
- Restrict the Navigation hit area (e.g. only the “Back to modules” / spacer region) so it does not cover the Lab button.

---

## 5. In-canvas interaction (not automated)

The accessibility snapshot for the module view only exposes:

- Buttons: Check, Reset, 0.5×, 1×, 2×, Lab  
- Static text: “Make your prediction.” (and prompt when fixed)

The R3F canvas and the draggable ghost are not present as separate focusable or clickable nodes, so:

- Dragging the ghost to match the target and pressing Check could not be automated.
- Phase progression (translate → reflect → rotate → coordinate-reveal → predict-with-coordinates-* → capstone) was not exercised end-to-end in the browser.
- Phase 4 (SequenceBuilder, CHECK SEQUENCE, PreviewGhost, celebration) was not triggered via Playwright.

**Recommendation for future E2E:** Consider one or more of:

- Optional test-only “cheat” that advances state or fills the ghost to target (e.g. dev query param or data attribute).
- Focusable or labeled container for the canvas (e.g. `aria-label="Rigid motions scene"`) and coordinate-based drag (viewport coordinates) if the canvas can be targeted.
- Unit/integration tests for `useRigidMotionsState`, `scoreGuess`, and `validateCapstoneSequence` to cover logic; reserve Playwright for navigation and control-strip flows.

---

## 6. Code and design spot-check (Phases 3–4)

Review was done against the repo and design spec; not re-tested in browser after the copy/nav fixes.

- **FormulaReadout:** Gated by `coordinate-reveal` and `isCoordinateStage`; used for coordinate rule and vertex substitution. Implementation matches spec.
- **ControlStrip:** Predict states show CHECK / NEXT / RESET / SPEED; FLIP for reflect; ROTATION for rotate; CONTINUE only for `coordinate-reveal`; capstone uses `SequenceBuilder` only. Matches spec.
- **CelebrationModal:** Receives `moduleId` and `completedSequence`; DiscoveryTab rigid-motions branch renders `RigidMotionsDiscovery` with sequence chips and `CAPSTONE_COMPLETION_COPY`. Matches spec.
- **DiscoveryTab (rigid-motions):** Uses `TransformChip` and `CAPSTONE_COMPLETION_COPY`; one minor design-system note: uses `text-white` and `rounded` in places; consider `text-(--lab-text)` and design-system radius tokens for consistency.

---

## 7. Recommendations summary

| Priority | Item | Action |
|----------|------|--------|
| P0 | Prompt copy | Align `PROMPT_TEXT` keys with `round-generator.ts` round IDs (or vice versa) so translate rounds show “TRANSLATE · …” instead of “Make your prediction.” |
| P0 | Lab dropdown | Fix stacking so the Lab button is clickable (z-index or nav hit area). |
| P1 | E2E coverage | Add test-only advance or coordinate-based canvas interaction so the full predict → capstone → celebration flow can be automated. |
| P2 | Design tokens | In DiscoveryTab (and any new UI), prefer lab tokens over `text-white` and ad-hoc `rounded` for consistency. |

---

## Appendix: Snapshot refs (module view)

At the time of the audit, the module view snapshot contained:

- `e4` — Lab (dropdown trigger)  
- `e5` — Check  
- `e6` — Reset  
- `e7` — 0.5×  
- `e8` — 1×  
- `e9` — 2×  
- `e10` — Prompt text (“Make your prediction.”)

No refs were available for the canvas, ghost, or grid.
