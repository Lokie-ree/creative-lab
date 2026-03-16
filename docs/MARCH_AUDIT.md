# Audit Pass: Phase 1–4

**CREATIVE LAB · AUDIT DOCUMENT**

Cold Start · Cross-Device · Edge Cases · State Integrity · Pedagogical Tuning

Modules: Rigid Motions | Sinewaves
Target: ISTE Live 2026 Conference Hardening
Date: March 2026

> *"The bar is not 'does every edge case work' — it is 'does a stranger succeed on their first attempt.'"*

---

## Audit Overview

This document is the complete audit checklist for the Creative Lab application across all four passes. Passes 2–4 are desk work executed between student sessions. Pass 1 is live observation — it happens when students sit down and interact with the app for the first time. Everything in passes 2–4 should be resolved before Pass 1 runs, so the signal collected from students is about pedagogy and discovery, not bugs.

## Priority Legend

| Tag | Priority | Criteria |
|-----|----------|----------|
| **🔴 P0** | Fix Immediately | Visible break that a student or conference attendee would encounter on the happy path. |
| **🟠 P1** | Fix Before Demo | Layout or interaction issue that degrades the experience on a specific device class or orientation. |
| **🟡 P2** | Polish | Visual refinement. Noticeable to the builder, unlikely to block a user. |
| **🔵 PED** | Pedagogy | Discovery sequencing, hint timing, or copy that affects learning outcomes. Informed by student signal. |

---

## Pass 1: Cold Start & Happy Path (Live Session)

Fresh eyes. No priming. This pass happens with real students during the twice-weekly STEM Club sessions. The goal is not to test — it's to observe. You are collecting signal, not running QA.

### Protocol

**Before the session:** Resolve all P0 and as many P1 items as possible from passes 2–4. The app should be in its best current state. Do not brief students on what the app does or how to use it.

**During the session:** Hand a device to a student. Say nothing beyond "try this." Observe and note:

- **Time to first interaction** — How many seconds before they drag the ghost or touch a slider? Target: < 15 seconds without prompting.
- **Navigation clarity** — Do they find their way from Hero → CourseHub → Constellation → Module without getting lost? Where do they pause?
- **Interaction model comprehension** — Do they understand predict-then-check without being told? Do they realize the ghost is draggable?
- **Engagement signals** — Where do eyes light up? Where do they lean in? Where do they disengage or look confused?
- **Verbal reactions** — Capture exact quotes. "Wait, that actually worked" is gold. "I don't get it" is signal too.
- **Failure modes** — Where do they get stuck? Do they recover on their own or need a nudge?

**After the session:** Debrief immediately while observations are fresh. Update PED items based on what you saw.

### Observation Checklist

| ✓ | Area | What to Watch | Signal Collected |
|---|------|---------------|------------------|
| ☐ | Cold start | First interaction within 15s without prompting | |
| ☐ | Navigation | Hero → module without confusion | |
| ☐ | Predict loop (P2) | Student drags ghost, presses CHECK, watches reveal | |
| ☐ | Match feedback | Does the glow/animation land? Do they understand they got it right? | |
| ☐ | Coordinate reveal (P3) | Do they read the formula? Do they connect it to what they just did? | |
| ☐ | Capstone entry (P4) | Do they understand the task change — building a sequence, not predicting? | |
| ☐ | Non-commutativity | Do they discover order matters before or after a hint? | |
| ☐ | Celebration modal | Does the "Your Discovery" tab land? Do they read the chips? | |
| ☐ | Sinewaves (if tested) | Slider engagement — sweeping vs. deliberate matching? | |
| ☐ | Mobile experience | If on a phone: any layout breaks, touch issues, or confusion? | |
| ☐ | "That's sick" moment | At least one genuine engagement reaction per session | |

### What Pass 1 Informs

The observations from Pass 1 feed directly back into Pass 4 (Pedagogical Tuning). Specifically:

- **PED-01** (capstone hint timing) — Did students discover non-commutativity on their own, or did the early hint spoil it?
- **PED-03** (earned reveal pacing) — Did the reveal copy resonate, or did students skip past it?
- **SW-02** (unit circle decision) — On mobile, did students miss the circular motion relationship without the unit circle?
- **PED-04** (commitment before feedback) — Did sinewaves students slider-sweep or engage deliberately?

---

## Pass 2: Cross-Device & Layout

