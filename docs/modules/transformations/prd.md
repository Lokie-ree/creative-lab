# Product Requirements Document: Transformations Explorer

## 1. One-Sentence Problem

Grade 8 students struggle to understand geometric transformations as precise, predictable operations because they see only static before/after images without experiencing the transformation process, resulting in an inability to predict transformation outcomes, explain why congruence/similarity can be defined through transformations, or recognize the coordinate rules that govern each transformation type.

---

## 2. Demo Goal (What Success Looks Like)

**Success:** A student can predict the result of a transformation before seeing it, then verify through manipulation. The demo clearly communicates that transformations follow rules—once you understand the rules, you can predict outcomes. Students recognize that congruence and similarity can be defined through these precise operations.

**Non-Goals:**
- Custom figure creation
- 3D transformations preview
- Transformation matrices introduction (reserved for Vector Transformations module)
- Real-world applications gallery
- Production-grade assessment tracking

---

## 3. Target User (Role-Based)

**Role:** Grade 8 student learning geometric transformations (8.G.A.1–4)

**Skill Level:**
- Prerequisite: Basic coordinate plane familiarity, can plot points
- Current: Learning properties of rotations, reflections, translations; understanding congruence via rigid motions; describing effects using coordinates

**Key Constraint:** 8-12 minute attention span; needs to watch transformations happen (not just see before/after) to internalize the operation

---

## 4. Core Use Case (Happy Path)

**Start Condition:** User sees a triangle ABC on a coordinate grid with a vector arrow showing translation direction/magnitude.

**Flow (Observe → Manipulate → Discover → Celebrate):**

1. **Observe:** User watches a translation happen—triangle slides along the vector. Pre-image remains faded; image moves in real-time. Coordinate labels update: A(2,3) → A'(5,6).

2. **Manipulate:** 
   - User drags the vector arrow endpoint to control translation
   - User moves reflection line to see mirror effect
   - User adjusts rotation angle slider (0° to 360°) to rotate triangle around origin
   - User adjusts dilation scale factor (0.5 to 3) to grow/shrink triangle from center
   - All transformations update in real-time with coordinate displays

3. **Discover:**
   - **Translation:** User notices translation adds the same values to ALL vertices
   - **Reflection:** User sees each point and its image are equidistant from the reflection line
   - **Rotation:** User discovers coordinate rules: 90° CCW: (x,y) → (-y, x); 180°: (x,y) → (-x, -y)
   - **Composition:** User maps two congruent figures using a sequence of transformations, discovering any two congruent figures can be mapped via rigid motions
   - **Dilation:** User observes dilation preserves angles but multiplies all lengths by scale factor
   - Challenge: "Reflect over the line y = x. Predict where B lands before clicking 'Show'"

4. **Celebrate:**
   - System reveals transformation history showing the sequence that mapped figures
   - Success indicator highlights when figures align perfectly
   - User recognizes that transformations aren't arbitrary—they follow predictable rules
   - Final understanding: Congruence = rigid motions; Similarity = rigid motions + dilation

**End Condition:** User can predict transformation outcomes, explain coordinate rules, and understand how transformations define congruence and similarity.

---

## 5. Functional Decisions (What It Must Do)

| ID | Function | Notes |
|----|----------|-------|
| F1 | Display coordinate grid with geometric figure | Range -8 to 8, triangle with labeled vertices A, B, C |
| F2 | Render transformation vector (draggable arrow) | Shows translation direction and magnitude |
| F3 | Apply translation in real-time | Pre-image faded, image moves as vector changes |
| F4 | Update coordinate labels dynamically | Shows A(2,3) → A'(5,6) format |
| F5 | Render draggable/rotatable reflection line | Starts as y-axis, can be moved/rotated |
| F6 | Apply reflection with mirror effect | Image updates in real-time, shows equidistance markers |
| F7 | Display rotation angle slider | Range 0° to 360°, rotations about origin only |
| F8 | Apply rotation with arc visualization | Smooth rotation around center point |
| F9 | Display dilation scale factor slider | Range 0.5 to 3, center at origin |
| F10 | Apply dilation showing size change | Preserves angles, multiplies lengths |
| F11 | Display side lengths and angle measures | For dilation stage to show what changes/stays same |
| F12 | Provide transformation toolbar | Select type (translate, reflect, rotate, dilate) |
| F13 | Track transformation history | List of applied transformations with undo |
| F14 | Validate figure alignment | Check if two figures match after transformations |
| F15 | Support challenge mode | Series of prediction/identification challenges |

---

## 6. UX Decisions (What the Experience Is Like)

### 6.1 Entry Point

