# Final Polish Plan

> **5 days remaining** — Focus on high-impact polish, not re-engineering. The core is built and working.

## Current State

The module is ~98% complete per MASTER.md:
- All 6 stages functional (observe → amplitude → frequency → phase → challenge → reveal)
- Visualization polished (circle + wave sync, glow feedback, ghost wave)
- Progressive discovery implemented (FormulaPreview, discovery memory, locked sliders)
- GSAP animations working (slide-ins, celebrations, formula reveal)

## The One Change That Matters

**Remove MCQ friction. Let matching be the verification.**

Current flow:
```
explore → match target → MCQ appears → answer → feedback → continue
```

Better flow:
```
explore → match target → formula blank fills → celebration → continue
```

The infrastructure exists:
- `FormulaPreview.tsx` already shows building equation with `?` placeholders
- Discovery memory already tracks what user found
- Glow feedback already shows proximity
- `CelebrationPulse.tsx` already exists

**What changes:**
1. When user matches target (within threshold), skip MCQ entirely
2. Fill the formula blank with discovered value
3. Trigger celebration pulse
4. Auto-advance after brief pause

---

## High-Impact Polish (Priority Order)

### 1. Remove MCQ Flow (~3-4h)
**Files:** `App.tsx`

- [ ] When match threshold hit, set discovery value directly
- [ ] Skip `subStage: 'question'` and `subStage: 'feedback'`
- [ ] Trigger `CelebrationPulse` on discovery
- [ ] Auto-advance to next stage after 1.5s delay
- [ ] Keep "Why?" accessible somewhere (optional tooltip or info button)

**Result:** Seamless exploration → discovery → progression

### 2. Enhance Formula Building Moment (~2h)
**Files:** `FormulaPreview.tsx`, `App.tsx`

- [ ] When blank fills, animate it prominently (scale + glow)
- [ ] Brief "You discovered A = 2.0" text flash
- [ ] Sound effect (optional, stretch)

**Result:** Discovery feels earned and celebrated

### 3. Visual Score Meter for Challenge (~2h)
**Files:** `ControlPanel.tsx` or new `SignalMeter.tsx`

- [ ] Replace qualitative text ("Getting closer...") with visual meter
- [ ] Simple bar or arc showing 0-100% match
- [ ] Color shift as score improves (cool → warm → accent)

**Result:** Clear progress visibility in challenge stage

### 4. Ghost Wave Clarity (~1h)
**Files:** `Scene.tsx`, `SineWave.tsx`

- [ ] Increase ghost wave base opacity slightly
- [ ] Add subtle label or visual indicator on first appearance
- [ ] Consider pulsing outline when user is close

**Result:** Target is immediately obvious

### 5. Connector Polish (~1h)
**Files:** `Connector.tsx`

- [ ] Thicker line, more visible dash pattern
- [ ] Animate dash movement to show flow direction
- [ ] Ensure visible on all viewport sizes

**Result:** Circle→wave relationship is unmistakable

---

## What NOT To Do

- No full Signal Lab redesign (preserved in future vision doc)
- No new component architecture
- No major state machine changes beyond MCQ removal
- No adding features that aren't directly pedagogical

---

## Success Criteria

By deadline, the module should:
- [ ] Flow smoothly from observation to discovery to celebration
- [ ] Never feel like a quiz — always feel like exploration
- [ ] Make the circle→wave relationship viscerally clear
- [ ] Look and feel like a Brilliant module
- [ ] Run smoothly on mobile and desktop

---

## Time Budget (5 days)

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | MCQ removal | Core flow change working |
| 2 | Formula celebration | Discovery moment polished |
| 3 | Challenge meter | Visual score feedback |
| 4 | Visual polish | Ghost wave, connector, micro-interactions |
| 5 | Testing + buffer | Mobile testing, edge cases, final fixes |

---

## Files to Touch

**Primary:**
- `src/App.tsx` — Stage flow logic, MCQ removal
- `src/components/feedback/FormulaPreview.tsx` — Discovery celebration

**Secondary:**
- `src/components/controls/ControlPanel.tsx` — Score meter
- `src/components/modules/sinusoidal/Scene.tsx` — Ghost wave
- `src/components/modules/sinusoidal/Connector.tsx` — Visual polish
- `src/components/shared/CelebrationPulse.tsx` — Trigger on discovery

**Leave Alone:**
- `src/components/feedback/QuestionCard.tsx` — Will become unused
- `src/components/feedback/FeedbackBanner.tsx` — Will become unused
- `src/components/feedback/WhyModal.tsx` — May repurpose as optional info

---

## Notes

- The MCQ components don't need to be deleted — just bypassed in the flow
- "Why?" explanations are valuable — consider making them accessible via info icon
- The current implementation is solid — we're removing friction, not rebuilding

---

**Last Updated:** 2025-12-27
