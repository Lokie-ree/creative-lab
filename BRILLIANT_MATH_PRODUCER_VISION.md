# Brilliant Math Producer Application: Complete Vision

> **Purpose:** Single source of truth for the 12-day sprint. This document powers the cover letter, resume tailoring, and interactive module development.

---

## The Opportunity

**Role:** Math Producer at Brilliant  
**Application Deadline:** January 1, 2026  
**Primary Deliverable:** Interactive demonstration of teaching mathematical concepts online

**What Brilliant Wants:**
- Design interactive learning games teaching math from foundational logic to calculus
- Teach mathematical thinking creatively
- Brainstorm new interactive experiences bringing problem-solving to life
- Use pedagogical instincts to achieve best outcomes for learners

**The Differentiator:**
> "To be considered for this role, please include your best example(s) of how you've taught mathematical concepts interactively online."

---

## Candidate Profile: Randall LaPoint, Jr.

### Why This Role Fits

| Requirement | Evidence |
|-------------|----------|
| "Undergraduate degree or above in STEM field" | MS Mathematics (Nicholls State, 2013) |
| "Strong grounding through research or teaching that extends beyond traditional math curricula" | 10+ years classroom teaching (6-12), mentor teacher, 504 coordinator, technology facilitator |
| "Knack for teaching complex topics using clear, simple, hands-on steps" | Career built on making math accessible; pioneered technology integration in classroom |
| "Experience with building or using interactivity to motivate learners" | Full-stack developer; built custom web applications for learning contexts |
| "Way with words when communicating challenging concepts" | Mentor teacher role; trained colleagues on instructional best practices |
| "Great at context switching and prioritizing across large workload" | Juggled teaching, technology coordination, mentoring, and development simultaneously |
| "Openness to change and willingness to experiment" | Pivoted from traditional teaching to EdTech exploration; self-taught developer |

### The Unique Angle

Most candidates will be either:
- **Math people who can write** (traditional educators)
- **Tech people who understand learning** (instructional designers)

Randall is rare: **A mathematician who teaches, codes, AND thinks pedagogically about interactive design.**

The module demonstrates this trifecta by:
1. Showing deep understanding of sine/cosine relationships (math expertise)
2. Building a polished, responsive interactive experience (technical execution)
3. Structuring the experience around discovery, not explanation (pedagogical design)

---

## The Module: "Pattern Match"

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

**The Pulsing Glow:**
- Central glowing orb/ring
- Intensity = current sine value (mapped from -1 to 1 → dim to bright)
- Smooth breathing effect
- Clear visual distinction between "yours" and "target"

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

### Animation Pattern

```typescript
// Inside R3F component
useFrame((state, delta) => {
  timeRef.current += delta;
  
  // Update angle for circle rotation
  angleRef.current = (timeRef.current * frequency) % (2 * Math.PI);
  
  // Update positions directly (no setState)
  circlePointRef.current.position.x = Math.cos(angleRef.current);
  circlePointRef.current.position.y = Math.sin(angleRef.current);
  
  // Update glow intensity
  const sineValue = amplitude * Math.sin(frequency * timeRef.current + phase);
  glowMaterialRef.current.opacity = mapRange(sineValue, -amplitude, amplitude, 0.2, 1.0);
});
```

### Performance Guardrails

- Never `setState` inside `useFrame`
- Reuse geometries/materials via `useMemo`
- Limit wave trail to ~200 points
- Use `dpr={[1, 1.5]}` for mobile
- Pre-allocate vectors, reuse via `.set()`

---

## Pedagogical Foundation

### Brilliant's Core Philosophy (Applied)

**"We don't teach how to do something before asking questions."**
→ Module opens with a challenge (match the motion), not an explanation

**"Let the learner try to find a solution before learning the procedure."**
→ Users manipulate sliders to discover relationships; formula appears after success

**"Lessons build intuition with visual explanations and hands-on manipulation first, then introduce formal procedures."**
→ The visualization IS the explanation; the equation is the capstone, not the foundation

