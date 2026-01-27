# Module Skeleton

Reusable infrastructure for learning modules. Provides the common flow pattern
(Idle → Explore → Challenge → Success → Reveal) while allowing modules to define
their own content and interactions.

## Quick Start

```tsx
import {
  useModuleFlow,
  useStageUnlock,
  useChallengeAssist,
  useAccessibility,
  type ModuleConfig,
} from '@/lib/skeleton'

// Define your module configuration
const config: ModuleConfig<MyParams, MyTarget> = {
  id: 'my-module',
  stages: [
    {
      id: 'param1',
      parameter: 'param1',
      interactionMode: 'slider',
      controlConfig: { min: 0, max: 2, step: 0.1, defaultValue: 1 },
    },
  ],
  challenge: {
    generateTarget: () => ({ value: Math.random() * 2 }),
    matchThreshold: 0.95,
    proximityFn: (current, target) => 1 - Math.abs(current.param1 - target.value),
    targetConstraints: {
      minimumDistance: 0.3,
      maximumDistance: 0.95,
      difficultyProgression: 'fixed',
    },
  },
  feedback: {
    intensityFn: (params) => params.param1 / 2,
    notation: (params) => `Value = ${params.param1.toFixed(2)}`,
  },
  idle: { hintDelay: 15, hintType: 'pulse' },
  stageUnlock: {
    minimumEngagementSeconds: 5,
    intensityThreshold: 0.7,
    rangeExplorationThreshold: 0.6,
    timeFallbackSeconds: 45,
  },
}

// Use in your component
function MyModule() {
  const [params, setParams] = useState({ param1: 1 })

  const flow = useModuleFlow(config, params)
  const unlock = useStageUnlock(config.stageUnlock)
  const assist = useChallengeAssist()
  const a11y = useAccessibility()

  // Handle parameter changes
  const handleChange = (value: number) => {
    setParams({ param1: value })
    flow.recordInteraction()

    if (flow.state.phase === 'explore') {
      const intensity = config.feedback.intensityFn(params, 'explore')
      unlock.recordValue(value / 2, intensity) // normalized value

      if (unlock.shouldUnlock) {
        a11y.announce('Stage complete!')
        flow.advanceStage()
        unlock.reset()
      }
    }
  }

  // Render based on phase
  return (
    <div>
      {flow.state.phase === 'idle' && <IdleView />}
      {flow.state.phase === 'explore' && <ExploreView />}
      {flow.state.phase === 'challenge' && <ChallengeView assist={assist} />}
      {flow.state.phase === 'success' && <SuccessView />}
      {flow.state.phase === 'reveal' && <RevealView />}
    </div>
  )
}
```

## Hooks

### useModuleFlow
Core flow orchestration. Manages phase transitions and state.

### useStageUnlock
Stage unlock logic with three triggers: intensity, range exploration, time fallback.

### useChallengeAssist
Challenge failure path. Progressive hints, "try another", assisted solve.

### useAccessibility
A11y infrastructure. Announcements, focus management, keyboard helpers.

### useErrorRecovery
Error handling. WebGL context loss, FPS monitoring, tab visibility.

### useModuleAnalytics
Event tracking for usage analytics.

## Migration Guide

Existing modules can adopt skeleton hooks incrementally:

1. Add types to existing config
2. Replace custom phase logic with `useModuleFlow`
3. Replace unlock logic with `useStageUnlock`
4. Add `useChallengeAssist` for failure path
5. Add `useAccessibility` for a11y
6. Add `useModuleAnalytics` for tracking

No big-bang rewrite required.
