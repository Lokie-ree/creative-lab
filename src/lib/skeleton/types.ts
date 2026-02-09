/**
 * Module Skeleton Types
 *
 * Defines the shared interfaces for module configuration and state management.
 * Plan and implementation: docs/plans/2026-01-27-module-skeleton-infrastructure.md
 */

// =============================================================================
// INTERACTION MODES
// =============================================================================

export type InteractionMode =
  | 'slider'           // Parameter controls (sinewaves amplitude/frequency)
  | 'direct-manipulate' // Drag elements in scene (points on a line)
  | 'discrete-select'   // Click/tap choices
  | 'hybrid'           // Combination

// =============================================================================
// FLOW PHASES
// =============================================================================

export type FlowPhase =
  | 'idle'
  | 'explore'
  | 'challenge'
  | 'success'
  | 'reveal'

export type ExploreSubPhase = 'active' | 'unlocking'
export type ChallengeSubPhase = 'targeting' | 'matching' | 'hint' | 'assist'
export type SuccessSubPhase = 'hold' | 'pulse' | 'comprehension'

// =============================================================================
// STAGE CONFIGURATION
// =============================================================================

export interface SliderConfig {
  min: number
  max: number
  step: number
  defaultValue: number
}

export interface DragConfig {
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
  snapToGrid?: number
  constraintFn?: (point: { x: number; y: number }) => { x: number; y: number }
}

export interface SelectConfig {
  options: Array<{ label: string; value: string | number }>
}

export interface StageUnlockConfig {
  minimumEngagementSeconds: number  // Default: 5
  intensityThreshold: number        // Default: 0.7
  rangeExplorationThreshold: number // Default: 0.6
  timeFallbackSeconds: number       // Default: 45
}

export interface ExploreStage {
  id: string
  parameter: string
  interactionMode: InteractionMode
  controlConfig: SliderConfig | DragConfig | SelectConfig
  unlockConditions?: Partial<StageUnlockConfig>
}

// =============================================================================
// CHALLENGE CONFIGURATION
// =============================================================================

export interface TargetConstraints {
  minimumDistance: number           // Default: 0.3
  maximumDistance: number           // Default: 0.95
  difficultyProgression: 'fixed' | 'increasing' | 'adaptive'
}

export interface ChallengeConfig<TParams, TTarget> {
  generateTarget: () => TTarget
  matchThreshold: number
  proximityFn: (current: TParams, target: TTarget) => number
  parameterProximity?: (current: TParams, target: TTarget) => Record<string, number>
  targetConstraints: TargetConstraints
  fallbackTarget?: TTarget
}

// =============================================================================
// FEEDBACK CONFIGURATION
// =============================================================================

export interface NotationConfig {
  maxWidth: 'auto' | number
  overflow: 'truncate' | 'wrap' | 'scale'
  minFontSize: number
  precision: number
  format: 'decimal' | 'fraction' | 'mixed'
}

export interface FeedbackConfig<TParams> {
  intensityFn: (params: TParams, mode: 'explore' | 'challenge', target?: unknown) => number
  notation: (params: TParams) => string
  notationConfig?: NotationConfig
}

// =============================================================================
// IDLE/HINT CONFIGURATION
// =============================================================================

export interface IdleConfig {
  hintDelay: number
  hintType: 'pulse' | 'nudge'
}

// =============================================================================
// MODULE CONFIGURATION
// =============================================================================

export interface ModuleConfig<TParams, TTarget> {
  id: string
  stages: ExploreStage[]
  challenge: ChallengeConfig<TParams, TTarget>
  feedback: FeedbackConfig<TParams>
  idle: IdleConfig
  stageUnlock: StageUnlockConfig
}

// =============================================================================
// MODULE STATE
// =============================================================================

export interface ModuleState<TParams> {
  phase: FlowPhase
  currentStageIndex: number
  params: TParams
  discoveries: Partial<TParams>

  // Timing
  phaseStartTime: number
  lastInteractionTime: number
  engagementTime: number

  // Challenge state
  currentTarget: unknown | null
  challengeAttempts: number
  hintsShown: number

  // Success state
  matchAccuracy: number
  challengeStreak: number
}

// =============================================================================
// ANALYTICS EVENTS
// =============================================================================

export interface SessionStartEvent {
  moduleId: string
  timestamp: number
}

export interface SessionEndEvent {
  moduleId: string
  duration: number
  completedChallenges: number
  exitReason: 'completed' | 'abandoned' | 'timeout'
}

export interface StageUnlockEvent {
  stage: string
  unlockTrigger: 'intensity' | 'range' | 'time'
  engagementTime: number
}

export interface ChallengeEndEvent {
  success: boolean
  duration: number
  hintCount: number
  exitType: 'match' | 'skip' | 'assist' | 'newChallenge'
  finalProximity: number
}

export interface ModuleAnalytics {
  sessionStart: SessionStartEvent
  sessionEnd: SessionEndEvent
  stageUnlock: StageUnlockEvent
  challengeEnd: ChallengeEndEvent
}

// =============================================================================
// ERROR RECOVERY
// =============================================================================

export interface ErrorRecoveryConfig {
  onContextLost: 'pause' | 'reload'
  contextLostMessage: string
}

export interface PerformanceConfig {
  targetFPS: number
  degradationThreshold: number
  degradationStrategy: 'reduceDetail' | 'reduceAnimations' | 'both'
}
