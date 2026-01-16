// src/config/sinewave-copy.ts
// Pedagogical copy for the Sinewaves module
// Challenge-first learning: discovery through manipulation before explanation

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

export interface SinewaveCopy {
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

export const SINEWAVE_COPY: SinewaveCopy = {
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
      title: "What You Discovered",
      points: [
        "The unit circle isn't just a diagram—it's the engine that generates every sine wave",
        "Amplitude and frequency aren't abstract parameters—they're the circle's radius and speed",
        "You matched the target before seeing the formula, proving you understood the relationship",
      ],
    },
    build: {
      title: "The Build",
      badges: ["React Three Fiber", "TypeScript", "GSAP", "shadcn/ui"],
      note: "First R3F project — built in 12 days while learning the library",
      features: [
        "60fps synchronized circle-to-wave animation",
        "Ghost wave targets for visual matching",
        "Two-step challenge: diagnose what changed, then match it",
      ],
    },
    designDecisions: {
      title: "Why It Works This Way",
      points: [
        "You manipulated before I explained—the formula arrived as confirmation, not prerequisite",
        "Removed phase parameter—depth over breadth, one concept mastered beats three introduced",
        "Circle radius scales with amplitude slider—what you adjust is what you see",
        "No 'wrong answers'—only 'keep exploring' until you match",
      ],
    },
    whereThisFits: {
      title: "The Bigger Picture",
      content: `One teacher reaches 150 students per year. One well-designed learning experience reaches millions.

This module demonstrates what I believe: that higher-level mathematics becomes accessible when learners manipulate before they memorize. The same approach extends to vectors, matrices, differential equations—any concept that benefits from seeing before symbolizing.

The formula becomes the label for what you've already discovered.`,
    },
  },
}
