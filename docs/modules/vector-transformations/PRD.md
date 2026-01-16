# Vector Transformations Module
## Product Requirements Document (PRD)

**Version:** 1.0  
**Created:** January 2026  
**Status:** Ready for Implementation

---

## 1. One-Sentence Problem

**Math students struggle to understand what matrices "do" to vectors because traditional instruction presents abstract notation before geometric intuition, resulting in procedural computation without conceptual understanding.**

---

## 2. Demo Goal (What Success Looks Like)

### Success Criteria
- User can manipulate a 2×2 transformation matrix and immediately see how it affects vectors in real-time
- User discovers rotation, scaling, and reflection behaviors through experimentation before seeing the formal matrix notation
- User builds intuition that "matrix entries control geometric behavior" through direct manipulation

### The demo succeeds if
A first-time user can explain "what a matrix does" geometrically after 5 minutes of interaction, without needing to memorize formulas.

### Non-Goals (intentionally out of scope)
- Matrix multiplication mechanics
- Determinants or eigenvalues
- 3D transformations
- Composition of multiple transformations

---

## 3. Target User (Role-Based)

**Primary user:** High school or early college student encountering linear algebra concepts

**Skill level:**
- Comfortable with basic coordinate geometry (plotting points)
- Familiar with vector notation (arrows with x,y components)
- Little to no prior matrix experience

**Key constraint:** **Conceptual gap** — they've seen matrices as "arrays of numbers" but have no geometric intuition for what those numbers *do*

---

## 4. Core Use Case (Happy Path)

**Start condition:** User sees a grid with a single vector and a 2×2 matrix with default values (identity matrix)

**Flow:**

1. User sees vector (1, 0) pointing right on a coordinate grid
2. User adjusts matrix entry `a11` (top-left) using a slider
3. Vector stretches/compresses horizontally in real-time
4. User adjusts `a22` (bottom-right) and sees vertical scaling
5. User adjusts `a12` or `a21` (off-diagonal) and sees shearing/rotation effects
6. System highlights which entries caused which geometric changes
7. User matches a target transformed vector by adjusting matrix entries
8. Upon successful match, system reveals: "You just built a [rotation/scaling/reflection] matrix"

**End condition:** User has discovered the geometric meaning of at least one transformation type (rotation, scaling, or reflection) and can articulate what matrix entries control that behavior

---

## 5. Functional Decisions (What It Must Do)

| ID | Function | Notes |
|----|----------|-------|
| F1 | Real-time matrix-vector multiplication visualization | As user adjusts matrix, transformed vector updates immediately |
| F2 | Independent control of 4 matrix entries (a11, a12, a21, a22) | Sliders or direct input, range TBD but centered on [-2, 2] |
| F3 | Display both original (basis) and transformed vectors | Visual distinction (color, opacity, or style) |
| F4 | Show coordinate grid for spatial reference | Grid helps user see scaling/rotation |
| F5 | Target-matching challenge | Present a target transformed vector, user adjusts matrix to match |
| F6 | Discovery feedback | When user creates specific transformation types (90° rotation, reflection), system acknowledges it |
| F7 | Progressive parameter unlocking | Start with diagonal entries only (scaling), then introduce off-diagonal (shearing/rotation) |

---

## 6. UX Decisions (What the Experience Is Like)

### 6.1 Entry Point
- User lands on a screen showing a coordinate grid with one vector pointing right (the unit vector î)
- A matrix panel is visible with 4 entry controls
- Prompt: **"Change the matrix. Watch what happens to the vector."**

### 6.2 Inputs
- 4 numeric sliders (one per matrix entry)
- Range: -2 to 2 with step 0.1 (allows smooth exploration)
- Optional: Direct numeric input for precision

### 6.3 Outputs
- **Visual**: Transformed vector on grid
- **Contextual**: When user creates recognizable transformations (90° rotation, reflection across x-axis), a subtle badge appears: "You discovered: Reflection"
- **Formula reveal**: After successful target match, show the matrix in standard notation with entries labeled

### 6.4 Feedback & States

**Loading:** Not applicable (all computation is instant client-side)

**Exploration state:**
- Smooth vector animation as matrix changes
- Grid remains static for reference
- No "right/wrong" feedback during free exploration

**Challenge state (target matching):**
- Ghost target vector appears
- Proximity indicator: "Close..." → "Almost there..." → "Perfect match!"
- Match threshold: Within 5° of rotation and 10% of magnitude

**Success state:**
- Celebration pulse (reuse pattern from Sinewave)
- Matrix formula reveal with entry values highlighted
- "Try Another" button for new challenge

