# Sinewaves Instrument — Refactor Spec

**Author:** Randall + Mentor Session  
**Date:** February 5, 2026  
**Status:** Ready for implementation

---

## The Core Idea

The sinewaves module is a **scientific instrument**, not a tutorial. Everything is always visible and interactive. Pedagogy lives in what the instrument draws your attention to — not in what it withholds.

Think oscilloscope, not slideshow.

---

## Layout Architecture

### The Instrument (always rendered, always interactive)

```
┌──────────────────────────────────────────────────────┐
│  HUD STRIP: [←] SINEWAVES  ●●●○○  SYS:NOM  [ESC]   │
├──────────────────────────────────────────────────────┤
│  PROMPT        │  FORMULA                            │
│  (1-2 lines)   │  y = 1.0 · sin(1.0 t)              │
├──────────────────────────────────────────────────────┤
│                                                      │
│         ╭─╮                                          │
│        ╱   ╲        ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿                │
│  ─────•─────•────  ───────────────────               │
│        ╲   ╱        (sine wave + grid)               │
│         ╰─╯                                          │
│    unit circle      sin(θ)                           │
│                                                      │
├──────────────────────────────────────────────────────┤
│  AMPLITUDE ═══════●══════ 1.0   FREQUENCY ═══●═══ 1  │
│          [ ▶ TRACE ]  [ ↻ RESET ]  [ SPEED ●── ]    │
└──────────────────────────────────────────────────────┘
```

### What changes per guide state

Only these things change as the user progresses:

| Element | What changes | What stays |
|---------|-------------|------------|
| Prompt text | Updates per state | Always visible, always 1-2 lines |
| Formula highlight | Which parameter glows cyan | Formula always visible |
| Ghost wave | Appears/disappears, target values change | User's wave always animating |
| StatusStrip dots | Fill as user progresses | Always visible |
| Match glow | Wave glows amber on match | Brief, auto-clears |
| Sliders | Never hidden | Always both visible and draggable |

---

## Responsive Layout — Three Breakpoints

### Desktop (≥1024px) — "The Full Instrument"

```
┌─────────────────────────────────────────────────────────────┐
│  [←] SINEWAVES  ●●●○○                    SYS:NOM    [ESC]  │
├────────────────────────────┬────────────────────────────────┤
│  OBSERVATION               │  FORMULA                       │
│  Watch where the wave      │  y = 1.0 · sin(1.0 t)         │
│  comes from                │  θ = 0.00π rad                 │
├────────────────────────────┴────────────────────────────────┤
│                                                             │
│     ╭─╮           ┊                                         │
│    ╱   ╲          ┊       ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿               │
│   •─────•─────────┊──────────────────────────               │
│    ╲   ╱          ┊                                         │
│     ╰─╯           ┊                                         │
│  unit circle              sin(θ)                            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  AMPLITUDE ═════════●═════════ 1.0    FREQUENCY ════●══ 1.0 │
│         [ ▶ TRACE ]    [ ↻ RESET ]    [ SPEED ●─── ]       │
└─────────────────────────────────────────────────────────────┘
```

**Grid:** 4 rows — HUD strip | readout row (prompt + formula side by side) | visualization | controls  
**Viz:** Circle left, connector, wave right — horizontal spread  
**Sliders:** Side by side in a single row  
**Buttons:** TRACE, RESET, SPEED in a row below sliders  

### Tablet (768px–1023px) — "Compact Instrument"

Same layout as desktop but:
- Readout row: prompt and formula stack if needed (flex-wrap)
- Viz area gets slightly less horizontal room — `useSceneLayout` handles scaling
- Sliders still side by side
- Buttons may wrap to fit

### Mobile (<768px) — "Portrait Instrument"

```
┌─────────────────────────────┐
│  ●●●○○  SYS:NOM      [ESC] │
├─────────────────────────────┤
│  Watch where the wave       │
│  comes from                 │
├─────────────────────────────┤
│  y = 1.0 · sin(1.0 t)      │
├─────────────────────────────┤
│                             │
│        ╭─╮                  │
│       ╱   ╲                 │
│  ────•─────•────            │
│       ╲   ╱                 │
│        ╰─╯                  │
│                             │
│    ∿∿∿∿∿∿∿∿∿∿∿∿∿            │
│   ─────────────────         │
│                             │
├─────────────────────────────┤
│  AMPLITUDE ═══════●══ 1.0   │
│  FREQUENCY ════●═════ 1.0   │
├─────────────────────────────┤
│  [▶ TRACE] [↻ RESET] [SPD] │
└─────────────────────────────┘
```

