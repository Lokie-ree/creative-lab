---
name: educational-copywriter
description: This skill should be used when writing or reviewing UI text, stage prompts, feedback messages, hints, celebration copy, or any in-module copy for Creative Lab learning modules. Triggers on setup text, subtext, progressive feedback strings, hint copy, celebration screens, or copy review requests.
---

# Educational Copywriter

Shape copy for interactive math modules: **discovery before formula**. Students build understanding through manipulation; copy directs attention and encourages—it does not explain what they should discover. Aligns with STEM Club validation: observable understanding, not satisfaction surveys. For principles, read `docs/philosophy.md` and `docs/product.md`.

## Workflow

To write or revise in-module copy:

1. Identify the stage type (setup, challenge, match, reveal, celebration) and what the student can already see on screen.
2. Draft setup and prompts using the stage rules below; keep hints non-diagnostic.
3. Run the **Red flags** checklist on the draft.
4. Match tone and structure to existing modules: see [copy inventory](references/copy-inventory.md) for file paths.

To review someone else’s copy: check red flags first, then voice and stage rules; suggest rewrites that preserve discovery.

## Voice

- Keep tone warm and supportive; celebrate discovery.
- Never use “Incorrect,” “Wrong,” or error-red framing for learning attempts. Prefer “Not quite—try again.” Use amber / learning styling for nudges, not danger red.
- Avoid the “§” character in user-facing UI (renders poorly in some contexts).

## Stage copy

| Element | Rule |
|---------|------|
| **Setup / phase intro** | Describe what to **observe** (“Watch how…”, “Notice what…”). Do not explain the concept, state the rule, or pre-compute what the visual asks the student to do (don’t state counts the student is meant to count). |
| **The ask** | Every round’s actionable ask is imperative or a direct question (“Predict…”, “How many…?”). Wherever the copy renders, the ask must be the **most prominent line** — regardless of what the field is named. A secondary line (subtext) never carries the ask alone. |
| **Subtext** | Encouragement or context only; no explanations or spoilers. If the module’s copy schema splits prompt/subtext, verify the ask lands in the prominent slot, not the muted one. |

**Challenge stages:** Do not reveal what changed. Invite diagnosis. Example: “Something changed. Can you figure out which parameter?” — not: “The target differs in both length and direction.”

## Feedback and hints

**Progressive feedback — continuous-match modules** (drag/slider, a proximity signal exists): 0–50% → “Keep exploring…” · 50–80% → “Getting closer…” · 80–95% → “Almost there…” · 95%+ → “That’s it!” / “Perfect match!”

**Discrete/numeric modules** (exact-answer CHECK, no proximity signal): one warm miss line (“Not quite — try again.”) plus the **earned reveal as the success feedback**. Do not invent a synthetic praise ladder; if praise strings exist at all, confirm they actually render somewhere visible (not screen-reader-only).

**Hints:** Invite closer observation; never diagnose which dimension is wrong.

- Good: “Look closely at both shapes.” / “What’s different between yours and the target?”
- Bad: “Check the length.” / “Adjust the angle.”

## Celebration

Structure: **“You built:”** (agency) → **“Through exploration, not explanation”** (or equivalent) → parameter reveals using the student’s discovered values. **Behind this:** List specific design decisions, not generic pedagogy theory.

## Red flags

- Explaining the rule before the student has explored.
- “Incorrect” / “Wrong” / shame-oriented language.
- Hints that name which property is off (length, angle, scale, etc.) before the student has committed.
- Setup that spoils what changed in a challenge.
- A phase intro that states the phase’s discovery before the student has made it (e.g., naming the “hidden right triangle” the phase exists to reveal).
- Generic theory in celebration instead of concrete “why we built it this way” decisions.
- Copy exports no component renders (dead copy) — when reviewing, verify each export is imported somewhere; wire it or delete it.

## Reference

- [copy-inventory.md](references/copy-inventory.md) — module `*-copy.ts` paths and shared components.
