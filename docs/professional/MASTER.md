# Brilliant Math Producer Application: Master Document

> **Single Source of Truth** — This document consolidates all application materials, vision, context, and current status for Randall LaPoint, Jr.'s application to Brilliant's Math Producer role.

**Application Deadline:** January 1, 2026  
**Status:** Module deployed, materials complete, final polish in progress  
**Live Demo:** https://creative-lab-five.vercel.app/

---

## Table of Contents

1. [The Opportunity](#the-opportunity)
2. [Candidate Profile](#candidate-profile)
3. [The Interactive Module](#the-interactive-module)
4. [Application Materials](#application-materials)
5. [Current State & Status](#current-state--status)
6. [Key Learnings & Principles](#key-learnings--principles)
7. [Technical Architecture](#technical-architecture)
8. [Pedagogical Foundation](#pedagogical-foundation)
9. [Resources & Links](#resources--links)

---

## The Opportunity

### Role: Math Producer at Brilliant

**What Brilliant Wants:**
- Design interactive learning games teaching math from foundational logic to calculus
- Teach mathematical thinking creatively
- Brainstorm new interactive experiences bringing problem-solving to life
- Use pedagogical instincts to achieve best outcomes for learners

**The Differentiator:**
> "To be considered for this role, please include your best example(s) of how you've taught mathematical concepts interactively online."

**The Gap Identified:**
Brilliant's Advanced Math section currently lacks standalone trigonometry content, with concepts like "Sine and Cosine" buried within the Calculus track—representing a clear opportunity for the sine wave concept to fill this gap.

---

## Candidate Profile

### Randall LaPoint, Jr.

**Math Educator • Full-Stack Developer • Interactive Learning Designer**

### Why This Role Fits

| Requirement | Evidence |
|-------------|----------|
| "Undergraduate degree or above in STEM field" | MS Mathematics (Nicholls State, 2013) |
| "Strong grounding through research or teaching that extends beyond traditional math curricula" | 15+ years classroom teaching (K-12), mentor teacher, 504 coordinator, technology facilitator |
| "Knack for teaching complex topics using clear, simple, hands-on steps" | Career built on making math accessible; pioneered technology integration in classroom |
| "Experience with building or using interactivity to motivate learners" | Full-stack developer; built custom web applications for learning contexts |
| "Way with words when communicating challenging concepts" | Mentor teacher role; trained colleagues on instructional best practices |
| "Great at context switching and prioritizing across large workload" | Juggled teaching, technology coordination, mentoring, and development simultaneously |
| "Openness to change and willingness to experiment" | Pivoted from traditional teaching to EdTech exploration; self-taught developer |

### The Unique Angle

Most candidates will be either:
- **Math people who can write** (traditional educators)
- **Tech people who understand learning** (instructional designers)

**Randall is rare:** A mathematician who teaches, codes, AND thinks pedagogically about interactive design.

The module demonstrates this trifecta by:
1. Showing deep understanding of sine/cosine relationships (math expertise)
2. Building a polished, responsive interactive experience (technical execution)
3. Structuring the experience around discovery, not explanation (pedagogical design)

### Education

- **Master of Education in Educational Leadership** — American College of Education, 2016
- **Master of Science in Mathematics** — Nicholls State University, 2013
- **Bachelor of Science in Mathematics** — Nicholls State University, 2010

### Teaching Experience

**Mathematics Teacher & Technology Facilitator**  
Iberville Virtual Learning Academy, 2024 – Present

- Decomposed complex mathematical ideas into approachable, well-sequenced progressions for diverse learners
- Designed visual, hands-on learning experiences that guided students toward mathematical thinking
- Created content addressing common misconceptions in algebra, geometry, and trigonometry
- Mentored new teachers on instructional best practices and classroom engagement strategies

**504 Coordinator & STEM Teacher**  
Crescent Elementary School, 2023-2024

- Inspired young minds through hands-on experiences teaching K-6 STEM
- Balanced large workload across documentation, implementation, and stakeholder communication
- Collaborated with educators, families, and specialists to ensure equitable access to learning

**Mentor Teacher**  
White Castle High School, 2019-2023

- Supported teachers in all content areas, not just mathematics
- Trained colleagues on translating mathematical concepts into clear, simple, hands-on steps
- Modeled instructional techniques that challenged students while building confidence
- Supported context switching across content areas and competing priorities

**Mathematics Teacher**  
Vandebilt Catholic High School, 2010-2019

- Decomposed complex mathematical ideas into approachable, well-sequenced progressions for diverse learners
- Designed visual, hands-on learning experiences that guided students toward mathematical thinking
- Created content addressing common misconceptions in algebra, geometry, and advanced mathematics

### Technical Skills

**Languages & Frameworks:** TypeScript, React, Next.js, Three.js, React Three Fiber, GSAP, Tailwind

**Backend & Infrastructure:** Convex, Node.js, REST APIs, AI/LLM integration, Sanity

**Tools & Platforms:** GitHub, Vercel, Claude Code, Cursor IDE, Linear

**Design & Visualization:** Mathematical animation at 60fps, interactive data visualization, responsive UI design, component architecture

### Interactive Teaching Online

**Pelican AI** — Founder & Developer (2025 – Present)

Built an intelligent coaching layer that helps Louisiana teachers generate high-quality, context-aligned prompts for AI tools. Currently serving active users during beta testing.

- Designed conversational interface that gathers pedagogical context through natural dialogue rather than form-filling
- Integrated Louisiana Educator Rubric, Louisiana Student Standards, and LEADS evaluation framework into prompt generation
- Created feedback loops where successful prompts become shareable exemplars for other educators
- Tech stack: React, Convex backend, GPT integration with Louisiana-specific RAG

**Creative Lab: Sine/Cosine Interactive Module** — In Development (December 2025)

Designing an interactive visualization where users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

- Users immediately engage with synchronized unit circle, wave graph, and pulsing glow visualization
- Pattern-matching challenge teaches amplitude, frequency, and phase through intuition
- No front-loaded explanations—the interface teaches through invitation to tinker
- Built with React, Three.js, GSAP, achieving 60fps mathematical animations

---

## The Interactive Module

### One-Sentence Pitch

> Users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

### Core Experience

**On Load:** User sees three synchronized elements:
1. **Unit Circle** — Point rotating, tracing the angle
2. **Wave Graph** — Sine wave unfurling in real-time, synced to circle
3. **Pulsing Glow** — Visual output showing the wave's rhythm as light intensity

Plus: **Target Glow** — A ghost pulse they need to match

No instructions. No text explanation. The interface teaches through invitation.

### User Journey

```
IMMEDIATE STATE (0-5 seconds)
├── See: Circle spinning, wave drawing, glow pulsing
├── Notice: Another glow pulsing at different rhythm (the target)
└── Instinct: "I should make these match"

EXPLORATION (5-60 seconds)
├── Discover: Sliders control amplitude, frequency, phase
├── See: Each slider changes the visualization immediately
├── Connect: "This slider makes it faster... this one makes it bigger..."
└── Build: Mental model of parameters through manipulation

MATCHING (60-180 seconds)
├── Attempt: Adjust sliders toward target motion
├── Feedback: Visual/color proximity indicator ("getting warmer")
├── Iterate: Fine-tune until rhythms sync
└── Succeed: Pulses align perfectly

REVEAL (The Earned Moment)
├── Celebration: Subtle animation acknowledging success
├── Formula appears: y = A × sin(ωt + φ)
├── Your values highlighted: y = 1.5 × sin(2.0t + π/4)
└── Connection: "You just built this equation"
```

### Stage Flow (Implemented)

```
observe → amplitude → frequency → phase → challenge → reveal
             │            │          │
         [explore]    [explore]  [explore]
             │            │          │
         [match]      [match]    [match]
             │            │          │
         [question]  [question] [question]
             │            │          │
         [feedback]  [feedback] [feedback]
```

**Progress:** Continuous bar at top

### Visual Design Direction

**Aesthetic:** Clean, focused, Brilliant-aligned—NOT gaming-heavy

**Color Palette:**
- Background: Deep navy or off-black (#0a0a0f)
- Primary accent: Brilliant's Pear spectrum (warm yellow-green #c8e44c)
- Secondary: Soft white/cream for UI elements
- Wave/circle: Gradient from cyan to magenta showing amplitude
- Target ghost: Semi-transparent version of primary accent

**Typography:**
- Headers: Geometric sans-serif (similar to CoFo Robert)
- UI labels: Clean sans-serif with good legibility
- Formula: Elegant serif or mathematical font

**Interaction Feel:**
- Sliders: Large, touch-friendly, immediate response
- Hover states: Subtle scale/glow
- Transitions: Smooth easing (0.2-0.3s)
- No overwhelming animations—focus-preserving

---

## Application Materials

### Cover Letter

**Randall LaPoint, Jr.**  
*Math Producer Application — Brilliant*

---

Dear Brilliant Team,

I've spent over a decade watching students hit walls. Not the kind that mean they can't learn—the kind that mean we've taught it wrong.

The moment I started using Brilliant as a learner, I recognized something familiar: you treat formulas as destinations, not entrances. That's the same instinct I've been fighting for in Louisiana classrooms since 2010. When I teach sine and cosine, I don't start with y = A sin(Bx + C). I start with a spinning point, a shadow on the wall, a rhythm students can feel before they can name it. The formula comes later—as confirmation of something they've already understood.

That philosophy is why I'm applying for this role, and why I built something to show you what I mean.

**The Interactive Module**

I've created a sine/cosine visualization where users discover the wave equation by matching a target motion. There's no front-loaded explanation. Users land on a synchronized unit circle, wave graph, and pulsing glow—plus a ghost target they need to match. They drag sliders. Things move. *Oh, that's what amplitude does.* When they nail the match, the formula appears as a reward, not a prerequisite.

This is how I believe mathematical concepts should be taught: challenge before explanation, intuition before notation, formula as earned insight.

**Why I'm a Fit**

I hold an Master of Science in Mathematics from Nicholls State University. I've taught grades 6–12 across algebra, geometry, trigonometry, and precalculus. I've served as a mentor teacher training colleagues, a technology facilitator pioneering digital tools in classrooms, and a 504 coordinator balancing large, complex workloads across competing priorities.

I'm also a self-taught full-stack developer. This year, I built Pelican AI—an intelligent coaching platform that helps Louisiana teachers generate context-aligned prompts for AI tools. It integrates the Louisiana Educator Rubric, Louisiana Student Standards, and LEADS evaluation framework into a conversational interface. It has active users. It works.

That combination—mathematician, classroom teacher, builder—is what I bring to Brilliant. I understand where students get lost because I've watched it happen thousands of times. I know how to sequence experiences that build genuine comprehension. And I can prototype and ship.

**What Draws Me to Brilliant**

Your values resonate: adventure, excellence, generosity, candor. I'm an optimist who takes pride in craft. I go the extra mile because the work matters. I tell it like it is because that's how trust gets built.

I also believe what you're building changes lives. I've seen students who "hate math" light up when they finally *get* something—not because they memorized a rule, but because they discovered a pattern. Brilliant scales that moment to millions of learners. That's the work I want to do.

**The Ask**

I'd welcome the chance to show you how I think about interactive math education. The module I've built demonstrates my approach; a conversation would let me show you how I'd apply it across the range of concepts your learners encounter.

Thank you for your time and consideration.

Sincerely,

Randall LaPoint, Jr.

---

*rplapointjr@gmail.com • (985) 518-9129 • https://creative-lab-five.vercel.app/*

### Resume Summary

**Veteran math educator with 10+ years of classroom experience, an advanced mathematics degree, and self-taught full-stack development skills. I design interactive learning experiences that treat formulas as destinations to be earned through discovery, not prerequisites to be memorized. Currently building AI-powered coaching tools for Louisiana educators and interactive mathematics modules that demonstrate pedagogical approaches aligned with modern learning science.**

**Relevant Strengths:**
- **Mathematical Depth:** Advanced degree with coursework spanning calculus, linear algebra, abstract algebra, analysis, and beyond
- **Pedagogical Instinct:** Nearly two decades of watching students hit walls and finding ways around them
- **Technical Execution:** Self-taught developer who ships working products
- **Content Creation:** Strong writing skills developed through years of explaining complex ideas clearly
- **Adaptability:** Comfortable pivoting between classroom teaching, technology coordination, mentoring, and development work

**Philosophy:**
I believe mathematical understanding should be earned through discovery, not delivered through explanation. The best learning experiences drop users into challenges that feel intuitive, then reveal the underlying structure after they've developed genuine insight. Formulas should feel like rewards—confirmation of something you've already understood—not arbitrary rules to memorize.

**Contact:**  
*rplapointjr@gmail.com • (985) 518-9129 • https://creative-lab-five.vercel.app/*

---

## Current State & Status

### Module Status

**Deployment:** ✅ Live at creative-lab-five.vercel.app  
**Completion:** ~98% complete — All core functionality implemented

**Implemented Features:**
- ✅ All 6 stages (Observe → Amplitude → Frequency → Phase → Challenge → Reveal)
- ✅ All reusable components (ProgressBar, ExplorePrompt, QuestionCard, FeedbackBanner, WhyModal, CelebrationModal, ParameterSlider)
- ✅ All domain-specific components (UnitCircle, SineWave, Connector, Scene)
- ✅ All questions and feedback matching spec
- ✅ All targets and thresholds (95% match threshold, nice values for all parameters)
- ✅ Parameter slider extraction complete
- ✅ Formula preview showing building equation
- ✅ Smooth transitions and animations
- ✅ Celebration effects

**Minor Gaps:**
- ⚠️ `FormulaReveal` not yet refactored to use generic `CelebrationModal` (both exist and work)
- ⚠️ Component naming: `Scene` vs `SinusoidalScene` (cosmetic)

### Application Materials Status

- ✅ Resume complete
- ✅ Cover letter complete
- ✅ Module deployed and functional
- 🔄 Final polish in progress

### On the Horizon

With the application deadline approaching, Randall is preparing final optimizations to ensure flawless performance of his demo module and maximum visibility in his application materials. He's considering additional portfolio enhancements like:

- Pedagogical design document explaining his approach
- Potential video walkthrough demonstrating both technical and communication skills
- LinkedIn networking with Brilliant employees

The focus remains on polishing the existing module to production quality rather than expanding scope.

---

## Key Learnings & Principles

### Brilliant's Pedagogical Philosophy (Applied)

**"We don't teach how to do something before asking questions."**  
→ Module opens with a challenge (match the motion), not an explanation

**"Let the learner try to find a solution before learning the procedure."**  
→ Users manipulate sliders to discover relationships; formula appears after success

**"Lessons build intuition with visual explanations and hands-on manipulation first, then introduce formal procedures."**  
→ The visualization IS the explanation; the equation is the capstone, not the foundation

**"The difference between a good student and a great student is that great students continually fail."**  
→ "Getting closer" feedback celebrates progress, not just success; no punishing wrong answers

### The "Earned Reveal" Mechanic

**Traditional approach:**
```
Here's the formula: y = A × sin(ωt + φ)
A is amplitude, ω is frequency, φ is phase.
Now try changing the values...
```

**This module's approach:**
```
[User manipulates sliders]
[User notices patterns]
[User matches target]
→ "You just built: y = 1.5 × sin(2.0t + π/4)"
→ The formula describes what they ALREADY understand
```

The formula becomes a **label for intuition**, not a **barrier to entry**.

### Strategic Insights

1. **Replicate, Don't Redesign:** Decided to replicate Brilliant's established design system rather than showcase his own aesthetic, recognizing that as a Math Producer candidate, his value should be enhancing their existing framework with superior technical execution rather than proposing visual overhauls.

2. **One Polished Module:** Follows the principle that one polished module at 100% quality is better than multiple modules at 70% quality.

3. **Technical Advantage:** Leverages React Three Fiber for 60fps smooth animations that Brilliant's current React/SVG stack cannot match, particularly for unit circle to wave synchronization and real-time mathematical relationship visualization.

4. **Discovery Learning:** Emphasizes discovery learning through parameter manipulation and visual pattern matching.

---

## Technical Architecture

### Stack

```
Vite + React + TypeScript
├── React Three Fiber (3D visualization)
├── drei (R3F helpers)
├── GSAP (discrete transitions)
├── shadcn/ui (control components)
└── Tailwind CSS (styling)
```

### Component Structure

```
<App>
├── <Header /> — Minimal branding, no navigation needed
├── <ModuleContainer>
│   ├── <Canvas> (R3F)
│   │   ├── <UnitCircle angle={angle} />
│   │   ├── <SineWave angle={angle} amplitude={A} frequency={ω} phase={φ} />
│   │   ├── <PulsingGlow value={currentSineValue} />
│   │   └── <TargetGlow value={targetSineValue} />
│   ├── <ControlPanel>
│   │   ├── <ParameterSlider label="Amplitude" ... />
│   │   ├── <ParameterSlider label="Frequency" ... />
│   │   └── <ParameterSlider label="Phase" ... />
│   ├── <MatchIndicator percentage={matchScore} />
│   └── <FormulaReveal show={hasMatched} values={...} />
└── <Footer /> — Attribution, link to portfolio
```

### State Architecture

```typescript
// Core parameters (user-controlled)
const [amplitude, setAmplitude] = useState(1.0);    // 0.1 - 2.0
const [frequency, setFrequency] = useState(1.0);    // 0.5 - 3.0
const [phase, setPhase] = useState(0);              // 0 - 2π

// Animation (ref-based, not React state)
const angleRef = useRef(0);
const timeRef = useRef(0);

// Challenge
const [target] = useState(() => generateTarget()); // Random on load
const [hasMatched, setHasMatched] = useState(false);

// Derived (computed each frame)
const currentValue = amplitude * Math.sin(frequency * time + phase);
const targetValue = target.a * Math.sin(target.f * time + target.p);
const matchScore = calculateProximity(amplitude, frequency, phase, target);
```

### Performance Guardrails

- Never `setState` inside `useFrame`
- Reuse geometries/materials via `useMemo`
- Limit wave trail to ~200 points
- Use `dpr={[1, 1.5]}` for mobile
- Pre-allocate vectors, reuse via `.set()`

---

## Pedagogical Foundation

### "Getting Closer" Feedback

Instead of binary right/wrong:
- Match indicator shows proximity (0-100%)
- Color shifts from cool → warm as match improves
- No "wrong" state—everything is exploration
- Success is the end of a gradient, not a sudden gate

### Success Criteria

The module succeeds if:

- [x] A hiring manager can understand it in 30 seconds without reading instructions
- [x] Someone learns something about sine waves by playing with it for 2 minutes
- [x] The formula reveal feels earned, not dumped
- [x] It runs smoothly on mobile and desktop
- [x] It signals: "This person thinks about learning, not just interfaces"

---

## Resources & Links

### Application Links

**Job Posting:** https://jobs.lever.co/brilliant/b0b97281-179b-4b47-b5d6-a0cfaad3f425

**Live Demo:** https://creative-lab-five.vercel.app/

### Technical References

- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- drei helpers: https://github.com/pmndrs/drei
- shadcn/ui: https://ui.shadcn.com
- GSAP: https://gsap.com/docs/v3/

### Brilliant Design References

- Brilliant brand refresh: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486
- ustwo x Brilliant: https://ustwo.com/work/brilliant/
- Rive animations at Brilliant: https://www.rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations

### Contact Information

**Randall LaPoint, Jr.**  
Email: rplapointjr@gmail.com  
Phone: (985) 518-9129  
Portfolio: https://creative-lab-five.vercel.app/

---

**Last Updated:** December 2025  
**Status:** Application materials complete, final polish in progress