**Grid:** 6 rows — HUD strip | prompt | formula | visualization | sliders | buttons  
**Viz:** Circle top, wave bottom — vertical stack (already handled by `useSceneLayout` portrait mode)  
**Sliders:** Stacked vertically, full width  
**Buttons:** Row of 3, compact  
**Key difference from current:** Prompt and formula are NOT hidden on mobile. They're just compact (1-2 lines each). The current Layout.tsx hides readouts on mobile — that changes.

### Small Mobile (<375px) — "Minimum Viable Instrument"

Same as mobile but:
- Prompt: single line, truncate with ellipsis if needed
- Formula: just `y = 1.0 · sin(1.0t)` — no θ line
- Sliders: 44px touch targets minimum (already have this)
- Consider: SPEED control hidden, TRACE/RESET only

---

## Guide States (replaces Stage Machine)

Five states. No sub-phases. Prompts only — the instrument never changes shape.

```typescript
type GuideState = 'watch' | 'match-amplitude' | 'match-frequency' | 'challenge' | 'free'
```

### State: `watch`
- **Prompt:** "Watch how the circle drives the wave"
- **Formula highlight:** None (both parameters neutral)
- **Ghost wave:** None
- **Connector:** Visible (this is the key teaching moment)
- **Advance:** User clicks Continue (or just starts dragging sliders)
- **Auto-advance option:** If user drags a slider before clicking continue, skip to match-amplitude

### State: `match-amplitude`
- **Prompt:** "Match the ghost wave — try the amplitude slider"
- **Formula highlight:** Amplitude in cyan
- **Ghost wave:** Appears with target amplitude (1.5), same frequency (1.0)
- **Connector:** Hidden (focus shifts to matching)
- **Match detection:** `|amplitude - 1.5| ≤ 0.1`
- **On match:** Wave glows amber 600ms → prompt auto-advances

### State: `match-frequency`
- **Prompt:** "Now match this one — try frequency"
- **Formula highlight:** Frequency in cyan
- **Ghost wave:** Target frequency (2.0), amplitude stays at user's current value
- **Connector:** Hidden
- **Match detection:** `|frequency - 2.0| ≤ 0.15`
- **On match:** Glow → auto-advance

### State: `challenge`
- **Prompt:** "One more — something changed. Can you match it?"
- **Formula highlight:** None (user figures out which parameter)
- **Ghost wave:** One random parameter changed (use existing `generateChallengeTarget`)
- **Connector:** Hidden
- **Match detection:** Active parameter within threshold
- **On match:** Glow → advance to free
- **Repeat option:** "Try another" button appears after first completion

### State: `free`
- **Prompt:** "Every sine wave is circular motion in disguise." (the 'so what')
- **Formula highlight:** Both parameters in cyan
- **Ghost wave:** None (or togglable)
- **Connector:** Visible again (full instrument)
- **Action buttons:** "Try Another Challenge" / "Complete Module"
- **This is the default state after guided tour completes**

---

## Guide State Transitions

```
watch ──→ match-amplitude ──→ match-frequency ──→ challenge ──→ free
  │              │                    │                │          │
  │   (user can  │    (user can       │    (user can   │          │
  │    drag to   │     drag any       │     drag any   │          │
  │    skip)     │     slider)        │     slider)    │          │
  └──────────────┴────────────────────┴────────────────┘          │
                                                                  │
                                              "Try Another" ──→ challenge
                                              "Complete" ──→ onComplete()
```

**Key principle:** The user can ALWAYS drag any slider in any state. The guide just tells them what to focus on. If they match the target before the guide suggests it, great — advance immediately.

---

## Component Changes

### Keep (unchanged or minor edits)
- `UnitCircle.tsx` — No changes needed
- `SineWave.tsx` — No changes needed  
- `Connector.tsx` — No changes needed
- `scene-layout.ts` — No changes needed
- `sinewaves-constants.ts` — No changes needed
- `challenge-utils.ts` — No changes needed
- `ParameterSlider.tsx` — No changes needed
- `FormulaReadout.tsx` — Minor: always visible now, no entrance animation needed
- `ContinueButton.tsx` — Keep for 'watch' state and 'free' state actions

### Modify
- `Layout.tsx` — New grid that always shows all regions at every breakpoint
- `ObservatoryModule.tsx` → `InstrumentModule.tsx` — Dramatically simpler state management
- `StatusStrip.tsx` — Add "SINEWAVES" title, "SYS:NOM" status, ESC button
- `PromptReadout.tsx` — Simpler: just 1-2 lines, no description sub-field needed
- `ControlStrip.tsx` — Always renders both sliders + TRACE/RESET/SPEED buttons
- `Scene.tsx` — Add grid lines to visualization background
- `sinewaves-copy.ts` — Cut in half: just 5 prompt strings + 'so what' text + match celebration strings
- `animations.ts` — Simplify: keep boot sequence + match glow, remove stageTransition

