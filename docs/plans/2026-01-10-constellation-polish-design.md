# Constellation Polish Design

**Date:** 2026-01-10
**Phase:** 2 of Portfolio Architecture
**Branch:** `feature/constellation-architecture`

## Overview

Polish the constellation hub with mathematical/geometric visual design. The constellation serves as the module picker, using a graph metaphor where nodes represent modules and edges show relationships.

This phase focuses on **node design** using layered concentric rings that communicate progress through fill level rather than color changes.

## Design Decisions

### Visual Aesthetic
- **Mathematical/diagrammatic** - geometric, precise, educational
- **Single-color progression** - cyan fills up rather than color switching
- **Restrained interactions** - subtle, controlled, not bouncy

### Animation Strategy
| Interaction | Tool | Rationale |
|-------------|------|-----------|
| Hover scale/glow | CSS transitions | GPU-accelerated, reliable for pointer states |
| Focus ring | CSS | Standard accessibility pattern |
| Recommended pulse | CSS keyframes | Continuous, simple |
| Progress arc fill | GSAP | Smooth arc drawing with timing control |
| Node entrance stagger | Motion | Orchestration of multiple elements |
| State change celebrations | GSAP | Timeline control for sequences |

## Layered Rings Node Design

### Core Structure

Three concentric SVG circles creating visual depth:

```
     ┌─────────────────┐
     │    ╭─────╮      │  ← Outer ring (48px, 2px stroke)
     │   ╭│     │╮     │
     │   ││  ●  ││     │  ← Inner circle (16px, solid fill)
     │   ╰│     │╯     │
     │    ╰─────╯      │  ← Middle ring (32px, progress arc)
     │                 │
     │   Trigonometry  │  ← Domain label
     │ Sinusoidal Waves│  ← Title
     └─────────────────┘
```

**Sizing (based on 48px outer ring):**
- Outer ring: 48px diameter, 2px stroke
- Middle ring: 32px diameter, 2px stroke (progress arc)
- Inner circle: 16px diameter, solid fill
- Gap between rings: 4px breathing room

**Why this works:**
- Outer ring = boundary/container (always visible)
- Middle ring = progress indicator (partial fill)
- Inner circle = core state (empty/partial/full)
- Nested circles suggest depth without 3D complexity

### States (Single-Color Fill Progression)

Uses existing design tokens from `src/lib/colors.ts`.

#### Not Started
```
Outer ring:  gray-600 (#4b5563) stroke, no fill
Middle ring: hidden (opacity 0)
Inner circle: gray-600 stroke only, transparent fill
Text: gray-400 domain, white title
```
Visual: Empty vessel, waiting.

#### In Progress
```
Outer ring:  cyan-400 (#22d3ee) stroke
Middle ring: cyan-400 arc showing % complete (strokeDasharray)
Inner circle: cyan-400/20 subtle glow fill
Text: gray-400 domain, white title
```
Visual: Filling up with cyan energy.

#### Completed
```
Outer ring:  cyan-400 stroke
Middle ring: cyan-400 full circle (100%)
Inner circle: cyan-400 solid fill
Text: gray-400 domain, cyan-400 title
```
Visual: Fully saturated, mastered.

#### Recommended (not-started + glow)
```
Outer ring:  cyan-400 stroke (not gray)
Inner circle: empty (stroke only)
Glow: box-shadow 0 0 20px rgba(34, 211, 238, 0.4)
Animation: ring-pulse 2s ease-in-out infinite
```
Visual: "This one's ready for you."

### Interactions

#### Hover (all statuses)
```css
transform: scale(1.08);
stroke-width: 2px → 3px;
box-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
transition: 150ms ease-out;
```

#### Active/Press
```css
transform: scale(0.98);
transition: 50ms ease-in;
```

#### Focus (keyboard)
```css
ring: 2px cyan-400 offset 4px;
/* Matches existing focus:ring-2 focus:ring-cyan-500/50 */
```

#### Recommended Pulse
```css
@keyframes ring-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.4); }
  50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
}
animation: ring-pulse 2s ease-in-out infinite;
```

### Typography

**Layout (vertical stack, centered):**
```
Ring cluster
   12px gap
Domain label
   4px gap
Title
```

**Domain Label:**
- Size: text-xs (12px)
- Color: text.secondary (#888888)
- Style: uppercase, tracking-wider

**Title:**
- Size: text-sm (14px)
- Weight: font-medium (500)
- Color:
  - not-started/in-progress: text.primary (#e0e0e0)
  - completed: accent.primary (#22d3ee)
- Max-width: 120px with text-overflow ellipsis

### SVG Implementation

```tsx
<svg viewBox="0 0 48 48" className="w-12 h-12">
  {/* Outer ring - always visible */}
  <circle
    cx="24" cy="24" r="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="text-gray-600 group-hover:text-cyan-400 transition-colors"
  />

  {/* Middle ring - progress arc */}
  <circle
    cx="24" cy="24" r="16"
    fill="none"
    stroke="#22d3ee"
    strokeWidth="2"
    strokeDasharray={`${progress * 100} 100`}
    strokeLinecap="round"
    transform="rotate(-90 24 24)"
    style={{ opacity: progress > 0 ? 1 : 0 }}
  />

  {/* Inner circle - core state */}
  <circle
    cx="24" cy="24" r="8"
    fill={status === 'completed' ? '#22d3ee' : 'transparent'}
    stroke="currentColor"
    strokeWidth="1.5"
    className="text-gray-600"
  />
</svg>
```

**Key techniques:**
- `strokeDasharray` for progress arcs
- `rotate(-90 24 24)` starts arc at 12 o'clock
- GSAP animates dasharray smoothly
- Scales perfectly at any size

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/constellation/ModuleNode.tsx` | Replace button with SVG ring component |
| `src/components/constellation/NodeRings.tsx` | New: SVG ring rendering component |
| `src/index.css` | Add ring-pulse keyframes |
| `src/types/portfolio.ts` | Add progress percentage to state if needed |

## Future Phases (Not This Document)

After nodes are complete:
1. **Connection lines** - constellation graph edges
2. **Entrance animations** - staggered node appearance
3. **Atmosphere** - background effects, subtle particles

## Success Criteria

- [ ] Nodes render with three concentric rings
- [ ] Progress arc animates smoothly via GSAP
- [ ] States visually distinct (empty → filling → full)
- [ ] Recommended module pulses gently
- [ ] Hover interactions feel precise and controlled
- [ ] Keyboard navigation works with visible focus
- [ ] Typography balanced with ring visuals
- [ ] No layout shift during state changes