User starts by seeing a triangle ABC on a coordinate grid with a vector arrow. Simple, visual-first: "Drag the arrow to translate the triangle." Pre-image remains visible (faded) so user can see both original and transformed positions simultaneously.

### 6.2 Inputs

- **Drag interactions:** Vector arrow endpoint, reflection line position/rotation, rotation center point
- **Slider controls:** Rotation angle (0° to 360°), dilation scale factor (0.5 to 3)
- **Toolbar selections:** Choose transformation type (translate, reflect, rotate, dilate)
- **Challenge responses:** Predict coordinates before transformation, identify transformation type, find minimum transformation sequence

### 6.3 Outputs

- **Visual feedback:** Real-time transformation animations (triangle moves, rotates, reflects, scales)
- **Coordinate displays:** Vertex coordinates update dynamically (A(2,3) → A'(5,6))
- **Transformation notation:** Shows coordinate rules (e.g., (x,y) → (x+a, y+b) for translation)
- **Discovery reveals:** Distance markers for reflection, arc paths for rotation, side length ratios for dilation
- **Success indicators:** Figures highlighted when aligned, transformation history shows successful sequence

### 6.4 Feedback & States

- **Loading:** Smooth stage transitions (500ms easeOutQuart)
- **Success:** Immediate visual confirmation when challenges are correct (e.g., "Correct! B' is at (1, 3)")
- **Partial results:** Real-time coordinate updates as user manipulates transformations
- **Discovery moments:** Highlighted when user notices patterns (e.g., "All vertices moved by the same amount!")

### 6.5 Errors (Minimum Viable Handling)

- **Invalid input:** If user tries to drag figure off grid, constrain to valid bounds
- **System failure:** Graceful degradation—if animation fails, show static transformed state with coordinates
- **User does nothing:** After 30 seconds of inactivity, show subtle hint: "Try dragging the vector to see the translation"

---

## 7. Data & Logic (At a Glance)

### 7.1 Inputs

- **User:** Drag positions (vector endpoint, reflection line, rotation center), slider values (angle, scale), toolbar selections, challenge responses
- **Static/Mocked:** Initial triangle configuration (vertices at (1,1), (3,1), (2,3)), challenge problems, transformation sequences
- **Generated:** Transformation calculations derived from user inputs, coordinate updates computed from transformation rules

### 7.2 Processing

**Core Logic Flow:**
- User drags vector → Calculate translation (dx, dy) → Apply to all vertices → Update coordinates → Render transformed figure
- User moves reflection line → Calculate line equation → Reflect each vertex across line → Update coordinates → Render mirror image
- User adjusts rotation angle → Calculate rotation matrix → Rotate each vertex about origin → Update coordinates → Render rotated figure
- User adjusts scale factor → Multiply each vertex by scale → Update side lengths → Render dilated figure
- User composes transformations → Apply sequence in order → Track history → Validate final alignment

**Mathematical Operations:**
- `translate(p, dx, dy) = (p.x + dx, p.y + dy)`
- `reflectOverYAxis(p) = (-p.x, p.y)`
- `reflectOverXAxis(p) = (p.x, -p.y)`
- `reflectOverYEqualsX(p) = (p.y, p.x)`
- `rotate90CCW(p) = (-p.y, p.x)`
- `rotate180(p) = (-p.x, -p.y)`
- `dilate(p, k) = (p.x * k, p.y * k)`

### 7.3 Outputs

- **UI only:** All visualizations rendered with React Three Fiber (coordinate grid, geometric figures, transformation tools, labels)
- **Temporarily stored:** Current stage state, transformation history, challenge attempts, discovery progress (client-side React state, no persistence)
- **Logged (optional):** Time per stage, prediction accuracy, transformation sequence efficiency for analytics (if enabled)

**Technical Context:**
- All computation is client-side (no API calls)
- State managed via React hooks + stage machine pattern
- Visualizations rendered with React Three Fiber
- Animations handled by GSAP (transformation preview: 400ms easeInOutCubic, stage transition: 500ms easeOutQuart, success celebration: 600ms spring)

---

## Assumptions

- **Tech stack:** React 19 + TypeScript, React Three Fiber, GSAP, Tailwind CSS
- **Pedagogical pattern:** Observe → Manipulate → Discover → Celebrate (stage-based flow)
- **Standards alignment:** 8.G.A.1 (properties of rotations, reflections, translations), 8.G.A.2 (congruence via rigid motions), 8.G.A.3 (describe effects using coordinates), 8.G.A.4 (similarity via transformations including dilation)
- **Duration:** 8-12 minutes total module experience
- **Rotation constraint:** Rotations only about origin in Grade 8 (per standards)
- **Key differentiation:** Emphasizes watching the transformation process happen, not just seeing before/after static images
