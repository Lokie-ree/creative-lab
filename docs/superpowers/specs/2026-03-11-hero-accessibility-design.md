# Hero Accessibility Fixes — Design Spec
**Date:** 2026-03-11
**Standard:** WCAG 2.1 AA
**Scope:** Hero page only (`index.html`, `Hero.tsx`, `HeroContent.tsx`, `DotGrid.tsx`, `RotatingText.tsx`)
**Approach:** Single-pass, one commit

---

## Problem

The hero page has 10 accessibility issues identified in a WCAG 2.1 AA audit:

| # | Issue | Severity | File |
|---|-------|----------|------|
| 1 | `<canvas>` has no `aria-hidden="true"` | Major | DotGrid.tsx |
| 2 | Cycling word has no `aria-live` — changes not announced | Major | RotatingText.tsx |
| 3 | No `prefers-reduced-motion` support for auto-cycling | Major | RotatingText.tsx, DotGrid.tsx |
| 4 | Button has no visible focus indicator | Critical | HeroContent.tsx |
| 5 | No skip-navigation link | Major | Hero.tsx |
| 6 | `cursor: default` on button (no pointer affordance) | Minor | HeroContent.tsx |
| 7 | Page title `"creative-lab"` is not descriptive | Minor | index.html |
| 8 | No `<main>` landmark region | Major | Hero.tsx |
| 9 | Button `type="submit"` outside a `<form>` | Minor | HeroContent.tsx |
| 10 | Arrow `→` leaks into accessible button name | Minor | HeroContent.tsx |

---

## Design

### `index.html`

**Change:** Update `<title>` to be descriptive.

```html
<!-- Before -->
<title>creative-lab</title>

<!-- After -->
<title>IVLA STEM Club — Creative Lab</title>
```

---

### `Hero.tsx`

**Change 1:** Wrap content in `<main id="main-content">` instead of a plain `<div>` so screen reader users can jump to the landmark.

**Change 2:** Add a skip link as the first child so keyboard users can bypass the dot-grid background. Use Tailwind's `sr-only` / `focus:not-sr-only` pattern to keep it visually hidden until focused.

```tsx
<main id="main-content" className="h-screen w-screen relative overflow-hidden bg-(--lab-bg)">
  <a
    href="#hero-content"
    className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-(--lab-accent) focus:text-(--lab-bg) focus:lab-silk focus:lab-display-font"
  >
    Skip to content
  </a>
  <HeroBackground />
  <HeroContent onEnter={onEnter} />
</main>
```

`HeroContent`'s container div gets `id="hero-content"` as the skip-link target.

---

### `HeroContent.tsx`

**Change 1 — Focus indicator:** Add `focus-visible:outline-2 focus-visible:outline-(--lab-accent) focus-visible:outline-offset-4` to the button className. Uses `:focus-visible` (not `:focus`) so the ring appears for keyboard users but not mouse clicks.

**Change 2 — Cursor:** Add `cursor-pointer` to the button className.

**Change 3 — Button type:** Add `type="button"` to prevent ambiguous submit semantics.

**Change 4 — Arrow aria-hidden:** The arrow `→` is already inside a `<span>`. Add `aria-hidden="true"` to that span so the glyph is excluded from the accessible button name, which should read only "Enter the Lab".

**Change 5 — Skip link target:** Add `id="hero-content"` to the container `<div>` inside `HeroContent`.

---

### `DotGrid.tsx`

**Change 1 — aria-hidden on canvas:** Add `aria-hidden="true"` to the `<canvas>` element. It is purely decorative; screen readers should not announce it.

**Change 2 — prefers-reduced-motion:** In `buildGrid`, before the staggered GSAP entrance animation, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, skip the timeline and immediately set all dot `alpha` values to `1`. This eliminates the animated entrance for users who have opted out of motion.

The mouse-move and click physics are user-initiated interactions (not auto-playing), so they do **not** need to be gated.

---

### `RotatingText.tsx`

**Change 1 — aria-live:** The component already renders `<span className="sr-only">{texts[currentTextIndex]}</span>` (line 188). Promote this to a live region so screen readers announce each word change:

```tsx
<span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
  {texts[currentTextIndex]}
</span>
```

**Change 2 — prefers-reduced-motion:** In the `useEffect` that drives `setInterval`, add a `prefers-reduced-motion` check. If reduced motion is preferred, skip the interval entirely — the text stays on the first item. This respects the `auto` prop: if `auto` is already `false`, behaviour is unchanged.

```ts
useEffect(() => {
  if (!auto) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const intervalId = setInterval(next, rotationInterval);
  return () => clearInterval(intervalId);
}, [next, rotationInterval, auto]);
```

---

## Files Changed

| File | Changes |
|------|---------|
| `index.html` | Page title |
| `src/components/hero/Hero.tsx` | `<div>` → `<main>`, skip link |
| `src/components/hero/HeroContent.tsx` | Focus ring, cursor, type, aria-hidden on arrow, skip-link target id |
| `src/components/hero/DotGrid.tsx` | `aria-hidden` on canvas, prefers-reduced-motion gate |
| `src/components/hero/RotatingText.tsx` | `aria-live` on sr-only span, prefers-reduced-motion gate |

## Out of Scope

- Contrast ratios — all pass WCAG AA; no changes needed
- Mouse-initiated DotGrid physics — user-initiated, not auto-playing
- Any module pages beyond the hero
