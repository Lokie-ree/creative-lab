# Portfolio Architecture Design

**Date:** 2026-01-09
**Status:** Approved
**Summary:** Transform the single-module learning app into a multi-module portfolio with constellation navigation.

---

## Overview

The current application flows from Hero → single Module → Celebration. This design introduces a **constellation hub** between Hero and Module, enabling visitors to explore multiple learning experiences while tracking their progress.

### Design Principles

- **Clean gateway**: The constellation picker is 2D and fast-loading; 3D immersion is reserved for modules
- **Soft progression**: Recommend a learning path but don't force it
- **Respect visitor time**: Auto-save progress, allow resumption across sessions
- **Mathematical aesthetic**: Constellation metaphor reflects the portfolio's identity

---

## Application Flow

```
Hero (spectacle) → Constellation (hub) → Module → Celebration → choice
                        ↑                              ↓
                        ←──────────────────────────────←
```

| View | Purpose |
|------|---------|
| **Hero** | Standalone visual experience establishing who you are. CTA leads to Constellation. |
| **Constellation** | Clean 2D hub displaying all modules as nodes in a mathematical graph. Fast loading, elegant, minimal. |
| **Module** | Immersive R3F learning experience. Progress auto-saves. Clear path back to Constellation. |
| **Celebration** | Completion modal offering choice: explore another module or keep playing with current one. |

---

## Constellation Picker

### Visual Structure

A sparse, elegant graph rendered in 2D (no R3F). Three nodes representing math domains, connected by thin lines suggesting conceptual flow.

```
        ○ Differential Equations
       /   "Phase Portraits"
      /
     ○ Linear Algebra
    /   "Vector Transformations"
   /
  ● Trigonometry ←── (glows softly as recommended start)
      "Sinusoidal Waves"
```

### Node Anatomy

Each node displays:
- **Domain name**: e.g., "Trigonometry"
- **Module title**: e.g., "Sinusoidal Waves"
- **State indicator** via visual treatment:
  - **Recommended**: Subtle animated glow (CSS pulse)
  - **Available**: Standard appearance, clearly clickable
  - **In Progress**: Partial ring or progress indicator
  - **Completed**: Checkmark or filled state

### Interaction

- **Hover**: Node elevates slightly, shows brief description tooltip
- **Click**: Transitions to that module
- Connecting lines are decorative—suggest relationships but aren't interactive

### Layout

Centered on page with generous whitespace. Constellation floats against dark navy background. Typography-forward: module names are the visual anchor.

---

## State Management & Persistence

### Local Storage Schema

```typescript
interface PortfolioState {
  modules: {
    [moduleId: string]: {
      status: 'not-started' | 'in-progress' | 'completed'
      currentStage?: string        // e.g., "amplitude", "frequency"
      currentSubStage?: string     // e.g., "explore", "match", "reflect"
      discoveries?: object         // module-specific progress data
      completedAt?: string         // ISO timestamp
    }
  }
  lastActiveModule?: string        // for "continue" prompt
}
```

### Module IDs

- `sinusoidal-waves`
- `vector-transformations`
- `phase-portraits`

### State Flow

1. **First visit**: All modules show "available", Trig glows as recommended
2. **Enter module**: Status updates to `in-progress`, stage/substage tracked
3. **Leave mid-module**: Progress preserved, can resume later
4. **Complete module**: Status becomes `completed`, timestamp recorded
5. **Return to constellation**: Completed nodes show checkmark, next recommended glows

### Implementation

A `usePortfolioState` hook reads/writes to local storage, exposed via React context.

---

## Navigation & Transitions

### Global Navigation

No persistent navbar. Minimal, contextual navigation:

| Context | Navigation |
|---------|------------|
| **Hero** | CTA button ("Explore Modules") is the only forward path |
| **Constellation** | Minimal header with name/logo as home link (returns to Hero) |
| **Module** | Subtle escape hatch (top-left): "← Back to modules" |

### Transition Patterns

| From | To | Transition |
|------|-----|------------|
| Hero | Constellation | Fade or slide-up |
| Constellation | Module | Fade to black (covers R3F initialization) |
| Module | Constellation | Quick fade, constellation shows updated state |
| Module | Celebration | Modal overlay |
| Celebration | Constellation | Modal closes, transitions to constellation |
| Celebration | Stay in Module | Modal dismisses |

### Loading States

Modules are lazy-loaded. Brief fade-to-black masks load time. If loading takes longer, minimal skeleton appears.

### Escape Hatch

Simplified to just "← Back to modules" that preserves progress silently. No confirmation needed since progress auto-saves.

---

## Component Organization

### File Structure

```
src/
├── components/
│   ├── constellation/           # NEW: Hub/picker components
│   │   ├── Constellation.tsx    # Main picker view
│   │   ├── ModuleNode.tsx       # Individual node component
│   │   ├── ConnectionLines.tsx  # SVG lines between nodes
│   │   └── index.ts
│   │
│   ├── modules/                 # Each module isolated
│   │   ├── sinusoidal/          # EXISTS
│   │   ├── vector-transforms/   # NEW
│   │   └── phase-portraits/     # NEW
│   │
│   ├── hero/                    # EXISTS
│   ├── shared/                  # EXISTS
│   ├── ui/                      # EXISTS
│   └── layout/
│       ├── Navigation.tsx       # NEW: Minimal nav header
│       └── EscapeHatch.tsx      # EXISTS: Simplified
│
├── hooks/
│   ├── usePortfolioState.ts     # NEW: Local storage state
│   ├── useModuleProgress.ts     # NEW: Per-module progress
│   └── useMatchScore.ts         # EXISTS
│
├── context/
│   └── PortfolioContext.tsx     # NEW: Global state provider
│
└── App.tsx                      # Updated: 3-view routing
```

