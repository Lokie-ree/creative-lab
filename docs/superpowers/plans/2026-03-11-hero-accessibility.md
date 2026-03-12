# Hero Accessibility Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 10 WCAG 2.1 AA accessibility issues on the hero page across 5 files.

**Architecture:** All changes are declarative HTML attribute and className edits plus two `prefers-reduced-motion` guards inserted into existing GSAP/interval hooks. No new files. No new components. No structural refactoring.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, GSAP, Motion (Framer Motion fork)

**Branch:** `feature/hero-accessibility-wcag-aa`

**Spec:** `docs/superpowers/specs/2026-03-11-hero-accessibility-design.md`

---

## Chunk 1: Static markup fixes (index.html, Hero.tsx, HeroContent.tsx)

### Task 1: Update page title

**Files:**
- Modify: `index.html:7`

These are declarative markup changes — no unit tests exist or are needed for them. Verification is a TypeScript build pass + manual browser check (documented at the end of each task).

- [ ] **Step 1: Update the title tag**

Open `index.html`. On line 7, change:
```html
<title>creative-lab</title>
```
to:
```html
<title>IVLA STEM Club — Creative Lab</title>
```

- [ ] **Step 2: Verify in browser**

Run `pnpm dev`. Open http://localhost:5173 in a browser tab. Confirm the browser tab reads "IVLA STEM Club — Creative Lab".

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix(a11y): update page title to be descriptive (WCAG 2.4.2)"
```

---

### Task 2: Add `<main>` landmark and skip link

**Files:**
- Modify: `src/components/hero/Hero.tsx`
- Modify: `src/components/hero/HeroContent.tsx` (id for skip-link target — done here for cohesion)

**Context:** `Hero.tsx` currently wraps everything in a plain `<div>`. Screen reader users cannot jump to a landmark. Keyboard users have no way to bypass the dot-grid background. We fix both by:
1. Changing the outer `<div>` to `<main id="main-content">`
2. Adding a visually-hidden skip link as the very first child

The skip link uses Tailwind's `sr-only` / `focus:not-sr-only` pattern. `lab-silk` and `lab-display-font` are custom `@utility` classes that don't get `focus:` variants auto-generated in Tailwind CSS 4 — inline their raw equivalents instead. Font-family is omitted because the body already inherits Inter Tight globally.

Note: the existing `bg-[var(--lab-bg)]` bracket syntax on the div is off-pattern (CLAUDE.md requires `bg-(--lab-bg)` parentheses syntax). Correct it while touching this element.

- [ ] **Step 1: Update Hero.tsx**

Replace the entire content of `src/components/hero/Hero.tsx` with:

```tsx
import { HeroBackground } from "./HeroBackground"
import { HeroContent } from "./HeroContent"

interface HeroProps {
  onEnter: () => void
}

export function Hero({ onEnter }: HeroProps) {
  return (
    <main id="main-content" className="h-screen w-screen relative overflow-hidden bg-(--lab-bg)">
      <a
        href="#hero-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-(--lab-accent) focus:text-(--lab-bg) focus:uppercase focus:text-[9px] focus:tracking-[0.15em] focus:font-semibold"
      >
        Skip to content
      </a>
      <HeroBackground />
      <HeroContent onEnter={onEnter} />
    </main>
  )
}
```

- [ ] **Step 2: Add skip-link target id to HeroContent.tsx**

In `src/components/hero/HeroContent.tsx`, find the container div (line 29):
```tsx
<div
  ref={containerRef}
  className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 gap-6 md:gap-8"
>
```

Add `id="hero-content"` and `tabIndex={-1}`. The `tabIndex={-1}` is required so the div can receive programmatic focus when the skip link is activated (WCAG technique G1). Without it, browsers scroll to the element but focus stays on the link — inconsistent across screen readers.

```tsx
<div
  id="hero-content"
  tabIndex={-1}
  ref={containerRef}
  className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 gap-6 md:gap-8"
>
```

- [ ] **Step 3: Verify in browser**

Run `pnpm dev`. Open http://localhost:5173. Press Tab — the skip link should appear in the top-left corner with a green background and white text. Press Enter — focus moves into the hero content area (the div itself receives focus; no visible focus ring since the div has no focus style, which is correct). The next Tab press lands on "Enter the Lab". Confirm the page looks visually identical to before when the skip link is not focused.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/Hero.tsx src/components/hero/HeroContent.tsx
git commit -m "fix(a11y): add main landmark and skip navigation link (WCAG 2.4.1, 1.3.1)"
```

---

