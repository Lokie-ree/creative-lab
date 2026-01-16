# Vector Transformations Module
## UX Specification

**Version:** 1.0  
**Created:** January 2026  
**Based on:** PRD v1.0  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Pass 1: Mental Model Alignment](#pass-1-mental-model-alignment)
2. [Pass 2: Information Architecture](#pass-2-information-architecture)
3. [Pass 3: Affordances & Action Clarity](#pass-3-affordances--action-clarity)
4. [Pass 4: Cognitive Load & Decision Minimization](#pass-4-cognitive-load--decision-minimization)
5. [Pass 5: State Design & Feedback](#pass-5-state-design--feedback)
6. [Pass 6: Flow Integrity Check](#pass-6-flow-integrity-check)
7. [Visual Specifications](#visual-specifications)

---

# Pass 1: Mental Model Alignment

## Primary User Intent

**"I want to understand what these matrix numbers actually *do* to the vector—not just calculate the output."**

## Likely Misconceptions

1. **"Matrices are just multiplication tables"**  
   Users may think matrix entries are arbitrary numbers to memorize rather than geometric controllers

2. **"I need to understand the formula before I can use this"**  
   Traditional math education creates expectation of formula-first learning

3. **"Each matrix entry works independently"**  
   Users may not realize that off-diagonal entries create coupled effects (rotation/shearing)

4. **"The original vector disappears when transformed"**  
   May not understand that transformation is a mapping, not a replacement

## UX Principle to Reinforce

**"Matrix entries are knobs that control geometry."**

The interface must make matrix entries feel like *controllers* (like amplitude/frequency sliders in Sinewave), not abstract inputs. The transformed vector must feel like the *consequence* of those settings, not a separate object.

## Correction Strategy

- **Show both original and transformed vectors simultaneously** (breaks "replacement" misconception)
- **Make matrix entries physically manipulable *before* showing notation** (breaks "formula-first" expectation)
- **Couple visual feedback tightly to individual entry changes** (reinforces "this knob controls this behavior")

---

# Pass 2: Information Architecture

## All User-Visible Concepts

1. **Original vector** (basis vector, what we're transforming)
2. **Transformed vector** (result after applying matrix)
3. **Matrix entries** (4 numbers: a11, a12, a21, a22)
4. **Coordinate grid** (spatial reference frame)
5. **Target vector** (in challenge mode)
6. **Transformation type** (rotation, scaling, reflection—discovered through interaction)
7. **Matrix notation** (formal representation, revealed after discovery)
8. **Proximity feedback** (how close to target during challenge)

## Grouped Structure

### Core Workspace (Always Visible)

**Coordinate grid:** Primary  
- Rationale: Users need consistent frame of reference to perceive geometric changes

**Original vector:** Primary  
- Rationale: Must be visible to understand what's being transformed

**Transformed vector:** Primary  
- Rationale: This is what users are watching change in real-time

### Control Panel (Always Visible)

**Matrix entries (4 sliders):** Primary  
- Rationale: These are the user's controls—they need constant access

**Transformation type label:** Secondary  
- Rationale: Feedback, not control—shows up contextually when user creates specific patterns

### Challenge Overlay (Mode-Specific)

**Target vector:** Primary (when in challenge mode)  
- Rationale: The goal users are trying to match

**Proximity feedback:** Secondary  
- Rationale: Helps users know they're getting closer without being too hand-holdy

### Reveal Layer (Progressive)

**Matrix notation:** Hidden (appears after match)  
- Rationale: Formula is the *label* for understanding, not the starting point

---

# Pass 3: Affordances & Action Clarity

## Affordance Mapping

| Action | Visual/Interaction Signal |
|--------|---------------------------|
| **Adjust matrix entry** | Slider with visible thumb, horizontal track, numeric value displayed adjacent |
| **See transformation in real-time** | Transformed vector animates smoothly as slider moves (not discrete jumps) |
| **Distinguish original from transformed** | Original vector: muted color (gray), Transformed vector: accent color (cyan), different stroke width |
| **Reset to identity matrix** | "Reset" button with icon (↺), positioned near matrix controls |
| **Enter challenge mode** | "Try a Challenge" button appears after 15-20 seconds of exploration |
| **Match target vector** | Target appears as ghost/outline style, proximity feedback text changes color as user gets closer |
| **View matrix notation** | Revealed in modal/panel after successful match—not clickable during exploration |

## Affordance Rules

### If user sees a slider...
They should assume: Dragging it will change something visible on screen immediately

### If user sees two vectors with different colors...
They should assume: One is input (original), one is output (transformed)

### If user sees a ghost vector...
They should assume: It's a target to match, not something they can directly manipulate

### If user sees smooth animation...
They should assume: Their adjustments are continuous, not discrete steps

---

# Pass 4: Cognitive Load & Decision Minimization

## Friction Points

| Moment | Type | Simplification |
|--------|------|----------------|
| **First load: "What do I do?"** | Uncertainty | Auto-highlight first slider with subtle pulse, prompt: "Drag this →" |
| **Four sliders visible at once** | Choice paralysis | Progressive unlock: Start with only diagonal entries (a11, a22) visible. Off-diagonal (a12, a21) unlock after user adjusts diagonal 3+ times |
| **Not sure if they're "doing it right"** | Uncertainty | No wrong answers during exploration. Remove concept of "correct" until challenge mode explicitly introduces a target |
| **Challenge target feels arbitrary** | Uncertainty | Target should be visually distinct transformation (90° rotation, x-axis reflection) so match feels earned, not random |
| **Waiting for system to respond** | Waiting | Transformation is instant (client-side math), but animation smoothness matters—use GSAP spring physics |
| **Too many transformation types to discover** | Choice/Overwhelm | Focus on 3 archetypes: Scaling (diagonal-only), Rotation (det=1, orthogonal), Reflection (det=-1). Don't try to teach shearing as distinct category in v1 |

## Defaults Introduced

### Identity matrix [1,0; 0,1]
Starting state—user sees no transformation initially, makes cause-effect obvious when they change entries

### Slider range [-2, 2]
Wide enough to see dramatic effects (2× scaling, negative flips) without overwhelming with huge numbers

### First challenge target: 90° rotation
Most visually striking, easiest to recognize success

### Grid extends to ±3 on both axes
Large enough to see transformed vectors clearly, small enough to avoid clutter

---

# Pass 5: State Design & Feedback

## Matrix Control Panel

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| **Initial** | 4 sliders (or 2 if progressive unlock), all at default values (identity) | "These controls change something" | Drag any slider |
| **Adjusting** | Slider thumb moves, numeric value updates, transformed vector animates | "My input directly causes that vector to move" | Continue adjusting, try other sliders |
| **Discovered transformation** | Badge appears: "You discovered: Scaling" (or Rotation/Reflection) | "I made something recognizable" | Keep exploring or acknowledge badge |

## Visualization Canvas

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| **Exploration mode** | Grid, original vector (gray), transformed vector (cyan) | "I'm freely experimenting" | Adjust matrix, watch results |
| **Challenge mode - before match** | Ghost target vector appears, proximity text: "Keep going..." | "I'm trying to match that target" | Adjust matrix toward target |
| **Challenge mode - close** | Proximity text: "Almost there!", target/transformed vectors nearly overlap | "I'm very close to matching" | Make fine adjustments |
| **Challenge mode - matched** | Celebration pulse, proximity text: "Perfect match!", reveal panel slides in | "I succeeded!" | View matrix notation, try another challenge, or return to exploration |

## Reveal Panel (Matrix Notation)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| **Hidden** | Not visible during exploration/challenge | "I'm focused on discovery" | N/A |
| **Revealed (post-match)** | Matrix notation with actual values filled in, transformation type labeled | "This is the formal name/notation for what I built" | Read notation, dismiss panel, try another |

---

# Pass 6: Flow Integrity Check

## Flow Risks

| Risk | Where | Mitigation |
|------|-------|------------|
| **User lands and doesn't touch anything** | Initial state | After 5 seconds idle, pulse first slider + tooltip: "Try dragging this" |
| **User adjusts one slider then stops** | Early exploration | After adjusting same slider 3× without trying others, highlight different slider: "Now try this one" |
| **User doesn't realize challenge mode exists** | Exploration mode after ~30 sec | "Try a Challenge" button fades in with subtle animation |
| **User gets frustrated matching target** | Challenge mode | If 10+ adjustments without getting close, offer "Show hint" that highlights which entry to focus on |
| **User matches target by accident, doesn't realize** | Challenge match threshold | Use tight threshold (within 5° rotation, 10% magnitude) to ensure intentional matches, not lucky accidents |
| **First-time user confused by matrix notation** | Reveal panel | Don't show raw matrix `[a, b; c, d]`—show with labels: "a₁₁ = 1.5 (horizontal stretch)" |

## Visibility Decisions

### Must be visible at all times

- Coordinate grid (spatial anchor)
- Original vector (the "before" reference)
- Transformed vector (the result they're manipulating)
- Matrix entry values (current state of controls)

### Can be implied/progressive

- Transformation type labels (only appear on discovery)
- Challenge target (only in challenge mode)
- Matrix notation (only after successful match)
- Hints/tooltips (only when user seems stuck)

## UX Constraints for Visual Phase

1. **Animation is non-negotiable**  
   Transformed vector must smoothly interpolate when matrix changes—discrete jumps break the cause-effect relationship

2. **Color distinction is critical**  
   Original and transformed vectors must be visually distinct enough for colorblind users (don't rely only on hue)

3. **Slider precision matters**  
   Range and step size must allow both coarse exploration and fine-tuning for challenge matches

4. **Grid must stay static**  
   Only vectors move—grid provides stable reference frame

---

# Visual Specifications

## Design Tokens

### Colors (from lab color system)
```
--lab-accent: #22d3ee           // Transformed vector, active states
--lab-accent-muted: #888888     // Original vector, ghost elements
--lab-border: rgba(136,136,136,0.2)  // Grid lines
--lab-text-dim: rgba(255,255,255,0.4)  // Axis labels
--lab-bg: #0a0a0f               // Canvas background
--lab-surface: rgba(255,255,255,0.05)  // Control panel background
```

### Typography
```
Labels: 10px monospace
Slider values: 14px monospace
Proximity feedback: 16px sans-serif
```

### Spacing
```
Control panel padding: 16px
Slider spacing: 12px vertical
Canvas margin: 24px
```

## Component Specifications

### Canvas Layout
- Default: 600×600px (square for symmetry)
- Responsive: Scale to fit mobile (min 320px)
- Coordinate system: -3 to +3 on both axes

### Vector Arrows
- Original: 2px stroke, gray, 0.6 opacity
- Transformed: 3px stroke, cyan, 1.0 opacity
- Target (ghost): 3px dashed stroke, cyan, 0.5 opacity
- Arrowhead: 0.15 units triangle

### Matrix Sliders
- Track: 200px width (desktop), 100% (mobile)
- Height: 6px
- Thumb: 20px diameter circle
- Touch target: 44×44px minimum
- Range: -2 to 2, step 0.1

### Grid
- Major gridlines every 1 unit
- Axis lines: 1.5px thick
- Grid lines: 0.5px thick with reduced opacity
- Origin marker: 4px circle

## Animation Specifications

### Vector Transformation
- Duration: 0.4s
- Easing: power2.out (GSAP)
- Properties: position, rotation
- FPS target: 60fps

### Progressive Unlock
- Off-diagonal sliders fade in
- Duration: 0.3s
- Easing: ease-in-out
- Accompanies subtle pulse effect

### Celebration Pulse
- Radial gradient from center
- Scale: 0.5 → 3
- Duration: 0.8s
- Color: cyan with 40% opacity

### Discovery Badge
- Fade in: 0.2s
- Display: 3s
- Fade out: 0.3s
- Position: top-right of canvas

## Responsive Breakpoints

### Desktop (>768px)
- Canvas: 600×600px
- Control panel: Right side
- Layout: Side-by-side

### Tablet (480-768px)
- Canvas: 500×500px
- Control panel: Below canvas
- Layout: Stacked

### Mobile (<480px)
- Canvas: 90vw × 90vw
- Control panel: Below canvas
- Sliders: Full width
- Touch targets: Minimum 44×44px

## Accessibility Requirements

### Keyboard Navigation
- Tab order: Canvas → Sliders → Buttons
- Arrow keys: Adjust focused slider (±0.1)
- Enter: Activate buttons
- Escape: Dismiss reveal panel

### Screen Reader Support
```
Canvas: aria-label="Coordinate grid showing vector transformation"
Sliders: aria-label="Matrix entry a11, current value 1.0"
Proximity: aria-live="polite"
Badges: role="status"
```

### Color Contrast
- All text meets WCAG AA (4.5:1)
- Vector distinction uses stroke width + color
- High-contrast mode support

### Motion Preferences
- Respect prefers-reduced-motion
- Disable animations, use instant transitions
- Maintain functionality without animation

---

## Summary of UX Foundations

### Mental Model We're Building
"Matrices are geometric controllers. Each entry is a knob that changes how space transforms."

### Information Architecture
Core workspace (grid + vectors) + Control panel (matrix sliders) + Progressive reveals (challenge mode, notation)

### Affordances
Sliders = immediate visual control, Ghost vector = matching target, Smooth animation = continuous transformation

### Cognitive Load Strategy
Start simple (diagonal-only), progressive unlock (off-diagonal), defaults that make sense (identity matrix), no wrong answers in exploration

### State Coverage
Every UI element has defined states for: initial, adjusting, discovered, matched, revealed

### Flow Integrity
Guardrails against idle confusion, stuck moments, and accidental success

---

*This UX specification provides the HOW (user experience design) based on the WHAT (PRD requirements). For detailed implementation steps, see Build-Order Prompts document.*