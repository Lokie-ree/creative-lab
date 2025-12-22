# Pattern Match: 12-Day Quick Start

> **Deadline:** January 1, 2026  
> **Goal:** Ship an interactive module that gets you hired as a Math Producer at Brilliant

---

## The Pitch (Memorize This)

**One sentence:** Users discover the wave equation by matching a target motion—formula appears as reward, not prerequisite.

**The differentiator:** You're not just a math person who can code. You're a math *teacher* who's thought deeply about why students struggle with trig—and built something that fixes it.

---

## Non-Negotiables

These are the rails. If you're drifting, come back here.

| Principle | What It Means |
|-----------|---------------|
| **Challenge first** | User sees the puzzle before any explanation |
| **Earned reveal** | Formula appears AFTER match, not before |
| **No wrong answers** | Every state is exploration; "incorrect" = "not yet" |
| **Immediate feedback** | Every slider move shows instant visual change |
| **Brilliant aesthetic** | Clean, focused, not gaming-heavy |

---

## Module 1: Pattern Match (Primary)

**Must ship by Day 8.** This is your application centerpiece.

### Core Components
```
<Canvas>
  ├── <UnitCircle />      — Point rotating, radius line
  ├── <SineWave />        — Trail unfurling in sync
  ├── <PulsingGlow />     — Your motion (bright)
  └── <TargetGlow />      — Ghost motion to match
</Canvas>
<ControlPanel>
  ├── Amplitude slider    — 0.1 to 2.0
  ├── Frequency slider    — 0.5 to 3.0
  └── Phase slider        — 0 to 2π
</ControlPanel>
<MatchIndicator />        — Proximity percentage
<FormulaReveal />         — Appears on match
```

### User Journey
1. **See:** Circle spinning, wave drawing, glow pulsing, ghost pulsing differently
2. **Tinker:** Drag sliders, watch everything respond
3. **Match:** Align your glow with the ghost
4. **Earn:** Formula appears with YOUR values highlighted

### Match Logic
```typescript
const score = calculateMatchScore(user, target);
if (score >= 95) triggerReveal();
```

---

## If Time Permits: Module 2+

Only after Module 1 is *polished*. Ideas ranked by impact:

1. **Wave Interference** — Two sine waves combine (builds on Module 1)
2. **Fourier Toy** — Build complex waves from simple ones
3. **Parametric Curves** — Lissajous figures from x=sin, y=cos
4. **Spiral of Theodorus** — Geometric construction of √n

**Rule:** A second module at 70% quality hurts you. One module at 100% quality wins.

---

## Daily Checkpoints

### Phase 1: Core (Days 1-3)
- [ ] Day 1: Canvas renders, shapes visible, animation loop running
- [ ] Day 2: Unit circle + wave synced, parameters wired
- [ ] Day 3: Pulsing glows working, target visible

### Phase 2: Interaction (Days 4-6)
- [ ] Day 4: Sliders control all parameters, instant response
- [ ] Day 5: Match scoring implemented, proximity feedback visible
- [ ] Day 6: Formula reveal triggers on match, animation smooth

### Phase 3: Polish (Days 7-9)
- [ ] Day 7: Visual design refined (colors, typography, spacing)
- [ ] Day 8: Responsive layout, touch-friendly, mobile tested
- [ ] Day 9: Performance verified (60fps), loading states clean

### Phase 4: Ship (Days 10-12)
- [ ] Day 10: Landing page wrapper, deployed to Vercel
- [ ] Day 11: Resume + cover letter finalized
- [ ] Day 12: Final review, submit application

---

## Tech Reminders

**Animation pattern:**
```typescript
useFrame((state, delta) => {
  timeRef.current += delta;
  // Mutate refs directly, never setState here
});
```

**State split:**
- `useState` → Parameters user controls (triggers re-render)
- `useRef` → Animation values (no re-render)

**Performance killers:**
- `setState` inside `useFrame`
- Creating new geometries/materials every frame
- Unlimited wave trail points (cap at ~200)

---

## When You're Stuck

1. **Technically stuck?** Check the `sine-cosine-module` skill
2. **Design decision?** Check the `brilliant-pedagogy` skill
3. **Losing the thread?** Re-read the one-sentence pitch at the top
4. **Scope creeping?** Ask: "Does this help me get hired?"

---

## The Bar

Before submitting, verify:

- [ ] A hiring manager understands it in 30 seconds without instructions
- [ ] Someone learns about sine waves by playing for 2 minutes
- [ ] The formula reveal feels *earned*
- [ ] It runs smoothly on phone and desktop
- [ ] It signals: "This person thinks about learning, not just interfaces"

---

## Links

- **Job posting:** https://jobs.lever.co/brilliant/b0b97281-179b-4b47-b5d6-a0cfaad3f425
- **R3F docs:** https://docs.pmnd.rs/react-three-fiber
- **drei:** https://github.com/pmndrs/drei
- **shadcn:** https://ui.shadcn.com

---

*Ship it. Get hired. Teach millions.*
