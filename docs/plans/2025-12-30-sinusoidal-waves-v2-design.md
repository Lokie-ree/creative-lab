# Sinusoidal Waves Module v2 - Implementation Design

> **Purpose:** Implementation spec for rebuilding the sine wave module with refined pedagogy.
>
> **Date:** December 30, 2025
> **Status:** Ready for implementation

---

## Summary of Changes from v1

| Aspect | v1 | v2 |
|--------|----|----|
| Stages | 6 (observe → amplitude → frequency → phase → challenge → reveal) | 4 (observe → amplitude → frequency → challenge → reveal) |
| Parameters | Amplitude, Frequency, Phase | Amplitude, Frequency only |
| Questions | Recall-based ("What value doubled...?") | Prediction-based ("If amplitude were 3...?") |
| Challenge | Single multi-param match | Diagnose → Match (two-step) |
| Reflect phase | "Why" modals | Flash confirmation (visual) |
| Circle radius | Fixed | Scales with amplitude |

**Rationale:** Depth over breadth. Two parameters fully understood beats three parameters shallowly covered.

---

## Architecture

### Stage Flow

```
observe → amplitude → frequency → challenge → reveal
              │            │           │
          [explore]    [explore]   [diagnose]
              │            │           │
          [match]      [match]     [match]
              │            │
          [reflect]    [reflect]
```

### State Shape

```typescript
type Stage = 'observe' | 'amplitude' | 'frequency' | 'challenge' | 'reveal'
type SubStage = 'explore' | 'match' | 'reflect'
type ChallengePhase = 'diagnose' | 'match'

// Core state
const [stage, setStage] = useState<Stage>('observe')
const [subStage, setSubStage] = useState<SubStage>('explore')

// Wave parameters (no phase)
const [amplitude, setAmplitude] = useState(1.0)
const [frequency, setFrequency] = useState(1.0)

// Fixed educational targets
const stageTargets = { amplitude: 1.5, frequency: 2.0 }

// Challenge state
const [challengePhase, setChallengePhase] = useState<ChallengePhase>('diagnose')
const [challengeParam, setChallengeParam] = useState<'amplitude' | 'frequency'>('amplitude')
```

---

## Component Changes

### Keep As-Is

| Component | Location | Reason |
|-----------|----------|--------|
| `Scene.tsx` | modules/sinusoidal/ | Responsive layout, R3F canvas |
| `SineWave.tsx` | modules/sinusoidal/ | Wave rendering works |
| `Connector.tsx` | modules/sinusoidal/ | Dashed connector works |
| `ControlPanel.tsx` | controls/ | Slider infrastructure |
| `ProgressBar.tsx` | shared/ | Stage indicator |
| `AnimatedPanel.tsx` | shared/ | Panel animations |
| `CelebrationPulse.tsx` | shared/ | Match celebration |
| `QuestionCard.tsx` | feedback/ | MCQ component |
| `FeedbackBanner.tsx` | feedback/ | Correct/incorrect banner |

### Modify

| Component | Change |
|-----------|--------|
| `UnitCircle.tsx` | Add `amplitude` prop, scale radius with `baseRadius * amplitude` |
| `FormulaPreview.tsx` | Remove phase display, simplify to `y = A sin(ft)` |

### Rebuild

| Component | Reason |
|-----------|--------|
| `Module.tsx` | New 4-stage machine, different flow logic |

### Delete

| Component | Reason |
|-----------|--------|
| `WhyModal.tsx` | Replaced by flash confirmation |

### New

| Component | Purpose |
|-----------|---------|
| `DiagnoseCard.tsx` | "What changed?" UI for challenge 4a (or extend QuestionCard) |

---

## Stage Specifications

### Stage 1: Observe

**Purpose:** Establish circle-to-wave relationship.

| Property | Value |
|----------|-------|
| Duration | 5-second timer (kept for simplicity) |
| Controls | Draggable dot on circle OR angle slider |
| Exit | "Continue →" button appears after timer |
| Visual | Connector line links circle dot to wave point |

**User insight:** "The wave tracks the dot's height as it goes around."

---

### Stage 2: Amplitude

**Purpose:** Amplitude scales wave height (and circle radius).

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Make the wave taller" |
| Slider | Amplitude: 0.5–2.0, starts at 1.0 |
| Target | Ghost wave at A = 1.5 |
| Visual | Circle radius scales with amplitude |

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | A = 1.5 ± 0.1 |
| Celebration | Glow/pulse, 0.8s pause |
| Equation | Updates to show `y = 1.5 sin(t)` |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "If amplitude were 3, how high would the wave peak?" |
| Choices | 1.5 / 2 / **3** / 6 |
| On correct | Wave flashes to A=3 for 1.2s, then returns |
| On incorrect | Subtle shake, allow retry |
| Exit | Auto-advance to frequency stage |

---

### Stage 3: Frequency

**Purpose:** Frequency controls cycles per interval (rotation speed).

#### Explore Phase

| Element | Details |
|---------|---------|
| Prompt | "Make the wave faster" |
| Slider | Frequency: 0.5–3.0, starts at 1.0 |
| Locked | Amplitude locked at 1.5 |
| Target | Ghost wave at f = 2.0 |

#### Match Phase

| Element | Details |
|---------|---------|
| Trigger | f = 2.0 ± 0.15 |
| Celebration | Same pattern as amplitude |
| Equation | Updates to show `y = 1.5 sin(2t)` |

#### Reflect Phase

