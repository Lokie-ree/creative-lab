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

**The Expansion Opportunity:**
Brilliant is expanding beyond foundational algebra into higher-level mathematics—trigonometry, linear algebra, differential equations. These courses need someone who can design discovery-first experiences for abstract concepts. This module demonstrates how I'd approach that expansion.

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

**The Journey:**
I'm a mathematician above all. But I've spent more than 15 years as an educator learning about how students learn. In that time span, I was afforded the opportunity to coach and support teachers in the same capacity. As a former computer science major (who gave up too soon and changed to math), I stumbled back into coding. In June of 2024, I began collaborating with developers in a tight-knit community. This gave me the push to see the true potential in myself. Here I am ending 2025 still learning something new each day.

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

**Creative Lab: Sine/Cosine Interactive Module** — Completed (December 2025)

This project began as an idea I had after stepping up to teach a credentialed Web Development and Javascript course for high school students. The vision was to do what I was taught as a teacher: "begin with the end in mind." So, before I crafted the 12-day plan to apply for this role, I was actually planning to prepare students to do the same for any position/role they aspire to earn.

Built an interactive visualization where users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

- Users immediately engage with synchronized unit circle, wave graph, and pulsing glow visualization
- Pattern-matching challenge teaches amplitude and frequency through intuition (phase removed for depth over breadth)
- No front-loaded explanations—the interface teaches through invitation to tinker
- Built with React, React Three Fiber, GSAP, achieving 60fps mathematical animations
- Complete presentation wrapper: hero landing page, smooth transitions, celebration modal with three tabs, escape hatch navigation, resume and design process dialogs

---

## The Interactive Module

### One-Sentence Pitch

> Users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

### Origin Story

This project began as an idea I had after stepping up to teach a credentialed Web Development and Javascript course for high school students. The vision was to do what I was taught as a teacher: **"begin with the end in mind."** 

Before I started building this module, I was planning to prepare my Web Development students to do the same—build portfolio pieces that demonstrate their capabilities for any role they aspire to earn. The module itself became both the demonstration of my skills and the template for teaching students how to approach their own application portfolios.

This meta-learning approach—teaching by doing, then teaching others to do the same—reflects my core philosophy: the best way to understand something deeply is to build it, and the best way to teach it is to model the process transparently.

### Core Experience

**On Load:** User sees three synchronized elements:
1. **Unit Circle** — Point rotating, tracing the angle
2. **Wave Graph** — Sine wave unfurling in real-time, synced to circle
3. **Pulsing Glow** — Visual output showing the wave's rhythm as light intensity

Plus: **Target Glow** — A ghost pulse they need to match

No instructions. No text explanation. The interface teaches through invitation.

### User Journey

```
HERO LANDING (0-10 seconds)
├── See: Kinetic particle background with unit circle preview
├── Read: "15 years in math classrooms. 12 days learning R3F. This is what I built."
└── Action: Click "Enter the Module →"

OBSERVE STAGE (5 seconds)
├── See: Circle rotating, wave tracing in sync
├── Notice: Connector line linking circle dot to wave point
└── Insight: "The wave tracks the dot's height as it goes around"

AMPLITUDE STAGE (30-60 seconds)
├── Explore: "Make the wave taller" — discover amplitude slider
├── See: Circle radius scales with amplitude (visual connection)
├── Match: Reach A = 1.5 ± 0.1, earn celebration
├── Reflect: Answer prediction question ("If amplitude were 3...?")
└── Flash: Wave briefly shows A=3, confirming understanding

FREQUENCY STAGE (30-60 seconds)
├── Explore: "Make the wave faster" — discover frequency slider
├── Match: Reach f = 2.0 ± 0.15, earn celebration
├── Reflect: Answer prediction question ("How many waves when f=3?")
└── Flash: Wave briefly shows f=3, showing 3 complete cycles

CHALLENGE STAGE (60-120 seconds)
├── Diagnose: "This wave is different. What changed?" (Amplitude or Frequency)
├── Match: Adjust only the diagnosed parameter to match target
├── Feedback: Match percentage indicator (0-100%)
└── Succeed: 95% match triggers completion

REVEAL (The Earned Moment)
├── Celebration: Modal opens with three tabs
├── Discovery Tab: "You built: y = 1.5 sin(2t)" with discovered values
├── Behind This Tab: Pedagogical approach and technical build details
└── Go Deeper Tab: Full credentials, resume, design process, contact
```

