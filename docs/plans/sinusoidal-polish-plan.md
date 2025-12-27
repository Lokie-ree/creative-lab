# Sinusoidal Module Polish Plan

> 6-day implementation plan to elevate the interactive learning experience to Brilliant-quality standards.

## Overview

This plan transforms the existing sinusoidal wave module from a solid foundation into a polished, pedagogically-excellent experience. Each phase builds on the previous, with clear deliverables and verification criteria.

---

## Phase 1: Pedagogy Foundation (Day 1)

### Goal
Remove all "wrong answer" friction and reframe feedback as learning moments.

### Tasks

#### 1.1 Reframe Feedback Banner
**File:** `src/components/feedback/FeedbackBanner.tsx`

- [ ] Change "Not quite" to "Not this one — let's see why"
- [ ] Remove red color scheme for incorrect answers
- [ ] Use neutral warm tone instead (e.g., `#f5a623` amber)
- [ ] Always show "Why?" button, not just for correct answers
- [ ] Add subtle entrance animation (slide up from bottom)

**Before:**
```tsx
{correct ? "Correct!" : "Not quite"}
```

**After:**
```tsx
{correct ? "That's it!" : "Not this one — let's explore why"}
```

#### 1.2 Expand Why Modal for All Answers
**File:** `src/components/feedback/WhyModal.tsx`

- [ ] Accept both correct and incorrect explanation text
- [ ] For incorrect: explain why the selected answer doesn't match
- [ ] Add "Try Again" button for incorrect answers
- [ ] Softer copy: "Here's what's happening..." instead of clinical explanations

#### 1.3 Update Question Data Structure
**File:** `src/App.tsx`

- [ ] Add `wrongExplanations` object to QUESTIONS config
- [ ] Each wrong choice gets a specific explanation
- [ ] Example for amplitude question:
  ```typescript
  wrongExplanations: {
    1.0: "At A=1, the wave height stays the same as the original.",
    1.5: "A=1.5 makes the wave 1.5× taller, but we asked for double.",
    2.5: "A=2.5 makes it 2.5× taller — more than double!",
  }
  ```

#### 1.4 Remove Error State Iconography
**Files:** `FeedbackBanner.tsx`, `QuestionCard.tsx`

- [ ] Replace `XCircle` icon with `Lightbulb` or `Info` icon
- [ ] Remove all red (`text-red-*`, `bg-red-*`) color classes
- [ ] Use consistent accent color throughout

### Verification
- [ ] No red colors visible anywhere in the UI
- [ ] "Why?" button appears for both correct and incorrect answers
- [ ] Incorrect feedback feels educational, not punitive

---

## Phase 2: Visual Feedback System (Day 2)

### Goal
Implement glow-based proximity feedback so users feel progress before hitting exact match.

### Tasks

#### 2.1 Create Match Score Context
**New File:** `src/hooks/useMatchContext.tsx`

- [ ] Create React context to share match score across components
- [ ] Expose `matchScore`, `individualScores` (per parameter)
- [ ] Calculate in real-time as parameters change

```typescript
interface MatchContext {
  matchScore: number // 0-100 overall
  scores: {
    amplitude: number
    frequency: number
    phase: number
  }
  isMatched: boolean
}
```

#### 2.2 Implement Wave Glow Effect
**File:** `src/components/modules/sinusoidal/SineWave.tsx`

- [ ] Accept `glowIntensity` prop (0-1)
- [ ] Add emissive material property that scales with intensity
- [ ] Subtle color shift: base → accent as score increases
- [ ] Consider adding bloom post-processing (optional, performance-dependent)

```typescript
// Material with dynamic glow
<lineBasicMaterial
  color={color}
  transparent
  opacity={opacity}
  // Add emissive based on match proximity
/>
```

#### 2.3 Circle Point Glow
**File:** `src/components/modules/sinusoidal/UnitCircle.tsx`

- [ ] Add pulsing glow when near match
- [ ] Glow radius increases with proximity
- [ ] Subtle "snap" feel when within threshold

#### 2.4 Ghost Wave Enhancement
**File:** `src/components/modules/sinusoidal/Scene.tsx`

- [ ] Make ghost wave slightly more visible when user is close
- [ ] Add subtle "merge" effect when waves align
- [ ] Ghost fades to full opacity briefly on exact match

### Verification
- [ ] Moving slider shows visible glow change
- [ ] Near-match feels "warm" and encouraging
- [ ] Exact match has satisfying visual confirmation

---

## Phase 3: Progressive Discovery (Days 3-4)

### Goal
Build the equation progressively so users see their discoveries stack up.

### Tasks

#### 3.1 Create Formula Preview Component
**New File:** `src/components/feedback/FormulaPreview.tsx`

- [ ] Shows building equation: `y = ? × sin(?t + ?)`
- [ ] Revealed values replace `?` as stages complete
- [ ] Positioned subtly (top-right or floating)
- [ ] Animate each reveal with GSAP