**"The difference between a good student and a great student is that great students continually fail."**
→ "Getting closer" feedback celebrates progress, not just success; no punishing wrong answers

### The "Earned Reveal" Mechanic

Traditional approach:
```
Here's the formula: y = A × sin(ωt + φ)
A is amplitude, ω is frequency, φ is phase.
Now try changing the values...
```

This module's approach:
```
[User manipulates sliders]
[User notices patterns]
[User matches target]
→ "You just built: y = 1.5 × sin(2.0t + π/4)"
→ The formula describes what they ALREADY understand
```

The formula becomes a **label for intuition**, not a **barrier to entry**.

### "Getting Closer" Feedback

Instead of binary right/wrong:
- Match indicator shows proximity (0-100%)
- Color shifts from cool → warm as match improves
- No "wrong" state—everything is exploration
- Success is the end of a gradient, not a sudden gate

---

## 12-Day Execution Plan

### Phase 1: Foundation (Days 1-3)
**Goal:** Working visualization with synced elements

- Day 1: Project scaffold, R3F canvas, basic shapes
- Day 2: Unit circle rotation, wave tracing, sync logic
- Day 3: Pulsing glow effect, target glow, visual polish

**Checkpoint:** Circle, wave, and glows animate in sync

### Phase 2: Interaction (Days 4-6)
**Goal:** Full parameter control and challenge layer

- Day 4: Parameter sliders (shadcn), state wiring
- Day 5: Match scoring logic, proximity feedback
- Day 6: Formula reveal component, transition animations

**Checkpoint:** Complete interaction loop works end-to-end

### Phase 3: Polish (Days 7-9)
**Goal:** Production-quality feel

- Day 7: Visual design refinement, color/typography
- Day 8: Responsive layout, touch interactions
- Day 9: Performance optimization, loading states

**Checkpoint:** Module feels professional, not prototype-y

### Phase 4: Launch (Days 10-12)
**Goal:** Application ready

- Day 10: Landing page wrapper, deployment
- Day 11: Resume tailoring, cover letter drafting
- Day 12: Final review, submit application

**Checkpoint:** Everything submitted before midnight Jan 1

---

## Application Materials

### Cover Letter Angle

Not: "I want to work at Brilliant because learning is important."

Instead: 
> "I've spent a decade watching students hit walls on trigonometry—not because the math is hard, but because we teach the formula before the intuition. The module I've built inverts that: users discover the wave equation by matching motions, and the formula appears as a reward for understanding they've already built. This is how I believe mathematical concepts should be taught online."

Key beats:
1. Teaching experience gives you pattern recognition for where students struggle
2. Technical skills let you prototype solutions, not just imagine them
3. The module IS the argument—shows rather than tells

### Resume Emphasis

**Lead with education:** MS Mathematics positions you as credentialed
**Emphasize technology facilitation:** Shows you understand EdTech context
**Full-stack development:** Proves you can ship, not just design
**Mentor teacher role:** Evidence of pedagogical leadership

---

## Success Criteria

The module succeeds if:

- [ ] A hiring manager can understand it in 30 seconds without reading instructions
- [ ] Someone learns something about sine waves by playing with it for 2 minutes
- [ ] The formula reveal feels earned, not dumped
- [ ] It runs smoothly on mobile and desktop
- [ ] It signals: "This person thinks about learning, not just interfaces"

---

## Links & Resources

**Job Posting:** https://jobs.lever.co/brilliant/b0b97281-179b-4b47-b5d6-a0cfaad3f425

**Technical References:**
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber
- drei helpers: https://github.com/pmndrs/drei
- shadcn/ui: https://ui.shadcn.com
- GSAP: https://gsap.com/docs/v3/

**Brilliant Design References:**
- Brilliant brand refresh: https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486
- ustwo x Brilliant: https://ustwo.com/work/brilliant/
- Rive animations at Brilliant: https://www.rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations
