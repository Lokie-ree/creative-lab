# Module: Sinusoidal Waves

## Learning Goal

Users discover how circular motion generates wave patterns, understanding amplitude, frequency, and phase through manipulation before formalization.

## Essential Concepts

| Concept | What Student Learns | Why Essential |
|---------|---------------------|---------------|
| Unit circle → wave | Rotating point's y-value traces sine wave | Foundation for all trig |
| Amplitude (A) | Multiplies wave height | Direct visual feedback |
| Frequency (f) | Controls cycles per interval | Core wave property |
| Phase (φ) | Shifts wave horizontally | Reveals sin/cos relationship |

**Key Insight:** "Sine shifted by π/2 equals cosine" — the phase question leads to this discovery.

**Skipped:** Vertical shift (d), symmetry properties, inverse trig, applied problems.

---

## Stage Flow

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

---

## Stages

### 1. Observe
| Property | Value |
|----------|-------|
| Type | Auto-play animation |
| Shows | Circle rotating, wave tracing in sync |
| Controls | None (watch only) |
| Exit | "Continue →" after one full cycle |

### 2. Amplitude
| Phase | Details |
|-------|---------|
| Explore | Prompt: "Make the wave taller" |
| | Slider: Amplitude (0.5–2.0) |
| | Ghost: Target wave at A=2.0, f=1, φ=0 |
| Match | Triggers question when user hits A=2.0 ±0.1 |
| Question | "What value doubled the wave's height?" |
| | Choices: `1.0` `1.5` `2.0` `2.5` |
| | Answer: **2.0** |
| Feedback | Correct → "Why?" button |
| Why | "Amplitude multiplies every point's distance from the center line. A=2 means twice as tall." |

### 3. Frequency
| Phase | Details |
|-------|---------|
| Explore | Prompt: "Make the wave faster" |
| | Slider: Frequency (0.5–3.0), amplitude locked |
| | Ghost: Target wave at f=2.0 |
| Match | Triggers when user hits f=2.0 ±0.15 |
| Question | "How many complete waves fit when frequency doubles?" |
| | Choices: `1` `2` `3` `4` |
| | Answer: **2** |
| Why | "Frequency controls cycles per interval. Double frequency = double the waves." |

### 4. Phase
| Phase | Details |
|-------|---------|
| Explore | Prompt: "Shift where the wave starts" |
| | Slider: Phase (0–2π), amp+freq locked |
| | Ghost: Target wave at φ=π/2 |
| Match | Triggers when user hits φ=π/2 ±0.2 |
| Question | "What phase makes sine start at its peak?" |
| | Choices: `0` `π/4` `π/2` `π` |
| | Answer: **π/2** |
| Why | "At φ=π/2, sine starts at maximum. This is actually the cosine function!" |

### 5. Challenge
| Property | Value |
|----------|-------|
| Prompt | "Match the wave" |
| Controls | All sliders unlocked |
| Ghost | Random target (nice values) |
| Feedback | "Getting closer..." → "Almost there..." |
| Exit | 95% match triggers reveal |

### 6. Reveal
| Property | Value |
|----------|-------|
| Shows | "You built: y = A × sin(ft + φ)" with values |
| Actions | Keep Exploring / Try Another / Start Over |

---

## Components

### Reusable (build in `shared/` or `feedback/`)

| Component | Props | Used For |
|-----------|-------|----------|
| `ProgressBar` | `current`, `total` | Any multi-stage module |
| `ExplorePrompt` | `text`, `subtext?` | Any exploration stage |
| `QuestionCard` | `question`, `choices`, `onSelect` | Any question stage |
| `FeedbackBanner` | `correct`, `onWhy`, `onContinue` | Any feedback stage |
| `WhyModal` | `open`, `content`, `onClose` | Any explanation |
| `CelebrationModal` | `title`, `content`, `actions` | Any earned reveal |

### Domain-Specific (keep in `modules/sinusoidal/`)

| Component | Purpose |
|-----------|---------|
| `UnitCircle` | Rotating point visualization |
| `SineWave` | Wave trail with parameters |
| `Connector` | Dashed line linking circle→wave |
| `SinusoidalScene` | Composes all R3F elements |

### Refactor from Existing

| Current | Becomes |
|---------|---------|
| `FormulaReveal` | `CelebrationModal` (generic) |
| `ControlPanel` | Extract `ParameterSlider` (reusable) |

---

## Targets

| Parameter | Nice Values | Threshold |
|-----------|-------------|-----------|
| Amplitude | 0.75, 1.0, 1.25, 1.5, 1.75, 2.0 | ±0.1 |
| Frequency | 0.5, 1.0, 1.5, 2.0, 2.5, 3.0 | ±0.15 |
| Phase | 0, π/4, π/2, 3π/4, π | ±0.2 rad |

**Match threshold:** 95% (worst-of-three scoring)

---

## File Structure After Refactor

```
src/components/
├── shared/
│   ├── ProgressBar.tsx
│   ├── ExplorePrompt.tsx
│   └── ParameterSlider.tsx
├── feedback/
│   ├── QuestionCard.tsx
│   ├── FeedbackBanner.tsx
│   ├── WhyModal.tsx
│   └── CelebrationModal.tsx
├── modules/
│   └── sinusoidal/
│       ├── UnitCircle.tsx
│       ├── SineWave.tsx
│       ├── Connector.tsx
│       └── SinusoidalScene.tsx
└── controls/
    └── ControlPanel.tsx
```