```
Stage 1: y = ? × sin(?t + ?)
Stage 2: y = 2.0 × sin(?t + ?)  ← amplitude revealed
Stage 3: y = 2.0 × sin(2.0t + ?) ← frequency revealed
Stage 4: y = 2.0 × sin(2.0t + π/2) ← phase revealed
```

#### 3.2 Implement Parameter Stacking
**File:** `src/App.tsx`

- [ ] After amplitude stage: lock amplitude at discovered value
- [ ] After frequency stage: lock frequency at discovered value
- [ ] Challenge stage: unlock all for free exploration
- [ ] Show locked values with `accentMuted` color

#### 3.3 Update Control Panel for Locked Display
**File:** `src/components/controls/ControlPanel.tsx`

- [ ] Show locked parameters as read-only with discovered values
- [ ] Visual distinction: locked sliders show value but aren't interactive
- [ ] "You discovered: A = 2.0" label above locked slider

#### 3.4 Stage Transition Animations
**File:** `src/App.tsx` + new animation utilities

- [ ] GSAP timeline for stage transitions
- [ ] Fade out old controls → fade in new
- [ ] Brief celebration pulse between stages
- [ ] Formula preview updates with stagger animation

#### 3.5 Discovery Memory State
**New:** Add to App.tsx state

```typescript
const [discoveries, setDiscoveries] = useState({
  amplitude: null as number | null,
  frequency: null as number | null,
  phase: null as number | null,
})
```

- [ ] Store discovered values when stage completes
- [ ] Use discoveries to populate formula preview
- [ ] Pass to control panel for locked display

### Verification
- [ ] Completing amplitude stage shows "A = 2.0" locked
- [ ] Formula preview builds up across stages
- [ ] Challenge stage shows full discovered equation as starting point

---

## Phase 4: Design System Consolidation (Day 4)

### Goal
Centralize all design tokens for consistency and maintainability.

### Tasks

#### 4.1 Create Color Token File
**New File:** `src/lib/colors.ts`

```typescript
export const colors = {
  dark: {
    bg: '#0a0a0f',
    surface: '#12121a',
    surfaceElevated: '#1a1a24',
    accent: '#c8e44c',
    accentHover: '#d4f06a',
    accentMuted: '#888888',
    geometry: '#3B82F6',
    text: '#e0e0e0',
    textMuted: '#888888',
    textDim: '#6b7280',
    border: '#2a2a3a',
    borderSubtle: '#1f1f2a',
  },
  // Light mode tokens (future)
  light: {
    bg: '#F5F5F7',
    surface: '#FFFFFF',
    accent: '#E67E22',
    // ...
  }
} as const

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
} as const
```

#### 4.2 Update Components to Use Tokens
**Files:** All component files

- [ ] Replace hardcoded `#c8e44c` with `colors.dark.accent`
- [ ] Replace hardcoded `#888888` with `colors.dark.accentMuted`
- [ ] Replace hardcoded `#0a0a0f` with `colors.dark.bg`
- [ ] Replace hardcoded `#12121a` / `#1a1a24` with `colors.dark.surface`
- [ ] Replace hardcoded `#2a2a3a` with `colors.dark.border`

#### 4.3 Standardize Border Radius
**Files:** All component files

- [ ] Continue button: `rounded-full` (pill shape)
- [ ] Cards/modals: `rounded-2xl` (16px)
- [ ] Input controls: `rounded-lg` (8px)
- [ ] Small badges: `rounded-xl` (12px)

#### 4.4 Typography Consistency
**Consider:** Create typography utilities or update Tailwind config

- [ ] Headings: `text-xl font-medium`
- [ ] Body: `text-base`
- [ ] Labels: `text-sm text-textMuted`
- [ ] Values: `font-mono text-accent`

### Verification
- [ ] No hardcoded hex colors in component files
- [ ] All colors imported from `colors.ts`
- [ ] Visual consistency across all components

---

## Phase 5: Micro-interactions & Polish (Day 5)

### Goal
Add delightful micro-interactions that make the experience feel premium.

### Tasks

#### 5.1 Stage Completion Celebration
**New File:** `src/components/feedback/StageCelebration.tsx`

- [ ] Brief pulse/glow effect when stage target is matched
- [ ] Subtle particle burst (optional, R3F particles)
- [ ] Text: "Got it!" fades in and out
- [ ] Triggers before question card appears

#### 5.2 Slider Interaction Polish
**File:** `src/components/ui/slider.tsx`

- [ ] Add subtle haptic-style feedback (CSS transform pulse on change)
- [ ] Value tooltip follows thumb during drag
- [ ] "Snap" feel when hitting nice values (0.5, 1.0, 1.5, 2.0)

#### 5.3 Button Hover States
**All button components**

