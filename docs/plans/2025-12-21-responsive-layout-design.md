# Responsive Layout Design

## Summary

Stacked layout with visualization on top and controls docked at bottom. Mobile portrait stacks circle above wave vertically. Match indicator inline with controls. Formula reveal as centered overlay.

## Overall Structure

### Desktop (≥768px)

```
┌─────────────────────────────────────────┐
│                                         │
│   [Circle]  ───────►  [Wave Trail]      │  ← Visualization (~70% height)
│                                         │
├─────────────────────────────────────────┤
│  [Amplitude ═══●═══]  [Match: 73%]      │  ← Control Panel
│  [Frequency ═══●═══]                    │
│  [Phase     ═══●═══]                    │
└─────────────────────────────────────────┘
```

### Mobile Portrait (<768px)

```
┌─────────────────────┐
│      [Circle]       │  ← Stacked vertically
├─────────────────────┤
│    [Wave Trail]     │
├─────────────────────┤
│ [Amplitude ═══●═══] │  ← Controls stack
│ [Frequency ═══●═══] │
│ [Phase     ═══●═══] │
│    [Match: 73%]     │
└─────────────────────┘
```

**Breakpoint**: 768px

## Responsive 3D Scene

R3F uses world units, not CSS. Scene adapts via `useThree()` viewport detection.

### Desktop
- Camera: z=6, fov=50
- Circle: x=-2.5
- Wave: starts at x=0

### Mobile Portrait
- Camera: z=7 (pulled back)
- Circle: y=+1.2, x=0 (upper half)
- Wave: y=-1.0, x=0 (lower half)
- Wave width shrinks for narrower viewport

### Detection Logic
```typescript
const isPortrait = viewport.width < viewport.height && viewport.width < 5
```

No animated transition between layouts — instant switch.

## Control Panel

### Container
- Fixed to bottom of viewport
- Background: `bg-black/80 backdrop-blur-sm`
- Padding: py-4 px-6 (mobile), py-6 px-8 (desktop)

### Slider Layout
- Desktop: 3 sliders in a row, equal width, gap-6
- Mobile: stacked vertically, full width, gap-4
- Each slider has label above and current value displayed

### Match Indicator
- Desktop: right of sliders, vertically centered
- Mobile: centered below sliders, full width
- Color gradient: Red (<50%) → Yellow (50-80%) → Green (>80%) → Pulse at 95%+
- Display: "Match: 73%" or circular progress ring

### Touch Considerations
- Slider thumb: minimum 44px hit area
- Adequate spacing between sliders
- No hover-dependent states

## Formula Reveal Overlay

### Trigger
Match score ≥95% held for ~0.5s (debounced to prevent flicker).

### Appearance
- Centered over visualization area
- Dark semi-transparent backdrop
- Card: rounded, subtle border, matches control panel aesthetic

### Animation (GSAP)
1. Backdrop fades in (opacity 0→0.7, 200ms)
2. Card scales 0.8→1.0 with fade (300ms, ease-out)

### Content
```
┌────────────────────────────┐
│                            │
│      You just built:       │
│  y = 1.5 × sin(2.0t + π/4) │
│                            │
│       [ Keep Playing ]     │
└────────────────────────────┘
```

### Dismissal
- "Keep Playing" button closes overlay
- Clicking backdrop also dismisses
- User can continue adjusting after dismissal

### Mobile
Card scales to ~90% viewport width with appropriate font scaling.
