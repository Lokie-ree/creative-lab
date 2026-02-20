# Sinewaves to 100%: Eurorack Reskin + Bug Fixes

**Date:** February 10, 2026
**Status:** Complete
**Mockup:** `mockups/eurorack-sinewaves.html`

---

## Context

The sinewaves module is the most polished module but reads as "AI made this" (cyan-on-dark, monospace display font, glow effects, blocking modal celebration). The frontend design audit identified these patterns. The chosen direction is **Eurorack / synth module**: matte faceplate, phosphor green accent, silk-screened labels, scored dividers, no glow.

**Scope:** Global design tokens change (entire app shifts to warm/Eurorack palette). Sinewaves gets the full treatment. Hero/constellation will need a separate follow-up pass for hardcoded cyan values.

---

## Phase 0: Design Tokens + Fonts

Everything downstream depends on these values.

### Files (3)

**`src/lib/colors.ts`** — Replace all values:

| Token | Old | New |
|-------|-----|-----|
| `accent.primary` | `#22d3ee` (cyan) | `#7cc87c` (phosphor green) |
| `accent.primaryHover` | `#67e8f9` | `#96e496` |
| `accent.primaryMuted` | `#06b6d4` | `#4a8a4a` |
| `background.primary` | `#0a0a0f` | `#1e1d1c` (warm faceplate) |
| `background.secondary` | `#12121a` | `#252422` |
| `background.tertiary` | `#1a1a24` | `#2e2c28` |
| `background.elevated` | `#2a2a3a` | `#3a3733` |
| `border.primary` | `#2a2a3a` | `#2e2c28` (scored line) |
| `border.subtle` | `#1f1f2a` | `#252422` |
| `border.muted` | `#888888` | `#7a746a` (silk dim) |
| `text.primary` | `#e0e0e0` | `#b8b0a4` (silk cream) |
| `text.secondary` | `#888888` | `#7a746a` |
| `text.muted` | `#4a5568` | `#4a463e` (silk faint) |
| `text.dim` | `#6b7280` | `#4a463e` |
| `ghost` | `#888888` | `#7a746a` |
| `success` | `#22d3ee` | `#5a7a5a` (earthy green) |
| (new) `danger` | — | `#8a4a4a` (muted red) |
| `learning.*` | unchanged | unchanged |

**`src/index.css`** — Update all `--lab-*` variables to match. Also:
- `ring-pulse` keyframes: `rgba(34,211,238,*)` → `rgba(124,200,124,*)`
- Font tokens: `--font-display: 'Inter Tight', sans-serif`; `--font-body: 'Inter Tight', sans-serif`; keep `--font-data: 'JetBrains Mono', monospace`
- Add `--lab-danger: #8a4a4a`

**`index.html`** — Replace Google Fonts: swap DM Sans for Inter Tight, keep JetBrains Mono.

### Verify
- `pnpm build` succeeds
- App loads — everything shifts warm/green. Hero and constellation look "off" (expected)

---

## Phase 1: Slider Reskin + Hardcoded RGBA Cleanup

### Files (4)

**`src/components/ui/slider.tsx`** — Fader-style reskin:
- Track: remove `rounded-full`, flat `h-1` bar
- Thumb: remove `rounded-full` → rectangular `h-6 w-3 sm:h-5 sm:w-2.5`
- Remove ALL glow shadows: 3 instances of `shadow-[0_0_*px_rgba(34,211,238,*)]`
- Keep `border-(--lab-accent) bg-(--lab-accent)` (now phosphor green via token)

**`src/components/modules/sinewaves/components/PromptReadout.tsx`**:
- Remove `shadow-[inset_4px_0_8px_-4px_rgba(34,211,238,0.3)]`

**`src/components/modules/sinewaves/components/ContinueButton.tsx`**:
- Replace `hover:bg-[rgba(34,211,238,0.1)]` → `hover:bg-(--lab-accent)/10`

**`src/components/shared/ParameterSlider.tsx`**:
- Add tick marks (divs at min, 25%, 50%, 75%, max along slider track)
- Label: `uppercase text-[9px] tracking-[0.15em] font-[family-name:var(--font-display)]`

### Verify
- Grep confirms zero `rgba(34,211,238` in codebase
- Sliders render as rectangular faders, no glow
- 44px touch targets maintained

---

## Phase 2: Layout + Panel Reskin

### Files (6)

**`src/components/modules/sinewaves/Layout.tsx`**:
- Remove `rounded` from main element
- Remove corner bracket decorative elements
- Replace `gap-2 p-2` / `gap-4 p-4` with `gap-0` — scored borders between sections
- Add 4 panel screw elements (absolute-positioned at corners)

**`src/components/modules/sinewaves/components/StatusStrip.tsx`**:
- Progress dots: remove `rounded-full` + ring glow. Replace with solid LEDs: done = `bg-(--lab-success)`, active = `bg-(--lab-accent)`, upcoming = `bg-(--lab-border)`
- Remove `rounded` from back/ESC buttons
- Typography: `text-[9px] tracking-[0.15em] uppercase`

**`src/components/modules/sinewaves/components/PromptReadout.tsx`** (continued):
- Remove `rounded`
- Remove `border-l-2 border-l-(--lab-accent)` left border
- Add micro-label: "OBSERVATION" in silk-screen style

