# Constellation Phase 4: Two-Level Navigation & Grid Layout

## Overview

Transform the constellation from a single-level module view into a two-level navigation system with courses containing modules. Optimizes screen space on desktop while maintaining mobile experience.

## Navigation Architecture

### Flow
```
Hero → Course Hub → Module Constellation → Module
```

### URL Structure
- `/` - Hero landing page
- `/courses` - Course hub (grid of course nodes)
- `/courses/advanced-math` - Module constellation for Advanced Math
- `/courses/cs` - Module constellation for CS
- `/courses/advanced-math/sinusoidal` - Individual module

### State
- Course progress stored in existing `PortfolioContext`
- Aggregate course completion calculated from child modules

### Back Navigation
- Module constellation → Course hub (zoom out transition)
- Module → Module constellation (existing back button)

---

## Course Hub Visual Design

### Header
- **Primary:** "Randall LaPoint, Jr." (larger, white)
- **Secondary:** "Interactive Learning Experiences" (smaller, gray-400)
- Centered positioning

### Course Nodes
- **Size:** ~120px diameter (larger than module nodes ~80px)
- **Color-coded rings:**
  - Advanced Math: Cyan (`#22d3ee`)
  - CS: Purple (`#a855f7`)
- **Centered icon inside ring:**
  - Advanced Math: ∞ (infinity symbol)
  - CS: `</>` (brackets)
- **Course name** displayed below node
- **Segment arc** around ring showing module completion
  - Each segment = one module
  - Filled segments = completed modules

### Grid Layout (Responsive)
| Breakpoint | Columns |
|------------|---------|
| Mobile     | 1       |
| Tablet     | 2       |
| Desktop    | 3-4     |

- Gap between nodes: ~48px
- Centered alignment

### Background
- Same vignette: `radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%)`

---

## Module Constellation Changes

### Header
- **Primary:** Course name (e.g., "Advanced Math")
- **Back arrow** on left (triggers zoom-out to course hub)
- **Subtitle:** "Choose a module to explore"

### Layout (Hybrid Responsive)
| Breakpoint | Layout     | Direction    |
|------------|------------|--------------|
| Mobile     | Vertical   | Top to bottom |
| Desktop    | Horizontal | Left to right |

- First module (lowest order) appears at top (mobile) or left (desktop)

### Connector Segments
| Breakpoint | Dimensions | Orientation |
|------------|------------|-------------|
| Mobile     | `h-8 w-px` | Vertical    |
| Desktop    | `w-8 h-px` | Horizontal  |

- Default: gray (`bg-gray-600`)
- Completed: cyan + pulse (`bg-cyan-400 animate-ring-pulse`)

### Entrance Animation
- Same stagger pattern
- Direction adjusts: bottom-to-top (mobile), left-to-right (desktop)

### Module Nodes
- No changes to existing design
- Keep progress arcs, recommended indicator, ring styling

---

## Transitions & Animations

### Hero → Course Hub
- Existing fade/slide transition

### Course Hub → Module Constellation (Zoom In)
1. User clicks course node
2. Course node scales up and moves to center
3. Other course nodes fade out
4. Background stays constant (vignette)
5. Course node morphs/expands into full module constellation
6. Module nodes stagger in from expanded origin point
7. **Duration:** ~600-800ms total

### Module Constellation → Course Hub (Zoom Out)
1. Module nodes collapse toward center
2. View contracts back into course node
3. Other course nodes fade back in
4. Course node returns to grid position
5. **Duration:** ~600-800ms total

### Course Hub Entrance Animation
- Container: `staggerChildren: 0.1`, `delayChildren: 0.2`
- Nodes: fade + scale (0.8→1), 300ms duration

---

## Data Model

### Course Configuration (`src/config/courses.ts`)
```ts
interface Course {
  id: string           // 'advanced-math' | 'cs'
  name: string         // 'Advanced Math'
  icon: string         // '∞' | '</>'
  color: string        // '#22d3ee' | '#a855f7'
  order: number        // Display order in grid
  moduleIds: string[]  // ['sinusoidal', 'vector-transforms', ...]
}

export const COURSES: Course[] = [
  {
    id: 'advanced-math',
    name: 'Advanced Math',
    icon: '∞',
    color: '#22d3ee',
    order: 1,
    moduleIds: ['sinusoidal', 'vector-transforms', 'matrix-operations'],
  },
  {
    id: 'cs',
    name: 'CS',
    icon: '</>',
    color: '#a855f7',
    order: 2,
    moduleIds: [],
  },
]
```

### Module Updates (`src/config/modules.ts`)
- Add `courseId: string` field to each module
- Existing module structure otherwise unchanged

### Progress Calculation
- Course progress = completed modules / total modules
- Segment arc renders one segment per `moduleIds.length`
- Filled segments = modules with `status === 'completed'`

---

## Initial Courses

| Course        | Color   | Icon   | Modules                                      |
|---------------|---------|--------|----------------------------------------------|
| Advanced Math | Cyan    | ∞      | Sinusoidal Waves, Vector Transforms, TBD     |
| CS            | Purple  | </>    | (future)                                     |

---

## Files to Create/Modify

### New Files
- `src/config/courses.ts` - Course configuration
- `src/components/constellation/CourseHub.tsx` - Course grid view
- `src/components/constellation/CourseNode.tsx` - Individual course node
- `src/components/constellation/SegmentArc.tsx` - Multi-segment progress arc

### Modified Files
- `src/App.tsx` - Add course routing
- `src/config/modules.ts` - Add `courseId` field
- `src/components/constellation/Constellation.tsx` - Hybrid layout, filter by course
- `src/context/PortfolioContext.tsx` - Course progress calculation
