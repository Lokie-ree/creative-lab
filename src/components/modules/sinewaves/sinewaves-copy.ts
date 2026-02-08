// src/components/modules/sinewaves/sinewaves-copy.ts
// Pedagogical copy for the Sinewaves module

export interface SinewaveCopy {
  proximity: {
    medium: string
    close: string
  }
  matchCelebration: {
    amplitude: string
    frequency: string
    challengeAmplitude: string
    challengeFrequency: string
    challengeBoth: string
  }
  reveal: {
    title: string
    description: string
    soWhat: string
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
  proximity: {
    medium: "Getting closer...",
    close: "Almost there...",
  },
  matchCelebration: {
    amplitude: "You found it — amplitude controls the height",
    frequency: "That's it — frequency controls the speed",
    challengeAmplitude: "Sharp eye. You spotted the amplitude change",
    challengeFrequency: "Nice catch. The frequency shifted",
    challengeBoth: "You nailed it — both parameters changed",
  },
  reveal: {
    title: "Challenge complete!",
    description: "You've discovered how amplitude and frequency control the sine wave.",
    soWhat: `Every sine wave is circular motion in disguise.

Amplitude controls how far the dot travels from center—this determines the wave's height.

Frequency controls how fast it completes each circle—this determines how many waves fit in the same space.

This pattern appears everywhere: sound waves, light waves, springs, pendulums—any motion that repeats smoothly.`,
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
