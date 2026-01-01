# Teaching Samples: Interactive Learning Experiences

## Primary Sample: Sinusoidal Waves Interactive Module

**Website Link:** https://creative-lab-five.vercel.app/

### Form Description (Ready to Copy-Paste)

An interactive visualization where users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite. This module embodies Brilliant's core pedagogical philosophy: challenge before explanation, intuition before notation. Users are dropped into a synchronized unit circle, wave graph, and pulsing glow visualization. They drag sliders to explore amplitude and frequency relationships, see the circle radius scale with amplitude, and earn the formula only after successful completion. Built with React Three Fiber for 60fps mathematical animations, demonstrating both pedagogical design and technical execution.

**Full Description:**
An interactive visualization where users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

**What It Teaches:**
- The relationship between circular motion and sinusoidal waves
- How amplitude affects wave height and circle radius
- How frequency controls wave cycles and rotation speed
- Pattern recognition through visual manipulation

**Pedagogical Approach:**
- Challenge-first learning: No front-loaded explanations
- Discovery through manipulation: Users drag sliders to explore relationships
- Visual reinforcement: Circle radius scales with amplitude, connector line links circle to wave
- Prediction-based reflection: Questions test understanding ("If amplitude were 3...?") rather than recall
- Earned reveal: Formula appears only after successful completion

**Technical Details:**
- Built with React, React Three Fiber, GSAP
- 60fps mathematical animations
- Responsive design (mobile and desktop)
- Complete presentation wrapper with hero landing, celebration modal, and navigation

**Why This Demonstrates Teaching:**
This module embodies Brilliant's core pedagogical philosophy: "We don't teach how to do something before asking questions." Users are dropped into a challenge, discover patterns through manipulation, and earn the formula as confirmation of understanding—not as a prerequisite to learning.

---

## Sample Design Documents: Forward Thinking for Curriculum Expansion

**Purpose:** Demonstrate vision for extending Brilliant's curriculum beyond algebra I through calculus, showing how the same pedagogical approach and tech stack can be applied to advanced mathematical concepts.

### 1. Linear Algebra: Vector Transformations Module

**Design Document:** `SAMPLE_LINEAR_ALGEBRA_DESIGN.md`

**Concept:** Users discover how matrix transformations affect vectors by manipulating transformation matrices and watching vectors transform in real-time. They build intuition for rotation, scaling, and reflection transformations before encountering formal matrix notation.

**Key Features:**
- Challenge-first: Users see a target vector position and must find the transformation
- Visual manipulation: Drag sliders to adjust matrix entries, see immediate visual feedback
- Discovery: Learn that rotation matrices have specific patterns (cos/sin relationships)
- Earned reveal: Matrix notation appears after understanding is built

**Stage Flow:** observe → rotation → scaling → reflection → challenge → reveal

**Technical Approach:**
- React Three Fiber for 2D/3D vector visualization
- Real-time matrix multiplication visualization
- Interactive transformation sliders
- Visual connection between matrix entries and geometric effects

**Why This Demonstrates Forward Thinking:**
Shows how Brilliant's challenge-first pedagogy extends naturally to linear algebra, a critical post-calculus topic. Demonstrates ability to design experiences that make abstract matrix operations concrete through visual manipulation.

---

### 2. Differential Equations: Phase Portraits Module

**Design Document:** `SAMPLE_DIFFERENTIAL_EQUATIONS_DESIGN.md`

**Concept:** Users discover how different differential equation parameters create different solution behaviors by manipulating a 2D system and watching trajectories evolve in real-time. They build intuition for stability, equilibrium points, and phase portraits before encountering formal differential equation notation.

**Key Features:**
- Challenge-first: Users see a target trajectory pattern and must find the parameters
- Visual manipulation: Adjust system parameters, watch trajectories evolve in real-time
- Discovery: Learn how parameter values create stable/unstable/center behaviors
- Earned reveal: Differential equation notation appears after pattern recognition

**Stage Flow:** observe → parameters → trajectories → stability → challenge → reveal

**Technical Approach:**
- React Three Fiber for 2D phase plane visualization
- Real-time numerical integration visualization
- Interactive parameter sliders
- Visual connection between parameters and trajectory shapes

**Why This Demonstrates Forward Thinking:**
Shows how Brilliant's discovery learning approach can make differential equations—traditionally taught through analytical methods—accessible through visual exploration. Demonstrates ability to design experiences that reveal mathematical structure through pattern recognition.

---

**Design Document Format:**
Both documents follow the same comprehensive structure as the implemented sinusoidal waves module:
- Learning goals and essential concepts
- Detailed stage specifications (explore → match → reflect)
- Component architecture and technical implementation
- Pedagogical foundation aligned with Brilliant's philosophy
- Success criteria and extension opportunities

**Submission Format:**
- PDF documents ready for upload to teaching samples section
- Comprehensive design specs (400-500 lines each)
- Demonstrate module design process and technical execution capability
- Show vision for curriculum expansion beyond calculus

---

## Additional Context

**Pelican AI** (2025 – Present)
An intelligent coaching platform that helps Louisiana teachers generate context-aligned prompts for AI tools. While not a direct math teaching example, it demonstrates:
- Understanding of pedagogical frameworks (Louisiana Educator Rubric, Student Standards, LEADS)
- Ability to translate educational needs into interactive tools
- Full-stack development skills applied to learning contexts

**Live Demo:** https://www.pelicanai.org

---

## Teaching Philosophy Reflected

All samples demonstrate:
1. **Challenge before explanation** - Learners engage with problems before receiving answers
2. **Intuition before notation** - Visual and kinesthetic understanding precedes formal mathematical language
3. **Formula as earned insight** - Mathematical notation becomes a label for understanding, not a barrier to entry
4. **Discovery learning** - Students build mental models through manipulation and pattern recognition
