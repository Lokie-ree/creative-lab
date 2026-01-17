/**
 * Vector Transformations Module - Public Exports
 */

// Main module component
export { Module, default } from './Module'

// Scene and visualization components
export { Scene } from './Scene'
export { CoordinateGrid, CoordinateLabels } from './CoordinateGrid'
export {
  VectorArrow,
  OriginalVector,
  TransformedVector,
  TargetVector,
} from './VectorArrow'

// Controls
export { MatrixControlPanel, MatrixDisplay } from './MatrixControlPanel'

// Feedback and celebration
export { CelebrationPulse, CelebrationPulseHtml, useCelebration } from './CelebrationPulse'
export { DiscoveryBadge, useDiscoveryBadge } from './DiscoveryBadge'
export { ProximityFeedback, ChallengeHeader } from './ProximityFeedback'

// Challenge mode
export { ChallengeMode, useChallengeMode } from './ChallengeMode'

// Reveal panel
export { RevealPanel } from './RevealPanel'

// Idle nudges and hints
export {
  Tooltip,
  HintSystem,
  InitialNudge,
  ExplorePrompt,
  useIdleNudges,
} from './IdleNudges'

// Utilities and types
export * from './utils'
