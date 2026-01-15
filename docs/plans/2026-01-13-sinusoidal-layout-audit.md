# Sinusoidal Waves Module - Layout & UX Audit
> **Date:** January 13, 2026  
> **Purpose:** Comprehensive audit of current layout, positioning, components, and animations for phased redesign  
> **Status:** Brainstorming Phase

---

## Executive Summary

The current implementation has solid functionality but lacks polished visual hierarchy and spatial organization. Elements compete for attention, positioning is inconsistent across stages, and transitions feel abrupt. This audit captures the current state to inform a phased redesign.

---

## Available ShadCN Components

### Currently Used
- ✅ **Card** (`card.tsx`) - Used in QuestionCard
- ✅ **Alert** (`alert.tsx`) - Used in FeedbackBanner
- ✅ **Progress** (`progress.tsx`) - Used in ProgressBar
- ✅ **Button** (`button.tsx`) - Available but using custom buttons
- ✅ **Badge** (`badge.tsx`) - Used in BehindThisTab

### Available but Unused
- **Dialog** (`dialog.tsx`) - Could replace modals
- **Tooltip** (`tooltip.tsx`) - Could add contextual help
- **Tabs** (`tabs.tsx`) - Could organize reveal stage content
- **Accordion** (`accordion.tsx`) - Could organize "Behind This" content
- **Avatar** (`avatar.tsx`) - Not applicable
- **Dropdown Menu** (`dropdown-menu.tsx`) - Could add settings/options
- **Slider** (`slider.tsx`) - Already using custom ParameterSlider

### Custom Components
- **AnimatedPanel** - GSAP-based fade/slide transitions
- **ExplorePrompt** - Text prompts with setup copy
- **CelebrationPulse** - Full-screen pulse effect
- **FormulaPreview** - Animated formula display
- **QuestionCard** - Wraps ShadCN Card
- **FeedbackBanner** - Wraps ShadCN Alert
- **ControlPanel** - Custom slider container

---

## Current Layout Analysis by Stage

### Stage: OBSERVE

**Visible Elements:**
1. **ProgressBar** - `z-20`, `absolute top-0`
2. **ExplorePrompt** - `z-10`, `absolute top-4 sm:top-8`, centered horizontally
   - Contains: setup copy, main prompt, subtext
3. **Scene** (3D visualization) - `flex-1 min-h-0` (takes remaining space)
4. **Continue Button** - `z-10`, `absolute bottom-4 sm:bottom-8`, centered

