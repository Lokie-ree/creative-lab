# Sinewaves Module: Boot Sequence & HUD Polish Design

**Date:** 2026-01-30
**Status:** Ready for implementation
**Scope:** Boot sequence, stage transitions, viz prominence
**Deferred:** Victory screen design (will break HUD metaphor — design separately)

---

## Design Direction

**Aesthetic:** Modern mission control — clean, precise, NASA. The feeling of systems coming online with purpose. Not sci-fi flash, but the precision of actual mission control where every element exists because it *has* to.

**The one thing someone remembers:** "I was at the console, watching the wave draw itself as the system came online."

**Three distinct experiences:**
1. **Boot/Online** — Anticipation, the system awakening
2. **Learning** — Focus, discovery, the work
3. **Victory** — (Deferred) Release, celebration, breaks the HUD

---

## 1. Boot Sequence

### Overview

A 2.2-second cinematic sequence that transforms first impression. The viz "calibration" is the emotional peak — the user sees the system come alive.

### Sequence Timeline

| Time | Element | Animation | Detail |
|------|---------|-----------|--------|
| 0.0s | Status text | Fade in (opacity 0→1, 200ms) | Center screen: "INITIALIZING..." in monospace, muted cyan |
| 0.3s | Status strip | Slide down + fade (y: -20→0, 300ms, expo-out) | 48px band, progress line begins filling |
| 0.5s | Display frame | Corner brackets fade in (opacity 0→1, 200ms) | Marks the sacred viz region |
| 0.8s | Viz powers on | Circle scales in (0.95→1, 250ms), wave starts drawing | The payoff — system comes alive |
| 1.4s | Calibration complete | Subtle pulse on frame (scale 1→1.01→1, 200ms) | One full rotation done, status: "ONLINE" |
| 1.6s | Prompt readout | Slide down + fade (y: -12→0, 300ms, expo-out) | From top, settles into position |
| 1.75s | Formula readout | — | Hidden until first discovery |
| 2.0s | Boot complete | Status fades to minimal | Observe stage begins seamlessly |

### Motion Principles

- **Easing:** Exponential out (expo-out) for all entrances — natural deceleration, no bounce
- **Causality:** Each step triggers the next — clear sequence, not simultaneous
- **Duration:** Individual animations 150-300ms, snappy not languid
- **Reduced motion:** If `prefers-reduced-motion`, instant `gsap.set()` without animation

### Visual Elements

**Initial status text:**
- Centered on screen before anything else
- Monospace font, `--lab-text-muted` color
- Fades out as status strip takes over

**Status strip:**
- 48px fixed height
- Left: status text (monospace, updates during boot)
- Right: thin progress line, fills left-to-right
- After boot: fades to minimal, only shows during transitions

**Display frame (corner brackets):**
- Four L-shaped corners marking viz region
- 1px stroke, `--lab-accent` at 30% opacity
- No full border — corners imply the frame
- Subtle pulse on stage changes

### What's NOT Happening

- No glassmorphism or glow borders during boot
- No typewriter text effect (too slow, too cliché)
- No scan lines or CRT effects
- No particle effects
- Status text is functional, not theatrical

---

## 2. Stage Transitions

### Overview

Each stage change is a brief "console reconfiguration" — 400ms of purposeful motion that shows the system adapting. The viz never fully disappears.

### Transition Types

| Transition | From → To | Status text | Duration |
|------------|-----------|-------------|----------|
| Boot → Observe | System online → Learning | — | (Part of boot) |
| Observe → Amplitude | Passive → Active | "ENABLING AMPLITUDE CONTROL..." | 400ms |
| Amplitude → Frequency | One param → Two | "ADDING FREQUENCY CONTROL..." | 400ms |
| Frequency → Challenge | Guided → Tested | "INITIATING CHALLENGE..." | 500ms |
| Challenge → Victory | Test → Triumph | (Deferred) | TBD |

### Choreography (400ms standard)

```
[0ms]    INITIATE
         └─ Status strip: text updates to transition label
         └─ Current controls begin fade out (opacity 1→0, 150ms)

[100ms]  RECONFIGURE
         └─ Prompt panel: quick exit (y: 0→-8, opacity→0, 150ms)
         └─ Viz: brief dim (opacity 1→0.7, 100ms) — NOT full black
         └─ Display frame: subtle pulse

[200ms]  STABILIZE
         └─ Viz: restore (opacity 0.7→1, 150ms)
         └─ New prompt slides in (y: -12→0, opacity 0→1, 200ms)
         └─ If new ghost target: ghost fades in (opacity 0→0.5, 200ms)

[300ms]  READY
         └─ New controls fade up (opacity 0→1, y: 8→0, 150ms)
         └─ Status strip: clears transition label

[400ms]  COMPLETE
         └─ User has full control
```

### Stage-Specific Details

**Observe → Amplitude:**
- Ghost wave fades in (the target to match)
- Single amplitude slider appears
- Prompt: exploration instruction

**Amplitude → Frequency:**
- Amplitude slider locks (muted appearance, reduced opacity)
- Frequency slider slides in alongside
- Ghost updates with frequency target

**Frequency → Challenge:**
- Longer transition (500ms) to mark shift to "test mode"
- Both sliders unlock with fresh positions
- New random ghost target fades in
- More prominent status text moment

### Motion Principles

- **Viz continuity:** Never fully disappears, only dims briefly (to 0.7 opacity)
- **Spatial logic:** Prompt from top, controls from bottom — consistent directions
- **Exit before enter:** Controls exit completely before new ones appear
- **Status narrates:** Brief text during transition reinforces "system updating"

---

## 3. Viz Prominence

### Overview

The viz is the oscilloscope display. Everything else is bezel and controls. When you look at this screen, your eye lands on the circle tracing the wave.

### Display Frame

```
┌─                                       ─┐

         ●────────────── ∿∿∿∿∿∿∿∿∿
        /│\
       / │ \           (the viz)
         │

└─                                       ─┘
```

- **Corner brackets:** 4 small L-shapes, 1px stroke, `--lab-accent` at 30% opacity
- **No full border:** Corners imply the frame without boxing it in
- **Appears during boot:** Part of "display powering on" moment
- **Pulses on stage change:** Reinforces "this is where the action is"

### Chromatic Hierarchy

| Element | Visual Weight | Treatment |
|---------|---------------|-----------|
| **Viz (circle + wave)** | Dominant | Full accent color, highest contrast |
| **Ghost target** | Secondary | 40% opacity, no glow |
| **Prompt readout** | Supporting | Muted text, smaller type, subtle bg |
| **Formula readout** | Tertiary | Monospace, muted until values discovered |
| **Status strip** | Chrome | Minimal, nearly invisible when idle |
| **Controls** | Functional | Present but no glow unless interacted |

### Layout Structure

**Desktop (≥768px):**

```
┌──────────────────────────────────────────────────────────┐
│ Status strip (48px)                                      │
├──────────────────────────────────────────────────────────┤
│ [Prompt ─────────────────────]    [Formula ────────────] │
│  left-aligned                          right-aligned     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                    VISUALIZATION (1fr)                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│ Controls strip (~80px)                                   │
└──────────────────────────────────────────────────────────┘
```

- Readouts in flex row with `justify-between`
- Both in document flow, not absolute positioned
- Single gap (24px) between readout row and viz

**Mobile (<768px):**

```
┌────────────────────────┐
│ Status strip           │
├────────────────────────┤
│ [Prompt ─────────────] │
├────────────────────────┤
│        [Formula ─────] │  ← Right-aligned, compact
├────────────────────────┤
│                        │
│    VISUALIZATION       │
│                        │
├────────────────────────┤
│ Controls               │
└────────────────────────┘
```

- Prompt full-width, formula below right-aligned
- Tighter vertical spacing to preserve viz space
- Formula smaller text on mobile

### Gap Rhythm

| Gap | Size | Between |
|-----|------|---------|
| Tight | 12px (`--space-3`) | Status strip → Readout row |
| Standard | 24px (`--space-6`) | Readout row → Viz |
| Standard | 24px (`--space-6`) | Viz → Controls |

### Viz Scaling

Current implementation uses fixed camera and positions. Proposed improvement:

```typescript
// Responsive scaling based on container
const { width, height } = useThree().viewport

// Scale to fill 70-80% of available space
const scale = Math.min(width / 8, height / 5)

// Maintain aspect relationship between circle and wave
// Breakpoint alignment with CSS layout breakpoints
```

### Focus Cues

**On stage enter:**
- Brief vignette effect (edges darken 5%, 200ms)
- Draws eye to center
- Fades out after 500ms

**During slider interaction:**
- Chrome dims slightly (opacity 0.95)
- Viz stays at full brightness
- Clear feedback loop: "this is what you're affecting"

---

## 4. Progressive Formula Reveal

### Visibility by Stage

| Stage | Formula State |
|-------|---------------|
| Boot | Hidden |
| Observe | Hidden |
| Amplitude (exploring) | Hidden |
| Amplitude (matched) | **Reveals** with A highlighted |
| Frequency (exploring) | Visible, A shown, f as variable |
| Frequency (matched) | Updates with f highlighted |
| Challenge | Fully visible with discovered values |
| Reveal | Prominent display |