### Stage Flow (v2 Implementation)

```
observe → amplitude → frequency → challenge → reveal
              │            │           │
          [explore]    [explore]   [diagnose]
              │            │           │
          [match]      [match]     [match]
              │            │
          [reflect]    [reflect]
```

**Key Changes from v1:**
- **Removed phase parameter** — Depth over breadth: two parameters fully understood beats three shallowly covered
- **Prediction questions** — Test understanding ("If amplitude were 3...?") rather than recall ("What value doubled...?")
- **Flash confirmation** — Visual reinforcement: correct answers trigger brief wave flash to predicted value
- **Circle radius scaling** — Unit circle radius scales with amplitude, strengthening visual connection
- **Two-step challenge** — Diagnose which parameter changed, then match (reduces frustration)

**Progress:** Continuous bar at top showing stage completion

### Visual Design Direction

**Aesthetic:** Clean, focused, Brilliant-aligned—NOT gaming-heavy

**Color Palette:**
- Background: Deep navy or off-black (#0a0a0f)
- Primary accent: Cyan/blue tones (cool theme, not Brilliant's pear yellow)
- Secondary: Soft white/cream for UI elements (`text-zinc-400`, `text-zinc-500`)
- Wave/circle: Gradient from cyan to magenta showing amplitude
- Target ghost: Semi-transparent cyan/blue version
- CTA buttons: Cyan fill (`bg-cyan-500`) with hover scale effects
- Particles: Cyan/blue tones with subtle glow

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

I've created a sine/cosine visualization where users discover the wave equation by matching a target motion. There's no front-loaded explanation. Users start on a hero page with a kinetic particle background, then enter the module to see a synchronized unit circle, wave graph, and pulsing glow—plus a ghost target they need to match. They drag sliders. Things move. *Oh, that's what amplitude does.* The circle grows with amplitude, reinforcing the connection. When they nail the match, the formula appears as a reward, not a prerequisite. The experience culminates in a celebration modal that reveals the pedagogical approach, technical build, and full credentials.

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

**Mathematician first, with 15+ years as an educator learning how students learn. Former computer science major who returned to coding in 2024 through collaboration with a tight-knit developer community. I design interactive learning experiences that treat formulas as destinations to be earned through discovery, not prerequisites to be memorized. Currently building AI-powered coaching tools for Louisiana educators and interactive mathematics modules that demonstrate pedagogical approaches aligned with modern learning science.**

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
**Completion:** ✅ 100% complete — All core functionality implemented and polished

**Implemented Features:**

**Core Module (v2):**
- ✅ All 4 stages (Observe → Amplitude → Frequency → Challenge → Reveal)
- ✅ Amplitude and frequency parameters (phase removed for pedagogical depth)
- ✅ Circle radius scaling with amplitude (visual connection)
- ✅ Prediction-based reflection questions (test understanding, not recall)
- ✅ Flash confirmation animations (wave flashes to predicted values)
- ✅ Two-step challenge (diagnose → match)
- ✅ All reusable components (ProgressBar, ExplorePrompt, QuestionCard, FeedbackBanner, CelebrationPulse, ParameterSlider)
- ✅ All domain-specific components (UnitCircle, SineWave, Connector, Scene)
- ✅ Formula preview showing building equation: `y = A sin(ft)`
- ✅ Smooth transitions and animations (GSAP)
- ✅ Celebration effects on match

**Presentation Wrapper:**
- ✅ Hero landing page with kinetic R3F particle background
- ✅ Vertical slide transition (hero → module)
- ✅ Celebration modal with three tabs:
  - Discovery Tab: Shows completed formula with discovered values
  - Behind This Tab: Pedagogical approach and technical build details
  - Go Deeper Tab: Full credentials, links to resume, design process, source code, contact
- ✅ Escape hatch navigation (top-left, visible in module view)
  - Back to Start
  - View Resume
  - Skip to End (opens celebration modal on "Go Deeper" tab)
- ✅ Resume dialog (full education, experience, skills, projects)
- ✅ Design Process dialog (timeline, pedagogical decisions, future extensions)

**Technical Polish:**
- ✅ Responsive design (mobile portrait, desktop landscape)
- ✅ 60fps animations (React Three Fiber)
- ✅ Performance optimizations (ref-based animation loops, geometry reuse)
- ✅ Smooth state transitions
- ✅ Accessible UI components (shadcn/ui)

### Application Materials Status

- ✅ Resume complete (accessible via celebration modal → Go Deeper → Resume)
- ✅ Cover letter complete
- ✅ Module deployed and fully functional
- ✅ Presentation wrapper complete (hero, transitions, celebration modal, dialogs)
- ✅ Design process documented (accessible via celebration modal → Go Deeper → Design Process)
- ✅ All application materials integrated into live demo

### Recent Updates (December 2025)

**v2 Module Refinement:**
- Removed phase parameter to focus on depth over breadth
- Replaced recall-based questions with prediction-based reflection questions
- Added flash confirmation animations for correct answers
- Implemented circle radius scaling with amplitude
- Streamlined challenge to two-step process (diagnose → match)

**Presentation Wrapper Implementation:**
- Built hero landing page with kinetic R3F background
- Implemented smooth vertical slide transition
- Created comprehensive celebration modal with three-tab structure
- Added escape hatch for time-constrained reviewers
- Integrated resume and design process dialogs

### On the Horizon

With the application deadline approaching (January 1, 2026), the focus is on:
- Final testing and bug fixes (if any)
- Ensuring optimal performance across devices
- Potential LinkedIn networking with Brilliant employees
- Preparing for potential follow-up conversations

The module and all application materials are production-ready and fully integrated into the live demo.

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
[User observes circle-to-wave connection]
[User explores amplitude, sees circle grow]
[User matches target, earns celebration]
[User answers prediction question, sees flash confirmation]
[User explores frequency, matches again]
[User diagnoses challenge wave, matches final target]
→ "You just built: y = 1.5 × sin(2t)"
→ The formula describes what they ALREADY understand
```

The formula becomes a **label for intuition**, not a **barrier to entry**.

### v2 Pedagogical Refinements

**Depth Over Breadth:**
- Removed phase parameter to focus on amplitude and frequency mastery
- Two parameters fully understood beats three parameters shallowly covered

**Prediction Over Recall:**
- Questions test understanding: "If amplitude were 3, how high would the wave peak?"
- Correct answers trigger flash confirmation: wave briefly shows predicted value
- Visual reinforcement strengthens mental models

**Visual Connections:**
- Circle radius scales with amplitude (strengthens amplitude concept)
- Connector line links circle dot to wave point (reinforces relationship)

**Reduced Frustration:**
- Challenge stage uses two-step process: diagnose which parameter changed, then match
- Single-parameter challenges prevent overwhelming multi-parameter adjustments

### Strategic Insights

1. **Replicate, Don't Redesign:** Decided to replicate Brilliant's established design system rather than showcase his own aesthetic, recognizing that as a Math Producer candidate, his value should be enhancing their existing framework with superior technical execution rather than proposing visual overhauls.

2. **One Polished Module:** Follows the principle that one polished module at 100% quality is better than multiple modules at 70% quality.

3. **Technical Advantage:** Leverages React Three Fiber for 60fps smooth animations that Brilliant's current React/SVG stack cannot match, particularly for unit circle to wave synchronization and real-time mathematical relationship visualization.

4. **Discovery Learning:** Emphasizes discovery learning through parameter manipulation and visual pattern matching.

5. **Presentation Wrapper:** Built comprehensive application wrapper recognizing that hiring managers need quick navigation. Hero landing page establishes context, escape hatch allows time-constrained reviewers to skip ahead, celebration modal provides depth without overwhelming the core experience.

### Teaching Philosophy: "Begin with the End in Mind"

This project embodies a core teaching principle: **begin with the end in mind.** 

The module itself serves dual purposes:
1. **Demonstration:** Shows what I can build as a Math Producer candidate
2. **Template:** Models the process I planned to teach high school students in my Web Development course

Before crafting the 12-day plan to apply for this role, I was actually planning to prepare students to do the same for any position/role they aspire to earn. The meta-learning approach—teaching by doing, then teaching others to do the same—reflects my core philosophy: the best way to understand something deeply is to build it, and the best way to teach it is to model the process transparently.

This philosophy extends to the module's design: users discover the wave equation by building it, not by being told what it is. The formula appears as a reward for understanding, not as a prerequisite for learning.

### The Journey Back to Code

As a former computer science major who gave up too soon and changed to math, I stumbled back into coding. In June of 2024, I began collaborating with developers in a tight-knit community. This gave me the push to see the true potential in myself. Here I am ending 2025 still learning something new each day.

This journey—from CS major to math teacher to developer—uniquely positions me to understand both the mathematical concepts and the technical challenges of building interactive learning experiences. I've spent 15+ years learning how students learn, and now I'm combining that pedagogical knowledge with technical skills to create experiences that actually work.

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
├── <SlideTransition>
│   ├── Hero View
│   │   ├── <Hero>
│   │   │   ├── <HeroBackground /> — R3F particles, unit circle preview
│   │   │   └── <HeroContent /> — Copy, CTA button
│   │   └── (onEnter → transition to module)
│   │
│   └── Module View
│       ├── <Module>
│       │   ├── <Scene> (R3F Canvas)
│       │   │   ├── <UnitCircle angle={angle} amplitude={A} />
│       │   │   ├── <SineWave angle={angle} amplitude={A} frequency={f} />
│       │   │   └── <Connector /> — Dashed line linking circle to wave
│       │   ├── <ControlPanel>
│       │   │   ├── <ParameterSlider label="Amplitude" ... />
│       │   │   └── <ParameterSlider label="Frequency" ... />
│       │   ├── <ProgressBar stage={stage} />
│       │   ├── <ExplorePrompt /> — Stage-specific prompts
│       │   ├── <QuestionCard /> — Prediction questions
│       │   ├── <FeedbackBanner /> — Correct/incorrect feedback
│       │   ├── <FormulaPreview /> — Building equation: y = A sin(ft)
│       │   └── <CelebrationPulse /> — Match celebration effect
│       │
│       └── <EscapeHatch /> — Navigation dropdown (top-left)
│
├── <CelebrationModal> — Triggered on module completion
│   ├── Discovery Tab — Completed formula, discovered values
│   ├── Behind This Tab — Pedagogy, tech stack, opportunity
│   └── Go Deeper Tab — Bio, links to resume, process, source, contact
│
├── <ResumeDialog /> — Full resume content
└── <ProcessDialog /> — Design process, timeline, decisions
```

### State Architecture

```typescript
// App-level state
const [view, setView] = useState<"hero" | "module">("hero")
const [showCelebration, setShowCelebration] = useState(false)
const [completedValues, setCompletedValues] = useState<{ a: number; f: number } | null>(null)

// Module state machine
type Stage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect' | 'freeExplore'
type ChallengePhase = 'observe' | 'diagnose' | 'match'

const [stage, setStage] = useState<Stage>('observe')
const [subStage, setSubStage] = useState<SubStage>('explore')
const [challengePhase, setChallengePhase] = useState<ChallengePhase>('diagnose')
const [challengeParam, setChallengeParam] = useState<'amplitude' | 'frequency'>('amplitude')

// Wave parameters (no phase in v2)
const [amplitude, setAmplitude] = useState(1.0)    // 0.5 - 2.0
const [frequency, setFrequency] = useState(1.0)     // 0.5 - 3.0

// Fixed educational targets
const STAGE_TARGETS = { amplitude: 1.5, frequency: 2.0 }

// Challenge wave (randomly differs by one parameter)
const [challengeWave, setChallengeWave] = useState({ a: 1.0, f: 2.0 })

// Animation (ref-based, not React state)
const angleRef = useRef(0)
const timeRef = useRef(0)

// Derived (computed each frame)
const currentValue = amplitude * Math.sin(frequency * time)
const matchScore = calculateProximity(amplitude, frequency, challengeWave)
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

**Last Updated:** January 1, 2026
**Status:** ✅ Application materials complete, module fully implemented (v2), presentation wrapper complete, ready for submission
