# Sinewaves Module Polish Sprint

Design document for a phased polish sprint addressing mobile layout, match feedback, diagnosis logic, and stage transitions.

## Problems Addressed

| Problem | Symptom |
|---------|---------|
| **Mobile layout** | Prompt/formula too tall, controls below fold everywhere |
| **Match celebration** | Weak, barely noticeable, no contextual acknowledgment |
| **Challenge diagnosis** | No validation, unclear flow, question/visual mismatch |
| **Stage transitions** | Feel arbitrary, no preview of what's next |

## Sprint Structure

Four discrete phases, each shippable:

1. **Layout** — Compress mobile, ensure controls always visible
2. **Feedback** — Match celebration choreography + contextual messages
3. **Logic** — Diagnosis validation, question/visual alignment
4. **Transitions** — Stage progression narrative, preview of what's next

---

## Phase 1: Mobile Layout Compression

### Problem

The prompt strip (title + description) and formula readout consume too much vertical space, pushing sliders and action buttons below the fold on mobile.

### Current Layout

```
┌─────────────────────┐
│    Status Strip     │  ~48px
├─────────────────────┤
│   Prompt Readout    │  ~120px+ (title + multi-line description)
│   Formula Readout   │  ~80px (with corner brackets)
├─────────────────────┤
│                     │
│   Visualization     │  flex-1 (what's left)
│                     │
├─────────────────────┤
│   Control Strip     │  ~100px (sliders, buttons)
└─────────────────────┘
```

On a 667px iPhone SE screen, the top regions eat ~250px before viz even starts.

### Proposed Mobile Layout

```
┌─────────────────────┐
│ Status │  Prompt    │  ~48px (merged row, prompt is single-line title only)
├─────────────────────┤
│                     │
│   Visualization     │  expanded (dominates viewport)
│                     │
├─────────────────────┤
│   Control Strip     │  ~80px (always visible, docked bottom)
│   + inline hint     │  (description moves here as subtle hint text)
└─────────────────────┘
```

### Key Changes

- Status strip and prompt title merge into one compact row
- Description text relocates to control strip as contextual hint
- Formula only appears in reveal stage (not competing for space during learning)
- Control strip docks to bottom, always in thumb zone

### Component Changes

| Component | Change |
|-----------|--------|
| `Layout.tsx` | New mobile grid: `"header" "viz" "controls"` with fixed header (~48px) and controls (~80px), viz fills middle |
| `StatusStrip.tsx` | Accepts optional `title` prop, renders inline on mobile: `[progress bar] [stage title]` |
| `PromptReadout.tsx` | Desktop: unchanged. Mobile: hidden (title moves to status strip) |
| `ControlStrip.tsx` | Gains `hint` prop for contextual description text. Renders as muted single line above slider |
| `FormulaReadout.tsx` | Only renders during reveal stage. Hidden during observe→challenge flow |

### Breakpoint Strategy

```
Mobile (<768px):  Compact merged header, hint in control strip
Desktop (≥768px): Current layout preserved (side-by-side on landscape)
```

### Control Strip Hints by Stage

| Stage | Hint text |
|-------|-----------|
| Observe | "Watch how the circle drives the wave" |
| Amplitude | "Drag to match the ghost wave's height" |
| Frequency | "Drag to match the ghost wave's speed" |
| Challenge | "What changed?" → "Now match it" |

### Preserved Behavior

- Visualization component unchanged
- Desktop experience unchanged
- Stage machine logic unchanged
- All existing props/callbacks preserved

---

## Phase 2: Match Celebration Feedback

### Problem

When users match the target, the feedback is weak. The `MatchFeedback` component appears but lacks satisfying motion or specific acknowledgment of what was achieved.

### Current Behavior

- Match detected → `MatchFeedback` fades in with generic "Nice work!" message
- No animation choreography
- Message doesn't reference what parameter was matched
- Continue button appears immediately

### Proposed Celebration Sequence (600ms total)

```
0ms    Wave pulses (scale 1.0 → 1.05 → 1.0, ease: back.out)
100ms  Matched value highlights (amplitude/frequency number glows cyan)
250ms  Contextual message slides up from control strip
450ms  Continue button fades in
600ms  Sequence complete, user can proceed
```

### Contextual Messages by Stage

| Stage | Message |
|-------|---------|
| Amplitude | "You found it — amplitude controls the height" |
| Frequency | "That's it — frequency controls the speed" |
| Challenge (amplitude) | "Sharp eye. You spotted the amplitude change" |
| Challenge (frequency) | "Nice catch. The frequency shifted" |
| Challenge (both) | "You nailed it — both parameters changed" |

### Animation Tokens

Using existing `src/lib/animation/tokens.ts`:

- Pulse: `duration.feedback` (300ms), `ease.bounce`
- Message: `duration.medium` (250ms), `ease.out`
- Button: `duration.fast` (150ms), `ease.out`

---

## Phase 3: Challenge Diagnosis Logic

### Problem

The "What changed?" diagnosis phase has multiple issues:

1. Users can progress regardless of answer (no validation)
2. Question may not match what visually changed
3. Flow is confusing (users don't know they must answer before adjusting)

### Current Flow

```
Challenge observe → User sees change → Picks any answer → Proceeds to match
```

### Proposed Flow with Validation

```
Challenge observe → User sees change → Picks answer →
  ├─ Correct: "Right! Now match it" → Sliders appear
  └─ Wrong: Gentle redirect → "Look again at the wave" → Replay change → Re-pick
```

### Validation Logic

```typescript
// In ObservatoryModule state
challengeParam: 'amplitude' | 'frequency' | 'both'  // randomly set at challenge start

// When user picks diagnosis
function handleDiagnosis(pick: string) {
  if (pick === challengeParam) {
    // Correct - proceed to match phase
    showFeedback("Right! Now match it")
    setChallengePhase('match')
  } else {
    // Wrong - gentle redirect, replay the change
    showFeedback("Look again...")
    replayParameterChange()  // animate ghost wave shift again
    // User stays in diagnose phase, can pick again
  }
}
```

### Visual Alignment Fix

The ghost wave must clearly demonstrate the parameter that changed. Currently it shifts instantly. Proposed animation:

| Parameter | Visual cue |
|-----------|------------|
| Amplitude | Ghost wave height animates over 400ms (obvious stretch/shrink) |
| Frequency | Ghost wave compresses/expands horizontally over 400ms |
| Both | Sequential: amplitude first (400ms), then frequency (400ms) |

### Attempt Tracking

After 2 wrong attempts, show a subtle hint: "Watch the wave's [height/speed]" — never block progress indefinitely, but encourage observation.

---

## Phase 4: Stage Transition Narrative

### Problem

Moving between stages feels arbitrary. Users don't sense they're building toward something, and they have no preview of what's coming next.

### Current Behavior

- Stage changes instantly
- Status strip progress bar updates silently
- New prompt appears, user must read to understand context

### Proposed Transition Sequence (500ms)

```
0ms    Current controls fade out
100ms  Status strip updates (progress bar animates right)
150ms  Brief status text: "STAGE 2 → 3" or stage name
300ms  New hint text fades in at control strip
400ms  New controls fade in
500ms  Transition complete
```

### Progression Narrative via Status Text

| Transition | Status flash | Hint preview |
|------------|--------------|--------------|
| Observe → Amplitude | "AMPLITUDE CONTROL" | "Now you control the height" |
| Amplitude → Frequency | "FREQUENCY CONTROL" | "Same idea, different parameter" |
| Frequency → Challenge | "CHALLENGE MODE" | "Can you spot what changes?" |
| Challenge → Reveal | "COMPLETE" | — (reveal panel handles this) |

### Progress Bar Segments

Progress bar gains visible segment markers:

```
[█░░░░] Observe
[██░░░] Amplitude
[███░░] Frequency
[████░] Challenge
[█████] Complete
```

Markers are visible from the start (muted), lighting up as user progresses. User sees the full journey upfront.

### Component Changes

| Component | Change |
|-----------|--------|
| `StatusStrip.tsx` | Add segment markers, accept `statusText` prop for flash message |
| `ControlStrip.tsx` | Animate hint text on stage change (fade out → update → fade in) |
| `ObservatoryModule.tsx` | Orchestrate transition sequence via GSAP timeline |
| `animations.ts` | Add `stageTransition()` function alongside existing `consoleBootSequence()` |

---

## Files Touched

| File | Phases |
|------|--------|
| `Layout.tsx` | 1 |
| `StatusStrip.tsx` | 1, 4 |
| `PromptReadout.tsx` | 1 |
| `ControlStrip.tsx` | 1, 2, 4 |
| `FormulaReadout.tsx` | 1 |
| `MatchFeedback.tsx` | 2 |
| `DiagnosisChoices.tsx` | 3 |
| `ObservatoryModule.tsx` | 2, 3, 4 |
| `animations.ts` | 2, 4 |
| `sinewaves-copy.ts` | 2, 3, 4 |

## Dependencies

- Phase 2–4 build on Phase 1's layout (hints live in control strip)
- Phases 2, 3, 4 are independent of each other after Phase 1

## Success Criteria

- [ ] Mobile: Controls visible without scrolling on iPhone SE (667px)
- [ ] Match: Celebration feels satisfying with clear contextual feedback
- [ ] Diagnosis: Wrong answers trigger replay, correct answers proceed
- [ ] Transitions: User understands progression and what's coming next
