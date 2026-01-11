# Constellation Phase 3 Polish - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add connection line polish, entrance animations, and vignette atmosphere to constellation hub.

**Architecture:** Update ConnectionLines to solid styling, wrap Constellation content with Motion for staggered entrance, add vignette via CSS gradient.

**Tech Stack:** React, Motion (framer-motion), CSS

**Design Doc:** `docs/plans/2026-01-10-constellation-phase3-design.md`

**Commit Strategy:** Single commit after all tasks complete and verified.

---

## Task 1: Update ConnectionLines to Solid Styling

**Files:**
- Modify: `src/components/constellation/ConnectionLines.tsx`

**Changes:**

Replace the current dashed line with a solid gray line:

```tsx
interface ConnectionLinesProps {
  nodeCount: number
}

export function ConnectionLines({ nodeCount }: ConnectionLinesProps) {
  if (nodeCount < 2) return null

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      preserveAspectRatio="none"
    >
      {/* Vertical connecting line between nodes */}
      <line
        x1="50%"
        y1="20%"
        x2="50%"
        y2="80%"
        stroke="#4b5563"
        strokeWidth="1"
      />
    </svg>
  )
}
```

**Key changes:**
- Added `-z-10` class to ensure line renders behind nodes
- Changed stroke from `rgba(255,255,255,0.1)` to `#4b5563` (gray-600)
- Removed `strokeDasharray="4 4"` for solid line
- Adjusted y1/y2 to 20%/80% for better visual fit

**Verify:**
```bash
pnpm build
```

---

## Task 2: Add Motion Variants for Entrance Animation

**Files:**
- Modify: `src/components/constellation/Constellation.tsx`

**Step 1: Add Motion imports**

At the top of the file, add:

```tsx
import { motion } from 'motion/react'
```

**Step 2: Define animation variants**

After the imports, before the component, add:

```tsx
const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2, // Wait for lines to fade in
    },
  },
}

const lineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
}

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
}
```

---

## Task 3: Apply Motion to Constellation Component

**Files:**
- Modify: `src/components/constellation/Constellation.tsx`

**Step 1: Wrap constellation container with motion.div**

Replace the constellation container (the div with `relative flex flex-col items-center gap-8`) with:

```tsx
{/* Constellation */}
<motion.div
  className="relative flex flex-col items-center gap-8"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={lineVariants}>
    <ConnectionLines nodeCount={MODULES.length} />
  </motion.div>

  {MODULES
    .sort((a, b) => b.order - a.order)
    .map((module) => {
      const moduleProgress = getModuleProgress(module.id)
      return (
        <motion.div key={module.id} variants={nodeVariants}>
          <ModuleNode
            module={module}
            status={moduleProgress.status}
            progress={moduleProgress.progress ?? (moduleProgress.status === 'completed' ? 1 : 0)}
            isRecommended={module.id === recommendedId}
            onClick={() => onSelectModule(module.id)}
          />
        </motion.div>
      )
    })}
</motion.div>
```

**Note:** The `key` prop moves to the motion.div wrapper.

**Verify:**
```bash
pnpm build
```

---

## Task 4: Add Vignette Background

**Files:**
- Modify: `src/components/constellation/Constellation.tsx`

**Change:**

Update the outer container's background from solid color to vignette gradient.

Find:
```tsx
<div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0a0a0f] px-4">
```

Replace with:
```tsx
<div
  className="relative flex flex-col items-center justify-center min-h-screen px-4"
  style={{
    background: 'radial-gradient(ellipse at center, #0a0a0f 0%, #050508 100%)',
  }}
>
```

**Verify:**
```bash
pnpm build
```

---

## Task 5: Visual Verification

**Start dev server:**
```bash
pnpm dev
```

**Verification checklist:**

Open http://localhost:5173 and click "Enter":

- [ ] Connection line is solid gray (not dashed)
- [ ] Connection line appears behind the ring nodes
- [ ] On page load, line fades in first (~200ms)
- [ ] Nodes stagger in from bottom to top
- [ ] Each node fades in with subtle scale (0.8 → 1)
- [ ] Total animation completes in ~1 second
- [ ] Vignette visible - edges slightly darker than center
- [ ] Vignette is subtle (barely noticeable)
- [ ] No visual glitches or layout shifts

---

## Task 6: Final Build and Commit

**Step 1: Run lint**
```bash
pnpm lint
```

Fix any issues.

**Step 2: Run build**
```bash
pnpm build
```

**Step 3: Commit all changes**
```bash
git add -A
git commit -m "feat(constellation): add phase 3 polish - lines, animations, atmosphere

- Update connection lines to solid gray styling
- Add Motion-powered entrance animations (lines first, nodes stagger)
- Add subtle vignette background for depth

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Solid connection line styling | `ConnectionLines.tsx` |
| 2 | Define Motion variants | `Constellation.tsx` |
| 3 | Apply Motion to container | `Constellation.tsx` |
| 4 | Add vignette background | `Constellation.tsx` |
| 5 | Visual verification | - |
| 6 | Final build and commit | - |
