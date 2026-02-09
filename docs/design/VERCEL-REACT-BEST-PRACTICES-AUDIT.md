# Vercel React Best Practices — Audit Report

**Project:** creative-lab  
**Stack:** Vite + React 19 (SPA; no Next.js)  
**Audit date:** 2026-02-09  
**Reference:** [Vercel React Best Practices](https://github.com/vercel/react-best-practices) (57 rules across 8 categories)

This audit maps findings to rule IDs and impact. **No fixes have been implemented**; this document is for planning only.

---

## Scope and applicability

- **Applicable:** Bundle size, client-side data fetching, re-render optimization, rendering performance, JavaScript performance, advanced patterns.
- **Not applicable (no Next.js):** Eliminating server-side waterfalls (async in RSC/API routes), server-side performance (React.cache(), LRU cache, after(), RSC serialization), Server Actions auth. These are marked N/A where relevant.

---

## CRITICAL

### 1. Bundle — barrel imports (`bundle-barrel-imports`)

**Rule:** Import directly from source files; avoid barrel files (e.g. `index.ts` that re-exports). Barrel imports can add 200–800 ms to cold starts and slow builds.

**Findings:**

| Location | Issue |
|----------|--------|
| `src/App.tsx` | Imports from barrel paths: `@/components/constellation` (Constellation, CourseHub), `./components/hero` (Hero), `./components/layout` (EscapeHatch, Navigation), `./components/celebration` (CelebrationModal), `./components/dialogs` (ResumeDialog, ProcessDialog). |
| Barrel files present | `src/components/constellation/index.ts`, `src/components/celebration/index.ts`, `src/components/dialogs/index.ts`, `src/components/hero/index.ts`, `src/components/layout/index.ts`, `src/lib/skeleton/index.ts` (export *) |

**Recommendation:** In `App.tsx` (and anywhere else using these barrels), import from the concrete files (e.g. `@/components/constellation/Constellation`, `@/components/constellation/CourseHub`) instead of `@/components/constellation`. Keep or remove barrel files depending on whether other code relies on them.

---

### 2. Bundle — lucide-react barrel imports (`bundle-barrel-imports`)

**Rule:** Same as above. Icon libraries like `lucide-react` are often used via barrel imports and can pull in hundreds/thousands of modules (e.g. 200–800 ms per cold start).

**Findings:**

Multiple files import from the `lucide-react` barrel:

- `src/components/modules/sinewaves/components/StatusStrip.tsx` — `ChevronLeft`
- `src/components/modules/sinewaves/components/InstrumentControls.tsx` — `Play`, `Pause`, `RotateCcw`
- `src/components/celebration/BehindThisTab.tsx` — `Lightbulb`, `Code`, `Target`, `Palette`
- `src/components/shared/ParameterSlider.tsx` — `Lock`
- `src/components/modules/vector-transforms/MatrixControlPanel.tsx` — `RotateCcw`
- `src/components/modules/vector-transforms/IdleNudges.tsx` — `Lightbulb`
- `src/components/dialogs/ProcessDialog.tsx` — `Target`, `Calendar`, `Lightbulb`, `Rocket`
- `src/components/feedback/FeedbackBanner.tsx` — `CheckCircle2`, `Lightbulb`
- `src/components/celebration/MatchCelebration.tsx` — `CheckCircle2`
- `src/components/layout/EscapeHatch.tsx` — `ChevronDown`, `Home`, `FileText`, `FastForward`
- `src/components/constellation/Constellation.tsx` — `ArrowLeft`
- `src/components/celebration/CelebrationModal.tsx` — `X`
- `src/components/celebration/DiscoveryTab.tsx` — `CheckCircle`
- `src/components/celebration/GoDeeperTab.tsx` — `FileText`, `Compass`, `Github`, `Mail`, `ExternalLink`
- `src/components/dialogs/ResumeDialog.tsx` — `Mail`, `Phone`
- `src/components/ui/dropdown-menu.tsx` — `CheckIcon`, `ChevronRightIcon`, `CircleIcon`
- `src/components/ui/accordion.tsx` — `ChevronDownIcon`
- `src/components/ui/dialog.tsx` — `XIcon`

**Recommendation:** Use direct icon imports (e.g. `lucide-react/dist/esm/icons/check`) or a Vite plugin that rewrites these imports at build time, since Next.js `optimizePackageImports` is not available in Vite.

---

## HIGH

_No HIGH-severity issues were identified in client-only code._  

Server-side rules (RSC, Server Actions, API routes, React.cache(), after()) are N/A for this Vite SPA.

---

## MEDIUM

### 3. Client — localStorage schema and versioning (`client-localstorage-schema`)

**Rule:** Version and minimize localStorage data; handle errors (e.g. private browsing, quota).

**Findings:**

| Location | Issue |
|----------|--------|
| `src/hooks/usePortfolioState.ts` | Key is a constant `'portfolio-state'` with no version. Stored value is full `PortfolioState` (modules, lastActiveModule). No schema version or migration path. `getItem`/`setItem` are wrapped in try/catch (good). |

**Recommendation:** Use a versioned key (e.g. `portfolio-state:v1`) and store only the minimal fields needed. Add migration logic when the schema changes and document the format.

---

### 4. Rendering — explicit conditional rendering (`rendering-conditional-render`)

**Rule:** Prefer ternary for conditionals so that falsy-but-renderable values (e.g. `0`, `''`) are not rendered as content when using `&&`.

**Findings:**

Widespread use of `{ condition && <JSX /> }`. The rule is most important where the left-hand side can be a number or string (e.g. `matchScore`, `timeRemaining`).

| Location | Issue |
|----------|--------|
| `src/components/controls/ControlPanel.tsx` (e.g. ~110–112) | `{matchScore !== undefined && matchScore > 0 && (...)}` and `{getFeedbackText(matchScore) && (...)}`. If `getFeedbackText` ever returned `0` or `''`, that value would be rendered. Prefer ternary for the inner conditional. |
| `src/components/celebration/MatchCelebration.tsx` (~108) | `{timeRemaining > 0 && (...)}` — if the expression were ever `timeRemaining` alone and could be 0, it would render "0". Current code is numeric comparison; low risk but ternary would be consistent. |
| General | Many other `{ x && <... /> }` patterns where `x` is boolean or guaranteed non-numeric are lower risk; consider standardizing on ternary for consistency and future-proofing. |

**Recommendation:** Where the condition can be a number or string, use a ternary (e.g. `condition ? <Component /> : null`). Optionally adopt ternary for all conditional UI for consistency.

---

### 5. Re-render — useTransition for loading state (`rendering-usetransition-loading`)

**Rule:** Prefer `useTransition` (or `startTransition`) for non-urgent UI updates (e.g. loading state) instead of manual boolean loading state where it improves perceived performance.

**Findings:**

| Location | Issue |
|----------|--------|
| `src/App.tsx` — `DynamicModule` | Loading state is implemented with `useState<ComponentType | null>(null)` and `useState<string | null>(null)` for error. Module is loaded in `useEffect`; while loading, `ModuleLoader` is shown. No use of `useTransition`. |

**Recommendation:** Consider wrapping the transition to “module loaded” in `startTransition` so the UI can stay responsive during the dynamic import. Evaluate whether `useTransition` fits the navigation model (e.g. switching modules) to avoid blocking the main thread.

---

### 6. Re-render — derived state during render (`rerender-derived-state-no-effect`)

**Rule:** Derive values from props/state during render instead of syncing with `useEffect` to avoid extra renders and drift.

**Findings:**

No clear “sync state from props in an effect” anti-pattern was found in the audited files. If any component uses `useEffect` to set state purely from props or from a simple derivation, that would be a candidate for deriving during render instead.

---

## LOW / LOW–MEDIUM

### 7. Re-render — useMemo for simple primitive expressions (`rerender-simple-expression-in-memo`)

**Rule:** Avoid wrapping a simple expression that returns a primitive in `useMemo`; the hook overhead can outweigh the cost of the computation.

**Findings:**

| Location | Issue |
|----------|--------|
| `src/components/modules/vector-transforms/ProximityFeedback.tsx` (~53) | `const feedbackText = useMemo(() => getProximityFeedbackText(level), [level])` — single function call, result is string. Likely cheaper to compute each render than to run useMemo. |

**Recommendation:** Use `const feedbackText = getProximityFeedbackText(level)` unless profiling shows a need to memoize.

---

### 8. Client — global event listener deduplication (`client-event-listeners`)

**Rule:** Deduplicate global event listeners (e.g. one listener for N components via a shared subscription or similar).

**Findings:**

| Location | Listener |
|----------|----------|
| `src/components/modules/sinewaves/UnitCircle.tsx` | `window.addEventListener('pointermove', ...)` and `'pointerup'` |
| `src/lib/skeleton/useErrorRecovery.ts` | `document.addEventListener('visibilitychange', ...)` |
| `src/lib/skeleton/useAccessibility.ts` | `container.addEventListener('keydown', ...)` (element-scoped) |
| `src/components/modules/vector-transforms/RevealPanel.tsx` | `document.addEventListener('keydown', ...)` |
| `src/components/ui/dot-pattern.tsx` | `window.addEventListener('resize', ...)` |

Each mounting instance adds its own listener. Impact is low unless many instances of the same component (e.g. many UnitCircles or many RevealPanels) are mounted at once.

**Recommendation:** If multiple instances of the same global listener exist, consider a single shared listener (e.g. subscription map by key) and register callbacks per component.

---

### 9. Client — passive event listeners (`client-passive-event-listeners`)

**Rule:** Use `{ passive: true }` for touch/wheel listeners that do not call `preventDefault()` to avoid blocking scroll.

**Findings:**

No `touchstart`, `touchmove`, or `wheel` listeners were found. Only `pointermove`, `pointerup`, `keydown`, `resize`, and `visibilitychange` are used. Passive is not required for these.

**Recommendation:** When adding touch or wheel listeners for logging/analytics only, pass `{ passive: true }`.

---

### 10. JavaScript — O(1) lookups for repeated access (`js-set-map-lookups`)

**Rule:** Use Set/Map for repeated lookups instead of array `.find()` when the same collection is queried often.

**Findings:**

| Location | Issue |
|----------|--------|
| `src/config/modules.ts` | `getModuleById(id)` uses `MODULES.find(m => m.id === id)`. Called from `App.tsx` once per `moduleId` change in `DynamicModule`’s effect. Not on a hot path. |

**Recommendation:** Optional: maintain a `Map<string, ModuleConfig>` keyed by `id` for O(1) lookup if module config is read in more places or in hot paths.

---

### 11. Re-render — default non-primitive props in memoized components (`rerender-memo-with-default-value`)

**Rule:** When a component is wrapped in `memo()` and has a default non-primitive prop (e.g. `onClick = () => {}`), hoist the default to a constant so the reference is stable.

**Findings:**

No `memo()` components with default function/object/array props were found in the audited code. If such components are added, apply this pattern.

---

## Summary table

| Severity | Rule category | Count | Implement fixes |
|----------|----------------|-------|------------------|
| CRITICAL | Barrel imports (app + lucide-react) | 2 | No (audit only) |
| HIGH | — | 0 | — |
| MEDIUM | localStorage versioning, conditional render, useTransition, derived state | 4 | No (audit only) |
| LOW | useMemo primitive, event dedup, passive listeners, Map lookups, memo defaults | 5 | No (audit only) |

---

## Not applicable (no Next.js)

- **Async waterfalls in RSC/API routes** — No server data-fetching in this SPA.
- **Server-side performance** — React.cache(), LRU cache, RSC serialization, Server Actions auth, `after()` — N/A.
- **Suspense boundaries for streaming** — Applicable if/when moving to RSC or streaming; not relevant to current Vite SPA routing.

---

## References

- Skill: `.claude/skills/vercel-react-best-practices/SKILL.md`
- Full rules: `.agents/skills/vercel-react-best-practices/AGENTS.md`
- Vercel blog on package imports: [How we optimized package imports in Next.js](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
