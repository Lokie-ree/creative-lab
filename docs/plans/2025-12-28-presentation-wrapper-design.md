# Presentation Wrapper Design

> **Purpose:** Design spec for hero, transitions, escape hatch, celebration modal, and dialogs wrapping the sine/cosine module.
>
> **Date:** December 28, 2025
> **Status:** Ready for implementation

---

## Architecture Overview

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    HERO     │ ───► │   MODULE    │ ───► │ CELEBRATION │
│  (landing)  │      │  (learning) │      │   (modal)   │
└─────────────┘      └─────────────┘      └─────────────┘
     ▲                     │                    │
     └─────────────────────┴────────────────────┘
                    (can return)
```

**State transitions:**
- **Hero → Module:** CTA click triggers vertical slide (hero up, module up from below)
- **Module → Celebration:** 95% match in challenge triggers modal overlay
- **Celebration → Hero:** "Back to Start" returns to hero
- **Celebration → Module:** "Try Another Challenge" regenerates targets

**Key decisions:**
- Hero and module are **separate canvases** (not shared R3F context)
- Transition is **vertical slide** (~1s) — progressing "into" something
- **No header/navigation** — celebration modal is the gateway to all depth content

---

## Hero Section

### Layout

Full viewport, dark background, centered content with kinetic R3F canvas as background.

### R3F Background Elements

| Element | Behavior |
|---------|----------|
| Particles | ~120 particles distributed across screen following sine wave paths |
| Mouse interaction | Particles respond to cursor proximity (push/pull effect) |
| Pulsing circle | Central unit circle preview, subtle pulse animation |
| Rotating point | White/cyan dot traces the circle, hints at what's coming |

### Copy

```
Randall LaPoint, Jr.

Math Educator → Full-Stack Developer → Learning Designer

15 years in math classrooms.
10 days learning R3F.
This is what I built.

[ Enter the Module → ]
```

### Color Scheme (Cool/Blue)

| Element | Color |
|---------|-------|
| Background | Deep navy/black (`#0a0a0f`) |
| Name | White |
| Role line | `text-zinc-400` with cyan arrows between roles |
| Hook lines | `text-zinc-500` → `text-zinc-400` → cyan progression |
| CTA button | Cyan fill (`bg-cyan-500`), hover scale effect |
| Particles | Cyan/blue tones with subtle glow |
| Pulsing circle | Cyan outline |

### Typography

| Element | Classes |
|---------|---------|
| Name | `text-5xl md:text-6xl font-semibold text-white tracking-tight` |
| Role line | `text-lg md:text-xl text-zinc-400` |
| Hook lines | `text-2xl md:text-3xl font-light` |
| CTA | `rounded-full`, filled cyan, hover scale |

---

## Transition: Hero → Module

### Style

Vertical slide — hero slides up and out, module slides up from below.

### Timing

~1 second total

### Sequence

| Time | What Happens |
|------|--------------|
| 0ms | User clicks CTA |
| 0-400ms | Hero slides up, fading slightly |
| 200-1000ms | Module slides up from below |
| 1000ms | Transition complete, module active |

### Easing

Use `easeInOutCubic` or similar smooth curve.

---

## Escape Hatch

### Purpose

Allow time-constrained reviewers to navigate without completing the module.

### Placement

Fixed top-left (`top-4 left-4`), z-index above module but below modals.

### Visibility

- **Hero:** Hidden
- **Module:** Visible
- **Celebration modal:** Hidden (modal provides navigation)

### Trigger Element

```
[R] Randall LaPoint ▼
```

Avatar circle with initial + name + dropdown chevron.

### Styling

| State | Classes |
|-------|---------|
| Default | `bg-zinc-900/50 text-zinc-400` |
| Hover | `bg-zinc-800/50 text-zinc-300` |
| Open | `bg-zinc-800 text-white` |

### Dropdown Options

| Option | Action |
|--------|--------|
| Back to Start | Returns to hero state |
| View Resume | Opens Resume dialog |
| Skip to End | Opens celebration modal on "Go Deeper" tab |

### Skip to End Behavior

- Celebration modal opens on "Go Deeper" tab (not Discovery)
- Discovery tab shows placeholder: "Complete the challenge to see your results"

---

## Celebration Modal

### Trigger

Module completion (95% match threshold in challenge stage).

### Styling

| Property | Value |
|----------|-------|
| Max width | `max-w-lg` (512px) |
| Background | `bg-zinc-900` |
| Border | `border border-zinc-800` |
| Backdrop | `bg-black/60 backdrop-blur-sm` |

### Tab Structure

Three tabs: **Your Discovery** | **Behind This** | **Go Deeper**

---

### Tab 1: Your Discovery

Shows what the user accomplished.

**Content:**
- Success icon + "You built the equation" heading
- "Through exploration, not explanation" subtext
- Formula display: `y = A × sin(ft + φ)` with discovered values highlighted
- 3-column grid: Amplitude, Frequency, Phase with values and labels

**If accessed via Skip to End:**
- Show placeholder: "Complete the challenge to see your results"

---

### Tab 2: Behind This

Explains the pedagogical and technical approach.

**Sections:**

1. **The Approach**
   - Challenge-first learning — Brilliant's core pedagogy
   - Manipulate → discover patterns → earn the formula
   - Equation as label for intuition, not prerequisite