Systematic device sweep. Test every guide state at each breakpoint. The goal is zero clipping, zero layout breaks, and full interactivity across portrait and landscape on phones and tablets.

### Test Matrix

| Device Class | Portrait | Landscape | Rigid Motions | Sinewaves |
|---|---|---|---|---|
| Phone (375px) | ☐ | ☐ | ☐ | ☐ |
| Phone large (428px) | ☐ | ☐ | ☐ | ☐ |
| Tablet (768px) | ☐ | ☐ | ☐ | ☐ |
| Tablet large (1024px) | ☐ | ☐ | ☐ | ☐ |
| Desktop (1440px+) | — | ☐ | ☐ | ☐ |

---

### Rigid Motions — Mobile Issues

#### RM-01: Landscape capstone scene too small

**🟠 P1** — Landscape orientation renders the capstone canvas at a fraction of the available viewport. Vast empty space sits between the prompt area and the SequenceBuilder controls. The layout does not redistribute vertical space in landscape.

**Root cause:** InstrumentModule uses a fixed 5-row grid layout. In landscape, the canvas row does not flex to absorb available height. The SequenceBuilder and prompt rows maintain their portrait proportions.

**Fix strategy:** Detect landscape orientation and switch to a 2-column layout: canvas on the left (60–70% width), controls stacked on the right. Alternatively, increase the canvas row's flex-grow in landscape and compress the prompt to a single-line overlay.

**Files:**
```
src/components/modules/rigid-motions/InstrumentModule.tsx
```

**Verification:** On a phone in landscape, the triangle grid should fill the majority of the visible area. The SequenceBuilder should be accessible without scrolling.

---

#### RM-02: SequenceBuilder cramped in landscape

**🟠 P1** — The SequenceBuilder renders as a horizontal strip that is too narrow in landscape. Step selectors (TRANSLATE / REFLECT / ROTATE) and parameter controls compete for limited width.

**Fix strategy:** In landscape, switch SequenceBuilder to a column layout (step 1 above step 2) rather than side-by-side. Ensure each step has full-width parameter controls.

**Files:**
```
src/components/modules/rigid-motions/components/ControlStrip.tsx
```

---

#### RM-03: Portrait SequenceBuilder dominates viewport

**🟠 P1** — In portrait orientation, the SequenceBuilder controls consume the majority of the viewport. The canvas showing the pre-image and target is compressed to a small strip, making it difficult to visually verify the sequence result.

**Fix strategy:** Cap the SequenceBuilder height in portrait. Consider a collapsible or bottom-sheet pattern where the builder slides up when active and the canvas remains visible behind it. Minimum canvas height: 40% of viewport.

**Files:**
```
src/components/modules/rigid-motions/InstrumentModule.tsx
```

---

#### RM-04: Missing coordinate labels on mobile capstone

**🟡 P2** — A′, B′, C′ vertex labels render on mobile capstone but without coordinate numbers. Desktop shows full labels like A′(2, −1). Mobile shows only the letter.

**Root cause:** SpriteLabel text may be truncated or the label string generation omits coordinates when viewport width is below a threshold. Check whether `coordinatesActive` is properly threaded to the capstone scene on mobile.

**Files:**
```
src/components/modules/rigid-motions/components/SpriteLabel.tsx
src/components/modules/rigid-motions/RigidMotionsScene.tsx
```

---

#### RM-05: Status strip dots missing on capstone

**🟡 P2** — StatusStrip progress dots are not visible in landscape capstone views. Confirmed on desktop screenshot as well, so this may not be orientation-specific.

**Root cause:** StatusStrip may be rendering outside visible bounds, or the dots may be present but lack contrast against the faceplate background. Check z-index and color token usage.

**Files:**
```
src/components/modules/rigid-motions/InstrumentModule.tsx (StatusStrip row)
```

---

### Sinewaves — Mobile Issues

#### SW-01: Wave hidden off-screen in landscape

**🟠 P1** — In mobile landscape, only the unit circle renders. The sine wave is clipped or positioned entirely off the right edge of the canvas.

**Current state:** `scene-layout.ts` has a `useIsMobileViewport` hook that detects mobile and centers the wave when the unit circle is hidden. However, the landscape phone case may be slipping through the detection because R3F viewport aspect reports landscape phones as non-mobile. The hook was updated to include a `window.innerWidth < 768` check with a resize listener, but this may not be deployed or may have a sync issue.

