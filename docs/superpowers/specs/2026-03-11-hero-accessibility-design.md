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
| 9 | Button has no explicit `type` attribute (defaults to submit inside a form) | Minor | HeroContent.tsx |
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

`lab-silk` and `lab-display-font` are custom `@utility` classes; Tailwind CSS 4 does not auto-generate `focus:` variants for them. Use their raw equivalents inline. For font-family, drop it from the skip link entirely — the element inherits Inter Tight from the body, which is sufficient.
- `lab-silk` = `uppercase text-[9px] tracking-[0.15em] font-semibold`

```tsx
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
```

`HeroContent`'s container div gets `id="hero-content"` as the skip-link target.

---

### `HeroContent.tsx`

**Change 1 — Focus indicator:** Add `focus-visible:outline-2 focus-visible:outline-(--lab-accent) focus-visible:outline-offset-4` to the button className. Uses `:focus-visible` (not `:focus`) so the ring appears for keyboard users but not mouse clicks.

**Change 2 — Cursor:** Add `cursor-pointer` to the button className.

**Change 3 — Button type:** Add `type="button"` to prevent ambiguous submit semantics.

**Change 4 — Arrow aria-hidden:** The arrow `→` is already inside a `<span>`. Add `aria-hidden="true"` to that span so the glyph is excluded from the accessible button name, which should read only "Enter the Lab".

**Change 5 — Skip link target:** Add `id="hero-content"` to the container `<div>` inside `HeroContent`.

**Change 6 — prefers-reduced-motion on entrance animation:** `HeroContent` runs a GSAP timeline on mount that animates h1, tagline, and button from `opacity: 0, y: 16` — an auto-playing animation in the same category as DotGrid's entrance. Gate it with a `prefers-reduced-motion` check inside `useGSAP`. When reduced motion is preferred, skip the `y` translation and snap elements to `opacity: 1` immediately (no animation).

```ts
useGSAP(() => {
  if (!containerRef.current) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    gsap.set([nameRef.current, taglineRef.current, ctaRef.current], { opacity: 1, y: 0 });
    return;
  }
  gsap.set([nameRef.current, taglineRef.current, ctaRef.current], { opacity: 0, y: 16 });
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.to(nameRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.2)
    .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.5)
    .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.9);
}, { scope: containerRef });
```

Note: the reduced-motion path snaps elements to `opacity: 1` because these elements have no CSS `opacity: 0` starting state — only GSAP sets that. This assumption holds as long as no `opacity-0` Tailwind class is added to the elements. If the pre-existing opacity flash (noted in Out of Scope) is ever fixed via CSS, this branch remains correct — `gsap.set` will still override any CSS opacity.

---

### `DotGrid.tsx`

**Change 1 — aria-hidden on the section wrapper:** The canvas is wrapped in `<section>` → `<div>` → `<canvas>`. The entire component is purely decorative; nothing in it conveys information to assistive technology users. Add `aria-hidden="true"` to the outer `<section>` element (line 302). This removes the full decorative subtree — section, div, and canvas — from the accessibility tree in one attribute, preventing any AT announcement of the canvas or its wrapper.

**Change 2 — prefers-reduced-motion:** In `buildGrid`, before the staggered GSAP entrance animation, check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`. If true, skip the timeline and immediately set all dot `alpha` values to `1`. This eliminates the animated entrance for users who have opted out of motion.

The mouse-move and click physics are user-initiated interactions (not auto-playing), so they do **not** need to be gated.

---

### `RotatingText.tsx`

**Change 1 — aria-live:** The component already renders `<span className="sr-only">{texts[currentTextIndex]}</span>` (line 188). Promote this to a live region so screen readers announce each word change:

```tsx
<span role="status" className="sr-only">
  {texts[currentTextIndex]}
</span>
```

`role="status"` implicitly carries `aria-live="polite"` and `aria-atomic="true"` — specifying those attributes explicitly alongside the role is redundant and can cause inconsistent AT behavior. Use `role="status"` alone.

The live region announces the **bare word** only (e.g. "build", "discover"). The "Where we" prefix is in a sibling element in `HeroContent` and is not part of the rotating component. This is acceptable — the full phrase is announced once on page load via the static "Where we" text, and subsequent word changes announce only the changed word. Screen reader users get enough context from the initial read.

**Change 2 — prefers-reduced-motion:** In the `useEffect` that drives `setInterval`, add a `prefers-reduced-motion` check. If reduced motion is preferred, skip the interval entirely — the text stays on the first item ("build"). This respects the `auto` prop: if `auto` is already `false`, behaviour is unchanged.

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
| `src/components/hero/HeroContent.tsx` | Focus ring, cursor, type, aria-hidden on arrow, skip-link target id, prefers-reduced-motion gate on GSAP entrance |
| `src/components/hero/DotGrid.tsx` | `aria-hidden` on `<section>` wrapper, prefers-reduced-motion gate on dot entrance |
| `src/components/hero/RotatingText.tsx` | `aria-live` on sr-only span, prefers-reduced-motion gate on rotation interval |

## Out of Scope

- Contrast ratios — all pass WCAG AA; no changes needed
- Mouse-initiated DotGrid physics — user-initiated, not auto-playing
- Any module pages beyond the hero
- Pre-existing opacity flash in HeroContent — between React render and `useGSAP` execution, elements briefly appear at full opacity before GSAP sets them to `opacity: 0`. This is a pre-existing issue unrelated to this fix pass; resolving it would require adding `opacity-0` CSS starting states to the elements, which is a separate concern.
