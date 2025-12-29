# Signal Lab: Design Spec

> **STATUS: FUTURE VISION** — This document captures a compelling redesign direction explored during development. The current implementation follows the staged approach documented in MASTER.md. This spec is preserved for future iteration.

> Students discover that circular motion and wave motion are the same phenomenon by tuning an oscillator to decode radio transmissions.

## Vision

**One sentence:** Students should *see* that a spinning point and a wave are the same motion, through an experience where tuning a signal to decode a message makes that relationship viscerally obvious.

**Core insight:** The circle isn't a teaching diagram — it's the engine that generates the wave. Students manipulate it, watch the wave respond, and internalize the connection through use.

---

## Core Concept

**Signal Lab: Tune Your Oscillator**

You're operating a radio receiver. Transmissions come in as wave patterns. Your receiver has an oscillator — a spinning mechanism that generates waves. To decode a transmission, your oscillator's wave must match the incoming signal exactly.

### The Core Loop

1. See the incoming transmission (ghost wave)
2. Adjust your oscillator's properties (amplitude, frequency, phase)
3. Watch your oscillator's output wave change in response
4. When your wave matches the transmission → signal locks → message revealed

### Why This Teaches the Concept

- The circle isn't decoration — it's the engine driving your wave
- Students manipulate the circle's properties and *see* the wave change
- The connection between rotation and wave becomes intuitive through use
- "One full rotation = one wave period" emerges naturally from watching the sync

### What's Different from Previous Implementation

| Previous | Signal Lab |
|----------|------------|
| 6 fragmented stages | Single unified screen |
| Circle as teaching aid | Circle as functional oscillator |
| Staged parameter isolation | All parameters available; difficulty via targets |
| Quiz questions interrupting flow | Matching IS the learning |
| Formula reveal as reward | Message decode as reward |

---

## Visual Design: The Unified System

The circle and wave must feel like one machine, not two diagrams.

