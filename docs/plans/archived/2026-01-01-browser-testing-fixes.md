# Browser Testing Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address remaining issues from browser testing report to improve performance, accessibility, and stability.

**Architecture:** Fix WebGL context errors by managing Canvas lifecycle, implement lazy loading for heavy Three.js components, verify color contrast meets WCAG standards, and add performance monitoring.

**Tech Stack:** React (lazy/Suspense), Three.js/R3F, Vite build optimization, WCAG color contrast tools

---

## Summary of Remaining Issues

From `docs/plans/BROWSER_TESTING_REPORT.md`, these items remain:

| Priority | Issue | Status |
|----------|-------|--------|
| 🔴 High | WebGL context error | TODO |
| 🔴 High | Code splitting for performance | TODO |
| 🟡 Medium | Color contrast verification | TODO |
| 🟢 Low | Bundle size optimization | TODO |
| 🟢 Low | Performance monitoring | TODO |

---

## Task 1: Fix WebGL Context Error

**Problem:** Console error: "THREE.WebGLRenderer: A WebGL context could not be created. Reason: Canvas has an existing context of a different type"

**Root Cause:** `SlideTransition.tsx` keeps both Hero and Module views mounted at all times for smooth animations. This means the R3F Canvas in `Scene.tsx` is always mounted even when not visible, potentially causing WebGL context conflicts.

**Files:**
- Modify: `src/components/Module.tsx:1-15`
- Modify: `src/components/modules/sinusoidal/Scene.tsx:158-177`

**Step 1: Add visibility prop handling to Scene**

In `Scene.tsx`, add a visibility prop to conditionally render the Canvas:

```tsx
interface SceneProps {
  amplitude: number
  frequency: number
  phase: number
  target: { a: number; f: number; p: number }
  stage: Stage
  isPaused: boolean
  onPauseChange: (paused: boolean) => void
  stageTargets?: { amplitude: number; frequency: number; phase: number }
  isVisible?: boolean  // Add this
}

export function Scene({ amplitude, frequency, phase, target, stage, isPaused, onPauseChange, stageTargets, isVisible = true }: SceneProps) {
  // Don't render Canvas when not visible to prevent WebGL context issues
  if (!isVisible) {
    return null
  }

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      style={{ background: colors.background.primary }}
    >
      <Visualization
        amplitude={amplitude}
        frequency={frequency}
        phase={phase}
        target={target}
        stage={stage}
        isPaused={isPaused}
        onPauseChange={onPauseChange}
        stageTargets={stageTargets}
      />
    </Canvas>
  )
}
```

**Step 2: Pass isVisible prop from Module**

In `Module.tsx`, pass the `isVisible` prop to Scene:

```tsx
// Module already receives isVisible prop - pass it to Scene
<Scene
  amplitude={amplitude}
  frequency={frequency}
  phase={phase}
  target={target}
  stage={stage}
  isPaused={isPaused}
  onPauseChange={setIsPaused}
  stageTargets={stageTargets}
  isVisible={isVisible}
/>
```

**Step 3: Run the app and verify no WebGL errors**

Run: `pnpm dev`
- Navigate to hero
- Click "Enter the Module"
- Check console - should be NO WebGL context errors
- Navigate back to hero
- Re-enter module - should work without errors

**Step 4: Commit**

```bash
git add src/components/Module.tsx src/components/modules/sinusoidal/Scene.tsx
git commit -m "fix: prevent WebGL context error by conditionally rendering Canvas"
```

---

## Task 2: Implement Code Splitting for Scene

**Problem:** Slow initial load (4.4s First Paint) due to loading Three.js/R3F on hero page.

**Solution:** Lazy load the Module component so Three.js only loads when user enters the module.

**Files:**
- Modify: `src/App.tsx:1-8`
- Create: `src/components/ModuleLoader.tsx` (loading fallback)

**Step 1: Create a loading fallback component**

Create `src/components/ModuleLoader.tsx`:

```tsx
import { colors } from "@/lib/colors"

export function ModuleLoader() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: colors.background.primary }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: colors.accent.primary, borderTopColor: 'transparent' }}
        />
        <p style={{ color: colors.text.secondary }}>Loading visualization...</p>
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx with lazy loading**

```tsx
import { useState, useCallback, lazy, Suspense } from "react"
import { Hero } from "./components/hero"
import { SlideTransition } from "./components/transitions"
import { EscapeHatch } from "./components/layout"
import { CelebrationModal } from "./components/celebration"
import { ResumeDialog, ProcessDialog } from "./components/dialogs"
import { ModuleLoader } from "./components/ModuleLoader"

// Lazy load the heavy Module component
const Module = lazy(() => import("./components/Module").then(m => ({ default: m.Module })))
```

**Step 3: Wrap Module in Suspense**

In the SlideTransition usage:

```tsx
<SlideTransition
  view={view}
  heroContent={<Hero onEnter={handleEnterModule} />}
  moduleContent={
    <Suspense fallback={<ModuleLoader />}>
      <Module onComplete={handleModuleComplete} isVisible={view === "module"} />
    </Suspense>
  }