### Remove
- `DiagnosisChoices.tsx` — Gone. The act of matching IS the diagnosis.
- `RevealPanel.tsx` — Gone. Replaced by prompt text + action buttons in free state.
- `MatchFeedback.tsx` — Gone as a component. Match feedback becomes a wave glow + prompt change.

### Add
- Grid lines component (inside Scene, behind the viz)
- TRACE/RESET/SPEED button row (new component or inline in ControlStrip)

---

## Scene Grid Lines

This is the single biggest visual upgrade. The screenshots show a subtle coordinate grid behind the visualization that sells the "scientific instrument" feeling.

```typescript
// Inside Scene.tsx — new GridLines component
function GridLines({ width, height }: { width: number; height: number }) {
  // Subtle grid: major lines every 1 unit, minor lines every 0.5
  // Color: var(--lab-border) at ~0.15 opacity for minor, ~0.25 for major
  // X-axis and Y-axis slightly brighter (~0.4 opacity)
  // Labels: "unit circle" under circle, "sin(θ)" under wave
}
```

---

## Match Feedback (simplified)

No separate component. Match is handled inline:

```typescript
// In InstrumentModule
const [matchGlow, setMatchGlow] = useState(false)

const onMatch = () => {
  setMatchGlow(true)
  // Wave glows amber for 600ms
  setTimeout(() => {
    setMatchGlow(false)
    advanceGuideState()
  }, 800)
}
```

The SineWave component already supports `glow={true}` which switches to amber. That's all you need.

---

## TRACE / RESET / SPEED Controls

These make it feel like a real instrument:

- **TRACE:** Toggles animation on/off (maps to `isPaused`). Shows ▶/⏸ icon.
- **RESET:** Resets clock (wave redraws from scratch). Resets sliders to 1.0/1.0.
- **SPEED:** Small slider or toggle (0.5x / 1x / 2x). Multiplier on `useFrame` time.

These are always visible. They don't interact with the guide state at all.

---

## Estimated Effort

| Task | Effort | Notes |
|------|--------|-------|
| New Layout.tsx (responsive grid) | Medium | Replace current 3/4-row approach with always-visible layout |
| InstrumentModule.tsx (replaces ObservatoryModule) | Medium | Simpler state, but careful wiring |
| Grid lines in Scene | Small-Medium | Three.js grid geometry + labels |
| StatusStrip HUD chrome | Small | Add title, SYS:NOM, ESC |
| ControlStrip (always-visible sliders + buttons) | Small | Remove conditional rendering |
| TRACE/RESET/SPEED controls | Small | New button row |
| Simplify copy file | Small | Cut to 5 prompts |
| Remove DiagnosisChoices, RevealPanel, MatchFeedback | Small | Delete + clean imports |
| Simplify animations.ts | Small | Remove stageTransition, keep boot + glow |
| Testing all breakpoints | Medium | The real work |

**Total:** ~3-5 focused sessions, not a rewrite.

---

## What This Preserves

- All 3D visualization components (UnitCircle, SineWave, Connector)
- The responsive scene layout system (useSceneLayout)
- Match detection logic and constants
- Challenge target generation
- The Observatory HUD visual identity
- Boot sequence animation
- Progressive disclosure pedagogy (just delivered through attention, not access)

## What This Removes

- ~40% of ObservatoryModule.tsx complexity
- Conditional slider rendering per stage
- Challenge sub-phases (observe → diagnose → match)
- DiagnosisChoices component
- RevealPanel component  
- MatchFeedback component
- Stage transition animations (fade out/in of control strip)
- Hidden readouts on mobile

## What This Adds

- Grid lines (the biggest visual win)
- TRACE / RESET / SPEED controls (instrument feel)
- HUD chrome details (SINEWAVES title, SYS:NOM)
- Always-visible formula and prompt on mobile
- Simpler mental model for future modules

---

## Implementation Order

1. **Layout.tsx** — New responsive grid (everything visible at all breakpoints)
2. **ControlStrip** — Both sliders always visible + TRACE/RESET/SPEED
3. **InstrumentModule** — New 5-state guide, wired to existing Scene
4. **Grid lines** — Visual upgrade in Scene
5. **StatusStrip HUD chrome** — Title, status, ESC
6. **Copy simplification** — Cut the copy file
7. **Delete removed components** — Clean up
8. **Cross-breakpoint testing** — The real polish

---

*"The instrument is the experience. The guide is just someone pointing at the interesting parts."*
