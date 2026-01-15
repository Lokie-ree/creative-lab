# Sinusoidal Waves Module — Phase 1: Layout Foundation

**Date:** 2026-01-14
**Status:** Approved
**Prerequisite:** Layout audit (`2026-01-13-sinusoidal-layout-audit.md`)
**Summary:** Establish consistent spacing, z-index hierarchy, and positioning patterns for the Sinusoidal Waves module.

---

## Overview

Phase 1 addresses the structural foundation issues identified in the layout audit. This creates a solid base for subsequent phases (Component Polish, Animation System, Visual Hierarchy, Accessibility).

### What This Phase Addresses

- ✅ ExplorePrompt `left-16` mobile positioning bug
- ✅ Z-index chaos (too many elements at z-10)
- ✅ Inconsistent spacing across stages
- ✅ Floating text readability (ExplorePrompt)
- ✅ ControlPanel disconnected from scene
- ✅ Duplicate back navigation elements

### What This Phase Does NOT Address (Deferred)

- ❌ Missing stage transition animations (Phase 3)
- ❌ Missing exit animations (Phase 3)
- ❌ Match celebration auto-transition timing (Phase 3)
- ❌ Text-only match score feedback (Phase 2/4)
- ❌ No visual cues for delays (Phase 3)
- ❌ Accessibility improvements (Phase 5)

---

## Design Decisions

### 1. Spacing System

**Decision:** Use Tailwind defaults with documented conventions (not custom tokens).

| Context | Value | Tailwind Class |
|---------|-------|----------------|
| Inner padding (cards, panels) | 16px | `p-4` |
| Component gaps | 8px | `gap-2` |
| Section spacing | 24px | `space-y-6` |
| Edge margins (mobile) | 16px | `mx-4` |
| Edge margins (desktop) | 32px | `sm:mx-8` |

### 2. Z-Index Hierarchy

**Decision:** Semantic z-index layers in `@theme inline` block in `src/index.css` (Tailwind v4 pattern).

```css
@theme inline {
  /* existing tokens... */

  /* Z-index layers */
  --z-base: 0;
  --z-controls: 10;
  --z-floating: 20;
  --z-content: 30;
  --z-fixed: 40;
  --z-overlay: 50;
}
```

**Usage:** `z-[var(--z-controls)]` in class names (must use `var()` wrapper).

### 3. Positioning Strategy

**Decision:** Hybrid approach — Scene uses `flex-1`, UI overlays use consistent absolute positioning.

**Decision:** ControlPanel stays absolute but raised higher (scene-adjacent). Test options: `bottom-12`, `bottom-16`, `bottom-20` to find optimal visual connection to Scene.

**Clarification:** No structural changes to Module.tsx layout — just adjust positioning offsets.

### 4. Visual Containers

**Decision:** Selective glass panels.

| Element | Treatment |
|---------|-----------|
| ExplorePrompt | Glass panel (`bg-black/60 backdrop-blur-sm rounded-xl p-4`) |
| FormulaPreview | Existing card styling (no change) |
| ControlPanel | Existing panel styling (no change) |
| Match Celebration | Text shadow only, no container |
| QuestionCard | Existing shadcn Card (no change) |

### 5. ControlPanel Width

**Decision:** Keep adaptive (grows with content), add smooth width transition.

### 6. Back Navigation

**Decision:** Keep EscapeHatch dropdown (provides Resume/Skip options + professional details for reviewers). Remove Navigation back button from module view.

**Clarification:** Two elements exist: `Navigation.tsx` (back button, z-50) and `EscapeHatch.tsx` (dropdown, z-40). Keep EscapeHatch, hide Navigation's back button when in module view.

---

## Positioning Zones