**Fix strategy:** Verify that `useIsMobileViewport` returns true for landscape phones (`window.innerWidth < 768` even in landscape). When mobile is detected, the unit circle should be hidden and the wave should be centered. If the detection is correct but the wave is still off-screen, check the `SCENE_LAYOUT.landscape.wave.xRatio` value — it positions the wave at 10% of viewport width, which on a narrow R3F viewport may push it past the visible edge.

**Files:**
```
src/components/modules/sinewaves/scene-layout.ts
src/components/modules/sinewaves/Scene.tsx
```

---

#### SW-02: Unit circle mobile portrait decision

**🔵 PED** — Deliberate design decision needed: hide the unit circle on mobile portrait to give the wave more canvas, or keep it and accept smaller wave area. Currently hidden on mobile. Document the decision once confirmed with student signal.

**Action:** Observe student sessions. If students on phones engage with the wave effectively without the unit circle, confirm the decision and document it in CLAUDE.md. If they seem confused about the circular relationship, consider a toggle or a brief intro animation.

---

### Journey & Navigation — Cross-Device

#### NAV-01: Full navigation path on each device class

**🟠 P1** — Verify the complete journey (Hero → CourseHub → Constellation → Module → Back) renders correctly on every device in the test matrix. Check:

- DotGrid canvas background interaction on touch devices (mouse proximity effect)
- RotatingText tagline readability at small viewport widths
- CourseHub 2-row layout: `h-12` header + `flex-1` content on all breakpoints
- Constellation SegmentArc nodes: circular at all sizes, tap targets ≥ 44px
- Back button and Escape hatch accessible on all screens

---

## Pass 3: Edge Cases & State Integrity

Stress-test state transitions, race conditions, and unexpected user behavior. The things that only surface when someone does something you didn't plan for.

### Celebration Modal State Leak

#### STATE-01: DiscoveryTab falls through to sinewaves formula

**🔴 P0** — When `moduleId === 'rigid-motions'` but `completedSequence` is empty or null, DiscoveryTab renders the sinewaves formula path (`y = sin(t)`) instead of the rigid-motions transformation chips.

**Root cause:** `onComplete({}, { completedSequence: capstoneSequence })` fires via `useEffect`. If `showCelebration` is set before the sequence is committed to state, the modal opens with `completedSequence` still empty. The DiscoveryTab render logic has no guard for this case — it falls through to the default sinewaves path.

**Two-part fix:**

**Part 1 — Defensive render (ship today):** In `DiscoveryTab.tsx`, when `moduleId === 'rigid-motions'` but `completedSequence` is null or empty, render a generic completion message instead of falling through to sinewaves. This is a 5-line guard.

```tsx
// DiscoveryTab.tsx
if (moduleId === 'rigid-motions') {
  if (!completedSequence || completedSequence.length === 0) {
    return <GenericCompletionView />
  }
  // ... existing rigid-motions chip rendering
}
// ... sinewaves default path
```

**Part 2 — Upstream timing fix:** In `App.tsx`, ensure `completedSequence` and `showCelebration` are set atomically. Either use a reducer so both update in the same dispatch, or set `completedSequence` first and gate `showCelebration` on `completedSequence` being non-null.

**Files:**
```
src/components/celebration/DiscoveryTab.tsx
src/App.tsx (onComplete handler)
```

**Verification:** Complete rigid-motions capstone. CelebrationModal should show transformation chips, never `y = sin(t)`. Test by adding a `console.log` in DiscoveryTab to confirm `completedSequence` is non-empty when the modal mounts.

---

### State Transitions & Navigation

#### STATE-02: Escape during GSAP reveal animation

**🟠 P1** — If a student presses Escape or the back button while a GSAP reveal animation (`interpolateReveal`) is in progress, the animation may continue running after the module unmounts, or the state may be left in an intermediate position.

**Test:** Trigger a CHECK match during Phase 2. While the reveal animation is playing, press Escape. Verify: animation stops cleanly, no console errors, navigating back to the module starts fresh.

**Fix strategy:** Ensure GSAP timelines are killed in the component's cleanup function (`useEffect` return or `useGSAP` cleanup). The `useGSAP` hook from `@gsap/react` should handle this automatically if the context is properly scoped.

---

#### STATE-03: Back-navigation mid-sequence in capstone

