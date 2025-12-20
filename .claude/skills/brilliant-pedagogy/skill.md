---
name: brilliant-pedagogy
description: Ensures interactive learning experiences follow Brilliant's challenge-first, scaffolded pedagogy. Use when designing interactions, writing UI copy, evaluating feedback loops, sequencing learning moments, or making any decision about how users discover concepts. Triggers on questions about "how should this work pedagogically", "what should users see first", "how do we handle wrong answers", or "when should the formula appear".
---

# Brilliant Pedagogy Guardrails

This skill ensures every design decision aligns with Brilliant's proven learning philosophy.

## Core Principle: Challenge Before Explanation

**Never explain before asking.** Users engage with a challenge or manipulation FIRST, then discover the underlying concept through their own exploration. The explanation (formula, definition, rule) appears as a reward for understanding they've already built.

**Traditional (wrong):**
```
"The sine function produces values between -1 and 1. 
Here's the formula: y = A × sin(ωt + φ). 
Now try adjusting the parameters..."
```

**Brilliant-aligned (right):**
```
[User sees: visualization moving, target to match]
[User manipulates: sliders, controls]
[User discovers: "this one makes it faster"]
[User succeeds: matches the target]
→ "You just built: y = 1.5 × sin(2.0t + φ)"
```

## The Scaffolding Arc

Every learning experience follows: **Intuition → Computation → Practice**

1. **Intuition:** Visual, hands-on manipulation builds understanding
2. **Computation:** Formal procedures appear as descriptions of what's already understood
3. **Practice:** Scaffolding removed, learner applies independently

## Design Checklist

Before finalizing any interaction, verify:

- [ ] **Challenge first?** User engages with a problem/manipulation before any explanation
- [ ] **Immediate feedback?** Every action produces visible response within 100ms
- [ ] **No wrong answers?** All states are exploration; "incorrect" is just "not yet matched"
- [ ] **Earned reveal?** Formulas/definitions appear AFTER understanding, not before
- [ ] **Progress visible?** User can see they're getting closer, not just success/failure
- [ ] **Minimal text?** The visualization teaches; words are supplements, not primary

## Feedback Philosophy

**Brilliant's stance:** "The difference between a good student and a great student is that great students continually fail."

**Implementation:**
- No "buzzer" wrong-answer signals
- Show proximity to correct answer (warm/cool, percentage)
- When user errs, show WHY the correct answer is correct (animated explanation)
- Treat mistakes as learning data, not penalties

**"Getting Closer" Pattern:**
```
User action → Calculate distance to target → 
Display proximity (color shift, percentage, visual sync) →
User iterates → Distance decreases → 
Match achieved → Celebration + Reveal
```

## Copy Guidelines

**Avoid:**
- "The formula is..."
- "Remember that..."
- "First, let's learn..."
- "The correct answer is..."
- Explanatory paragraphs before interaction

**Prefer:**
- "Match the motion"
- "You just built..."
- "What you discovered:"
- Questions that prompt exploration
- Labels that describe, not explain

## Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Instead |
|--------------|----------------|---------|
| Tutorial before interaction | Front-loads explanation | Drop user into manipulation |
| Binary right/wrong feedback | Discourages exploration | Show proximity/progress |
| Formula first | Positions math as barrier | Formula as earned reward |
| Text-heavy explanations | Passive consumption | Visual demonstration |
| "Click here to learn" | Separates learning from doing | Learning IS doing |

## The Earned Reveal Moment

The formula/concept reveal should feel like:
- A label for something already understood
- A celebration of discovery
- A "so THAT'S what this is called" moment

Structure:
1. User achieves match/goal
2. Brief celebration animation (subtle, not overwhelming)
3. Formula appears with user's actual values highlighted
4. Connection drawn: "You just built this equation"
5. Invitation to continue: "Try another" / "Explore more"

## Quick Decision Framework

When unsure about a pedagogical choice:

1. **Would Brilliant show text here?** If yes, try showing a visualization instead.
2. **Is this explaining or challenging?** Flip it if explaining.
3. **Does the user have agency?** They should be manipulating, not watching.
4. **Is failure punished or celebrated?** Reframe as "not yet" rather than "wrong."
5. **When does the formula appear?** Only after understanding is demonstrated.