**Issues:**
- ExplorePrompt positioned at `left-16` on mobile, centered on desktop - inconsistent
- No visual container for prompt (floating text)
- Continue button appears after 5s delay (no visual cue it's coming)
- FormulaPreview not shown (correct, but space reserved in layout)

**Z-Index Hierarchy:**
- ProgressBar: `z-20`
- Everything else: `z-10`
- CelebrationPulse: `z-50` (overlay)

---

### Stage: AMPLITUDE (explore substage)

**Visible Elements:**
1. **ProgressBar** - `z-20`, top
2. **FormulaPreview** - `z-10`, `absolute top-16 right-2 sm:top-8 sm:right-4`
3. **ExplorePrompt** - `z-10`, `absolute top-4 sm:top-8`, centered
4. **Scene** - `flex-1 min-h-0`
5. **ControlPanel** (amplitude slider only) - `z-10`, `absolute bottom-4 sm:bottom-8`, centered
   - Wrapped in AnimatedPanel
   - `max-w-sm` width
   - `w-[calc(100vw-2rem)]` on mobile

**Issues:**
- FormulaPreview in top-right corner (could conflict with prompt on small screens)
- ControlPanel at bottom competes with Scene for attention
- No visual connection between slider and visualization
- ExplorePrompt setup copy might be too long for mobile
- AnimatedPanel animates on mount but no exit animation when stage changes

**Spacing Conflicts:**
- Top: ProgressBar (h-1) + ExplorePrompt (variable height) + FormulaPreview (variable)
- Bottom: ControlPanel (variable height based on content)
- Scene squeezed in middle

---

### Stage: AMPLITUDE (match substage)

**Visible Elements:**
1. All from explore substage
2. **Match Celebration** - `z-20`, `absolute bottom-20 sm:bottom-24 md:bottom-32`, centered
   - "Perfect match!" title
   - Discovery label text
   - `animate-in fade-in zoom-in duration-300`

**Issues:**
- Celebration overlaps with ControlPanel (both trying to be bottom-center)
- Celebration appears for 2 seconds then auto-transitions (no user control)
- No visual connection to what was matched
- Text-only celebration (could use icons/visuals)

**Timing:**
- Match detected → Celebration appears → 2s delay → Auto-transition to reflect

---

### Stage: AMPLITUDE (reflect substage)

**Visible Elements:**
1. ProgressBar, FormulaPreview, ExplorePrompt (hidden)
2. **Scene** - `pb-20 sm:pb-24` (extra padding for bottom content)
3. **QuestionCard** - `z-20`, `absolute bottom-20 sm:bottom-24 md:bottom-32`, centered
4. **FeedbackBanner** - `z-30`, `fixed bottom-0`, full width
   - Shows when answer selected
   - Contains: icon, feedback text, action button

**Issues:**
- QuestionCard and FeedbackBanner both at bottom (could overlap)
- FeedbackBanner is `fixed` (covers everything) vs others are `absolute`
- Scene padding added but feels arbitrary
- No transition animation when moving from match → reflect
- QuestionCard uses same positioning as celebration (reused space, but no smooth transition)

**Layout Hierarchy:**
- FeedbackBanner: `z-30` (highest, always on top)
- QuestionCard: `z-20`
- Everything else: `z-10`

---

### Stage: FREQUENCY (explore substage)

**Same as Amplitude explore, but:**
- ControlPanel shows both amplitude (locked) and frequency (active)
- `max-w-md` width (wider than amplitude stage)
- Amplitude slider shows discovered value but is locked

**Issues:**
- Same positioning issues as amplitude
- Locked slider visual state unclear (just shows value, no clear "locked" indicator)
- Two sliders in grid layout might be cramped on mobile

---

### Stage: FREQUENCY (match/reflect)

**Same issues as Amplitude match/reflect stages**

---

### Stage: CHALLENGE (observe phase)

**Visible Elements:**
1. ProgressBar, FormulaPreview, ExplorePrompt
2. Scene (showing both waves)
3. No controls visible

**Issues:**
- 3 second observation period (no countdown or visual indicator)
- User might not know what to look for
- ExplorePrompt says "Something changed" but vague

---

### Stage: CHALLENGE (diagnose phase)

**Visible Elements:**
1. ProgressBar, FormulaPreview
2. ExplorePrompt hidden
3. **QuestionCard** - `z-20`, `absolute bottom-20 sm:bottom-24 md:bottom-32`
   - "What changed?" question
   - 3 choices: Amplitude, Frequency, Both

**Issues:**
- QuestionCard appears suddenly (no transition from observe)
- Same positioning as reflect stage QuestionCard (consistent, but feels disconnected)
- No visual highlight of the waves to help diagnosis
- Scene still visible but user focused on question

---

### Stage: CHALLENGE (match phase)

**Visible Elements:**
1. ProgressBar, FormulaPreview, ExplorePrompt (with match prompt)
2. Scene
3. **ControlPanel** - `z-10`, `absolute bottom-4 sm:bottom-8`
   - Shows both sliders
   - One locked (the parameter that didn't change)
   - Shows matchScore feedback

**Issues:**
- ExplorePrompt and ControlPanel both visible (redundant?)
- Match score feedback is text-only ("Almost there...", "Getting closer...")
- No visual progress indicator for match score
- Same positioning issues as other stages

---

### Stage: REVEAL (completion)

**Visible Elements:**
1. ProgressBar, FormulaPreview, ExplorePrompt (title + description)
2. Scene
3. **"So What" Panel** - `z-10`, `absolute bottom-32 sm:bottom-40`, centered
   - `max-w-2xl` width
   - Contains reveal copy (real-world connections)
   - Wrapped in AnimatedPanel
4. **Action Buttons** - `z-10`, `absolute bottom-4 sm:bottom-8`, centered
   - "Try Another", "Explore", "Finish"
   - Flex row on desktop, column on mobile

**Issues:**
- "So What" panel and buttons both at bottom (spacing: `bottom-32` vs `bottom-4`)
- Panel might be too low on mobile (could be cut off)
- Three buttons in row might be cramped
- No visual separation between "So What" content and actions
- ExplorePrompt still showing (might be redundant with "So What" panel)

---

### Stage: REVEAL (freeExplore substage)

**Visible Elements:**
1. ProgressBar, FormulaPreview, ExplorePrompt ("Free exploration")
2. Scene
3. **ControlPanel** - `z-10`, `absolute bottom-4 sm:bottom-8`
   - All sliders unlocked
   - No match score

**Issues:**
- Same positioning as other ControlPanel instances
- ExplorePrompt says "Free exploration" but user already knows this

---

## Animation & Transition Analysis

### Current Animation Patterns

#### 1. AnimatedPanel (GSAP)
- **Trigger:** `transitionKey` prop changes
- **Animation:** `opacity: 0 → 1`, `y: 20 → 0`
- **Duration:** 0.4s
- **Easing:** `power2.out`
- **Issues:**
  - Only animates IN, no exit animation
  - Same animation for all panels (no variety)
  - Key change detection might miss some transitions

#### 2. CelebrationPulse
- **Trigger:** `celebrationCount` increments
- **Animation:** Scale `0.5 → 3`, opacity `0.8 → 0`
- **Duration:** 0.8s
- **Easing:** `power2.out`
- **Issues:**
  - Full-screen overlay (might be too much)
  - No visual connection to what triggered it
  - Only one pulse per trigger (could be more celebratory)

#### 3. FormulaPreview (GSAP)
- **Trigger:** Discovery value changes from null to number
- **Animation:** Scale `1.3 → 1`, color change
- **Duration:** 0.4s
- **Easing:** `back.out(1.7)` (bouncy)
- **Issues:**
  - Only animates individual values, not the whole component
  - No animation when component first appears

#### 4. ExplorePrompt
- **Animation:** CSS `transition-opacity duration-1000`
- **Trigger:** `visible` prop
- **Issues:**
  - Only opacity fade, no position/size animation
  - 1s duration might be too slow
  - Setup copy appears instantly (no stagger)

#### 5. Match Celebration
- **Animation:** Tailwind `animate-in fade-in zoom-in duration-300`
- **Trigger:** `subStage === 'match'`
- **Issues:**
  - Uses Tailwind animations (not GSAP, inconsistent)
  - Auto-transitions after 2s (no user interaction)
  - No exit animation

#### 6. FeedbackBanner
- **Animation:** Tailwind `animate-in slide-in-from-bottom duration-300`
- **Trigger:** Answer selected
- **Issues:**
  - `fixed` positioning (covers everything)
  - Slides in from bottom but might cover QuestionCard
  - No exit animation when dismissed

### Missing Transitions

1. **Stage Changes:**
   - No transition when moving from observe → amplitude
   - No transition when moving from amplitude → frequency
   - No transition when moving from frequency → challenge
   - No transition when moving from challenge → reveal

2. **SubStage Changes:**
   - explore → match: Instant (celebration just appears)
   - match → reflect: 2s delay then instant (no animation)
   - reflect → next stage: Instant after continue

3. **Component Mount/Unmount:**
   - ControlPanel: Only AnimatedPanel fade-in, no exit
   - QuestionCard: No animation on mount/unmount
   - ExplorePrompt: Only opacity fade, no position animation

4. **State Changes:**
   - Slider value changes: No visual feedback (just updates Scene)
   - Match score updates: No animation (just text changes)
   - Discovery updates: Only FormulaPreview value animates

---

## Z-Index Hierarchy

Current z-index values:
- `z-50`: CelebrationPulse (overlay)
- `z-30`: FeedbackBanner (fixed bottom)
- `z-20`: ProgressBar, Match Celebration, QuestionCard
- `z-10`: Everything else (FormulaPreview, ExplorePrompt, ControlPanel, Buttons, Reveal Panel)

**Issues:**
- Too many elements at `z-10` (no clear hierarchy)
- FeedbackBanner at `z-30` might cover important content
- No clear layering system

**Recommendation:**
- `z-50`: Overlays (CelebrationPulse, Modals)
- `z-40`: Fixed UI (FeedbackBanner, Notifications)
- `z-30`: Floating UI (FormulaPreview, Tooltips)
- `z-20`: Interactive Content (QuestionCard, Match Celebration)
- `z-10`: Controls (ControlPanel, Buttons)
- `z-0`: Base Content (Scene, ProgressBar, ExplorePrompt)

---

## Positioning Patterns

### Top Area
- **ProgressBar:** `top-0` (always visible)
- **FormulaPreview:** `top-16 right-2` (mobile) / `top-8 right-4` (desktop)
- **ExplorePrompt:** `top-4 left-16` (mobile) / `top-8` centered (desktop)

**Issues:**
- Inconsistent left/right/center positioning
- Mobile has `left-16` offset (why?)
- FormulaPreview and ExplorePrompt could overlap on small screens
- No max-width constraints on ExplorePrompt

### Bottom Area
- **ControlPanel:** `bottom-4 sm:bottom-8` (most stages)
- **QuestionCard:** `bottom-20 sm:bottom-24 md:bottom-32`
- **Match Celebration:** `bottom-20 sm:bottom-24 md:bottom-32`
- **FeedbackBanner:** `bottom-0` (fixed)
- **Reveal Panel:** `bottom-32 sm:bottom-40`
- **Action Buttons:** `bottom-4 sm:bottom-8`

**Issues:**
- Too many different bottom positions
- QuestionCard and Match Celebration use same position (good for reuse, but no transition)
- FeedbackBanner fixed at `bottom-0` covers everything
- Reveal Panel might be too low on mobile

### Center Area
- **Scene:** `flex-1 min-h-0` (takes remaining space)
- **Match Celebration:** Centered horizontally
- **QuestionCard:** Centered horizontally

**Issues:**
- Scene has no padding/margins (touches edges)
- No visual container for Scene
- Centered elements use `left-1/2 -translate-x-1/2` (consistent, but verbose)

---

## Responsive Breakpoints

Current breakpoints used:
- `sm:` - 640px (small tablets)
- `md:` - 768px (tablets)
- `lg:` - 1024px (desktops) - rarely used

**Issues:**
- Inconsistent use of breakpoints
- Some elements only have mobile/desktop variants (missing tablet)
- ControlPanel width: `max-w-sm` (amplitude) vs `max-w-md` (frequency) - inconsistent
- QuestionCard: `max-w-[90vw] sm:max-w-md` - good responsive handling

---

## Component-Specific Issues

### ExplorePrompt
- **Current:** Plain text with opacity transition
- **Issues:**
  - No visual container (floating text)
  - Setup copy might be too long
  - No max-width on mobile (could overflow)
  - Position inconsistent (left-16 on mobile, centered on desktop)

### FormulaPreview
- **Current:** Top-right corner, small card
- **Issues:**
  - Could conflict with ExplorePrompt on small screens
  - No animation when first appearing
  - Position feels arbitrary (why top-right?)
  - Could use tooltip or better positioning

### ControlPanel
- **Current:** Bottom center, black background with backdrop blur
- **Issues:**
  - `bg-black/80` might be too dark
  - No visual connection to Scene
  - Width inconsistent between stages
  - Locked sliders not clearly indicated
  - Match score feedback is text-only (could be visual)

### QuestionCard
- **Current:** ShadCN Card, bottom center
- **Issues:**
  - Good component choice
  - But positioning feels disconnected from Scene
  - No visual connection to what it's asking about
  - Choices are buttons (good), but could use better hover states

### FeedbackBanner
- **Current:** ShadCN Alert, fixed bottom
- **Issues:**
  - `fixed` positioning covers everything (might block Scene)
  - Good for accessibility (always visible)
  - But could be less intrusive
  - Action button styling is good

### Match Celebration
- **Current:** Plain text, centered
- **Issues:**
  - No visual container (floating text)
  - Could use icons, animations, or visual effects
  - Auto-transitions (no user control)
  - Discovery label is good but could be more prominent

### Reveal "So What" Panel
- **Current:** AnimatedPanel with backdrop blur
- **Issues:**
  - Good use of AnimatedPanel
  - But positioning might be too low
  - Text-only (could use icons, visuals, or formatting)
  - No visual separation from action buttons

---

## Animation Timing Issues

### Current Timings
1. **Observe → Continue:** 5s delay (no visual cue)
2. **Match → Reflect:** 2s delay (feels arbitrary)
3. **Challenge Observe → Diagnose:** 3s delay (no countdown)
4. **Reflect Flash:** 1.2s (feels fast)
5. **Challenge Match → Reveal:** 0.8s delay (feels arbitrary)

**Issues:**
- All delays are arbitrary (no user control)
- No visual feedback during delays
- Transitions feel abrupt (no easing between stages)

---

## Visual Hierarchy Issues

### Current Hierarchy (by visual weight)
1. Scene (3D visualization) - Dominates screen
2. ControlPanel (dark background) - High contrast
3. QuestionCard (white card) - Stands out
4. FeedbackBanner (colored alert) - High contrast
5. ExplorePrompt (text) - Low contrast
6. FormulaPreview (small card) - Easy to miss
7. ProgressBar (thin line) - Minimal

**Issues:**
- Scene dominates (good) but other elements compete
- No clear reading order
- ExplorePrompt (important) has low visual weight
- FormulaPreview (important) is easy to miss
- ControlPanel (interactive) might be too prominent

---

## Mobile-Specific Issues

1. **ExplorePrompt:** `left-16` offset on mobile (why? could be centered)
2. **FormulaPreview:** `top-16` on mobile (lower than desktop)
3. **ControlPanel:** `w-[calc(100vw-2rem)]` (good, but padding inconsistent)
4. **QuestionCard:** `max-w-[90vw]` (good responsive handling)
5. **Scene:** Portrait mode has different layout (circle on top, waves below)
6. **Action Buttons:** Stack vertically on mobile (good)

**Issues:**
- Inconsistent spacing on mobile
- Some elements might be too small to tap (44px min-height is good)
- Scene layout changes dramatically (good for space, but might be disorienting)

---

## Accessibility Issues

1. **Focus Management:**
   - No visible focus indicators on buttons
   - No focus trap in modals
   - Focus might jump unexpectedly on stage changes

2. **Screen Reader:**
   - ExplorePrompt setup copy might be too verbose
   - Match celebrations are visual-only (no ARIA announcements)
   - FormulaPreview uses font-mono (good for readability)

3. **Keyboard Navigation:**
   - Sliders might not be keyboard accessible
   - QuestionCard choices are buttons (good)
   - No keyboard shortcuts documented

4. **Color Contrast:**
   - Text colors use CSS variables (good for theming)
   - But contrast ratios not verified
   - Ghost wave opacity (0.5) might be too low for some users

---

## Performance Considerations

1. **GSAP Animations:**
   - Multiple GSAP instances (could be optimized)
   - AnimatedPanel creates new animation on every key change
   - CelebrationPulse animation might be heavy

2. **3D Scene:**
   - React Three Fiber renders continuously
   - Multiple meshes (circle, wave, ghost wave, connector)
   - Performance on low-end devices unknown

3. **Re-renders:**
   - Slider changes trigger Scene re-render
   - Stage changes trigger multiple component mounts/unmounts
   - No memoization visible (could optimize)

---

## Design System Gaps

1. **Spacing:**
   - No consistent spacing scale
   - Mix of `4`, `8`, `16`, `20`, `24`, `32`, `40` (arbitrary)
   - Should use design tokens

2. **Typography:**
   - Mix of `text-sm`, `text-base`, `text-lg` (inconsistent)
   - No clear type scale
   - Font weights: `font-medium`, `font-bold`, `font-semibold` (inconsistent)

3. **Colors:**
   - Uses CSS variables (good)
   - But no clear color system documentation
   - Ghost wave color is hardcoded in Scene

4. **Shadows/Borders:**
   - Mix of `border`, `border-2`, `rounded-lg`, `rounded-xl` (inconsistent)
   - No shadow system
   - Backdrop blur used inconsistently

---

## Recommendations for Phased Redesign

### Phase 1: Layout Foundation
1. **Establish consistent spacing system**
2. **Create layout grid/container system**
3. **Fix z-index hierarchy**
4. **Standardize positioning patterns**

### Phase 2: Component Polish
1. **Add visual containers to floating elements**
2. **Improve ControlPanel styling**
3. **Enhance Match Celebration visuals**
4. **Better mobile positioning**

### Phase 3: Animation System
1. **Create unified animation system**
2. **Add stage transition animations**
3. **Improve component mount/unmount animations**
4. **Add micro-interactions**

### Phase 4: Visual Hierarchy
1. **Establish clear reading order**
2. **Improve visual weight distribution**
3. **Add visual connections between elements**
4. **Enhance feedback mechanisms**

### Phase 5: Responsive & Accessibility
1. **Fix mobile positioning issues**
2. **Improve keyboard navigation**
3. **Add ARIA labels and announcements**
4. **Verify color contrast**

---

## Browser Testing Notes

**Note:** Manual browser testing should be performed at `localhost:5173` to verify:
- Actual rendering on different screen sizes
- Animation performance
- Touch interactions on mobile
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Visual hierarchy perception

**Recommended Test Scenarios:**
1. Full module flow on desktop (1920x1080)
2. Full module flow on tablet (768x1024)
3. Full module flow on mobile (375x667)
4. Stage transitions (observe → amplitude → frequency → challenge → reveal)
5. Match celebrations (amplitude and frequency)
6. Question interactions (reflect stage)
7. Challenge flow (observe → diagnose → match)
8. Reveal stage interactions (buttons, free explore)

---

## Next Steps

1. **Create design system tokens** (spacing, typography, colors)
2. **Design layout grid system** (consistent containers)
3. **Prototype new positioning** (test in browser)
4. **Create animation library** (reusable transitions)
5. **Build component variants** (polished versions)
6. **Test responsive breakpoints** (verify on devices)
7. **Implement phased changes** (one phase at a time)

---

## Questions to Resolve

1. Should ExplorePrompt have a visual container (card/panel)?
2. Should FormulaPreview be repositioned or redesigned?
3. Should ControlPanel be elevated/floating or integrated?
4. Should Match Celebration be more visual (icons, animations)?
5. Should stage transitions be animated (fade, slide, zoom)?
6. Should FeedbackBanner be less intrusive (toast instead)?
7. Should Reveal "So What" panel be higher up or in a modal?
8. Should mobile layout be more different from desktop?

---

*End of Audit*