**Failure/Error:**
- No explicit failure state during exploration
- If user doesn't interact for 30 seconds, gentle nudge: "Try adjusting the top-left entry"

### 6.5 Errors (Minimum Viable Handling)

**Invalid input:**
- Sliders constrain to valid range (no text input errors)
- If direct numeric input is allowed, validate on blur and reset to last valid value

**System failure:**
- Transformation math is deterministic (no API calls), so failure mode is rendering error
- Catch with error boundary, show: "Visualization failed to load. Try refreshing."

**User does nothing:**
- After 30s idle, auto-animate one slider to show cause-effect
- After 60s, show tooltip: "Drag a slider to transform the vector"

---

## 7. Data & Logic (At a Glance)

### 7.1 Inputs
- **User**: 4 matrix entry values (a11, a12, a21, a22)
- **Static**: Grid configuration (axis range, tick marks)
- **Generated**: Target vectors for challenge mode (pre-computed set of interesting transformations)

### 7.2 Processing

**Flow:**
```
User adjusts matrix → Matrix-vector multiply (client-side) → Update transformed vector position → Render on canvas
```

**Challenge mode:**
```
Pick target transformation → Display target vector → User adjusts matrix → Calculate distance from target → Show proximity feedback → On match: reveal transformation type
```

**Key computations:**
- Matrix-vector multiplication: `[a11, a12; a21, a22] × [vx; vy] = [a11*vx + a12*vy; a21*vx + a22*vy]`
- Proximity check: Angle difference and magnitude difference from target
- Transformation classification: Detect rotation (determinant = 1, orthogonal), scaling (diagonal), reflection (determinant = -1)

### 7.3 Outputs
- **UI only**: All visualization happens in browser
- **Not persisted**: No saving of user progress (each session is fresh)
- **Optional logging**: Could track which transformations users discover first (analytics, not required for demo)

---

## Implementation Notes

### Technical Stack
- React Three Fiber for 3D visualization
- GSAP for smooth animations
- Client-side computation (no backend required)
- drei helpers for matrix utilities, camera, and grid

### Performance Requirements
- 60fps on mobile devices
- Instant feedback on slider changes (< 16ms response)
- Smooth animation interpolation (spring physics)

### Accessibility
- Keyboard navigation for all controls
- Screen reader support for state changes
- Respect prefers-reduced-motion
- Minimum 44×44px touch targets on mobile

---

## Success Metrics

### Quantitative
- 80%+ of users successfully match at least one challenge target
- Average time to first discovery: < 2 minutes
- Completion rate (exploration → challenge → reveal): > 60%

### Qualitative
- User can verbally explain what matrix entries do geometrically
- User recognizes transformation types visually (without calculation)
- User connects matrix notation to geometric meaning after reveal

---

## Pedagogical Sequence

### Stage 1: Free Exploration (Diagonal Only)
- User sees vector and two sliders (a11, a22)
- Discovers horizontal/vertical scaling
- Builds mental model: "These knobs control geometry"

### Stage 2: Off-Diagonal Unlock
- After 3+ diagonal adjustments, a12 and a21 sliders appear
- User discovers rotation/shearing effects
- Realizes entries interact (not independent)

### Stage 3: Challenge Mode
- "Try a Challenge" button appears after exploration
- User matches target by adjusting matrix
- Targets: 90° rotation, reflection, 2× scaling

### Stage 4: Formula Reveal
- After successful match, matrix notation appears
- Shows actual values user created
- Labels geometric meaning of each entry

---

## Core Design Principles

1. **Discovery before formula** — Users manipulate before seeing notation
2. **Real-time feedback** — Vector transforms instantly as matrix changes
3. **Progressive complexity** — Diagonal-only → all entries → challenges
4. **No wrong answers** — Exploration has no failure states
5. **Earned understanding** — Formula comes after geometric intuition

---

## What We're NOT Teaching

- Matrix multiplication mechanics (computational process)
- Determinants (calculation method)
- Eigenvalues/eigenvectors (advanced concepts)
- Transformation composition (chaining multiple transforms)
- 3D transformations (scope limitation)

**Why:** Depth over breadth. One concept (geometric transformation) deeply understood beats five concepts shallowly covered.
---

## Future Extensions (Not v1)

- **Module 2: Transformation Composition** — Chain transformations, build toward matrix multiplication
- **Module 3: Eigenvectors** — Find vectors that only scale
- **Integration: Phase Portraits** — Connect to differential equations

---

*This PRD establishes WHAT to build and WHY. For HOW (UX specifications and build-order prompts), see companion documents.*