**`src/components/modules/sinewaves/components/FormulaReadout.tsx`**:
- Remove `rounded`
- Change "You're Building" → "FORMULA" in `text-[8px] uppercase tracking-[0.2em]`

**`src/components/modules/sinewaves/components/InstrumentControls.tsx`**:
- Remove `rounded` from all buttons
- TRACE: `text-(--lab-success)` when playing (earthy green)
- RESET: `text-(--lab-danger)` (muted red)
- SPEED: neutral `text-(--lab-text-muted)`

**`src/components/modules/sinewaves/components/ControlStrip.tsx`**:
- Add scored top border
- Tighten spacing

### Verify
- Desktop (1280px): side-by-side readouts with scored separator, panel screws visible
- Mobile (375px): stacked, sharp-cornered, no content clipped
- Focus rings visible (phosphor green on warm faceplate, ~5.8:1 contrast)

---

## Phase 3: R3F Scene Colors

### Files (2)

**`src/components/modules/sinewaves/GridLines.tsx`**:
- Replace hardcoded `#333344` → `#2e2c28` on all three `lineBasicMaterial` elements

**`src/components/modules/sinewaves/UnitCircle.tsx`** (if needed):
- Verify circle outline visibility against `#1e1d1c`. May need `colors.border.muted` (`#7a746a`).

### Verify
- Grid lines subtle but visible on warm background
- Unit circle outline clearly visible
- User wave = phosphor green, ghost wave = warm gray

---

## Phase 4: Bug Fixes

### 4A. Ghost wave sync — `Scene.tsx`

**Bug:** Challenge stage ghost falls through to `return target` — shows both params at target values instead of mirroring user's non-challenge param.

**Fix:** Add `challengeParam?: 'amplitude' | 'frequency'` prop. Fix `ghostParams`:
```typescript
if (stage === 'challenge' && stageTargets && challengeParam) {
  if (challengeParam === 'amplitude') {
    return { a: stageTargets.amplitude, f: frequency, p: 0 }
  }
  return { a: amplitude, f: stageTargets.frequency, p: 0 }
}
return target  // observe/free only
```

### 4B. Pass challengeParam — `InstrumentModule.tsx`

Add to `<Scene>` props:
```tsx
challengeParam={guideState === 'challenge' ? challengeParam : undefined}
```

### 4C. Snap-to-target — `InstrumentModule.tsx`

In `checkMatch`, after detecting match, snap:
```typescript
if (param === 'amplitude') setAmplitude(target)
else setFrequency(target)
```

### 4D. Replace celebration overlay — `InstrumentModule.tsx`

Remove blocking modal (lines 362-373). Replace with inline banner:
- Add refs for `matchFeedbackRef`, `matchContinueRef`
- Render inline strip (NOT full-screen overlay) with `opacity-0` initial
- On match, call `matchSuccessSequence(refs, onComplete)` from `animations.ts`
- Instrument stays fully visible and interactive

### 4E. Fix easing — `animations.ts`

Replace `ease: 'back.out(1.7)'` → `ease: 'power2.out'`

### Files (3)

`Scene.tsx`, `InstrumentModule.tsx`, `animations.ts`

### Verify
- Challenge ghost mirrors only the target param, not both
- Slider snaps to exact target on match
- No full-screen overlay — inline banner with staged animation
- Smooth deceleration, no bounce

---

## Phase 5: Typography Polish

All components resolve `--font-display` to Inter Tight after Phase 0. This phase is targeted sizing/tracking adjustments.

### Files (6, overlap with Phase 2)

All in `src/components/modules/sinewaves/components/`:
- `StatusStrip.tsx`: "SINEWAVES" → `text-[9px] tracking-[0.15em]`
- `PromptReadout.tsx`: micro-label sizing
- `FormulaReadout.tsx`: "FORMULA" label sizing
- `ParameterSlider.tsx`: label `uppercase text-[9px] tracking-[0.15em]`
- `InstrumentControls.tsx`: button label sizing + tracking
- `ContinueButton.tsx`: verify Inter Tight renders well

### Verify
- Labels: small, CAPS, widely tracked (silk-screened look)
- Numeric values: crisp monospace
- No FOUT/FOIT

---

## Phase 6: Final Polish

- Accessibility audit: focus rings, touch targets, reduced motion
- Cross-module smoke test: hero, constellation, vector-transforms all load
- Update `AGENT.md` design system section with new palette + fonts
- Document follow-up items:
  - `NodeRings.tsx`, `ModuleNode.tsx`: hardcoded `#22d3ee`, `stroke-cyan-400`, `fill-cyan-400`
  - `HeroBackground.tsx`: hardcoded `rgba(34,211,238,0.15)`
  - `HeroContent.tsx`: hardcoded `rgba(34,211,238,0.4)`

---

## Summary

| Phase | What | Files | Depends on |
|-------|------|-------|------------|
| 0 | Tokens + fonts | 3 | — |
| 1 | Slider + RGBA cleanup | 4 | Phase 0 |
| 2 | Layout + panels | 6 | Phase 0 |
| 3 | R3F scene colors | 2 | Phase 0 |
| 4 | Bug fixes | 3 | Phase 0 |
| 5 | Typography | 6 | Phases 1-4 |
| 6 | Polish + docs | 1 | Phase 5 |

**~18 unique files.** Phases 1-4 can run in parallel after Phase 0.