**🟠 P1** — If a student has built a partial sequence in the SequenceBuilder (e.g., step 1 filled, step 2 empty) and navigates back to the Constellation screen, then returns to the module: does the capstone state reset correctly?

**Test:** Enter capstone. Add one step. Navigate back to Constellation. Re-enter rigid-motions. Verify the module starts from the beginning (`predict-translate`), not from a partial capstone state.

---

#### STATE-04: Viewport resize during module interaction

**🟡 P2** — Resizing the browser window or rotating a device while interacting with a module should not break the R3F scene layout or desync the CSS layout from the Canvas layout.

**Test (both modules):** Start in portrait. Begin interacting with the module. Rotate to landscape. Verify: canvas re-renders proportionally, controls remain accessible, no clipping or overlap. Repeat in reverse.

**Known concern:** Sinewaves `scene-layout.ts` had a one-frame desync between CSS breakpoint flip and 3D layout update. The resize listener fix may address this, but needs verification on actual device rotation.

---

#### STATE-05: Double-tap / rapid CHECK presses

**🟡 P2** — Rapidly pressing the CHECK button (or CHECK SEQUENCE in capstone) could fire `handleCheck` multiple times before the feedback state updates, potentially skipping stages or double-counting successes.

**Test:** In Phase 2, position the ghost for a match. Tap CHECK rapidly 3–5 times. Verify: only one match is counted, only one reveal animation plays, guide state advances exactly once.

---

#### STATE-06: stageRoundIndex boundary on Phase 3 entry

**🟡 P2** — When entering Phase 3 predict states, `stageRoundIndex` resets to 1 (selecting the harder round per type). Verify this doesn't cause an out-of-bounds access if a stage only has one round definition.

**Test:** Play through all Phase 2 rounds until `coordinate-reveal` fires. Verify Phase 3 loads the correct round (index 1) for each transformation type. Check console for any array index warnings.

---

## Pass 4: Pedagogical Tuning

Copy, hint timing, and discovery sequencing. These items benefit from real student reactions collected during Pass 1, but can be identified and planned now.

### Rigid Motions

#### PED-01: Capstone entry copy reveals non-commutativity too early

**🔵 PED** — The current capstone entry prompt includes a hint like "try reversing the order" which gives away the non-commutativity discovery before the student has had a chance to encounter it naturally.

**The problem:** Non-commutativity of transformation composition is the capstone's deepest insight (Level 5 ALD). If the prompt tells students to reverse the order before they've experienced a miss, the discovery is spoiled. The student should encounter a sequence that doesn't work, wonder why, try reversing, and then experience the aha moment.

**Fix:** The entry prompt for capstone should be neutral: "Build the sequence that maps the pre-image onto the target." The "try reversing the order" hint should only trigger after a miss on a 2-step round. This way, the hint arrives as scaffolding for a student who is stuck, not as a spoiler for a student who hasn't tried yet.

**Implementation:** In `rigid-motions-copy.ts`, split the capstone `PROMPT_TEXT` into two variants: an entry prompt (neutral) and a post-miss hint (includes reversal suggestion). In the guide state logic, track whether the student has missed on the current capstone round and select the appropriate prompt.

**Files:**
```
src/components/modules/rigid-motions/rigid-motions-copy.ts (PROMPT_TEXT)
src/components/modules/rigid-motions/hooks/useRigidMotionsState.ts
```

---

#### PED-02: Capstone completion copy per round

**🔵 PED** — `CAPSTONE_COMPLETION_COPY` has three entries (`capstone-1`, `capstone-2`, `capstone-3`). Verify these align with the actual capstone round IDs generated by `capstone-utils.ts`.

**Check:** The `CAPSTONE_ROUNDS` array in `capstone-utils.ts` should produce round IDs that exactly match the keys in `CAPSTONE_COMPLETION_COPY`. If round IDs are generated dynamically, ensure the lookup doesn't miss.

---

#### PED-03: Earned reveal pacing across phases

**🔵 PED** — The `EARNED_REVEALS` copy (Phase 2) and `CAPSTONE_EARNED_REVEALS` (Phase 4) should build a coherent narrative arc. Phase 2 reveals are about individual transformations. Phase 3 adds coordinate notation. Phase 4 reveals are about composition.

**Review:** Read all reveal strings in sequence. Do they tell a story? Does each reveal feel like it rewards the specific thing the student just demonstrated? Flag any that feel generic or disconnected from the preceding interaction.

---

### Sinewaves

