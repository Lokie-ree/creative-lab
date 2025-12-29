# Hero, Transition & Celebration Modal Decisions

> **Purpose:** Single source of truth for all UI/UX decisions made for the application wrapper around the sine/cosine module.
> 
> **Date:** December 28, 2025  
> **Status:** Decisions finalized, ready for implementation

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│                   HERO                       │
│         (full viewport, kinetic R3F)         │
│                                              │
│           Randall LaPoint, Jr.               │
│    Math Educator → Developer → Designer      │
│                                              │
│     15 years in math classrooms.             │
│     10 days learning R3F.                    │
│     This is what I built.                    │
│                                              │
│          [ Enter the Module → ]              │
└─────────────────────────────────────────────┘
                      ↓ (cinematic morph)
┌─────────────────────────────────────────────┐
│ [R] Randall LaPoint ▼                        │  ← Escape hatch (top-left)
│                                              │
│                  MODULE                      │
│         (full viewport, no chrome)           │
│                                              │
│   observe → amplitude → frequency → phase    │
│              → challenge → reveal            │
│                                              │
└─────────────────────────────────────────────┘
                      ↓ (95% match triggers)
┌─────────────────────────────────────────────┐
│          CELEBRATION MODAL                   │
│  ┌───────────┬────────────┬──────────┐      │
│  │ Discovery │ Behind This│ Go Deeper│      │
│  └───────────┴────────────┴──────────┘      │
│                                              │
│     [ Try Another Challenge ]                │
└─────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **No header/navigation** | Eliminates distraction during learning experience; celebration modal becomes the gateway to all depth content |
| **Full viewport states** | Hero and module each own the screen completely; respects focused attention |
| **Continuous R3F canvas** | Hero → module transition morphs elements rather than cutting; demonstrates R3F capability |
| **Escape hatch pattern** | Provides navigation for time-constrained reviewers without cluttering the UI |

---

## Hero Section

### Visual Direction: Bold/Kinetic (Concept B)

**Chosen over:** Elegant/Minimal (Concept A)

**Why:** The kinetic approach demonstrates R3F capability immediately. Particles, mouse interaction, and the pulsing unit circle preview signal technical skill before the reviewer even enters the module.

### Hero Animation Elements

| Element | Behavior |
|---------|----------|
| **Particles** | ~120 particles distributed across screen following sine wave path |
| **Mouse interaction** | Particles respond to cursor proximity (push/pull effect) |
| **Pulsing circle** | Central unit circle preview, subtle pulse animation |
| **Rotating point** | White dot traces the circle, hints at what's coming |
| **Particle connections** | Faint lines between nearby particles for depth |

### Hero Copy

```
Randall LaPoint, Jr.

Math Educator → Full-Stack Developer → Learning Designer

15 years in math classrooms.
10 days learning R3F.
This is what I built.

[ Enter the Module → ]
```

### Typography & Styling

| Element | Style |
|---------|-------|
| Name | `text-5xl md:text-6xl font-semibold text-white tracking-tight` |
| Title line | `text-lg md:text-xl text-zinc-400` with orange arrows between roles |
| Hook lines | `text-2xl md:text-3xl font-light` — zinc-500 → zinc-400 → orange-500 progression |
| CTA button | Filled orange (`bg-orange-500`), rounded-full, hover scale effect |

### Hero Interactions

- **CTA hover:** Scale up slightly, arrow translates right
- **Background:** Continuous 60fps animation regardless of interaction
- **No scroll:** Hero is full viewport, no content below

---

## Cinematic Transition

### Concept: Morphing Canvas

The hero and module share **one continuous R3F canvas**. When user clicks "Enter the Module," elements transform rather than cut.

### Transition Sequence (1.2 seconds)

| Time | What Happens |
|------|--------------|
| 0ms | User clicks CTA |
| 0-200ms | Text content fades out (CSS opacity) |
| 0-800ms | Particles converge from full-screen spread to right-side concentration |
| 0-800ms | Central circle moves from center to left position |
| 0-800ms | Circle radius grows from 60px to 100px |
| 600-1200ms | Control panel slides in from right |
| 800-1200ms | Connector line fades in (linking circle point to wave) |
| 1200ms | Transition complete, module state active |

