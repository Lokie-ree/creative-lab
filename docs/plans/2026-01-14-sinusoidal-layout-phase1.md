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

**Decision:** Semantic z-index layers in `tailwind.config.ts`.

```typescript
zIndex: {
  base: '0',        // Scene, ProgressBar
  controls: '10',   // ControlPanel, action buttons
  floating: '20',   // FormulaPreview, ExplorePrompt, back link
  content: '30',    // QuestionCard, Match Celebration
  fixed: '40',      // FeedbackBanner
  overlay: '50',    // CelebrationPulse, modals
}
```

### 3. Positioning Strategy

**Decision:** Hybrid approach — Scene uses `flex-1`, UI overlays use consistent absolute positioning.

**Decision:** ControlPanel positioned scene-adjacent (closer to visualization) rather than viewport-bottom.

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

**Decision:** Consolidate duplicate elements into single back link, top-left corner.

---

## Positioning Zones

```
┌─────────────────────────────────────────────────────┐
│ ProgressBar (z-base, top-0, full width)             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────────┐                                         │
│  │← Back  │  (z-floating, top-4 left-4)             │
│  └────────┘                                         │
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
│                  │scene-adjacent                    │
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

### 1. Tailwind Configuration
- [ ] Add semantic z-index layers to `tailwind.config.ts`

### 2. ExplorePrompt Updates
- [ ] Remove `left-16` mobile positioning
- [ ] Add centered positioning (`left-1/2 -translate-x-1/2`)
- [ ] Add glass panel styling
- [ ] Update to use `z-floating`

### 3. ControlPanel Updates
- [ ] Change from viewport-bottom to scene-adjacent positioning
- [ ] Add width transition for smooth adaptive sizing
- [ ] Update to use `z-controls`

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

### 8. Back Navigation Consolidation
- [ ] Identify duplicate elements (EscapeHatch + go back link)
- [ ] Consolidate into single back link
- [ ] Position top-left (`top-4 left-4 sm:top-8 sm:left-8`)
- [ ] Update to use `z-floating`

### 9. Module Layout Restructure
- [ ] Update parent layout to support scene-adjacent controls
- [ ] Ensure Scene uses `flex-1` properly
- [ ] Apply consistent edge margins (`mx-4 sm:mx-8`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `tailwind.config.ts` | Add semantic z-index layers |
| `ExplorePrompt.tsx` | Remove `left-16`, add glass panel, use `z-floating` |
| `ControlPanel.tsx` | Scene-adjacent positioning, width transition, use `z-controls` |
| `FormulaPreview.tsx` | Standardize positioning, use `z-floating` |
| `QuestionCard.tsx` or usage sites | Use `z-content`, standardize bottom positioning |
| `FeedbackBanner.tsx` | Use `z-fixed` |
| `CelebrationPulse.tsx` | Use `z-overlay` |
| `EscapeHatch.tsx` | Consolidate, reposition, use `z-floating` |
| `Module.tsx` or parent layout | Restructure for scene-adjacent controls |

---

## Success Criteria

- [ ] ExplorePrompt centered on all screen sizes (no `left-16` offset)
- [ ] All z-index values use semantic classes
- [ ] ControlPanel visually connected to Scene
- [ ] Single back navigation element (no duplicates)
- [ ] Glass panel improves ExplorePrompt readability
- [ ] Consistent spacing across all stages
- [ ] No visual regressions in existing functionality

---

## Future Phases

- **Phase 2:** Component Polish (Match Celebration visuals, locked slider indicators)
- **Phase 3:** Animation System (stage transitions, exit animations, micro-interactions)
- **Phase 4:** Visual Hierarchy (reading order, feedback mechanisms)
- **Phase 5:** Responsive & Accessibility (keyboard nav, ARIA, contrast)

---

*End of Phase 1 Design*
