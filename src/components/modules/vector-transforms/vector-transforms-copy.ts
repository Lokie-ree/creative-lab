// src/config/vector-transforms-copy.ts
// Pedagogical copy for the Vector Transformations module
// Challenge-first learning: discovery through manipulation before explanation

export interface StageCopy {
  prompt: string
  subtext?: string
}

export interface DiscoveryLabel {
  title: string
  description: string
}

export interface VectorTransformsCopy {
  stages: {
    explore: StageCopy
    unlocked: StageCopy
    challenge: StageCopy
  }
  discoveries: {
    scaling: DiscoveryLabel
    rotation: DiscoveryLabel
    reflection: DiscoveryLabel
    shearing: DiscoveryLabel
  }
  hints: {
    unlockPrompt: string
    challengeButton: string
  }
  reveal: {
    title: string
    tryAnother: string
    keepExploring: string
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

export const VECTOR_TRANSFORMS_COPY: VectorTransformsCopy = {
  stages: {
    explore: {
      prompt: 'Change the matrix. Watch what happens to the vector.',
      subtext: 'Start by adjusting the diagonal entries',
    },
    unlocked: {
      prompt: 'Change the matrix. Watch what happens to the vector.',
      subtext: 'Off-diagonal entries now available',
    },
    challenge: {
      prompt: 'Match the dashed target vector',
      subtext: undefined,
    },
  },
  discoveries: {
    scaling: {
      title: 'Scaling',
      description:
        'Diagonal entries stretch or compress the vector. Equal values scale uniformly; different values stretch along different axes.',
    },
    rotation: {
      title: 'Rotation',
      description:
        'Off-diagonal entries with opposite signs rotate the vector around the origin. The angle depends on their magnitude.',
    },
    reflection: {
      title: 'Reflection',
      description:
        'Negative diagonal entries flip the vector across an axis. Both negative creates a 180° rotation.',
    },
    shearing: {
      title: 'Shearing',
      description:
        'Off-diagonal entries with the same sign create a shearing effect, tilting the vector without changing its length along one axis.',
    },
  },
  hints: {
    unlockPrompt: 'Adjust diagonal sliders to unlock more controls',
    challengeButton: 'Try a Challenge',
  },
  reveal: {
    title: 'Challenge complete!',
    tryAnother: 'Try Another',
    keepExploring: 'Keep Exploring',
  },
  behindThis: {
    approach: {
      title: 'What You Discovered',
      points: [
        'A 2×2 matrix isn\'t just numbers—it\'s a complete description of how space transforms',
        'Diagonal entries control stretching, off-diagonal entries control rotation and shearing',
        'You matched the target before seeing the formula, proving you understood the transformation',
      ],
    },
    build: {
      title: 'The Build',
      badges: ['React Three Fiber', 'TypeScript', 'GSAP', 'shadcn/ui'],
      note: 'Interactive vector visualization with real-time matrix transformations',
      features: [
        '60fps vector animation responding to matrix changes',
        'Progressive unlock of matrix complexity',
        'Target matching challenges for active learning',
      ],
    },
    designDecisions: {
      title: 'Why It Works This Way',
      points: [
        'Diagonal entries unlock first—simpler transformations before complex ones',
        'Visual feedback on every adjustment—immediate cause and effect',
        'No wrong answers—just "keep exploring" until you match',
        'Formula arrives as confirmation of what you discovered, not prerequisite',
      ],
    },
    whereThisFits: {
      title: 'The Bigger Picture',
      content: `Linear algebra becomes intuitive when you see it.

Matrices describe every kind of 2D transformation: scaling, rotation, reflection, shearing. The same 2×2 grid of numbers can rotate an image, transform coordinates, or describe how forces interact.

Understanding matrices visually—before symbolically—builds the intuition that makes higher mathematics accessible.`,
    },
  },
}