| Element | Details |
|---------|---------|
| Question | "How many complete waves fit when frequency = 3?" |
| Choices | 1 / 2 / **3** / 4 |
| On correct | Wave flashes to f=3, showing 3 cycles |
| Exit | Auto-advance to challenge stage |

---

### Stage 4: Challenge

**Purpose:** Apply understanding independently.

#### Setup

```typescript
// Randomly pick which parameter differs
const challengeParam = Math.random() > 0.5 ? 'amplitude' : 'frequency'

// Generate challenge wave differing by ONE param
const challengeWave = {
  a: challengeParam === 'amplitude'
    ? pickDifferentValue(1.5, [0.75, 1.0, 1.25, 1.75, 2.0])
    : 1.5,
  f: challengeParam === 'frequency'
    ? pickDifferentValue(2.0, [0.5, 1.0, 1.5, 2.5, 3.0])
    : 2.0,
}
```

#### Diagnose Phase (4a)

| Element | Details |
|---------|---------|
| Display | User's wave + challenge wave (different color) |
| Prompt | "This wave is different. What changed?" |
| Choices | Amplitude / Frequency / Both |
| Note | "Both" is always wrong (single-param challenge) |
| On correct | Unlock relevant slider, proceed to match |

#### Match Phase (4b)

| Element | Details |
|---------|---------|
| Slider | Only diagnosed parameter unlocked |
| Feedback | Match percentage indicator |
| Threshold | 95% match triggers success |
| On success | Celebration → reveal stage |

---

### Stage 5: Reveal

**Purpose:** Celebrate completion, invite exploration.

| Element | Details |
|---------|---------|
| Display | "You built: y = 1.5 sin(2t)" |
| Visual | User's final wave |
| Copy | "Amplitude controls how far from center. Frequency controls how fast it spins." |
| Actions | Keep Exploring / Start Over |
| Trigger | Calls `onComplete` with final values |

---

## Questions Content

```typescript
const QUESTIONS = {
  amplitude: {
    question: "If amplitude were 3, how high would the wave peak?",
    choices: [
      { label: "1.5", value: 1.5 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "6", value: 6 },
    ],
    answer: 3,
    flashValue: 3,  // Value to flash on correct answer
  },
  frequency: {
    question: "How many complete waves fit when frequency = 3?",
    choices: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "4", value: 4 },
    ],
    answer: 3,
    flashValue: 3,
  },
}
```

---

## UnitCircle Radius Scaling

```typescript
interface UnitCircleProps {
  amplitude: number  // NEW
  angle: number
  onAngleChange: (angle: number) => void
  // ...existing props
}

// Inside component
const baseRadius = 1.0
const scaledRadius = baseRadius * amplitude

// Apply to circle mesh
<mesh>
  <ringGeometry args={[scaledRadius - 0.02, scaledRadius, 64]} />
</mesh>

// Apply to dot position
const dotX = Math.cos(angle) * scaledRadius
const dotY = Math.sin(angle) * scaledRadius
```

---

## Flash Confirmation Animation

```typescript
// On correct reflect answer
const flashPrediction = async (param: 'amplitude' | 'frequency', flashValue: number) => {
  const originalValue = param === 'amplitude' ? amplitude : frequency
  const setter = param === 'amplitude' ? setAmplitude : setFrequency

  // Flash to predicted value
  setter(flashValue)
  await delay(1200)

  // Return to matched value
  setter(originalValue)
  await delay(300)

  // Advance stage
  advanceToNextStage()
}
```

Alternative: Use GSAP for smoother tween.

---

## Match Detection

```typescript
// Amplitude match (explore → match transition)
const amplitudeMatched = Math.abs(amplitude - 1.5) <= 0.1

// Frequency match
const frequencyMatched = Math.abs(frequency - 2.0) <= 0.15

// Challenge match percentage
const challengeMatch = (() => {
  if (challengeParam === 'amplitude') {
    return 1 - Math.abs(amplitude - challengeWave.a) / 1.5
  } else {
    return 1 - Math.abs(frequency - challengeWave.f) / 2.5
  }
})() * 100
```

---

## Implementation Order

### Phase 1: Foundation
1. Modify `UnitCircle.tsx` — add amplitude prop for radius scaling
2. Modify `FormulaPreview.tsx` — remove phase, simplify display
3. Delete `WhyModal.tsx`

### Phase 2: Core Rebuild
4. Rebuild `Module.tsx` with 4-stage machine
   - Start with observe → amplitude → reveal (minimal loop)
   - Wire up existing Scene components
   - Verify basic flow

### Phase 3: Complete Flow
5. Add frequency stage (mirrors amplitude)
6. Implement reflect phase with flash confirmation
7. Add new prediction questions

### Phase 4: Challenge
8. Create `DiagnoseCard.tsx` (or extend QuestionCard)
9. Implement challenge stage (diagnose → match)
10. Wire challenge completion to reveal

### Phase 5: Polish
11. Verify celebrations, transitions, timing
12. Test responsive layout
13. Clean up unused code

---

## Success Criteria

- [ ] Observe stage clearly shows circle-to-wave relationship
- [ ] Circle radius visibly scales with amplitude
- [ ] Match celebrations feel earned (0.8s pause)
- [ ] Prediction questions test understanding, not recall
- [ ] Flash confirmation reinforces correct answers visually
- [ ] Challenge diagnose step reduces frustration
- [ ] Module completable in ~2-3 minutes
- [ ] Works on mobile (portrait) and desktop (landscape)

---

*Last updated: December 30, 2025*
