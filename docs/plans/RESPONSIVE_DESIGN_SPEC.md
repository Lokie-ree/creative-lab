# Responsive Design Specification

> **Purpose:** Design guidelines for the sine wave exploration module responsive layout
> **Date:** December 29, 2025
> **Updated:** December 30, 2025 (aligned with v2 module — phase parameter removed, max 2 sliders)
> **Status:** Ready for implementation

---

## Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| `mobile` | < 640px | Single column, stacked layout |
| `sm` | ≥ 640px | Transitional, still mostly stacked |
| `md` | ≥ 768px | Desktop layout kicks in |
| `lg` | ≥ 1024px | Comfortable desktop |

**Primary breakpoint:** `md` (768px) — this is where layout shifts from stacked to horizontal.

---

## Layout Zones

```
┌─────────────────────────────────────────────────────────────┐
│ PROGRESS BAR (fixed height: 4px)                            │
├─────────────────────────────────────────────────────────────┤
│ HEADER ZONE                                                 │
│ - Formula preview (top-right on desktop, centered on mobile)│
│ - Explore prompt (top-center)                               │
│ - Height: auto, absolute positioned                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ VISUALIZATION ZONE (flex-1, fills remaining space)          │
│ - Unit circle + connector + wave graph                      │
│ - Must have bottom padding when controls are floating       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ CONTROL ZONE                                                │
│ - Sliders (floating during exploration, docked in challenge)│
│ - Feedback banner (replaces sliders during feedback state)  │
│ - Height: auto                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. Control Panel (ControlPanel.tsx)

The slider container that appears during exploration and challenge stages.

#### Desktop (≥768px)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐                           │
│  │ Amplitude   │  │ Frequency   │               Feedback    │
│  │ [slider]    │  │ [slider]    │               text        │
│  └─────────────┘  └─────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Container | `bg-black/80 backdrop-blur-sm` |
| Padding | `px-8 py-6` |
| Max width | `max-w-4xl mx-auto` |
| Grid | `grid-cols-2 gap-8` (when 2 sliders visible) |
| Feedback | Inline to the right of sliders |

#### Mobile (<768px)

```
┌────────────────────────┐
│ ✓ Amplitude      1.5   │
│ [slider]               │
├────────────────────────┤
│ ✓ Frequency      2.0   │
│ [slider]               │
├────────────────────────┤
│     Getting closer...  │
└────────────────────────┘
```

| Property | Value |
|----------|-------|
| Padding | `px-4 py-4` |
| Grid | `grid-cols-1 gap-4` |
| Feedback | Centered below sliders |

#### Responsive Classes

```tsx
// Container
className="bg-black/80 backdrop-blur-sm px-4 py-4 md:px-8 md:py-6"

// Inner wrapper
className="max-w-4xl mx-auto"

// Grid (dynamic based on visible slider count)
// 1 slider: always single column
// 2 sliders: single column on mobile, 2 columns on md+
const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
}[visibleCount]

className={`grid ${gridCols} gap-4 md:gap-8`}
```

---

### 2. Parameter Slider (ParameterSlider.tsx)

Individual slider component with label, value, and optional discovery badge.

#### Layout Structure

```
┌─────────────────────────────────┐
│ ✓ You discovered      (badge)  │  ← Only when locked & discovered
├─────────────────────────────────┤
│ Label                    Value │  ← flex justify-between
├─────────────────────────────────┤
│ [═══════●════════════════════] │  ← slider track
└─────────────────────────────────┘
```

#### Critical Fix: Label/Value Row

The label and value MUST have a gap to prevent collision:

```tsx
// WRONG - causes "Amplitude1.58" collision
<div className="flex justify-between text-sm">
  <label>Amplitude</label>
  <span>1.58</span>
</div>

// CORRECT - gap prevents collision
<div className="flex justify-between items-center gap-2 text-sm">
  <label className="truncate">Amplitude</label>
  <span className="font-mono tabular-nums shrink-0">1.58</span>
</div>
```

| Property | Desktop | Mobile |
|----------|---------|--------|
| Label | Normal | `truncate` if needed |
| Value | `flex-shrink-0` | `flex-shrink-0` |
| Gap | `gap-2` minimum | `gap-2` minimum |
| Font | Label: sans, Value: `font-mono tabular-nums` | Same |

#### Discovery Badge

| Desktop | Mobile |
|---------|--------|
| Separate row above label | Inline with label using flex |

```tsx
// Desktop (default)
<div className="text-xs text-cyan-400 mb-1">✓ You discovered</div>