### Task 3: Fix button semantics and keyboard accessibility

**Files:**
- Modify: `src/components/hero/HeroContent.tsx`

**Context:** The "Enter the Lab" button has four issues:
1. No visible focus ring — keyboard users get zero feedback (Critical)
2. No `type` attribute — defensively add `type="button"`
3. No `cursor-pointer` — mouse users see default cursor
4. Arrow `→` glyph is announced by screen readers as "rightwards arrow"

All four are className/attribute additions on the existing button element.

- [ ] **Step 1: Update the button element**

In `src/components/hero/HeroContent.tsx`, find the button (around line 65):
```tsx
<button
  ref={ctaRef}
  onClick={onEnter}
  className="group px-8 py-3.5 min-h-[48px] border border-(--lab-accent) bg-(--lab-accent) text-(--lab-bg) lab-silk lab-display-font tracking-[0.1em] transition-colors duration-150 hover:bg-(--lab-accent-hover) hover:border-(--lab-accent-hover)"
>
  Enter the Lab
  <span className="inline-block ml-3 transition-transform duration-150 group-hover:translate-x-1">→</span>
</button>
```

Replace with:
```tsx
<button
  ref={ctaRef}
  type="button"
  onClick={onEnter}
  className="group px-8 py-3.5 min-h-[48px] cursor-pointer border border-(--lab-accent) bg-(--lab-accent) text-(--lab-bg) lab-silk lab-display-font tracking-[0.1em] transition-colors duration-150 hover:bg-(--lab-accent-hover) hover:border-(--lab-accent-hover) focus-visible:outline-2 focus-visible:outline-(--lab-accent) focus-visible:outline-offset-4"
>
  Enter the Lab
  <span aria-hidden="true" className="inline-block ml-3 transition-transform duration-150 group-hover:translate-x-1">→</span>
</button>
```

Changes made:
- Added `type="button"`
- Added `cursor-pointer`
- Added `focus-visible:outline-2 focus-visible:outline-(--lab-accent) focus-visible:outline-offset-4`
- Added `aria-hidden="true"` to the arrow span

- [ ] **Step 2: Verify focus ring in browser**

