# Product Requirements Document: Slope - The Rate You Can See

## 1. One-Sentence Problem

Grade 8 students struggle to understand slope as a meaningful relationship because they memorize the formula (y₂-y₁)/(x₂-x₁) without building visual intuition, resulting in an inability to estimate slope, explain what it means in context, or recognize that slope is constant between any two points on a line.

---

## 2. Demo Goal (What Success Looks Like)

**Success:** A student can look at any line and estimate its slope, explain what the slope means in context, and recognize that slope is constant between ANY two points on a line. The demo clearly communicates that slope is a **rate of change**—not a formula to memorize, but a relationship they can see, measure, and predict.

**Non-Goals:**
- Perpendicular slopes (product = -1)
- Slope fields or calculus previews
- Production-grade assessment tracking
- Multi-user collaboration features

---

## 3. Target User (Role-Based)

**Role:** Grade 8 student learning linear relationships (8.EE.B.5, 8.EE.B.6)

**Skill Level:** 
- Prerequisite: Can plot points on coordinate plane, understands proportional relationships (7.RP.A)
- Current: Learning to graph proportional relationships and interpret unit rate as slope

**Key Constraint:** 10-15 minute attention span; needs immediate visual feedback to build intuition before abstract formulas

---

## 4. Core Use Case (Happy Path)

**Start Condition:** User sees four lines with different slopes displayed without gridlines or coordinates.

**Flow (Observe → Manipulate → Discover → Celebrate):**

1. **Observe:** User sees four lines of varying steepness. Prompt: "Rank these from least steep to most steep" (no formulas, just intuition).

2. **Manipulate:** User drags lines to rank them. System provides immediate feedback on ranking. Reveal: "You just compared slopes. Let's understand what makes one steeper than another."

3. **Discover:** 
   - User sees a single line through origin with two draggable points and a slope triangle connecting them
   - User drags points along the line, watching the slope triangle update in real-time
   - Rise and run values display on triangle legs; ratio (rise/run) shown prominently
   - **Key discovery moment:** Moving points closer/farther shows different triangle sizes but the SAME ratio
   - Challenge: "Find three DIFFERENT slope triangles that all show slope = 2"

4. **Celebrate:** 
   - System reveals why slope is constant (similar triangles proof)
   - User sees two slope triangles on the same line, notices equal angles
   - Scaffolded reveal: "These are similar triangles → same ratios"
   - Final formula (y₂-y₁)/(x₂-x₁) appears LAST as a summary of what they already discovered

**End Condition:** User understands slope as a rate of change, can estimate it visually, and recognizes the formula as a notation for the relationship they've been exploring.

---

## 5. Functional Decisions (What It Must Do)

| ID | Function | Notes |
|----|----------|-------|
| F1 | Display lines on coordinate grid | Configurable range (-10 to 10), origin clearly marked |
| F2 | Enable drag-to-rank interface | For initial steepness comparison (Stage 1) |
| F3 | Render draggable points constrained to line | Points snap to line when dragged |
| F4 | Calculate and display slope triangle | Right-angle triangle showing rise/run with labeled legs |
| F5 | Update slope calculation in real-time | As points move, triangle and ratio update instantly |
| F6 | Display two slope triangles simultaneously | For similar triangles proof (Stage 3) |
| F7 | Show angle measurements | Both triangles display same angles to prove similarity |
| F8 | Adjustable slope slider | Range -3 to 3, line rotates around origin |
| F9 | Adjustable y-intercept slider | Shifts line up/down, slope remains constant |
| F10 | Display equation in real-time | y = mx or y = mx + b with live coefficient values |
| F11 | Provide contextual graph example | Real-world scenario (e.g., time vs. distance) with units |
| F12 | Validate user challenges | Check slope estimates, equation matches, triangle selections |

---

## 6. UX Decisions (What the Experience Is Like)

### 6.1 Entry Point

User starts by seeing four lines of different slopes displayed without gridlines or coordinates. Simple, visual-first hook: "Rank these from least steep to most steep." No formulas, no numbers—just intuition.

### 6.2 Inputs

- **Drag interactions:** Rank lines, move points along lines, position slope triangles
- **Slider controls:** Adjust slope (-3 to 3) and y-intercept values
- **Challenge responses:** Text input or multiple choice for explanations and equation matching

### 6.3 Outputs

- **Visual feedback:** Real-time slope triangle updates, line rotations, equation displays
- **Numerical displays:** Rise/run values, slope ratio, equation coefficients
- **Discovery reveals:** Scaffolded explanations (angles → similar triangles → constant ratios)
- **Celebration:** Formula reveal as earned understanding, not initial instruction

### 6.4 Feedback & States

- **Loading:** Smooth transitions between stages (500ms easeOutQuart)
- **Success:** Immediate visual confirmation when challenges are correct (e.g., "You found three different triangles with slope = 2!")
- **Partial results:** Real-time updates as user manipulates points (triangle morphs, values update)
- **Discovery moments:** Highlighted when user notices constant ratio despite different triangle sizes

### 6.5 Errors (Minimum Viable Handling)

- **Invalid input:** If user tries to drag point off line, snap it back to nearest valid position
- **System failure:** Graceful degradation—if animation fails, show static state with values
- **User does nothing:** After 30 seconds of inactivity, show subtle hint: "Try moving the points to see what changes"

---

## 7. Data & Logic (At a Glance)

### 7.1 Inputs

- **User:** Drag positions, slider values, challenge responses
- **Static/Mocked:** Initial line configurations, challenge problems, contextual scenarios (time/distance example)
- **Generated:** Slope calculations derived from point positions, triangle geometry computed from line equations

### 7.2 Processing

**Core Logic Flow:**
- Point positions → Calculate line equation → Compute slope → Render triangle geometry
- User drags point → Constrain to line → Update triangle → Recalculate rise/run → Display ratio
- Slider changes → Update line equation → Recalculate all dependent visuals → Animate transition
- Two triangles on same line → Calculate angles → Compare ratios → Prove similarity → Reveal constant slope

**Mathematical Operations:**
- `slope = (y₂ - y₁) / (x₂ - x₁)` (calculated from points)
- `y = mx + b` (line equation from slope/intercept)
- `pointOnLine = (x, slope * x + intercept)` (constrain dragging)
- Angle calculations for similar triangles proof

### 7.3 Outputs

- **UI only:** All visualizations rendered with React Three Fiber (coordinate grid, lines, triangles, labels)
- **Temporarily stored:** Current stage state, user's challenge attempts, discovery progress (client-side React state, no persistence)
- **Logged (optional):** Time per stage, prediction accuracy, retry patterns for analytics (if enabled)

**Technical Context:**
- All computation is client-side (no API calls)
- State managed via React hooks + stage machine pattern
- Visualizations rendered with React Three Fiber
- Animations handled by GSAP (triangle morph: 300ms, line rotation: 400ms spring, point snap: 200ms)

---

## Assumptions

- **Tech stack:** React 19 + TypeScript, React Three Fiber, GSAP, Tailwind CSS
- **Pedagogical pattern:** Observe → Manipulate → Discover → Celebrate (stage-based flow)
- **Standards alignment:** 8.EE.B.5 (graph proportional relationships, interpret unit rate as slope), 8.EE.B.6 (use similar triangles to explain why slope is constant)
- **Duration:** 10-15 minutes total module experience
- **Formula placement:** The formula (y₂-y₁)/(x₂-x₁) appears LAST (Stage 8) after conceptual understanding is built