### View Routing

```typescript
type View = 'hero' | 'constellation' | 'module'
type ModuleId = 'sinusoidal-waves' | 'vector-transformations' | 'phase-portraits'
```

---

## Module Registry

### Configuration

```typescript
// src/config/modules.ts

export interface ModuleConfig {
  id: string
  title: string
  domain: string
  description: string
  order: number
  component: () => Promise<any>
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'sinusoidal-waves',
    title: 'Sinusoidal Waves',
    domain: 'Trigonometry',
    description: 'Where does the wave come from?',
    order: 1,
    component: () => import('@/components/modules/sinusoidal/Module'),
  },
  {
    id: 'vector-transformations',
    title: 'Vector Transformations',
    domain: 'Linear Algebra',
    description: 'What does a matrix do to space?',
    order: 2,
    component: () => import('@/components/modules/vector-transforms/Module'),
  },
  {
    id: 'phase-portraits',
    title: 'Phase Portraits',
    domain: 'Differential Equations',
    description: 'How do systems evolve over time?',
    order: 3,
    component: () => import('@/components/modules/phase-portraits/Module'),
  },
]
```

Adding a new module = adding one entry to this array.

---

## Celebration Modal Updates

### Current → Updated

Same three tabs (Discovery, Behind This, Go Deeper), new action buttons:

```
┌─────────────────────────────────────────────┐
│        🎉 You discovered the wave!          │
│                                             │
│   [Discovery] [Behind This] [Go Deeper]     │
│                                             │
│   [Tab content...]                          │
│                                             │
│   ┌─────────────────┐  ┌────────────────┐  │
│   │ Keep Exploring  │  │ Next Module →  │  │
│   └─────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────┘
```

### Actions

- **Keep Exploring**: Dismisses modal, stays in sandbox mode
- **Next Module →**: Transitions to constellation with module marked complete. Shows next module name (e.g., "Next: Vector Transformations →")

If all modules complete, becomes "Back to Modules" or celebratory message.

---

## Resume Prompt

### When It Appears

User clicks on a module with `status: 'in-progress'`.

### The Prompt

```
┌─────────────────────────────────────────────┐
│   Welcome back!                             │
│                                             │
│   You were exploring amplitude.             │
│   Pick up where you left off?               │
│                                             │
│   [Start Fresh]        [Resume →]           │
└─────────────────────────────────────────────┘
```

### Behavior

- **Resume**: Module initializes at saved stage/substage with saved values
- **Start Fresh**: Clears progress, starts from `observe` stage

Prompt appears before R3F loads, keeping it lightweight.

---

## Recommended Progression Logic

### Algorithm

```typescript
function getRecommendedModule(
  modules: ModuleConfig[],
  state: PortfolioState
): string | null {
  const sorted = [...modules].sort((a, b) => a.order - b.order)

  // Prioritize in-progress module
  for (const module of sorted) {
    if (state.modules[module.id]?.status === 'in-progress') {
      return module.id
    }
  }

  // Find first non-completed module
  for (const module of sorted) {
    const status = state.modules[module.id]?.status
    if (status !== 'completed') {
      return module.id
    }
  }

  return null // All complete
}
```

### Priority

1. **In-progress module** (if any) — "finish what you started"
2. **Next incomplete** in order — "here's what's next"
3. **None** — all complete, constellation at rest

### Visual Treatment

Recommended module has subtle animated glow (CSS pulse, not R3F).

---

## Implementation Phases

### Phase 1: Core Architecture
- [ ] Create `PortfolioContext` and `usePortfolioState` hook
- [ ] Add module registry (`src/config/modules.ts`)
- [ ] Update `App.tsx` for three-view routing
- [ ] Create basic `Constellation` component

### Phase 2: Constellation Polish
- [ ] Build `ModuleNode` with state indicators
- [ ] Add `ConnectionLines` SVG
- [ ] Implement hover/click interactions
- [ ] Add recommended glow animation

### Phase 3: Navigation & Transitions
- [ ] Add minimal `Navigation` header
- [ ] Simplify `EscapeHatch`
- [ ] Implement view transitions
- [ ] Add loading states

### Phase 4: Progress Persistence
- [ ] Wire local storage to module state
- [ ] Build resume prompt
- [ ] Track stage/substage progress in sinusoidal module
- [ ] Update celebration modal with new actions

### Phase 5: Future Modules
- [ ] Scaffold `vector-transforms` module structure
- [ ] Scaffold `phase-portraits` module structure
- [ ] (Implementation of these modules is a separate effort)

---

## Open Questions

- Exact visual design of constellation nodes (to be refined in implementation)
- Animation timing for transitions
- Whether to show "time spent" or other analytics on completed modules