### Reveal Animation

- **Desktop:** Slides in from right (x: 16→0, 300ms, expo-out)
- **Mobile:** Fades in below prompt (y: -8→0, opacity 0→1, 300ms)
- Brief accent pulse on the discovered value
- Feels like "system logging a discovery"

### Formula Display States

```
Hidden:        (not rendered)
First reveal:  y = [A]·sin(f·t)     ← A highlighted with accent
Second reveal: y = [A]·sin([f]·t)   ← f highlighted, A stays visible
Challenge:     y = 1.5·sin(2.0·t)   ← Actual values shown
```

---

## 5. Implementation Notes

### New Components Needed

1. **`BootSequence.tsx`** — Orchestrates the boot animation
   - Manages timeline state
   - Renders status text, triggers strip/frame/viz animations
   - Calls `onComplete` when boot finishes

2. **`DisplayFrame.tsx`** — Corner bracket SVG overlay
   - Absolutely positioned over viz region
   - Supports pulse animation via ref
   - Subtle, doesn't interfere with viz interaction

3. **`StageTransition.tsx`** (or hook) — Orchestrates stage change animations
   - Coordinates exit/enter timing
   - Updates status strip text
   - Handles viz dim/restore

### Modifications to Existing Components

**`Layout.tsx`:**
- Replace absolute positioning with CSS Grid
- Explicit row template: `48px auto 1fr auto`
- Gap rhythm via spacing tokens

**`Module.tsx`:**
- Add boot state management
- Integrate stage transition orchestration
- Progressive formula reveal logic

**`Scene.tsx`:**
- Support opacity prop for dim effect during transitions
- Responsive scaling based on viewport
- Corner brackets integration (or separate overlay)

**`ExplorePrompt.tsx`:**
- Compact single-line variant for HUD
- Slide animations for enter/exit

**`FormulaPreview.tsx`:**
- Hidden by default
- Reveal animation on first discovery
- Highlight animation for newly discovered values

### Animation Utilities to Add

```typescript
// lib/animations.ts additions

export function bootFadeIn(element: gsap.TweenTarget, delay = 0) {
  // 200ms fade, used for initial elements
}

export function bootSlideDown(element: gsap.TweenTarget, delay = 0) {
  // y: -20→0, 300ms, expo-out
}

export function stageReconfigure(options: {
  exitElements: Element[]
  enterElements: Element[]
  vizElement: Element
  onMidpoint: () => void
}) {
  // Orchestrated 400ms transition
}

export function vizDim(element: gsap.TweenTarget) {
  // opacity 1→0.7, 100ms
}

export function vizRestore(element: gsap.TweenTarget) {
  // opacity 0.7→1, 150ms
}

export function framePulse(element: gsap.TweenTarget) {
  // scale 1→1.01→1, 200ms
}
```

### CSS Tokens to Add

```css
:root {
  /* Boot sequence */
  --boot-duration-fade: 200ms;
  --boot-duration-slide: 300ms;
  --boot-easing: cubic-bezier(0.16, 1, 0.3, 1); /* expo-out */

  /* Stage transitions */
  --transition-duration: 400ms;
  --transition-duration-long: 500ms;

  /* Display frame */
  --frame-corner-size: 24px;
  --frame-stroke-width: 1px;
  --frame-opacity: 0.3;
  --frame-opacity-pulse: 0.5;
}
```

---

## 6. Success Criteria

After implementation, these should be true:

- [ ] First-time user's eye goes immediately to the viz
- [ ] Boot sequence feels like "system coming online," not "loading screen"
- [ ] Stage transitions feel like "console reconfiguring," not "swapping UI"
- [ ] Formula appears as earned reward, not given context
- [ ] Prompt and formula don't compete with viz for attention
- [ ] The overall impression is "I'm at the console" — not "I'm in an app"
- [ ] A student could say: "I've never experienced anything like this in school"

---

## 7. Deferred: Victory Screen

Victory will **break the HUD metaphor** — this is intentional. Design separately with its own aesthetic treatment. Notes for later:

- Viz can take over full screen
- Chrome fades or transforms
- Formula becomes prominent, celebratory
- Amber/gold color shift (revisit palette)
- Different motion language — expansive, not precise

---

## Appendix: Reference

- **HUD Direction:** `docs/design/sinewaves-observatory-hud-direction.md`
- **Design Improvements:** `DESIGN_IMPROVEMENTS.md`
- **Current Module:** `src/components/modules/sinewaves/Module.tsx`
- **Animation Utils:** `src/lib/animations.ts`