// Mobile - inline variant
<div className="flex items-center gap-1">
  <span className="text-xs text-cyan-400">✓</span>
  <label className="text-sm text-cyan-400">Amplitude</label>
</div>
```

---

### 3. Animated Panel (Module.tsx exploration stages)

Floating control panel during amplitude/frequency exploration stages.

#### Current Problem

Fixed pixel widths (`w-72`, `w-80`, `w-96`) don't adapt to viewport.

#### Solution

Use responsive width with max-width constraint:

```tsx
// WRONG
className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-72"

// CORRECT
className="absolute bottom-8 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-10 md:w-auto md:min-w-80 md:max-w-md"
```

Alternative (simpler):

```tsx
// Width based on viewport with max constraint
className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-sm"  // 1 slider
className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[calc(100vw-2rem)] max-w-md"  // 2 sliders
```

| Stage | Max Width |
|-------|-----------|
| Amplitude (1 slider) | `max-w-sm` (384px) |
| Frequency (2 sliders) | `max-w-md` (448px) |
| Challenge (2 sliders) | `max-w-md` (448px) |

---

### 4. Feedback Banner (FeedbackBanner.tsx)

Success/learning feedback shown after matching a parameter.

#### Desktop Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ That's it!                              [Why?] [Continue]│
└─────────────────────────────────────────────────────────────┘
```

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Icon />
    <span>That's it!</span>
  </div>
  <div className="flex items-center gap-3">
    <Button>Why?</Button>
    <Button>Continue</Button>
  </div>
</div>
```

#### Mobile Layout

```
┌────────────────────────┐
│  ✓ That's it!          │
│  [Why?]    [Continue]  │
└────────────────────────┘
```

```tsx
<div className="flex flex-col gap-3">
  <div className="flex items-center gap-2">
    <Icon />
    <span>That's it!</span>
  </div>
  <div className="flex gap-2">
    <Button className="flex-1">Why?</Button>
    <Button className="flex-1">Continue</Button>
  </div>
</div>
```

#### Responsive Implementation

```tsx
// Outer container
className="fixed bottom-0 left-0 right-0 bg-cyan-400/20 border-t-2 border-cyan-400 px-4 py-4 md:px-6"

// Inner layout
className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3"

// Button group
className="flex gap-2 md:gap-3"

// Buttons
className="flex-1 md:flex-none px-4 py-2 ..."
```

---

### 5. Formula Preview (FormulaPreview.tsx)

Shows the equation being built as user discovers parameters.

#### Desktop

Position: Top-right corner, absolute

```tsx
className="absolute top-8 right-4 z-10"
```

#### Mobile

Position: Top-center, smaller text

```tsx
className="absolute top-8 left-1/2 -translate-x-1/2 z-10 md:left-auto md:right-4 md:translate-x-0"
```

| Property | Desktop | Mobile |
|----------|---------|--------|
| Position | Top-right | Top-center |
| Label | "YOU'RE BUILDING" | "BUILDING" (shorter) |
| Font size | `text-base` | `text-sm` |
| Padding | `px-4 py-2` | `px-3 py-2` |

---

### 6. Celebration Modal (CelebrationModal.tsx)

Three-tab modal shown on challenge completion.

#### Container

```tsx
// Backdrop
className="fixed inset-0 z-50 flex items-center justify-center p-4"

// Modal
className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
```

#### Responsive Widths

| Viewport | Modal Width |
|----------|-------------|
| Mobile | `w-full` with `mx-4` (from parent padding) |
| Desktop | `max-w-lg` (512px) centered |

#### Tab Bar

```tsx
className="flex border-b border-zinc-800"