### Layout: Horizontal Alignment

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│      YOUR OSCILLATOR                    YOUR OUTPUT                 │
│      ┌─────────┐                                                    │
│     ╱           ╲           ●━━━━━━━━━━━━━━╸                        │
│    │      ●──────────────────────/────────\                         │
│    │      │      │              /          \        ┈┈┈┈┈┈┈         │
│  ──┼──────┼──────┼─────────────/────────────\──────/───────\────    │
│    │      │      │                           \    /         \       │
│    │      ↓      │                            \──/           ┈┈     │
│     ╲    (y)    ╱                                                   │
│      └─────────┘                         INCOMING TRANSMISSION      │
│                                          (ghost wave)               │
└─────────────────────────────────────────────────────────────────────┘
```

### Visual Principles

| Element | Design Choice | Why |
|---------|---------------|-----|
| Shared y-axis | Circle center and wave centerline are the same horizontal line | Shows y-value is literally the same |
| Horizontal connector | Dashed line from circle point to wave point | Makes the projection viscerally obvious |
| Circle scales with amplitude | Bigger A = bigger circle = taller wave | Direct visual causation |
| Traveling point | Dot moves along wave synchronized with rotation | "One revolution = one period" becomes visible |
| Ghost wave | Lower opacity, slightly different color | Clear target without clutter |

---

## The Three "Aha" Connections

Each parameter has its own visual cause-and-effect that students discover through manipulation:

### Amplitude — "Bigger circle = taller wave"

- Circle radius scales with amplitude
- When A=2, the circle is twice as big, so the point travels twice as far from center
- The wave height follows directly — same y-value, just larger range
- *Students see:* Drag amplitude up → circle grows → wave gets taller

### Frequency — "Faster spin = tighter waves"

- Frequency controls rotation speed
- When f=2, the point completes two full rotations in the same time it used to complete one
- More rotations = more wave cycles in the same horizontal space
- *Students see:* Drag frequency up → circle spins faster → wave bunches together

### Phase — "Where you start on the circle = where the wave starts"

- Phase rotates the starting position of the point on the circle
- At φ=0, point starts at 3 o'clock (y=0), wave starts at zero
- At φ=π/2, point starts at 12 o'clock (y=max), wave starts at peak
- *Students see:* Drag phase → point jumps to new starting position → wave shifts horizontally

### The Unified Insight

The circle isn't three separate controls bolted together. It's one rotating point whose position, speed, and starting angle fully determine the wave. Students discover this by tuning — not by being told.

---

## Progression: The Transmission Sequence

Instead of staged isolation (amplitude → frequency → phase), difficulty comes from what the target requires.

### Transmission Structure

```typescript
interface Transmission {
  id: string
  target: { amplitude: number; frequency: number; phase: number }
  message: string           // The reward
  tolerance: number         // How precise the match must be
  startingHint?: string     // Optional nudge after extended struggle
}
```

### Difficulty Curve

| Level | What's "Off" | Target | Message | Why This Order |
|-------|--------------|--------|---------|----------------|
| 1 | Amplitude only | A=1.5, f=1, φ=0 | "HELLO" | Easiest to see — circle size |
| 2 | Frequency only | A=1, f=2, φ=0 | "WAVES" | Next most visible — compression |
| 3 | Phase only | A=1, f=1, φ=π/2 | "SHIFT" | Subtler — horizontal movement |
| 4 | Two params | A=1.5, f=1.5, φ=0 | "TUNING IN" | Combines learnings |
| 5 | Two params | A=1, f=2, φ=π/4 | "ALMOST THERE" | Includes phase |
| 6 | All three | A=1.5, f=2, φ=π/2 | "SIGNAL LOCKED" | Full challenge |
| 7 | Tighter tolerance | A=1.25, f=1.5, φ=π/4 | "LOUD AND CLEAR" | Precision test |

### Design Choices

- **No parameter locking** — All sliders always available. Early transmissions just happen to only need one adjustment.
- **Implicit scaffolding** — Level 1 starts at A=1, f=1, φ=0 with a target of A=1.5. Students naturally discover amplitude first because it's the only thing off.
- **No wrong answers** — You're just not tuned yet. Continuous feedback, not pass/fail.
- **Baseline start** — Each transmission resets to A=1, f=1, φ=0 (or slight random offset for variety).

---

## Feedback & Reward: Signal Clarity

The experience needs continuous feedback and a satisfying payoff.

### Signal Clarity Meter

A visual indicator showing how close the match is — framed as signal strength, not "score."

```
┌──────────────────────────────────┐
│  SIGNAL  ▰▰▰▰▰▰▰▱▱▱  72%        │
└──────────────────────────────────┘
```

| Match % | Visual State | Feel |
|---------|--------------|------|
| 0–30% | Weak signal, heavy static | "I'm way off" |
| 30–60% | Partial signal, flickering | "Getting somewhere" |
| 60–90% | Strong signal, nearly clear | "Almost there" |
| 90–100% | Locked signal | "Got it" |

### Message Reveal

The decoded message isn't hidden then shown — it *resolves* as clarity improves:

```
0%:   ▓▓▓▓▓          (fully obscured)
40%:  ▓E▓▓O          (fragments visible)
75%:  HE▓LO          (almost readable)
100%: HELLO          (fully clear)
```

This creates a "tuning in" feel — you're not guessing, you're literally watching the message come into focus.

### The Lock Moment

When match crosses threshold (95%):
1. Brief pulse/glow on the visualization
2. "SIGNAL LOCKED" confirmation
3. Message fully resolves
4. Pause to appreciate, then "Next Transmission →" appears

### No Fail State

- Can't get it wrong — just haven't tuned it yet
- No timer, no penalties
- Hints available after extended struggle (stretch goal, not MVP)

---

## Implementation: What Changes

### Keep As-Is

| Component | Why |
|-----------|-----|
| `useMatchScore.ts` | Core math still needed — calculates proximity |
| Slider components | Same controls, different context |
| Color tokens (`colors.ts`) | Design system still applies |
| Basic R3F setup | Canvas, lighting, etc. |

### Modify Significantly

| Component | Current | Becomes |
|-----------|---------|---------|
| `UnitCircle.tsx` | Fixed radius | Scales with amplitude |
| `SineWave.tsx` | Trailing animation | Static wave with traveling point |
| `Connector.tsx` | Vertical connector | Horizontal connector (shared y-axis) |
| `Scene.tsx` | Disconnected layout | Aligned circle + wave on same axis |
| `App.tsx` | 6-stage state machine | Single-screen with transmission progression |

### Discard

| Component | Why It Goes |
|-----------|-------------|
| Stage machine logic | No more staged isolation |
| `QuestionCard.tsx` | No quiz interruptions |
| `FeedbackBanner.tsx` | Replaced by signal clarity meter |
| `WhyModal.tsx` | Learning happens through doing, not explaining |
| `FormulaReveal.tsx` | Message decode is the reward now |
| `ExplorePrompt.tsx` | No staged prompts |
| `ProgressBar.tsx` | Replaced by transmission progress |
| Observe stage | Circle behavior is always visible |

### New Components

| Component | Purpose |
|-----------|---------|
| `SignalStrength.tsx` | Visual meter showing match quality |
| `MessageReveal.tsx` | Text that resolves with clarity |
| `TransmissionProgress.tsx` | Shows which transmissions completed |
| `transmissions.ts` | Data file with all transmission configs |

---

## Component Structure

```
src/
├── components/
│   ├── signal-lab/
│   │   ├── SignalLabScene.tsx      # R3F canvas with aligned visualization
│   │   ├── AlignedWave.tsx         # Static sine curve + traveling point
│   │   ├── ScalingCircle.tsx       # Unit circle that scales with amplitude
│   │   ├── WaveConnector.tsx       # Horizontal dashed line connector
│   │   ├── SignalStrength.tsx      # Match quality meter
│   │   ├── MessageReveal.tsx       # Text that fades in with clarity
│   │   └── TransmissionProgress.tsx
│   ├── controls/
│   │   └── ControlPanel.tsx        # Reuse, all three sliders visible
│   └── ui/
│       └── slider.tsx              # Existing slider component
├── hooks/
│   └── useMatchScore.ts            # Reuse existing
├── data/
│   └── transmissions.ts            # Hardcoded transmission configs
├── lib/
│   └── colors.ts                   # Existing design tokens
└── SignalLabApp.tsx                # New simplified app root
```

---

## UI Layout

### Desktop

```
┌────────────────────────────────────────────────────────────────┐
│  [Transmission 3/7]                      [Signal: ████████░░]  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                    ┌─────────────────────────────────┐         │
│                    │                                 │         │
│                    │   [Circle + Wave Visualization] │         │
│                    │                                 │         │
│                    └─────────────────────────────────┘         │
│                                                                │
│                         "T U N E D   I N"                      │
│                       (message, fades in)                      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   [Amplitude ●────────]  [Frequency ●────────]  [Phase ●────]  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Mobile (Stacked)

