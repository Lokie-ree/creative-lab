// src/config/sinusoidal-copy.ts
// Pedagogical copy for the Sinusoidal Waves module
// Following Brilliant's challenge-first learning approach

export interface StageCopy {
  setup: string
  prompt: string
  subtext?: string
}

export interface DiscoveryLabel {
  title: string
  description: string
  formula?: string
}

export interface SinusoidalCopy {
  stages: {
    observe: StageCopy
    amplitude: StageCopy
    frequency: StageCopy
    challenge: {
      observe: StageCopy
      diagnose: {
        question: string
        choices: Array<{ label: string; value: string }>
      }
      match: StageCopy
    }
    reveal: {
      title: string
      description: string
      soWhat: string
    }
  }
  discoveries: {
    amplitude: DiscoveryLabel
    frequency: DiscoveryLabel
  }
  matchCelebration: {
    amplitude: string
    frequency: string
  }
  behindThis: {
    approach: {
      title: string
      points: string[]
    }
    build: {
      title: string
      badges: string[]
      note: string
      features: string[]
    }
    designDecisions: {
      title: string
      points: string[]
    }
    whereThisFits: {
      title: string
      content: string
    }
  }
}

export const SINUSOIDAL_COPY: SinusoidalCopy = {
  stages: {
    observe: {
      setup: "Watch how the dot's vertical position creates the wave. As it moves around the circle, its height traces the sine wave below.",
      prompt: "Watch where the wave comes from",
      subtext: "Drag the dot or use the slider to explore",
    },
    amplitude: {
      setup: "The wave's height mirrors the circle's radius. As the dot moves farther from center, the wave grows taller.",
      prompt: "Match the ghost wave by adjusting amplitude",
      subtext: "The wave's height matches the circle's radius",
    },
    frequency: {
      setup: "Frequency controls how many circles complete in the same time. Higher frequency means more waves fit in the same space.",
      prompt: "Match the ghost wave by adjusting frequency",
      subtext: "Frequency controls how fast it oscillates",
    },
    challenge: {
      observe: {
        setup: "One parameter changed. Can you figure out which?",
        prompt: "Something changed",
        subtext: "Look closely at both waves",
      },
      diagnose: {
        question: "What changed?",
        choices: [
          { label: "Amplitude", value: "amplitude" },
          { label: "Frequency", value: "frequency" },
          { label: "Both", value: "both" },
        ],
      },
      match: {
        setup: "Now make them match by adjusting the parameter that changed.",
        prompt: "Now match it",
        subtext: undefined,
      },
    },
    reveal: {
      title: "Challenge complete!",
      description: "You've discovered how amplitude and frequency control the sine wave.",
      soWhat: `Every sine wave is circular motion in disguise.

Amplitude controls how far the dot travels from center—this determines the wave's height.

Frequency controls how fast it completes each circle—this determines how many waves fit in the same space.

This pattern appears everywhere: sound waves, light waves, springs, pendulums—any motion that repeats smoothly.`,
    },
  },
  discoveries: {
    amplitude: {
      title: "Amplitude controls the wave's height",
      description: "The wave's height matches the circle's radius. As amplitude increases, the dot travels farther from center, creating a taller wave.",
      formula: "y = A sin(t)",
    },
    frequency: {
      title: "Frequency controls how fast it oscillates",
      description: "Frequency determines how many complete cycles happen in the same time. Higher frequency means more waves fit in the same space.",
      formula: "y = A sin(ft)",
    },
  },
  matchCelebration: {
    amplitude: "Amplitude controls the wave's height",
    frequency: "Frequency controls how fast it oscillates",
  },
  behindThis: {
    approach: {
      title: "The Approach",
      points: [
        "Challenge-first learning—Brilliant's core pedagogy",
        "Manipulate → discover patterns → earn the formula",
        "The equation becomes a label for intuition, not a prerequisite",
      ],
    },
    build: {
      title: "The Build",
      badges: ["React Three Fiber", "TypeScript", "GSAP", "shadcn/ui"],
      note: "First R3F project — built in 12 days while learning the library",
      features: [
        "60fps unit circle animation",
        "Real-time wave generation",
        "Progressive discovery flow (observe → amplitude → frequency → challenge)",
      ],
    },
    designDecisions: {
      title: "Design Decisions",
      points: [
        "Removed phase parameter (depth over breadth)",
        "Circle radius scales with amplitude (visual reinforcement)",
        "Prediction questions test understanding, not recall",
        "Two-step challenge: diagnose the difference, then match it",
      ],
    },
    whereThisFits: {
      title: "Where This Fits",
      content: `Brilliant is expanding into higher-level math (trig, linear algebra, diff eq).

This demonstrates how I'd approach those expansions—making abstract concepts tangible through manipulation before introducing notation.

The interactive becomes the teacher, and the formula becomes the label for what you've already discovered.`,
    },
  },
}