/>
```

**Step 4: Build and verify bundle splitting**

Run: `pnpm build`
Expected: See separate chunks for Module/Three.js code in build output.

**Step 5: Test the loading flow**

Run: `pnpm preview`
- Load the page - should be fast (no Three.js loaded yet)
- Click "Enter the Module" - see loading spinner briefly
- Module loads and displays correctly

**Step 6: Commit**

```bash
git add src/App.tsx src/components/ModuleLoader.tsx
git commit -m "perf: lazy load Module component for faster initial page load"
```

---

## Task 3: Verify Color Contrast

**Problem:** `--lab-text-muted: #888888` on `--lab-bg: #0a0a0f` may not meet WCAG AA standards.

**Files:**
- Potentially modify: `src/lib/colors.ts`
- Potentially modify: `src/index.css`

**Step 1: Calculate current contrast ratio**

Using WCAG contrast calculation:
- Foreground: #888888 (RGB: 136, 136, 136) → Luminance: ~0.246
- Background: #0a0a0f (RGB: 10, 10, 15) → Luminance: ~0.011

Contrast ratio: (0.246 + 0.05) / (0.011 + 0.05) = ~4.85:1

WCAG AA requirements:
- Normal text (< 18pt): 4.5:1 ✅ PASSES
- Large text (≥ 18pt or 14pt bold): 3:1 ✅ PASSES

**Step 2: Document the finding**

The current contrast ratio of ~4.85:1 meets WCAG AA. No changes needed.

However, for WCAG AAA (7:1 for normal text), we would need to lighten to approximately #a0a0a0.

**Step 3: (Optional) Improve to AAA compliance**

If AAA compliance is desired, update `src/lib/colors.ts`:

```ts
text: {
  primary: '#e0e0e0',
  secondary: '#a0a0a0',  // Lightened for AAA (was #888888)
  muted: '#6b7280',
  dim: '#6b7280',
},
```

And update `src/index.css`:

```css
--lab-text-muted: #a0a0a0;
--lab-text-secondary: #a0a0a0;
```

**Step 4: Verify visually**

Run: `pnpm dev`
Check that muted text is still visually distinct from primary text while being readable.

**Step 5: Commit (if changes made)**

```bash
git add src/lib/colors.ts src/index.css
git commit -m "a11y: improve color contrast for muted text to meet WCAG AAA"
```

---

## Task 4: Bundle Size Optimization

**Problem:** Large bundle size due to Three.js and GSAP.

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json` (add analyze script)

**Step 1: Add bundle analyzer**

```bash
pnpm add -D rollup-plugin-visualizer
```

**Step 2: Update vite.config.ts**

```ts
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three', '@react-three/fiber'],
          'gsap': ['gsap'],
          'radix': ['@radix-ui/react-dropdown-menu', '@radix-ui/react-slider', '@radix-ui/react-dialog'],
        },
      },
    },
  },
})
```

**Step 3: Add analyze script to package.json**

```json
{
  "scripts": {
    "analyze": "pnpm build && open dist/stats.html"
  }
}
```

**Step 4: Build and analyze**

Run: `pnpm build`
Check: `dist/stats.html` for bundle composition

**Step 5: Commit**

```bash
git add vite.config.ts package.json pnpm-lock.yaml
git commit -m "build: add bundle analyzer and optimize chunk splitting"
```

---

## Task 5: Add Performance Monitoring (Optional)

**Problem:** No visibility into animation performance during user interaction.

**Files:**
- Create: `src/hooks/usePerformanceMonitor.ts`
- Modify: `src/components/modules/sinusoidal/Scene.tsx`

**Step 1: Create performance hook**

Create `src/hooks/usePerformanceMonitor.ts`:

```ts
import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  fps: number
  frameTime: number
}

export function usePerformanceMonitor(enabled = false): PerformanceMetrics {
  const metrics = useRef<PerformanceMetrics>({ fps: 60, frameTime: 16.67 })
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    if (!enabled) return

    let animationId: number

    const measure = () => {
      frameCount.current++
      const now = performance.now()
      const elapsed = now - lastTime.current

      if (elapsed >= 1000) {
        metrics.current.fps = Math.round((frameCount.current * 1000) / elapsed)
        metrics.current.frameTime = elapsed / frameCount.current

        if (metrics.current.fps < 30) {
          console.warn(`[Performance] Low FPS detected: ${metrics.current.fps}`)
        }

        frameCount.current = 0
        lastTime.current = now
      }

      animationId = requestAnimationFrame(measure)
    }

    animationId = requestAnimationFrame(measure)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [enabled])

  return metrics.current
}
```

**Step 2: Integrate in development mode**

This is optional and only for dev debugging. Can be added to Scene if needed.

**Step 3: Commit**

```bash
git add src/hooks/usePerformanceMonitor.ts
git commit -m "feat: add performance monitoring hook for development"
```

---

## Verification Checklist

After implementing all tasks:

- [ ] No WebGL context errors in console during view transitions
- [ ] Hero page loads quickly (< 1s to First Paint)
- [ ] Module loads with loading spinner when first accessed
- [ ] Color contrast meets at least WCAG AA (4.5:1)
- [ ] Bundle is split into logical chunks (three, gsap, radix)
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes

---

## Rollback Plan

If issues arise:
1. Task 1 (WebGL): Revert Scene.tsx and Module.tsx changes
2. Task 2 (Lazy loading): Revert to direct import in App.tsx
3. Task 3 (Contrast): Revert color values to #888888
4. Task 4 (Bundle): Revert vite.config.ts changes
