# UX Specification: Slope - The Rate You Can See

## Pass 1: Mental Model

**Primary user intent:** Understand slope as a visual, measurable relationship (rate of change) that can be seen and estimated, not just a formula to memorize.

**Likely misconceptions:**
- Slope is just the formula (y₂-y₁)/(x₂-x₁) to memorize and apply
- Slope changes when you pick different points on the same line
- Steepness is subjective or relative (can't be measured precisely)
- The formula is the starting point for understanding slope
- Slope triangles are just a drawing tool, not a proof that slope is constant

**UX principle to reinforce/correct:** 
- **Visual-first, formula-last:** Slope exists as a relationship before the formula. The formula is notation for what they've already discovered.
- **Constancy through interaction:** Moving points along a line reveals that different triangle sizes produce the same ratio—this is the core discovery, not a side effect.
- **Rate of change as meaning:** Slope represents "how much y changes for each unit of x"—this contextual meaning must be built before abstract notation.

---

## Pass 2: Information Architecture

**All user-visible concepts:**
- Lines (on coordinate plane)
- Coordinate grid (with axes, origin, scale)
- Points (draggable markers on lines)
- Slope triangles (right-angle triangles showing rise/run)
- Rise value (vertical leg of triangle, labeled)
- Run value (horizontal leg of triangle, labeled)
- Slope ratio (rise/run, displayed as fraction or decimal)
- Angle measurements (for similar triangles proof)
- Line equation (y = mx or y = mx + b)
- Slope slider (controls line steepness)
- Y-intercept slider (controls vertical position)
- Ranking interface (drag-to-order lines by steepness)
- Challenge prompts (instructions and questions)
- Feedback messages (success, hints, explanations)
- Contextual graph example (real-world scenario with units)

**Grouped structure:**

### Visual Elements (Canvas)
- **Lines:** Primary (always visible when relevant to stage)
- **Coordinate grid:** Secondary (revealed progressively, hidden in initial Observe stage)
- **Points:** Primary (visible in Manipulate and Discover stages)
- **Slope triangles:** Primary (core discovery mechanism in Discover stage)
- **Angle measurements:** Hidden → Secondary (revealed in Celebrate stage for proof)
- **Rationale:** Visual elements are the primary learning medium; grid and angles are scaffolding that appears when needed.

### Numerical Displays
- **Rise value:** Primary (always visible when triangle is shown)
- **Run value:** Primary (always visible when triangle is shown)
- **Slope ratio:** Primary (prominently displayed, updates in real-time)
- **Line equation:** Secondary (appears after slope understanding is built)
- **Angle measurements:** Hidden → Secondary (Celebrate stage only)
- **Rationale:** Rise/run/ratio are the core measurements; equation is notation that comes later.

### Controls
- **Ranking interface (drag lines):** Primary (Observe → Manipulate transition)
- **Draggable points:** Primary (Discover stage core interaction)
- **Slope slider:** Secondary (advanced manipulation, appears after discovery)
- **Y-intercept slider:** Secondary (advanced manipulation, appears after discovery)
- **Rationale:** Core interactions (ranking, dragging points) are primary; sliders are refinement tools.

### Feedback & Guidance
- **Challenge prompts:** Primary (drives each stage's goal)
- **Feedback messages:** Primary (confirms understanding, provides hints)
- **Discovery reveals:** Primary (scaffolded explanations at key moments)
- **Contextual graph example:** Secondary (real-world connection, appears after core understanding)
- **Rationale:** Prompts and feedback guide the learning journey; contextual examples reinforce meaning.

### Stage-Based Visibility Mapping

**Observe Stage:**
- Visible: Lines (4 lines, no grid, no coordinates)
- Hidden: All numerical displays, triangles, points, controls, grid

**Manipulate Stage:**
- Visible: Lines (now draggable for ranking), ranking feedback
- Hidden: Grid, triangles, points, sliders, equations

**Discover Stage:**
- Visible: Single line, two draggable points, slope triangle, rise/run/ratio displays, grid (revealed)
- Hidden: Equation, angle measurements, sliders (initially), second triangle

**Celebrate Stage:**
- Visible: Two slope triangles on same line, angle measurements, ratio comparisons, formula reveal, equation
- Hidden: Ranking interface, initial challenge prompts

---

## Pass 3: Affordances

| Action | Visual/Interaction Signal |
|--------|---------------------------|
| Drag line to rank | Line appears draggable (cursor changes on hover, visual feedback on drag start) |
| Drag point along line | Point appears draggable (cursor: grab/grabbing, point highlights on hover, constrained movement shows it's "attached" to line) |
| Adjust slope slider | Slider handle is obviously draggable (standard slider affordance), line rotates in real-time as feedback |
| Adjust y-intercept slider | Slider handle is obviously draggable, line shifts vertically in real-time |
| View slope ratio | Ratio display is read-only (no interaction, updates automatically, positioned near triangle) |
| View equation | Equation display is read-only (updates automatically, positioned separately from interactive elements) |
| Read challenge prompt | Text is static instruction (no interaction, clear typography hierarchy) |
| See feedback message | Message appears as overlay/notification (temporary, non-interactive, dismisses automatically or with action) |
| Compare triangles | Two triangles visible simultaneously (visual grouping, same line context makes comparison obvious) |

**Affordance rules:**
- If user sees a point on a line, they should assume it's draggable along that line (constrained movement signals attachment)
- If user sees a line in ranking stage, they should assume it can be dragged to reorder (visual feedback on hover/drag)
- If user sees numerical values updating in real-time, they should understand these are calculated outputs (read-only, reactive)
- If user sees a slider, they should assume it controls the visible line's properties (immediate visual feedback confirms)
- If user sees a triangle with labeled legs, they should understand it represents a measurement (not draggable, read-only display)
- If user sees two triangles on the same line, they should understand they're meant to be compared (visual grouping, same context)

---

## Pass 4: Cognitive Load

**Friction points:**

| Moment | Type | Simplification |
|--------|------|----------------|
| Initial entry: "What am I supposed to do?" | Uncertainty | Start with single, clear prompt: "Rank these from least steep to most steep" (no grid, no numbers, just visual comparison) |
| Ranking: "Which line is steeper?" | Choice | Provide only 4 lines (manageable comparison set), allow drag-to-rank (reduces decision to ordering, not absolute judgment) |
| Transition to triangle: "What is this triangle?" | Uncertainty | Reveal triangle gradually: first show line with points, then connect with triangle, then label legs (progressive disclosure) |
| Dragging points: "Where should I drag?" | Choice | Provide default point positions (one near origin, one further out), make constraint obvious (point snaps to line) |
| Noticing constant ratio: "Why is the ratio the same?" | Uncertainty | Highlight ratio prominently, use challenge: "Find three DIFFERENT triangles with slope = 2" (forces discovery through action) |
| Understanding similar triangles: "Why are angles the same?" | Uncertainty | Scaffold reveal: show angles first, then connect to similarity, then to constant ratio (step-by-step explanation) |
| Formula appearance: "Is this what I was supposed to learn?" | Uncertainty | Position formula LAST, frame as "notation for what you discovered" (not new information, just summary) |
| Slider introduction: "What do these control?" | Choice | Introduce sliders after core understanding, with immediate visual feedback (line changes as slider moves) |
| Inactivity: "Am I stuck?" | Uncertainty | After 30 seconds, show subtle hint: "Try moving the points to see what changes" (non-intrusive nudge) |

**Defaults introduced:**
- **Default point positions:** One point near origin (0,0), one point at (2, 4) for slope = 2 line (creates clear, readable triangle)
- **Default line slopes:** Initial four lines have slopes: -2, 0.5, 1, 2 (covers negative, shallow positive, moderate, steep positive)
- **Default grid visibility:** Hidden initially (reduces visual clutter), revealed when needed for measurement context
- **Default triangle orientation:** Right-angle triangle with horizontal run leg, vertical rise leg (standard convention, reduces confusion)
- **Default challenge target:** "Find three triangles with slope = 2" (specific, achievable, forces exploration)
- **Default slider ranges:** Slope: -3 to 3 (covers common educational range), Y-intercept: -5 to 5 (keeps line visible on standard grid)

---

## Pass 5: State Design

### Canvas/Visualization Area

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | Blank canvas or loading indicator | System is initializing | Wait for content to appear |
| Loading | Smooth transition animation (lines fade in, 500ms) | Content is being prepared | Wait for transition to complete |
| Success | Four lines displayed, no grid, prompt visible | Ready to compare steepness | Drag lines to rank them |
| Partial | Lines visible, user is dragging one line | Ranking in progress | Continue dragging, release to confirm position |
| Error | Line snaps back to original position (if drag invalid) | Action was not allowed | Try different action |

### Draggable Points

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | Points not yet visible | Stage hasn't reached point interaction | Wait for Discover stage |
| Loading | Points fade in with triangle connection | Points are being added | Wait for animation |
| Success | Two points on line, clearly draggable (hover effect) | Points can be moved along line | Drag points to explore |
| Partial | Point is being dragged, triangle updates in real-time | Movement is constrained to line | Continue dragging, release when satisfied |
| Error | Point snaps back to nearest valid position on line | Point cannot leave the line | Drag along line only |

### Slope Triangle

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | No triangle visible | Triangle not yet relevant | Wait for Discover stage |
| Loading | Triangle morphs smoothly (300ms) as points move | Triangle is recalculating | Wait for update |
| Success | Triangle with labeled rise/run legs, ratio displayed | Triangle represents slope measurement | Observe or drag points to change it |
| Partial | Triangle is updating in real-time as points move | Current measurement is changing | Continue exploring or pause to read values |
| Error | Triangle disappears or shows "undefined" (if points overlap) | Invalid configuration | Move points to different positions |

### Ratio Display (Rise/Run)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | No ratio shown | Ratio not yet calculated | Wait for triangle to appear |
| Loading | Ratio value is updating/changing | Calculation in progress | Wait for stable value |
| Success | Clear ratio display (e.g., "2/1 = 2" or "slope = 2") | This is the slope value | Observe, compare with other triangles |
| Partial | Ratio updating in real-time | Current value is changing | Continue manipulating or pause to read |
| Error | "undefined" or "0/0" displayed | Invalid calculation | Adjust point positions |

### Challenge Prompts

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | No prompt visible | Stage transition in progress | Wait for prompt |
| Loading | Prompt text fading in | Instruction is appearing | Wait for full text |
| Success | Clear instruction text (e.g., "Rank these from least steep to most steep") | This is what I should do | Follow the instruction |
| Partial | Prompt visible, user is interacting | Instruction is in progress | Continue following instruction |
| Error | N/A (prompts don't have error state) | N/A | N/A |

### Feedback Messages

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | No feedback visible | No feedback needed | Continue interacting |
| Loading | Feedback message appearing | System is responding | Wait for message |
| Success | Positive confirmation (e.g., "You found three triangles with slope = 2!") | Action was correct | Continue to next stage |
| Partial | Hint or partial feedback (e.g., "Try moving the points closer together") | Guidance is available | Follow the hint |
| Error | Correction or explanation (e.g., "These triangles have different slopes") | Action needs adjustment | Try different approach |

### Sliders (Slope & Y-Intercept)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | Sliders not visible | Sliders not yet available | Wait for advanced stage |
| Loading | Sliders fading in | Controls are being added | Wait for appearance |
| Success | Sliders visible with current values, line responds to changes | These control the line | Drag sliders to adjust |
| Partial | Slider is being dragged, line updating in real-time | Adjustment is in progress | Continue dragging or release |
| Error | Slider snaps to valid range if dragged beyond limits | Value must stay in range | Drag within allowed range |

### Equation Display

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | No equation shown | Equation not yet relevant | Wait for Celebrate stage |
| Loading | Equation fading in | Formula is being revealed | Wait for full display |
| Success | Equation visible (e.g., "y = 2x" or "y = 2x + 1") with live coefficient values | This is the line's equation | Observe, connect to visual |
| Partial | Equation updating as sliders change | Current equation is changing | Continue adjusting or pause to read |
| Error | N/A (equation always calculable) | N/A | N/A |

### Two Triangles (Similar Triangles Proof)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | Only one triangle visible | Second triangle not yet shown | Wait for Celebrate stage |
| Loading | Second triangle fading in with angle measurements | Proof is being revealed | Wait for full display |
| Success | Two triangles on same line, angles labeled, ratios shown | These prove slope is constant | Observe the similarity |
| Partial | Angles/ratios updating if points move | Comparison is changing | Continue exploring or observe fixed state |
| Error | N/A (proof is always valid for same line) | N/A | N/A |

---

## Pass 6: Flow Integrity

**Flow risks:**

| Risk | Where | Mitigation |
|------|-------|------------|
| User doesn't understand "steepness" ranking | Observe stage entry | Use visual-only prompt (no numbers), allow drag-to-rank (reduces cognitive load), provide immediate feedback on ranking |
| User doesn't know lines are draggable | Observe → Manipulate transition | Show drag cursor on hover, provide visual feedback on drag start, reveal instruction: "Drag to rank" |
| User doesn't notice triangle relationship to slope | Discover stage entry | Progressive reveal: show points first, then connect with triangle, then label legs, then show ratio (step-by-step) |
| User doesn't realize ratio stays constant | Discover stage (dragging points) | Challenge forces discovery: "Find three DIFFERENT triangles with slope = 2" (must notice constancy to succeed) |
| User doesn't understand why ratio is constant | Discover → Celebrate transition | Scaffold explanation: show angles first, then connect to similarity, then to constant ratio (logical progression) |
| User thinks formula is the goal | Celebrate stage (formula reveal) | Position formula LAST, frame as "notation for what you discovered" (not new information, earned understanding) |
| User gets stuck not knowing what to do | Any stage after 30s inactivity | Show subtle hint: "Try moving the points to see what changes" (non-intrusive, contextual) |
| User tries to drag point off line | Discover stage (point dragging) | Constrain movement to line (snap to line), provide visual feedback (point follows line), snap back if somehow released off-line |
| User doesn't understand slider connection to line | Advanced stage (slider introduction) | Immediate visual feedback (line changes as slider moves), show equation updating simultaneously |
| User loses context between stages | Stage transitions | Smooth transitions (500ms), maintain visual continuity (line persists), clear stage indicators if needed |

**Visibility decisions:**

- **Must be visible:**
  - Current challenge prompt (user needs to know the goal)
  - Active interactive elements (draggable lines, points, sliders)
  - Slope triangle when in Discover/Celebrate stages (core learning tool)
  - Rise/run/ratio values when triangle is visible (core measurement)
  - Feedback messages for correct actions (confirmation of understanding)
  - Line equation in Celebrate stage (connects visual to notation)

- **Can be implied:**
  - Grid coordinates (can be revealed on demand or in later stages)
  - Angle measurements (can appear only when needed for proof)
  - Second triangle (can appear only in Celebrate stage)
  - Sliders (can appear only after core understanding is built)
  - Contextual graph example (can be optional reinforcement)

**UX constraints:**
- **Formula must appear LAST:** After all visual discovery is complete, as earned understanding, not initial instruction
- **No numbers in Observe stage:** Pure visual comparison to build intuition before measurement
- **Progressive disclosure:** Grid, angles, second triangle, sliders, equation all appear when needed, not all at once
- **Real-time feedback required:** All interactions (dragging, sliding) must provide immediate visual/numerical updates (no delay)
- **Constraint visibility:** When points are dragged, the line constraint must be visually obvious (point follows line, cannot leave)
- **Challenge-driven discovery:** Key insights (constant ratio, similar triangles) must be discovered through challenges, not just explained
- **10-15 minute duration:** Flow must be completable in this timeframe, so stages cannot be overly complex or lengthy

---

## Visual Specifications

### Canvas/Visualization Layout (React Three Fiber Scene Structure)

**Scene hierarchy:**
```
Scene
├── Coordinate Grid (Group)
│   ├── Axes (Lines)
│   ├── Grid Lines (optional, revealed progressively)
│   └── Origin Marker
├── Lines (Group)
│   └── Line Meshes (one per line, different slopes)
├── Points (Group)
│   └── Point Meshes (draggable, constrained to line)
├── Slope Triangles (Group)
│   ├── Triangle Geometry (right-angle triangles)
│   ├── Rise Label (Text)
│   ├── Run Label (Text)
│   └── Ratio Display (Text, prominent)
├── Angle Measurements (Group, Celebrate stage only)
│   └── Angle Arcs with Labels
└── Equation Display (Text, positioned above/below canvas)
```

**Coordinate system:**
- Range: -10 to 10 on both axes (configurable)
- Origin: (0, 0) at canvas center
- Scale: Responsive to viewport, maintains aspect ratio

**Stage-based visibility:**
- **Observe:** Lines only (4 lines, no grid, no coordinates)
- **Manipulate:** Lines (draggable), ranking feedback
- **Discover:** Single line, grid revealed, points, triangle, labels
- **Celebrate:** Single line, two triangles, angles, equation, formula

### Component Specifications (Stage-Based UI Elements)

**Stage Machine Configuration:**
- **Stage 1 (Observe):** Four lines displayed, prompt: "Rank these from least steep to most steep"
- **Stage 2 (Manipulate):** Lines become draggable, ranking feedback provided
- **Stage 3 (Discover):** Single line with two points, triangle appears, ratio displayed, challenge: "Find three different triangles with slope = 2"
- **Stage 4 (Celebrate):** Two triangles shown, angles revealed, similar triangles explanation, formula appears last

**UI Panel Components:**
- **Challenge Prompt Panel:** Top or side panel, clear typography, non-intrusive
- **Feedback Banner:** Overlay notification, auto-dismisses after 3 seconds or on user action
- **Control Panel:** Bottom or side panel, contains sliders (when visible), equation display
- **Ratio Display:** Prominent, near triangle, updates in real-time, format: "2/1 = 2" or "slope = 2"

**Progressive Reveal Pattern:**
- Elements fade in with 500ms easeOutQuart transitions
- Triangle morphs with 300ms animation when points move
- Line rotation uses 400ms spring animation for slider changes
- Point snap uses 200ms animation when constrained

### Design System

**Color System (Lab-based, consistent with portfolio):**
- **Primary lines:** Distinct colors for each of 4 initial lines (high contrast, accessible)
- **Active line:** Highlighted when selected (brighter, thicker stroke)
- **Points:** Accent color, clearly visible, hover state (slightly larger, glow effect)
- **Triangle:** Semi-transparent fill, solid stroke, labeled legs
- **Grid:** Subtle gray, low opacity (doesn't compete with content)
- **Text/Labels:** High contrast, readable, consistent with portfolio typography
- **Feedback:** Success (green accent), Hint (blue accent), Error (red accent, minimal use)

**Typography:**
- **Challenge prompts:** Larger, bold, clear hierarchy
- **Ratio display:** Prominent, larger than other numerical displays
- **Labels (rise/run):** Medium size, readable
- **Equation:** Medium size, positioned clearly
- **Feedback messages:** Standard size, clear but not overwhelming

**Spacing:**
- **Canvas padding:** Adequate space around visualization (prevents edge clipping)
- **Panel spacing:** Consistent margins, doesn't obstruct canvas
- **Label positioning:** Close to relevant elements (triangle legs, points), doesn't overlap
- **Feedback positioning:** Overlay, doesn't block interactive elements

### Interaction Specifications

**Drag Interactions:**
- **Line ranking:** Drag anywhere on line, visual feedback (line follows cursor, other lines shift), snap to ranked position on release
- **Point dragging:** Drag point, constrained to line (point follows line equation), triangle updates in real-time, smooth animation

**Slider Controls:**
- **Slope slider:** Range -3 to 3, increments of 0.1, line rotates around origin in real-time
- **Y-intercept slider:** Range -5 to 5, increments of 0.1, line shifts vertically, slope remains constant
- **Visual feedback:** Slider handle highlights on hover, line updates immediately, equation updates simultaneously

**Feedback Elements:**
- **Success feedback:** Celebration animation (pulse, color change), message: "You found three different triangles with slope = 2!"
- **Hint feedback:** Subtle, non-intrusive, appears after 30s inactivity: "Try moving the points to see what changes"
- **Discovery reveals:** Scaffolded text overlays, fade in/out, don't block interaction

### Responsive Breakpoints

**Desktop (≥1024px):**
- Canvas and control panel side-by-side
- Canvas: ~60% width, full height
- Panel: ~40% width, full height
- All elements visible simultaneously

**Tablet (768px - 1023px):**
- Canvas: Full width, ~60% height
- Panel: Full width, ~40% height, stacked below
- Slightly reduced font sizes, compact spacing

**Mobile (<768px):**
- Canvas: Full width, ~70% height
- Panel: Full width, ~30% height, stacked below
- Touch-optimized drag interactions (larger hit areas)
- Reduced font sizes, minimal spacing
- Sliders remain usable with touch

### Stage Machine Configuration

**Stage definitions:**
```typescript
type Stage = 
  | 'observe'      // Four lines, no grid, ranking prompt
  | 'manipulate'   // Lines draggable, ranking feedback
  | 'discover'     // Single line, points, triangle, ratio, challenge
  | 'celebrate';   // Two triangles, angles, proof, formula

// Visibility rules per stage
const stageVisibility = {
  observe: {
    lines: true,
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false
  },
  manipulate: {
    lines: true, // draggable
    grid: false,
    points: false,
    triangle: false,
    equation: false,
    sliders: false
  },
  discover: {
    lines: true, // single line
    grid: true,
    points: true,
    triangle: true,
    equation: false,
    sliders: false // revealed later in stage
  },
  celebrate: {
    lines: true,
    grid: true,
    points: true,
    triangle: true, // two triangles
    equation: true,
    sliders: true
  }
};
```

**Transition triggers:**
- **Observe → Manipulate:** User starts dragging a line
- **Manipulate → Discover:** User completes ranking, system reveals: "You just compared slopes. Let's understand what makes one steeper."
- **Discover → Celebrate:** User completes challenge (finds three triangles with slope = 2), system reveals similar triangles proof
- **Celebrate completion:** Formula appears, module complete

**Discovery feedback patterns:**
- **Proximity indicators:** When user drags points close to target ratio, subtle visual feedback (e.g., ratio display pulses)
- **Challenge completion:** Celebration animation, message, transition to next stage
- **Constant ratio discovery:** Highlight ratio prominently when user notices it stays the same despite different triangle sizes

---

**End of UX Specification**