2. **The Build**
   - Tech stack badges: React Three Fiber, TypeScript, GSAP, shadcn/ui
   - "First R3F project — built in 10 days while learning the library"
   - Key features: 60fps animation, unit circle → wave connection, progressive discovery

3. **The Opportunity**
   - Brilliant's gap: No standalone Trigonometry
   - "Sine and Cosine" buried in Calculus Level 8
   - Module prototypes a dedicated Periodic Functions course

---

### Tab 3: Go Deeper

Gateway to full credentials and contact.

**Content:**

1. **Mini bio header**
   - Avatar (gradient circle with "RL")
   - Name: Randall LaPoint, Jr.
   - One-liner: "15 years teaching math. MS in Mathematics. Now building interactive learning tools."

2. **Link cards** (stacked, full-width)

| Link | Description | External? |
|------|-------------|-----------|
| Resume | Education, experience, skills | No (opens dialog) |
| Design Process | How I approached this module | No (opens dialog) |
| Source Code | GitHub repository | Yes (new tab) |
| Get in Touch | rplapointjr@gmail.com | Yes (mailto) |

---

### Footer Action

```
[ Try Another Challenge ]
```

Full-width button, regenerates target values, returns to challenge stage.

---

## Resume Dialog

### Shell

| Property | Value |
|----------|-------|
| Max width | `max-w-2xl` (672px) |
| Max height | `max-h-[85vh]` |
| Content | Scrollable |

### Sections

**1. Header**
- Name (centered, large)
- Title: "Math Educator • Full-Stack Developer • Learning Designer"
- Contact: rplapointjr@gmail.com • (985) 518-9129

**2. Education**

| Degree | Institution | Year |
|--------|-------------|------|
| M.Ed. Educational Leadership | American College of Education | 2016 |
| M.S. Mathematics | Nicholls State University | 2013 |
| B.S. Mathematics | Nicholls State University | 2010 |

**3. Experience**

| Position | Organization | Years |
|----------|--------------|-------|
| Math Teacher & Technology Facilitator | Iberville Virtual Learning Academy | 2024–Present |
| 504 Coordinator & STEM Teacher | Crescent Elementary School | 2023–2024 |
| Mentor Teacher | White Castle High School | 2019–2023 |
| Mathematics Teacher | Vandebilt Catholic High School | 2010–2019 |

Each position includes 2-3 bullet points from MASTER.md.

**4. Technical Skills**

Tag/badge layout:
- TypeScript, React, Next.js, R3F, Three.js, GSAP, Tailwind
- Node.js, Convex, Vercel, GitHub

**5. Projects**

- **Pelican AI** — AI coaching platform for Louisiana educators
- **Sine/Cosine Module** — Interactive discovery-based learning

---

## Design Process Dialog

### Shell

Same as Resume dialog.

### Sections

**1. The Challenge**
- What Brilliant asked for in the application
- 10-day timeline constraint

**2. The Opportunity** (highlighted box)
- Gap in Brilliant's Advanced Math
- Trigonometry buried in Calculus track
- Module as prototype for Periodic Functions course

**3. The Timeline**

| Days | Focus |
|------|-------|
| 1-2 | Research & Architecture |
| 3-5 | Core Visualization (R3F, unit circle, wave) |
| 6-8 | Stage Flow & Feedback |
| 9-10 | Polish & Application Wrapper |

**4. Pedagogical Decisions**
- Challenge-First: No explanations before exploration
- No Wrong Answers: "Learning moments" instead of errors
- Progressive Reveal: One parameter at a time, formula builds

**5. What I'd Do Next**
- Signal Lab unification (multiple signal types)
- Sin → cos relationship exploration
- Decode transmission mechanic
- Fourier extension for advanced learners

---

## File Structure

```
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx              # Full hero with R3F canvas
│   │   ├── HeroCanvas.tsx        # R3F particles and circle
│   │   └── HeroContent.tsx       # Text content and CTA
│   ├── layout/
│   │   └── EscapeHatch.tsx       # Name badge dropdown
│   ├── celebration/
│   │   ├── CelebrationModal.tsx  # 3-tab modal shell
│   │   ├── DiscoveryTab.tsx      # Tab 1 content
│   │   ├── BehindThisTab.tsx     # Tab 2 content
│   │   └── GoDeeper.tsx          # Tab 3 content
│   ├── dialogs/
│   │   ├── ResumeDialog.tsx      # Resume content
│   │   └── ProcessDialog.tsx     # Design process content
│   └── transitions/
│       └── SlideTransition.tsx   # Hero ↔ Module transition
```

---

## Implementation Priority

### Must Have (Core functionality)

1. Hero with kinetic R3F animation
2. Hero → module slide transition
3. Celebration modal with 3 tabs
4. Resume dialog with full content
5. Design Process dialog with full content

### Should Have (Complete experience)

6. Escape hatch component
7. Skip to End functionality
8. Try Another Challenge functionality

### Nice to Have (Polish)

9. Mouse interaction on hero particles
10. Particle connection lines
11. Transition progress indicator

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Shared R3F canvas? | **No** — separate canvases, simpler approach |
| Transition style? | **Vertical slide** — hero up, module from below |
| Hero color direction? | **Cool/blue** — cyan accents, matches personal preference |
| Module color change? | **Decide later** — see hero in blue first, then evaluate |

---

**Last Updated:** December 28, 2025
