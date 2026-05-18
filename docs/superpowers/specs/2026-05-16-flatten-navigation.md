# Spec: Flatten Navigation
**Branch:** `feat/flatten-navigation`  
**Scope:** `App.tsx` + one new component. Nothing else.

---

## Context

The current flow is Hero → CourseHub → Constellation → Module (three screens to
reach a module). CourseHub and Constellation are vestigial from the Sinewaves
era. The app now has three shipped geometry modules and a STEM Club framing.
The goal is Hero → ModulePicker → Module.

---

## Step 1 — Update `App.tsx`

Read `App.tsx` before making any changes. The current file is the source of
truth for what exists. Make the following changes exactly.

### 1a. View type

```ts
// Before
type View = "hero" | "courses" | "constellation" | "module"

// After
type View = "hero" | "picker" | "module"
```

### 1b. Remove these state declarations

```ts
const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number } | null>(null)
```

### 1c. Remove these handlers entirely

```ts
handleSelectCourse    // zoom-origin tracking + setView("constellation")
handleBackToCourses   // setSelectedCourseId(null) + setView("courses")
```

### 1d. Update `handleEnter`

```ts
// Before
const handleEnter = useCallback(() => {
  setView("courses")
}, [])

// After
const handleEnter = useCallback(() => {
  setView("picker")
}, [])
```

### 1e. Rename `handleBackToConstellation` → `handleBackToPicker`

Remove the `setSelectedCourseId(null)` line — that state no longer exists.
Keep everything else in the handler body identical:

```ts
const handleBackToPicker = useCallback(() => {
  setShowCelebration(false)
  setCompletedValues(null)
  setCompletedSequence(null)
  setActiveModuleId(null)
  setView("picker")
}, [])
```

### 1f. Remove `zoomInVariants`

Delete the entire `zoomInVariants` object. It is only used by the
constellation block which is being removed.

### 1g. Update Escape key handler

```ts
// Before
handleBackToConstellation()

// After
handleBackToPicker()
```

Update the `useEffect` dependency array to reference `handleBackToPicker`.

### 1h. Replace the JSX view blocks

Remove both of these blocks:

```tsx
{/* Courses View */}
{view === "courses" && ( ... <CourseHub ... /> ... )}

{/* Constellation View - with zoom transition */}
{view === "constellation" && selectedCourseId && ( ... <Constellation ... /> ... )}
```

Add this block in their place (between the hero block and the module block):

```tsx
{/* Picker View */}
{view === "picker" && (
  <motion.div
    key="picker"
    variants={fadeVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    <ModulePicker onSelectModule={handleSelectModule} onBack={handleBackToHero} />
  </motion.div>
)}
```

### 1i. Update `DynamicModule` and `CelebrationModal` references

Two places still reference the old handler name — update both:

```tsx
// DynamicModule onBack prop
onBack={handleBackToPicker}

// CelebrationModal onNextModule prop
onNextModule={handleBackToPicker}
```

### 1j. Update imports

Remove:
```ts
import { Constellation } from "@/components/constellation/Constellation"
import { CourseHub } from "@/components/constellation/CourseHub"
```

Add:
```ts
import { ModulePicker } from "@/components/picker/ModulePicker"
```

---

## Step 2 — Create `src/components/picker/ModulePicker.tsx`

### Props interface

```ts
interface ModulePickerProps {
  onSelectModule: (moduleId: string) => void
  onBack: () => void
}
```

### Data

Import from `src/config/modules.ts`. Use whatever function or array that file
exports to get the list of modules. **Read that file first** to confirm the
export shape before writing any import. Only render modules where the module
is not marked as a placeholder or coming-soon — check the config for that
field (it exists; Constellation already used it).

Display per module card:
- Module name
- Standards codes (e.g. `8.G.A.1 · 8.G.A.2 · 8.G.A.3`)
- A short description if one exists in the config; otherwise omit

### Layout

Follow the established journey screen pattern documented in CLAUDE.md:

```
min-h-dvh
└── flex flex-col h-dvh bg-(--lab-bg)
    ├── header  [h-12 shrink-0]  — back button left, app label center
    └── main    [flex-1 flex items-center justify-center]
        └── module card list
```

**Before writing the header**, read either `Constellation.tsx` or
`CourseHub.tsx` to match the existing back button pattern exactly — same
element, same classes, same chevron or arrow treatment.

### Module cards

Each card is a `<button>` that calls `onSelectModule(module.id)` on click.
Apply `duration-150` on all hover transitions per CLAUDE.md design system
rules.

### Design system — mandatory

Do not deviate from any of the following:

| Token | Usage |
|---|---|
| `bg-(--lab-bg)` | Page background |
| `bg-(--lab-surface)` | Card background |
| `text-(--lab-accent)` / `border-(--lab-accent)` | Active / hover state |
| `text-(--lab-text)` | Body copy |
| `text-(--lab-text-muted)` | Secondary / dim text |
| `border-(--lab-border)` | Scored dividers |
| `lab-silk lab-display-font` | All silk-screen labels |

Additional rules:
- **No glow effects**
- **No border-radius on card chrome** (use `rounded-none` to override if needed)
- **No raw hex or rgb color values** — lab tokens only
- **No `gray-*` Tailwind classes** anywhere in this file

---

## Step 3 — Verification checklist

Run in order before marking complete:

```bash
pnpm typecheck   # must exit 0
pnpm lint        # must exit 0
pnpm build       # must complete without errors
```

Manual flow checks:
- [ ] Hero "Enter" → lands on ModulePicker
- [ ] ModulePicker back button → returns to Hero
- [ ] Each module card → launches correct module
- [ ] Escape key inside a module → returns to ModulePicker
- [ ] Module completion → Celebration modal appears
- [ ] Celebration modal "Next Module" → returns to ModulePicker
- [ ] No references to `selectedCourseId` remain in `App.tsx`
- [ ] No references to `transitionOrigin` remain in `App.tsx`
- [ ] No references to `handleBackToConstellation` remain anywhere
- [ ] `CourseHub` and `Constellation` are no longer imported in `App.tsx`

---

## Files — Do Not Touch

- Any file under `src/components/modules/`
- `src/config/modules.ts` — read only, do not modify
- `src/lib/types/transforms.ts`
- `CelebrationModal.tsx`, `ProcessDialog.tsx`
- Any test files (`*.test.ts`, `*.test.tsx`)
- `src/index.css`, `src/lib/colors.ts`

## Files — Leave in Place, Do Not Delete

- `src/components/constellation/Constellation.tsx`
- `src/components/constellation/CourseHub.tsx`

These stop being rendered but are not deleted until after ISTE 2026.