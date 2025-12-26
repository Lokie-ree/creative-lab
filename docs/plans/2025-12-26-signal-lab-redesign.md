# Signal Lab: Redesign Spec

> Transform abstract sine wave manipulation into a compelling "tune the signal" experience with cleaner visualization and real-world context.

## Problem Statement

The current implementation has three issues:

1. **No "why should I care?"** — Abstract sine waves don't connect to anything meaningful
2. **Too easy to cheese** — Single-parameter stages let users match visually without understanding
3. **Disconnected visualization** — Circle and wave feel like separate elements, not a unified system

## Solution Overview

**Signal Lab** — A transmission-decoding experience where users tune wave parameters to match incoming signals and reveal hidden messages.

### Core Changes

| Current | New |
|---------|-----|
| 6 fragmented stages | Single unified screen |
| Single-parameter isolation | All parameters available, difficulty via targets |
| Formula reveal as reward | Decoded message as reward |
| Trailing wave animation | Static wave with traveling point |
| Disconnected circle/wave | Aligned on shared axis |

---

## Visualization Design

### Layout: Aligned Circle + Wave

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         ┌───────┐                                               │
│        ╱         ╲              ●                               │
│       │     ●─────────────────/─────\                           │
│       │     │     │          /       \                          │
│  ─────┼─────┼─────┼─────────/─────────\─────────────────────    │
│       │     │     │                    \         /              │
│       │     ↓     │                     \       /               │
│        ╲   (y)   ╱                       \_____/                │
│         └───────┘                                               │
│                                                                 │
│         Circle            One complete period (2π)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Shared horizontal axis** — Circle center and wave y=0 are on the same line
2. **Circle edge meets wave start** — Rightmost point of circle is x=0 of wave
3. **Static wave shape** — Full period(s) always visible, not trailing
4. **Traveling point** — Dot moves along wave synchronized with circle rotation
5. **Horizontal connector** — Dashed line from circle point to wave point (same y)
6. **Circle scales with amplitude** — Radius = amplitude for intuitive mapping

### One Revolution = One Period

This is THE core insight. The visualization must make it viscerally obvious:
- Point completes one circle rotation
- Point travels exactly one wave period
- Both end up back where they started

---

## Signal Lab Concept

### Framing

> "You're tuning into transmissions. Each signal is encoded as a wave pattern. Match the parameters to decode the message."

### Core Loop

1. **See target wave** — The "transmission" displayed as a ghost/target wave
2. **Adjust parameters** — Amplitude, frequency, phase sliders (all visible)
3. **Signal clarity feedback** — As match improves, message gradually resolves
4. **Decode** — Perfect match reveals the message
5. **Unlock next** — Progression to harder transmissions

### Visual Feedback (Signal Clarity)

| Match Score | Visual State |
|-------------|--------------|
| 0-30% | Message fully hidden, heavy "static" (low opacity noise) |
| 30-60% | Fragments shimmer through |
| 60-90% | Message nearly readable, slight interference |
| 90-100% | Clean signal, message revealed |

The existing glow system becomes signal clarity — brighter = closer to match.

---

## Progression System

### Transmission Structure

```typescript
interface Transmission {
  id: string
  target: {
    amplitude: number
    frequency: number
    phase: number
  }
  message: string
  tolerance: number  // How close is "close enough" (0.05 = tight, 0.15 = loose)
  hint?: string      // Optional hint after extended struggle
}
```

### MVP Transmissions (5-7 total)

| Level | Difficulty | Target | Message |
|-------|------------|--------|---------|
| 1 | One param off | A=1.5, f=1, φ=0 | "HELLO" |
| 2 | One param off | A=1, f=2, φ=0 | "SYNC" |
| 3 | Two params off | A=1.5, f=1.5, φ=0 | "TUNED IN" |
| 4 | Two params off | A=1, f=1, φ=π/2 | "PHASE LOCK" |
| 5 | All three off | A=1.5, f=2, φ=π/4 | "SIGNAL FOUND" |
| 6 | Tighter tolerance | A=1.25, f=1.5, φ=π/2 | "LOUD AND CLEAR" |
| 7 | Full challenge | Random nice values | "TRANSMISSION COMPLETE" |

### Starting Position

Each transmission starts user at A=1, f=1, φ=0 (or slightly randomized offset).

### No Fail State

- User just hasn't decoded it *yet*
- Can skip and return (stretch goal)
- Hints available after ~60 seconds of struggle (stretch goal)