// Tab trigger
className="flex-1 py-4 md:py-4 text-xs md:text-sm font-medium ..."
```

| Property | Desktop | Mobile |
|----------|---------|--------|
| Tab padding | `py-4` | `py-3` |
| Tab font | `text-sm` | `text-xs` |
| Tab labels | Full ("Your Discovery") | Can abbreviate if needed |

#### Content Area

```tsx
className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0"
```

| Property | Desktop | Mobile |
|----------|---------|--------|
| Padding | `p-6` | `p-4` |
| Max height | `max-h-[60vh]` | `max-h-[50vh]` |
| Scroll | `overflow-y-auto` | `overflow-y-auto` |

#### Footer

```tsx
className="p-4 border-t border-zinc-800 shrink-0"
```

Footer should NOT scroll — it stays fixed at bottom of modal.

---

### 7. Visualization Scene (Scene.tsx)

The R3F canvas containing unit circle and wave.

#### Desktop Layout

Circle and wave side-by-side with connector:

```
┌────────────────────────────────────────────────┐
│                                                │
│    ○─────────────────────────────〰〰〰〰〰     │
│   Circle    Connector         Wave Graph       │
│                                                │
└────────────────────────────────────────────────┘
```

#### Mobile Layout

Stacked vertically:

```
┌────────────────────┐
│                    │
│         ○          │
│       Circle       │
│         │          │
│         │ Connector│
│         ↓          │
│    〰〰〰〰〰〰〰    │
│     Wave Graph     │
│                    │
└────────────────────┘
```

#### Bottom Padding

When floating controls or feedback banner are visible, add bottom padding to prevent overlap:

```tsx
// In Module.tsx
<div className={cn(
  "flex-1 min-h-0",
  (stage !== 'challenge' || (isParameterStage && subStage === 'feedback')) && "pb-32 md:pb-24"
)}>
  <Scene ... />
</div>
```

---

## Spacing Reference

### Padding Scale

| Token | Value | Usage |
|-------|-------|-------|
| `p-4` | 16px | Mobile container padding |
| `p-6` | 24px | Desktop container padding |
| `p-8` | 32px | Desktop generous spacing |

### Gap Scale

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Minimum gap (label/value) |
| `gap-3` | 12px | Button groups |
| `gap-4` | 16px | Mobile slider spacing |
| `gap-6` | 24px | Desktop medium spacing |
| `gap-8` | 32px | Desktop slider grid |

### Max Width Scale

| Token | Value | Usage |
|-------|-------|-------|
| `max-w-sm` | 384px | Single slider panel |
| `max-w-md` | 448px | Two slider panel |
| `max-w-lg` | 512px | Modal |
| `max-w-3xl` | 768px | Control panel inner content |
| `max-w-4xl` | 896px | Full-width container inner |

---

## Z-Index Layers

| Layer | Z-Index | Elements |
|-------|---------|----------|
| Base | `z-0` | Visualization canvas |
| UI | `z-10` | Formula preview, prompts, floating panels |
| Controls | `z-20` | Progress bar, control panels |
| Overlay | `z-50` | Modals, dialogs |

---

## Implementation Checklist

### ControlPanel.tsx
- [ ] Change grid classes to `grid-cols-1 md:grid-cols-{n}`
- [ ] Change padding to `px-4 py-4 md:px-8 md:py-6`
- [ ] Change gap to `gap-4 md:gap-8`

### ParameterSlider.tsx
- [ ] Add `gap-2` to label/value flex row
- [ ] Add `flex-shrink-0` to value span
- [ ] Add `truncate` to label (safety)
- [ ] Add `min-w-0` to container

### Module.tsx (AnimatedPanel widths)
- [ ] Amplitude: `w-[calc(100vw-2rem)] max-w-sm`
- [ ] Frequency: `w-[calc(100vw-2rem)] max-w-md`
- [ ] Challenge: `w-[calc(100vw-2rem)] max-w-md`
- [ ] Add bottom padding to visualization when controls floating

### FeedbackBanner.tsx
- [ ] Change layout to `flex-col md:flex-row`
- [ ] Add `flex-1 md:flex-none` to buttons
- [ ] Adjust padding for mobile

### FormulaPreview.tsx
- [ ] Add responsive positioning classes
- [ ] Reduce text size on mobile

### CelebrationModal.tsx
- [ ] Add `max-h-[90vh]` to modal container
- [ ] Add `flex flex-col` to modal container
- [ ] Add `flex-1 min-h-0 overflow-y-auto` to content
- [ ] Add `flex-shrink-0` to footer
- [ ] Reduce padding on mobile

---

## Testing Checklist

### Viewport Sizes to Test

| Device | Width | Height |
|--------|-------|--------|
| iPhone SE | 375px | 667px |
| iPhone 14 | 390px | 844px |
| iPhone 14 Pro Max | 430px | 932px |
| iPad Mini | 768px | 1024px |
| iPad Pro | 1024px | 1366px |
| Laptop | 1440px | 900px |
| Desktop | 1920px | 1080px |

### Things to Verify

- [ ] Slider labels never collide with values
- [ ] All sliders are usable (thumb reachable)
- [ ] Feedback banner doesn't cover visualization
- [ ] Modal is scrollable on short viewports
- [ ] Formula preview doesn't overlap prompt
- [ ] Control panel doesn't overflow viewport
- [ ] Touch targets are at least 44px

---

**End of Specification**