- [ ] Scale up slightly on hover (transform: scale(1.02))
- [ ] Glow effect on primary buttons
- [ ] Press state: scale down (0.98)

#### 5.4 Loading/Transition States
**File:** `src/App.tsx`

- [ ] Brief loading shimmer on initial load
- [ ] Smooth canvas fade-in
- [ ] Stage indicator pulses during transition

#### 5.5 Observe Stage Enhancement
**Files:** `Scene.tsx`, `UnitCircle.tsx`

- [ ] Make circle draggable immediately (not after 5s)
- [ ] Show subtle prompt: "Drag the point" with arrow indicator
- [ ] Continue button appears after user has dragged

### Verification
- [ ] Every interaction has visual feedback
- [ ] Transitions feel smooth and intentional
- [ ] No jarring state changes

---

## Phase 6: Final Polish & Testing (Day 6)

### Goal
Comprehensive testing, edge case handling, and final refinements.

### Tasks

#### 6.1 Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify touch interactions work smoothly
- [ ] Check slider responsiveness on small screens
- [ ] Ensure modals don't overflow viewport

#### 6.2 Edge Case Handling
- [ ] Phase wrap-around (2π → 0 smoothly)
- [ ] Rapid slider movement doesn't break animations
- [ ] Multiple quick stage transitions
- [ ] Browser back/forward behavior

#### 6.3 Performance Audit
- [ ] Check R3F frame rate on low-end devices
- [ ] Verify no memory leaks in animation loops
- [ ] Optimize re-renders (React DevTools Profiler)
- [ ] Consider `React.memo` for expensive components

#### 6.4 Accessibility Review
- [ ] Keyboard navigation through all controls
- [ ] Focus indicators visible on dark background
- [ ] Screen reader announcements for stage changes
- [ ] Reduced motion support (`prefers-reduced-motion`)

#### 6.5 Code Cleanup
**File:** `src/App.tsx`

- [ ] Consolidate repetitive control panel rendering
- [ ] Extract stage configuration to separate file
- [ ] Remove unused imports and variables
- [ ] Add JSDoc comments to key functions

#### 6.6 Final Visual Review
- [ ] Screenshot each stage
- [ ] Compare against Brilliant.org styling
- [ ] Check color contrast ratios
- [ ] Verify consistent spacing throughout

### Verification
- [ ] Works on mobile devices
- [ ] No console errors or warnings
- [ ] Lighthouse accessibility score > 90
- [ ] Smooth 60fps animations throughout

---

## File Change Summary

### New Files
```
src/lib/colors.ts                          # Design tokens
src/hooks/useMatchContext.tsx              # Match score context
src/components/feedback/FormulaPreview.tsx # Building equation display
src/components/feedback/StageCelebration.tsx # Match celebration effect
```

### Major Modifications
```
src/App.tsx                                # State management, stage logic
src/components/feedback/FeedbackBanner.tsx # No-wrong-answers reframe
src/components/feedback/WhyModal.tsx       # Expanded explanations
src/components/controls/ControlPanel.tsx   # Locked state display
src/components/modules/sinusoidal/SineWave.tsx    # Glow effect
src/components/modules/sinusoidal/UnitCircle.tsx  # Enhanced interactivity
src/components/modules/sinusoidal/Scene.tsx       # Ghost wave behavior
```

### Minor Modifications
```
src/components/ui/slider.tsx               # Interaction polish
src/components/shared/ParameterSlider.tsx  # Token updates
src/components/feedback/QuestionCard.tsx   # Token updates
src/components/FormulaReveal.tsx           # Token updates
```

---

## Success Criteria

### Pedagogical
- [ ] Zero "error" or "wrong" language in the UI
- [ ] Users understand why each answer is correct/incorrect
- [ ] Formula builds progressively across stages
- [ ] Discoveries feel earned, not given

### Visual
- [ ] All colors from centralized tokens
- [ ] Glow feedback provides proximity awareness
- [ ] Consistent border radius and spacing
- [ ] Smooth 60fps animations throughout

### Technical
- [ ] No hardcoded colors in components
- [ ] Clean component separation
- [ ] Mobile-responsive at all breakpoints
- [ ] Accessibility score > 90

### Experience
- [ ] Feels like a Brilliant module
- [ ] Every interaction has feedback
- [ ] Stage transitions are smooth
- [ ] Challenge mode is satisfying to complete

---

## Dependencies

### Required
- GSAP (already installed)
- React Three Fiber (already installed)

### Optional Additions
- `@react-three/postprocessing` — For bloom/glow effects
- `use-sound` — For audio feedback (stretch goal)

---

## Notes

- Each phase is designed to be independently deployable
- Phase 3 (Progressive Discovery) is the highest-impact change
- Phase 4 (Design System) enables easier iteration going forward
- Phases can be parallelized if working with multiple contributors