Run `pnpm dev`. Open http://localhost:5173. Press Tab until the "Enter the Lab" button is focused. You should see a 2px phosphor-green outline around the button with 4px offset. Clicking the button with a mouse should NOT show the outline (`:focus-visible` only).

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: no TypeScript errors. Catches any className typos before they accumulate across tasks.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/HeroContent.tsx
git commit -m "fix(a11y): add focus ring, cursor, type, and aria-hidden arrow to CTA button (WCAG 2.4.7, 4.1.1, 4.1.2)"
```

---

### Task 4: Gate HeroContent entrance animation on prefers-reduced-motion

**Files:**
- Modify: `src/components/hero/HeroContent.tsx`

**Context:** The existing `useGSAP` call animates h1, tagline, and button from `opacity: 0, y: 16` on mount — an auto-playing animation. Users who set `prefers-reduced-motion: reduce` in their OS should not see this. When reduced motion is preferred, snap all elements to full opacity immediately with no translation.

**Assumption:** The animated elements have no CSS `opacity: 0` starting state — GSAP is the only thing setting their opacity. The `gsap.set` to `opacity: 1` in the reduced-motion path is therefore safe and sufficient.

- [ ] **Step 1: Update useGSAP in HeroContent.tsx**

Find the `useGSAP` block (lines 16–26) and replace it:

```ts
useGSAP(() => {
  if (!containerRef.current) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    gsap.set([nameRef.current, taglineRef.current, ctaRef.current], { opacity: 1, y: 0 })
    return
  }

  gsap.set([nameRef.current, taglineRef.current, ctaRef.current], { opacity: 0, y: 16 })
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
  tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
    .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.5)
    .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.9)
}, { scope: containerRef })
```

- [ ] **Step 2: Verify in browser (two conditions)**

**Normal motion:** Open http://localhost:5173 with OS reduced-motion OFF. Confirm h1, tagline, and button fade in with a slight upward motion as before.

**Reduced motion:** In your OS or browser DevTools (Rendering panel → "Emulate CSS media feature prefers-reduced-motion: reduce"), enable reduced motion. Reload. Confirm all three elements appear instantly with no animation.

- [ ] **Step 3: Commit**

```bash
git add src/components/hero/HeroContent.tsx
git commit -m "fix(a11y): gate hero entrance animation on prefers-reduced-motion (WCAG 2.2.2)"
```

---

## Chunk 2: DotGrid and RotatingText

### Task 5: Hide DotGrid from accessibility tree and gate entrance animation

**Files:**
- Modify: `src/components/hero/DotGrid.tsx`

**Context:** `DotGrid` renders a `<section>` wrapping a `<canvas>`. Both are purely decorative. `aria-hidden="true"` on the `<section>` removes the entire subtree from the accessibility tree in one attribute. Additionally, the staggered dot entrance animation (GSAP timeline in `buildGrid`) needs a `prefers-reduced-motion` guard.

Mouse/click physics are **not** gated — they are user-initiated interactions, not auto-playing animations.

- [ ] **Step 1: Add aria-hidden to the section element**

In `src/components/hero/DotGrid.tsx`, find the `<section>` element (line 302):
```tsx
return (
  <section className={`p-4 flex items-center justify-center h-full w-full relative ${className}`} style={style}>
```

Add `aria-hidden="true"`:
```tsx
return (
  <section aria-hidden="true" className={`p-4 flex items-center justify-center h-full w-full relative ${className}`} style={style}>
```

- [ ] **Step 2: Add prefers-reduced-motion guard to buildGrid**

In `src/components/hero/DotGrid.tsx`, find the `buildGrid` callback. The staggered entrance block starts around line 134:

```ts
// Staggered entrance — only on first build
if (!entrancePlayedRef.current) {
  entrancePlayedRef.current = true;
  const shuffled = [...dots].sort(() => Math.random() - 0.5);
  shuffled.forEach((dot, i) => {
    gsap.to(dot, {
      alpha: 1,
      duration: 0.4,
      delay: 0.3 + i * 0.0015,
      ease: 'power2.out',
    });
  });
} else {
  // On resize, snap alpha to 1 for new dots
  dots.forEach(d => { d.alpha = 1; });
}
```

Replace it with:

```ts
// Staggered entrance — only on first build
if (!entrancePlayedRef.current) {
  entrancePlayedRef.current = true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dots.forEach(d => { d.alpha = 1; });
  } else {
    const shuffled = [...dots].sort(() => Math.random() - 0.5);
    shuffled.forEach((dot, i) => {
      gsap.to(dot, {
        alpha: 1,
        duration: 0.4,
        delay: 0.3 + i * 0.0015,
        ease: 'power2.out',
      });
    });
  }
} else {
  // On resize, snap alpha to 1 for new dots
  dots.forEach(d => { d.alpha = 1; });
}
```

- [ ] **Step 3: Verify in browser (two conditions)**

**Normal motion:** Confirm dots still animate in with the staggered entrance on first load.

**Reduced motion:** Enable OS/DevTools reduced motion. Reload. Confirm dots appear instantly (no stagger animation). Mouse hover and click interactions should still work normally (swipe the mouse fast across the canvas).

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/DotGrid.tsx
git commit -m "fix(a11y): aria-hidden decorative canvas, gate dot entrance on prefers-reduced-motion (WCAG 1.1.1, 2.2.2)"
```

---

### Task 6: Add aria-live to RotatingText and gate auto-rotation

**Files:**
- Modify: `src/components/hero/RotatingText.tsx`

**Context:** `RotatingText` already has a `<span className="sr-only">` at line 188 that holds the current text. Screen readers announce it on page load but not on subsequent changes because it's not a live region. Promote it to `role="status"` (which implicitly gives it `aria-live="polite"` and `aria-atomic="true"` — do NOT add those attributes explicitly alongside the role).

Additionally, the auto-rotation `setInterval` must be skipped when `prefers-reduced-motion: reduce` is set. The word stays on the first item ("build").

- [ ] **Step 1: Promote the sr-only span to role="status"**

In `src/components/hero/RotatingText.tsx`, find line 188:
```tsx
<span className="sr-only">{texts[currentTextIndex]}</span>
```

Replace with:
```tsx
<span role="status" className="sr-only">{texts[currentTextIndex]}</span>
```

`role="status"` carries implicit `aria-live="polite"` and `aria-atomic="true"`. Do not add those attributes explicitly.

- [ ] **Step 2: Add prefers-reduced-motion guard to the interval useEffect**

Find the `useEffect` at line 175:
```ts
useEffect(() => {
  if (!auto) return;
  const intervalId = setInterval(next, rotationInterval);
  return () => clearInterval(intervalId);
}, [next, rotationInterval, auto]);
```

Replace with:
```ts
useEffect(() => {
  if (!auto) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const intervalId = setInterval(next, rotationInterval);
  return () => clearInterval(intervalId);
}, [next, rotationInterval, auto]);
```

**Known trade-off:** `window.matchMedia(...).matches` is a snapshot read at effect execution time, not a live listener. If the user toggles their OS reduced-motion preference while the page is open, the interval won't respond until the component remounts. This is intentional — adding a `MediaQueryList` listener would add complexity for an edge case. The spec calls for a snapshot check and that is what this implements.

- [ ] **Step 3: Verify with a screen reader (or DevTools)**

Open http://localhost:5173. Using a screen reader (macOS VoiceOver: Cmd+F5; Windows: NVDA) or browser accessibility inspector, navigate to the tagline. Confirm:
- On page load: "Where we" and "build" are announced
- Every ~2 seconds: the new word ("discover", "explore", "prove") is announced

With reduced motion enabled: confirm the word stays on "build" and no rotation occurs.

- [ ] **Step 4: Run TypeScript build**

```bash
pnpm build
```

Expected: no type errors. This is the final build check before the PR commit.

- [ ] **Step 5: Commit**

```bash
git add src/components/hero/RotatingText.tsx
git commit -m "fix(a11y): add aria-live to rotating text, gate auto-rotation on prefers-reduced-motion (WCAG 4.1.3, 2.2.2)"
```

---

### Task 7: Final verification and PR

- [ ] **Step 1: Full build pass**

```bash
pnpm build
```

Expected: clean build with no TypeScript errors. Note: `tsc --noEmit` is lenient; `tsc -b` (used here and by Vercel) enforces `noUnusedLocals` and strict readonly. A passing `--noEmit` does not guarantee a passing build — always run `pnpm build`.

- [ ] **Step 2: Manual keyboard navigation audit**

Open http://localhost:5173. With mouse put away:

| Action | Expected |
|--------|----------|
| First Tab | Skip link appears (green bg, white text, top-left) |
| Enter on skip link | Focus jumps past dot-grid to hero content |
| Tab again | "Enter the Lab" button focused with phosphor-green outline |
| Enter/Space on button | Navigates into the lab |
| Cursor | Shows pointer on button hover |

- [ ] **Step 3: Check page title and button accessible name**

In Chrome DevTools → Accessibility tab, inspect the "Enter the Lab" button. Confirm:
- Accessible name: `"Enter the Lab"` (no "rightwards arrow")
- Role: `button`

Check the browser tab title: `"IVLA STEM Club — Creative Lab"`

- [ ] **Step 4: Verify reduced motion (two components)**

In DevTools Rendering panel → emulate `prefers-reduced-motion: reduce`. Reload. Confirm:
- Dots appear instantly (no stagger)
- "Where we build" text is static (no word rotation)
- h1, tagline, button appear instantly (no fade-in)

- [ ] **Step 5: Push branch and open PR**

```bash
git push -u origin feature/hero-accessibility-wcag-aa
gh pr create \
  --base main \
  --title "fix(a11y): WCAG 2.1 AA hero page fixes (10 issues)" \
  --body "$(cat <<'EOF'
## Summary

- Fixes 10 WCAG 2.1 AA accessibility issues on the hero page
- 1 critical (missing focus indicator), 5 major, 4 minor
- Single-pass across 5 files: index.html, Hero.tsx, HeroContent.tsx, DotGrid.tsx, RotatingText.tsx

## Changes

- **index.html**: Descriptive page title (2.4.2)
- **Hero.tsx**: `<main>` landmark + skip navigation link (1.3.1, 2.4.1)
- **HeroContent.tsx**: Focus ring on CTA button (2.4.7), `type="button"`, `cursor-pointer`, `aria-hidden` on arrow glyph (4.1.2), `prefers-reduced-motion` gate on entrance animation (2.2.2)
- **DotGrid.tsx**: `aria-hidden` on decorative canvas subtree (1.1.1), `prefers-reduced-motion` gate on dot entrance (2.2.2)
- **RotatingText.tsx**: `role="status"` live region for word changes (4.1.3), `prefers-reduced-motion` gate on auto-rotation (2.2.2)

## Test plan

- [ ] Browser tab title reads "IVLA STEM Club — Creative Lab"
- [ ] Tab key reveals skip link; Enter jumps focus to hero content
- [ ] Tab to button shows phosphor-green focus outline; mouse click does not
- [ ] Button accessible name is "Enter the Lab" (no arrow glyph)
- [ ] With `prefers-reduced-motion: reduce` — dots appear instantly, word stays on "build", hero elements appear instantly
- [ ] `pnpm build` passes with no TypeScript errors

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```