```
┌─────────────────────────────────────────────────────┐
│ ProgressBar (z-base, top-0, full width)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────────┐                                     │
│  │EscapeHatch │  (z-fixed, top-4 left-4)            │
│  │  dropdown  │                                     │
│  └────────────┘                                     │
│                                                     │
│         ┌──────────────┐       ┌──────────────┐     │
│         │ExplorePrompt │       │FormulaPreview│     │
│         │ glass panel  │       │              │     │
│         │ (z-floating) │       │ (z-floating) │     │
│         │ centered     │       │ top-right    │     │
│         └──────────────┘       └──────────────┘     │
│                                                     │
│                  ┌─────────────┐                    │
│                  │             │                    │
│                  │    Scene    │                    │
│                  │   flex-1    │                    │
│                  │             │                    │
│                  └─────────────┘                    │
│                  ┌─────────────┐                    │
│                  │ControlPanel │                    │
│                  │(z-controls) │                    │
│                  │ bottom-16   │ ← test: 12/16/20   │
│                  └─────────────┘                    │
│                                                     │
│            ┌───────────────────────┐                │
│            │ QuestionCard / Match  │                │
│            │     (z-content)       │                │
│            │  bottom-24 sm:32      │                │
│            └───────────────────────┘                │
│                                                     │
├─────────────────────────────────────────────────────┤
│ FeedbackBanner (z-fixed, fixed bottom-0, full width)│
└─────────────────────────────────────────────────────┘
```

---

## Implementation Tasks

### 1. Z-Index Tokens
- [ ] Add semantic z-index layers to `@theme inline` in `src/index.css`

### 2. ExplorePrompt Updates
- [ ] Remove `left-16` mobile positioning
- [ ] Add centered positioning (`left-1/2 -translate-x-1/2`)
- [ ] Add glass panel styling
- [ ] Update to use `z-floating`

### 3. ControlPanel Updates
- [ ] Test height options (`bottom-12`, `bottom-16`, `bottom-20`) in browser
- [ ] Apply chosen scene-adjacent positioning
- [ ] Add width transition for smooth adaptive sizing
- [ ] Update to use `z-[--z-controls]`

### 4. FormulaPreview Updates
- [ ] Standardize positioning (`top-4 right-4 sm:top-8 sm:right-8`)
- [ ] Update to use `z-floating`

### 5. QuestionCard/Match Celebration
- [ ] Standardize positioning (`bottom-24 sm:bottom-32`)
- [ ] Update to use `z-content`

### 6. FeedbackBanner Updates
- [ ] Update to use `z-fixed`

### 7. CelebrationPulse Updates
- [ ] Update to use `z-overlay`

### 8. Back Navigation Cleanup
- [ ] Hide Navigation back button when in module view (App.tsx)
- [ ] Keep EscapeHatch as primary navigation
- [ ] Verify EscapeHatch z-index (`z-[--z-fixed]`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add z-index tokens to `@theme inline` |
| `src/components/feedback/ExplorePrompt.tsx` | Remove `left-16`, add glass panel, use `z-[--z-floating]` |
| `src/components/Module.tsx` | Update ControlPanel positioning (test heights), update z-index classes |
| `src/components/controls/ControlPanel.tsx` | Add width transition |
| `src/components/feedback/FormulaPreview.tsx` | Standardize positioning, use `z-[--z-floating]` |
| `src/components/feedback/FeedbackBanner.tsx` | Use `z-[--z-fixed]` |
| `src/components/celebration/CelebrationPulse.tsx` | Use `z-[--z-overlay]` |
| `src/App.tsx` | Hide Navigation back button in module view |

---

## Success Criteria

- [ ] ExplorePrompt centered on all screen sizes (no `left-16` offset)
- [ ] All z-index values use semantic CSS variables (`z-[--z-*]`)
- [ ] ControlPanel visually connected to Scene (raised positioning)
- [ ] Only EscapeHatch visible for navigation (Navigation back button hidden in module)
- [ ] Glass panel improves ExplorePrompt readability
- [ ] ControlPanel has smooth width transition
- [ ] No visual regressions in existing functionality

---

## Future Phases

- **Phase 2:** Component Polish (Match Celebration visuals, locked slider indicators)
- **Phase 3:** Animation System (stage transitions, exit animations, micro-interactions)
- **Phase 4:** Visual Hierarchy (reading order, feedback mechanisms)
- **Phase 5:** Responsive & Accessibility (keyboard nav, ARIA, contrast)

---

*End of Phase 1 Design*
