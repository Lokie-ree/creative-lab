# Future Interactive Math Modules

## Pipeline Overview

Modules prioritized by: (1) student impact, (2) R3F visualization leverage, (3) LEAP standards alignment.

---

## Tier 1: High Priority (Next 6 Months)

### What IS a Function?
**Standard:** 8.F.A.1–3  
**Grade:** 8  
**Core Concept:** Function as input-output machine; graph as visualization of all pairs  
**Visualization:** Interactive function machine + simultaneous mapping diagram + graph  
**Key Insight:** "One input, one output" becomes visceral when you try to break it  
**Challenge:** Build a machine that ISN'T a function; identify functions from graphs  

---

### Proportional Relationships
**Standard:** 7.RP.A.1–3  
**Grade:** 7  
**Core Concept:** Constant of proportionality, equivalent ratios, graphs through origin  
**Visualization:** Table ↔ graph ↔ equation simultaneous updates  
**Key Insight:** Proportional = straight line through origin = constant ratio  
**Challenge:** "Is this relationship proportional?" with various representations  

---

### Operations on the Number Line
**Standard:** 7.NS.A.1  
**Grade:** 7  
**Core Concept:** Adding/subtracting rational numbers including negatives  
**Visualization:** Animated "walking" on number line with direction/distance  
**Key Insight:** Subtracting negative = adding (watch the animation)  
**Challenge:** Predict landing position before animation plays  

---

### Pythagorean Theorem
**Standard:** 8.G.B.6–8  
**Grade:** 8  
**Core Concept:** Visual proof via area; application to distance formula  
**Visualization:** Draggable right triangle with area squares on each side  
**Key Insight:** The areas literally add up—you can see it  
**Challenge:** Find missing side; determine if triangle is right triangle  

---

### Quadratic Function Transformations
**Standard:** A1: F-BF.B.3, A1: F-IF.C.7a  
**Grade:** Algebra I  
**Core Concept:** Effect of a, h, k in y = a(x-h)² + k  
**Visualization:** Four sliders controlling each parameter simultaneously  
**Key Insight:** Vertex form tells you where the parabola lives  
**Challenge:** "Land the vertex on this point with axis of symmetry x = 3"  

---

### Solving Systems Graphically
**Standard:** 8.EE.C.8, A1: A-REI.D.10–11  
**Grade:** 8 / Algebra I  
**Core Concept:** Solution = intersection point; satisfies BOTH equations  
**Visualization:** Two adjustable lines; intersection highlighted; verify coordinates in both equations  
**Key Insight:** The intersection point works in both equations—click to verify  
**Challenge:** Adjust slopes/intercepts to create 0, 1, or infinite solutions  

---

## Tier 2: Medium Priority (6–12 Months)

### Dilations and Similarity
**Standard:** G-SRT.A.1–2, 8.G.A.4  
**Grade:** 8 / Geometry  
**Core Concept:** Scale factor, center of dilation, similar figures  
**Visualization:** Drag center of dilation, adjust scale factor, watch figure transform  
**Key Insight:** Angles preserved, lengths multiplied—similarity is dilation  

---

### Congruence Through Rigid Motions
**Standard:** G-CO.B.6–8  
**Grade:** Geometry  
**Core Concept:** Prove congruence by finding transformation sequence  
**Visualization:** Given two figures, compose transformations to map one onto other  
**Key Insight:** Congruent = same shape achievable through rigid motions only  

---

### Linear vs. Exponential Growth
**Standard:** A1: F-LE.A.1–3  
**Grade:** Algebra I  
**Core Concept:** Constant rate of change vs. constant ratio  
**Visualization:** Side-by-side growth animations; table comparisons  
**Key Insight:** Exponential "catches up" and explodes past linear  
**Challenge:** Predict which function is larger at x = 10  

---

### Scatter Plots and Line of Best Fit
**Standard:** 8.SP.A.1–3  
**Grade:** 8  
**Core Concept:** Association, correlation, regression intuition  
**Visualization:** Draggable data points; adjustable regression line; residuals shown  
**Key Insight:** "Best fit" minimizes total distance from points to line  

---

### Expressions: Like Terms and Distribution
**Standard:** 7.EE.A.1–2  
**Grade:** 7  
**Core Concept:** Combining like terms, distributive property  
**Visualization:** Algebra tiles / area models that physically combine  
**Key Insight:** "Like terms" are literally the same shape—they fit together  

---

## Tier 3: Future Exploration (12+ Months)

### Circle Relationships
**Standard:** G-C.A.2, G-GPE.A.1  
**Grade:** Geometry  
**Concept:** Inscribed angles, central angles, equation of circle  

### Volume Formulas
**Standard:** 8.G.C.9, G-GMD.A.1–3  
**Grade:** 8 / Geometry  
**Concept:** Cylinder, cone, sphere—where do formulas come from?  

### Probability: And vs. Or
**Standard:** 7.SP.C  
**Grade:** 7  
**Concept:** Visual probability with Venn diagrams and area models  

### Angle Relationships
**Standard:** 7.G.B.5, G-CO.C.9  
**Grade:** 7 / Geometry  
**Concept:** Complementary, supplementary, vertical, parallel line angles  

### Rational Expressions
**Standard:** A1: A-APR  
**Grade:** Algebra I  
**Concept:** Polynomial operations visualized  

---

## Module Dependency Graph

```
Grade 7 Foundation
├── 7.RP.A: Proportional Relationships
│   └── 8.EE.B: Slope ★ (in progress)
│       └── A1: F-LE: Linear vs Exponential
│
├── 7.NS.A: Number Line Operations
│   └── 7.EE.A: Expressions
│       └── A1: A-SSE: Structure of Expressions
│
└── 7.G: Geometry Foundations
    └── 8.G.A: Transformations ★ (in progress)
        ├── G-CO: Congruence
        └── G-SRT: Similarity

Grade 8 Bridges
├── 8.F.A: Functions
│   └── A1: F-IF: Function Properties
│       └── A1: F-BF: Transformations
│
├── 8.EE.C: Systems of Equations
│   └── A1: A-REI: Solving Systems
│
└── 8.G.B: Pythagorean Theorem
    └── G-GPE: Coordinate Geometry

★ = Currently in development
```

---

## Selection Criteria for Next Module

When choosing what to build next, consider:

1. **Student Pain Index:** How often do students struggle with this?
2. **Visualization Leverage:** Does R3F add something static images can't?
3. **Dependency Position:** Does this unlock understanding for later topics?
4. **Assessment Weight:** How heavily tested on LEAP?
5. **Build Complexity:** Can it be completed in 2 weeks?

### Recommended Next After Slope + Transformations:

**Option A: Functions (8.F.A)** — foundational for all of algebra  
**Option B: Proportional Relationships (7.RP.A)** — prerequisite for slope, helps younger students  
**Option C: Pythagorean Theorem (8.G.B)** — classic visual proof, high engagement  

---

## Notes

- Each PRD should follow the established format (see Slope and Transformations PRDs)
- Modules should share component library where possible (coordinate grids, sliders, etc.)
- Consider bundling related modules into "learning paths" for teacher adoption
- All modules must include challenge mode for engagement validation
