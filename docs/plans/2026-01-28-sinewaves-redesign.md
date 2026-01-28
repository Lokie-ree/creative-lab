# Sinewaves Module Redesign

**Date:** 2026-01-28
**Status:** Approved
**Scope:** Full visual redesign + flow refinements for sinewaves module

## Overview

Ground-up redesign of the sinewaves module implementing the Observatory HUD aesthetic direction. Transforms the module from "functional but unmemorable" to a distinctive control room / instrument panel experience.

## Goals

1. Implement Observatory HUD visual direction from design docs
2. Replace auto-advance timers with user-initiated progression
3. Add staged reveal pattern for post-match celebrations
4. Centralize animation timing for easy tweaking
5. Mobile-first responsive design with tablet breakpoint

## Non-Goals

- Reworking 3D components (UnitCircle, SineWave, Connector)
- Changes to skeleton hooks themselves
- Other modules

---

## Layout Architecture

### Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 640px | Single column, stacked vertically |
| Tablet | 640px - 1023px | Formula + controls side-by-side |
| Desktop | 1024px+ | Readouts side-by-side, horizontal viz |

### Region Structure

```
┌─────────────────────────┐
│ STATUS STRIP (48px)     │  Avatar | Progress | Stage (1/4)
├─────────────────────────┤
│ READOUT REGION          │  Prompt + Formula (stack/row by breakpoint)
├─────────────────────────┤
│                         │
│ PRIMARY DISPLAY         │  Circle + wave (sacred, never cramped)
│ (flex-1)                │
│                         │
├─────────────────────────┤
│ CONTROL STRIP           │  Slider / buttons / feedback
└─────────────────────────┘
```

### Spacing Tokens

```css
--space-1: 4px;   /* tight details */
--space-2: 8px;   /* inline gaps */
--space-3: 12px;  /* component padding */
--space-4: 16px;  /* panel gaps */
--space-6: 24px;  /* section gaps */
--space-8: 32px;  /* region separation */
--space-12: 48px; /* status strip height */
```

---

## Visual Design

### Typography

| Role | Font | Usage |
|------|------|-------|
| Display/Headers | JetBrains Mono | Stage titles, labels |
| Body/Prompts | DM Sans | Instructional text |
| Data/Formula | JetBrains Mono | Mathematical expressions |

```css
--font-display: 'JetBrains Mono', monospace;
--font-body: 'DM Sans', sans-serif;
--font-data: 'JetBrains Mono', monospace;
```

### Color Roles

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0f` | Deep dark canvas |
| `--color-surface` | `#12121a` | Panel backgrounds |
| `--color-border` | `rgba(34, 211, 238, 0.15)` | Subtle cyan edges |
| `--color-accent` | `#22d3ee` | Live data, active controls |
| `--color-accent-glow` | `rgba(34, 211, 238, 0.3)` | Panel edge glow |
| `--color-earned` | `#f5a623` | Amber for reveals, celebrations |
| `--color-ghost` | `#888888` | Target/locked elements |
| `--color-text` | `#e2e8f0` | Primary text |
| `--color-text-muted` | `#64748b` | Secondary text, labels |

### Panel Treatment

**Prompt Readout:**
- Dark surface (`--color-surface`)
- Left edge glow (2px cyan)
- No full border

**Formula Readout:**
- Dark surface
- Corner bracket accents
- "YOU'RE BUILDING" label in muted text

---

## Animation System

### Timing Tokens

```ts
// src/lib/animation/tokens.ts
export const duration = {
  fast: 150,      // micro-interactions, hovers
  normal: 300,    // standard transitions
  slow: 500,      // emphasis, staged reveals
  dramatic: 800,  // major state changes
} as const;

export const easing = {
  out: 'power3.out',      // ease-out-expo equivalent
  inOut: 'power2.inOut',  // ease-in-out-cubic equivalent
} as const;

export const stagger = {
  tight: 50,
  normal: 100,
  loose: 150,
} as const;
```

### Animation Presets