```
┌──────────────────────┐
│ Transmission 3/7     │
│ Signal: ████████░░   │
├──────────────────────┤
│                      │
│  [Circle]            │
│      │               │
│  [Wave below]        │
│                      │
├──────────────────────┤
│   "TUNED IN"         │
├──────────────────────┤
│ [Amplitude ●───────] │
│ [Frequency ●───────] │
│ [Phase     ●───────] │
└──────────────────────┘
```

---

## Success Criteria

### Pedagogical

- [ ] "One revolution = one period" is visually obvious
- [ ] Students can't cheese — understanding emerges from the unified visualization
- [ ] Decoding a message feels rewarding
- [ ] Circle feels functional (oscillator), not educational (diagram)

### Visual

- [ ] Circle and wave feel like one unified system
- [ ] Traveling point makes the y-relationship clear
- [ ] Signal clarity provides continuous feedback
- [ ] Message reveal has satisfying "coming into focus" feel

### Technical

- [ ] Single screen, no stage machine complexity
- [ ] Smooth 60fps animation
- [ ] Works on mobile
- [ ] Reuses existing components where possible

---

## Scope Summary

This is ~60% rebuild:
- Core visualization components survive but need significant modification
- Interaction model changes completely
- Quiz/feedback system replaced entirely

Not starting from zero — but not a polish pass either.

---

## Open Questions

1. **Ghost wave appearance** — Dotted, different color, or lower opacity?
2. **Animation control** — Auto-play always, or pause/play toggle?
3. **Mobile layout** — Stacked vertically, or try to keep horizontal alignment?
4. **Lock celebration** — What happens visually when transmission is decoded?

---

## Next Steps

1. Create `signal-lab/` component folder
2. Build `AlignedWave.tsx` with static wave + traveling point
3. Build `ScalingCircle.tsx` with amplitude scaling
4. Build `WaveConnector.tsx` for horizontal connector
5. Create `SignalLabApp.tsx` with single-screen layout
6. Add transmission data and progression logic
7. Build `SignalStrength.tsx` and `MessageReveal.tsx`
8. Polish and test
