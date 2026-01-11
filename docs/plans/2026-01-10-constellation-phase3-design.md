# Constellation Polish Phase 3 Design

**Date:** 2026-01-10
**Phase:** 3 of Portfolio Architecture
**Branch:** `feature/constellation-architecture`

## Overview

Complete constellation polish with connection lines, entrance animations, and atmospheric depth. This phase finalizes the visual experience of the constellation hub.

## Design Decisions

### Visual Principles
- **Mathematical/diagrammatic** aesthetic (established in Phase 2)
- **Clean and focused** - avoid visual noise
- **Rings do status work** - supporting elements stay neutral

### Commit Strategy
- All changes implemented and tested
- Single commit at completion

---

## 1. Connection Lines

### Structure
- Single continuous vertical line connecting all nodes
- Line passes behind rings (z-index layering)
- Rings float on top as primary visual elements

### Styling
- Solid line, 1-2px stroke width
- Color: `gray-600` (#4b5563) - matches inactive ring state
- No state changes - always neutral infrastructure

### Rationale
- Solid lines (not dashed) read as "complete structure" not "loading"
- Lines behind rings creates depth hierarchy
- Neutral color keeps focus on the rings' status communication

### Implementation
- SVG `<line>` or `<path>` element
- Positioned behind nodes via render order or z-index
- Endpoints calculated from node positions

---

## 2. Entrance Animations

### Sequence
1. Lines fade in first (200ms, ease-out)
2. Nodes stagger in bottom-to-top (recommended module first)

### Node Animation
| Property | Start | End |
|----------|-------|-----|
| opacity | 0 | 1 |
| scale | 0.8 | 1 |

- Duration: 300ms per node
- Easing: ease-out
- Stagger: 100ms delay between nodes

### Timeline
```
0ms      - Lines start fading in
200ms    - Lines complete, Node 1 (Sinusoidal) starts
500ms    - Node 1 complete, Node 2 (Vector) starts
800ms    - Node 2 complete, Node 3 (Phase) starts
1100ms   - All animations complete
```

### Rationale
- Bottom-to-top reveals recommended module first
- "Structure assembles, then content populates" narrative
- Fade + scale gives "popping in" feel without being bouncy
- Total ~1 second - quick but noticeable polish

### Implementation
- Motion (framer-motion) for orchestration
- `staggerChildren` and `variants` pattern
- Applied to Constellation component on mount

---

## 3. Atmosphere (Vignette)

### Effect
- Subtle darkening at edges/corners of constellation view
- Center remains current background (`#0a0a0f`)
- Frames content without competing with ring glows

### Styling
```css
background: radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%);
```

### Subtlety Target
- Edge color ~5-10% darker than center
- Should be barely noticeable consciously
- If someone asks "is there a gradient?" - answer should be "maybe?"

### Rationale
- Vignette-only (not center-lighter or center-darker) is simplest
- Frames content without changing the node area
- Easy to adjust or remove if too heavy

### Implementation
- CSS radial gradient on Constellation container
- Or: pseudo-element overlay with vignette effect

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/constellation/ConnectionLines.tsx` | Replace dashed with solid line, ensure renders behind nodes |
| `src/components/constellation/Constellation.tsx` | Add Motion orchestration for entrance animations, add vignette background |
| `src/index.css` | (Optional) Add vignette utility class if needed |

---

## Success Criteria

- [ ] Connection line is solid gray, passes behind rings
- [ ] Lines fade in first on constellation mount
- [ ] Nodes stagger in bottom-to-top with fade + scale
- [ ] Subtle vignette visible at edges
- [ ] Total entrance animation ~1 second
- [ ] No performance impact on 60fps target
- [ ] Lint passes
- [ ] Build succeeds