| Preset | Purpose | Timing |
|--------|---------|--------|
| `fadeInReadout` | Panel appears | 300ms, ease-out |
| `fadeOutReadout` | Panel exits | 200ms, ease-in-out |
| `pulseSuccess` | Match threshold hit | 500ms glow pulse |
| `stagedReveal` | Sequential element reveals | 300ms each, 100ms stagger |

### Staged Reveal Pattern

When user matches target:

```
0ms     Hold matched state (visual confirmation)
        └─ Wave glows brighter, circle pulses once

300ms   Success indicator appears
        └─ Subtle glow intensifies

600ms   Feedback text fades in
        └─ "Amplitude controls the wave's height"

1000ms  Next action appears
        └─ Continue button (user clicks to proceed)
```

---

## Flow Refinements

### User-Initiated Progression

- **No countdown timers** - User clicks "Continue" when ready
- **Observe stage**: Watch freely, proceed when understood
- **Parameter stages**: Explore, match, see celebration, click to continue
- **Challenge stage**: Same pattern
- **Reveal**: User chooses "Try Another", "Explore", or "Finish"

### Stage Structure (unchanged)

```
observe → amplitude → frequency → challenge → reveal
              │            │
              └── explore → match → reflect (each)
```

---

## Component Structure

### File Organization

```
src/components/modules/sinewaves/
├── Module.tsx              # Uses skeleton hooks, coordinates animations
├── Layout.tsx              # CSS Grid regions, responsive breakpoints
├── components/
│   ├── StatusStrip.tsx     # Avatar, progress, stage indicator
│   ├── PromptReadout.tsx   # Left-edge glow panel
│   ├── FormulaReadout.tsx  # Corner bracket panel
│   ├── ControlStrip.tsx    # Slider, buttons, feedback container
│   └── ContinueButton.tsx  # User-initiated progression
├── Scene.tsx               # R3F Canvas (unchanged)
├── UnitCircle.tsx          # (existing)
├── SineWave.tsx            # (existing)
├── Connector.tsx           # (existing)
├── sinewaves-copy.ts       # (existing content)
└── animations.ts           # Module-specific animation orchestration

src/lib/animation/          # NEW - shared infrastructure
├── tokens.ts               # Timing constants
└── presets.ts              # GSAP timeline factories
```

### Skeleton Integration

| Concern | Owner | Location |
|---------|-------|----------|
| Phase state | Skeleton | `useModuleFlow` |
| Stage unlock | Skeleton | `useStageUnlock` |
| Match detection | Module | calls `flow.recordMatch()` |
| Animation timing | Shared | `src/lib/animation/tokens.ts` |
| Animation orchestration | Module | uses presets from `src/lib/animation/presets.ts` |

---

## Implementation Plan

### Phase 1: Foundation
- [ ] Create `src/lib/animation/tokens.ts` with timing constants
- [ ] Create `src/lib/animation/presets.ts` with GSAP factories
- [ ] Add font loading (JetBrains Mono, DM Sans) to app

### Phase 2: Layout
- [ ] Create new `Layout.tsx` with CSS Grid regions
- [ ] Add spacing CSS custom properties
- [ ] Implement 3 breakpoints (mobile/tablet/desktop)

### Phase 3: Components
- [ ] Create `StatusStrip.tsx`
- [ ] Create `PromptReadout.tsx` with left-edge glow
- [ ] Create `FormulaReadout.tsx` with corner brackets
- [ ] Create `ControlStrip.tsx`
- [ ] Create `ContinueButton.tsx`

### Phase 4: Integration
- [ ] Refactor `Module.tsx` to use new layout + components
- [ ] Wire up skeleton hooks with new component structure
- [ ] Remove countdown timers, add Continue buttons
- [ ] Implement staged reveal on match success

### Phase 5: Polish
- [ ] Test all breakpoints
- [ ] Tune animation timing
- [ ] Verify a11y (focus management, announcements)
- [ ] Performance check (60fps animations)

---

## Success Criteria

1. Module matches Observatory HUD mockups visually
2. User controls all progression (no auto-advance)
3. Post-match celebration feels deliberate, not rushed
4. Animation timing easily adjustable from single file
5. Works well on mobile, tablet, and desktop
6. No regression in learning flow effectiveness
