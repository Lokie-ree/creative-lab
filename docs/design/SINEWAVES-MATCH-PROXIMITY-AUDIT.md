# Sinewaves: Match and Proximity Logic Audit

**Date:** 2026-02-09  
**Scope:** Match detection, proximity feedback, ghost/user wave sync in frequency stage and challenge stage.

---

## Summary

Two issues were identified (no fixes implemented in code):

1. **Frequency stage / any match:** Ghost and user wave do not visually sync at the match target because the matched parameter is never snapped to the target; the UI shows "match" while the wave still uses the slider value (within threshold).
2. **Challenge stage:** Ghost wave uses both effective targets instead of mirroring the user's non-challenge parameter, so when the challenge is solved the waves do not overlap unless the user's other parameter already equals the stage target.

---

## Architecture (relevant flow)

- **Match detection** (`InstrumentModule.tsx`): `checkMatch(param, value)` runs on slider change. If `|value - target| <= MATCH_THRESHOLDS[param]`, we set `matchGlow` and `matchMessage`. No state update snaps the parameter to the target.
- **Proximity** (`use-proximity.ts`): Uses `currentValue`, `targetValue`, and `MAX_DISTANCES` to compute a 0–1 score and "far" / "medium" / "close" feedback. Used only for UI copy; does not affect wave rendering.
- **Scene ghost params** (`Scene.tsx`): `ghostParams` drives the ghost wave (and ghost circle). For `amplitude` stage: ghost uses `(stageTargets.amplitude, frequency, 0)` (mirrors user frequency). For `frequency` stage: ghost uses `(amplitude, stageTargets.frequency, 0)` (mirrors user amplitude). For `challenge`: code falls through to `return target`, so ghost uses `(effectiveAmplitudeTarget, effectiveFrequencyTarget)` and does **not** mirror the user's non-challenge param.
- **Shared time:** All waves and circles use the same `animTimeRef`, so phase is consistent when (a, f, p) match.

---

## Issue 1: Ghost/user wave doesn’t sync at match target (frequency stage and in general)

**Cause:** Match is declared when the value is *within* the threshold (e.g. frequency 1.85–2.15 for target 2.0). The celebration overlay is shown but the controlled state (e.g. `frequency`) is left at the slider value. The ghost uses the exact target; the user wave uses the slider value, so they are close but not identical and do not fully overlap.

**Recommended fix:** When a match is detected, set the matched parameter to the exact target (snap) so that the next render uses the same (a, f, p) for both ghost and user wave. In `InstrumentModule.tsx` inside `checkMatch`: after `setMatchGlow(true)` and `setMatchMessage(...)`, also update amplitude/frequency state to the target for the current stage (match-amplitude, match-frequency, or challenge).

---

## Issue 2: Waves do not sync when challenge is solved

**Cause:** In the challenge stage only one parameter is the “target” (amplitude or frequency); the other should stay at the user’s current value so the ghost and user differ only in that one dimension. In `Scene.tsx`, for `stage === 'challenge'` the code uses `return target`, so the ghost is `(effectiveAmplitudeTarget, effectiveFrequencyTarget)`. The non-challenge target is always the guided stage target (e.g. 2.0 for frequency). So the ghost does not mirror the user’s non-challenge parameter. Example: challenge is amplitude; ghost = (challengeValue, 2.0); user = (matchedAmplitude, 1.0). Even after matching amplitude, frequency 1.0 vs 2.0 prevents the waves from syncing.

**Recommended fix:**

1. **Scene:** For `stage === 'challenge'`, compute ghost params like the amplitude/frequency stages: mirror the user’s non-target parameter. That requires knowing which parameter is the challenge. Add an optional prop `challengeParam?: 'amplitude' | 'frequency'` and pass it from `InstrumentModule` when `guideState === 'challenge'`. Then:
   - If `challengeParam === 'amplitude'`: ghost = `(stageTargets.amplitude, frequency, 0)`.
   - If `challengeParam === 'frequency'`: ghost = `(amplitude, stageTargets.frequency, 0)`.
2. **Snap on match (Issue 1):** When the user matches in the challenge stage, set the matched parameter to the challenge target so ghost and user use the same value for that param. Together with (1), both waves then have identical (a, f, p) and sync.

---

## Proximity logic (no change)

- `useProximity(activeParam, activeValue, activeTarget)` correctly uses the active stage’s target and the current slider value. Thresholds and max distances are consistent with `sinewaves-constants.ts`. No bug found; proximity only affects copy ("Getting closer..." / "Almost there...").

---

## Files to change (when implementing)

- `InstrumentModule.tsx`: Snap matched parameter to target in `checkMatch`; pass `challengeParam` to `Scene` when in challenge.
- `Scene.tsx`: Add `challengeParam` prop; in `ghostParams`, for `stage === 'challenge'` use mirrored user param for the non-challenge dimension.