#### PED-04: Commitment before feedback (deferred)

**🔵 PED** — Sinewaves can currently be completed by slider-sweeping without deep understanding. Rigid Motions requires spatial commitment (drag the ghost, then CHECK) before feedback. The pattern to generalize: commitment before feedback.

**Decision:** Do not retrofit this pattern onto Sinewaves until Dilations and Pythagorean Theorem modules are built. After three modules, the generalized interaction pattern will be clearer. Document this as a known design debt, not a bug.

---

## Execution Checklist

Work through items in priority order. Check the box when resolved and note the commit hash or PR number.

| ✓ | ID | Description | Priority | Commit |
|---|---|---|---|---|
| ☐ | STATE-01 | DiscoveryTab celebration modal state leak | 🔴 P0 | |
| ☐ | RM-01 | Landscape capstone scene too small | 🟠 P1 | |
| ☐ | RM-02 | SequenceBuilder cramped in landscape | 🟠 P1 | |
| ☐ | RM-03 | Portrait SequenceBuilder dominates viewport | 🟠 P1 | |
| ☐ | SW-01 | Wave hidden off-screen in landscape | 🟠 P1 | |
| ☐ | STATE-02 | Escape during GSAP reveal animation | 🟠 P1 | |
| ☐ | STATE-03 | Back-navigation mid-sequence in capstone | 🟠 P1 | |
| ☐ | NAV-01 | Full navigation path on each device class | 🟠 P1 | |
| ☐ | RM-04 | Missing coordinate labels on mobile capstone | 🟡 P2 | |
| ☐ | RM-05 | Status strip dots missing on capstone | 🟡 P2 | |
| ☐ | STATE-04 | Viewport resize during module interaction | 🟡 P2 | |
| ☐ | STATE-05 | Double-tap / rapid CHECK presses | 🟡 P2 | |
| ☐ | STATE-06 | stageRoundIndex boundary on Phase 3 entry | 🟡 P2 | |
| ☐ | PED-01 | Capstone entry copy reveals too early | 🔵 PED | |
| ☐ | PED-02 | Capstone completion copy alignment | 🔵 PED | |
| ☐ | PED-03 | Earned reveal pacing across phases | 🔵 PED | |
| ☐ | SW-02 | Unit circle mobile portrait decision | 🔵 PED | |
| ☐ | PED-04 | Commitment before feedback (deferred) | 🔵 PED | |
| | | **Pass 1 — Live Observation** | | |
| ☐ | OBS-01 | Cold start: first interaction < 15s | 🔵 PED | |
| ☐ | OBS-02 | Navigation: Hero → module without confusion | 🔵 PED | |
| ☐ | OBS-03 | Predict loop comprehension without prompting | 🔵 PED | |
| ☐ | OBS-04 | Coordinate reveal: formula connection lands | 🔵 PED | |
| ☐ | OBS-05 | Capstone: task change understood | 🔵 PED | |
| ☐ | OBS-06 | Non-commutativity discovered organically | 🔵 PED | |
| ☐ | OBS-07 | "That's sick" moment observed | 🔵 PED | |

---

## Sprint Strategy

### Day 1: Kill the P0, start the P1s

STATE-01 (celebration modal leak) is a 20-minute fix with the two-part approach outlined above. Ship the defensive render immediately, then the upstream timing fix. After that, move to RM-01/RM-02/RM-03 — these are all layout issues in the same file neighborhood and can be tackled as a single focused session.

### Day 2: Sinewaves + state hardening + pedagogy prep

SW-01 (wave off-screen) may already be partially fixed by the `useIsMobileViewport` improvements in the codebase. Verify, then move to STATE-02/STATE-03 (escape and back-nav edge cases). End the day by reviewing the pedagogical copy items (PED-01 through PED-03) so you have a clear plan for what to tune after observing students.

### Session Day: Pass 1 happens live

Don't touch pedagogy copy before the session. Let students interact with the current prompts and watch where they hesitate, where they light up, and where they look confused. Bring the observation checklist from Pass 1. Say "try this" and shut up. That signal is more valuable than any desk-side edit.

### Post-Session: Close the loop

Debrief immediately. Fill in the "Signal Collected" column on the Pass 1 observation checklist while it's fresh. Update PED-01 through PED-04 based on what you saw. If students navigated cleanly and engaged without prompting, you're conference-ready. If they didn't, you know exactly what to fix before the next session.