---

## MVP Scope

### Build Now

- [ ] Aligned visualization (circle + static wave + connector)
- [ ] Traveling point synchronized with circle
- [ ] Circle scales with amplitude
- [ ] Single screen with all three sliders
- [ ] Signal strength indicator (replaces match %)
- [ ] Message reveal component (text fades in with clarity)
- [ ] 5-7 hardcoded transmissions
- [ ] Linear progression (complete one → next unlocks)
- [ ] Simple transmission selector/progress indicator

### Cut for MVP

- ~~Frequency bands / chapters~~
- ~~Time pressure~~
- ~~Persistent saved progress~~
- ~~Hints system~~
- ~~Fancy static/noise shader effects~~ (use opacity)
- ~~Questions/quizzes~~
- ~~Formula reveal~~
- ~~Observe stage~~

### Reuse from Current Implementation

- `SineWave.tsx` — Modify to render static curve instead of trailing
- `UnitCircle.tsx` — Add amplitude scaling, keep rotation logic
- `Connector.tsx` — Adapt for horizontal connector
- `useMatchScore.ts` — Already calculates what we need
- Glow system — Becomes signal clarity visual
- Slider components — Reuse as-is
- Color tokens — Keep existing palette

---

## Technical Approach

### New App State (Simplified)

```typescript
interface AppState {
  // Current transmission
  currentTransmissionIndex: number
  completedTransmissions: Set<string>

  // Wave parameters (user-controlled)
  amplitude: number
  frequency: number
  phase: number

  // Derived
  matchScore: number  // 0-100, calculated from params vs target
  signalClarity: number  // 0-1, eased version of matchScore
  isDecoded: boolean  // matchScore >= threshold
}
```

### Component Structure

```
src/
├── components/
│   ├── signal-lab/           # New module folder
│   │   ├── SignalLabScene.tsx    # R3F canvas with aligned viz
│   │   ├── AlignedWave.tsx       # Static sine curve + traveling point
│   │   ├── ScalingCircle.tsx     # Unit circle that scales with amplitude
│   │   ├── WaveConnector.tsx     # Horizontal dashed line connector
│   │   ├── MessageReveal.tsx     # Text that fades in with clarity
│   │   └── TransmissionProgress.tsx  # Shows which transmissions completed
│   ├── controls/
│   │   └── ControlPanel.tsx      # Reuse, maybe rename sliders
│   └── shared/
│       └── SignalStrength.tsx    # Visual meter for match quality
├── hooks/
│   └── useMatchScore.ts          # Reuse existing
├── data/
│   └── transmissions.ts          # Hardcoded transmission configs
└── SignalLabApp.tsx              # New simplified app root
```

### Wave Rendering Change

**Current:** Trailing wave built point-by-point over time
**New:** Static BufferGeometry computed from parameters

```typescript
// Generate full sine wave points
function generateWavePoints(amplitude: number, frequency: number, phase: number, periods: number = 1) {
  const points: [number, number, number][] = []
  const segments = 200
  const width = periods * 2 * Math.PI

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * width
    const x = t
    const y = amplitude * Math.sin(frequency * t + phase)
    points.push([x, y, 0])
  }

  return points
}
```

### Circle Scaling

```typescript
// In ScalingCircle.tsx
<group scale={[amplitude, amplitude, 1]}>
  {/* Existing unit circle geometry */}
  <Line points={circlePoints} ... />
  {/* Point position still uses unit circle math, group scale handles amplitude */}
</group>
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
- [ ] Users can't cheese — all three parameters must be correct
- [ ] Decoding a message feels rewarding
- [ ] No abstract formula as the payoff

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

## Open Questions

1. **Ghost wave appearance** — Should target wave be dotted, different color, or just lower opacity?
2. **Animation control** — Auto-play always, or pause/play toggle?
3. **Mobile circle+wave layout** — Stacked vertically, or try to keep horizontal?
4. **Celebration moment** — What happens visually when transmission is decoded?

---

## Next Steps

1. Create new `signal-lab/` component folder
2. Build `AlignedWave.tsx` with static wave rendering
3. Build `ScalingCircle.tsx` with amplitude scaling
4. Build `WaveConnector.tsx` for horizontal connector
5. Create simplified `SignalLabApp.tsx`
6. Add transmission data and progression logic
7. Build `MessageReveal.tsx` component
8. Polish and test