### Easing

Use `easeInOutCubic` for smooth acceleration/deceleration:

```javascript
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
```

### Element Position Mapping

| Element | Hero State | Module State |
|---------|------------|--------------|
| Particles X | Spread across full width | Concentrated 35%-90% of width |
| Particles Y | Center with 80px amplitude | Center with 60px amplitude |
| Circle X | `50%` (center) | `18%` (left side) |
| Circle Y | `50%` | `50%` |
| Circle radius | 60px | 100px |
| Wave frequency | 0.008 | 0.015 |

### Implementation Notes

- Use `lerp()` function to interpolate all values based on transition progress
- Track transition start time with `useRef`, calculate progress each frame
- Don't use React state for animation values (causes re-renders)
- Progress indicator bar at bottom during transition (optional, aids perceived performance)

---

## Escape Hatch

### Purpose

Allow time-constrained reviewers to navigate without completing the module.

### Placement

Fixed position, top-left corner (`top-4 left-4`), z-index above module but below modals.

### Visibility

- **Hero:** Hidden (no need to escape, haven't started)
- **Module:** Visible
- **Celebration modal:** Hidden (modal provides navigation)

### Trigger Element

Subtle name badge:
```
[R] Randall LaPoint ▼
```

- Small avatar circle with "R" + name + dropdown chevron
- Default state: `bg-zinc-900/50 text-zinc-400` (very subtle)
- Hover state: `bg-zinc-800/50 text-zinc-300`
- Open state: `bg-zinc-800 text-white`

### Dropdown Menu Options

| Option | Action |
|--------|--------|
| **Back to Start** | Returns to hero state |
| **View Resume** | Opens Resume dialog |
| **Skip to End** | Opens celebration modal on "Go Deeper" tab |

### Skip to End Behavior

When user clicks "Skip to End":
1. Celebration modal opens
2. Default tab is "Go Deeper" (not "Discovery")
3. "Discovery" tab shows placeholder: "Complete the challenge to see your results"
4. User can still navigate to "Behind This" and "Go Deeper" tabs

---

## Celebration Modal

### Trigger

Module completion (95% match threshold reached).

### Structure

Three-tab modal with footer action.

### Tab 1: Your Discovery

**Purpose:** Show what the user accomplished (the student experience).

**Content:**
- Success icon + "You built the equation" heading
- "Through exploration, not explanation" subtext
- Formula display: `y = A × sin(ft + φ)` with discovered values highlighted in orange
- 3-column grid showing Amplitude, Frequency, Phase with values and labels

**If accessed via "Skip to End":**
- Show placeholder message: "Complete the challenge to see your results"
- Keep the tab structure visible so they understand what they're missing

### Tab 2: Behind This

**Purpose:** Explain the pedagogical and technical approach.

**Sections:**

1. **The Approach**
   - "Challenge-first learning" — Brilliant's core pedagogy
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

### Tab 3: Go Deeper

**Purpose:** Gateway to full credentials and contact.

**Content:**

1. **Mini bio header**
   - Avatar (gradient circle with "RL")
   - Name: Randall LaPoint, Jr.
   - One-liner: "15 years teaching math (middle school → high school). MS in Mathematics. Now building interactive learning tools."

2. **Link cards** (stacked, full-width)

   | Link | Description | Icon | External? |
   |------|-------------|------|-----------|
   | Resume | Education, experience, skills | Document | No (opens dialog) |
   | Design Process | How I approached this module | Lightbulb | No (opens dialog) |
   | Source Code | GitHub repository | GitHub logo | Yes (new tab) |
   | Get in Touch | rplapointjr@gmail.com | Email | Yes (mailto) |

### Footer Action

```
[ Try Another Challenge ]
```

- Full-width orange button
- Regenerates target values, returns to challenge stage
- Provides replay value / demonstrates robustness

### Modal Styling

- Max width: `max-w-lg` (512px)
- Background: `bg-zinc-900`
- Border: `border border-zinc-800`
- Top accent: 1px gradient bar (`from-orange-500 via-amber-400 to-orange-500`)
- Backdrop: `bg-black/60 backdrop-blur-sm`

---

## Dialog Components

### Shared Dialog Shell

Both Resume and Design Process use identical chrome:

- Header with title + close button
- Scrollable content area
- Max width: `max-w-2xl` (672px)
- Max height: `max-h-[85vh]`
- Same backdrop treatment as celebration modal

### Resume Dialog

**Sections:**

1. **Header/Identity**
   - Name (centered, large)
   - Title line in orange
   - Contact info (email, phone)

2. **Education**
   - Three degrees with institutions and years
   - Clean two-column layout (degree/school on left, year on right)

3. **Experience**
   - Three positions with bullets
   - Emphasize teaching → mentoring → tech facilitation progression

4. **Technical Skills**
   - Tag/badge layout
   - TypeScript, React, Next.js, R3F, Three.js, GSAP, Tailwind, Node.js, Convex, Vercel

5. **Interactive Projects**
   - Pelican AI (brief description)
   - Sine/Cosine Module (brief description)

### Design Process Dialog

**Sections:**

1. **The Challenge**
   - What Brilliant asked for
   - 10-day timeline constraint

2. **The Opportunity** (highlighted box)
   - Gap in Brilliant's Advanced Math
   - Trigonometry buried in Calculus

3. **The Timeline**
   - Days 1-2: Research & Architecture
   - Days 3-5: Core Visualization
   - Days 6-8: Stage Flow & Feedback
   - Days 9-10: Polish & Application Wrapper

4. **Pedagogical Decisions**
   - Challenge-First
   - No Wrong Answers
   - Progressive Parameter Reveal

5. **What I'd Do Next**
   - Signal Lab unification
   - Sin → cos relationship
   - Decode transmission mechanic
   - Fourier extension

---

## Implementation Priority

### Must Have (Days 1-2)

1. Hero with kinetic R3F animation
2. Basic hero → module transition (can be simpler than full morph)
3. Celebration modal with all three tabs
4. Resume and Design Process dialogs with content

### Should Have (Day 3)

5. Escape hatch component
6. Skip to End functionality
7. Cinematic transition polish

### Nice to Have (Day 4 if time)

8. Mouse interaction on hero particles
9. Particle connection lines
10. Transition progress indicator

---

## File Structure

```
src/
├── components/
│   ├── hero/
│   │   └── Hero.tsx              # Full hero with R3F canvas
│   ├── layout/
│   │   └── EscapeHatch.tsx       # Name badge dropdown
│   ├── modals/
│   │   ├── CelebrationModal.tsx  # 3-tab completion modal
│   │   ├── ResumeDialog.tsx      # Resume content
│   │   └── ProcessDialog.tsx     # Design process content
│   └── transitions/
│       └── HeroToModule.tsx      # Transition orchestration (or integrated into Hero)
```

---

## Reference Artifacts

The following concept files were created during planning:

| File | Description |
|------|-------------|
| `hero-concept-a.jsx` | Elegant/minimal direction (not chosen) |
| `hero-concept-b.jsx` | Bold/kinetic direction (chosen) |
| `cinematic-transition.jsx` | Morph animation concept |
| `escape-hatch.jsx` | Name badge dropdown |
| `celebration-modal-v2.jsx` | 3-tab modal with Go Deeper framing |
| `dialog-concepts.jsx` | Resume + Design Process dialogs |

---

## Open Questions (Resolved)

| Question | Decision |
|----------|----------|
| Header navigation? | **No header** — modal handles all navigation |
| Skip to End behavior? | Opens modal on **Go Deeper tab**, Discovery shows placeholder |
| Transition style? | **Cinematic morph** — continuous canvas |
| Hero direction? | **Bold/kinetic** — particles, interaction, energy |
| Celebration tab names? | **Your Discovery / Behind This / Go Deeper** |

---

**Last Updated:** December 28, 2025