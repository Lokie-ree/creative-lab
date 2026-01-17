/**
 * Vector Transformations Module - Utility Exports
 */

// Types
export type {
  Matrix2x2,
  Vector2,
  TransformationType,
  ProximityScore,
  MatchThreshold,
  Stage,
  ChallengeTarget,
  DiscoveredTransformations,
  ProximityLevel,
  ModuleProps,
} from './types'

// Constants
export {
  IDENTITY_MATRIX,
  BASIS_VECTOR,
  DEFAULT_MATCH_THRESHOLD,
  SLIDER_CONFIG,
} from './types'

// Matrix math functions
export {
  transformVector,
  determinant,
  classifyTransformation,
  getRotationAngle,
  getTransformationDescription,
  getEntryExplanations,
  createRotationMatrix,
  createScalingMatrix,
  createReflectionMatrix,
} from './matrix-math'

// Proximity functions
export {
  getVectorAngle,
  getVectorMagnitude,
  calculateProximity,
  isMatch,
  getProximityLevel,
  getProximityFeedbackText,
  generateHint,
  calculateMatchScore,
} from './proximity'

// Challenge targets
export {
  challengeTargets,
  getRandomChallenge,
  getChallengeByName,
  getChallengeTargetVector,
  formatMatrixForDisplay,
} from './challenges'
